import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { userService, User } from '@/services/userService.ts';
import { toast } from 'sonner';

interface AssigneeSelectorProps {
    selectedAssignee: string | null;
    onAssigneeChange: (assigneeId: string | null) => void;
    isEditing: boolean;
}

export default function AssigneeSelector({ selectedAssignee, onAssigneeChange, isEditing }: AssigneeSelectorProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch all users when entering edit mode
    useEffect(() => {
        if (isEditing) {
            fetchAllUsers();
        }
    }, [isEditing]);

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

    const handleSelectUser = (userId: string) => {
        onAssigneeChange(userId);
        setSearchTerm('');
    };

    const handleClearAssignee = () => {
        onAssigneeChange(null);
        setSearchTerm('');
    };

    return (
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
                                    selectedAssignee === user._id ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => handleSelectUser(user._id)}
                            >
                                <div>
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                                {selectedAssignee === user._id && (
                                    <div className="text-green-500 font-bold">✓</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {selectedAssignee && (
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center">
                        <div className="font-medium">
                            {users.find(u => u._id === selectedAssignee)?.name}
                        </div>
                        <div className="text-sm text-gray-500 ml-2">
                            ({users.find(u => u._id === selectedAssignee)?.email})
                        </div>
                    </div>
                    <button
                        onClick={handleClearAssignee}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
}
