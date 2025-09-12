'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: string;
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, onChange, ...props }, ref) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;
      let numericValue = inputValue.replace(/\D/g, '');
      let maskedValue = '';

      if (numericValue.length > 0) {
        let maskIndex = 0;
        let valueIndex = 0;
        while (maskIndex < mask.length && valueIndex < numericValue.length) {
          if (mask[maskIndex] === '_') {
            maskedValue += numericValue[valueIndex];
            valueIndex++;
          } else {
            maskedValue += mask[maskIndex];
          }
          maskIndex++;
        }
      }

      e.target.value = maskedValue;

      if (onChange) {
        onChange(e);
      }
    };

    return (
      <Input
        ref={ref}
        onChange={handleInputChange}
        {...props}
      />
    );
  }
);
MaskedInput.displayName = 'MaskedInput';

export { MaskedInput };
