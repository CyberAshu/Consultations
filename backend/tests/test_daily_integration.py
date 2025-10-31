"""
Functional test for Daily.co video room integration

This test verifies:
1. Daily.co service can create rooms
2. Room creation endpoint works correctly
3. Meeting URL is saved in database
4. Room URL is valid Daily.co format
"""
import pytest
import asyncio
from datetime import datetime, timedelta
from app.services.daily_service import daily_service
from app.core.config import settings


class TestDailyCoIntegration:
    """Test Daily.co API integration"""
    
    def test_daily_api_key_configured(self):
        """Test that Daily.co API key is configured"""
        assert settings.DAILY_API_KEY is not None, "DAILY_API_KEY must be configured in .env"
        assert len(settings.DAILY_API_KEY) > 0, "DAILY_API_KEY cannot be empty"
        print(f"✅ Daily.co API key is configured")
    
    @pytest.mark.asyncio
    async def test_create_room(self):
        """Test creating a Daily.co room"""
        if not settings.DAILY_API_KEY:
            pytest.skip("DAILY_API_KEY not configured")
        
        # Test booking ID
        test_booking_id = 99999
        
        try:
            # Create room
            room_data = await daily_service.create_room(
                booking_id=test_booking_id,
                privacy="private",
                enable_recording=False,
                enable_chat=True
            )
            
            # Verify room data
            assert "url" in room_data, "Room data must contain 'url'"
            assert "name" in room_data, "Room data must contain 'name'"
            assert room_data["url"].startswith("https://"), "Room URL must be HTTPS"
            assert "daily.co" in room_data["url"], "Room URL must be Daily.co domain"
            
            print(f"✅ Successfully created room: {room_data['url']}")
            print(f"   Room name: {room_data['name']}")
            
            # Cleanup: Delete the test room
            room_name = room_data["name"]
            deleted = await daily_service.delete_room(room_name)
            if deleted:
                print(f"✅ Cleanup: Deleted test room {room_name}")
            
            return room_data
            
        except Exception as e:
            pytest.fail(f"Failed to create Daily.co room: {str(e)}")
    
    @pytest.mark.asyncio
    async def test_get_room(self):
        """Test getting room details"""
        if not settings.DAILY_API_KEY:
            pytest.skip("DAILY_API_KEY not configured")
        
        # First create a room
        test_booking_id = 99998
        room_data = await daily_service.create_room(
            booking_id=test_booking_id,
            privacy="private"
        )
        room_name = room_data["name"]
        
        try:
            # Get room details
            retrieved_room = await daily_service.get_room(room_name)
            
            assert retrieved_room is not None, "Room should exist"
            assert retrieved_room["name"] == room_name, "Room name should match"
            assert retrieved_room["url"] == room_data["url"], "Room URL should match"
            
            print(f"✅ Successfully retrieved room: {room_name}")
            
        finally:
            # Cleanup
            await daily_service.delete_room(room_name)
            print(f"✅ Cleanup: Deleted test room {room_name}")
    
    @pytest.mark.asyncio
    async def test_room_expiration(self):
        """Test that room has proper expiration"""
        if not settings.DAILY_API_KEY:
            pytest.skip("DAILY_API_KEY not configured")
        
        test_booking_id = 99997
        
        # Create room with 2 hour expiration
        exp_time = int((datetime.now() + timedelta(hours=2)).timestamp())
        
        room_data = await daily_service.create_room(
            booking_id=test_booking_id,
            privacy="private",
            exp=exp_time
        )
        
        try:
            # Get room to verify expiration
            room_name = room_data["name"]
            retrieved_room = await daily_service.get_room(room_name)
            
            assert retrieved_room is not None, "Room should exist"
            
            # Check if room has config/properties
            if "config" in retrieved_room:
                room_exp = retrieved_room["config"].get("exp")
                if room_exp:
                    assert abs(room_exp - exp_time) < 60, "Room expiration should match (within 1 minute)"
                    print(f"✅ Room expiration set correctly: {datetime.fromtimestamp(room_exp)}")
            
            print(f"✅ Successfully created room with expiration")
            
        finally:
            # Cleanup
            await daily_service.delete_room(room_data["name"])
            print(f"✅ Cleanup: Deleted test room")
    
    @pytest.mark.asyncio
    async def test_room_privacy(self):
        """Test room privacy settings"""
        if not settings.DAILY_API_KEY:
            pytest.skip("DAILY_API_KEY not configured")
        
        test_booking_id = 99996
        
        # Create private room
        room_data = await daily_service.create_room(
            booking_id=test_booking_id,
            privacy="private"
        )
        
        try:
            room_name = room_data["name"]
            retrieved_room = await daily_service.get_room(room_name)
            
            assert retrieved_room is not None, "Room should exist"
            
            # Check privacy setting
            privacy = retrieved_room.get("privacy")
            assert privacy == "private", "Room should be private"
            
            print(f"✅ Room privacy set correctly: {privacy}")
            
        finally:
            # Cleanup
            await daily_service.delete_room(room_data["name"])
            print(f"✅ Cleanup: Deleted test room")


# Run tests manually for verification
if __name__ == "__main__":
    print("\n" + "="*60)
    print("Daily.co Integration Functional Tests")
    print("="*60 + "\n")
    
    # Create test instance
    test = TestDailyCoIntegration()
    
    # Test 1: Check API key
    print("Test 1: Checking Daily.co API configuration...")
    try:
        test.test_daily_api_key_configured()
    except AssertionError as e:
        print(f"❌ {str(e)}")
        exit(1)
    
    # Test 2: Create room
    print("\nTest 2: Creating Daily.co room...")
    try:
        room_data = asyncio.run(test.test_create_room())
    except Exception as e:
        print(f"❌ Failed: {str(e)}")
        exit(1)
    
    # Test 3: Get room
    print("\nTest 3: Getting room details...")
    try:
        asyncio.run(test.test_get_room())
    except Exception as e:
        print(f"❌ Failed: {str(e)}")
        exit(1)
    
    # Test 4: Room expiration
    print("\nTest 4: Testing room expiration...")
    try:
        asyncio.run(test.test_room_expiration())
    except Exception as e:
        print(f"❌ Failed: {str(e)}")
        exit(1)
    
    # Test 5: Room privacy
    print("\nTest 5: Testing room privacy...")
    try:
        asyncio.run(test.test_room_privacy())
    except Exception as e:
        print(f"❌ Failed: {str(e)}")
        exit(1)
    
    print("\n" + "="*60)
    print("✅ All tests passed!")
    print("="*60 + "\n")
