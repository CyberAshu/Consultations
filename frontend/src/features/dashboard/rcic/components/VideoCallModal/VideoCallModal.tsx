import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../../../../../components/common/Button';
import { Loader2, PhoneOff, X } from 'lucide-react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingUrl: string;
  userName?: string;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  meetingUrl,
  userName = 'Guest',
}) => {
  const callFrameRef = useRef<DailyCall | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializingRef = useRef(false); // Prevent duplicate initialization

  useEffect(() => {
    if (!isOpen || !containerRef.current || !meetingUrl) return;

    // Prevent duplicate initialization (React StrictMode issue)
    if (initializingRef.current || callFrameRef.current) return;

    initializingRef.current = true;

    const initializeCall = async () => {
      try {
        setIsJoining(true);
        setError(null);

        // Validate meeting URL
        if (!meetingUrl || typeof meetingUrl !== 'string' || !meetingUrl.startsWith('http')) {
          throw new Error(`Invalid meeting URL: ${meetingUrl}`);
        }

        // Create Daily call frame
        const callFrame = DailyIframe.createFrame(containerRef.current!, {
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: '0',
            borderRadius: '8px',
          },
          showLeaveButton: true,
          showFullscreenButton: true,
        });

        callFrameRef.current = callFrame;

        // Listen for call events
        callFrame.on('left-meeting', handleLeftMeeting);
        callFrame.on('error', handleError);

        // Join the call
        await callFrame.join({
          url: meetingUrl,
          userName: userName,
        });

        setIsJoining(false);
      } catch (err: any) {
        setError(err?.message || 'Failed to join the call. Please try again.');
        setIsJoining(false);
        initializingRef.current = false;
      }
    };

    initializeCall();

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
        callFrameRef.current = null;
      }
      initializingRef.current = false;
    };
  }, [isOpen, meetingUrl, userName]);

  const handleLeftMeeting = () => {
    onClose();
  };

  const handleError = (error: any) => {
    console.error('Daily call error:', error);
    setError('An error occurred during the call.');
  };

  const handleLeaveCall = async () => {
    if (callFrameRef.current) {
      try {
        await callFrameRef.current.leave();
      } catch (err) {
        console.error('Error leaving call:', err);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Video Consultation</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLeaveCall}
              disabled={isJoining}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <PhoneOff className="mr-2 h-4 w-4" />
              Leave Call
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isJoining}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Call Container */}
        <div className="flex-1 relative p-4">
          {isJoining && (
            <div className="absolute inset-4 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Joining call...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-4 flex items-center justify-center bg-red-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          )}

          <div
            ref={containerRef}
            className="w-full h-full rounded-lg"
            style={{ minHeight: '500px' }}
          />
        </div>
      </div>
    </div>
  );
};
