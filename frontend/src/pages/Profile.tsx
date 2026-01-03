import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function ProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        bankName: '',
        bankNo: '',
        accName: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);

    // Fetch profile data using /user/:userId endpoint
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                if (user?._id) {
                const userData = await userService.getUserById(user._id);
                console.log('User Data:', userData);
                setProfileData(userData);
                setFormData({
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    password: '',
                    bankName: userData.bankInfo?.bankName || '',
                    bankNo: userData.bankInfo?.accNo || '',
                    accName: userData.bankInfo?.accName || ''
                });
                }
            } catch (error: any) {
                console.error('Failed to fetch profile data:', error);
                toast.error('Failed to load profile data');
            } finally {
                setIsDataLoading(false);
            }
        };

        fetchProfileData();
    }, [user?._id]);

    if (!user || isDataLoading) {
        return <div>Loading...</div>;
    }

  const displayUser = profileData || user;

    // Format the last access time for display
    const formatLastAccess = (dateString?: string) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const refreshProfileData = async () => {
        try {
            if (user?._id) {
                const userData = await userService.getUserById(user._id);
                setProfileData(userData);
                setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                password: '',
                bankName: userData.bankInfo?.bankName || '',
                bankNo: userData.bankInfo?.accNo || '',
                accName: userData.bankInfo?.accName || ''
                });
            }
        } catch (error: any) {
            console.error('Failed to refresh profile data:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (formData.name.length > 50) {
            toast.error('Name must be less than 50 characters');
            return;
        }

        if (formData.password && formData.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);
        
        try {
            const updateData: any = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                bankInfo: {
                    bankName: formData.bankName,
                    accName: formData.accName,
                    accNo: formData.bankNo
                }
            };

            // Only include password if it's not empty
            if (formData.password) {
                updateData.password = formData.password;
            }

            const response = await userService.updateUser(user._id, updateData);
            
            if (response.success) {
                setProfileData(response.pyd);
                toast.success('Profile updated successfully');
                setIsEditing(false);
                // Refresh profile data to ensure latest data from server
                await refreshProfileData();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset form to original values
        setFormData({
            name: displayUser.name || '',
            email: displayUser.email || '',
            phone: displayUser.phone || '',
            password: '',
            bankName: displayUser.bankInfo?.bankName || '',
            bankNo: displayUser.bankInfo?.accNo || '',
        accName: displayUser.bankInfo?.accName || ''
        });
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="text-muted-foreground">Manage your profile settings</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                        Update your personal details here
                        </CardDescription>
                    </div>
                    {!isEditing && (
                        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    maxLength={50}
                                />
                            </div>
                            <div>
                                <Label htmlFor="role">Role</Label>
                                <Input
                                    id="role"
                                    name="role"
                                    value={displayUser.role}
                                    disabled
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Role can only be changed by administrators
                                </p>
                            </div>
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
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Leave empty to keep current password"
                                value={formData.password}
                                onChange={handleInputChange}
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Input
                                id="status"
                                name="status"
                                value={displayUser.active ? 'Active' : 'Inactive'}
                                disabled
                            />
                        </div>
                        <div>
                            <Label htmlFor="lastAccess">Last Access</Label>
                            <Input
                                id="lastAccess"
                                name="lastAccess"
                                value={formatLastAccess(displayUser.lastAccess)}
                                disabled
                            />
                        </div>
                        </div>
                        
                        <div className="pt-4">
                        <CardTitle>Financial Information</CardTitle>
                        <CardDescription>
                            Bank details for transactions
                        </CardDescription>
                        </div>
                        
                        <div className="grid gap-4 pt-2">
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
                            <Label htmlFor="accName">Account Name</Label>
                            <Input
                                id="accName"
                                name="accName"
                                value={formData.accName}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <Label htmlFor="bankNo">Account Number</Label>
                            <Input
                                id="bankNo"
                                name="bankNo"
                                value={formData.bankNo}
                                onChange={handleInputChange}
                            />
                        </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                        </div>
                    </form>
                    ) : (
                    <div className="space-y-4">
                        <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <label className="text-sm font-medium">Name</label>
                            <div className="mt-1 p-2 bg-muted rounded-md">
                                {displayUser.name}
                            </div>
                            </div>
                            <div>
                            <label className="text-sm font-medium">Role</label>
                            <div className="mt-1 p-2 bg-muted rounded-md">
                                {displayUser.role}
                            </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Email</label>
                            <div className="mt-1 p-2 bg-muted rounded-md">
                            {displayUser.email}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Phone</label>
                            <div className="mt-1 p-2 bg-muted rounded-md">
                            {displayUser.phone || 'Not provided'}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Status</label>
                            <div className="mt-1 p-2 bg-muted rounded-md">
                            {displayUser.active ? (
                                <span className="text-green-600">Active</span>
                            ) : (
                                <span className="text-red-600">Inactive</span>
                            )}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Last Access</label>
                            <div className="mt-1 p-2 bg-muted rounded-md">
                            {formatLastAccess(displayUser.lastAccess)}
                            </div>
                        </div>
                        </div>
                        
                    
                    </div>
                    )}
                </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bank Information</CardTitle>
                            <CardDescription>
                                Your financial details for transactions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {displayUser.bankInfo && (displayUser.bankInfo.bankName || displayUser.bankInfo.accName || displayUser.bankInfo.accNo) ? (
                                <div className="space-y-4">
                                    {displayUser.bankInfo.bankName && (
                                        <div>
                                            <label className="text-sm font-medium">Bank Name</label>
                                            <div className="mt-1 p-2 bg-muted rounded-md">
                                                {displayUser.bankInfo.bankName}
                                            </div>
                                        </div>
                                    )}
                                    {displayUser.bankInfo.accName && (
                                        <div>
                                            <label className="text-sm font-medium">Account Name</label>
                                            <div className="mt-1 p-2 bg-muted rounded-md">
                                                {displayUser.bankInfo.accName}
                                            </div>
                                        </div>
                                    )}
                                    {displayUser.bankInfo.accNo && (
                                        <div>
                                            <label className="text-sm font-medium">Account Number</label>
                                            <div className="mt-1 p-2 bg-muted rounded-md">
                                                {displayUser.bankInfo.accNo}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No bank information provided</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Preferences</CardTitle>
                            <CardDescription>
                                Customize your experience
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full">
                                Notification Settings
                            </Button>
                            <Button variant="outline" className="w-full">
                                Language Preferences
                            </Button>
                        </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}