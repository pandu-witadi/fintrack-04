import { useState } from 'react';
import {
    CheckLine,
    Type,
    Power,
    CreditCard,
    User,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/number-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trx } from '@/services/trxService.ts';
import formatCurrency from '@/utils/formatCurrency';
import { IconType } from '@/components/IconType';
import { IconActive } from '@/components/IconActive';
import { IconDone } from '@/components/IconDone';
import AssigneeSelector from '@/components/AssigneeSelector';
import { format } from 'date-fns';

export interface EditTrxData {
    active: boolean;
    done: boolean;
    name: string;
    typ: 'income' | 'expense';
    amount: number;
    actAmount: number;
    isEq: boolean;
    note: string;
    dateEx: string;
    detailedAmount: {
        currency: string;
        value: number;
        exRate: number;
    };
    assignee: string | null;
    sndr: {
        bankName: string;
        accNo: string;
        accName: string;
    };
    recv: {
        bankName: string;
        accNo: string;
        accName: string;
    };
}

interface TrxDetailsCardProps {
    trx: Trx | null;
    isEditing: boolean;
    editTrx: EditTrxData;
    isSubmitting: boolean;
    onEditFormChange: (field: string, value: string | number | boolean | object | null) => void;
    onUpdate: () => void;
    onCancel: () => void;
    onEditStart: () => void;
    onAssigneeChange: (assigneeId: string | null) => void;
}

export default function TrxDetailsCard({
    trx,
    isEditing,
    editTrx,
    isSubmitting,
    onEditFormChange,
    onUpdate,
    onCancel,
    onEditStart,
    onAssigneeChange,
}: TrxDetailsCardProps) {
    const [expandedAmountDetails, setExpandedAmountDetails] = useState(false);
    const [expandedAmountDetailsView, setExpandedAmountDetailsView] = useState(false);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Trx Details</CardTitle>
                <CardDescription>Complete information about this trx</CardDescription>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <div className="space-y-6">
                        {/* Toggle Row: Done and Active */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    id="done"
                                    type="checkbox"
                                    checked={editTrx.done}
                                    onChange={(e) => onEditFormChange('done', e.target.checked)}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="done">Done</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    id="active"
                                    type="checkbox"
                                    checked={editTrx.active}
                                    onChange={(e) => onEditFormChange('active', e.target.checked)}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="active">Active</Label>
                            </div>
                            {/* Type Field */}
                            <div className="space-y-2">
                                <Label htmlFor="typ">Type</Label>
                                <Select
                                    value={editTrx.typ || 'expense'}
                                    onValueChange={(value) => onEditFormChange('typ', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="income">Income</SelectItem>
                                        <SelectItem value="expense">Expense</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Name Field */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={editTrx.name || ''}
                                onChange={(e) => onEditFormChange('name', e.target.value)}
                            />
                        </div>

                        {/* Note Field */}
                        <div className="space-y-2">
                            <Label htmlFor="note">Notes</Label>
                            <Textarea
                                id="note"
                                value={editTrx.note || ''}
                                onChange={(e) => onEditFormChange('note', e.target.value)}
                                placeholder="Additional notes"
                                className="min-h-[100px]"
                            />
                        </div>

                        {/* Assignee Field */}
                        <AssigneeSelector
                            selectedAssignee={editTrx.assignee}
                            onAssigneeChange={onAssigneeChange}
                            isEditing={isEditing}
                        />

                        {/* Amount Information */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">Amount Information</h3>
                                <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Amount</Label>
                                        <NumberInput
                                            id="amount"
                                            value={editTrx.amount}
                                            onValueChange={(value) => onEditFormChange('amount', value || 0)}
                                            decimalScale={0}
                                            fixedDecimalScale={true}
                                            thousandSeparator=","
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isEq"
                                            checked={editTrx.isEq}
                                            onCheckedChange={(checked) => onEditFormChange('isEq', checked)}
                                        />
                                        <Label htmlFor="isEq" className="font-normal cursor-pointer">Is Equal (actAmount = amount)</Label>
                                    </div>
                                    {!editTrx.isEq && (
                                        <div className="space-y-2">
                                            <Label htmlFor="actAmount">Actual Amount</Label>
                                            <NumberInput
                                                id="actAmount"
                                                value={editTrx.actAmount}
                                                onValueChange={(value) => onEditFormChange('actAmount', value || 0)}
                                                decimalScale={0}
                                                fixedDecimalScale={true}
                                                thousandSeparator=","
                                            />
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setExpandedAmountDetails(!expandedAmountDetails)}
                                        className="text-sm text-blue-600 hover:underline text-left font-medium"
                                    >
                                        {expandedAmountDetails ? '▼' : '▶'} Detailed Amount Information
                                    </button>
                                    {expandedAmountDetails && (
                                        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                                            <div className="space-y-2">
                                                <Label htmlFor="detailedAmountCurrency">Currency</Label>
                                                <Input
                                                    id="detailedAmountCurrency"
                                                    value={editTrx.detailedAmount.currency}
                                                    onChange={(e) => onEditFormChange('detailedAmount.currency', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="detailedAmountValue">Value</Label>
                                                <NumberInput
                                                    id="detailedAmountValue"
                                                    value={editTrx.detailedAmount.value}
                                                    onValueChange={(value) => onEditFormChange('detailedAmount.value', value || 0)}
                                                    decimalScale={0}
                                                    fixedDecimalScale={true}
                                                    thousandSeparator=","
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="detailedAmountExRate">Ex Rate</Label>
                                                <NumberInput
                                                    id="detailedAmountExRate"
                                                    value={editTrx.detailedAmount.exRate}
                                                    onValueChange={(value) => onEditFormChange('detailedAmount.exRate', value || 1)}
                                                    decimalScale={0}
                                                    fixedDecimalScale={true}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bank Information */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">Bank Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Sender Bank Info */}
                                    <div className="border rounded-lg p-4">
                                        <h4 className="font-medium mb-3 flex items-center">
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            Sender
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="sndrBankName">Bank Name</Label>
                                                <Input
                                                    id="sndrBankName"
                                                    value={editTrx.sndr.bankName}
                                                    onChange={(e) => onEditFormChange('sndr.bankName', e.target.value)}
                                                    placeholder="Bank name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="sndrAccNo">Account Number</Label>
                                                <Input
                                                    id="sndrAccNo"
                                                    value={editTrx.sndr.accNo}
                                                    onChange={(e) => onEditFormChange('sndr.accNo', e.target.value)}
                                                    placeholder="Account number"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="sndrAccName">Account Name</Label>
                                                <Input
                                                    id="sndrAccName"
                                                    value={editTrx.sndr.accName}
                                                    onChange={(e) => onEditFormChange('sndr.accName', e.target.value)}
                                                    placeholder="Account name"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Receiver Bank Info */}
                                    <div className="border rounded-lg p-4">
                                        <h4 className="font-medium mb-3 flex items-center">
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            Receiver
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="recvBankName">Bank Name</Label>
                                                <Input
                                                    id="recvBankName"
                                                    value={editTrx.recv.bankName}
                                                    onChange={(e) => onEditFormChange('recv.bankName', e.target.value)}
                                                    placeholder="Bank name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="recvAccNo">Account Number</Label>
                                                <Input
                                                    id="recvAccNo"
                                                    value={editTrx.recv.accNo}
                                                    onChange={(e) => onEditFormChange('recv.accNo', e.target.value)}
                                                    placeholder="Account number"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="recvAccName">Account Name</Label>
                                                <Input
                                                    id="recvAccName"
                                                    value={editTrx.recv.accName}
                                                    onChange={(e) => onEditFormChange('recv.accName', e.target.value)}
                                                    placeholder="Account name"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Date Fields */}
                        <div className="space-y-2">
                            <Label htmlFor="dateEx">Date of Execution</Label>
                            <Input
                                id="dateEx"
                                type="date"
                                value={editTrx.dateEx || ''}
                                onChange={(e) => onEditFormChange('dateEx', e.target.value)}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                            <Button onClick={onUpdate} size="sm" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                            <Button onClick={onCancel} variant="outline" size="sm">
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Power className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Active</div>
                                        <div className="font-medium">{IconActive(trx?.active !== undefined ? trx?.active : true)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Type className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Type</div>
                                        {IconType(trx?.typ || 'expense')}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckLine className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Done</div>
                                        <div className="font-medium">
                                            {trx?.done ? 'true' : 'false'}
                                        </div>
                                    </div>
                                </div>
                                {/* Assignee Field */}
                                {trx?.assignee && (
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="text-sm text-muted-foreground">Assignee</div>
                                            <div className="font-medium">
                                                {(trx?.assignee as any)?.name || 'N/A'}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {(trx?.assignee as any)?.email || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Amount Information Block */}
                                <div className="border rounded-lg p-4">
                                    <h3 className="text-lg font-medium mb-3">Amount Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <div className="text-sm text-muted-foreground">Amount</div>
                                            <div className="font-medium">{formatCurrency(trx?.amount || 0)}</div>
                                        </div>
                                        {trx?.isEq === false && trx?.actAmount !== undefined && (
                                            <div className="flex justify-between">
                                                <div className="text-sm text-muted-foreground">Actual Amount</div>
                                                <div className="font-medium">{formatCurrency(trx?.actAmount || 0)}</div>
                                            </div>
                                        )}
                                        {trx?.isEq !== undefined && (
                                            <div className="flex justify-between">
                                                <div className="text-sm text-muted-foreground">Is Equal</div>
                                                <div className="font-medium">{trx?.isEq ? 'Yes' : 'No'}</div>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setExpandedAmountDetailsView(!expandedAmountDetailsView)}
                                            className="text-sm text-blue-600 hover:underline text-left font-medium w-full text-left"
                                        >
                                            {expandedAmountDetailsView ? '▼' : '▶'} Detailed Information
                                        </button>
                                        {expandedAmountDetailsView && (
                                            <div className="space-y-3 pt-3 border-t">
                                                <div className="flex justify-between">
                                                    <div className="text-sm text-muted-foreground">Currency</div>
                                                    <div className="font-medium">{trx?.detailedAmount?.currency || 'IDR'}</div>
                                                </div>
                                                <div className="flex justify-between">
                                                    <div className="text-sm text-muted-foreground">Value</div>
                                                    <div className="font-medium">{formatCurrency(trx?.detailedAmount?.value || 0)}</div>
                                                </div>
                                                <div className="flex justify-between">
                                                    <div className="text-sm text-muted-foreground">Exchange Rate</div>
                                                    <div className="font-medium">x{trx?.detailedAmount?.exRate || 1}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bank Information Block */}
                                {(trx?.sndr || trx?.recv) && (
                                    <div className="border rounded-lg p-4">
                                        <h3 className="text-lg font-medium mb-3">Bank Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Sender Info */}
                                            {trx?.sndr && (
                                                <div>
                                                    <h4 className="font-medium mb-2 flex items-center">
                                                        <CreditCard className="h-4 w-4 mr-2" />
                                                        Sender
                                                    </h4>
                                                    <div className="space-y-1 text-sm">
                                                        {trx.sndr.bankName && (
                                                            <div><span className="text-muted-foreground">Bank:</span> {trx.sndr.bankName}</div>
                                                        )}
                                                        {trx.sndr.accNo && (
                                                            <div><span className="text-muted-foreground">Account:</span> {trx.sndr.accNo}</div>
                                                        )}
                                                        {trx.sndr.accName && (
                                                            <div><span className="text-muted-foreground">Name:</span> {trx.sndr.accName}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Receiver Info */}
                                            {trx?.recv && (
                                                <div>
                                                    <h4 className="font-medium mb-2 flex items-center">
                                                        <CreditCard className="h-4 w-4 mr-2" />
                                                        Receiver
                                                    </h4>
                                                    <div className="space-y-1 text-sm">
                                                        {trx.recv.bankName && (
                                                            <div><span className="text-muted-foreground">Bank:</span> {trx.recv.bankName}</div>
                                                        )}
                                                        {trx.recv.accNo && (
                                                            <div><span className="text-muted-foreground">Account:</span> {trx.recv.accNo}</div>
                                                        )}
                                                        {trx.recv.accName && (
                                                            <div><span className="text-muted-foreground">Name:</span> {trx.recv.accName}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {trx?.note && trx?.note.trim() !== '' && (
                                    <div>
                                        <div className="text-sm text-muted-foreground mb-1">Notes</div>
                                        <div className="font-medium p-3 bg-muted rounded-lg">{trx?.note}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
