"""
Daily.co Video Calling Service

This service handles integration with Daily.co API for video call rooms.
"""
import httpx
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from app.core.config import settings


class DailyService:
    """Service for managing Daily.co video rooms"""
    
    def __init__(self):
        self.api_key = settings.DAILY_API_KEY
        self.domain = settings.DAILY_DOMAIN
        self.base_url = "https://api.daily.co/v1"
        
    def _get_headers(self) -> Dict[str, str]:
        """Get authorization headers for Daily.co API"""
        if not self.api_key:
            raise ValueError("DAILY_API_KEY not configured")
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def create_room(
        self, 
        booking_id: int,
        privacy: str = "private",
        exp: Optional[int] = None,
        enable_recording: bool = False,
        enable_chat: bool = True
    ) -> Dict[str, Any]:
        """
        Create a Daily.co room for a booking.
        
        Args:
            booking_id: The booking ID to create room for
            privacy: Room privacy setting ("private" or "public")
            exp: Room expiration timestamp (Unix epoch). If None, expires in 24 hours
            enable_recording: Enable recording for this room
            enable_chat: Enable in-call chat
            
        Returns:
            Dict containing room details including 'url' and 'name'
        """
        # Generate unique room name
        room_name = f"consultation-{booking_id}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Set expiration time (default 24 hours from now)
        if exp is None:
            exp = int((datetime.now() + timedelta(hours=24)).timestamp())
        
        # Prepare room configuration
        room_config = {
            "name": room_name,
            "privacy": privacy,
            "properties": {
                "exp": exp,
                "enable_screenshare": True,
                "enable_chat": enable_chat,
                "enable_knocking": True,
                "start_video_off": False,
                "start_audio_off": False,
                "max_participants": 10,
                "lang": "en"
            }
        }
        
        # Add recording only if explicitly enabled (Daily.co doesn't accept "off")
        if enable_recording:
            room_config["properties"]["enable_recording"] = "cloud"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/rooms",
                    headers=self._get_headers(),
                    json=room_config,
                    timeout=30.0
                )
                response.raise_for_status()
                
                room_data = response.json()
                print(f"✅ DailyService: Created room for booking {booking_id}: {room_data['url']}")
                return room_data
                
        except httpx.HTTPStatusError as e:
            error_detail = e.response.text
            print(f"❌ DailyService: Failed to create room - HTTP {e.response.status_code}: {error_detail}")
            raise ValueError(f"Failed to create Daily.co room: {error_detail}")
        except Exception as e:
            print(f"❌ DailyService: Failed to create room - {str(e)}")
            raise ValueError(f"Failed to create Daily.co room: {str(e)}")
    
    async def get_room(self, room_name: str) -> Optional[Dict[str, Any]]:
        """
        Get room details by name.
        
        Args:
            room_name: The name of the room
            
        Returns:
            Dict containing room details or None if not found
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/rooms/{room_name}",
                    headers=self._get_headers(),
                    timeout=30.0
                )
                
                if response.status_code == 404:
                    return None
                    
                response.raise_for_status()
                return response.json()
                
        except Exception as e:
            print(f"❌ DailyService: Failed to get room - {str(e)}")
            return None
    
    async def delete_room(self, room_name: str) -> bool:
        """
        Delete a Daily.co room.
        
        Args:
            room_name: The name of the room to delete
            
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    f"{self.base_url}/rooms/{room_name}",
                    headers=self._get_headers(),
                    timeout=30.0
                )
                response.raise_for_status()
                
                print(f"✅ DailyService: Deleted room {room_name}")
                return True
                
        except Exception as e:
            print(f"❌ DailyService: Failed to delete room - {str(e)}")
            return False
    
    async def create_meeting_token(
        self, 
        room_name: str,
        user_name: str,
        is_owner: bool = False,
        exp: Optional[int] = None
    ) -> str:
        """
        Create a meeting token for secure room access.
        
        Args:
            room_name: The room name to create token for
            user_name: The user's display name
            is_owner: Whether user has owner privileges
            exp: Token expiration timestamp (Unix epoch)
            
        Returns:
            Meeting token string
        """
        if exp is None:
            exp = int((datetime.now() + timedelta(hours=12)).timestamp())
        
        token_config = {
            "properties": {
                "room_name": room_name,
                "user_name": user_name,
                "is_owner": is_owner,
                "exp": exp
            }
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/meeting-tokens",
                    headers=self._get_headers(),
                    json=token_config,
                    timeout=30.0
                )
                response.raise_for_status()
                
                token_data = response.json()
                return token_data["token"]
                
        except Exception as e:
            print(f"❌ DailyService: Failed to create meeting token - {str(e)}")
            raise ValueError(f"Failed to create meeting token: {str(e)}")


# Singleton instance
daily_service = DailyService()
