'use client';

import * as React from 'react';
import { useData } from '@/hooks/use-data';
import type { Client } from '@/lib/types';
import { normalizeString } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, User, X } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';

export function ClientSearch() {
  const { t } = useLanguage();
  const { clients } = useData();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = React.useState<Client[]>([]);
  const [isFocused, setIsFocused] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    const normalizedTerm = normalizeString(searchTerm);
    const results = clients.filter((client) => {
      const isAlreadySelected = selectedClients.some(
        (selected) => selected.id === client.id
      );
      if (isAlreadySelected) return false;

      const phoneMatch = client.phones.some((phone) =>
        normalizeString(phone.number)
          .replace(/\D/g, '')
          .includes(normalizedTerm.replace(/\D/g, ''))
      );
      return (
        normalizeString(client.name).includes(normalizedTerm) ||
        (client.nickname && normalizeString(client.nickname).includes(normalizedTerm)) ||
        phoneMatch
      );
    });
    setSearchResults(results);
  }, [searchTerm, clients, selectedClients]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectClient = (client: Client) => {
    setSelectedClients((prev) => [...prev, client]);
    setSearchTerm('');
    setSearchResults([]);
    setIsFocused(false);
  };

  const handleRemoveClient = (clientId: string) => {
    setSelectedClients((prev) => prev.filter((client) => client.id !== clientId));
  };

  const getStatusVariant = (status: Client['status']) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'inactive';
      case 'Expired':
        return 'destructive';
      case 'Test':
        return 'warning';
      default:
        return 'outline';
    }
  };

  const showResults = isFocused && searchResults.length > 0;

  return (
    <div className="w-full md:w-1/2 space-y-4">
      <div className="relative" ref={searchRef}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="h-5 w-5" />
        </div>
        <Input
          placeholder="Ache seu cliente aqui"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="pl-10"
          autoComplete="off"
        />

        {showResults && (
          <Card className="absolute top-full mt-2 w-full z-10 max-h-80 overflow-y-auto">
            <CardContent className="p-2">
              {searchResults.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => handleSelectClient(client)}
                >
                  <div className="flex flex-col">
                    <p className="font-semibold">{client.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ID: {client.status === 'Active' ? client.id : 'N/A'}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(client.status)}>
                    {t(client.status.toLowerCase() as any)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {selectedClients.length > 0 && (
        <div className="space-y-4">
          {selectedClients.map((client) => (
            <Card key={client.id} className="relative bg-muted/30">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => handleRemoveClient(client.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardHeader>
                <CardTitle className="flex items-center gap-4">
                  <User className="h-6 w-6" />
                  <span>{client.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-20 text-sm text-muted-foreground">
                    {t('nickname')}
                  </span>
                  <Input value={client.nickname || '---'} readOnly />
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-20 text-sm text-muted-foreground">
                    {t('status')}
                  </span>
                   <Badge variant={getStatusVariant(client.status)} className="text-base">
                      {t(client.status.toLowerCase() as any)}
                    </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-20 text-sm text-muted-foreground">
                    {t('clientID')}
                  </span>
                  <Input value={client.status === 'Active' ? client.id : 'N/A'} readOnly />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
