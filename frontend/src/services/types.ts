// Auth Types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'client' | 'rcic' | 'admin';
  email_verified: boolean;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface UserResponse {
  user: User;
  session?: AuthSession;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: 'client' | 'rcic';
}

// Review interface
export interface ConsultantReview {
  id?: number;
  consultant_id?: number;
  client_id?: string;
  rating: number;
  comment: string;
  outcome?: string;
  created_at?: string;
}

// Consultant Types
export interface Consultant {
  id: number;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  languages?: string[];
  specialties?: string[];
  rcic_number?: string;
  experience_years?: number;
  experience?: string;  // For backward compatibility
  hourly_rate?: number;
  rating?: number;
  total_reviews?: number;
  review_count?: number;  // Alternative name for total_reviews
  profile_image_url?: string;
  calendly_url?: string;  // Added for calendar integration
  is_active?: boolean;
  availability_status?: string;
  created_at?: string;
  updated_at?: string;
  reviews?: ConsultantReview[];  // Array of reviews
}

export interface ConsultantFilters {
  language?: string;
  province?: string;
  specialty?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

// Booking Types
export interface Booking {
  id: number;
  client_id: string;
  consultant_id: number;
  service_type?: string; // legacy
  scheduled_date?: string; // legacy
  booking_date?: string; // backend field
  service_id?: number; // backend field
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_amount: number;
  notes?: string; // legacy
  meeting_link?: string; // legacy
  meeting_url?: string;
  meeting_notes?: string;
  created_at: string;
  updated_at: string;
  documents?: BookingDocument[];
  intake_form_data?: any; // Add this field for intake forms
}

export interface BookingDocument {
  id: number;
  booking_id: number;
  file_name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  uploaded_at: string;
  created_at?: string; // Add this field for compatibility
}

export interface CreateBookingRequest {
  consultant_id: number;
  service_id: number;
  booking_date: string;
  timezone?: string;
  total_amount: number;
  payment_intent_id: string;
  intake_form_data?: any;
  client_id?: string; // optional; backend will override for clients
}

export interface ConsultantAvailability {
  date: string;
  slots: string[];
}

// Blog Types
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  author_id: string;
  author_name?: string;
  published: boolean;
  featured_image_url?: string;
  seo_title?: string;
  seo_description?: string;
  views_count?: number;
  likes_count?: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  comments?: BlogComment[];
}

export interface BlogComment {
  id: number;
  post_id: number;
  author_id: string;
  author_name?: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

export interface BlogFilters {
  category?: string;
  skip?: number;
  limit?: number;
}

export interface CreateBlogPostRequest {
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  published?: boolean;
  featured_image_url?: string;
  seo_title?: string;
  seo_description?: string;
}

// Features Types (Testimonials, FAQs, Services)
export interface Testimonial {
  id: number;
  author: string;
  role?: string;
  flag?: string;
  quote: string;
  rating: number;
  outcome?: string;
  is_active: string;
  created_at: string;
  updated_at?: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category?: string;
  order_index?: number;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  features?: string[];
  price_range?: string;
  duration?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
}

// Consultant Service Types
export interface ConsultantServiceInDB {
  id: number;
  consultant_id: number;
  name: string;
  duration: string;
  price: number;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

export interface ConsultantServiceCreate {
  name: string;
  duration: string;
  price: number;
  description?: string;
  is_active?: boolean;
}

export interface ConsultantServiceUpdate {
  name?: string;
  duration?: string;
  price?: number;
  description?: string;
  is_active?: boolean;
}

// Newsletter Types
export interface NewsletterSubscription {
  email: string;
}

export interface NewsletterResponse {
  message: string;
  status: 'subscribed' | 'already_subscribed';
}

// Consultant Application Types
export interface ConsultantApplication {
  id: number;
  // Section 1: Personal & Contact Information
  full_legal_name: string;
  preferred_display_name?: string;
  email: string;
  mobile_phone?: string;
  date_of_birth?: string;
  city_province?: string;
  time_zone?: string;
  
  // Section 2: Licensing & Credentials
  rcic_license_number: string;
  year_of_initial_licensing?: number;
  cicc_membership_status?: string;
  cicc_register_screenshot_url?: string;
  proof_of_good_standing_url?: string;
  insurance_certificate_url?: string;
  government_id_url?: string;
  
  // Section 3: Practice Details
  practice_type: string;
  business_firm_name?: string;
  website_linkedin?: string;
  canadian_business_registration?: boolean;
  irb_authorization?: boolean;
  taking_clients_private_practice?: boolean;
  representing_clients_ircc_irb?: boolean;
  
  // Section 4: Areas of Expertise
  areas_of_expertise?: string[]; // JSON field
  other_expertise?: string;
  
  // Section 5: Languages Spoken
  primary_language?: string;
  other_languages?: string[]; // JSON field
  multilingual_consultations?: boolean;
  
  // Section 6: Declarations & Agreements
  confirm_licensed_rcic: boolean;
  agree_terms_guidelines: boolean;
  agree_compliance_irpa: boolean;
  agree_no_outside_contact: boolean;
  consent_session_reviews: boolean;
  
  // Section 7: Signature & Submission
  digital_signature_name: string;
  submission_date: string;
  
  // System fields
  status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
  
  // Admin fields
  admin_notes?: string;
  additional_documents?: Array<{
    filename: string;
    original_name: string;
    file_path: string;
    uploader_email?: string;
    uploaded_by?: string; // for backward compatibility
    uploaded_at?: string;
    timestamp?: string;
  }>;
  
  // Section completion tracking
  section_1_completed?: boolean | null;
  section_2_completed?: boolean | null;
  section_3_completed?: boolean | null;
  section_4_completed?: boolean | null;
  section_5_completed?: boolean | null;
  section_6_completed?: boolean | null;
  section_7_completed?: boolean | null;
  
  // Admin action fields
  sections_requested?: number[];
  sections_requested_at?: string;
  sections_requested_by?: string;
}

// Error Types
export interface ApiErrorResponse {
  detail: string;
  status_code?: number;
}

// Common Pagination
export interface PaginationParams {
  skip?: number;
  limit?: number;
}

// Search and Filter Types
export interface SearchParams {
  query?: string;
  [key: string]: any;
}
