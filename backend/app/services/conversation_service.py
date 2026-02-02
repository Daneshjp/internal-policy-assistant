"""Service for managing conversations and messages."""

from datetime import datetime
from typing import List, Optional, Dict, Any
import logging

from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.conversation import Conversation
from app.models.message import Message, MessageRole, MessageFeedback
from app.models.query_log import QueryLog

logger = logging.getLogger(__name__)


def get_conversations(
    db: Session,
    user_id: int,
    page: int = 1,
    per_page: int = 20
) -> Dict[str, Any]:
    """
    Get paginated list of conversations for a user.

    Args:
        db: Database session
        user_id: ID of the user
        page: Page number (1-indexed)
        per_page: Number of items per page

    Returns:
        Dictionary containing conversations and pagination info
    """
    # Calculate offset
    offset = (page - 1) * per_page

    # Get total count
    total = db.query(Conversation).filter(
        Conversation.user_id == user_id
    ).count()

    # Get conversations with message count
    conversations = db.query(
        Conversation,
        func.count(Message.id).label("message_count")
    ).outerjoin(
        Message,
        Conversation.id == Message.conversation_id
    ).filter(
        Conversation.user_id == user_id
    ).group_by(
        Conversation.id
    ).order_by(
        desc(Conversation.updated_at)
    ).offset(offset).limit(per_page).all()

    # Format results
    items = []
    for conv, msg_count in conversations:
        items.append({
            "id": conv.id,
            "title": conv.title,
            "created_at": conv.created_at,
            "updated_at": conv.updated_at,
            "message_count": msg_count
        })

    # Calculate total pages
    pages = (total + per_page - 1) // per_page if total > 0 else 1

    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages
    }


def get_conversation(
    db: Session,
    conversation_id: int,
    user_id: Optional[int] = None
) -> Optional[Conversation]:
    """
    Get a conversation by ID with its messages.

    Args:
        db: Database session
        conversation_id: ID of the conversation
        user_id: Optional user ID for ownership verification

    Returns:
        Conversation object or None if not found
    """
    query = db.query(Conversation).filter(Conversation.id == conversation_id)

    if user_id is not None:
        query = query.filter(Conversation.user_id == user_id)

    conversation = query.first()

    if conversation:
        # Ensure messages are loaded and ordered
        conversation.messages = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at).all()

    return conversation


def create_conversation(
    db: Session,
    user_id: int,
    title: Optional[str] = None
) -> Conversation:
    """
    Create a new conversation.

    Args:
        db: Database session
        user_id: ID of the user creating the conversation
        title: Optional title for the conversation

    Returns:
        Created Conversation object
    """
    conversation = Conversation(
        user_id=user_id,
        title=title or "New Conversation"
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


def update_conversation_title(
    db: Session,
    conversation_id: int,
    title: str
) -> Optional[Conversation]:
    """
    Update a conversation's title.

    Args:
        db: Database session
        conversation_id: ID of the conversation
        title: New title

    Returns:
        Updated Conversation or None if not found
    """
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()

    if conversation:
        conversation.title = title
        conversation.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(conversation)

    return conversation


def delete_conversation(
    db: Session,
    conversation_id: int,
    user_id: Optional[int] = None
) -> bool:
    """
    Delete a conversation and all its messages.

    Args:
        db: Database session
        conversation_id: ID of the conversation to delete
        user_id: Optional user ID for ownership verification

    Returns:
        True if deleted, False if not found
    """
    query = db.query(Conversation).filter(Conversation.id == conversation_id)

    if user_id is not None:
        query = query.filter(Conversation.user_id == user_id)

    conversation = query.first()

    if conversation:
        db.delete(conversation)
        db.commit()
        return True

    return False


def add_message(
    db: Session,
    conversation_id: int,
    role: str,
    content: str,
    source_documents: Optional[List[Dict[str, Any]]] = None
) -> Message:
    """
    Add a message to a conversation.

    Args:
        db: Database session
        conversation_id: ID of the conversation
        role: Message role ("user" or "assistant")
        content: Message content
        source_documents: Optional list of source document references

    Returns:
        Created Message object
    """
    message = Message(
        conversation_id=conversation_id,
        role=MessageRole(role),
        content=content,
        source_documents=source_documents
    )

    db.add(message)

    # Update conversation's updated_at timestamp
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()
    if conversation:
        conversation.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(message)

    return message


def update_message_feedback(
    db: Session,
    message_id: int,
    feedback: str
) -> Optional[Message]:
    """
    Update the feedback on a message.

    Args:
        db: Database session
        message_id: ID of the message
        feedback: Feedback value ("helpful" or "not_helpful")

    Returns:
        Updated Message or None if not found
    """
    message = db.query(Message).filter(Message.id == message_id).first()

    if message:
        message.feedback = MessageFeedback(feedback)
        db.commit()
        db.refresh(message)

    return message


def log_query(
    db: Session,
    user_id: int,
    question: str,
    had_answer: bool,
    documents_referenced: Optional[List[int]] = None
) -> QueryLog:
    """
    Log a query for analytics.

    Args:
        db: Database session
        user_id: ID of the user who made the query
        question: The question asked
        had_answer: Whether relevant documents were found
        documents_referenced: List of document IDs referenced in the answer

    Returns:
        Created QueryLog object
    """
    query_log = QueryLog(
        user_id=user_id,
        question=question,
        had_answer=had_answer,
        documents_referenced=documents_referenced
    )

    db.add(query_log)
    db.commit()
    db.refresh(query_log)

    return query_log


def get_conversation_messages(
    db: Session,
    conversation_id: int,
    limit: int = 100
) -> List[Message]:
    """
    Get messages for a conversation.

    Args:
        db: Database session
        conversation_id: ID of the conversation
        limit: Maximum number of messages to return

    Returns:
        List of Message objects
    """
    return db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at).limit(limit).all()


def get_message(
    db: Session,
    message_id: int
) -> Optional[Message]:
    """
    Get a message by ID.

    Args:
        db: Database session
        message_id: ID of the message

    Returns:
        Message object or None if not found
    """
    return db.query(Message).filter(Message.id == message_id).first()
