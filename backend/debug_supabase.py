#!/usr/bin/env python3

import os
import sys

# Add the app directory to the path so we can import modules
sys.path.append('app')

try:
    print("Testing supabase client creation...")
    
    # Test 1: Import supabase
    print("1. Importing supabase...")
    from supabase import create_client, Client
    print("   ✓ Successfully imported supabase")
    
    # Test 2: Check supabase version
    print("2. Checking supabase version...")
    import supabase
    print(f"   ✓ Supabase version: {supabase.__version__}")
    
    # Test 3: Import config
    print("3. Importing app config...")
    from app.core.config import settings
    print("   ✓ Successfully imported settings")
    
    # Test 4: Check environment variables
    print("4. Checking environment variables...")
    print(f"   SUPABASE_URL: {'✓ Set' if settings.SUPABASE_URL else '✗ Missing'}")
    print(f"   SUPABASE_SERVICE_ROLE_KEY: {'✓ Set' if settings.SUPABASE_SERVICE_ROLE_KEY else '✗ Missing'}")
    print(f"   SUPABASE_ANON_KEY: {'✓ Set' if settings.SUPABASE_ANON_KEY else '✗ Missing'}")
    
    # Test 5: Create supabase client without any additional parameters
    print("5. Creating supabase client...")
    client = create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY
    )
    print("   ✓ Successfully created supabase client")
    
    # Test 6: Test client type
    print(f"6. Client type: {type(client)}")
    
    print("\n✅ All tests passed! The issue might be elsewhere.")
    
except Exception as e:
    print(f"\n❌ Error occurred: {e}")
    print(f"Error type: {type(e).__name__}")
    import traceback
    traceback.print_exc()
