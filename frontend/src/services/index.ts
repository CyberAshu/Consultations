// API Configuration
export * from './api';
export * from './types';

// Services
export { authService } from './authService';
export { consultantService } from './consultantService';
export { bookingService } from './bookingService';
export { blogService } from './blogService';
export { featuresService } from './featuresService';
export { newsletterService } from './newsletterService';
export { consultantApplicationService } from './consultantApplicationService';

// Re-export types for convenience
export type {
  User,
  UserResponse,
  LoginRequest,
  RegisterRequest,
  AuthSession,
  Consultant,
  ConsultantFilters,
  Booking,
  CreateBookingRequest,
  ConsultantAvailability,
  BookingDocument,
  BlogPost,
  BlogFilters,
  CreateBlogPostRequest,
  Testimonial,
  FAQ,
  Service,
  NewsletterSubscription,
  NewsletterResponse,
  ConsultantApplication,
  ApiErrorResponse,
  PaginationParams,
  SearchParams
} from './types';
