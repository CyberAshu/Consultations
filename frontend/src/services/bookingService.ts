import { apiGet, apiPost, apiPut, apiPostFormData } from './api';
import { 
  Booking, 
  CreateBookingRequest,
  CreateBookingWithDurationRequest,
  PriceCalculationRequest,
  PriceCalculationResponse,
  ConsultantAvailability,
  BookingDocument 
} from './types';

interface PriceRequest {
  service_id: number;
  duration: number; // Duration in minutes
}

interface PriceResponse {
  price: number;
}

class BookingService {
  // Get user's bookings
  async getBookings(): Promise<Booking[]> {
    // Use trailing slash to match FastAPI route and avoid 307 redirects
    return apiGet<Booking[]>('/bookings/');
  }

  // Get specific booking by ID
  async getBookingById(bookingId: number): Promise<Booking> {
    return apiGet<Booking>(`/bookings/${bookingId}`);
  }

  // Calculate price for a service with specific duration
  async calculatePrice(priceRequest: PriceRequest): Promise<PriceResponse> {
    return apiPost<PriceResponse>('/bookings/calculate-price', priceRequest);
  }

  // Create a new booking with optional duration
  async createBooking(bookingData: CreateBookingRequest, duration?: number): Promise<Booking> {
    const payload = duration ? { ...bookingData, duration } : bookingData;
    // Use trailing slash to match FastAPI route and avoid 307 redirects
    return apiPost<Booking>('/bookings/', payload);
  }

  // Update booking information
  async updateBooking(bookingId: number, updateData: Partial<Booking>): Promise<Booking> {
    return apiPut<Booking>(`/bookings/${bookingId}`, updateData);
  }

  // Get available time slots for a consultant on a specific date
  async getConsultantAvailability(consultantId: number, date: string): Promise<ConsultantAvailability> {
    return apiGet<ConsultantAvailability>(`/bookings/consultants/${consultantId}/availability`, { date });
  }

  // Upload document for a booking
  async uploadBookingDocument(bookingId: number, file: File): Promise<BookingDocument> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiPostFormData<BookingDocument>(`/bookings/${bookingId}/documents`, formData);
  }

  // Cancel a booking
  async cancelBooking(bookingId: number): Promise<Booking> {
    return apiPut<Booking>(`/bookings/${bookingId}`, { status: 'cancelled' });
  }

  // Confirm a booking
  async confirmBooking(bookingId: number): Promise<Booking> {
    return apiPut<Booking>(`/bookings/${bookingId}`, { status: 'confirmed' });
  }

  // Complete a booking
  async completeBooking(bookingId: number): Promise<Booking> {
    return apiPut<Booking>(`/bookings/${bookingId}`, { status: 'completed' });
  }

  // Get all documents for a booking (for RCIC panel)
  async getBookingDocuments(bookingId: number): Promise<{
    booking_id: number;
    documents: Array<{
      id: number;
      booking_id: number;
      file_name: string;
      file_type: string;
      file_size: number;
      uploaded_at: string;
      download_url: string | null;
      error?: string;
    }>;
    total_documents: number;
  }> {
    return apiGet(`/bookings/${bookingId}/documents`);
  }

  // Get download URL for a specific document
  async getDocumentDownloadUrl(bookingId: number, documentId: number): Promise<{
    document_id: number;
    file_name: string;
    file_type: string;
    file_size: number;
    download_url: string;
    expires_in: number;
  }> {
    return apiGet(`/bookings/${bookingId}/documents/${documentId}/download`);
  }

  // NEW: Duration-based pricing methods
  
  // Calculate price for a service with specific duration option
  async calculateDurationPrice(priceRequest: PriceCalculationRequest): Promise<PriceCalculationResponse> {
    return apiPost<PriceCalculationResponse>('/bookings/calculate-price', priceRequest);
  }

  // Create booking with duration-based pricing
  async createBookingWithDuration(bookingData: CreateBookingWithDurationRequest): Promise<Booking> {
    return apiPost<Booking>('/bookings/create-with-duration', bookingData);
  }
}

export const bookingService = new BookingService();
