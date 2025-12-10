import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateTrxData } from '@/services/trxService';

interface AddTrxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTrxData) => Promise<void>;
  isSubmitting: boolean;
  projectId: string;
}

export function AddTrxDialog({ open, onOpenChange, onSubmit, isSubmitting, projectId }: AddTrxDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    note: '',
    typ: 'expense' as 'income' | 'expense',
    amount: 0,
    dateEx: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({
        ...formData,
        amount: Number(formData.amount),
        projectId,
      });
      // Reset form
      setFormData({
        name: '',
        note: '',
        typ: 'expense',
        amount: 0,
        dateEx: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Transaction name"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="typ">Type</Label>
            <Select value={formData.typ} onValueChange={(value) => handleChange('typ', value as any)} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount || ''}
              onChange={(e) => handleChange('amount', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              step="0.01"
              disabled={isSubmitting}
              min="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateEx">Date</Label>
            <Input
              id="dateEx"
              type="date"
              value={formData.dateEx}
              onChange={(e) => handleChange('dateEx', e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              placeholder="Additional notes"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
