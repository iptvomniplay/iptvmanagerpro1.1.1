'use client';

import * as React from 'react';
import { useData } from '@/hooks/use-data';
import type { Client } from '@/lib/types';
import { normalizeString } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface ClientSearchProps {
  onSelectClient: (client: Client | null) => void;
  selectedClient: Client | null;
}

export function ClientSearch({ onSelectClient, selectedClient }: ClientSearchProps) {
  const { t } = useLanguage();
  const { clients } = useData();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Client[]>([]);
  const [isFocused, setIsFocused] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    const normalizedTerm = normalizeString(searchTerm);
    const numericTerm = searchTerm.replace(/\D/g, '');

    const results = clients.filter((client) => {
      if (selectedClient && String(client.id) === String(selectedClient.id)) return false;

      const nameMatch = normalizeString(client.name).includes(normalizedTerm);
      const nicknameMatch = client.nickname ? normalizeString(client.nickname).includes(normalizedTerm) : false;
      
      let phoneMatch = false;
      if (numericTerm.length > 0) {
        phoneMatch = client.phones.some((phone) =>
          phone.number.replace(/\D/g, '').includes(numericTerm)
        );
      }
      
      return nameMatch || nicknameMatch || phoneMatch;
    });
    setSearchResults(results);
  }, [searchTerm, clients, selectedClient]);

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
    onSelectClient(client);
    setSearchTerm('');
    setSearchResults([]);
    setIsFocused(false);
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
    <div className="relative w-full" ref={searchRef}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <Search className="h-5 w-5" />
      </div>
      <Input
        placeholder={t('searchClientHere')}
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
                    {client.phones[0]?.number}
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
  );
}
