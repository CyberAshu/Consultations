import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../shared/Button';
import { Badge } from '../ui/Badge';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  DollarSign,
  Video,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../services/types';

// Extended booking interface for calendar display
interface CalendarBooking extends Booking {
  client_name?: string;
  client_email?: string;
  service_name?: string;
  duration?: number;
  timezone?: string;
}

interface RCICBookingsCalendarProps {
  consultantId?: number;
  onBookingClick?: (booking: CalendarBooking) => void;
  clientNames?: {[key: string]: string}; // Map of client_id to client_name
}

export function RCICBookingsCalendar({ consultantId, onBookingClick, clientNames = {} }: RCICBookingsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedDayBookings, setSelectedDayBookings] = useState<CalendarBooking[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [consultantTimezone, setConsultantTimezone] = useState<string>('America/Toronto');

  useEffect(() => {
    fetchBookings();
  }, [currentDate, consultantId]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Fetch all bookings for current RCIC
      const allBookings = await bookingService.getBookings();
      
      // Filter bookings for current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
      
      const monthBookings = allBookings.filter((booking: Booking) => {
        const bookingDate = new Date(booking.booking_date || booking.scheduled_date || '');
        return bookingDate >= startOfMonth && bookingDate <= endOfMonth;
      });

      // Set consultant timezone from bookings
      if (monthBookings.length > 0 && monthBookings[0].timezone) {
        setConsultantTimezone(monthBookings[0].timezone || 'America/Toronto');
      }

      // Map bookings to calendar interface with additional display fields
      const mappedBookings: CalendarBooking[] = monthBookings.map((booking: Booking) => {
        // Get client name from prop or fallback to formatted ID
        let clientName = clientNames[booking.client_id];
        
        if (!clientName) {
          // Format client ID nicely: "Client #68810fb7"
          const shortId = booking.client_id.slice(0, 8);
          clientName = `Client #${shortId}`;
        }
        
        return {
          ...booking,
          client_name: clientName,
          service_name: booking.service_type || 'Consultation',
          duration: booking.duration_minutes || 45,
          timezone: booking.timezone || consultantTimezone,
        };
      });

      setBookings(mappedBookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getBookingsForDay = (date: Date) => {
    return bookings.filter((booking) => {
      const dateStr = booking.booking_date || booking.scheduled_date;
      if (!dateStr) return false;
      
      // Parse booking date - stored in UTC
      const bookingDate = new Date(dateStr);
      
      // Use the booking's timezone to convert for proper calendar display
      const bookingTimezone = booking.timezone || consultantTimezone;
      const consultantDateStr = bookingDate.toLocaleString('en-US', { 
        timeZone: bookingTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      // Parse date components (format: MM/DD/YYYY)
      const [month, day, year] = consultantDateStr.split('/').map(Number);
      
      return (
        day === date.getDate() &&
        month === (date.getMonth() + 1) &&
        year === date.getFullYear()
      );
    });
  };

  const handleDayClick = (date: Date) => {
    const dayBookings = getBookingsForDay(date);
    if (dayBookings.length > 0) {
      setSelectedDay(date);
      setSelectedDayBookings(dayBookings);
      setShowDetailModal(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-3 w-3" />;
      case 'pending':
        return <AlertCircle className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'cancelled':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const days = getDaysInMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Bookings Calendar</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => changeMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[180px] text-center">
                <p className="font-semibold text-gray-900">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => changeMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs mb-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Confirmed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Cancelled</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Loading bookings...</p>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => {
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const isToday = date.getTime() === today.getTime();
                  const dayBookings = getBookingsForDay(date);
                  const hasBookings = dayBookings.length > 0;

                  return (
                    <button
                      key={index}
                      onClick={() => handleDayClick(date)}
                      disabled={!hasBookings}
                      className={`
                        min-h-[80px] p-2 rounded-lg border transition-all duration-200 relative
                        ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                        ${isToday ? 'ring-2 ring-blue-500' : ''}
                        ${hasBookings ? 'hover:bg-blue-50 cursor-pointer border-blue-200' : 'border-gray-200 cursor-default'}
                        ${!isCurrentMonth ? 'opacity-50' : ''}
                      `}
                    >
                      <div className="text-xs font-medium text-gray-900 mb-1">
                        {date.getDate()}
                      </div>
                      
                      {hasBookings && (
                        <div className="space-y-1">
                          {dayBookings.slice(0, 2).map((booking) => (
                            <div
                              key={booking.id}
                              className={`text-[10px] px-1.5 py-0.5 rounded border truncate ${getStatusColor(booking.status)}`}
                            >
                              {new Date(booking.booking_date || booking.scheduled_date || '').toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
                          ))}
                          {dayBookings.length > 2 && (
                            <div className="text-[10px] text-blue-600 font-medium text-center">
                              +{dayBookings.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {showDetailModal && selectedDay && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Bookings for {selectedDay.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                {selectedDayBookings.map((booking) => (
                  <Card 
                    key={booking.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setShowDetailModal(false); // Close calendar modal first
                      setTimeout(() => onBookingClick?.(booking), 100); // Then open session detail
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="font-semibold text-gray-900">
                              {new Date(booking.booking_date || booking.scheduled_date || '').toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({booking.duration} min)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-800">
                              {booking.client_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {booking.service_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-800">
                              ${booking.total_amount} CAD
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getStatusColor(booking.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(booking.status)}
                              <span className="capitalize">{booking.status}</span>
                            </div>
                          </Badge>
                          {booking.meeting_url && (
                            <a
                              href={booking.meeting_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Video className="h-3 w-3" />
                              Join Meeting
                            </a>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
