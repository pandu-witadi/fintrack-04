import { Power, Tag, Mail, Phone, StickyNote, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, UserRole } from '@/services/userService';
import { IconActive } from '@/components/IconActive';

export interface EditUserData {
    name: string;
    email: string;
    phone: string;
    note: string;
    role: UserRole;
    active: boolean;
    bankName: string;
    accNo: string;
    accName: string;
}

interface UserInfoCardProps {
    user: User;
    isEditing: boolean;
    editUser: EditUserData;
    isAdmin: boolean;
    isOwnProfile: boolean;
    onEditFormChange: (field: string, value: string | boolean) => void;
    onUpdate: () => void;
    onCancel: () => void;
    onEditStart: () => void;
    isSubmitting: boolean;
}

export default function UserInfoCard({
    user,
    isEditing,
    editUser,
    isAdmin,
    isOwnProfile,
    onEditFormChange,
    onUpdate,
    onCancel,
    onEditStart,
    isSubmitting,
}: UserInfoCardProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>User Details</CardTitle>
                        <CardDescription>Complete information about this user</CardDescription>
                    </div>
                    {(isAdmin || isOwnProfile) && !isEditing && (
                        <Button onClick={onEditStart} variant="outline" size="sm">
                            Edit
                        </Button>
                    )}
                    {isEditing && (
                        <div className="flex space-x-2">
                            <Button onClick={onUpdate} size="sm" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                            <Button onClick={onCancel} variant="outline" size="sm">
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <div className="space-y-6">
                        {/* Toggle Row: Active */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    id="active"
                                    type="checkbox"
                                    checked={editUser.active}
                                    onChange={(e) => onEditFormChange('active', e.target.checked)}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="active">Active</Label>
                            </div>
                            {isAdmin && !isOwnProfile && (
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={editUser.role}
                                        onValueChange={(value) => onEditFormChange('role', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="guest">Guest</SelectItem>
                                            <SelectItem value="tax">Tax</SelectItem>
                                            <SelectItem value="vendor">Vendor</SelectItem>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="finance">Finance</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        {/* Name Field */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={editUser.name}
                                onChange={(e) => onEditFormChange('name', e.target.value)}
                            />
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={editUser.email}
                                onChange={(e) => onEditFormChange('email', e.target.value)}
                            />
                        </div>

                        {/* Phone Field */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={editUser.phone}
                                onChange={(e) => onEditFormChange('phone', e.target.value)}
                            />
                        </div>

                        {/* Note Field */}
                        <div className="space-y-2">
                            <Label htmlFor="note">Notes</Label>
                            <Textarea
                                id="note"
                                value={editUser.note}
                                onChange={(e) => onEditFormChange('note', e.target.value)}
                                placeholder="Additional notes"
                                className="min-h-[100px]"
                            />
                        </div>

                        {/* Bank Information */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">Financial Information</h3>
                                <p className="text-sm text-muted-foreground">
                                    Bank details for transactions
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
                                <div className="space-y-2">
                                    <Label htmlFor="bankName">Bank Name</Label>
                                    <Input
                                        id="bankName"
                                        value={editUser.bankName}
                                        onChange={(e) => onEditFormChange('bankName', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="accNo">Account Number</Label>
                                        <Input
                                            id="accNo"
                                            value={editUser.accNo}
                                            onChange={(e) => onEditFormChange('accNo', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="accName">Account Name</Label>
                                        <Input
                                            id="accName"
                                            value={editUser.accName}
                                            onChange={(e) => onEditFormChange('accName', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
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
                                        <div className="font-medium">{IconActive(user?.active !== undefined ? user?.active : true)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Tag className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Role</div>
                                        <div className="font-medium">
                                            <Badge variant="secondary">{user?.role}</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Email</div>
                                        <div className="font-medium">{user?.email || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Phone</div>
                                        <div className="font-medium">{user?.phone || 'Not provided'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Bank Information */}
                                {(user?.bankInfo?.bankName || user?.bankInfo?.accNo) && (
                                    <div className="border rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <h3 className="text-lg font-medium">Financial Information</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {user?.bankInfo?.bankName && (
                                                <div className="flex justify-between">
                                                    <div className="text-sm text-muted-foreground">Bank Name</div>
                                                    <div className="font-medium">{user?.bankInfo?.bankName}</div>
                                                </div>
                                            )}
                                            {user?.bankInfo?.accNo && (
                                                <div className="flex justify-between">
                                                    <div className="text-sm text-muted-foreground">Account Number</div>
                                                    <div className="font-medium">{user?.bankInfo?.accNo}</div>
                                                </div>
                                            )}
                                            {user?.bankInfo?.accName && (
                                                <div className="flex justify-between">
                                                    <div className="text-sm text-muted-foreground">Account Name</div>
                                                    <div className="font-medium">{user?.bankInfo?.accName}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {user?.note && user?.note.trim() !== '' && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <StickyNote className="h-4 w-4 text-muted-foreground" />
                                            <div className="text-sm text-muted-foreground">Notes</div>
                                        </div>
                                        <div className="font-medium p-3 bg-muted rounded-lg">{user?.note}</div>
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
