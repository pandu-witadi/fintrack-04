import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
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
import { NumberInput } from '@/components/number-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { actualService, Actual } from '@/services/actualService.ts';
import { userService, User } from '@/services/userService.ts';
import formatCurrency from '@/utils/formatCurrency';
import { IconActive } from '@/components/IconActive';
import { IconDone } from '@/components/IconDone';

export default function ActualDetail() {
    const navigate = useNavigate();
    const { id: actualId } = useParams<{ id: string }>();

    const [actual, setActual] = useState<Actual | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
    
    // Update the editActual state to include assignee
    const [editActual, setEditActual] = useState<{
        active: boolean;
        done: boolean;
        name: string;
        typ: 'income' | 'expense' | 'other';
        amount: number;
        note: string;
        dateEx: string;
        detailedAmount: {
            currency: string;
            value: number;
            exRate: number;
        };
        assignee: string | null; // Add assignee field
    }>({
        active: true,
        done: false,
        name: '',
        typ: 'expense',
        amount: 0,
        note: '',
        dateEx: '',
        detailedAmount: {
            currency: 'IDR',
            value: 0,
            exRate: 1
        },
        assignee: null, // Initialize assignee
    });
    const [expandedAmountDetails, setExpandedAmountDetails] = useState(false);
    const [expandedAmountDetailsView, setExpandedAmountDetailsView] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (actualId) {
            fetchActualDetails(actualId);
        }
    }, [actualId]);

    // Add function to fetch all users
    const fetchAllUsers = async () => {
        try {
            const usersData = await userService.getAllUsers();
            setUsers(usersData);
            setFilteredUsers(usersData);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            toast.error('Failed to load users');
        }
    };

    // Filter users based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredUsers(users);
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = users.filter(user => 
                user.name.toLowerCase().includes(term) || 
                user.email.toLowerCase().includes(term)
            );
            setFilteredUsers(filtered);
        }
    }, [searchTerm, users]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isAssigneeDropdownOpen) {
                const target = event.target as HTMLElement;
                if (!target.closest('[data-assignee-selector]')) {
                    setIsAssigneeDropdownOpen(false);
                }
            }
        };

        if (isAssigneeDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAssigneeDropdownOpen]);

    // Fetch users when entering edit mode
    useEffect(() => {
        if (isEditing) {
            fetchAllUsers();
        }
    }, [isEditing]);

    const fetchActualDetails = async (actualId: string) => {
        try {
            setLoading(true);
            const actualData = await actualService.getActualById(actualId);
            setActual(actualData);
            setEditActual({
                active: actualData.active !== undefined ? actualData.active : true,
                done: actualData.done !== undefined ? actualData.done : false,
                name: actualData.name,
                typ: actualData.typ,
                amount: actualData.amount,
                note: actualData.note || '',
                dateEx: actualData.dateEx ? new Date(actualData.dateEx).toISOString().split('T')[0] : '',
                detailedAmount: actualData.detailedAmount || {
                    currency: 'IDR',
                    value: 0,
                    exRate: 1
                },
                assignee: actualData.assignee ? actualData.assignee._id : null, // Set assignee
            });
        } catch (err) {
            setError('Failed to fetch actual details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditFormChange = (field: string, value: string | number | boolean | object) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setEditActual((prev: any) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setEditActual(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleUpdateActual = async () => {
        if (!actual || !actualId) return;

        try {
            setIsSubmitting(true);

            const updatedActual = await actualService.updateActual(actualId, {
                active: editActual.active,
                done: editActual.done,
                name: editActual.name,
                typ: editActual.typ,
                amount: editActual.amount,
                note: editActual.note,
                dateEx: editActual.dateEx,
                assignee: editActual.assignee === null ? null : editActual.assignee, // Send null explicitly or assignee ID
            });
            setActual(updatedActual);

            toast.success('Actual updated successfully');
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to update actual');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteActual = () => {
        setIsDeleteConfirmOpen(true);
    };

    const confirmDeleteActual = async () => {
        if (!actual) return;

        try {
            setIsSubmitting(true);
            const actualId = (actual as any)._id || '';
            await actualService.deleteActual(actualId);

            toast.success('Actual deleted successfully');
            setIsDeleteConfirmOpen(false);
            navigate(-1);
        } catch (error) {
            toast.error('Failed to delete actual');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (actual) {
            setEditActual({
                name: actual.name,
                active: actual.active !== undefined ? actual.active : true,
                done: actual.done !== undefined ? actual.done : false,
                typ: actual.typ,
                amount: actual.amount,
                note: actual.note || '',
                dateEx: actual.dateEx ? new Date(actual.dateEx).toISOString().split('T')[0] : '',
                detailedAmount: actual.detailedAmount || {
                    currency: 'IDR',
                    value: 0,
                    exRate: 1
                },
                assignee: actual.assignee ? actual.assignee._id : null, // Reset assignee
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
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

    if (!actual) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Actual Not Found</CardTitle>
                        <CardDescription>The requested actual could not be found.</CardDescription>
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
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">{actual?.name || 'Unnamed Actual'}</h1>
                                <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="outline">actual</Badge>
                                    <ChevronRight className="h-4 w-4" />
                                    <Badge variant="outline">{actual?.typ || 'N/A'}</Badge>
                                    {IconDone(actual?.done)}
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
                                    <Button onClick={handleDeleteActual} variant="destructive" size="sm">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </>
                            ) : (
                                <div className="flex space-x-2">
                                    <Button onClick={handleUpdateActual} size="sm" disabled={isSubmitting}>
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Actual Details</CardTitle>
                                <CardDescription>Complete information about this actual</CardDescription>
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
                                                    checked={editActual.done}
                                                    onChange={(e) => handleEditFormChange('done', e.target.checked)}
                                                    className="h-4 w-4"
                                                />
                                                <Label htmlFor="done">Done</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    id="active"
                                                    type="checkbox"
                                                    checked={editActual.active}
                                                    onChange={(e) => handleEditFormChange('active', e.target.checked)}
                                                    className="h-4 w-4"
                                                />
                                                <Label htmlFor="active">Active</Label>
                                            </div>
                                             {/* Type Field */}
                                            <div className="space-y-2">
                                                <Label htmlFor="typ">Type</Label>
                                                <Select
                                                    value={editActual.typ || 'expense'}
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

                                        {/* Name Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                value={editActual.name || ''}
                                                onChange={(e) => handleEditFormChange('name', e.target.value)}
                                            />
                                        </div>

                                        {/* Note Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="note">Notes</Label>
                                            <Textarea
                                                id="note"
                                                value={editActual.note || ''}
                                                onChange={(e) => handleEditFormChange('note', e.target.value)}
                                                placeholder="Additional notes"
                                                className="min-h-[100px]"
                                            />
                                        </div>

                                        {/* Assignee Field - IMPROVED */}
                                        <div className="space-y-2" data-assignee-selector>
                                            <Label>Assignee</Label>
                                            <div className="relative">
                                                {/* Show selected assignee or search input */}
                                                {editActual.assignee ? (
                                                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-3 cursor-pointer hover:bg-blue-100"
                                                        onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                                                    >
                                                        <div className="flex items-center space-x-2 flex-1">
                                                            <div className="text-green-600 font-bold">✓</div>
                                                            <div>
                                                                <div className="font-medium text-sm">
                                                                    {users.find(u => u._id === editActual.assignee)?.name}
                                                                </div>
                                                                <div className="text-xs text-gray-600">
                                                                    {users.find(u => u._id === editActual.assignee)?.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditActual(prev => ({
                                                                    ...prev,
                                                                    assignee: null
                                                                }));
                                                                setSearchTerm('');
                                                                setIsAssigneeDropdownOpen(false);
                                                            }}
                                                            className="text-gray-500 hover:text-red-600 font-bold text-lg ml-2"
                                                            title="Clear assignee"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <Input
                                                        placeholder="Search and select assignee..."
                                                        value={searchTerm}
                                                        onChange={(e) => {
                                                            setSearchTerm(e.target.value);
                                                            setIsAssigneeDropdownOpen(true);
                                                        }}
                                                        onFocus={() => setIsAssigneeDropdownOpen(true)}
                                                        className="cursor-pointer"
                                                    />
                                                )}

                                                {/* Dropdown menu */}
                                                {isAssigneeDropdownOpen && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg top-full">
                                                        {/* Clear/None option */}
                                                        {editActual.assignee && (
                                                            <div
                                                                className="px-4 py-3 cursor-pointer hover:bg-red-50 border-b flex items-center justify-between"
                                                                onClick={() => {
                                                                    setEditActual(prev => ({
                                                                        ...prev,
                                                                        assignee: null
                                                                    }));
                                                                    setSearchTerm('');
                                                                    setIsAssigneeDropdownOpen(false);
                                                                }}
                                                            >
                                                                <div className="text-sm text-gray-600">No assignee</div>
                                                            </div>
                                                        )}

                                                        {/* User list - Limited to 3 rows */}
                                                        <div className="max-h-[9rem] overflow-y-auto">
                                                            {filteredUsers.length > 0 ? (
                                                                filteredUsers.map(user => (
                                                                    <div
                                                                        key={user._id}
                                                                        className={`px-4 py-3 cursor-pointer hover:bg-blue-50 flex justify-between items-center border-b last:border-b-0 transition-colors ${
                                                                            editActual.assignee === user._id ? 'bg-blue-100' : ''
                                                                        }`}
                                                                        onClick={() => {
                                                                            setEditActual(prev => ({
                                                                                ...prev,
                                                                                assignee: user._id
                                                                            }));
                                                                            setSearchTerm('');
                                                                            setIsAssigneeDropdownOpen(false);
                                                                        }}
                                                                    >
                                                                        <div>
                                                                            <div className="font-medium text-sm">{user.name}</div>
                                                                            <div className="text-xs text-gray-500">{user.email}</div>
                                                                        </div>
                                                                        {editActual.assignee === user._id && (
                                                                            <div className="text-green-600 font-bold text-lg">✓</div>
                                                                        )}
                                                                    </div>
                                                                ))
                                                            ) : searchTerm.trim() !== '' ? (
                                                                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                                                    No users found
                                                                </div>
                                                            ) : (
                                                                filteredUsers.length === 0 && !searchTerm && (
                                                                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                                                        No users available
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Amount Information */}
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-medium">Amount Information</h3>
                                                <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="amount">Amount</Label>
                                                        <NumberInput
                                                            id="amount"
                                                            value={editActual.amount}
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
                                                                    value={editActual.detailedAmount.currency}
                                                                    onChange={(e) => handleEditFormChange('detailedAmount.currency', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="detailedAmountValue">Value</Label>
                                                                <NumberInput
                                                                    id="detailedAmountValue"
                                                                    value={editActual.detailedAmount.value}
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
                                                                    value={editActual.detailedAmount.exRate}
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
                                                value={editActual.dateEx || ''}
                                                onChange={(e) => handleEditFormChange('dateEx', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <Tag className="h-5 w-5 text-muted-foreground" />
                                                    <div>
                                                        <div className="text-sm text-muted-foreground">Project</div>
                                                        <div className="font-medium">
                                                            {typeof actual?.project === 'object' && actual?.project !== null && 'name' in (actual?.project || {})
                                                                ? (
                                                                    <button
                                                                        onClick={() => navigate(`/finance/project/${(actual?.project as any)?._id}`)}
                                                                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                                                        title={`View project: ${(actual?.project as any)?.name}`}
                                                                    >
                                                                        {(actual?.project as any)?.name}
                                                                    </button>
                                                                )
                                                                : (typeof actual?.project === 'string' ? actual?.project : 'N/A')
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Power className="h-5 w-5 text-muted-foreground" />
                                                    <div>
                                                        <div className="text-sm text-muted-foreground">Active</div>
                                                        <div className="font-medium">{IconActive(actual?.active !== undefined ? actual?.active : true)}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Type className="h-5 w-5 text-muted-foreground" />
                                                    <div>
                                                        <div className="text-sm text-muted-foreground">Type</div>
                                                        <div className="font-medium">{actual?.typ}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <CheckLine className="h-5 w-5 text-muted-foreground" />
                                                    <div>
                                                        <div className="text-sm text-muted-foreground">Done</div>
                                                        <div className="font-medium">
                                                            {actual?.done ? 'true' : 'false'}
                                                        </div>
                                                    </div>
                                                </div>
                                                {actual?.budget && (
                                                    <div className="flex items-center gap-3">
                                                        <Tag className="h-5 w-5 text-muted-foreground" />
                                                        <div>
                                                            <div className="text-sm text-muted-foreground">Budget</div>
                                                            <div className="font-medium">
                                                                <button
                                                                    onClick={() => navigate(`/finance/budget/${(actual?.budget as any)?._id}`)}
                                                                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                                                    title={`View budget: ${(actual?.budget as any)?.name}`}
                                                                >
                                                                    {(actual?.budget as any)?.name}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Assignee Field - NEW */}
                                                {actual?.assignee && (
                                                    <div className="flex items-center gap-3">
                                                        <Tag className="h-5 w-5 text-muted-foreground" />
                                                        <div>
                                                            <div className="text-sm text-muted-foreground">Assignee</div>
                                                            <div className="font-medium">
                                                                {(actual?.assignee as any)?.name || 'N/A'}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {(actual?.assignee as any)?.email || 'N/A'}
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
                                                            <div className="font-medium">{formatCurrency(actual?.amount || 0)}</div>
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
                                                                    <div className="font-medium">{actual?.detailedAmount?.currency || 'IDR'}</div>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <div className="text-sm text-muted-foreground">Value</div>
                                                                    <div className="font-medium">{formatCurrency(actual?.detailedAmount?.value || 0)}</div>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <div className="text-sm text-muted-foreground">Exchange Rate</div>
                                                                    <div className="font-medium">x{actual?.detailedAmount?.exRate || 1}</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {actual?.note && actual?.note.trim() !== '' && (
                                                    <div>
                                                        <div className="text-sm text-muted-foreground mb-1">Notes</div>
                                                        <div className="font-medium p-3 bg-muted rounded-lg">{actual?.note}</div>
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
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Date Executed</div>
                                        <div className="font-medium">
                                            {actual?.dateEx ? formatDate(actual?.dateEx) : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {actual?.updatedBy && typeof actual?.updatedBy === 'object' && actual?.updatedBy !== null && (
                                    <div>
                                        <div className="text-sm text-muted-foreground">Updated By</div>
                                        <div className="font-medium">{(actual?.updatedBy as any)?.name || 'N/A'}</div>
                                        <div className="text-sm text-muted-foreground">{(actual?.updatedBy as any)?.email || 'N/A'}</div>
                                    </div>
                                )}

                                {actual?.assignee && typeof actual?.assignee === 'object' && actual?.assignee !== null && (
                                    <div>
                                        <div className="text-sm text-muted-foreground">Assignee</div>
                                        <div className="font-medium">{(actual?.assignee as any)?.name || 'N/A'}</div>
                                        <div className="text-sm text-muted-foreground">{(actual?.assignee as any)?.email || 'N/A'}</div>
                                    </div>
                                )}

                                <div>
                                    <div className="text-sm text-muted-foreground">Last Updated</div>
                                    <div className="font-medium">
                                        {actual?.updatedAt ? formatDate(actual?.updatedAt) : 'N/A'}
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
                            Are you sure you want to delete the actual "{actual?.name || 'this actual'}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteActual} disabled={isSubmitting}>
                            {isSubmitting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
