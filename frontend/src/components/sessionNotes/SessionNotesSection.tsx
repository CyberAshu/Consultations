import React from 'react';
import { Button } from '../shared/Button';
import { Badge } from '../ui/Badge';
import { Plus, Share2, Edit3, Trash2, Clock, User, MessageSquare } from 'lucide-react';
import { SessionNote, CreateSessionNoteRequest, ShareNotesRequest } from '../../services/types';
import { sessionNotesService } from '../../services/sessionNotesService';

interface SessionNotesSectionProps {
  bookingId: number;
  currentUserRole: string;
  isClientView?: boolean;
}

export function SessionNotesSection({ 
  bookingId, 
  currentUserRole, 
  isClientView = false 
}: SessionNotesSectionProps) {
  const [sessionNotes, setSessionNotes] = React.useState<SessionNote[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddNoteForm, setShowAddNoteForm] = React.useState(false);
  const [newNote, setNewNote] = React.useState('');
  const [newNoteType, setNewNoteType] = React.useState('session_note');
  const [editingNote, setEditingNote] = React.useState<SessionNote | null>(null);
  const [selectedNotes, setSelectedNotes] = React.useState<number[]>([]);
  const [shareModalOpen, setShareModalOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [noteToDelete, setNoteToDelete] = React.useState<number | null>(null);

  // Load session notes on component mount
  React.useEffect(() => {
    loadSessionNotes();
  }, [bookingId]);

  const loadSessionNotes = async () => {
    try {
      setLoading(true);
      const notes = await sessionNotesService.getBookingSessionNotes(bookingId);
      setSessionNotes(notes);
    } catch (error) {
      console.error('Failed to load session notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const noteData: CreateSessionNoteRequest = {
        content: newNote.trim(),
        note_type: newNoteType,
        is_shared_with_client: false
      };

      const createdNote = await sessionNotesService.createSessionNote(bookingId, noteData);
      setSessionNotes(prev => [createdNote, ...prev]);
      setNewNote('');
      setShowAddNoteForm(false);
    } catch (error) {
      console.error('Failed to create session note:', error);
      alert('Failed to create session note. Please try again.');
    }
  };

  const handleUpdateNote = async (noteId: number, content: string) => {
    try {
      const updatedNote = await sessionNotesService.updateSessionNote(noteId, { content });
      setSessionNotes(prev => 
        prev.map(note => note.id === noteId ? updatedNote : note)
      );
      setEditingNote(null);
    } catch (error) {
      console.error('Failed to update session note:', error);
      alert('Failed to update session note. Please try again.');
    }
  };

  const handleDeleteNote = (noteId: number) => {
    setNoteToDelete(noteId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      await sessionNotesService.deleteSessionNote(noteToDelete);
      setSessionNotes(prev => prev.filter(note => note.id !== noteToDelete));
      setDeleteConfirmOpen(false);
      setNoteToDelete(null);
    } catch (error) {
      console.error('Failed to delete session note:', error);
      alert('Failed to delete session note. Please try again.');
    }
  };

  const handleShareNotes = async (noteIds: number[], sendEmail: boolean = true) => {
    try {
      const shareData: ShareNotesRequest = {
        note_ids: noteIds,
        send_email: sendEmail
      };

      await sessionNotesService.shareSessionNotes(bookingId, shareData);
      
      // Refresh notes to get updated sharing status
      await loadSessionNotes();
      setSelectedNotes([]);
      setShareModalOpen(false);
      
      alert(`Successfully shared ${noteIds.length} note(s) with the client.`);
    } catch (error) {
      console.error('Failed to share session notes:', error);
      alert('Failed to share session notes. Please try again.');
    }
  };

  const canAddNotes = currentUserRole === 'rcic' && !isClientView;
  const canManageNotes = currentUserRole === 'rcic' && !isClientView;

  if (loading) {
    return (
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mt-6 border rounded-xl p-4 ${
      isClientView ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${
          isClientView ? 'text-blue-900' : 'text-gray-900'
        }`}>
          {isClientView ? 'Consultant Notes' : 'Session Notes'}
        </h3>
        
        {canAddNotes && (
          <div className="flex gap-2">
            {selectedNotes.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShareModalOpen(true)}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share ({selectedNotes.length})
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setShowAddNoteForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          </div>
        )}
      </div>

      {/* Add Note Form */}
      {showAddNoteForm && canAddNotes && (
        <div className="mb-6 bg-white rounded-lg border p-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note Type
            </label>
            <select
              value={newNoteType}
              onChange={(e) => setNewNoteType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="session_note">Session Note</option>
              <option value="consultation_summary">Consultation Summary</option>
              <option value="action_items">Action Items</option>
              <option value="recommendations">Recommendations</option>
              <option value="follow_up">Follow-up Note</option>
            </select>
          </div>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add your session notes here..."
            className="w-full border border-gray-300 rounded-md p-3 text-sm min-h-[100px] mb-3"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
              Save Note
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                setShowAddNoteForm(false);
                setNewNote('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {sessionNotes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">
            {isClientView 
              ? 'No notes have been shared with you yet.' 
              : 'No session notes yet. Add your first note above.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessionNotes.map((note) => {
            const visibility = sessionNotesService.getNoteVisibilityStatus(note);
            const isEditing = editingNote?.id === note.id;
            
            return (
              <div
                key={note.id}
                className={`bg-white rounded-lg border p-4 ${
                  selectedNotes.includes(note.id) ? 'ring-2 ring-emerald-200 border-emerald-300' : ''
                }`}
              >
                {/* Note Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {canManageNotes && (
                      <input
                        type="checkbox"
                        checked={selectedNotes.includes(note.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedNotes(prev => [...prev, note.id]);
                          } else {
                            setSelectedNotes(prev => prev.filter(id => id !== note.id));
                          }
                        }}
                        className="h-4 w-4 text-emerald-600 rounded"
                      />
                    )}
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="text-xs px-2 py-1 bg-gray-100 text-gray-700">
                          {sessionNotesService.getNoteTypeDisplayName(note.note_type)}
                        </Badge>
                        <Badge className={`text-xs px-2 py-1 ${visibility.statusClass}`}>
                          {visibility.status === 'shared' ? 'Shared' : 'Private'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {note.consultant_name && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {note.consultant_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {note.time_ago || new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {canManageNotes && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingNote(note)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteNote(note.id)}
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Note Content */}
                {isEditing ? (
                  <div className="mt-3">
                    <textarea
                      defaultValue={note.content}
                      className="w-full border border-gray-300 rounded-md p-3 text-sm min-h-[80px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setEditingNote(null);
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value.trim() !== note.content) {
                          handleUpdateNote(note.id, e.target.value.trim());
                        } else {
                          setEditingNote(null);
                        }
                      }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <div 
                    className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: sessionNotesService.formatNoteContent(note.content)
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Share Session Notes
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Share {selectedNotes.length} selected note(s) with the client? 
              An email notification will be sent to inform them of the new notes.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShareModalOpen(false);
                  setSelectedNotes([]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleShareNotes(selectedNotes, true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Share Notes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Session Note
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this session note? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setNoteToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteNote}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {isClientView && sessionNotes.length > 0 && (
        <p className="text-xs text-blue-600 mt-4">
          These are notes from your consultant about your sessions. 
          You can refer to these for follow-up actions or questions.
        </p>
      )}
    </div>
  );
}
