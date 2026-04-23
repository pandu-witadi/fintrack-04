import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeftFromLine,
    Edit,
    Trash2,
    ChevronRight,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { trxService, Trx } from '@/services/trxService.ts';
import { actualService } from '@/services/actualService';
import { userService, User as UserType, DepositTrx } from '@/services/userService.ts';
import { format } from 'date-fns';
import { IconType } from '@/components/IconType';
import { IconDone } from '@/components/IconDone';
import ActualTable from './ActualTable';
import DepositTable from '../UserDetail/DepositTable';
import DepositDialogs from '../UserDetail/DepositDialogs';
import TrxDetailsCard, { EditTrxData } from './TrxDetailsCard';
import TrxSidebar from './TrxSidebar';

export default function TrxDetail() {
    const navigate = useNavigate();
    const { id: trxId } = useParams<{ id: string }>();

    const [trx, setTrx] = useState<Trx | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [assigneeUser, setAssigneeUser] = useState<UserType | null>(null);
    const [isAddDepositOpen, setIsAddDepositOpen] = useState(false);
    const [isEditDepositOpen, setIsEditDepositOpen] = useState(false);
    const [isDeleteDepositOpen, setIsDeleteDepositOpen] = useState(false);
    const [editDepositTrx, setEditDepositTrx] = useState<DepositTrx | null>(null);
    const [deleteDepositTrx, setDeleteDepositTrx] = useState<DepositTrx | null>(null);
    const [depositSort, setDepositSort] = useState<{ key: 'date' | 'amount'; direction: 'asc' | 'desc' } | null>(null);
    const [newDeposit, setNewDeposit] = useState({
        amount: 0,
        date: format(new Date(), 'yyyy-MM-dd'),
        note: '',
    });

    const [editTrx, setEditTrx] = useState<EditTrxData>({
        active: true,
        done: false,
        name: '',
        typ: 'expense',
        amount: 0,
        actAmount: 0,
        isEq: true,
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

    useEffect(() => {
        if (trxId) {
            fetchTrxDetails(trxId);
        }
    }, [trxId]);

    useEffect(() => {
        if (trx?.assignee && typeof trx.assignee === 'object' && (trx.assignee as any)._id) {
            fetchAssigneeUser((trx.assignee as any)._id);
        } else {
            setAssigneeUser(null);
        }
    }, [trx?.assignee]);

    const fetchAssigneeUser = async (assigneeId: string) => {
        try {
            const userData = await userService.getUserById(assigneeId);
            setAssigneeUser(userData);
        } catch (err) {
            console.error('Failed to fetch assignee user details:', err);
            setAssigneeUser(null);
        }
    };

    const handleAssigneeChange = async (assigneeId: string | null) => {
        setEditTrx(prev => ({
            ...prev,
            assignee: assigneeId
        }));

        if (assigneeId) {
            try {
                const selectedUser = await userService.getUserById(assigneeId);
                setAssigneeUser(selectedUser);
                if (selectedUser?.bankInfo) {
                    setEditTrx(prev => ({
                        ...prev,
                        assignee: assigneeId,
                        recv: {
                            bankName: selectedUser.bankInfo?.bankName || '',
                            accNo: selectedUser.bankInfo?.accNo || '',
                            accName: selectedUser.bankInfo?.accName || ''
                        }
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch user details:', err);
                setAssigneeUser(null);
            }
        } else {
            setAssigneeUser(null);
        }
    };

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
                actAmount: trxData.actAmount || 0,
                isEq: trxData.isEq !== undefined ? trxData.isEq : true,
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

    const handleEditFormChange = (field: string, value: string | number | boolean | object | null) => {
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
                actAmount: !editTrx.isEq ? editTrx.actAmount : undefined,
                isEq: editTrx.isEq,
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
            const id = (trx as any)._id || '';
            await trxService.deleteTrx(id);

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
                actAmount: trx.actAmount || 0,
                isEq: trx.isEq !== undefined ? trx.isEq : true,
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

    // --- Deposit Handlers ---
    const handleDepositSort = (key: 'date' | 'amount') => {
        setDepositSort(prev => {
            if (prev && prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const handleAddDeposit = async () => {
        if (!assigneeUser) return;

        if (newDeposit.amount === 0 || newDeposit.amount === undefined || newDeposit.amount === null) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            setIsSubmitting(true);
            const currentDeposits = assigneeUser.deposit || [];
            const newTrx: Omit<DepositTrx, '_id'> = {
                amount: newDeposit.amount,
                date: new Date(newDeposit.date).toISOString(),
                note: newDeposit.note,
            };

            await userService.updateUser(assigneeUser._id, {
                deposit: [...currentDeposits, newTrx as unknown as DepositTrx]
            });

            await fetchAssigneeUser(assigneeUser._id);
            toast.success('Deposit added successfully');
            setIsAddDepositOpen(false);
            setNewDeposit({
                amount: 0,
                date: format(new Date(), 'yyyy-MM-dd'),
                note: '',
            });
        } catch (error) {
            toast.error('Failed to add deposit');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditDepositClick = (trx: DepositTrx) => {
        setEditDepositTrx(trx);
        setNewDeposit({
            amount: trx.amount,
            date: format(new Date(trx.date), 'yyyy-MM-dd'),
            note: trx.note,
        });
        setIsEditDepositOpen(true);
    };

    const handleUpdateDeposit = async () => {
        if (!assigneeUser || !editDepositTrx) return;

        if (newDeposit.amount === 0 || newDeposit.amount === undefined || newDeposit.amount === null) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            setIsSubmitting(true);
            const updatedDeposits = assigneeUser.deposit?.map((d: DepositTrx) =>
                d._id === editDepositTrx._id
                    ? { ...d, amount: newDeposit.amount, date: new Date(newDeposit.date).toISOString(), note: newDeposit.note }
                    : d
            ) || [];

            await userService.updateUser(assigneeUser._id, {
                deposit: updatedDeposits
            });

            await fetchAssigneeUser(assigneeUser._id);
            toast.success('Deposit updated successfully');
            setIsEditDepositOpen(false);
            setEditDepositTrx(null);
            setNewDeposit({
                amount: 0,
                date: format(new Date(), 'yyyy-MM-dd'),
                note: '',
            });
        } catch (error) {
            toast.error('Failed to update deposit');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteDepositClick = (trx: DepositTrx) => {
        setDeleteDepositTrx(trx);
        setIsDeleteDepositOpen(true);
    };

    const handleConfirmDeleteDeposit = async () => {
        if (!assigneeUser || !deleteDepositTrx) return;

        try {
            setIsSubmitting(true);
            const updatedDeposits = assigneeUser.deposit?.filter((d: DepositTrx) => d._id !== deleteDepositTrx._id) || [];

            await userService.updateUser(assigneeUser._id, {
                deposit: updatedDeposits
            });

            await fetchAssigneeUser(assigneeUser._id);
            toast.success('Deposit deleted successfully');
            setIsDeleteDepositOpen(false);
            setDeleteDepositTrx(null);
        } catch (error) {
            toast.error('Failed to delete deposit');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
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

    if (!trx) {
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
                                <ArrowLeftFromLine className="h-4 w-4" />
                            </Button>
                            <div>
                                <h2 className="text-2xl font-bold">{trx?.name || 'Unnamed Transaction'}</h2>
                                <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="outline" className="rounded-none">trx</Badge>
                                    <ChevronRight className="h-4 w-4" />
                                    {IconType(trx?.typ || 'expense')}
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
                        <TrxDetailsCard
                            trx={trx}
                            isEditing={isEditing}
                            editTrx={editTrx}
                            isSubmitting={isSubmitting}
                            onEditFormChange={handleEditFormChange}
                            onUpdate={handleUpdateTrx}
                            onCancel={handleCancel}
                            onEditStart={() => setIsEditing(true)}
                            onAssigneeChange={handleAssigneeChange}
                        />

                        {/* Deposit Section - shown when assignee is selected */}
                        {assigneeUser && (
                            <DepositTable
                                deposits={assigneeUser.deposit}
                                total={assigneeUser.total}
                                depositSort={depositSort}
                                onSort={handleDepositSort}
                                onAdd={() => setIsAddDepositOpen(true)}
                                onEdit={handleEditDepositClick}
                                onDelete={handleDeleteDepositClick}
                            />
                        )}
                    </div>

                    {/* Sidebar */}
                    <TrxSidebar trx={trx} trxId={trxId} />
                </div>
                {/* Related Actuals Table */}
                {trx?.lActual && trx.lActual.length > 0 && (
                    <ActualTable
                        actuals={trx.lActual}
                        onDelete={handleDeleteActual}
                    />
                )}
            </main>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the transaction &quot;{trx?.name || 'this transaction'}&quot;? This action cannot be undone.
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

            <DepositDialogs
                userName={assigneeUser?.name}
                isAddOpen={isAddDepositOpen}
                onAddOpenChange={setIsAddDepositOpen}
                isEditOpen={isEditDepositOpen}
                onEditOpenChange={setIsEditDepositOpen}
                isDeleteOpen={isDeleteDepositOpen}
                onDeleteOpenChange={setIsDeleteDepositOpen}
                newDeposit={newDeposit}
                onNewDepositChange={setNewDeposit}
                onAdd={handleAddDeposit}
                onEdit={handleUpdateDeposit}
                onDelete={handleConfirmDeleteDeposit}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
