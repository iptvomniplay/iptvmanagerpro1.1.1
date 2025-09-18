'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';

interface BirthdateInputProps {
  field: any;
  language: 'pt-BR' | 'en-US';
}

export function BirthdateInput({ field, language }: BirthdateInputProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    const isPtBr = language === 'pt-BR';

    if (isPtBr) {
      // DD/MM/AAAA
      if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
      if (value.length > 5) value = `${value.slice(0, 5)}/${value.slice(5, 9)}`;
    } else {
      // MM/DD/AAAA
      if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
      if (value.length > 5) value = `${value.slice(0, 5)}/${value.slice(5, 9)}`;
    }

    field.onChange(value);
  };

  return (
    <Input
      placeholder={language === 'pt-BR' ? 'DD/MM/AAAA' : 'MM/DD/AAAA'}
      {...field}
      onChange={handleDateChange}
      maxLength={10}
      autoComplete="off"
    />
  );
}
