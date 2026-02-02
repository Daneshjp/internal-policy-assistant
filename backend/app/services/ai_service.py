"""Service for generating AI responses using OpenAI GPT-4."""

import logging
from typing import Optional

from openai import OpenAI

from app.config import settings

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY)


def build_system_prompt() -> str:
    """
    Build the system prompt for the policy assistant.

    Returns:
        System prompt string
    """
    return """You are an Internal Policy Assistant for a company. Your role is to help employees understand and find information about company policies, procedures, and guidelines.

IMPORTANT GUIDELINES:
1. Only answer questions based on the provided context from company documents.
2. If the context doesn't contain enough information to answer the question, say so clearly and suggest the user consult with HR or the relevant department.
3. Be helpful, professional, and concise.
4. When referencing specific policies, mention the document name when available.
5. Do not make up information or policies that aren't in the provided context.
6. If multiple documents provide different information, note the potential discrepancy.
7. Format your responses clearly with bullet points or numbered lists when appropriate.
8. Always maintain a helpful and respectful tone.

Remember: You are a helpful assistant, not a replacement for official policy guidance. For complex situations, always recommend consulting with the appropriate department."""


def build_user_prompt(question: str, context: str) -> str:
    """
    Build the user prompt with the question and retrieved context.

    Args:
        question: The user's question
        context: Retrieved context from relevant documents

    Returns:
        Formatted user prompt string
    """
    if not context:
        return f"""The user has asked the following question, but no relevant company documents were found in the knowledge base:

Question: {question}

Please let the user know that you couldn't find relevant information in the company's policy documents and suggest they contact HR or the appropriate department for assistance."""

    return f"""Based on the following excerpts from company policy documents, please answer the user's question.

CONTEXT FROM COMPANY DOCUMENTS:
{context}

USER'S QUESTION:
{question}

Please provide a helpful and accurate answer based on the context provided. If the context doesn't fully address the question, acknowledge what you can answer and note what information is missing."""


def generate_answer(
    question: str,
    context: str,
    model: str = "gpt-4-turbo-preview",
    max_tokens: int = 1000,
    temperature: float = 0.3
) -> str:
    """
    Generate an answer using OpenAI GPT-4.

    Args:
        question: The user's question
        context: Retrieved context from relevant documents
        model: OpenAI model to use
        max_tokens: Maximum tokens in the response
        temperature: Response creativity (0-1, lower = more focused)

    Returns:
        Generated answer string

    Raises:
        Exception: If the OpenAI API call fails
    """
    try:
        system_prompt = build_system_prompt()
        user_prompt = build_user_prompt(question, context)

        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=0.9,
            presence_penalty=0.1,
            frequency_penalty=0.1
        )

        answer = response.choices[0].message.content

        if not answer:
            raise ValueError("Empty response from OpenAI")

        return answer.strip()

    except Exception as e:
        logger.error(f"Error generating answer: {str(e)}")
        raise


def generate_conversation_title(first_message: str, max_length: int = 50) -> str:
    """
    Generate a title for a conversation based on the first message.

    Args:
        first_message: The first user message in the conversation
        max_length: Maximum length of the generated title

    Returns:
        Generated title string
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {
                    "role": "system",
                    "content": "Generate a brief, descriptive title (max 5 words) for a conversation that starts with the following message. Only respond with the title, nothing else."
                },
                {"role": "user", "content": first_message}
            ],
            max_tokens=20,
            temperature=0.5
        )

        title = response.choices[0].message.content

        if not title:
            # Fallback to truncated message
            return first_message[:max_length] + "..." if len(first_message) > max_length else first_message

        # Clean up and truncate if needed
        title = title.strip().strip('"\'')
        if len(title) > max_length:
            title = title[:max_length-3] + "..."

        return title

    except Exception as e:
        logger.warning(f"Error generating conversation title: {str(e)}")
        # Fallback to truncated message
        return first_message[:max_length] + "..." if len(first_message) > max_length else first_message


def check_question_relevance(question: str) -> bool:
    """
    Check if a question is relevant to company policies.

    Args:
        question: The user's question

    Returns:
        True if the question seems relevant to policies/company matters
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {
                    "role": "system",
                    "content": """Determine if the following question is relevant to company policies, HR matters, workplace procedures, or business operations.

Respond with ONLY 'yes' or 'no'.

Examples of relevant questions:
- What is the vacation policy?
- How do I submit an expense report?
- What are the work from home guidelines?

Examples of irrelevant questions:
- What's the weather today?
- Tell me a joke
- How do I cook pasta?"""
                },
                {"role": "user", "content": question}
            ],
            max_tokens=10,
            temperature=0.1
        )

        answer = response.choices[0].message.content
        return answer and answer.strip().lower() == "yes"

    except Exception as e:
        logger.warning(f"Error checking question relevance: {str(e)}")
        # Default to treating as relevant if check fails
        return True
