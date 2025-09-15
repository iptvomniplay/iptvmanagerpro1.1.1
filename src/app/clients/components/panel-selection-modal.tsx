'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { useData } from '@/hooks/use-data';
import type { Server } from '@/lib/types';
import { normalizeString } from '@/lib/utils';
import { Search } from 'lucide-react';

interface PanelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPanel: (panel: Server) => void;
}

export function PanelSelectionModal({ isOpen, onClose, onSelectPanel }: PanelSelectionModalProps) {
  const { t } = useLanguage();
  const { servers } = useData();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredServers = servers.filter((server) =>
    normalizeString(server.name).includes(normalizeString(searchTerm))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('selectPanel')}</DialogTitle>
          <DialogDescription>{t('searchPanelPlaceholder')}</DialogDescription>
        </DialogHeader>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                placeholder={t('searchPanelPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
        </div>
        <ScrollArea className="h-72 rounded-md border">
          <div className="p-4 space-y-2">
            {filteredServers.length > 0 ? (
              filteredServers.map((server) => (
                <div
                  key={server.id}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => onSelectPanel(server)}
                >
                  <div>
                    <p className="font-semibold">{server.name}</p>
                    <p className="text-sm text-muted-foreground">{server.url}</p>
                  </div>
                  <Button variant="outline" size="sm">{t('select')}</Button>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground pt-8">{t('noPanelsFound')}</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
