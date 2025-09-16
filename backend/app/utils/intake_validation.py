from typing import Dict, Any, List, Optional
import re
from datetime import datetime, date
from pydantic import ValidationError, validator
import html

# Input sanitization utilities
def sanitize_string(value: str) -> str:
    """Sanitize string input by escaping HTML and trimming whitespace"""
    if not isinstance(value, str):
        return str(value)
    
    # Remove excessive whitespace
    cleaned = re.sub(r'\s+', ' ', value.strip())
    
    # Escape HTML entities
    cleaned = html.escape(cleaned)
    
    # Remove potentially dangerous characters
    cleaned = re.sub(r'[<>"\']', '', cleaned)
    
    return cleaned[:500]  # Limit length

def sanitize_email(email: str) -> str:
    """Validate and sanitize email address"""
    if not email:
        return ""
    
    email = email.lower().strip()
    
    # Basic email pattern validation
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise ValueError("Invalid email format")
    
    return email[:254]  # RFC 5321 limit

def sanitize_phone(phone: str) -> str:
    """Sanitize phone number"""
    if not phone:
        return ""
    
    # Remove all non-numeric characters except + and spaces
    phone = re.sub(r'[^\d\+\s\-\(\)]', '', phone.strip())
    
    return phone[:20]  # Reasonable length limit

def validate_date_string(date_str: str) -> Optional[datetime]:
    """Validate and parse date string"""
    if not date_str:
        return None
    
    try:
        # Try ISO format first
        return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    except:
        try:
            # Try common date formats
            for fmt in ['%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y']:
                return datetime.strptime(date_str, fmt)
        except:
            raise ValueError(f"Invalid date format: {date_str}")

# Stage-specific validation functions
def validate_stage1_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate Stage 1: Location & Role"""
    validated = {}
    
    # Location validation
    location = data.get('location')
    if location not in ['inside_canada', 'outside_canada', 'not_sure']:
        raise ValueError("Invalid location value")
    validated['location'] = location
    
    # Client role validation
    client_role = data.get('client_role')
    valid_roles = ['principal_applicant', 'sponsor', 'spouse_partner', 'dependent', 'employer_hr_rep', 'other']
    if client_role not in valid_roles:
        raise ValueError("Invalid client role")
    validated['client_role'] = client_role
    
    return validated

def validate_stage2_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate Stage 2: Identity, Contact & Consent"""
    validated = {}
    
    # Full name validation
    full_name = data.get('full_name', '').strip()
    if not full_name or len(full_name) < 2:
        raise ValueError("Full name is required and must be at least 2 characters")
    validated['full_name'] = sanitize_string(full_name)
    
    # Email validation
    email = data.get('email', '').strip()
    if not email:
        raise ValueError("Email is required")
    validated['email'] = sanitize_email(email)
    
    # Phone validation (optional)
    phone = data.get('phone', '').strip()
    if phone:
        validated['phone'] = sanitize_phone(phone)
    
    # Language validation
    preferred_language = data.get('preferred_language', '').strip()
    if not preferred_language:
        raise ValueError("Preferred language is required")
    validated['preferred_language'] = sanitize_string(preferred_language)
    
    # Other language (if applicable)
    if preferred_language == 'other':
        preferred_language_other = data.get('preferred_language_other', '').strip()
        if not preferred_language_other:
            raise ValueError("Please specify your preferred language")
        validated['preferred_language_other'] = sanitize_string(preferred_language_other)
    
    # Timezone validation
    timezone = data.get('timezone', '').strip()
    if not timezone:
        raise ValueError("Timezone is required")
    validated['timezone'] = sanitize_string(timezone)
    
    # Consent validation
    consent_acknowledgement = data.get('consent_acknowledgement', [])
    if not isinstance(consent_acknowledgement, list) or len(consent_acknowledgement) < 3:
        raise ValueError("All consent items must be acknowledged")
    
    # Validate consent items
    valid_consents = ['data_use', 'not_legal_advice', 'privacy_terms']
    for consent in consent_acknowledgement:
        if consent not in valid_consents:
            raise ValueError(f"Invalid consent item: {consent}")
    
    validated['consent_acknowledgement'] = consent_acknowledgement
    
    return validated

def validate_stage3_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate Stage 3: Household Composition"""
    validated = {}
    
    # Marital status validation
    marital_status = data.get('marital_status')
    valid_statuses = ['single', 'married', 'common_law', 'separated', 'divorced', 'widowed']
    if marital_status not in valid_statuses:
        raise ValueError("Invalid marital status")
    validated['marital_status'] = marital_status
    
    # Dependants validation
    has_dependants = data.get('has_dependants')
    if has_dependants is None:
        raise ValueError("Please specify if you have dependants")
    validated['has_dependants'] = bool(has_dependants)
    
    if has_dependants:
        dependants_count = data.get('dependants_count')
        if not isinstance(dependants_count, int) or dependants_count < 1:
            raise ValueError("Please specify the number of dependants")
        if dependants_count > 20:  # Reasonable limit
            raise ValueError("Number of dependants seems unreasonably high")
        validated['dependants_count'] = dependants_count
        
        dependants_accompanying = data.get('dependants_accompanying')
        valid_accompanying = ['all', 'some', 'none', 'not_sure']
        if dependants_accompanying not in valid_accompanying:
            raise ValueError("Please specify if dependants will accompany you")
        validated['dependants_accompanying'] = dependants_accompanying
    
    return validated

def validate_language_scores(scores: Dict[str, float]) -> Dict[str, float]:
    """Validate language test scores"""
    if not isinstance(scores, dict):
        raise ValueError("Language scores must be a dictionary")
    
    required_skills = ['listening', 'speaking', 'reading', 'writing']
    validated_scores = {}
    
    for skill in required_skills:
        score = scores.get(skill)
        if score is None:
            raise ValueError(f"Missing {skill} score")
        
        # Convert to float and validate range
        try:
            score = float(score)
            if score < 0 or score > 10:  # Assuming normalized 0-10 scale
                raise ValueError(f"{skill} score must be between 0 and 10")
            validated_scores[skill] = score
        except (ValueError, TypeError):
            raise ValueError(f"Invalid {skill} score: must be a number")
    
    return validated_scores

def validate_file_upload(file_name: str, file_size: int, file_type: str) -> None:
    """Validate file upload parameters"""
    # File name validation
    if not file_name or len(file_name.strip()) == 0:
        raise ValueError("File name is required")
    
    # Sanitize file name
    file_name = re.sub(r'[^\w\-_\.]', '', file_name)
    if len(file_name) > 255:
        raise ValueError("File name too long")
    
    # File size validation (10MB limit)
    max_size = 10 * 1024 * 1024  # 10MB
    if file_size > max_size:
        raise ValueError("File size cannot exceed 10MB")
    
    # File type validation
    allowed_types = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if file_type not in allowed_types:
        raise ValueError("File type not allowed. Please upload PDF, JPG, PNG, DOC, or DOCX files only")

def validate_json_array(data: Any, max_length: int = 50) -> List[str]:
    """Validate and sanitize JSON array data"""
    if data is None:
        return []
    
    if not isinstance(data, list):
        raise ValueError("Expected array/list data")
    
    if len(data) > max_length:
        raise ValueError(f"Array too long (max {max_length} items)")
    
    sanitized = []
    for item in data:
        if isinstance(item, str):
            sanitized_item = sanitize_string(item)
            if sanitized_item:  # Only add non-empty items
                sanitized.append(sanitized_item)
        else:
            sanitized.append(str(item)[:100])  # Convert to string and limit length
    
    return sanitized

def validate_numeric_field(value: Any, field_name: str, min_val: Optional[float] = None, max_val: Optional[float] = None) -> Optional[float]:
    """Validate numeric fields with optional range checks"""
    if value is None or value == "":
        return None
    
    try:
        num_value = float(value)
        
        if min_val is not None and num_value < min_val:
            raise ValueError(f"{field_name} cannot be less than {min_val}")
        
        if max_val is not None and num_value > max_val:
            raise ValueError(f"{field_name} cannot be greater than {max_val}")
        
        return num_value
    except (ValueError, TypeError):
        raise ValueError(f"{field_name} must be a valid number")

# Main validation function
def validate_intake_stage_data(stage: int, data: Dict[str, Any]) -> Dict[str, Any]:
    """Main validation function for intake stage data"""
    if not isinstance(stage, int) or not 1 <= stage <= 12:
        raise ValueError("Invalid stage number")
    
    if not isinstance(data, dict):
        raise ValueError("Data must be a dictionary")
    
    # Stage-specific validation
    if stage == 1:
        return validate_stage1_data(data)
    elif stage == 2:
        return validate_stage2_data(data)
    elif stage == 3:
        return validate_stage3_data(data)
    else:
        # For other stages, apply basic sanitization
        validated = {}
        for key, value in data.items():
            if isinstance(value, str):
                validated[key] = sanitize_string(value)
            elif isinstance(value, list):
                validated[key] = validate_json_array(value)
            elif isinstance(value, dict) and key == 'language_scores':
                validated[key] = validate_language_scores(value)
            else:
                validated[key] = value
        
        return validated

# Rate limiting helper
class RateLimiter:
    """Simple in-memory rate limiter for intake operations"""
    
    def __init__(self):
        self.requests = {}
    
    def is_rate_limited(self, client_id: str, max_requests: int = 10, time_window: int = 60) -> bool:
        """Check if client is rate limited (max_requests per time_window seconds)"""
        now = datetime.utcnow().timestamp()
        
        if client_id not in self.requests:
            self.requests[client_id] = []
        
        # Remove old requests outside the time window
        self.requests[client_id] = [
            timestamp for timestamp in self.requests[client_id]
            if now - timestamp < time_window
        ]
        
        # Check if limit exceeded
        if len(self.requests[client_id]) >= max_requests:
            return True
        
        # Add current request
        self.requests[client_id].append(now)
        return False

# Global rate limiter instance
rate_limiter = RateLimiter()