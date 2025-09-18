'use client';

import * as React from 'react';
import { useData } from '@/hooks/use-data';
import type { Client } from '@/lib/types';
import { normalizeString } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, User, X } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';

export function ClientSearch() {
  const { t } = useLanguage();
  const { clients } = useData();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  const [isFocused, setIsFocused] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (searchTerm.trim() === '' || selectedClient) {
      setSearchResults([]);
      return;
    }

    const normalizedTerm = normalizeString(searchTerm);
    const results = clients.filter((client) => {
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
    setSelectedClient(client);
    setSearchTerm(client.name);
    setSearchResults([]);
    setIsFocused(false);
  };
  
  const handleClearSelection = () => {
    setSelectedClient(null);
    setSearchTerm('');
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

  const showResults = isFocused && searchResults.length > 0 && !selectedClient;

  return (
    <div className="w-full md:w-1/2 relative" ref={searchRef}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {selectedClient ? <User className="h-5 w-5" /> : <Search className="h-5 w-5" />}
        </div>
        <Input
          placeholder={t('searchClientPlaceholder')}
          value={searchTerm}
          onChange={(e) => {
            if (selectedClient) handleClearSelection();
            setSearchTerm(e.target.value)
          }}
          onFocus={() => setIsFocused(true)}
          className="pl-10 pr-10"
          autoComplete="off"
        />
        {selectedClient && (
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={handleClearSelection}
            >
                <X className="h-5 w-5 text-muted-foreground" />
            </Button>
        )}
      </div>

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
  );
}
