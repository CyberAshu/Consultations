import React, { useEffect, useRef, useState, useCallback } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { authService } from '../../services/authService';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MonitorSpeaker, 
  PhoneOff, 
  Users,
  Circle,
  Square
} from 'lucide-react';

interface VideoMeetingProps {
  bookingId: number;
  userRole: 'client' | 'consultant' | 'admin';
  onLeave?: () => void;
}

interface MeetingState {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  participants: any[];
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'failed';
}

export const VideoMeeting: React.FC<VideoMeetingProps> = ({ 
  bookingId, 
  userRole, 
  onLeave 
}) => {
  const callContainerRef = useRef<HTMLDivElement>(null);
  const callObjectRef = useRef<any>(null);
  
  const [meetingState, setMeetingState] = useState<MeetingState>({
    isVideoEnabled: true,
    isAudioEnabled: true,
    isScreenSharing: false,
    isRecording: false,
    participants: [],
    connectionState: 'connecting'
  });
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Use primary API URL from environment
  const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initializeMeeting = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get meeting info from backend
      const token = authService.getAccessToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${API_BASE}/api/v1/video/booking/${bookingId}/room-info`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get meeting information');
      }

      const meetingData = await response.json();
      
      // Create Daily call object
      const callObject = DailyIframe.createCallObject({
        iframeStyle: {
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          border: 'none',
        },
      });

      callObjectRef.current = callObject;

      // Set up event listeners
      setupEventListeners(callObject);

      // Join the meeting
      await callObject.join({
        url: meetingData.room_url,
        token: meetingData.token,
        userName: userRole === 'client' ? 'Client' : 'Consultant',
      });

      // Append to container
      if (callContainerRef.current) {
        const iframe = callObject.iframe();
        if (iframe) {
          callContainerRef.current.appendChild(iframe);
        }
      }

    } catch (err) {
      console.error('Failed to initialize meeting:', err);
      setError(err instanceof Error ? err.message : 'Failed to join meeting');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, bookingId, userRole]);

  // Initialize meeting
  useEffect(() => {
    initializeMeeting();
    
    return () => {
      if (callObjectRef.current) {
        callObjectRef.current.destroy();
      }
    };
  }, [initializeMeeting]);

  const setupEventListeners = (callObject: any) => {
    callObject
      .on('joining-meeting', () => {
        setMeetingState(prev => ({ ...prev, connectionState: 'connecting' }));
      })
      .on('joined-meeting', () => {
        setMeetingState(prev => ({ ...prev, connectionState: 'connected' }));
        updateParticipants(callObject);
      })
      .on('left-meeting', () => {
        setMeetingState(prev => ({ ...prev, connectionState: 'disconnected' }));
        if (onLeave) onLeave();
      })
      .on('error', (error: any) => {
        console.error('Meeting error:', error);
        setError('Meeting connection failed');
        setMeetingState(prev => ({ ...prev, connectionState: 'failed' }));
      })
      .on('participant-joined', () => {
        updateParticipants(callObject);
      })
      .on('participant-left', () => {
        updateParticipants(callObject);
      })
      .on('camera-error', (error: any) => {
        console.error('Camera error:', error);
        setError('Camera access failed. Please check your permissions.');
      })
      .on('recording-started', () => {
        setMeetingState(prev => ({ ...prev, isRecording: true }));
      })
      .on('recording-stopped', () => {
        setMeetingState(prev => ({ ...prev, isRecording: false }));
      });
  };

  const updateParticipants = (callObject: any) => {
    const participants = callObject.participants();
    setMeetingState(prev => ({ 
      ...prev, 
      participants: Object.values(participants) 
    }));
  };

  const toggleVideo = async () => {
    if (!callObjectRef.current) return;
    
    const newState = !meetingState.isVideoEnabled;
    await callObjectRef.current.setLocalVideo(newState);
    setMeetingState(prev => ({ ...prev, isVideoEnabled: newState }));
  };

  const toggleAudio = async () => {
    if (!callObjectRef.current) return;
    
    const newState = !meetingState.isAudioEnabled;
    await callObjectRef.current.setLocalAudio(newState);
    setMeetingState(prev => ({ ...prev, isAudioEnabled: newState }));
  };

  const toggleScreenShare = async () => {
    if (!callObjectRef.current) return;
    
    try {
      if (meetingState.isScreenSharing) {
        await callObjectRef.current.stopScreenShare();
      } else {
        await callObjectRef.current.startScreenShare();
      }
      setMeetingState(prev => ({ 
        ...prev, 
        isScreenSharing: !prev.isScreenSharing 
      }));
    } catch (err) {
      console.error('Screen share error:', err);
      setError('Screen sharing failed. Please try again.');
    }
  };

  const toggleRecording = async () => {
    if (!callObjectRef.current) return;
    
    // Only consultants can control recording
    if (userRole !== 'consultant') {
      setError('Only the consultant can control recording');
      return;
    }

    try {
      if (meetingState.isRecording) {
        await callObjectRef.current.stopRecording();
      } else {
        await callObjectRef.current.startRecording();
      }
    } catch (err) {
      console.error('Recording error:', err);
      setError('Recording control failed. Please try again.');
    }
  };

  const leaveMeeting = async () => {
    if (callObjectRef.current) {
      await callObjectRef.current.leave();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Connecting to meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <Video className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Connection Failed</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={initializeMeeting}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
          {onLeave && (
            <button
              onClick={onLeave}
              className="ml-4 bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-black">
      {/* Main video container */}
      <div ref={callContainerRef} className="w-full h-full" />
      
      {/* Controls overlay */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="bg-gray-800 bg-opacity-90 rounded-full px-6 py-3 flex items-center space-x-4">
          {/* Video toggle */}
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              meetingState.isVideoEnabled 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            title={meetingState.isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {meetingState.isVideoEnabled ? (
              <Video className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5" />
            )}
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors ${
              meetingState.isAudioEnabled 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            title={meetingState.isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {meetingState.isAudioEnabled ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </button>

          {/* Screen share */}
          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full transition-colors ${
              meetingState.isScreenSharing
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            title={meetingState.isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <MonitorSpeaker className="h-5 w-5" />
          </button>

          {/* Recording (consultant only) */}
          {userRole === 'consultant' && (
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-full transition-colors ${
                meetingState.isRecording
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
              title={meetingState.isRecording ? 'Stop recording' : 'Start recording'}
            >
              {meetingState.isRecording ? (
                <Square className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>
          )}

          {/* Leave meeting */}
          <button
            onClick={leaveMeeting}
            className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            title="Leave meeting"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Recording indicator */}
      {meetingState.isRecording && (
        <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>Recording</span>
        </div>
      )}

      {/* Connection status */}
      <div className="absolute top-6 right-6">
        <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${
          meetingState.connectionState === 'connected' 
            ? 'bg-green-600 text-white'
            : meetingState.connectionState === 'connecting'
            ? 'bg-yellow-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            meetingState.connectionState === 'connected' 
              ? 'bg-white'
              : meetingState.connectionState === 'connecting'
              ? 'bg-white animate-pulse'
              : 'bg-white'
          }`}></div>
          <span className="capitalize">{meetingState.connectionState}</span>
        </div>
      </div>

      {/* Participants count */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
        <div className="bg-gray-800 bg-opacity-90 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span>{meetingState.participants.length} participant{meetingState.participants.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoMeeting;