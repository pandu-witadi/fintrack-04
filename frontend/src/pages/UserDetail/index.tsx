import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeftFromLine,
    Trash2,
    Calendar,
    ChevronRight,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { userService, User, UserRole, DepositTrx } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

import UserInfoCard, { EditUserData } from './UserInfoCard';
import DepositTable from './DepositTable';
import DepositDialogs from './DepositDialogs';

export default function UserDetail() {
    const navigate = useNavigate();
    const { id: userId } = useParams<{ id: string }>();
    const { user: currentUser, updateProfile } = useAuth();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const [editUser, setEditUser] = useState<EditUserData>({
        name: '',
        email: '',
        phone: '',
        note: '',
        role: 'user',
        active: true,
        bankName: '',
        accNo: '',
        accName: '',
    });

    const isAdmin = currentUser?.role === 'admin';
    const isOwnProfile = currentUser?._id === userId;

    useEffect(() => {
        if (userId) {
            fetchUserDetails(userId);
        }
    }, [userId]);

    const fetchUserDetails = async (id: string) => {
        try {
            setLoading(true);
            const userData = await userService.getUserById(id);
            setUser(userData);
            setEditUser({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                note: userData.note || '',
                role: userData.role || 'user',
                active: userData.active !== undefined ? userData.active : true,
                bankName: userData.bankInfo?.bankName || '',
                accNo: userData.bankInfo?.accNo || '',
                accName: userData.bankInfo?.accName || '',
            });
        } catch (err) {
            setError('Failed to fetch user details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditFormChange = (field: string, value: string | boolean) => {
        setEditUser(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUpdateUser = async () => {
        if (!user || !userId) return;

        try {
            setIsSubmitting(true);

            if (isOwnProfile) {
                await updateProfile({
                    name: editUser.name,
                    email: editUser.email,
                    phone: editUser.phone,
                    note: editUser.note,
                    bankInfo: {
                        bankName: editUser.bankName,
                        accNo: editUser.accNo,
                        accName: editUser.accName,
                    }
                });
            } else if (isAdmin) {
                await userService.updateUser(userId, {
                    name: editUser.name,
                    email: editUser.email,
                    role: editUser.role,
                    active: editUser.active,
                    phone: editUser.phone,
                    note: editUser.note,
                    bankInfo: {
                        bankName: editUser.bankName,
                        accNo: editUser.accNo,
                        accName: editUser.accName,
                    }
                });
            }

            await fetchUserDetails(userId);
            toast.success('User updated successfully');
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to update user');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = () => {
        setIsDeleteConfirmOpen(true);
    };

    const confirmDeleteUser = async () => {
        if (!user || !userId) return;

        try {
            setIsSubmitting(true);
            await userService.deleteUser(userId);
            toast.success('User deleted successfully');
            setIsDeleteConfirmOpen(false);
            navigate(-1);
        } catch (error) {
            toast.error('Failed to delete user');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelEdit = () => {
        if (user) {
            setEditUser({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                note: user.note || '',
                role: user.role || 'user',
                active: user.active !== undefined ? user.active : true,
                bankName: user.bankInfo?.bankName || '',
                accNo: user.bankInfo?.accNo || '',
                accName: user.bankInfo?.accName || '',
            });
        }
        setIsEditing(false);
    };

    const handleDepositSort = (key: 'date' | 'amount') => {
        setDepositSort(prev => {
            if (prev && prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const handleAddDeposit = async () => {
        if (!user || !userId) return;

        if (newDeposit.amount === 0 || newDeposit.amount === undefined || newDeposit.amount === null) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            setIsSubmitting(true);
            const currentDeposits = user.deposit || [];
            const newTrx: Omit<DepositTrx, '_id'> = {
                amount: newDeposit.amount,
                date: new Date(newDeposit.date).toISOString(),
                note: newDeposit.note,
            };

            await userService.updateUser(userId, {
                deposit: [...currentDeposits, newTrx as unknown as DepositTrx]
            });

            await fetchUserDetails(userId);
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
        if (!user || !userId || !editDepositTrx) return;

        if (newDeposit.amount === 0 || newDeposit.amount === undefined || newDeposit.amount === null) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            setIsSubmitting(true);
            const updatedDeposits = user.deposit?.map(d =>
                d._id === editDepositTrx._id
                    ? { ...d, amount: newDeposit.amount, date: new Date(newDeposit.date).toISOString(), note: newDeposit.note }
                    : d
            ) || [];

            await userService.updateUser(userId, {
                deposit: updatedDeposits
            });

            await fetchUserDetails(userId);
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
        if (!user || !userId || !deleteDepositTrx) return;

        try {
            setIsSubmitting(true);
            const updatedDeposits = user.deposit?.filter(d => d._id !== deleteDepositTrx._id) || [];

            await userService.updateUser(userId, {
                deposit: updatedDeposits
            });

            await fetchUserDetails(userId);
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

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
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
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={() => navigate(-1)} className="w-full">
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!user) {
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
                        <CardTitle>User Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">The requested user could not be found.</p>
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
                                <h2 className="text-2xl font-bold">{user?.name || 'Unnamed User'}</h2>
                                <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="outline" className="rounded-none">user</Badge>
                                    <ChevronRight className="h-4 w-4" />
                                    <Badge variant="secondary">{user?.role}</Badge>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {isAdmin && !isOwnProfile && (
                                <Button onClick={handleDeleteUser} variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
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
                        <UserInfoCard
                            user={user}
                            isEditing={isEditing}
                            editUser={editUser}
                            isAdmin={isAdmin}
                            isOwnProfile={isOwnProfile}
                            onEditFormChange={handleEditFormChange}
                            onUpdate={handleUpdateUser}
                            onCancel={handleCancelEdit}
                            onEditStart={() => setIsEditing(true)}
                            isSubmitting={isSubmitting}
                        />

                        <DepositTable
                            deposits={user.deposit}
                            total={user.total}
                            depositSort={depositSort}
                            onSort={handleDepositSort}
                            onAdd={() => setIsAddDepositOpen(true)}
                            onEdit={handleEditDepositClick}
                            onDelete={handleDeleteDepositClick}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-orange-500">Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Last Access</div>
                                        <div className="font-medium">
                                            {user?.lastAccess ? formatDateTime(user?.lastAccess) : 'Never'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Created</div>
                                        <div className="font-medium">
                                            {formatDateTime((user as any)?.createdAt)}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Last Updated</div>
                                    <div className="font-medium">
                                        {formatDateTime((user as any)?.updatedAt)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Delete User Confirmation Dialog */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the user &quot;{user?.name || 'this user'}&quot;? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteUser} disabled={isSubmitting}>
                            {isSubmitting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DepositDialogs
                userName={user?.name}
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
