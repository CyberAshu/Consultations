#!/usr/bin/env python3

"""
Client Intakes Database Checker - Using correct table names
"""

import os
import sys
from datetime import datetime

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.core.config import settings
from app.db.supabase import get_supabase_admin

def main():
    print("🔍 Client Intakes Database Checker")
    print("=" * 45)
    
    try:
        # Get Supabase client
        supabase = get_supabase_admin()
        print("✅ Connected to Supabase successfully")
        print(f"📍 Supabase URL: {settings.SUPABASE_URL}")
        print()
        
        # Check client_intakes table (correct table name from migration)
        print("📝 CLIENT INTAKES:")
        print("-" * 30)
        try:
            intakes_response = supabase.table('client_intakes').select('''
                id,
                client_id,
                status,
                current_stage,
                completed_stages,
                full_name,
                email,
                created_at,
                updated_at,
                completed_at
            ''').order('created_at', desc=True).limit(10).execute()
            
            intakes = intakes_response.data
            
            if intakes:
                print(f"Found {len(intakes)} intake entries:")
                print()
                for i, intake in enumerate(intakes, 1):
                    completed_stages = intake.get('completed_stages', []) or []
                    print(f"#{i} - ID: {intake.get('id', 'N/A')}")
                    print(f"  Client: {intake.get('full_name', 'N/A')} ({intake.get('email', 'N/A')})")
                    print(f"  Client ID: {intake.get('client_id', 'N/A')}")
                    print(f"  Status: {intake.get('status', 'N/A')} | Current Stage: {intake.get('current_stage', 'N/A')}")
                    print(f"  Completed Stages: {completed_stages} ({len(completed_stages)} stages)")
                    print(f"  Created: {intake.get('created_at', 'N/A')}")
                    print(f"  Updated: {intake.get('updated_at', 'N/A')}")
                    print(f"  Completed: {intake.get('completed_at', 'N/A')}")
                    print()
            else:
                print("No client intake entries found")
        except Exception as e:
            print(f"Error fetching client intakes: {e}")
        
        print()
        
        # Get detailed intake data for the most recent entry
        print("🔍 DETAILED INTAKE DATA (Most Recent):")
        print("-" * 40)
        try:
            detailed_response = supabase.table('client_intakes').select('*').order('created_at', desc=True).limit(1).execute()
            
            if detailed_response.data:
                latest_intake = detailed_response.data[0]
                
                print("📋 BASIC INFO:")
                print(f"  Intake ID: {latest_intake.get('id', 'N/A')}")
                print(f"  Client ID: {latest_intake.get('client_id', 'N/A')}")
                print(f"  Status: {latest_intake.get('status', 'N/A')}")
                print(f"  Current Stage: {latest_intake.get('current_stage', 'N/A')}")
                print(f"  Completed Stages: {latest_intake.get('completed_stages', [])}")
                
                print(f"\n👤 PERSONAL INFO:")
                print(f"  Full Name: {latest_intake.get('full_name', 'N/A')}")
                print(f"  Email: {latest_intake.get('email', 'N/A')}")
                print(f"  Phone: {latest_intake.get('phone', 'N/A')}")
                print(f"  Location: {latest_intake.get('location', 'N/A')}")
                print(f"  Client Role: {latest_intake.get('client_role', 'N/A')}")
                print(f"  Preferred Language: {latest_intake.get('preferred_language', 'N/A')}")
                print(f"  Timezone: {latest_intake.get('timezone', 'N/A')}")
                
                print(f"\n👥 HOUSEHOLD:")
                print(f"  Marital Status: {latest_intake.get('marital_status', 'N/A')}")
                print(f"  Has Dependants: {latest_intake.get('has_dependants', 'N/A')}")
                print(f"  Dependants Count: {latest_intake.get('dependants_count', 'N/A')}")
                
                print(f"\n🎓 EDUCATION:")
                print(f"  Highest Education: {latest_intake.get('highest_education', 'N/A')}")
                print(f"  ECA Status: {latest_intake.get('eca_status', 'N/A')}")
                print(f"  ECA Provider: {latest_intake.get('eca_provider', 'N/A')}")
                
                print(f"\n🗣️ LANGUAGE:")
                print(f"  Language Test Taken: {latest_intake.get('language_test_taken', 'N/A')}")
                print(f"  Test Type: {latest_intake.get('test_type', 'N/A')}")
                print(f"  Test Date: {latest_intake.get('test_date', 'N/A')}")
                print(f"  Language Scores: {latest_intake.get('language_scores', 'N/A')}")
                
                print(f"\n💼 WORK:")
                print(f"  Work Experience: {latest_intake.get('years_experience', 'N/A')} years")
                print(f"  NOC Codes: {latest_intake.get('noc_codes', 'N/A')}")
                print(f"  TEER Level: {latest_intake.get('teer_level', 'N/A')}")
                print(f"  Job Offer Status: {latest_intake.get('job_offer_status', 'N/A')}")
                print(f"  Employer Name: {latest_intake.get('employer_name', 'N/A')}")
                
                print(f"\n💰 FINANCES:")
                print(f"  Proof of Funds: {latest_intake.get('proof_of_funds', 'N/A')}")
                print(f"  Family Ties: {latest_intake.get('family_ties', 'N/A')}")
                
                print(f"\n🎯 INTERESTS:")
                print(f"  Program Interest: {latest_intake.get('program_interest', 'N/A')}")
                print(f"  Province Interest: {latest_intake.get('province_interest', 'N/A')}")
                
                print(f"\n⏰ TIMELINE:")
                print(f"  Urgency: {latest_intake.get('urgency', 'N/A')}")
                print(f"  Target Arrival: {latest_intake.get('target_arrival', 'N/A')}")
                print(f"  Documents Ready: {latest_intake.get('docs_ready', 'N/A')}")
                
                print(f"\n📅 TIMESTAMPS:")
                print(f"  Created: {latest_intake.get('created_at', 'N/A')}")
                print(f"  Updated: {latest_intake.get('updated_at', 'N/A')}")
                print(f"  Completed: {latest_intake.get('completed_at', 'N/A')}")
                
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
            all_intakes_response = supabase.table('client_intakes').select('status, current_stage, completed_stages').execute()
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
                
                if stage_distribution:
                    print(f"\nCurrent Stage Distribution:")
                    for stage in sorted(stage_distribution.keys()):
                        print(f"  Stage {stage}: {stage_distribution[stage]} users")
                        
            else:
                print("No intake data for statistics")
                
        except Exception as e:
            print(f"Error fetching statistics: {e}")
        
        # Check intake documents
        print()
        print("📎 INTAKE DOCUMENTS:")
        print("-" * 30)
        try:
            docs_response = supabase.table('intake_documents').select('*').limit(10).execute()
            docs = docs_response.data
            
            if docs:
                print(f"Found {len(docs)} documents:")
                for doc in docs:
                    print(f"  ID: {doc.get('id')} | File: {doc.get('file_name')} | Stage: {doc.get('stage')} | Size: {doc.get('file_size')} bytes")
            else:
                print("No intake documents found")
        except Exception as e:
            print(f"Error fetching documents: {e}")
            
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()