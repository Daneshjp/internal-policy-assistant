"""
Google OAuth 2.0 integration utilities.

Module 1: Authentication & User Management
"""
import logging
from typing import Dict

import httpx
from fastapi import HTTPException, status
from google.oauth2 import id_token
from google.auth.transport import requests

from app.config import settings

logger = logging.getLogger(__name__)


async def verify_google_token(token: str) -> Dict[str, any]:
    """
    Verify Google OAuth token and extract user information.

    Args:
        token: Google ID token to verify

    Returns:
        dict: User information from Google (email, name, picture, etc.)

    Raises:
        HTTPException: If token verification fails

    Example return value:
        {
            "email": "user@example.com",
            "name": "John Doe",
            "picture": "https://...",
            "email_verified": True,
            "sub": "google_user_id"
        }
    """
    if not settings.GOOGLE_CLIENT_ID:
        logger.error("Google OAuth is not configured (missing GOOGLE_CLIENT_ID)")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth is not configured"
        )

    try:
        # Verify the token using Google's library
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        # Verify the issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            logger.warning(f"Invalid token issuer: {idinfo['iss']}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token issuer"
            )

        # Verify email is present and verified
        if not idinfo.get('email_verified', False):
            logger.warning(f"Email not verified for user: {idinfo.get('email')}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email not verified"
            )

        logger.info(f"Successfully verified Google token for user: {idinfo.get('email')}")

        return {
            "email": idinfo.get("email"),
            "name": idinfo.get("name"),
            "picture": idinfo.get("picture"),
            "email_verified": idinfo.get("email_verified", False),
            "google_id": idinfo.get("sub")
        }

    except ValueError as e:
        logger.error(f"Invalid Google token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error verifying Google token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify Google token"
        )


async def get_google_user_info(access_token: str) -> Dict[str, any]:
    """
    Get user information from Google using access token.

    Alternative method using Google's UserInfo API.

    Args:
        access_token: Google OAuth access token

    Returns:
        dict: User information from Google

    Raises:
        HTTPException: If API call fails
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=10.0
            )

            if response.status_code != 200:
                logger.error(f"Google API error: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Failed to get user info from Google"
                )

            user_info = response.json()
            logger.info(f"Retrieved Google user info for: {user_info.get('email')}")

            return user_info

    except httpx.TimeoutException:
        logger.error("Timeout while calling Google API")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Timeout while verifying with Google"
        )
    except Exception as e:
        logger.error(f"Error calling Google API: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify with Google"
        )
