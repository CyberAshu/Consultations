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
  const [selectedTimezone, setSelectedTimezone] = useState<string>('America/Toronto');
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
      
      setSelectedTimezone(scheduleData.timezone || 'America/Toronto');
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
        timezone: selectedTimezone,
        slot_interval_minutes: slotForm.slot_interval_minutes,
      };

      await availabilityService.createAvailabilitySlot(newSlot);
      setSuccessMessage('Availability slot added successfully!');
      setAddingNewSlot(null);
      await fetchData();
      onScheduleUpdated?.();
    } catch (err: any) {
      setError(err.message || 'Failed to create slot');
    } finally {
      setSaving(false);
    }
  };

  // Handle slot deletion
  const handleDeleteSlot = async (slotId: number) => {
    if (!window.confirm('Are you sure you want to delete this availability slot?')) return;

    setSaving(true);
    setError(null);
    try {
      await availabilityService.deleteAvailabilitySlot(slotId);
      setSuccessMessage('Availability slot deleted successfully!');
      await fetchData();
      onScheduleUpdated?.();
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
      await availabilityService.createBlockedTime({
        start_datetime: new Date(blockedTimeForm.start_datetime).toISOString(),
        end_datetime: new Date(blockedTimeForm.end_datetime).toISOString(),
        reason: blockedTimeForm.reason || 'Unavailable',
      });
      setSuccessMessage('Blocked time added successfully!');
      setAddingBlockedTime(false);
      setBlockedTimeForm({ start_datetime: '', end_datetime: '', reason: '' });
      await fetchData();
      onScheduleUpdated?.();
    } catch (err: any) {
      setError(err.message || 'Failed to create blocked time');
    } finally {
      setSaving(false);
    }
  };

  // Handle blocked time deletion
  const handleDeleteBlockedTime = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this blocked time?')) return;

    setSaving(true);
    setError(null);
    try {
      await availabilityService.deleteBlockedTime(id);
      setSuccessMessage('Blocked time removed successfully!');
      await fetchData();
      onScheduleUpdated?.();
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
          <Badge variant="outline" className="text-sm">
            <Globe className="h-4 w-4 mr-1" />
            {schedule.timezone}
          </Badge>
        )}
      </div>

      {/* Timezone Selector */}
      <Card>
        <CardContent className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="h-4 w-4 inline mr-2" />
            Your Timezone
          </label>
          <select
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label} ({tz.offset})
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-2">
            <Info className="h-4 w-4 inline mr-1" />
            All times will be shown in this timezone. Clients will see slots converted to their timezone.
          </p>
        </CardContent>
      </Card>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-green-800 font-medium">Success</p>
            <p className="text-green-600 text-sm">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-green-600 hover:text-green-800">
            <X className="h-5 w-5" />
          </button>
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
        <div className="space-y-4">
          {/* Summary Stats */}
          {schedule && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Weekly Availability</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {availabilityService.getTotalWeeklyHours(schedule.slots)} hours
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Active Slots</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {schedule.slots.filter(s => s.is_active).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weekly Schedule Grid */}
          {slotsByDay && (
            <div className="space-y-3">
              {allDays.map((day) => {
                const daySlots = slotsByDay[day];
                const isAddingToThisDay = addingNewSlot === day;

                return (
                  <Card key={day} className="overflow-hidden">
                    <CardContent className="p-0">
                      {/* Day Header */}
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {availabilityService.getDayName(day)}
                          </h3>
                          <Badge variant={daySlots.length > 0 ? 'default' : 'outline'}>
                            {daySlots.length} {daySlots.length === 1 ? 'slot' : 'slots'}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAddingNewSlot(day);
                            setSlotForm(prev => ({ ...prev, day_of_week: day }));
                          }}
                          disabled={saving || isAddingToThisDay}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Slot
                        </Button>
                      </div>

                      {/* Slots List */}
                      <div className="p-4 space-y-3">
                        {daySlots.length === 0 && !isAddingToThisDay && (
                          <p className="text-gray-500 text-sm text-center py-4">
                            No availability set for this day. Click "Add Slot" to add one.
                          </p>
                        )}

                        {daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <Clock className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {availabilityService.formatTime(slot.start_time)} -{' '}
                                  {availabilityService.formatTime(slot.end_time)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {slot.slot_interval_minutes} min intervals
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSlot(slot.id!)}
                                disabled={saving}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        {/* Add New Slot Form */}
                        {isAddingToThisDay && (
                          <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-4 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Time
                                  </label>
                                  <input
                                    type="time"
                                    value={slotForm.start_time}
                                    onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Time
                                  </label>
                                  <input
                                    type="time"
                                    value={slotForm.end_time}
                                    onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Slot Interval
                                </label>
                                <select
                                  value={slotForm.slot_interval_minutes}
                                  onChange={(e) =>
                                    setSlotForm({ ...slotForm, slot_interval_minutes: parseInt(e.target.value) })
                                  }
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value={15}>15 minutes</option>
                                  <option value={30}>30 minutes</option>
                                  <option value={60}>60 minutes</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                  How often clients can book a starting time
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  variant="default"
                                  onClick={() => handleCreateSlot(day)}
                                  disabled={saving}
                                  className="flex-1"
                                >
                                  {saving ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                  Save Slot
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setAddingNewSlot(null)}
                                  disabled={saving}
                                >
                                  <X className="h-4 w-4" />
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
        <div className="space-y-4">
          {/* Add Blocked Time Button */}
          {!addingBlockedTime && (
            <Button onClick={() => setAddingBlockedTime(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Blocked Time (Holiday/Vacation)
            </Button>
          )}

          {/* Add Blocked Time Form */}
          {addingBlockedTime && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Add Blocked Time</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={blockedTimeForm.start_datetime}
                      onChange={(e) => setBlockedTimeForm({ ...blockedTimeForm, start_datetime: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={blockedTimeForm.end_datetime}
                      onChange={(e) => setBlockedTimeForm({ ...blockedTimeForm, end_datetime: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
                  <input
                    type="text"
                    value={blockedTimeForm.reason}
                    onChange={(e) => setBlockedTimeForm({ ...blockedTimeForm, reason: e.target.value })}
                    placeholder="e.g., Christmas Holiday, Vacation, Conference"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="default" onClick={handleCreateBlockedTime} disabled={saving} className="flex-1">
                    {saving ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Blocked Time
                  </Button>
                  <Button variant="outline" onClick={() => setAddingBlockedTime(false)} disabled={saving}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Blocked Times List */}
          {blockedTimes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Ban className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No blocked times set</p>
                <p className="text-sm text-gray-500 mt-1">
                  Add holidays, vacations, or other unavailable periods
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {blockedTimes.map((blocked) => (
                <Card key={blocked.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Ban className="h-5 w-5 text-red-600" />
                          <h4 className="font-semibold text-gray-900">
                            {blocked.reason || 'Unavailable'}
                          </h4>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <strong>From:</strong> {new Date(blocked.start_datetime).toLocaleString()}
                          </p>
                          <p>
                            <strong>To:</strong> {new Date(blocked.end_datetime).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBlockedTime(blocked.id!)}
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
