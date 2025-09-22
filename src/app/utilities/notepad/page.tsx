'use client';

import * as React from 'react';
import { useLanguage } from '@/hooks/use-language';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { NoteModal } from '../components/note-modal';
import { ViewNoteModal } from '../components/view-note-modal';
import { DeleteNoteAlert } from '../components/delete-note-alert';
import type { Note } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function NotepadPage() {
  const { t } = useLanguage();
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [isNoteModalOpen, setIsNoteModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [currentNote, setCurrentNote] = React.useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = React.useState<Note | null>(null);

  React.useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('notepad_notes');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error("Failed to load notes from localStorage", error);
      setNotes([]);
    }
  }, []);

  const saveNotesToStorage = (updatedNotes: Note[]) => {
    localStorage.setItem('notepad_notes', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const handleSaveNote = (noteToSave: Omit<Note, 'id'> & { id?: string }) => {
    if (noteToSave.id) {
      // Editing existing note
      const updatedNotes = notes.map((note) =>
        note.id === noteToSave.id ? { ...note, ...noteToSave } : note
      );
      saveNotesToStorage(updatedNotes);
    } else {
      // Creating new note
      const newNote = { ...noteToSave, id: `note_${Date.now()}` };
      saveNotesToStorage([newNote, ...notes]);
    }
    setIsNoteModalOpen(false);
    setCurrentNote(null);
  };

  const handleOpenCreate = () => {
    setCurrentNote(null);
    setIsNoteModalOpen(true);
  };

  const handleOpenEdit = (note: Note) => {
    setCurrentNote(note);
    setIsNoteModalOpen(true);
  };
  
  const handleOpenView = (note: Note) => {
    setCurrentNote(note);
    setIsViewModalOpen(true);
  }

  const handleDeleteRequest = (note: Note) => {
    setNoteToDelete(note);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = () => {
    if (noteToDelete) {
      const updatedNotes = notes.filter((note) => note.id !== noteToDelete.id);
      saveNotesToStorage(updatedNotes);
      setNoteToDelete(null);
      setIsDeleteAlertOpen(false);
    }
  };
  
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  return (
    <>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('notepad')}</CardTitle>
            <CardDescription>{t('notepadDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Button onClick={handleOpenCreate} size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                {t('createNote')}
            </Button>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {notes.map((note) => (
                    <Card 
                        key={note.id} 
                        className={cn(
                            "flex flex-col justify-between cursor-pointer transition-all hover:scale-105 overflow-hidden",
                            "border-b-8"
                        )}
                        style={{ 
                            borderColor: note.color,
                            boxShadow: `0 6px 20px -8px ${note.color}`
                        }}
                        onClick={() => handleOpenView(note)}
                    >
                        <CardContent className="p-4">
                            <p className="text-card-foreground font-medium">
                                {truncateText(note.content, 120)}
                            </p>
                        </CardContent>
                        <div className="flex justify-end p-2 gap-1 border-t">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleOpenEdit(note); }}>
                                <Edit className="h-4 w-4" />
                            </Button>
                             <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteRequest(note); }}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

             {notes.length === 0 && (
                <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                    <p className="text-lg">{t('noNotesYet')}</p>
                    <p>{t('noNotesYetDescription')}</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
        note={currentNote}
      />
      
       {currentNote && (
        <ViewNoteModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          note={currentNote}
        />
      )}
      
      {noteToDelete && (
        <DeleteNoteAlert
            isOpen={isDeleteAlertOpen}
            onClose={() => setIsDeleteAlertOpen(false)}
            onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
