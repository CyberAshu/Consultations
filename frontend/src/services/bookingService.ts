import { apiGet, apiPost, apiPut, apiPostFormData } from './api';
import { 
  Booking, 
  CreateBookingRequest,
  ConsultantAvailability,
  BookingDocument 
} from './types';

class BookingService {
  // Get user's bookings
  async getBookings(): Promise<Booking[]> {
    return apiGet<Booking[]>('/bookings');
  }

  // Get specific booking by ID
  async getBookingById(bookingId: number): Promise<Booking> {
    return apiGet<Booking>(`/bookings/${bookingId}`);
  }

  // Create a new booking
  async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    return apiPost<Booking>('/bookings', bookingData);
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
}

export const bookingService = new BookingService();
