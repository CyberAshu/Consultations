"""
Daily.co video service for creating and managing video meeting rooms
"""

import httpx
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import json
import uuid

from app.core.config import settings


class DailyService:
    def __init__(self):
        self.base_url = "https://api.daily.co/v1"
        self.api_key = settings.DAILY_API_KEY
        if not self.api_key:
            raise ValueError("DAILY_API_KEY is not configured in environment variables")
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def create_room(
        self,
        consultation_id: str,
        client_name: str,
        consultant_name: str,
        start_time: datetime,
        duration_minutes: int = 60,
        enable_recording: bool = True
    ) -> Dict[str, Any]:
        """
        Create a Daily.co room for a consultation
        
        Args:
            consultation_id: Unique identifier for the consultation
            client_name: Name of the client
            consultant_name: Name of the consultant
            start_time: Scheduled start time for the meeting
            duration_minutes: Duration of the meeting in minutes
            enable_recording: Whether to enable recording for this room
            
        Returns:
            Dict containing room information including room URL and meeting token
        """
        
        # Calculate expiry time (room expires 2 hours after scheduled end time)
        expire_time = start_time + timedelta(minutes=duration_minutes + 120)
        
        # Build room properties
        room_properties = {
            "exp": int(expire_time.timestamp()),
            "enable_chat": True,
            "enable_screenshare": True,
            "start_video_off": False,
            "start_audio_off": False,
            "owner_only_broadcast": False,
            "enable_knocking": True,
            "enable_prejoin_ui": True,
            "max_participants": 2,
        }
        
        
        room_data = {
            "name": f"consultation-{consultation_id}",
            "privacy": "private",
            "properties": room_properties
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/rooms",
                    headers=self.headers,
                    json=room_data,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    room_info = response.json()
                    
                    # Generate meeting tokens for client and consultant
                    client_token = await self._create_meeting_token(
                        room_info["name"],
                        client_name,
                        "client",
                        start_time,
                        duration_minutes
                    )
                    
                    consultant_token = await self._create_meeting_token(
                        room_info["name"],
                        consultant_name,
                        "consultant",
                        start_time,
                        duration_minutes
                    )
                    
                    return {
                        "room_name": room_info["name"],
                        "room_url": room_info["url"],
                        "client_token": client_token,
                        "consultant_token": consultant_token,
                        "room_id": room_info["id"],
                        "api_created": room_info["api_created"],
                        "expires": expire_time.isoformat()
                    }
                else:
                    raise Exception(f"Failed to create room: {response.text}")
                    
            except Exception as e:
                raise Exception(f"Error creating Daily.co room: {str(e)}")

    async def _create_meeting_token(
        self,
        room_name: str,
        user_name: str,
        user_role: str,
        start_time: datetime,
        duration_minutes: int
    ) -> str:
        """
        Create a meeting token for a specific user
        
        Args:
            room_name: Name of the room
            user_name: Name of the user
            user_role: Role of the user (client/consultant)
            start_time: Meeting start time
            duration_minutes: Meeting duration
            
        Returns:
            Meeting token string
        """
        
        # Token expires 30 minutes after meeting ends
        token_exp = start_time + timedelta(minutes=duration_minutes + 30)
        
        # Token can be used 15 minutes before meeting starts
        token_nbf = start_time - timedelta(minutes=15)
        
        token_data = {
            "properties": {
                "room_name": room_name,
                "user_name": user_name,
                "is_owner": user_role == "consultant",  # Consultant is the room owner
                "exp": int(token_exp.timestamp()),
                "nbf": int(token_nbf.timestamp()),
                "enable_screenshare": True,
                "start_video_off": False,
                "start_audio_off": False
            }
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/meeting-tokens",
                    headers=self.headers,
                    json=token_data,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()["token"]
                else:
                    raise Exception(f"Failed to create meeting token: {response.text}")
                    
            except Exception as e:
                raise Exception(f"Error creating meeting token: {str(e)}")

    async def get_room_info(self, room_name: str) -> Dict[str, Any]:
        """
        Get information about a specific room
        
        Args:
            room_name: Name of the room
            
        Returns:
            Room information
        """
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/rooms/{room_name}",
                    headers=self.headers,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    raise Exception(f"Failed to get room info: {response.text}")
                    
            except Exception as e:
                raise Exception(f"Error getting room info: {str(e)}")

    async def delete_room(self, room_name: str) -> bool:
        """
        Delete a Daily.co room
        
        Args:
            room_name: Name of the room to delete
            
        Returns:
            True if deletion was successful
        """
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.delete(
                    f"{self.base_url}/rooms/{room_name}",
                    headers=self.headers,
                    timeout=30.0
                )
                
                return response.status_code == 200
                
            except Exception as e:
                print(f"Error deleting room: {str(e)}")
                return False

    async def get_recordings(self, room_name: str) -> Dict[str, Any]:
        """
        Get recordings for a specific room
        
        Args:
            room_name: Name of the room
            
        Returns:
            List of recordings
        """
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/recordings",
                    headers=self.headers,
                    params={"room_name": room_name},
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    raise Exception(f"Failed to get recordings: {response.text}")
                    
            except Exception as e:
                raise Exception(f"Error getting recordings: {str(e)}")


# Global instance
daily_service = DailyService()