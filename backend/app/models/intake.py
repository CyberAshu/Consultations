from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, JSON, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.db.base import Base

class IntakeStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    updated = "updated"

class Location(str, enum.Enum):
    inside_canada = "inside_canada"
    outside_canada = "outside_canada"
    not_sure = "not_sure"

class ClientRole(str, enum.Enum):
    principal_applicant = "principal_applicant"
    sponsor = "sponsor"
    spouse_partner = "spouse_partner"
    dependent = "dependent"
    employer_hr_rep = "employer_hr_rep"
    other = "other"

class MaritalStatus(str, enum.Enum):
    single = "single"
    married = "married"
    common_law = "common_law"
    separated = "separated"
    divorced = "divorced"
    widowed = "widowed"

class EducationLevel(str, enum.Enum):
    high_school = "high_school"
    one_year_diploma = "one_year_diploma"
    two_plus_year_diploma = "two_plus_year_diploma"
    bachelors = "bachelors"
    masters = "masters"
    doctorate = "doctorate"

class ECAStatus(str, enum.Enum):
    yes = "yes"
    in_progress = "in_progress"
    no = "no"
    not_sure = "not_sure"

class ECAProvider(str, enum.Enum):
    wes = "wes"
    ces = "ces"
    icas = "icas"
    iqas = "iqas"
    mcc = "mcc"
    others = "others"
    not_applicable = "not_applicable"

class LanguageTestType(str, enum.Enum):
    ielts = "ielts"
    celpip = "celpip"
    tef = "tef"
    tcf = "tcf"

class TEERLevel(str, enum.Enum):
    teer_0 = "teer_0"
    teer_1 = "teer_1"
    teer_2 = "teer_2"
    teer_3 = "teer_3"
    not_sure = "not_sure"

class JobOfferStatus(str, enum.Enum):
    yes = "yes"
    no = "no"
    interviewing = "interviewing"
    not_sure = "not_sure"

class LMIAStatus(str, enum.Enum):
    approved = "approved"
    in_progress = "in_progress"
    exempt = "exempt"
    not_applicable = "not_applicable"
    unknown = "unknown"

class CanadianStatus(str, enum.Enum):
    visitor = "visitor"
    student = "student"
    worker = "worker"
    pgwp = "pgwp"
    trp = "trp"
    refugee_claimant = "refugee_claimant"
    no_status = "no_status"
    other = "other"

class ProofOfFundsRange(str, enum.Enum):
    under_5k = "under_5k"
    five_to_10k = "five_to_10k"
    ten_to_20k = "ten_to_20k"
    twenty_to_50k = "twenty_to_50k"
    over_50k = "over_50k"

class UrgencyLevel(str, enum.Enum):
    immediately = "immediately"
    one_to_three_months = "one_to_three_months"
    three_to_six_months = "three_to_six_months"
    flexible = "flexible"

class ClientIntake(Base):
    __tablename__ = "client_intakes"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(UUID(as_uuid=True), nullable=False, unique=True, index=True)  # References auth.users.id
    
    # Status and metadata
    status = Column(Enum(IntakeStatus), default=IntakeStatus.pending)
    current_stage = Column(Integer, default=1)  # Track which stage user is on (1-12)
    completed_stages = Column(JSON)  # Array of completed stage numbers
    
    # Stage 1: Location & Role
    location = Column(Enum(Location))
    client_role = Column(Enum(ClientRole))
    
    # Stage 2: Identity, Contact & Consent
    full_name = Column(String)  # May differ from auth user full_name
    email = Column(String)  # May differ from auth user email  
    phone = Column(String)
    preferred_language = Column(String)
    preferred_language_other = Column(String)  # When "Other" is selected
    timezone = Column(String)
    consent_acknowledgement = Column(JSON)  # Array of consented items
    
    # Stage 3: Household Composition
    marital_status = Column(Enum(MaritalStatus))
    has_dependants = Column(Boolean)
    dependants_count = Column(Integer)
    dependants_accompanying = Column(String)  # all, some, none, not_sure
    
    # Stage 4: Education History
    highest_education = Column(Enum(EducationLevel))
    eca_status = Column(Enum(ECAStatus))
    eca_provider = Column(Enum(ECAProvider))
    eca_result = Column(String)
    
    # Stage 5: Language Skills
    language_test_taken = Column(String)  # yes, no, booked, not_sure
    test_type = Column(Enum(LanguageTestType))
    test_date = Column(DateTime)
    language_scores = Column(JSON)  # {listening: x, speaking: x, reading: x, writing: x}
    
    # Stage 6: Work History
    years_experience = Column(Integer)
    noc_codes = Column(JSON)  # Array of NOC codes/job titles
    teer_level = Column(Enum(TEERLevel))
    regulated_occupation = Column(String)  # yes, no, not_sure
    work_country = Column(JSON)  # Array of countries
    
    # Stage 7: Job Offer & LMIA
    job_offer_status = Column(Enum(JobOfferStatus))
    employer_name = Column(String)
    job_location = Column(JSON)  # {province: x, city: x}
    wage_offer = Column(Float)  # CAD/hour
    lmia_status = Column(Enum(LMIAStatus))
    
    # Stage 8: Status in Canada (for inland applicants)
    current_status = Column(Enum(CanadianStatus))
    status_expiry = Column(DateTime)
    province_residing = Column(String)
    
    # Stage 9: Proof of Funds & Settlement Ties
    proof_of_funds = Column(Enum(ProofOfFundsRange))
    family_ties = Column(Boolean)
    relationship_type = Column(String)
    
    # Stage 10: Application History & Inadmissibility
    prior_applications = Column(Boolean)
    application_outcomes = Column(JSON)  # Array of outcomes
    inadmissibility_flags = Column(JSON)  # Array of flags
    
    # Stage 11: Provincial/Program Interest
    program_interest = Column(JSON)  # Array of programs
    province_interest = Column(JSON)  # Array of provinces
    
    # Stage 12: Timeline & Document Readiness
    urgency = Column(Enum(UrgencyLevel))
    target_arrival = Column(DateTime)
    docs_ready = Column(JSON)  # Array of ready documents
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    documents = relationship("IntakeDocument", back_populates="intake", cascade="all, delete-orphan")

class IntakeDocument(Base):
    __tablename__ = "intake_documents"

    id = Column(Integer, primary_key=True, index=True)
    intake_id = Column(Integer, ForeignKey("client_intakes.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer)
    file_type = Column(String)
    stage = Column(Integer)  # Which stage this document was uploaded in
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    intake = relationship("ClientIntake", back_populates="documents")