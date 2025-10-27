import React, { useState, useEffect } from 'react';
import { Button } from '../shared/Button';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Save,
  X,
  Globe,
  AlertCircle,
  Check,
  Ban,
  Info,
  Loader,
} from 'lucide-react';
import {
  availabilityService,
  type WeeklySchedule,
  type BlockedTime,
  type DayOfWeek,
  type TimezoneInfo,
  type AvailabilitySlotCreate,
} from '../../services/availabilityService';

interface RCICAvailabilityManagerProps {
  consultantId?: number; // Optional, uses current RCIC if not provided
  onScheduleUpdated?: () => void;
}

export function RCICAvailabilityManager({ consultantId, onScheduleUpdated }: RCICAvailabilityManagerProps) {
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [timezones, setTimezones] = useState<TimezoneInfo[]>([
    // Fallback timezones in case API fails
    { value: 'America/Toronto', label: 'Eastern Time (Toronto)', offset: 'UTC-5' },
    { value: 'America/Vancouver', label: 'Pacific Time (Vancouver)', offset: 'UTC-8' },
    { value: 'America/Edmonton', label: 'Mountain Time (Edmonton)', offset: 'UTC-7' },
    { value: 'America/Winnipeg', label: 'Central Time (Winnipeg)', offset: 'UTC-6' },
    { value: 'America/Halifax', label: 'Atlantic Time (Halifax)', offset: 'UTC-4' },
    { value: 'America/St_Johns', label: 'Newfoundland Time', offset: 'UTC-3:30' },
    { value: 'Asia/Kolkata', label: 'India Standard Time', offset: 'UTC+5:30' },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<'schedule' | 'blocked'>('schedule');
  const [addingNewSlot, setAddingNewSlot] = useState<DayOfWeek | null>(null);

  // Form State for new/editing slots
  const [slotForm, setSlotForm] = useState<{
    day_of_week: DayOfWeek;
    start_time: string;
    end_time: string;
    timezone: string;
    slot_interval_minutes: number;
  }>({
    day_of_week: 'monday',
    start_time: '09:00',
    end_time: '17:00',
    timezone: 'America/Toronto',
    slot_interval_minutes: 15,
  });

  // Blocked time form state
  const [blockedTimeForm, setBlockedTimeForm] = useState<{
    start_datetime: string;
    end_datetime: string;
    reason: string;
  }>({
    start_datetime: '',
    end_datetime: '',
    reason: '',
  });
  const [addingBlockedTime, setAddingBlockedTime] = useState(false);
  
  // Confirmation state for deletes
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'slot' | 'blocked'; id: number } | null>(null);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [scheduleData, blockedTimesData, timezonesData] = await Promise.all([
        availabilityService.getMySchedule(),
        availabilityService.getMyBlockedTimes(),
        availabilityService.getCommonTimezones().catch(() => []), // Fallback to empty array
      ]);

      setSchedule(scheduleData);
      setBlockedTimes(blockedTimesData);
      
      // Only update timezones if API returned valid data
      if (timezonesData && Array.isArray(timezonesData) && timezonesData.length > 0) {
        setTimezones(timezonesData);
      }
      // Otherwise keep the default fallback timezones
      
      setSlotForm(prev => ({ ...prev, timezone: scheduleData.timezone || 'America/Toronto' }));
    } catch (err: any) {
      setError(err.message || 'Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  // Handle slot creation
  const handleCreateSlot = async (day: DayOfWeek) => {
    if (!slotForm.start_time || !slotForm.end_time) {
      setError('Please provide start and end times');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const newSlot: AvailabilitySlotCreate = {
        day_of_week: day,
        start_time: availabilityService.parseTime(slotForm.start_time),
        end_time: availabilityService.parseTime(slotForm.end_time),
        timezone: schedule?.timezone || 'America/Toronto',
        slot_interval_minutes: slotForm.slot_interval_minutes,
      };

      const createdSlot = await availabilityService.createAvailabilitySlot(newSlot);
      
      // Optimistic update - add new slot to existing schedule
      if (schedule) {
        setSchedule({
          ...schedule,
          slots: [...schedule.slots, createdSlot]
        });
      }
      
      setSuccessMessage('Availability slot added successfully!');
      setAddingNewSlot(null);
      onScheduleUpdated?.();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create slot');
    } finally {
      setSaving(false);
    }
  };

  // Handle slot deletion
  const handleDeleteSlot = async (slotId: number) => {
    setSaving(true);
    setError(null);
    try {
      await availabilityService.deleteAvailabilitySlot(slotId);
      
      // Optimistic update - remove slot from schedule
      if (schedule) {
        setSchedule({
          ...schedule,
          slots: schedule.slots.filter(slot => slot.id !== slotId)
        });
      }
      
      setSuccessMessage('Availability slot deleted successfully!');
      setConfirmDelete(null);
      onScheduleUpdated?.();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete slot');
    } finally {
      setSaving(false);
    }
  };

  // Handle blocked time creation
  const handleCreateBlockedTime = async () => {
    if (!blockedTimeForm.start_datetime || !blockedTimeForm.end_datetime) {
      setError('Please provide start and end date/time for blocked period');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const createdBlockedTime = await availabilityService.createBlockedTime({
        start_datetime: new Date(blockedTimeForm.start_datetime).toISOString(),
        end_datetime: new Date(blockedTimeForm.end_datetime).toISOString(),
        reason: blockedTimeForm.reason || 'Unavailable',
      });
      
      // Optimistic update - add blocked time to list
      setBlockedTimes([...blockedTimes, createdBlockedTime]);
      
      setSuccessMessage('Blocked time added successfully!');
      setAddingBlockedTime(false);
      setBlockedTimeForm({ start_datetime: '', end_datetime: '', reason: '' });
      onScheduleUpdated?.();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create blocked time');
    } finally {
      setSaving(false);
    }
  };

  // Handle blocked time deletion
  const handleDeleteBlockedTime = async (id: number) => {
    setSaving(true);
    setError(null);
    try {
      await availabilityService.deleteBlockedTime(id);
      
      // Optimistic update - remove blocked time from list
      setBlockedTimes(blockedTimes.filter(blocked => blocked.id !== id));
      
      setSuccessMessage('Blocked time removed successfully!');
      setConfirmDelete(null);
      onScheduleUpdated?.();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete blocked time');
    } finally {
      setSaving(false);
    }
  };

  // Group slots by day
  const slotsByDay = schedule ? availabilityService.groupSlotsByDay(schedule.slots) : null;
  const allDays = availabilityService.getAllDays();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading availability settings...</span>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Your Availability</h2>
          <p className="text-gray-600 mt-1">
            Set your weekly schedule and blocked times (holidays, vacations)
          </p>
        </div>
        {schedule && (
          <div className="text-right">
            <Badge variant="outline" className="text-sm">
              <Globe className="h-4 w-4 mr-1" />
              {schedule.timezone}
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              <Info className="h-3 w-3 inline mr-1" />
              From your profile settings
            </p>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      {error && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-white border-l-4 border-red-500 rounded-lg shadow-2xl p-4 flex items-start gap-3 max-w-md">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Error</p>
              <p className="text-sm text-gray-600 mt-1">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-white border-l-4 border-green-500 rounded-lg shadow-2xl p-4 flex items-start gap-3 max-w-md">
            <div className="bg-green-100 p-2 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Success</p>
              <p className="text-sm text-gray-600 mt-1">{successMessage}</p>
            </div>
            <button 
              onClick={() => setSuccessMessage(null)} 
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'schedule'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="h-4 w-4 inline mr-2" />
          Weekly Schedule
        </button>
        <button
          onClick={() => setActiveTab('blocked')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'blocked'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Ban className="h-4 w-4 inline mr-2" />
          Blocked Times ({blockedTimes.length})
        </button>
      </div>

      {/* Weekly Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          {schedule && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-3 rounded-lg">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Weekly Hours</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {availabilityService.getTotalWeeklyHours(schedule.slots)}h
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 p-3 rounded-lg">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Active Time Slots</p>
                      <p className="text-2xl font-bold text-green-600">
                        {schedule.slots.filter(s => s.is_active).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-600 p-3 rounded-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Working Days</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {Object.values(availabilityService.groupSlotsByDay(schedule.slots)).filter(slots => slots.length > 0).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Weekly Schedule Grid */}
          {slotsByDay && (
            <div className="space-y-3">
              {allDays.map((day) => {
                const daySlots = slotsByDay[day];
                const isAddingToThisDay = addingNewSlot === day;
                const hasSlots = daySlots.length > 0;

                return (
                  <Card key={day} className={`overflow-hidden transition-all hover:shadow-md ${hasSlots ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'}`}>
                    <CardContent className="p-0">
                      {/* Day Header */}
                      <div className={`px-4 py-3 border-b flex items-center justify-between ${hasSlots ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${hasSlots ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                            {availabilityService.getDayName(day).substring(0, 1)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {availabilityService.getDayName(day)}
                            </h3>
                            <p className="text-xs text-gray-600">
                              {daySlots.length === 0 ? 'No availability' : `${daySlots.length} time ${daySlots.length === 1 ? 'slot' : 'slots'}`}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={hasSlots ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => {
                            setAddingNewSlot(day);
                            setSlotForm(prev => ({ ...prev, day_of_week: day }));
                          }}
                          disabled={saving || isAddingToThisDay}
                          className={hasSlots ? '' : 'bg-blue-600 hover:bg-blue-700 text-white'}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Slot
                        </Button>
                      </div>

                      {/* Slots List */}
                      <div className="p-4 space-y-3">
                        {daySlots.length === 0 && !isAddingToThisDay && (
                          <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                              <Clock className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium">No availability set</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Add a time slot to make yourself available on {availabilityService.getDayName(day)}s
                            </p>
                          </div>
                        )}

                        {daySlots.map((slot, index) => (
                          <div
                            key={slot.id}
                            className="group relative flex items-center justify-between p-4 bg-white border-2 border-blue-100 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                                <Clock className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-gray-900">
                                  {availabilityService.formatTime(slot.start_time)} - {availabilityService.formatTime(slot.end_time)}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {slot.slot_interval_minutes} min intervals
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    Slot #{index + 1}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmDelete({ type: 'slot', id: slot.id! })}
                              disabled={saving}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}

                        {/* Add New Slot Form */}
                        {isAddingToThisDay && (
                          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-md">
                            <CardContent className="p-5 space-y-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-5 w-5 text-blue-600" />
                                <h4 className="font-semibold text-gray-900">Add New Time Slot</h4>
                              </div>
                              
                              <div className="bg-white rounded-lg p-4 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      Start Time
                                    </label>
                                    <div className="relative">
                                      <input
                                        type="time"
                                        value={slotForm.start_time}
                                        onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="09:00"
                                      />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">e.g., 09:00 AM</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      End Time
                                    </label>
                                    <div className="relative">
                                      <input
                                        type="time"
                                        value={slotForm.end_time}
                                        onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="17:00"
                                      />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">e.g., 05:00 PM</p>
                                  </div>
                                </div>
                                
                                {slotForm.start_time && slotForm.end_time && (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-sm text-blue-800">
                                      <Info className="h-4 w-4 inline mr-1" />
                                      Duration: {(() => {
                                        const [startH, startM] = slotForm.start_time.split(':').map(Number);
                                        const [endH, endM] = slotForm.end_time.split(':').map(Number);
                                        const startMins = startH * 60 + startM;
                                        const endMins = endH * 60 + endM;
                                        const diffMins = endMins - startMins;
                                        const hours = Math.floor(diffMins / 60);
                                        const mins = diffMins % 60;
                                        return diffMins > 0 ? `${hours}h ${mins}m` : 'Invalid time range';
                                      })()}
                                    </p>
                                  </div>
                                )}
                                
                                {/* Quick Presets */}
                                <div className="border-t pt-3">
                                  <p className="text-xs font-medium text-gray-600 mb-2">Quick Presets:</p>
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setSlotForm({ ...slotForm, start_time: '09:00', end_time: '12:00' })}
                                      className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-blue-400 transition"
                                    >
                                      Morning (9-12)
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSlotForm({ ...slotForm, start_time: '13:00', end_time: '17:00' })}
                                      className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-blue-400 transition"
                                    >
                                      Afternoon (1-5)
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSlotForm({ ...slotForm, start_time: '09:00', end_time: '17:00' })}
                                      className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-blue-400 transition"
                                    >
                                      Full Day (9-5)
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white rounded-lg p-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Booking Interval
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                  {[15, 30, 60].map((interval) => (
                                    <button
                                      key={interval}
                                      type="button"
                                      onClick={() => setSlotForm({ ...slotForm, slot_interval_minutes: interval })}
                                      className={`px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all ${
                                        slotForm.slot_interval_minutes === interval
                                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                                          : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                                      }`}
                                    >
                                      {interval} min
                                    </button>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                  <Info className="h-3 w-3 inline mr-1" />
                                  How often clients can book appointments during this time
                                </p>
                              </div>

                              <div className="flex gap-3 pt-2">
                                <Button
                                  variant="default"
                                  onClick={() => handleCreateSlot(day)}
                                  disabled={saving || !slotForm.start_time || !slotForm.end_time}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-3"
                                >
                                  {saving ? (
                                    <>
                                      <Loader className="h-4 w-4 animate-spin mr-2" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4 mr-2" />
                                      Save Time Slot
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setAddingNewSlot(null)}
                                  disabled={saving}
                                  className="px-6"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Blocked Times Tab */}
      {activeTab === 'blocked' && (
        <div className="space-y-6">
          {/* Add Blocked Time Button */}
          {!addingBlockedTime && (
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-500 p-3 rounded-lg">
                      <Ban className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Block Time Off</h3>
                      <p className="text-sm text-gray-600 mt-1">Add holidays, vacations, or other unavailable periods</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setAddingBlockedTime(true)} 
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Blocked Time
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Blocked Time Form */}
          {addingBlockedTime && (
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-500 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Add Blocked Time Period</h3>
                  </div>
                  <button 
                    onClick={() => setAddingBlockedTime(false)} 
                    disabled={saving}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="bg-white rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        Start Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={blockedTimeForm.start_datetime}
                        onChange={(e) => setBlockedTimeForm({ ...blockedTimeForm, start_datetime: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        End Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={blockedTimeForm.end_datetime}
                        onChange={(e) => setBlockedTimeForm({ ...blockedTimeForm, end_datetime: e.target.value })}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      Reason (Optional)
                    </label>
                    <input
                      type="text"
                      value={blockedTimeForm.reason}
                      onChange={(e) => setBlockedTimeForm({ ...blockedTimeForm, reason: e.target.value })}
                      placeholder="e.g., Christmas Holiday, Personal Vacation, Conference"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={handleCreateBlockedTime} 
                    disabled={saving} 
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3"
                  >
                    {saving ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Blocked Time
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setAddingBlockedTime(false)} 
                    disabled={saving}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Blocked Times List */}
          {blockedTimes.length === 0 && !addingBlockedTime ? (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                  <Calendar className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No blocked times yet</h3>
                <p className="text-gray-600 mb-4 max-w-md mx-auto">
                  Block off time periods when you're unavailable for consultations, such as holidays, vacations, or personal time off.
                </p>
                <Button 
                  onClick={() => setAddingBlockedTime(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Blocked Time
                </Button>
              </CardContent>
            </Card>
          ) : blockedTimes.length > 0 ? (
            <div className="space-y-4">
              {blockedTimes.map((blocked) => {
                const startDate = new Date(blocked.start_datetime);
                const endDate = new Date(blocked.end_datetime);
                const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                const isUpcoming = startDate > new Date();
                const isActive = startDate <= new Date() && endDate >= new Date();
                
                return (
                  <Card key={blocked.id} className={`overflow-hidden border-2 transition-all hover:shadow-lg ${
                    isActive ? 'border-red-300 bg-red-50' : 
                    isUpcoming ? 'border-yellow-300 bg-yellow-50/30' : 
                    'border-gray-300 bg-gray-50/30 opacity-75'
                  }`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-3 rounded-lg ${
                              isActive ? 'bg-red-500' :
                              isUpcoming ? 'bg-yellow-500' :
                              'bg-gray-400'
                            }`}>
                              <Ban className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                {blocked.reason || 'Time Off'}
                              </h4>
                              {isActive && (
                                <Badge className="bg-red-600 text-white mt-1">
                                  Active Now
                                </Badge>
                              )}
                              {isUpcoming && (
                                <Badge className="bg-yellow-600 text-white mt-1">
                                  Upcoming
                                </Badge>
                              )}
                              {!isActive && !isUpcoming && (
                                <Badge variant="outline" className="mt-1">
                                  Past
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 space-y-2">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">START</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {startDate.toLocaleDateString('en-US', { 
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {startDate.toLocaleTimeString('en-US', { 
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">END</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {endDate.toLocaleDateString('en-US', { 
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {endDate.toLocaleTimeString('en-US', { 
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="pt-2 border-t">
                              <p className="text-xs text-gray-500">
                                <Clock className="h-3 w-3 inline mr-1" />
                                Duration: {durationDays} {durationDays === 1 ? 'day' : 'days'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDelete({ type: 'blocked', id: blocked.id! })}
                          disabled={saving}
                          className="hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : null}
        </div>
      )}
    </div>
    
    {/* Delete Confirmation Modal - Render at root level */}
    {confirmDelete && (
      <div 
        className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4 bg-black/40" 
        style={{ position: 'fixed', inset: 0, margin: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget && !saving) {
            setConfirmDelete(null);
          }
        }}
      >
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in border-2 border-gray-200">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirm Deletion
                </h3>
                <p className="text-sm text-gray-600">
                  {confirmDelete.type === 'slot' 
                    ? 'Are you sure you want to delete this availability slot? This action cannot be undone.' 
                    : 'Are you sure you want to remove this blocked time? This action cannot be undone.'}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(null)}
                disabled={saving}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (confirmDelete.type === 'slot') {
                    handleDeleteSlot(confirmDelete.id);
                  } else {
                    handleDeleteBlockedTime(confirmDelete.id);
                  }
                }}
                disabled={saving}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {saving ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
