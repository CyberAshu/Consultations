import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

print("=== Testing Auth Endpoints ===")

# Test 1: Register a new user
print("\n1. Testing registration...")
register_data = {
    "email": "testuser2025@gmail.com",
    "password": "TestPassword123!",
    "full_name": "Test User 2025",
    "role": "client"
}

try:
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    print(f"Register Status: {response.status_code}")
    print(f"Register Response: {response.text}")
    
    if response.status_code == 200:
        register_result = response.json()
        
        # Test 2: Login with the user
        print("\n2. Testing login...")
        login_data = {
            "email": register_data["email"],
            "password": register_data["password"]
        }
        
        login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Login Status: {login_response.status_code}")
        print(f"Login Response: {login_response.text}")
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            access_token = login_result["session"]["access_token"]
            
            # Test 3: Get current user info
            print("\n3. Testing /auth/me...")
            headers = {"Authorization": f"Bearer {access_token}"}
            me_response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
            print(f"Me Status: {me_response.status_code}")
            print(f"Me Response: {me_response.text}")
            
            # Test 4: Test bookings endpoint with auth
            print("\n4. Testing bookings with auth...")
            bookings_response = requests.get(f"{BASE_URL}/bookings/", headers=headers)
            print(f"Bookings Status: {bookings_response.status_code}")
            print(f"Bookings Response: {bookings_response.text}")
            
        else:
            print("Login failed, can't test authenticated endpoints")
    else:
        print("Registration failed, can't test login")
        
except Exception as e:
    print(f"Error: {e}")

print("\n=== Testing existing user login ===")
# Let's see if there are existing credentials we can use
existing_emails = [
    "mrayushhudda@gmail.com",  # Common test email
    "client@test.com",
    "admin@test.com"
]

for email in existing_emails:
    print(f"\nTrying {email}...")
    login_data = {
        "email": email,
        "password": "password123"  # Common test password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✓ Login successful!")
            result = response.json()
            access_token = result["session"]["access_token"]
            
            # Test bookings with this token
            headers = {"Authorization": f"Bearer {access_token}"}
            bookings_response = requests.get(f"{BASE_URL}/bookings/", headers=headers)
            print(f"Bookings Status: {bookings_response.status_code}")
            if bookings_response.status_code == 200:
                print("✓ Bookings endpoint working!")
                print(f"Bookings: {bookings_response.json()}")
            break
        else:
            print(f"Login failed: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
