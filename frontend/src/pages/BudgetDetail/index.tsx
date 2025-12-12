import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { 
    ArrowLeftFromLine,
    Edit, 
    Trash2, 
    Calendar, 
    CheckLine, 
    Tag, 
    Type, 
    Power,
    ChevronRight,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { budgetService, Budget } from '../../services/budgetService';
import { NumberInput } from '../../components/number-input';
import formatCurrency from '../../utils/formatCurrency';
import { IconType } from '@/components/IconType';
import { IconActive } from '@/components/IconActive';
import { IconDone } from '@/components/IconDone';

export default function BudgetDetail() {
    const navigate = useNavigate();
    const { id: budgetId } = useParams<{ id: string }>();
    
    const [budget, setBudget] = useState<Budget | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const [editBudget, setEditBudget] = useState<{
        active: boolean;
        done: boolean;
        name: string;
        typ: 'income' | 'expense' | 'other';
        amount: number;
        note: string;
        dateEx: string;
        project: string;
        detailedAmount: {
            currency: string;
            value: number;
            exRate: number;
        };
    }>({
        active: true,
        done: false,
        name: '',
        typ: 'expense',
        amount: 0,
        note: '',
        dateEx: '',
        project: '',
        detailedAmount: {
            currency: 'IDR',
            value: 0,
            exRate: 1
        },
    });
    const [expandedBudgetDetails, setExpandedBudgetDetails] = useState(false);
    const [expandedAmountDetails, setExpandedAmountDetails] = useState(false);
    const [expandedBudgetDetailsView, setExpandedBudgetDetailsView] = useState(false);
    const [expandedAmountDetailsView, setExpandedAmountDetailsView] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (budgetId) {
            fetchBudgetDetails(budgetId);
        }
    }, [budgetId]);

    const fetchBudgetDetails = async (budgetId: string) => {
        try {
            setLoading(true);
            const budgetData = await budgetService.getBudgetById(budgetId);
            setBudget(budgetData);
            setEditBudget({
                active: budgetData.active !== undefined ? budgetData.active : true,
                done: budgetData.done !== undefined ? budgetData.done : false,
                name: budgetData.name,
                typ: budgetData.typ,
                amount: budgetData.amount,
                note: budgetData.note || '',
                dateEx: budgetData.dateEx ? new Date(budgetData.dateEx).toISOString().split('T')[0] : '',
                project: budgetData.project || '',
                detailedAmount: budgetData.detailedAmount || {
                    currency: 'IDR',
                    value: 0,
                    exRate: 1
                }
            });
        } catch (err) {
            setError('Failed to fetch event details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };



    const handleEditFormChange = (field: string, value: string | number | boolean | object) => {
        // Handle nested objects like detailedBudget and detailedAmount
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setEditBudget((prev: any) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setEditBudget(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleUpdateBudget = async () => {
        if (!budget || !budgetId) return;
        
        try {
            setIsSubmitting(true);
            
            const updatedBudget = await budgetService.updateBudget(budgetId, {
                active: editBudget.active,
                done: editBudget.done,
                name: editBudget.name,
                typ: editBudget.typ,
                amount: editBudget.amount,
                note: editBudget.note,
                dateEx: editBudget.dateEx,
            });
            setBudget(updatedBudget);
            
            toast.success('Budget updated successfully');
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to update budget');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteBudget = () => {
        setIsDeleteConfirmOpen(true);
    };

    const confirmDeleteBudget = async () => {
        if (!budget) return;
        
        try {
            setIsSubmitting(true);
            const budgetId = (budget as any)._id || '';
            await budgetService.deleteBudget(budgetId);
            
            toast.success('Budget deleted successfully');
            setIsDeleteConfirmOpen(false);
            navigate(-1); // Go back to the previous page
        } catch (error) {
            toast.error('Failed to delete budget');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (budget) {
            setEditBudget({
                name: budget.name,
                active: budget.active !== undefined ? budget.active : true,
                done: budget.done !== undefined ? budget.done : false,
                typ: budget.typ,
                amount: budget.amount,
                note: budget.note || '',
                dateEx: budget.dateEx ? new Date(budget.dateEx).toISOString().split('T')[0] : '',
                project: budget.project || '',
                detailedAmount: budget.detailedAmount || {
                    currency: 'IDR',
                    value: 0,
                    exRate: 1
                }
            });
        }
        setIsEditing(false);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeftFromLine className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => navigate(-1)} className="w-full">
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Not found state
    if (!budget) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeftFromLine className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Budget Not Found</CardTitle>
                        <CardDescription>The requested budget could not be found.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => navigate(-1)} className="w-full">
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" onClick={() => navigate(-1)} size="sm">
                                <ArrowLeftFromLine className="h-4 w-4" />
                            </Button>
                            <div>
                                 <h2 className="text-2xl font-bold">{budget?.name || 'Unnamed Budget'}</h2>
                                <div className="flex items-center space-x-2 mt-1">
                                     <Badge variant="outline" className="rounded-none">budget</Badge>
                                    <ChevronRight className="h-4 w-4" />
                                    {IconType(budget?.typ)}
                                    {IconDone(budget?.done)}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {!isEditing ? (
                                <>
                                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button onClick={handleDeleteBudget} variant="destructive" size="sm">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </>
                            ) : (
                                <div className="flex space-x-2">
                                    <Button onClick={handleUpdateBudget} size="sm" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : 'Save'}
                                    </Button>
                                    <Button onClick={handleCancel} variant="outline" size="sm">
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 space-y-6">
                {/* Details Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Budget Details</CardTitle>
                                <CardDescription>Complete information about this budget</CardDescription>
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
                                                    checked={editBudget.done}
                                                    onChange={(e) => handleEditFormChange('done', e.target.checked)}
                                                    className="h-4 w-4"
                                                />
                                                <Label htmlFor="done">Done</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    id="active"
                                                    type="checkbox"
                                                    checked={editBudget.active}
                                                    onChange={(e) => handleEditFormChange('active', e.target.checked)}
                                                    className="h-4 w-4"
                                                />
                                                <Label htmlFor="active">Active</Label>
                                            </div>
                                        </div>

                                        {/* Name Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                value={editBudget.name || ''}
                                                onChange={(e) => handleEditFormChange('name', e.target.value)}
                                            />
                                        </div>

                                        {/* Note Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="note">Notes</Label>
                                            <Textarea
                                                id="note"
                                                value={editBudget.note || ''}
                                                onChange={(e) => handleEditFormChange('note', e.target.value)}
                                                placeholder="Additional notes"
                                                className="min-h-[100px]"
                                            />
                                        </div>
                                         {/* Type, Group, Amount equals Budget, and Assignee Fields */}
                                        <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 2fr 1fr 3fr' }}>
                                            <div className="space-y-2">
                                                <Label htmlFor="typ">Type</Label>
                                                <Select 
                                                    value={editBudget.typ || 'expense'} 
                                                    onValueChange={(value) => handleEditFormChange('typ', value)}
                                                >
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
                                        </div>

                                        {/* Amount Information */}
                                        <div className="space-y-6">
                                            {/* Amount Block */}
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-medium">Amount Information</h3>
                                                <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="amount">Amount</Label>
                                                        <NumberInput
                                                            id="amount"
                                                            value={editBudget.amount}
                                                            onValueChange={(value) => handleEditFormChange('amount', value || 0)}
                                                            decimalScale={0}
                                                            fixedDecimalScale={true}
                                                            thousandSeparator=","
                                                        />
                                                    </div>
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
                                                                    value={editBudget.detailedAmount.currency}
                                                                    onChange={(e) => handleEditFormChange('detailedAmount.currency', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="detailedAmountValue">Value</Label>
                                                                <NumberInput
                                                                    id="detailedAmountValue"
                                                                    value={editBudget.detailedAmount.value}
                                                                    onValueChange={(value) => handleEditFormChange('detailedAmount.value', value || 0)}
                                                                    decimalScale={0}
                                                                    fixedDecimalScale={true}
                                                                    thousandSeparator=","
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="detailedAmountExRate">Ex Rate</Label>
                                                                <NumberInput
                                                                    id="detailedAmountExRate"
                                                                    value={editBudget.detailedAmount.exRate}
                                                                    onValueChange={(value) => handleEditFormChange('detailedAmount.exRate', value || 1)}
                                                                    decimalScale={0}
                                                                    fixedDecimalScale={true}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Date Fields */}
                                        <div className="space-y-2">
                                            <Label htmlFor="dateEx">Date of Execution</Label>
                                            <Input
                                                id="dateEx"
                                                type="date"
                                                value={editBudget.dateEx || ''}
                                                onChange={(e) => handleEditFormChange('dateEx', e.target.value)}
                                            />
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
                                                        <div className="font-medium">{IconActive(budget?.active !== undefined ? budget?.active : true)}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Type className="h-5 w-5 text-muted-foreground" />
                                                    <div>
                                                        <div className="text-sm text-muted-foreground">Type</div>
                                                        {IconType(budget?.typ)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <CheckLine className="h-5 w-5 text-muted-foreground" />
                                                    <div>
                                                        <div className="text-sm text-muted-foreground">Done</div>
                                                        <div className="font-medium">
                                                            {budget?.done ? 'true' : 'false'}
                                                        </div> 
                                                    </div>
                                                </div>


                                            </div>

                                            <div className="space-y-6">
                                                {/* Amount Information Block */}
                                                <div className="border rounded-lg p-4">
                                                    <h3 className="text-lg font-medium mb-3">Amount Information</h3>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between">
                                                            <div className="text-sm text-muted-foreground">Amount</div>
                                                            <div className="font-medium">{formatCurrency(budget?.amount || 0)}</div>
                                                        </div>
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
                                                                    <div className="font-medium">{budget?.detailedAmount?.currency || 'IDR'}</div>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <div className="text-sm text-muted-foreground">Value</div>
                                                                    <div className="font-medium">{formatCurrency(budget?.detailedAmount?.value || 0)}</div>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <div className="text-sm text-muted-foreground">Exchange Rate</div>
                                                                    <div className="font-medium">x{budget?.detailedAmount?.exRate || 1}</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {budget?.note && budget?.note.trim() !== '' && (
                                                    <div>
                                                        <div className="text-sm text-muted-foreground mb-1">Notes</div>
                                                        <div className="font-medium p-3 bg-muted rounded-lg">{budget?.note}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Metadata */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="h-3 w-3 text-orange-500">Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                 <div className="flex items-center gap-3">
                                    <Tag className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Project</div>
                                        <div className="font-medium">
                                            {typeof budget?.project === 'object' && budget?.project !== null && 'name' in (budget?.project || {})
                                                ? (
                                                    <button 
                                                        onClick={() => navigate(`/finance/project/${(budget?.project as any)?._id}`)}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                                        title={`View project: ${(budget?.project as any)?.name}`}
                                                    >
                                                        {(budget?.project as any)?.name}
                                                    </button>
                                                )
                                                : (typeof budget?.project === 'string' ? budget?.project : 'N/A')
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground"> Date Executed</div>
                                        <div className="font-medium">
                                            {budget?.dateEx ? formatDate(budget?.dateEx) : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {budget?.updatedBy && typeof budget?.updatedBy === 'object' && budget?.updatedBy !== null && (
                                    <div>
                                        <div className="text-sm text-muted-foreground">Updated By</div>
                                        <div className="font-medium">{(budget?.updatedBy as any)?.name || 'N/A'}</div>
                                        <div className="text-sm text-muted-foreground">{(budget?.updatedBy as any)?.email || 'N/A'}</div>
                                    </div>
                                )}
                                <div>
                                    <div className="text-sm text-muted-foreground">Last Updated</div>
                                    <div className="font-medium">
                                        {budget?.updatedAt ? formatDate(budget?.updatedAt) : 'N/A'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>


            </main>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the event "{budget?.name || 'this event'}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteBudget} disabled={isSubmitting}>
                            {isSubmitting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}