import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { 
  SessionNote,
  CreateSessionNoteRequest,
  UpdateSessionNoteRequest,
  ShareNotesRequest
} from './types';

class SessionNotesService {
  // Create a new session note
  async createSessionNote(bookingId: number, noteData: CreateSessionNoteRequest): Promise<SessionNote> {
    return apiPost<SessionNote>(`/session-notes/${bookingId}/notes`, noteData);
  }

  // Get all session notes for a booking
  async getBookingSessionNotes(bookingId: number): Promise<SessionNote[]> {
    return apiGet<SessionNote[]>(`/session-notes/${bookingId}/notes`);
  }

  // Update a session note
  async updateSessionNote(noteId: number, updateData: UpdateSessionNoteRequest): Promise<SessionNote> {
    return apiPut<SessionNote>(`/session-notes/notes/${noteId}`, updateData);
  }

  // Delete a session note
  async deleteSessionNote(noteId: number): Promise<{ message: string }> {
    return apiDelete(`/session-notes/notes/${noteId}`);
  }

  // Share session notes with client
  async shareSessionNotes(bookingId: number, shareData: ShareNotesRequest): Promise<{
    success: boolean;
    shared_notes: number;
    message: string;
  }> {
    return apiPost(`/session-notes/${bookingId}/notes/share`, shareData);
  }

  // Get all session notes shared with the current client
  async getClientSessionNotes(limit: number = 50): Promise<SessionNote[]> {
    return apiGet<SessionNote[]>(`/session-notes/client/notes`, { limit });
  }

  // Helper method to format note content for display
  formatNoteContent(content: string): string {
    return content.replace(/\n/g, '<br/>');
  }

  // Helper method to get note type display name
  getNoteTypeDisplayName(noteType: string): string {
    const typeMap: { [key: string]: string } = {
      'session_note': 'Session Note',
      'follow_up': 'Follow-up Note',
      'legacy_meeting_note': 'Meeting Note',
      'consultation_summary': 'Consultation Summary',
      'action_items': 'Action Items',
      'recommendations': 'Recommendations'
    };
    
    return typeMap[noteType] || noteType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Helper method to determine if a note can be edited
  canEditNote(note: SessionNote, currentUserRole: string, currentUserId: string): boolean {
    // Only RCIC consultants can edit notes, and only their own notes
    if (currentUserRole !== 'rcic') return false;
    
    // Check if this RCIC owns this note (would need consultant_id mapping)
    // This is a simplified check - in real implementation you'd need to verify
    // that the current user's consultant profile matches the note's consultant_id
    return true; // Simplified for now
  }

  // Helper method to determine if notes can be shared
  canShareNotes(currentUserRole: string): boolean {
    return currentUserRole === 'rcic';
  }

  // Helper method to group notes by date
  groupNotesByDate(notes: SessionNote[]): { [date: string]: SessionNote[] } {
    return notes.reduce((groups, note) => {
      const date = new Date(note.created_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(note);
      return groups;
    }, {} as { [date: string]: SessionNote[] });
  }

  // Helper method to get note visibility status
  getNoteVisibilityStatus(note: SessionNote): {
    status: 'private' | 'shared';
    statusText: string;
    statusClass: string;
  } {
    if (note.is_shared_with_client) {
      return {
        status: 'shared',
        statusText: note.shared_at ? 
          `Shared with client on ${new Date(note.shared_at).toLocaleDateString()}` : 
          'Shared with client',
        statusClass: 'bg-green-100 text-green-800'
      };
    } else {
      return {
        status: 'private',
        statusText: 'Private note (not shared with client)',
        statusClass: 'bg-yellow-100 text-yellow-800'
      };
    }
  }
}

export const sessionNotesService = new SessionNotesService();
