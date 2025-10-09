import { apiGet, apiPost, apiPut, apiDelete } from './api';

// ============================================================
// Types for Availability System
// ============================================================

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface AvailabilitySlot {
  id?: number;
  consultant_id?: number;
  day_of_week: DayOfWeek;
  start_time: string; // HH:MM:SS format
  end_time: string;   // HH:MM:SS format
  timezone: string;   // IANA timezone string
  slot_interval_minutes: number; // 15, 30, or 60
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AvailabilitySlotCreate {
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  timezone: string;
  slot_interval_minutes: number;
}

export interface AvailabilitySlotUpdate {
  start_time?: string;
  end_time?: string;
  timezone?: string;
  slot_interval_minutes?: number;
  is_active?: boolean;
}

export interface WeeklySchedule {
  consultant_id: number;
  timezone: string;
  slots: AvailabilitySlot[];
}

export interface WeeklyScheduleCreate {
  slots: AvailabilitySlotCreate[];
}

export interface BlockedTime {
  id?: number;
  consultant_id?: number;
  start_datetime: string; // ISO datetime string
  end_datetime: string;   // ISO datetime string
  reason?: string;
  created_at?: string;
}

export interface BlockedTimeCreate {
  start_datetime: string;
  end_datetime: string;
  reason?: string;
}

export interface BlockedTimeUpdate {
  start_datetime?: string;
  end_datetime?: string;
  reason?: string;
}

export interface AvailableTimeSlot {
  start: string; // ISO datetime in client timezone
  end: string;   // ISO datetime in client timezone
  start_consultant_tz: string; // ISO datetime in consultant timezone
  consultant_timezone: string;
  available: boolean;
}

export interface AvailableTimeSlotsResponse {
  date: string; // YYYY-MM-DD
  consultant_id: number;
  consultant_timezone: string;
  client_timezone: string;
  slots: AvailableTimeSlot[];
  total_slots: number;
}

export interface TimezoneInfo {
  value: string;  // IANA timezone ID
  label: string;  // Human-readable label
  offset: string; // UTC offset (e.g., "UTC-5")
}

export interface TimezoneOffsetInfo {
  from_timezone: string;
  to_timezone: string;
  offset_hours: number;
  description: string;
}

// ============================================================
// Availability Service
// ============================================================

class AvailabilityService {
  // ============================================================
  // RCIC Endpoints - Manage Own Availability
  // ============================================================

  /**
   * Get RCIC's complete weekly schedule
   */
  async getMySchedule(): Promise<WeeklySchedule> {
    return apiGet<WeeklySchedule>('/availability/my-schedule');
  }

  /**
   * Create a new availability slot
   */
  async createAvailabilitySlot(slot: AvailabilitySlotCreate): Promise<AvailabilitySlot> {
    return apiPost<AvailabilitySlot>('/availability/my-schedule/slots', slot);
  }

  /**
   * Update an availability slot
   */
  async updateAvailabilitySlot(slotId: number, update: AvailabilitySlotUpdate): Promise<AvailabilitySlot> {
    return apiPut<AvailabilitySlot>(`/availability/my-schedule/slots/${slotId}`, update);
  }

  /**
   * Delete an availability slot
   */
  async deleteAvailabilitySlot(slotId: number): Promise<{ status: string; message: string }> {
    return apiDelete<{ status: string; message: string }>(`/availability/my-schedule/slots/${slotId}`);
  }

  /**
   * Replace entire weekly schedule at once (bulk update)
   */
  async replaceWeeklySchedule(schedule: WeeklyScheduleCreate): Promise<WeeklySchedule> {
    return apiPost<WeeklySchedule>('/availability/my-schedule/replace', schedule);
  }

  /**
   * Get RCIC's blocked times (holidays/vacations)
   */
  async getMyBlockedTimes(): Promise<BlockedTime[]> {
    return apiGet<BlockedTime[]>('/availability/my-schedule/blocked');
  }

  /**
   * Create a blocked time
   */
  async createBlockedTime(blockedTime: BlockedTimeCreate): Promise<BlockedTime> {
    return apiPost<BlockedTime>('/availability/my-schedule/blocked', blockedTime);
  }

  /**
   * Update a blocked time
   */
  async updateBlockedTime(blockedTimeId: number, update: BlockedTimeUpdate): Promise<BlockedTime> {
    return apiPut<BlockedTime>(`/availability/my-schedule/blocked/${blockedTimeId}`, update);
  }

  /**
   * Delete a blocked time
   */
  async deleteBlockedTime(blockedTimeId: number): Promise<{ status: string; message: string }> {
    return apiDelete<{ status: string; message: string }>(`/availability/my-schedule/blocked/${blockedTimeId}`);
  }

  // ============================================================
  // Public Endpoints - Client Booking
  // ============================================================

  /**
   * Get available time slots for a consultant on a specific date
   * This is the main endpoint for client booking flow
   */
  async getAvailableSlots(
    consultantId: number,
    date: string, // YYYY-MM-DD
    clientTimezone: string,
    serviceId?: number,
    durationMinutes?: number
  ): Promise<AvailableTimeSlotsResponse> {
    const params: Record<string, any> = {
      date,
      client_timezone: clientTimezone,
    };
    
    if (serviceId) {
      params.service_id = serviceId;
    }
    
    if (durationMinutes) {
      params.duration_minutes = durationMinutes;
    }
    
    return apiGet<AvailableTimeSlotsResponse>(
      `/availability/consultants/${consultantId}/slots`,
      params
    );
  }

  /**
   * Get consultant's weekly schedule (public view)
   */
  async getConsultantSchedule(consultantId: number): Promise<WeeklySchedule> {
    return apiGet<WeeklySchedule>(`/availability/consultants/${consultantId}/schedule`);
  }

  // ============================================================
  // Utility Endpoints
  // ============================================================

  /**
   * Get list of common timezones (Canada & India)
   */
  async getCommonTimezones(): Promise<TimezoneInfo[]> {
    return apiGet<TimezoneInfo[]>('/availability/timezones');
  }

  /**
   * Get all supported timezones (600+ IANA timezones)
   */
  async getAllTimezones(): Promise<TimezoneInfo[]> {
    return apiGet<TimezoneInfo[]>('/availability/timezones?all=true');
  }

  /**
   * Get timezone offset information between two timezones
   */
  async getTimezoneOffset(fromTimezone: string, toTimezone: string): Promise<TimezoneOffsetInfo> {
    return apiGet<TimezoneOffsetInfo>('/availability/timezone-offset', {
      from_timezone: fromTimezone,
      to_timezone: toTimezone,
    });
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  /**
   * Format time from HH:MM:SS to HH:MM for display
   */
  formatTime(time: string): string {
    if (!time) return '';
    const parts = time.split(':');
    return `${parts[0]}:${parts[1]}`;
  }

  /**
   * Parse time from HH:MM to HH:MM:SS
   */
  parseTime(time: string): string {
    if (!time) return '';
    if (time.includes(':') && time.split(':').length === 2) {
      return `${time}:00`;
    }
    return time;
  }

  /**
   * Get day name from DayOfWeek enum
   */
  getDayName(day: DayOfWeek): string {
    const dayNames: Record<DayOfWeek, string> = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
    };
    return dayNames[day];
  }

  /**
   * Get all days of week in order
   */
  getAllDays(): DayOfWeek[] {
    return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  }

  /**
   * Group slots by day of week
   */
  groupSlotsByDay(slots: AvailabilitySlot[]): Record<DayOfWeek, AvailabilitySlot[]> {
    const grouped: Record<DayOfWeek, AvailabilitySlot[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };

    slots.forEach(slot => {
      if (slot.is_active) {
        grouped[slot.day_of_week].push(slot);
      }
    });

    // Sort slots by start time within each day
    Object.keys(grouped).forEach(day => {
      grouped[day as DayOfWeek].sort((a, b) => {
        return a.start_time.localeCompare(b.start_time);
      });
    });

    return grouped;
  }

  /**
   * Check if schedule has any slots
   */
  hasAvailability(schedule: WeeklySchedule): boolean {
    return schedule.slots.some(slot => slot.is_active);
  }

  /**
   * Get total hours of availability per week
   */
  getTotalWeeklyHours(slots: AvailabilitySlot[]): number {
    let totalMinutes = 0;
    
    slots.forEach(slot => {
      if (!slot.is_active) return;
      
      const [startHour, startMin] = slot.start_time.split(':').map(Number);
      const [endHour, endMin] = slot.end_time.split(':').map(Number);
      
      const startTotalMin = startHour * 60 + startMin;
      const endTotalMin = endHour * 60 + endMin;
      
      totalMinutes += (endTotalMin - startTotalMin);
    });
    
    return Math.round((totalMinutes / 60) * 10) / 10; // Round to 1 decimal
  }
}

export const availabilityService = new AvailabilityService();
