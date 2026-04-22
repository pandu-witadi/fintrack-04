import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import type { User } from './index';

interface UserDetailsModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedUser: User) => void;
}

export function UserDetailModal({ user, open, onOpenChange, onUpdate }: UserDetailsModalProps) {
  const { updateProfile, user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    note: '',
    bankName: '',
    accNo: '',
    accName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        note: user.note || '',
        bankName: user.bankInfo?.bankName || '',
        accNo: user.bankInfo?.accNo || '',
        accName: user.bankInfo?.accName || ''
      });
      // If viewing own profile, allow editing
      setIsEditing(user._id === currentUser?._id);
    }
  }, [user, currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Only allow users to update their own profile
      if (user._id === currentUser?._id) {
        await updateProfile({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          note: formData.note,
          bankInfo: {
            bankName: formData.bankName,
            accNo: formData.accNo,
            accName: formData.accName
          }
        });
        
        // Update the user in the parent component
        onUpdate({
          ...user,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          note: formData.note,
          bankInfo: {
            bankName: formData.bankName,
            accNo: formData.accNo,
            accName: formData.accName
          }
        });
        
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error('You can only edit your own profile');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        note: user.note || '',
        bankName: user.bankInfo?.bankName || '',
        accNo: user.bankInfo?.accNo || '',
        accName: user.bankInfo?.accName || '',
      });
    }
    setIsEditing(false);
  };

  const formatLastAccess = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View and edit user profile information
          </DialogDescription>
        </DialogHeader>
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  name="role"
                  value={user.role}
                  disabled
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Role can only be changed by administrators
                </p>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="note">Note</Label>
                <Input
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  name="status"
                  value={user.active ? 'Active' : 'Inactive'}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="lastAccess">Last Access</Label>
                <Input
                  id="lastAccess"
                  name="lastAccess"
                  value={formatLastAccess(user.lastAccess)}
                  disabled
                />
              </div>
            </div>
            
            <div className="pt-4">
              <h3 className="text-lg font-medium">Financial Information</h3>
              <p className="text-sm text-muted-foreground">
                Bank details for transactions
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="accNo">Bank Account Number</Label>
                <Input
                  id="accNo"
                  name="accNo"
                  value={formData.accNo}
                  onChange={handleInputChange}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="accName">Note</Label>
                <Textarea
                  id="accName"
                  name="accName"
                  value={formData.accName}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="createdAt">Created At</Label>
                  <Input
                    id="createdAt"
                    name="createdAt"
                    value={formatDate(user.createdAt)}
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="updatedAt">Updated At</Label>
                  <Input
                    id="updatedAt"
                    name="updatedAt"
                    value={formatDate(user.updatedAt)}
                    disabled
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2 sm:space-x-0">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <div className="mt-1 p-2 bg-muted rounded-md">
                  {user.name}
                </div>
              </div>
              <div>
                <Label>Role</Label>
                <div className="mt-1 p-2 bg-muted rounded-md">
                  {user.role}
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <div className="mt-1 p-2 bg-muted rounded-md">
                  {user.email}
                </div>
              </div>
              <div>
                <Label>Phone</Label>
                <div className="mt-1 p-2 bg-muted rounded-md">
                  {user.phone || 'Not provided'}
                </div>
              </div>
              <div>
                <Label>Note</Label>
                <div className="mt-1 p-2 bg-muted rounded-md">
                  {user.note || 'Not provided'}
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1 p-2 bg-muted rounded-md">
                  {user.active ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-red-600">Inactive</span>
                  )}
                </div>
              </div>
              <div>
                <Label>Last Access</Label>
                <div className="mt-1 p-2 bg-muted rounded-md">
                  {formatLastAccess(user.lastAccess)}
                </div>
              </div>
            </div>
            
            {(user.bankInfo?.bankName || user.bankInfo?.accNo) && (
              <>
                <div className="pt-4">
                  <h3 className="text-lg font-medium">Financial Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Bank details for transactions
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.bankInfo?.bankName && (
                    <div>
                      <Label>Bank Name</Label>
                      <div className="mt-1 p-2 bg-muted rounded-md">
                        {user.bankInfo?.bankName}
                      </div>
                    </div>
                  )}
                  {user.bankInfo?.accNo && (
                    <div>
                      <Label>Account Number</Label>
                      <div className="mt-1 p-2 bg-muted rounded-md">
                        {user.bankInfo?.accNo}
                      </div>  
                    </div>
                  )}
                  {user.bankInfo?.accName && (
                    <div className="md:col-span-2">
                      <Label>Note</Label>
                      <div className="mt-1 p-2 bg-muted rounded-md">
                        {user.bankInfo?.accName}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            
            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Created At</Label>
                <div className="mt-1 p-2 bg-muted rounded-md">
                  {formatDate(user.createdAt)}
                </div>
              </div>
              <div>
                <Label>Updated At</Label>
                <div className="mt-1 p-2 bg-muted rounded-md">
                  {formatDate(user.updatedAt)}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              {user._id === currentUser?._id && (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}