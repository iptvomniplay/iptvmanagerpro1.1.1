'use client';

import * as React from 'react';
import type { Note } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Star, Trash2, Edit, Copy } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface NoteCardProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

export function NoteCard({ note, onEdit, onDelete, onToggleFavorite }: NoteCardProps) {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(note.content);
    toast({
      title: t('textCopied'),
      description: t('textCopiedSuccess'),
    });
  };

  return (
    <Card 
        style={{ '--note-color': note.color, borderColor: note.color } as React.CSSProperties}
        className="flex flex-col h-72 shadow-[0_0_32px_8px_var(--note-color)] transition-all duration-300 hover:shadow-[0_0_40px_10px_var(--note-color)] border-2 cursor-pointer"
        onClick={onEdit}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <CardTitle className="text-lg font-bold break-words">{note.title}</CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          >
            <Star className={cn("h-5 w-5", note.favorite ? "fill-yellow-400 text-yellow-400" : "text-foreground/50")} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                {t('edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                {t('copyText')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                {t('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="prose prose-sm dark:prose-invert max-h-48 overflow-y-auto pr-2">
            <ReactMarkdown>{note.content}</ReactMarkdown>
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <p className="text-xs text-foreground/60">{format(new Date(note.createdAt), 'dd/MM/yyyy HH:mm')}</p>
      </CardFooter>
    </Card>
  );
}