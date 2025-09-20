'use client';

import * as React from 'react';
import { useData } from '@/hooks/use-data';
import type { Client } from '@/lib/types';
import { normalizeString } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, UserRound, Phone } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

type SearchResult = {
  client: Client;
  matchType: 'name' | 'nickname' | 'phone';
  matchValue: string;
};


export function ClientSearch({ onSelectClient, selectedClient }: ClientSearchProps) {
  const { t } = useLanguage();
  const { clients } = useData();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    const normalizedSearchTerm = normalizeString(searchTerm);
    const numericSearchTerm = searchTerm.replace(/\D/g, '');

    const results: SearchResult[] = [];

    clients.forEach((client) => {
        // Match by name
        if (normalizeString(client.name).includes(normalizedSearchTerm)) {
            results.push({ client, matchType: 'name', matchValue: client.name });
            return; // Move to next client once a match is found
        }

        // Match by nickname
        if (client.nickname && normalizeString(client.nickname).includes(normalizedSearchTerm)) {
            results.push({ client, matchType: 'nickname', matchValue: client.nickname });
            return;
        }

        // Match by phone
        if (numericSearchTerm.length > 0) {
            const matchingPhone = client.phones.find((phone) =>
                phone.number.replace(/\D/g, '').includes(numericSearchTerm)
            );
            if (matchingPhone) {
                results.push({ client, matchType: 'phone', matchValue: matchingPhone.number });
            }
        }
    });

    setSearchResults(results);
  }, [searchTerm, clients]);

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
            {searchResults.map(({ client, matchType, matchValue }) => (
              <div
                key={client._tempId}
                className="flex items-center justify-between p-3 rounded-md hover:bg-accent cursor-pointer"
                onClick={() => handleSelectClient(client)}
              >
                <div className="flex flex-col">
                  <p className="font-semibold">{client.name}</p>
                   {matchType !== 'name' && (
                     <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        {matchType === 'nickname' && <UserRound className="h-3 w-3" />}
                        {matchType === 'phone' && <Phone className="h-3 w-3" />}
                        <span>{matchValue}</span>
                     </div>
                   )}
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