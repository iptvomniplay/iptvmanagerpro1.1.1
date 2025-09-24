
'use client';

import * as React from 'react';
import { useData } from '@/hooks/use-data';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { PlusCircle, Star, Trash2, Printer } from 'lucide-react';
import { NoteModal } from '../components/note-modal';
import { NoteCard } from '../components/note-card';
import type { Note } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { NotePrintModal } from '../components/note-print-modal';
import AppLayout from '@/components/layout/app-layout';

function NotepadPageContent() {
  const { t } = useLanguage();
  const { notes, addNote, updateNote, deleteNote, setNotes } = useData();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingNote, setEditingNote] = React.useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = React.useState<Note | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = React.useState(false);

  const handleOpenModal = (note: Note | null = null) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt'>, id?: string) => {
    if (id) {
      const existingNote = notes.find(n => n.id === id);
      if (existingNote) {
        updateNote({ ...existingNote, ...noteData });
      }
    } else {
      addNote(noteData);
    }
    setIsModalOpen(false);
  };
  
  const handleDeleteRequest = (note: Note) => {
    setNoteToDelete(note);
  };

  const handleDeleteConfirm = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete.id);
      setNoteToDelete(null);
    }
  };
  
  const toggleFavorite = (note: Note) => {
    updateNote({ ...note, favorite: !note.favorite });
  };
  
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('notepad')}</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {t('notepadDescription')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsPrintModalOpen(true)} variant="outline" size="lg" disabled={notes.length === 0}>
                <Printer className="mr-2 h-5 w-5" />
                {t('printNotes')}
            </Button>
            <Button onClick={() => handleOpenModal()} size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              {t('createNote')}
            </Button>
          </div>
        </div>

        {sortedNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedNotes.map((note) => (
              <NoteCard 
                key={note.id} 
                note={note} 
                onEdit={() => handleOpenModal(note)}
                onDelete={() => handleDeleteRequest(note)}
                onToggleFavorite={() => toggleFavorite(note)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">{t('noNotesYet')}</h3>
            <p className="text-muted-foreground mt-2">{t('noNotesYetDescription')}</p>
          </div>
        )}
      </div>

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
        note={editingNote}
      />
      
      <NotePrintModal 
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        notes={sortedNotes}
      />
      
      <AlertDialog open={!!noteToDelete} onOpenChange={(isOpen) => !isOpen && setNoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteNoteWarning')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>{t('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function NotepadPage() {
    return (
        <AppLayout>
            <NotepadPageContent />
        </AppLayout>
    );
}
