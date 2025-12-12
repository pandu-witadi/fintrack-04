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
import { CreateActualData } from '@/services/actualService';

interface AddActualDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateActualData) => Promise<void>;
    isSubmitting: boolean;
    projectId: string; // Added projectId prop
}

export function AddActualDialog({ open, onOpenChange, onSubmit, isSubmitting, projectId }: AddActualDialogProps) {
    const [formData, setFormData] = useState({
        name: '',
        note: '',
        typ: 'expense' as 'income' | 'expense' | 'other',
        amount: 0,
        dateEx: new Date().toISOString().split('T')[0],
        active: true,
        done: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSubmit({
                ...formData,
                amount: Number(formData.amount),
                projectId, // Include projectId in the submission
            });
            // Reset form
            setFormData({
                name: formData.name.trim(),
                note: formData.note.trim(),
                typ: formData.typ,
                amount: Number(formData.amount),
                dateEx: new Date(formData.dateEx).toISOString(),
                active: formData.active,
                done: formData.done,
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
                    <DialogTitle>Add Actual</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Transaction name"
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="typ">type</Label>
                        <Select value={formData.typ} onValueChange={(value) => handleChange('typ', value as any)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="income">Income</SelectItem>
                                <SelectItem value="expense">Expense</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="amount">amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={formData.amount || ''}
                            onChange={(e) => handleChange('amount', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="dateEx">date Ex</Label>
                        <Input
                            id="dateEx"
                            type="date"
                            value={formData.dateEx}
                            onChange={(e) => handleChange('dateEx', e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="note">note</Label>
                        <Textarea
                            id="note"
                            value={formData.note}
                            onChange={(e) => handleChange('note', e.target.value)}
                            placeholder="Additional notes"
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