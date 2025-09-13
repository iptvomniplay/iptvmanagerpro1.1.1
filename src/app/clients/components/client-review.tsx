'use client';

import * as React from 'react';
import type { ClientFormValues } from './clients-page-content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/use-language';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilePenLine, Trash2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

type EditableField = keyof ClientFormValues;

interface ClientReviewProps {
  initialData: ClientFormValues;
  onBack: () => void;
  onFinalSubmit: (data: ClientFormValues) => void;
  isEditing: boolean;
}

export function ClientReview({
  initialData,
  onBack,
  onFinalSubmit,
  isEditing,
}: ClientReviewProps) {
  const { t } = useLanguage();
  const [data, setData] = React.useState<ClientFormValues>(initialData);
  const [editingField, setEditingField] = React.useState<EditableField | null>(null);
  const [tempValue, setTempValue] = React.useState<string>('');

  const fieldLabels: Record<EditableField, string> = {
    name: t('fullName'),
    email: t('emailAddress'),
    status: t('status'),
    expiryDate: t('expiryDate'),
  };

  const handleEdit = (field: EditableField) => {
    setEditingField(field);
    setTempValue(data[field]);
  };

  const handleSave = () => {
    if (editingField) {
      setData((prev) => ({ ...prev, [editingField]: tempValue }));
      setEditingField(null);
    }
  };

  const handleDelete = (field: EditableField) => {
    setData(prev => ({...prev, [field]: ''}));
  }

  const handleCancel = () => {
    setEditingField(null);
  };
  
  const renderField = (field: EditableField) => {
    const isDate = field === 'expiryDate';
    const displayValue = isDate && data[field] ? format(parseISO(data[field]), 'MM/dd/yyyy') : data[field];

    return (
        <div key={field} className="flex items-center justify-between p-3 border-b">
            <span className="font-medium text-muted-foreground">{fieldLabels[field]}:</span>
            {editingField === field ? (
                 <div className="flex items-center gap-2">
                    {field === 'status' ? (
                        <Select onValueChange={setTempValue} defaultValue={tempValue}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">{t('active')}</SelectItem>
                                <SelectItem value="Inactive">{t('inactive')}</SelectItem>
                                <SelectItem value="Expired">{t('expired')}</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                         <Input
                            type={isDate ? 'date' : 'text'}
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            className="w-auto"
                        />
                    )}
                    <Button variant="ghost" size="icon" onClick={handleSave} className="text-green-500 hover:text-green-600">
                        <Check className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleCancel} className="text-red-500 hover:text-red-600">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{displayValue}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(field)}>
                        <FilePenLine className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(field)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    )
  }


  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2 rounded-lg border p-4">
        {(Object.keys(data) as EditableField[]).map(field => renderField(field))}
      </div>
      <div className="flex justify-end gap-4 pt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          {t('cancel')}
        </Button>
        <Button type="button" onClick={() => onFinalSubmit(data)}>
          {isEditing ? t('saveChanges') : t('createClient')}
        </Button>
      </div>
    </div>
  );
}