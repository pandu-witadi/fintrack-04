import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { 
    Card, 
    CardContent, 
    // CardDescription, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { UserDetailModal } from '@/pages/AllUser/UserDetailModal';
import AddUserForm from '@/pages/AllUser/AddUserForm';
import { UsersTable } from '@/pages/AllUser/UserTable';
import { useUser } from '@/hooks/useUser.ts';

import { User as AuthUser } from '@/services/userService';

export interface User extends AuthUser {
    createdAt: string;
    updatedAt: string;
    projectCount?: number;
}

export default function AllUser() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [sortField, setSortField] = useState<'active' | 'name' | 'role' | 'lastAccess'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const { token, user: currentUser } = useAuth();
    const { users: hookUsers, getAllUsers, getUserById, updateUser: updateUserViaHook, deleteUser: deleteUserViaHook, registerUser } = useUser();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    // Check if current user has permission to add users
    const canAddUsers = !!(currentUser && (currentUser.role === 'admin' || currentUser.role === 'root'));

    const handleSort = (field: 'active' | 'name' | 'role' | 'lastAccess') => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const sortedUsers = [...users].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
            case 'active':
                aValue = a.active ? 1 : 0;
                bValue = b.active ? 1 : 0;
                break;
            case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case 'role':
                aValue = a.role.toLowerCase();
                bValue = b.role.toLowerCase();
                break;
            case 'lastAccess':
                aValue = a.lastAccess ? new Date(a.lastAccess).getTime() : 0;
                bValue = b.lastAccess ? new Date(b.lastAccess).getTime() : 0;
                break;
            default:
                return 0;
        }

        if (sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
    });

    // Hook to fetch users when component mounts
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setError(null);
                if (!token) return;
                
                // Fetch real users from backend using useUser hook
                await getAllUsers();
            } catch (error) {
                console.error('Failed to fetch users:', error);
                setError('Failed to fetch users. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [token, getAllUsers]);

    // Update local users state when hook's users change
    useEffect(() => {
        setUsers(hookUsers as User[]);
    }, [hookUsers]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(users.map(user => user._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        }
    };

    const handleViewDetails = async (user: User) => {
        try {
            // If we already have full user details, use them
            if (user.updatedAt) {
                setSelectedUser(user);
                setIsModalOpen(true);
                return;
            }
            
            // Otherwise fetch full user details from backend using useUser hook
            if (!token) return;
            
            const fullUser = await getUserById(user._id);
            setSelectedUser(fullUser as User);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Failed to fetch user details:', error);
            // Fallback to the user we already have
            setSelectedUser(user);
            setIsModalOpen(true);
        }
    };

    const handleDeleteUser = (user: User) => {
        setUserToDelete(user);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete || !token) return;
        
        try {
            // Delete user using useUser hook
            const response = await deleteUserViaHook(userToDelete._id);
            
            if (response.success) {
                // Remove the user from the state
                setUsers(prevUsers => prevUsers.filter(user => user._id !== userToDelete._id));
                toast.success('User deleted successfully');
            } else {
                toast.error('Failed to delete user');
            }
        } catch (error) {
            toast.error('Failed to delete user');
            console.error('Delete error:', error);
        } finally {
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const handleUserUpdate = (updatedUser: User) => {
        // Update the user in the users list
        setUsers(prevUsers => 
            prevUsers.map(user => user._id === updatedUser._id ? updatedUser : user)
        );
        
        // If this is the currently selected user, update that too
        if (selectedUser && selectedUser._id === updatedUser._id) {
            setSelectedUser(updatedUser);
        }
    };

    const handleAddUser = () => {
        setUserToEdit(null);
        setIsFormModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setUserToEdit(user);
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            if (!token) return;
            
            if (userToEdit) {
                // Update existing user using useUser hook
                const response = await updateUserViaHook(userToEdit._id, data);
                
                if (response.success) {
                    // Fetch the updated user from backend to ensure fresh data
                    try {
                        const freshUser = await getUserById(userToEdit._id);
                        const updatedUser: User = {
                            ...freshUser,
                            updatedAt: new Date().toISOString()
                        } as User;
                        handleUserUpdate(updatedUser);
                        // Close the details modal if open
                        setIsModalOpen(false);
                        setSelectedUser(null);
                        toast.success('User updated successfully');
                    } catch (fetchError) {
                        // Fallback if fresh fetch fails - use response data
                        const updatedUser: User = {
                            ...response.pyd,
                            updatedAt: new Date().toISOString()
                        } as User;
                        handleUserUpdate(updatedUser);
                        setIsModalOpen(false);
                        setSelectedUser(null);
                        toast.success('User updated successfully');
                    }
                }
            } else {
                // Create new user using useUser hook
                const response = await registerUser(token, data);
                if (response.success) {
                    const newUser: User = {
                        ...response.pyd,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    } as User;
                    setUsers(prev => [...prev, newUser]);
                    toast.success('User created successfully');
                }
            }
            setIsFormModalOpen(false);
            setUserToEdit(null);
        } catch (error) {
            toast.error(userToEdit ? 'Failed to update user' : 'Failed to create user');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">All Users</h1>
                    <p className="text-muted-foreground">Manage and view all users in the system</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8">
                            <p className="text-red-600 font-semibold">{error}</p>
                            <Button onClick={() => window.location.reload()} className="mt-4">
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">All Users</h1>
                {/* <p className="text-muted-foreground">Manage and view all users in the system</p> */}
              </div>
              {canAddUsers && (
                <Button onClick={handleAddUser}>
                  Add User
                </Button>
              )}
            </div>

            <Card>
              <CardHeader>
                {/* <CardTitle>Users</CardTitle> */}
                {/* <CardDescription>
                  A list of all users in the system
                </CardDescription> */}
              </CardHeader>
              <CardContent>
                <UsersTable
                  users={sortedUsers}
                  selectedIds={selectedIds}
                  onSelectAll={handleSelectAll}
                  onSelectRow={handleSelectRow}
                  onViewDetails={handleViewDetails}
                  onEditUser={handleEditUser}
                  onDeleteUser={handleDeleteUser}
                  canAddUsers={canAddUsers}
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                
                {sortedUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-muted-foreground">
                    {selectedIds.length > 0 
                      ? `${selectedIds.length} of ${users.length} user(s) selected` 
                      : `${sortedUsers.length} user(s) total`}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {selectedUser && (
              <UserDetailModal 
                user={selectedUser} 
                open={isModalOpen} 
                onOpenChange={setIsModalOpen}
                onUpdate={(updatedUser) => {
                  handleUserUpdate({
                    ...updatedUser,
                    createdAt: updatedUser.createdAt,
                    updatedAt: updatedUser.updatedAt,
                  } as User);
                }}
              />
            )}
            
            {canAddUsers && (
              <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{userToEdit ? 'Edit User' : 'Add User'}</DialogTitle>
                  </DialogHeader>
                  <AddUserForm 
                    user={userToEdit || undefined}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsFormModalOpen(false)}
                    isSubmitting={isSubmitting}
                  />
                </DialogContent>
              </Dialog>
            )}
            
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p>Are you sure you want to delete the user <strong>{userToDelete?.name}</strong>?</p>
                  <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={confirmDeleteUser}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
    );
}