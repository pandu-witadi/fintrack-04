import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { User } from '@/services/userService';

interface UserFormProps {
    user?: User;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

export default function AddUserForm({ user, onSubmit, onCancel, isSubmitting }: UserFormProps) {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState(user?.role || 'user');
    const [active, setactive] = useState(user?.active !== undefined ? user.active : true);
    const [phone, setPhone] = useState(user?.phone || '');
    const [bankName, setBankName] = useState(user?.bankInfo?.bankName || '');
    const [accNo, setAccNo] = useState(user?.bankInfo?.accNo || '');
    const [accName, setAccName] = useState(user?.bankInfo?.accName || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name,
            email,
            password: password || undefined, // Only send password if it's provided
            role,
            active,
            phone,
            bankInfo: {
              bankName,
              accNo,
              accName,
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="password">
                        {user ? 'New Password (leave blank to keep current)' : 'Password *'}
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10"
                            required={!user}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={setRole}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="guest">guest</SelectItem>
                          <SelectItem value="vendor">vendor</SelectItem>
                          <SelectItem value="user">user</SelectItem>
                          <SelectItem value="finance">finance</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="active">Status</Label>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="active"
                            checked={active}
                            onCheckedChange={(checked) => setactive(checked === true)}
                        />
                        <Label htmlFor="active" className="cursor-pointer font-normal">
                            {active ? 'active' : 'inactive'}
                        </Label>
                    </div>
                </div>
            </div>
            
            <div className="space-y-2">
                <Label>Bank Account</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Input
                          placeholder="Bank Name"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Input
                            placeholder="Account Number"
                            value={accNo}
                            onChange={(e) => setAccNo(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Input
                      placeholder="Account Name"
                      value={accName}
                      onChange={(e) => setAccName(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (user ? 'Update User' : 'Create User')}
                </Button>
            </div>
        </form>
    );
}