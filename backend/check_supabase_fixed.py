#!/usr/bin/env python3

"""
Fixed Supabase database checker script
"""

import os
import sys
from datetime import datetime

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.core.config import settings
from app.db.supabase import get_supabase_admin

def main():
    print("🔍 Supabase Database Intake Entries Checker (Fixed)")
    print("=" * 55)
    
    try:
        # Get Supabase client
        supabase = get_supabase_admin()
        print("✅ Connected to Supabase successfully")
        print(f"📍 Supabase URL: {settings.SUPABASE_URL}")
        print()
        
        # First, let's try to find what tables exist by trying common ones
        tables_to_check = ['users', 'user', 'intakes', 'intake', 'auth.users']
        
        print("🔍 CHECKING AVAILABLE TABLES:")
        print("-" * 40)
        
        existing_tables = []
        
        for table_name in tables_to_check:
            try:
                response = supabase.table(table_name).select('*').limit(1).execute()
                if response.data is not None:
                    existing_tables.append(table_name)
                    print(f"✅ Table '{table_name}' exists")
                else:
                    print(f"❌ Table '{table_name}' not found")
            except Exception as e:
                error_msg = str(e)
                if 'does not exist' in error_msg:
                    print(f"❌ Table '{table_name}' does not exist")
                else:
                    print(f"❌ Table '{table_name}' error: {error_msg}")
        
        print(f"\n📋 Found tables: {existing_tables}")
        print()
        
        # Check auth.users (Supabase auth table)
        print("👤 AUTH USERS:")
        print("-" * 30)
        try:
            # Try to get users from auth schema
            users_response = supabase.rpc('get_users_info').execute()  # Custom RPC if available
            print("Used RPC call")
        except:
            try:
                # Alternative approach - check if we can access profiles or similar
                profiles_response = supabase.table('profiles').select('*').limit(10).execute()
                profiles = profiles_response.data
                
                if profiles:
                    print("Found profiles table:")
                    for profile in profiles:
                        print(f"  Profile: {profile}")
                else:
                    print("No profiles found")
            except Exception as e:
                print(f"Cannot access user data directly: {e}")
                print("This is normal for Supabase auth users - they're in a protected schema")
        
        print()
        
        # Try to check intakes if it exists
        if 'intakes' in existing_tables:
            print("📝 INTAKE ENTRIES:")
            print("-" * 30)
            try:
                # Fixed syntax for ordering
                intakes_response = supabase.table('intakes').select('''
                    id,
                    client_id,
                    status,
                    current_stage,
                    completed_stages,
                    created_at,
                    updated_at,
                    completed_at
                ''').order('created_at', desc=True).limit(10).execute()
                
                intakes = intakes_response.data
                
                if intakes:
                    for intake in intakes:
                        completed_stages = intake.get('completed_stages', []) or []
                        print(f"ID: {intake.get('id', 'N/A')}")
                        print(f"  Client ID: {intake.get('client_id', 'N/A')}")
                        print(f"  Status: {intake.get('status', 'N/A')} | Current Stage: {intake.get('current_stage', 'N/A')}")
                        print(f"  Completed Stages: {completed_stages}")
                        print(f"  Created: {intake.get('created_at', 'N/A')}")
                        print(f"  Updated: {intake.get('updated_at', 'N/A')}")
                        print(f"  Completed: {intake.get('completed_at', 'N/A')}")
                        print()
                else:
                    print("No intake entries found")
            except Exception as e:
                print(f"Error fetching intakes: {e}")
        
        print()
        
        # Get detailed intake data if available
        if 'intakes' in existing_tables:
            print("🔍 DETAILED INTAKE DATA (Most Recent):")
            print("-" * 40)
            try:
                detailed_response = supabase.table('intakes').select('*').order('created_at', desc=True).limit(1).execute()
                
                if detailed_response.data:
                    latest_intake = detailed_response.data[0]
                    
                    print(f"Intake ID: {latest_intake.get('id', 'N/A')}")
                    print(f"Client ID: {latest_intake.get('client_id', 'N/A')}")
                    print(f"Status: {latest_intake.get('status', 'N/A')}")
                    print(f"Current Stage: {latest_intake.get('current_stage', 'N/A')}")
                    print(f"Full Name: {latest_intake.get('full_name', 'N/A')}")
                    print(f"Email: {latest_intake.get('email', 'N/A')}")
                    print(f"Phone: {latest_intake.get('phone', 'N/A')}")
                    print(f"Location: {latest_intake.get('location', 'N/A')}")
                    print(f"Client Role: {latest_intake.get('client_role', 'N/A')}")
                    print(f"Marital Status: {latest_intake.get('marital_status', 'N/A')}")
                    print(f"Education: {latest_intake.get('highest_education', 'N/A')}")
                    print(f"Work Experience: {latest_intake.get('years_experience', 'N/A')} years")
                    print(f"Job Offer Status: {latest_intake.get('job_offer_status', 'N/A')}")
                    print(f"Proof of Funds: {latest_intake.get('proof_of_funds', 'N/A')}")
                    print(f"Program Interest: {latest_intake.get('program_interest', 'N/A')}")
                    print(f"Urgency: {latest_intake.get('urgency', 'N/A')}")
                    print(f"Language Test Type: {latest_intake.get('test_type', 'N/A')}")
                    print(f"Language Scores: {latest_intake.get('language_scores', 'N/A')}")
                    print(f"Province Interest: {latest_intake.get('province_interest', 'N/A')}")
                    print(f"Completed Stages: {latest_intake.get('completed_stages', [])}")
                else:
                    print("No intake data found")
            except Exception as e:
                print(f"Error fetching detailed intake data: {e}")
        
        print()
        
        # Statistics if intakes table exists
        if 'intakes' in existing_tables:
            print("📈 STATISTICS:")
            print("-" * 30)
            try:
                # Get all intakes for statistics
                all_intakes_response = supabase.table('intakes').select('status, current_stage, completed_stages').execute()
                all_intakes = all_intakes_response.data
                
                if all_intakes:
                    # Count by status
                    status_counts = {}
                    status_stages = {}
                    
                    for intake in all_intakes:
                        status = intake.get('status', 'unknown')
                        stage = intake.get('current_stage', 1)
                        
                        if status not in status_counts:
                            status_counts[status] = 0
                            status_stages[status] = []
                        
                        status_counts[status] += 1
                        status_stages[status].append(stage)
                    
                    print("Intakes by status:")
                    for status, count in sorted(status_counts.items(), key=lambda x: x[1], reverse=True):
                        avg_stage = sum(status_stages[status]) / len(status_stages[status]) if status_stages[status] else 0
                        print(f"  {status}: {count} entries (avg stage: {avg_stage:.1f})")
                    
                    print(f"\nTotal intakes: {len(all_intakes)}")
                    
                    # Completion statistics
                    print(f"\n🎯 COMPLETION STATISTICS:")
                    print("-" * 30)
                    
                    fully_completed = 0
                    partially_completed = 0
                    not_started = 0
                    stage_distribution = {}
                    
                    for intake in all_intakes:
                        completed_stages = intake.get('completed_stages', []) or []
                        current_stage = intake.get('current_stage', 1)
                        
                        # Count stage distribution
                        if current_stage not in stage_distribution:
                            stage_distribution[current_stage] = 0
                        stage_distribution[current_stage] += 1
                        
                        # Count completion status
                        completed_count = len(completed_stages) if completed_stages else 0
                        if completed_count >= 12:
                            fully_completed += 1
                        elif completed_count > 0:
                            partially_completed += 1
                        else:
                            not_started += 1
                    
                    print(f"Fully Completed (12 stages): {fully_completed}")
                    print(f"Partially Completed (1-11 stages): {partially_completed}")
                    print(f"Not Started (0 stages): {not_started}")
                    
                    print(f"\nCurrent Stage Distribution:")
                    for stage in sorted(stage_distribution.keys()):
                        print(f"  Stage {stage}: {stage_distribution[stage]} users")
                        
                else:
                    print("No intake data for statistics")
                
            except Exception as e:
                print(f"Error fetching statistics: {e}")
        
        # Try to explore the database structure
        print()
        print("🗂️  DATABASE STRUCTURE EXPLORATION:")
        print("-" * 40)
        
        # Try some common table names
        common_tables = ['profiles', 'user_profiles', 'client_profiles', 'intake_data', 'form_data', 'submissions']
        
        for table in common_tables:
            try:
                response = supabase.table(table).select('*').limit(1).execute()
                if response.data is not None:
                    print(f"✅ Found table: {table}")
                    if response.data:
                        sample_record = response.data[0]
                        print(f"  Sample keys: {list(sample_record.keys())[:10]}")  # Show first 10 keys
                    else:
                        print(f"  Table is empty")
            except Exception as e:
                # Ignore tables that don't exist
                pass
            
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()