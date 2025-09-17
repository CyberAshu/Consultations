from typing import Dict, Any, Optional
from datetime import datetime
import json

class IntakeExtractionService:
    """Service to extract and format intake data for bookings"""
    
    @staticmethod
    def extract_intake_summary(intake_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and format intake data into a structured summary"""
        
        if not intake_data:
            return {"summary": "No intake data available", "details": {}}
        
        summary = {
            "extraction_date": datetime.utcnow().isoformat(),
            "completion_status": {
                "total_stages": 12,
                "completed_stages": len(intake_data.get("completed_stages", [])),
                "completion_percentage": len(intake_data.get("completed_stages", [])) / 12 * 100,
                "current_stage": intake_data.get("current_stage", 1)
            },
            "personal_info": IntakeExtractionService._extract_personal_info(intake_data),
            "immigration_profile": IntakeExtractionService._extract_immigration_profile(intake_data),
            "education_work": IntakeExtractionService._extract_education_work(intake_data),
            "current_status": IntakeExtractionService._extract_current_status(intake_data),
            "goals_timeline": IntakeExtractionService._extract_goals_timeline(intake_data),
            "formatted_text": ""
        }
        
        # Generate formatted text version
        summary["formatted_text"] = IntakeExtractionService._generate_formatted_text(summary, intake_data)
        
        return summary
    
    @staticmethod
    def _extract_personal_info(intake_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract personal information"""
        return {
            "full_name": intake_data.get("full_name"),
            "email": intake_data.get("email"),
            "phone": intake_data.get("phone"),
            "location": IntakeExtractionService._format_location(intake_data.get("location")),
            "client_role": IntakeExtractionService._format_client_role(intake_data.get("client_role")),
            "preferred_language": intake_data.get("preferred_language"),
            "timezone": intake_data.get("timezone"),
            "marital_status": IntakeExtractionService._format_marital_status(intake_data.get("marital_status")),
            "has_dependants": intake_data.get("has_dependants"),
            "dependants_count": intake_data.get("dependants_count"),
            "dependants_accompanying": intake_data.get("dependants_accompanying")
        }
    
    @staticmethod
    def _extract_immigration_profile(intake_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract immigration-related information"""
        return {
            "program_interest": intake_data.get("program_interest", []),
            "province_interest": intake_data.get("province_interest", []),
            "urgency": IntakeExtractionService._format_urgency(intake_data.get("urgency")),
            "target_arrival": intake_data.get("target_arrival"),
            "prior_applications": intake_data.get("prior_applications"),
            "application_outcomes": intake_data.get("application_outcomes", []),
            "inadmissibility_flags": intake_data.get("inadmissibility_flags", [])
        }
    
    @staticmethod
    def _extract_education_work(intake_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract education and work information"""
        return {
            "highest_education": IntakeExtractionService._format_education(intake_data.get("highest_education")),
            "eca_status": IntakeExtractionService._format_eca_status(intake_data.get("eca_status")),
            "eca_provider": intake_data.get("eca_provider"),
            "eca_result": intake_data.get("eca_result"),
            "language_test_taken": intake_data.get("language_test_taken"),
            "test_type": intake_data.get("test_type"),
            "test_date": intake_data.get("test_date"),
            "language_scores": intake_data.get("language_scores"),
            "years_experience": intake_data.get("years_experience"),
            "noc_codes": intake_data.get("noc_codes", []),
            "teer_level": intake_data.get("teer_level"),
            "regulated_occupation": intake_data.get("regulated_occupation"),
            "work_country": intake_data.get("work_country", [])
        }
    
    @staticmethod
    def _extract_current_status(intake_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract current status information"""
        return {
            "job_offer_status": IntakeExtractionService._format_job_offer_status(intake_data.get("job_offer_status")),
            "employer_name": intake_data.get("employer_name"),
            "job_location": intake_data.get("job_location"),
            "wage_offer": intake_data.get("wage_offer"),
            "lmia_status": intake_data.get("lmia_status"),
            "current_status": IntakeExtractionService._format_canadian_status(intake_data.get("current_status")),
            "status_expiry": intake_data.get("status_expiry"),
            "province_residing": intake_data.get("province_residing"),
            "proof_of_funds": IntakeExtractionService._format_proof_of_funds(intake_data.get("proof_of_funds")),
            "family_ties": intake_data.get("family_ties"),
            "relationship_type": intake_data.get("relationship_type")
        }
    
    @staticmethod
    def _extract_goals_timeline(intake_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract goals and timeline information"""
        return {
            "urgency": IntakeExtractionService._format_urgency(intake_data.get("urgency")),
            "target_arrival": intake_data.get("target_arrival"),
            "docs_ready": intake_data.get("docs_ready", [])
        }
    
    @staticmethod
    def _generate_formatted_text(summary: Dict[str, Any], intake_data: Dict[str, Any]) -> str:
        """Generate human-readable formatted text summary"""
        
        text_parts = [
            "=== CLIENT INTAKE SUMMARY ===\n",
            f"Generated: {summary['extraction_date'][:19]}",
            f"Completion: {summary['completion_status']['completed_stages']}/12 stages ({summary['completion_status']['completion_percentage']:.1f}%)\n"
        ]
        
        # Personal Information
        personal = summary["personal_info"]
        if any(personal.values()):
            text_parts.extend([
                "\n--- PERSONAL INFORMATION ---",
                f"Name: {personal.get('full_name', 'Not provided')}",
                f"Email: {personal.get('email', 'Not provided')}",
                f"Phone: {personal.get('phone', 'Not provided')}",
                f"Location: {personal.get('location', 'Not provided')}",
                f"Role: {personal.get('client_role', 'Not provided')}",
                f"Language: {personal.get('preferred_language', 'Not provided')}",
                f"Marital Status: {personal.get('marital_status', 'Not provided')}",
            ])
            
            if personal.get('has_dependants'):
                text_parts.append(f"Dependants: {personal.get('dependants_count', 0)} ({personal.get('dependants_accompanying', 'Not specified')} accompanying)")
        
        # Immigration Profile
        immigration = summary["immigration_profile"]
        if any(immigration.values()):
            text_parts.extend([
                "\n--- IMMIGRATION GOALS ---",
                f"Programs of Interest: {', '.join(immigration.get('program_interest', [])) if immigration.get('program_interest') else 'Not specified'}",
                f"Provinces of Interest: {', '.join(immigration.get('province_interest', [])) if immigration.get('province_interest') else 'Not specified'}",
                f"Timeline: {immigration.get('urgency', 'Not specified')}",
                f"Target Arrival: {immigration.get('target_arrival', 'Not specified')[:10] if immigration.get('target_arrival') else 'Not specified'}",
            ])
            
            if immigration.get('prior_applications'):
                text_parts.append(f"Previous Applications: Yes - {', '.join(immigration.get('application_outcomes', []))}")
            
            flags = immigration.get('inadmissibility_flags', [])
            if flags and 'none' not in flags:
                text_parts.append(f"Inadmissibility Concerns: {', '.join(flags)}")
        
        # Education & Work
        edu_work = summary["education_work"]
        if any(edu_work.values()):
            text_parts.extend([
                "\n--- EDUCATION & WORK EXPERIENCE ---",
                f"Education: {edu_work.get('highest_education', 'Not provided')}",
                f"ECA Status: {edu_work.get('eca_status', 'Not provided')}",
            ])
            
            if edu_work.get('eca_provider'):
                text_parts.append(f"ECA Provider: {edu_work.get('eca_provider')}")
            
            if edu_work.get('language_test_taken') == 'yes':
                text_parts.extend([
                    f"Language Test: {edu_work.get('test_type', 'Not specified')} on {edu_work.get('test_date', 'Not specified')[:10] if edu_work.get('test_date') else 'Not specified'}",
                    f"Scores: {edu_work.get('language_scores', 'Not provided')}"
                ])
            
            text_parts.append(f"Work Experience: {edu_work.get('years_experience', 'Not provided')} years")
            
            if edu_work.get('noc_codes'):
                text_parts.append(f"NOC Codes: {', '.join(edu_work.get('noc_codes', []))}")
        
        # Current Status
        current = summary["current_status"]
        if any(current.values()):
            text_parts.extend([
                "\n--- CURRENT SITUATION ---",
                f"Job Offer: {current.get('job_offer_status', 'Not provided')}",
            ])
            
            if current.get('job_offer_status') == 'yes':
                text_parts.extend([
                    f"Employer: {current.get('employer_name', 'Not provided')}",
                    f"Location: {current.get('job_location', 'Not provided')}",
                    f"Wage: ${current.get('wage_offer', 'Not provided')} CAD/hour" if current.get('wage_offer') else "Wage: Not provided",
                    f"LMIA Status: {current.get('lmia_status', 'Not provided')}"
                ])
            
            if current.get('current_status'):
                text_parts.extend([
                    f"Current Status in Canada: {current.get('current_status')}",
                    f"Status Expiry: {current.get('status_expiry', 'Not provided')[:10] if current.get('status_expiry') else 'Not provided'}",
                    f"Province: {current.get('province_residing', 'Not provided')}"
                ])
            
            text_parts.append(f"Proof of Funds: {current.get('proof_of_funds', 'Not provided')}")
            
            if current.get('family_ties'):
                text_parts.append(f"Family in Canada: Yes - {current.get('relationship_type', 'Not specified')}")
        
        return "\n".join(text_parts)
    
    # Helper formatting methods
    @staticmethod
    def _format_location(location):
        mapping = {
            'inside_canada': 'Inside Canada',
            'outside_canada': 'Outside Canada', 
            'not_sure': 'Not Sure'
        }
        return mapping.get(location, location)
    
    @staticmethod
    def _format_client_role(role):
        mapping = {
            'principal_applicant': 'Principal Applicant',
            'sponsor': 'Sponsor',
            'spouse_partner': 'Spouse/Partner',
            'dependent': 'Dependent',
            'employer_hr_rep': 'Employer/HR Representative',
            'other': 'Other'
        }
        return mapping.get(role, role)
    
    @staticmethod
    def _format_marital_status(status):
        mapping = {
            'single': 'Single',
            'married': 'Married',
            'common_law': 'Common-law',
            'separated': 'Separated',
            'divorced': 'Divorced',
            'widowed': 'Widowed'
        }
        return mapping.get(status, status)
    
    @staticmethod
    def _format_education(education):
        mapping = {
            'high_school': 'High School',
            'one_year_diploma': '1-year Diploma/Certificate',
            'two_plus_year_diploma': '2+ year Diploma',
            'bachelors': "Bachelor's Degree",
            'masters': "Master's Degree",
            'doctorate': 'Doctorate'
        }
        return mapping.get(education, education)
    
    @staticmethod
    def _format_eca_status(status):
        mapping = {
            'yes': 'Completed',
            'in_progress': 'In Progress',
            'no': 'Not Done',
            'not_sure': 'Not Sure'
        }
        return mapping.get(status, status)
    
    @staticmethod
    def _format_job_offer_status(status):
        mapping = {
            'yes': 'Yes',
            'no': 'No',
            'interviewing': 'Currently Interviewing',
            'not_sure': 'Not Sure'
        }
        return mapping.get(status, status)
    
    @staticmethod
    def _format_canadian_status(status):
        mapping = {
            'visitor': 'Visitor',
            'student': 'International Student',
            'worker': 'Temporary Worker',
            'pgwp': 'Post-Graduate Work Permit',
            'trp': 'Temporary Resident Permit',
            'refugee_claimant': 'Refugee Claimant',
            'no_status': 'No Status',
            'other': 'Other'
        }
        return mapping.get(status, status)
    
    @staticmethod
    def _format_proof_of_funds(funds):
        mapping = {
            'under_5k': 'Under $5,000',
            'five_to_10k': '$5,000 - $10,000',
            'ten_to_20k': '$10,000 - $20,000',
            'twenty_to_50k': '$20,000 - $50,000',
            'over_50k': 'Over $50,000'
        }
        return mapping.get(funds, funds)
    
    @staticmethod
    def _format_urgency(urgency):
        mapping = {
            'immediately': 'Immediately',
            'one_to_three_months': '1-3 months',
            'three_to_six_months': '3-6 months',
            'flexible': 'Flexible'
        }
        return mapping.get(urgency, urgency)

# Create instance for easy import
intake_extraction_service = IntakeExtractionService()