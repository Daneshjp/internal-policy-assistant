"""Router for conversation and chat endpoints."""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.conversation import (
    MessageCreate,
    MessageResponse,
    MessageFeedbackUpdate,
    ConversationCreate,
    ConversationResponse,
    ConversationListResponse,
    SourceDocumentResponse
)
from app.services import conversation_service
from app.services import retrieval_service
from app.services import ai_service

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"]
)


@router.get("", response_model=ConversationListResponse)
async def list_conversations(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List all conversations for the current user.

    Returns paginated list of conversations sorted by most recently updated.
    """
    result = conversation_service.get_conversations(
        db,
        user_id=current_user.id,
        page=page,
        per_page=per_page
    )

    return ConversationListResponse(**result)


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conversation_data: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new conversation.

    If no title is provided, a default title will be used and can be updated
    later based on the first message.
    """
    conversation = conversation_service.create_conversation(
        db,
        user_id=current_user.id,
        title=conversation_data.title
    )

    return ConversationResponse(
        id=conversation.id,
        title=conversation.title,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        messages=[]
    )


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a conversation with all its messages.

    Returns the conversation details and all messages in chronological order.
    """
    conversation = conversation_service.get_conversation(
        db,
        conversation_id=conversation_id,
        user_id=current_user.id
    )

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Format messages with source documents
    messages = []
    for msg in conversation.messages:
        source_docs = None
        if msg.source_documents:
            source_docs = [
                SourceDocumentResponse(**doc) for doc in msg.source_documents
            ]

        messages.append(MessageResponse(
            id=msg.id,
            role=msg.role.value,
            content=msg.content,
            source_documents=source_docs,
            feedback=msg.feedback.value if msg.feedback else None,
            created_at=msg.created_at
        ))

    return ConversationResponse(
        id=conversation.id,
        title=conversation.title,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        messages=messages
    )


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a conversation and all its messages.

    This action cannot be undone.
    """
    success = conversation_service.delete_conversation(
        db,
        conversation_id=conversation_id,
        user_id=current_user.id
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    return None


@router.post("/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(
    conversation_id: int,
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Send a message in a conversation and get an AI response.

    This endpoint:
    1. Saves the user's message
    2. Retrieves relevant context from documents using RAG
    3. Generates an AI response using GPT-4
    4. Returns the assistant's response with source documents

    The conversation title will be auto-generated from the first message
    if it was using the default title.
    """
    # Verify conversation exists and belongs to user
    conversation = conversation_service.get_conversation(
        db,
        conversation_id=conversation_id,
        user_id=current_user.id
    )

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Save the user's message
    user_message = conversation_service.add_message(
        db,
        conversation_id=conversation_id,
        role="user",
        content=message_data.content
    )

    # Check if this is the first user message and update title if needed
    user_messages = [m for m in conversation.messages if m.role.value == "user"]
    if len(user_messages) == 0 and conversation.title == "New Conversation":
        # Generate a title from the first message
        title = ai_service.generate_conversation_title(message_data.content)
        conversation_service.update_conversation_title(db, conversation_id, title)

    try:
        # Get relevant context using RAG
        context, source_documents = retrieval_service.get_relevant_context(
            db,
            question=message_data.content,
            limit=5
        )

        # Generate AI response
        answer = ai_service.generate_answer(
            question=message_data.content,
            context=context
        )

        # Log the query for analytics
        document_ids = [doc["document_id"] for doc in source_documents] if source_documents else None
        conversation_service.log_query(
            db,
            user_id=current_user.id,
            question=message_data.content,
            had_answer=len(source_documents) > 0,
            documents_referenced=document_ids
        )

        # Save the assistant's response
        assistant_message = conversation_service.add_message(
            db,
            conversation_id=conversation_id,
            role="assistant",
            content=answer,
            source_documents=source_documents if source_documents else None
        )

        # Format response
        source_docs_response = None
        if assistant_message.source_documents:
            source_docs_response = [
                SourceDocumentResponse(**doc) for doc in assistant_message.source_documents
            ]

        return MessageResponse(
            id=assistant_message.id,
            role=assistant_message.role.value,
            content=assistant_message.content,
            source_documents=source_docs_response,
            feedback=None,
            created_at=assistant_message.created_at
        )

    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")

        # Log the failed query
        conversation_service.log_query(
            db,
            user_id=current_user.id,
            question=message_data.content,
            had_answer=False,
            documents_referenced=None
        )

        # Save an error message as the assistant response
        error_response = "I apologize, but I encountered an error while processing your question. Please try again or contact support if the issue persists."

        assistant_message = conversation_service.add_message(
            db,
            conversation_id=conversation_id,
            role="assistant",
            content=error_response,
            source_documents=None
        )

        return MessageResponse(
            id=assistant_message.id,
            role=assistant_message.role.value,
            content=assistant_message.content,
            source_documents=None,
            feedback=None,
            created_at=assistant_message.created_at
        )


@router.put("/messages/{message_id}/feedback", response_model=MessageResponse)
async def update_message_feedback(
    message_id: int,
    feedback_data: MessageFeedbackUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update feedback on a message.

    Allows users to mark AI responses as helpful or not helpful.
    This feedback is used to improve the system.
    """
    # Get the message
    message = conversation_service.get_message(db, message_id)

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )

    # Verify the conversation belongs to the current user
    conversation = conversation_service.get_conversation(
        db,
        conversation_id=message.conversation_id,
        user_id=current_user.id
    )

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )

    # Update feedback
    updated_message = conversation_service.update_message_feedback(
        db,
        message_id=message_id,
        feedback=feedback_data.feedback.value
    )

    # Format response
    source_docs_response = None
    if updated_message.source_documents:
        source_docs_response = [
            SourceDocumentResponse(**doc) for doc in updated_message.source_documents
        ]

    return MessageResponse(
        id=updated_message.id,
        role=updated_message.role.value,
        content=updated_message.content,
        source_documents=source_docs_response,
        feedback=updated_message.feedback.value if updated_message.feedback else None,
        created_at=updated_message.created_at
    )
