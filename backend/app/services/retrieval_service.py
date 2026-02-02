"""Service for retrieving relevant document chunks using vector similarity search."""

from typing import List, Tuple, Dict, Any
import logging

from sqlalchemy.orm import Session
from sqlalchemy import text

from app.models.document_chunk import DocumentChunk
from app.models.document import Document, DocumentStatus
from app.services.embedding_service import generate_embedding

logger = logging.getLogger(__name__)


def search_similar_chunks(
    db: Session,
    query_embedding: List[float],
    limit: int = 5,
    similarity_threshold: float = 0.7
) -> List[Tuple[DocumentChunk, float]]:
    """
    Search for document chunks similar to the query embedding using pgvector.

    Args:
        db: Database session
        query_embedding: The query embedding vector
        limit: Maximum number of results to return
        similarity_threshold: Minimum similarity score (0-1) to include in results

    Returns:
        List of tuples containing (DocumentChunk, similarity_score)
    """
    try:
        # Convert embedding to string format for pgvector
        embedding_str = f"[{','.join(map(str, query_embedding))}]"

        # Use pgvector's cosine distance operator (<=>)
        # Note: cosine_distance = 1 - cosine_similarity, so we convert back
        query = text("""
            SELECT
                dc.id,
                dc.document_id,
                dc.chunk_index,
                dc.content,
                dc.token_count,
                dc.created_at,
                1 - (dc.embedding <=> :embedding::vector) as similarity
            FROM document_chunks dc
            JOIN documents d ON dc.document_id = d.id
            WHERE d.status = :active_status
                AND dc.embedding IS NOT NULL
                AND 1 - (dc.embedding <=> :embedding::vector) >= :threshold
            ORDER BY dc.embedding <=> :embedding::vector
            LIMIT :limit
        """)

        result = db.execute(
            query,
            {
                "embedding": embedding_str,
                "active_status": DocumentStatus.active.value,
                "threshold": similarity_threshold,
                "limit": limit
            }
        )

        chunks_with_scores = []
        for row in result:
            # Fetch the full chunk object
            chunk = db.query(DocumentChunk).filter(DocumentChunk.id == row.id).first()
            if chunk:
                chunks_with_scores.append((chunk, row.similarity))

        return chunks_with_scores

    except Exception as e:
        logger.error(f"Error searching similar chunks: {str(e)}")
        raise


def get_relevant_context(
    db: Session,
    question: str,
    limit: int = 5,
    max_context_tokens: int = 2000
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Get relevant context for a question by searching similar document chunks.

    Args:
        db: Database session
        question: The user's question
        limit: Maximum number of chunks to retrieve
        max_context_tokens: Maximum total tokens for the context

    Returns:
        Tuple of (formatted context string, list of source document info)
    """
    try:
        # Generate embedding for the question
        query_embedding = generate_embedding(question)

        # Search for similar chunks
        chunks_with_scores = search_similar_chunks(
            db,
            query_embedding,
            limit=limit,
            similarity_threshold=0.65  # Lower threshold for better recall
        )

        if not chunks_with_scores:
            return "", []

        # Build context string and source documents list
        context_parts = []
        source_documents = []
        total_tokens = 0

        for chunk, score in chunks_with_scores:
            # Check if adding this chunk would exceed the token limit
            if total_tokens + chunk.token_count > max_context_tokens:
                break

            # Get document info
            document = db.query(Document).filter(Document.id == chunk.document_id).first()

            if document:
                # Add to context
                context_parts.append(f"[Document: {document.title}]\n{chunk.content}")
                total_tokens += chunk.token_count

                # Add to source documents
                source_documents.append({
                    "document_id": document.id,
                    "title": document.title,
                    "chunk_content": chunk.content[:500] + "..." if len(chunk.content) > 500 else chunk.content,
                    "relevance_score": round(score, 4)
                })

        # Join context parts with separators
        context = "\n\n---\n\n".join(context_parts)

        return context, source_documents

    except Exception as e:
        logger.error(f"Error getting relevant context: {str(e)}")
        raise


def get_document_chunks(
    db: Session,
    document_id: int
) -> List[DocumentChunk]:
    """
    Get all chunks for a specific document.

    Args:
        db: Database session
        document_id: ID of the document

    Returns:
        List of DocumentChunk objects ordered by chunk_index
    """
    return db.query(DocumentChunk).filter(
        DocumentChunk.document_id == document_id
    ).order_by(DocumentChunk.chunk_index).all()


def search_documents_by_text(
    db: Session,
    search_text: str,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    Search documents by text query using semantic similarity.

    Args:
        db: Database session
        search_text: Text to search for
        limit: Maximum number of results

    Returns:
        List of document search results with relevance scores
    """
    try:
        query_embedding = generate_embedding(search_text)
        chunks_with_scores = search_similar_chunks(
            db,
            query_embedding,
            limit=limit * 2  # Get more chunks to aggregate by document
        )

        # Aggregate results by document
        document_scores: Dict[int, Dict[str, Any]] = {}

        for chunk, score in chunks_with_scores:
            doc_id = chunk.document_id

            if doc_id not in document_scores:
                document = db.query(Document).filter(Document.id == doc_id).first()
                if document:
                    document_scores[doc_id] = {
                        "document_id": doc_id,
                        "title": document.title,
                        "description": document.description,
                        "max_score": score,
                        "matching_chunks": 1
                    }
            else:
                document_scores[doc_id]["max_score"] = max(
                    document_scores[doc_id]["max_score"],
                    score
                )
                document_scores[doc_id]["matching_chunks"] += 1

        # Sort by score and return top results
        sorted_results = sorted(
            document_scores.values(),
            key=lambda x: x["max_score"],
            reverse=True
        )[:limit]

        return sorted_results

    except Exception as e:
        logger.error(f"Error searching documents: {str(e)}")
        raise
