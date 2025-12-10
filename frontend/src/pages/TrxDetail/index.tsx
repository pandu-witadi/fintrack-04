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
    CreditCard,
    User,
    Upload,
    X,
    Loader2
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
import { trxService, Trx } from '@/services/trxService.ts';
import { userService, User as UserType } from '@/services/userService.ts';
import { actualService } from '@/services/actualService';
import { uploadService } from '@/services/uploadService';
import formatCurrency from '@/utils/formatCurrency';
import { IconActive } from '@/components/IconActive';
import { IconDone } from '@/components/IconDone';
import ActualTable from './ActualTable';
import { useUpload } from '@/hooks/useUpload';


export default function TrxDetail() {
    const navigate = useNavigate();
    const { id: trxId } = useParams<{ id: string }>();
    const { uploadImage, removeImage, uploading: isUploadingImage, error: uploadError, clearError } = useUpload();

    const [trx, setTrx] = useState<Trx | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [users, setUsers] = useState<UserType[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Update the editTrx state to include assignee and bank info
    const [editTrx, setEditTrx] = useState<{
        active: boolean;
        done: boolean;
        name: string;
        typ: 'income' | 'expense';
        amount: number;
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
        assignee: null,
        sndr: {
            bankName: '',
            accNo: '',
            accName: ''
        },
        recv: {
            bankName: '',
            accNo: '',
            accName: ''
        }
    });
    const [expandedAmountDetails, setExpandedAmountDetails] = useState(false);
    const [expandedAmountDetailsView, setExpandedAmountDetailsView] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [removingImageId, setRemovingImageId] = useState<string | null>(null);

    useEffect(() => {
        if (trxId) {
            fetchTrxDetails(trxId);
        }
    }, [trxId]);

    // Load existing images from trx
    useEffect(() => {
        if (trx?.img) {
            setUploadedImages([trx.img]);
        } else {
            setUploadedImages([]);
        }
    }, [trx?.img]);

    // Handle upload errors
    useEffect(() => {
        if (uploadError) {
            toast.error(uploadError);
            clearError();
        }
    }, [uploadError, clearError]);

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

    // Fetch users when entering edit mode
    useEffect(() => {
        if (isEditing) {
            fetchAllUsers();
        }
    }, [isEditing]);

    const fetchTrxDetails = async (trxId: string) => {
        try {
            setLoading(true);
            const trxData = await trxService.getTrxById(trxId);
            setTrx(trxData);
            setEditTrx({
                active: trxData.active !== undefined ? trxData.active : true,
                done: trxData.done !== undefined ? trxData.done : false,
                name: trxData.name,
                typ: trxData.typ,
                amount: trxData.amount,
                note: trxData.note || '',
                dateEx: trxData.dateEx ? new Date(trxData.dateEx).toISOString().split('T')[0] : '',
                detailedAmount: trxData.detailedAmount || {
                    currency: 'IDR',
                    value: 0,
                    exRate: 1
                },
                assignee: trxData.assignee ? trxData.assignee._id : null,
                sndr: trxData.sndr || {
                    bankName: '',
                    accNo: '',
                    accName: ''
                },
                recv: trxData.recv || {
                    bankName: '',
                    accNo: '',
                    accName: ''
                }
            });
        } catch (err) {
            setError('Failed to fetch transaction details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditFormChange = (field: string, value: string | number | boolean | object) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setEditTrx((prev: any) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setEditTrx(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleUpdateTrx = async () => {
        if (!trx || !trxId) return;

        try {
            setIsSubmitting(true);

            const updatedTrx = await trxService.updateTrx(trxId, {
                active: editTrx.active,
                done: editTrx.done,
                name: editTrx.name,
                typ: editTrx.typ,
                amount: editTrx.amount,
                note: editTrx.note,
                dateEx: editTrx.dateEx,
                assignee: editTrx.assignee || undefined,
                sndr: editTrx.sndr,
                recv: editTrx.recv
            });
            setTrx(updatedTrx);

            toast.success('Transaction updated successfully');
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to update transaction');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTrx = () => {
        setIsDeleteConfirmOpen(true);
    };

    const confirmDeleteTrx = async () => {
        if (!trx) return;

        try {
            setIsSubmitting(true);
            const trxId = (trx as any)._id || '';
            await trxService.deleteTrx(trxId);

            toast.success('Transaction deleted successfully');
            setIsDeleteConfirmOpen(false);
            navigate(-1);
        } catch (error) {
            toast.error('Failed to delete transaction');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (trx) {
            setEditTrx({
                name: trx.name,
                active: trx.active !== undefined ? trx.active : true,
                done: trx.done !== undefined ? trx.done : false,
                typ: trx.typ,
                amount: trx.amount,
                note: trx.note || '',
                dateEx: trx.dateEx ? new Date(trx.dateEx).toISOString().split('T')[0] : '',
                detailedAmount: trx.detailedAmount || {
                    currency: 'IDR',
                    value: 0,
                    exRate: 1
                },
                assignee: trx.assignee ? trx.assignee._id : null,
                sndr: trx.sndr || {
                    bankName: '',
                    accNo: '',
                    accName: ''
                },
                recv: trx.recv || {
                    bankName: '',
                    accNo: '',
                    accName: ''
                }
            });
        }
        setIsEditing(false);
    };

    const handleDeleteActual = async (actual: any) => {
        try {
            await actualService.deleteActual(actual._id);
            toast.success('Actual deleted successfully');
        } catch (error) {
            toast.error('Failed to delete actual');
            console.error(error);
        }
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

    if (!trx) {
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
                        <CardTitle>Transaction Not Found</CardTitle>
                        <CardDescription>The requested transaction could not be found.</CardDescription>
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
                                <h1 className="text-2xl font-bold">{trx?.name || 'Unnamed Transaction'}</h1>
                                <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="outline">transaction</Badge>
                                    <ChevronRight className="h-4 w-4" />
                                    <Badge variant="outline">{trx?.typ || 'N/A'}</Badge>
                                    {IconDone(trx?.done)}
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
                                    <Button onClick={handleDeleteTrx} variant="destructive" size="sm">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </>
                            ) : (
                                <div className="flex space-x-2">
                                    <Button onClick={handleUpdateTrx} size="sm" disabled={isSubmitting}>
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
                                <CardTitle>Transaction Details</CardTitle>
                                <CardDescription>Complete information about this transaction</CardDescription>
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
                                                    onChange={(e) => handleEditFormChange('done', e.target.checked)}
                                                    className="h-4 w-4"
                                                />
                                                <Label htmlFor="done">Done</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    id="active"
                                                    type="checkbox"
                                                    checked={editTrx.active}
                                                    onChange={(e) => handleEditFormChange('active', e.target.checked)}
                                                    className="h-4 w-4"
                                                />
                                                <Label htmlFor="active">Active</Label>
                                            </div>
                                             {/* Type Field */}
                                            <div className="space-y-2">
                                                <Label htmlFor="typ">Type</Label>
                                                <Select
                                                    value={editTrx.typ || 'expense'}
                                                    onValueChange={(value) => handleEditFormChange('typ', value)}
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
                                                onChange={(e) => handleEditFormChange('name', e.target.value)}
                                            />
                                        </div>

                                        {/* Note Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="note">Notes</Label>
                                            <Textarea
                                                id="note"
                                                value={editTrx.note || ''}
                                                onChange={(e) => handleEditFormChange('note', e.target.value)}
                                                placeholder="Additional notes"
                                                className="min-h-[100px]"
                                            />
                                        </div>

                                        {/* Assignee Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="assignee">Assignee</Label>
                                            <div className="relative">
                                                <Input
                                                    id="assignee"
                                                    placeholder="Search users..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pr-10"
                                                />
                                                {searchTerm && (
                                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                        <button 
                                                            onClick={() => setSearchTerm('')}
                                                            className="text-gray-400 hover:text-gray-600"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                )}
                                                {filteredUsers.length > 0 && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-24 overflow-y-auto">
                                                        {filteredUsers.map(user => (
                                                            <div
                                                                key={user._id}
                                                                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center ${
                                                                    editTrx.assignee === user._id ? 'bg-blue-50' : ''
                                                                }`}
                                                                onClick={() => {
                                                                    setEditTrx(prev => ({
                                                                        ...prev,
                                                                        assignee: user._id
                                                                    }));
                                                                    setSearchTerm('');
                                                                }}
                                                            >
                                                                <div>
                                                                    <div className="font-medium">{user.name}</div>
                                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                                </div>
                                                                {editTrx.assignee === user._id && (
                                                                    <div className="text-green-500 font-bold">✓</div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {editTrx.assignee && (
                                                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                    <div className="flex items-center">
                                                        <div className="font-medium">
                                                            {users.find(u => u._id === editTrx.assignee)?.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 ml-2">
                                                            ({users.find(u => u._id === editTrx.assignee)?.email})
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setEditTrx(prev => ({
                                                            ...prev,
                                                            assignee: null
                                                        }))}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )}
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
                                                            value={editTrx.amount}
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
                                                                    value={editTrx.detailedAmount.currency}
                                                                    onChange={(e) => handleEditFormChange('detailedAmount.currency', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="detailedAmountValue">Value</Label>
                                                                <NumberInput
                                                                    id="detailedAmountValue"
                                                                    value={editTrx.detailedAmount.value}
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
                                                                    value={editTrx.detailedAmount.exRate}
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
                                                                    onChange={(e) => handleEditFormChange('sndr.bankName', e.target.value)}
                                                                    placeholder="Bank name"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="sndrAccNo">Account Number</Label>
                                                                <Input
                                                                    id="sndrAccNo"
                                                                    value={editTrx.sndr.accNo}
                                                                    onChange={(e) => handleEditFormChange('sndr.accNo', e.target.value)}
                                                                    placeholder="Account number"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="sndrAccName">Account Name</Label>
                                                                <Input
                                                                    id="sndrAccName"
                                                                    value={editTrx.sndr.accName}
                                                                    onChange={(e) => handleEditFormChange('sndr.accName', e.target.value)}
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
                                                                    onChange={(e) => handleEditFormChange('recv.bankName', e.target.value)}
                                                                    placeholder="Bank name"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="recvAccNo">Account Number</Label>
                                                                <Input
                                                                    id="recvAccNo"
                                                                    value={editTrx.recv.accNo}
                                                                    onChange={(e) => handleEditFormChange('recv.accNo', e.target.value)}
                                                                    placeholder="Account number"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="recvAccName">Account Name</Label>
                                                                <Input
                                                                    id="recvAccName"
                                                                    value={editTrx.recv.accName}
                                                                    onChange={(e) => handleEditFormChange('recv.accName', e.target.value)}
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
                                                            {typeof trx?.project === 'object' && trx?.project !== null && 'name' in (trx?.project || {})
                                                                ? (
                                                                    <button
                                                                        onClick={() => navigate(`/finance/project/${(trx?.project as any)?._id}`)}
                                                                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                                                        title={`View project: ${(trx?.project as any)?.name}`}
                                                                    >
                                                                        {(trx?.project as any)?.name}
                                                                    </button>
                                                                )
                                                                : (typeof trx?.project === 'string' ? trx?.project : 'N/A')
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
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
                                                        <div className="font-medium">{trx?.typ}</div>
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
                                            {trx?.dateEx ? formatDate(trx?.dateEx) : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {trx?.updatedBy && typeof trx?.updatedBy === 'object' && trx?.updatedBy !== null && (
                                    <div>
                                        <div className="text-sm text-muted-foreground">Updated By</div>
                                        <div className="font-medium">{(trx?.updatedBy as any)?.name || 'N/A'}</div>
                                        <div className="text-sm text-muted-foreground">{(trx?.updatedBy as any)?.email || 'N/A'}</div>
                                    </div>
                                )}

                                {trx?.assignee && typeof trx?.assignee === 'object' && trx?.assignee !== null && (
                                    <div>
                                        <div className="text-sm text-muted-foreground">Assignee</div>
                                        <div className="font-medium">{(trx?.assignee as any)?.name || 'N/A'}</div>
                                        <div className="text-sm text-muted-foreground">{(trx?.assignee as any)?.email || 'N/A'}</div>
                                    </div>
                                )}

                                <div>
                                    <div className="text-sm text-muted-foreground">Last Updated</div>
                                    <div className="font-medium">
                                        {trx?.updatedAt ? formatDate(trx?.updatedAt) : 'N/A'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Images */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Images</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                  {/* Image Preview */}
                                {uploadedImages.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium">Uploaded Images ({uploadedImages.length})</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {uploadedImages.map((imageName: string, idx: number) => (
                                                <div key={idx} className="relative group">
                                                    <img
                                                        src={uploadService.viewImage(imageName)}
                                                        alt={`Preview ${idx}`}
                                                        className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75"
                                                        onClick={() => setPreviewImage(uploadService.viewImage(imageName))}
                                                    />
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                setRemovingImageId(imageName);
                                                                await removeImage(trxId || '', imageName);
                                                                setUploadedImages(prev => prev.filter((_, i) => i !== idx));
                                                                toast.success('Image removed successfully');
                                                            } catch (err) {
                                                                toast.error('Failed to remove image');
                                                                console.error(err);
                                                            } finally {
                                                                setRemovingImageId(null);
                                                            }
                                                        }}
                                                        disabled={removingImageId === imageName || isUploadingImage}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                                                    >
                                                        {removingImageId === imageName ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <X className="h-3 w-3" />
                                                        )}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Image Upload */}
                                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 cursor-pointer transition">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const files = e.target.files;
                                            if (files && trxId) {
                                                for (let i = 0; i < files.length; i++) {
                                                    const file = files[i];
                                                    try {
                                                        const filename = await uploadImage(file, trxId);
                                                        setUploadedImages(prev => [...prev, filename]);
                                                        toast.success(`Image uploaded successfully`);
                                                    } catch (err) {
                                                        toast.error('Failed to upload image');
                                                        console.error(err);
                                                    }
                                                }
                                                // Reset input
                                                e.target.value = '';
                                            }
                                        }}
                                        className="hidden"
                                        id="image-upload"
                                        disabled={isUploadingImage}
                                    />
                                    <label htmlFor="image-upload" className={`cursor-pointer ${isUploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                                        {isUploadingImage ? (
                                            <Loader2 className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-spin" />
                                        ) : (
                                            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        )}
                                        <p className="text-sm font-medium">{isUploadingImage ? 'Uploading...' : 'Drop images here or click to upload'}</p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                {/* Related Actuals Table */}
                {trx?.lActual && trx.lActual.length > 0 && (
                    <ActualTable 
                        actuals={trx.lActual}
                        onDelete={handleDeleteActual}
                    />
                )}
            </main>

            {/* Image Preview Modal */}
            {previewImage && (
                <div 
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="bg-white rounded-lg p-4 max-w-2xl max-h-[80vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img src={previewImage} alt="Full preview" className="max-w-full max-h-full" />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the transaction "{trx?.name || 'this transaction'}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteTrx} disabled={isSubmitting}>
                            {isSubmitting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}