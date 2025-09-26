import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../services/types';
import { MeetingManager } from '../video/MeetingManager';
import { AlertTriangle } from 'lucide-react';

export const MeetingPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [userRole, setUserRole] = useState<'client' | 'consultant' | 'admin'>('client');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookingData = useCallback(async () => {
    try {
      // Check authentication
      if (!authService.isAuthenticated()) {
        navigate('/login');
        return;
      }

      // Get current user to determine role
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        const mappedRole = currentUser.role === 'rcic' ? 'consultant' : (currentUser.role as 'client' | 'consultant' | 'admin');
        setUserRole(mappedRole);
      }

      // Load booking data using booking service
      const bookingData = await bookingService.getBookingById(parseInt(bookingId!));
      setBooking(bookingData);

    } catch (err) {
      console.error('Failed to load booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  }, [bookingId, navigate]);

  useEffect(() => {
    if (bookingId) {
      loadBookingData();
    } else {
      setError('No booking ID provided');
      setLoading(false);
    }
  }, [bookingId, loadBookingData]);

  const handleBack = () => {
    // Navigate back to appropriate dashboard based on user role
    if (userRole === 'client') {
      navigate('/client-dashboard');
    } else if (userRole === 'consultant') {
      navigate('/rcic-dashboard');
    } else {
      navigate('/admin-dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meeting information...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to Load Meeting
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'Meeting information could not be loaded.'}
          </p>
          <div className="space-x-4">
            <button
              onClick={loadBookingData}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleBack}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MeetingManager
      booking={booking}
      userRole={userRole}
      onBack={handleBack}
    />
  );
};

export default MeetingPage;