'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/use-language';
import { Label } from './label';

// Supported DDIs dictionary
const DDIs: Record<string, string> = {
  '55': 'Brasil',
  '1': 'EUA/Canadá',
  '44': 'Reino Unido',
  '351': 'Portugal',
  // Add other countries as needed
};

interface TelefoneGlobalProps {
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  placeholder?: string;
}

export const TelefoneGlobal = React.forwardRef<HTMLInputElement, TelefoneGlobalProps>(
  ({ value = '', onChange, name, placeholder = '+55 (11) 91234-5678' }, ref) => {
    const { t } = useLanguage();
    const [telefone, setTelefone] = useState(value);
    const [valido, setValido] = useState<boolean | null>(null);

    useEffect(() => {
      setTelefone(value);
      if (value) {
        setValido(validarTelefone(value));
      } else {
        setValido(null);
      }
    }, [value]);

    const formatarTelefone = (valor: string): string => {
      let numeros = valor.replace(/\D/g, '');
      if (numeros.length > 13) numeros = numeros.slice(0, 13); // Limit to typical max length + DDI

      let formatted = '+';
      if (numeros.length > 0) {
        const ddiLength = Math.min(numeros.length, 2);
        formatted += numeros.substring(0, ddiLength);

        if (numeros.length > 2) {
          formatted += ` (${numeros.substring(2, 4)}`;
        }
        if (numeros.length > 4) {
          const remaining = numeros.substring(4);
          const splitPoint = remaining.length > 8 ? 5 : 4;
          formatted += `) ${remaining.substring(0, splitPoint)}`;
          if (remaining.length > splitPoint) {
            formatted += `-${remaining.substring(splitPoint, 9)}`;
          }
        }
      }
      return formatted;
    };

    const validarTelefone = (valor: string): boolean => {
      const regex = /^\+(\d{1,3}) \((\d{2})\) (\d{4,5}-\d{4})$/;
      const match = valor.match(regex);
      if (!match) return false;
      const ddi = match[1];
      return DDIs.hasOwnProperty(ddi);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatado = formatarTelefone(e.target.value);
      setTelefone(formatado);
      setValido(formatado.length > 1 ? validarTelefone(formatado) : null);
      if (onChange) {
        onChange(formatado);
      }
    };
    
    const borderColorClass = cn({
      'border-input': valido === null,
      'border-green-500 focus-visible:ring-green-500': valido === true,
      'border-destructive focus-visible:ring-destructive': valido === false,
    });

    return (
      <div className="space-y-2">
        <Label htmlFor={name}>{t('phoneLabel')}</Label>
        <Input
          type="text"
          id={name}
          name={name}
          value={telefone}
          onChange={handleChange}
          placeholder={placeholder}
          className={borderColorClass}
          ref={ref}
        />
        {valido === false && <p className="text-sm text-destructive">{t('phoneInvalid')}</p>}
        {valido === true && <p className="text-sm text-green-600">{t('phoneValid')}</p>}
      </div>
    );
  }
);

TelefoneGlobal.displayName = 'TelefoneGlobal';

    