import React, { useState, useEffect, useCallback } from 'react';
import { authService } from '../../services/authService';
import { Booking } from '../../services/types';
import { Video, Plus, Calendar, Clock, Users } from 'lucide-react';
import VideoMeeting from './VideoMeeting';

interface MeetingManagerProps {
  booking: Booking;
  userRole: 'client' | 'consultant' | 'admin';
  onBack?: () => void;
}

interface MeetingStatus {
  isActive: boolean;
  startedBy: string | null;
  startedAt: string | null;
  participantCount: number;
}

export const MeetingManager: React.FC<MeetingManagerProps> = ({
  booking,
  userRole,
  onBack
}) => {
  const [showMeeting, setShowMeeting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meetingExists, setMeetingExists] = useState(!!booking.meeting_url);

  // Keep meetingExists in sync if booking.meeting_url changes (e.g., created elsewhere)
  useEffect(() => {
    if (booking.meeting_url && !meetingExists) {
      setMeetingExists(true);
    }
  }, [booking.meeting_url, meetingExists]);
  const [meetingStatus, setMeetingStatus] = useState<MeetingStatus>({
    isActive: false,
    startedBy: null,
    startedAt: null,
    participantCount: 0
  });
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Use primary API URL from environment
  const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

  const canCreateMeeting = () => {
    // Both client and consultant can create meetings
    // But usually the consultant creates it
    return userRole === 'consultant' || userRole === 'client' || userRole === 'admin';
  };

  const canJoinMeeting = () => {
    // Consultant can always join if meeting exists
    if (userRole === 'consultant' || userRole === 'admin') {
      return meetingExists && canCreateMeeting();
    }
    
    // Client can only join if consultant has started the meeting
    if (userRole === 'client') {
      return meetingExists && meetingStatus.isActive && canCreateMeeting();
    }
    
    return false;
  };

  const checkMeetingStatus = useCallback(async () => {
    if (!meetingExists || !booking.meeting_url) return;
    
    try {
      setCheckingStatus(true);
      const token = authService.getAccessToken();
      
      if (!token) return;

      const response = await fetch(
        `${API_BASE}/api/v1/video/booking/${booking.id}/status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const statusData = await response.json();
        setMeetingStatus({
          isActive: statusData.is_active || false,
          startedBy: statusData.started_by || null,
          startedAt: statusData.started_at || null,
          participantCount: statusData.participant_count || 0
        });
      }
    } catch (err) {
      console.error('Failed to check meeting status:', err);
    } finally {
      setCheckingStatus(false);
    }
  }, [meetingExists, booking, booking.id, booking.meeting_url, API_BASE]);

  // Ensure local meetingExists stays in sync with backend by fetching room-info when needed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const syncExistingRoom = useCallback(async () => {
    try {
      const token = authService.getAccessToken();
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/v1/video/booking/${booking.id}/room-info`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        // Mark as existing and cache URL locally
        setMeetingExists(true);
        (booking as any).meeting_url = data.room_url;
      }
    } catch (e) {
      // swallow; if it fails we'll remain in current state
      console.warn('syncExistingRoom failed', e);
    }
  }, [API_BASE, booking.id]);

  // Poll meeting status for clients
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Only poll status for clients and if meeting exists
    if (userRole === 'client' && meetingExists) {
      checkMeetingStatus(); // Initial check
      
      // Poll every 10 seconds
      interval = setInterval(checkMeetingStatus, 10000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userRole, meetingExists, checkMeetingStatus]);

  const createMeeting = async () => {
    try {
      setCreating(true);
      setError(null);

      const token = authService.getAccessToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${API_BASE}/api/v1/video/create-room`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            booking_id: booking.id,
            enable_recording: true
          }),
        }
      );

      if (!response.ok) {
        // Try to parse JSON; if it's HTML fallback to empty
        let errorDetail: string | undefined;
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail;
        } catch {}

        // If room already exists, switch to join mode automatically
        if (response.status === 400 && (errorDetail || '').toLowerCase().includes('already exists')) {
          await syncExistingRoom();
          setError(null);
          return;
        }

        throw new Error(errorDetail || 'Failed to create meeting room');
      }

      const meetingData = await response.json();
      
      // Update local state
      setMeetingExists(true);
      
      // Optionally update the booking object
      (booking as any).meeting_url = meetingData.room_url;

    } catch (err) {
      console.error('Failed to create meeting:', err);
      setError(err instanceof Error ? err.message : 'Failed to create meeting');
    } finally {
      setCreating(false);
    }
  };

  const joinMeeting = async () => {
    if (!canJoinMeeting()) return;
    
    // If consultant is joining, mark meeting as active
    if (userRole === 'consultant') {
      try {
        const token = authService.getAccessToken();
        if (token) {
          await fetch(
            `${API_BASE}/api/v1/video/booking/${booking.id}/join`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          // Update local state immediately
          setMeetingStatus(prev => ({
            ...prev,
            isActive: true,
            startedBy: 'consultant',
            startedAt: new Date().toISOString()
          }));
        }
      } catch (err) {
        console.error('Failed to mark meeting as started:', err);
      }
    }
    
    setShowMeeting(true);
  };

  const leaveMeeting = () => {
    setShowMeeting(false);
  };

  // Check if meeting time is within acceptable range (15 mins before to 2 hours after)
  const isMeetingTimeValid = () => {
    if (!booking.booking_date && !booking.scheduled_date) return false;
    
    const now = new Date();
    const meetingTime = new Date(booking.booking_date || booking.scheduled_date || '');
    const diffMinutes = (meetingTime.getTime() - now.getTime()) / (1000 * 60);
    
    // Can join 15 minutes before and up to 2 hours after scheduled time
    return diffMinutes <= 15 && diffMinutes >= -120;
  };

  if (showMeeting) {
    return (
      <VideoMeeting
        bookingId={booking.id}
        userRole={userRole}
        onLeave={leaveMeeting}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Video className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Video Consultation
                </h1>
                <p className="text-gray-600">
                  Booking #{booking.id} - {booking.service_type || 'Consultation'}
                </p>
              </div>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back to Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Meeting Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Booking Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Meeting Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">
                  {(booking.booking_date || booking.scheduled_date) ? 
                    new Date(booking.booking_date || booking.scheduled_date!).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Date TBD'
                  }
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">
                  {(booking.booking_date || booking.scheduled_date) ? 
                    new Date(booking.booking_date || booking.scheduled_date!).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Time TBD'
                  }
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">
                  {userRole === 'client' ? 
                    `with Consultant` :
                    `with Client`
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Meeting Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Meeting Status
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Meeting Room:</span>
                <span className={`font-medium ${
                  meetingExists ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {meetingExists ? 'Ready' : 'Not Created'}
                </span>
              </div>
              
              {userRole === 'client' && meetingExists && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Consultant Status:</span>
                  <span className={`font-medium flex items-center gap-2 ${
                    meetingStatus.isActive ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      meetingStatus.isActive ? 'bg-green-500' : 'bg-orange-500'
                    } ${meetingStatus.isActive ? 'animate-pulse' : ''}`}></div>
                    {checkingStatus ? 'Checking...' : 
                     meetingStatus.isActive ? 'In Meeting Room' : 'Not Started Yet'}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Access Window:</span>
                <span className={`font-medium ${
                  isMeetingTimeValid() ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {isMeetingTimeValid() ? 'Available Now' : 'Outside Access Time'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Recording:</span>
                <span className="font-medium text-blue-600">
                  {userRole === 'consultant' ? 'You can control' : 'Consultant controlled'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Meeting Actions
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            {!meetingExists && canCreateMeeting() && (
              <button
                onClick={createMeeting}
                disabled={creating}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating Meeting...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    <span>Create Meeting Room</span>
                  </>
                )}
              </button>
            )}

            {meetingExists && canJoinMeeting() && (
              <button
                onClick={joinMeeting}
                disabled={!isMeetingTimeValid() || (userRole === 'client' && checkingStatus)}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Video className="h-5 w-5" />
                <span>
                  {userRole === 'consultant' ? 'Start Meeting' : 'Join Meeting'}
                </span>
              </button>
            )}
            
            {/* If the room exists but the UI hasn't caught up yet, offer a quick sync */}
            {!meetingExists && error && error.toLowerCase().includes('already exists') && (
              <button
                onClick={syncExistingRoom}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Video className="h-5 w-5" />
                <span>Use Existing Room</span>
              </button>
            )}
            
            {/* Special message for clients when consultant hasn't started */}
            {userRole === 'client' && meetingExists && !meetingStatus.isActive && isMeetingTimeValid() && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <div>
                    <p className="text-blue-800 font-medium">Waiting for Consultant</p>
                    <p className="text-blue-600 text-sm">
                      Your consultant will start the meeting soon. The join button will appear once they enter the room.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {meetingExists && !isMeetingTimeValid() && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-700 text-sm">
                  <strong>Meeting Access:</strong> You can join the meeting 15 minutes before 
                  the scheduled time and up to 2 hours after. 
                  {(booking.booking_date || booking.scheduled_date) && 
                   new Date(booking.booking_date || booking.scheduled_date!) > new Date() ? 
                    ' Please wait until closer to your appointment time.' :
                    ' This meeting window has expired.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Meeting Instructions
          </h3>
          <div className="space-y-2 text-blue-800 text-sm">
            <p>• Ensure you have a stable internet connection</p>
            <p>• Test your camera and microphone before joining</p>
            <p>• Use Chrome, Firefox, or Safari for the best experience</p>
            <p>• The meeting room will be available 15 minutes before your scheduled time</p>
            {userRole === 'consultant' && (
              <p>• As the consultant, you can control recording during the meeting</p>
            )}
            <p>• All meetings are recorded for quality and reference purposes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingManager;