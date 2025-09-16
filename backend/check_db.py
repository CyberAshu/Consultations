#!/usr/bin/env python3

"""
Database checker script to view intake entries and related data
"""

import os
import sys
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.core.config import settings

def main():
    print("🔍 Database Intake Entries Checker")
    print("=" * 50)
    
    # Create database connection
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    with SessionLocal() as db:
        print("✅ Connected to database successfully")
        print()
        
        # Check users table
        print("👥 USERS:")
        print("-" * 30)
        try:
            users_result = db.execute(text("""
                SELECT id, email, role, created_at 
                FROM users 
                ORDER BY created_at DESC 
                LIMIT 10
            """))
            users = users_result.fetchall()
            
            if users:
                for user in users:
                    print(f"ID: {user.id} | Email: {user.email} | Role: {user.role} | Created: {user.created_at}")
            else:
                print("No users found")
        except Exception as e:
            print(f"Error fetching users: {e}")
        
        print()
        
        # Check intakes table
        print("📝 INTAKE ENTRIES:")
        print("-" * 30)
        try:
            intakes_result = db.execute(text("""
                SELECT 
                    i.id,
                    i.client_id,
                    u.email,
                    i.status,
                    i.current_stage,
                    i.completed_stages,
                    i.created_at,
                    i.updated_at,
                    i.completed_at
                FROM intakes i
                LEFT JOIN users u ON i.client_id = u.id
                ORDER BY i.updated_at DESC NULLS LAST, i.created_at DESC
                LIMIT 10
            """))
            intakes = intakes_result.fetchall()
            
            if intakes:
                for intake in intakes:
                    completed_stages_str = str(intake.completed_stages) if intake.completed_stages else "[]"
                    print(f"ID: {intake.id}")
                    print(f"  Client: {intake.email} (ID: {intake.client_id})")
                    print(f"  Status: {intake.status} | Current Stage: {intake.current_stage}")
                    print(f"  Completed Stages: {completed_stages_str}")
                    print(f"  Created: {intake.created_at}")
                    print(f"  Updated: {intake.updated_at}")
                    print(f"  Completed: {intake.completed_at}")
                    print()
            else:
                print("No intake entries found")
        except Exception as e:
            print(f"Error fetching intakes: {e}")
        
        print()
        
        # Get specific intake data for the most recent entry
        print("🔍 DETAILED INTAKE DATA (Most Recent):")
        print("-" * 40)
        try:
            detailed_result = db.execute(text("""
                SELECT 
                    i.*,
                    u.email
                FROM intakes i
                LEFT JOIN users u ON i.client_id = u.id
                ORDER BY i.updated_at DESC NULLS LAST, i.created_at DESC
                LIMIT 1
            """))
            latest_intake = detailed_result.fetchone()
            
            if latest_intake:
                print(f"Client Email: {latest_intake.email}")
                print(f"Full Name: {latest_intake.full_name}")
                print(f"Phone: {latest_intake.phone}")
                print(f"Location: {latest_intake.location}")
                print(f"Client Role: {latest_intake.client_role}")
                print(f"Marital Status: {latest_intake.marital_status}")
                print(f"Education: {latest_intake.highest_education}")
                print(f"Work Experience: {latest_intake.years_experience} years")
                print(f"Job Offer Status: {latest_intake.job_offer_status}")
                print(f"Proof of Funds: {latest_intake.proof_of_funds}")
                print(f"Program Interest: {latest_intake.program_interest}")
                print(f"Urgency: {latest_intake.urgency}")
            else:
                print("No intake data found")
        except Exception as e:
            print(f"Error fetching detailed intake data: {e}")
        
        print()
        
        # Check table schemas
        print("📊 TABLE SCHEMAS:")
        print("-" * 30)
        try:
            # Get intakes table columns
            schema_result = db.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'intakes'
                ORDER BY ordinal_position
                LIMIT 20
            """))
            columns = schema_result.fetchall()
            
            print("Intakes table columns (first 20):")
            for col in columns:
                nullable = "NULL" if col.is_nullable == "YES" else "NOT NULL"
                print(f"  {col.column_name}: {col.data_type} ({nullable})")
        except Exception as e:
            print(f"Error fetching schema: {e}")
        
        print()
        
        # Statistics
        print("📈 STATISTICS:")
        print("-" * 30)
        try:
            # Count by status
            stats_result = db.execute(text("""
                SELECT 
                    status, 
                    COUNT(*) as count,
                    AVG(current_stage) as avg_stage
                FROM intakes 
                GROUP BY status
                ORDER BY count DESC
            """))
            stats = stats_result.fetchall()
            
            print("Intakes by status:")
            for stat in stats:
                print(f"  {stat.status}: {stat.count} entries (avg stage: {stat.avg_stage:.1f})")
            
            # Total count
            total_result = db.execute(text("SELECT COUNT(*) as total FROM intakes"))
            total = total_result.fetchone()
            print(f"\nTotal intakes: {total.total}")
            
        except Exception as e:
            print(f"Error fetching statistics: {e}")

if __name__ == "__main__":
    main()