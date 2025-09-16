#!/usr/bin/env python3

"""
Supabase database checker script to view intake entries using Supabase client
"""

import os
import sys
from datetime import datetime

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.core.config import settings
from app.db.supabase import get_supabase_admin

def main():
    print("🔍 Supabase Database Intake Entries Checker")
    print("=" * 50)
    
    try:
        # Get Supabase client
        supabase = get_supabase_admin()
        print("✅ Connected to Supabase successfully")
        print()
        
        # Check users table
        print("👥 USERS:")
        print("-" * 30)
        try:
            users_response = supabase.table('users').select('id, email, role, created_at').order('created_at', desc=True).limit(10).execute()
            users = users_response.data
            
            if users:
                for user in users:
                    print(f"ID: {user['id']} | Email: {user['email']} | Role: {user['role']} | Created: {user['created_at']}")
            else:
                print("No users found")
        except Exception as e:
            print(f"Error fetching users: {e}")
        
        print()
        
        # Check intakes table with user join
        print("📝 INTAKE ENTRIES:")
        print("-" * 30)
        try:
            intakes_response = supabase.table('intakes').select('''
                id,
                client_id,
                status,
                current_stage,
                completed_stages,
                created_at,
                updated_at,
                completed_at,
                users!intakes_client_id_fkey(email)
            ''').order('updated_at', desc=True, nulls_first=False).order('created_at', desc=True).limit(10).execute()
            
            intakes = intakes_response.data
            
            if intakes:
                for intake in intakes:
                    user_email = intake['users']['email'] if intake.get('users') else 'N/A'
                    completed_stages = intake['completed_stages'] if intake['completed_stages'] else []
                    print(f"ID: {intake['id']}")
                    print(f"  Client: {user_email} (ID: {intake['client_id']})")
                    print(f"  Status: {intake['status']} | Current Stage: {intake['current_stage']}")
                    print(f"  Completed Stages: {completed_stages}")
                    print(f"  Created: {intake['created_at']}")
                    print(f"  Updated: {intake['updated_at']}")
                    print(f"  Completed: {intake['completed_at']}")
                    print()
            else:
                print("No intake entries found")
        except Exception as e:
            print(f"Error fetching intakes: {e}")
        
        print()
        
        # Get detailed intake data for the most recent entry
        print("🔍 DETAILED INTAKE DATA (Most Recent):")
        print("-" * 40)
        try:
            detailed_response = supabase.table('intakes').select('''
                *,
                users!intakes_client_id_fkey(email)
            ''').order('updated_at', desc=True, nulls_first=False).order('created_at', desc=True).limit(1).execute()
            
            if detailed_response.data:
                latest_intake = detailed_response.data[0]
                user_email = latest_intake['users']['email'] if latest_intake.get('users') else 'N/A'
                
                print(f"Client Email: {user_email}")
                print(f"Full Name: {latest_intake.get('full_name', 'N/A')}")
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
            else:
                print("No intake data found")
        except Exception as e:
            print(f"Error fetching detailed intake data: {e}")
        
        print()
        
        # Statistics
        print("📈 STATISTICS:")
        print("-" * 30)
        try:
            # Get all intakes for statistics
            all_intakes_response = supabase.table('intakes').select('status, current_stage').execute()
            all_intakes = all_intakes_response.data
            
            if all_intakes:
                # Count by status
                status_counts = {}
                status_stages = {}
                
                for intake in all_intakes:
                    status = intake['status']
                    stage = intake['current_stage']
                    
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
            else:
                print("No intake data for statistics")
            
        except Exception as e:
            print(f"Error fetching statistics: {e}")
        
        print()
        
        # Check completion statistics
        print("🎯 COMPLETION STATISTICS:")
        print("-" * 30)
        try:
            completion_response = supabase.table('intakes').select('completed_stages, status, current_stage').execute()
            completion_data = completion_response.data
            
            if completion_data:
                fully_completed = 0
                partially_completed = 0
                not_started = 0
                stage_distribution = {}
                
                for intake in completion_data:
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
            
        except Exception as e:
            print(f"Error fetching completion statistics: {e}")
            
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()