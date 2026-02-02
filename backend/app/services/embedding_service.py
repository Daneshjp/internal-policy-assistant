"""Service for generating embeddings and processing documents for RAG."""

import tiktoken
from typing import List, Optional
import logging

from openai import OpenAI
from sqlalchemy.orm import Session

from app.config import settings
from app.models.document_chunk import DocumentChunk

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY)

# Initialize tokenizer for text chunking
ENCODING = tiktoken.get_encoding("cl100k_base")


def generate_embedding(text: str) -> List[float]:
    """
    Generate embedding vector for a given text using OpenAI ada-002.

    Args:
        text: The text to generate an embedding for

    Returns:
        List of floats representing the embedding vector (1536 dimensions)

    Raises:
        Exception: If the OpenAI API call fails
    """
    try:
        # Clean and truncate text if necessary
        text = text.replace("\n", " ").strip()
        if not text:
            raise ValueError("Cannot generate embedding for empty text")

        # Truncate if text is too long (ada-002 has 8191 token limit)
        tokens = ENCODING.encode(text)
        if len(tokens) > 8000:
            text = ENCODING.decode(tokens[:8000])

        response = client.embeddings.create(
            input=text,
            model="text-embedding-ada-002"
        )

        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Error generating embedding: {str(e)}")
        raise


def count_tokens(text: str) -> int:
    """
    Count the number of tokens in a text string.

    Args:
        text: The text to count tokens for

    Returns:
        Number of tokens
    """
    return len(ENCODING.encode(text))


def chunk_text(text: str, max_tokens: int = 500, overlap_tokens: int = 50) -> List[str]:
    """
    Split text into chunks of approximately max_tokens size with overlap.

    Args:
        text: The text to chunk
        max_tokens: Maximum number of tokens per chunk
        overlap_tokens: Number of overlapping tokens between chunks

    Returns:
        List of text chunks
    """
    if not text or not text.strip():
        return []

    # First, split by paragraphs to maintain semantic boundaries
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = []
    current_token_count = 0

    for paragraph in paragraphs:
        paragraph = paragraph.strip()
        if not paragraph:
            continue

        paragraph_tokens = count_tokens(paragraph)

        # If a single paragraph is too long, split by sentences
        if paragraph_tokens > max_tokens:
            sentences = paragraph.replace(".", ".\n").replace("!", "!\n").replace("?", "?\n").split("\n")
            for sentence in sentences:
                sentence = sentence.strip()
                if not sentence:
                    continue

                sentence_tokens = count_tokens(sentence)

                if current_token_count + sentence_tokens > max_tokens:
                    if current_chunk:
                        chunks.append(" ".join(current_chunk))
                        # Keep overlap
                        overlap_text = " ".join(current_chunk)
                        overlap_chunk_tokens = ENCODING.encode(overlap_text)
                        if len(overlap_chunk_tokens) > overlap_tokens:
                            overlap_text = ENCODING.decode(overlap_chunk_tokens[-overlap_tokens:])
                        current_chunk = [overlap_text] if overlap_text.strip() else []
                        current_token_count = count_tokens(" ".join(current_chunk)) if current_chunk else 0

                current_chunk.append(sentence)
                current_token_count += sentence_tokens
        else:
            # Check if adding this paragraph exceeds the limit
            if current_token_count + paragraph_tokens > max_tokens:
                if current_chunk:
                    chunks.append(" ".join(current_chunk))
                    # Keep overlap
                    overlap_text = " ".join(current_chunk)
                    overlap_chunk_tokens = ENCODING.encode(overlap_text)
                    if len(overlap_chunk_tokens) > overlap_tokens:
                        overlap_text = ENCODING.decode(overlap_chunk_tokens[-overlap_tokens:])
                    current_chunk = [overlap_text] if overlap_text.strip() else []
                    current_token_count = count_tokens(" ".join(current_chunk)) if current_chunk else 0

            current_chunk.append(paragraph)
            current_token_count += paragraph_tokens

    # Add the last chunk
    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks


def process_document_for_rag(
    db: Session,
    document_id: int,
    content: str,
    max_tokens: int = 500
) -> List[DocumentChunk]:
    """
    Process a document for RAG by chunking and generating embeddings.

    Args:
        db: Database session
        document_id: ID of the document to process
        content: Text content of the document
        max_tokens: Maximum tokens per chunk

    Returns:
        List of created DocumentChunk objects
    """
    try:
        # First, delete any existing chunks for this document
        db.query(DocumentChunk).filter(
            DocumentChunk.document_id == document_id
        ).delete()

        # Chunk the document
        chunks = chunk_text(content, max_tokens=max_tokens)

        if not chunks:
            logger.warning(f"No chunks generated for document {document_id}")
            return []

        created_chunks = []

        for index, chunk_content in enumerate(chunks):
            # Generate embedding for this chunk
            embedding = generate_embedding(chunk_content)
            token_count = count_tokens(chunk_content)

            # Create the chunk record
            chunk = DocumentChunk(
                document_id=document_id,
                chunk_index=index,
                content=chunk_content,
                embedding=embedding,
                token_count=token_count
            )

            db.add(chunk)
            created_chunks.append(chunk)

        db.commit()

        for chunk in created_chunks:
            db.refresh(chunk)

        logger.info(f"Created {len(created_chunks)} chunks for document {document_id}")
        return created_chunks

    except Exception as e:
        db.rollback()
        logger.error(f"Error processing document {document_id} for RAG: {str(e)}")
        raise


def update_chunk_embedding(db: Session, chunk_id: int) -> Optional[DocumentChunk]:
    """
    Regenerate embedding for a specific chunk.

    Args:
        db: Database session
        chunk_id: ID of the chunk to update

    Returns:
        Updated DocumentChunk or None if not found
    """
    chunk = db.query(DocumentChunk).filter(DocumentChunk.id == chunk_id).first()

    if not chunk:
        return None

    try:
        chunk.embedding = generate_embedding(chunk.content)
        chunk.token_count = count_tokens(chunk.content)
        db.commit()
        db.refresh(chunk)
        return chunk
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating embedding for chunk {chunk_id}: {str(e)}")
        raise
