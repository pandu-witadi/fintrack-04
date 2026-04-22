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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isDropdownOpen) {
                const target = event.target as HTMLElement;
                if (!target.closest('[data-assignee-selector]')) {
                    setIsDropdownOpen(false);
                }
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleSelectUser = (userId: string) => {
        onAssigneeChange(userId);
        setSearchTerm('');
        setIsDropdownOpen(false);
    };

    const handleClearAssignee = () => {
        onAssigneeChange(null);
        setSearchTerm('');
        setIsDropdownOpen(false);
    };

    return (
        <div className="space-y-2" data-assignee-selector>
            {/* <Label>Assignee</Label> */}
            <div className="relative">
                {/* Show selected assignee or search input */}
                {selectedAssignee ? (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-3 cursor-pointer hover:bg-blue-100"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <div className="flex items-center space-x-2 flex-1">
                            <div className="text-green-600 font-bold">✓</div>
                            <div>
                                <div className="font-medium text-sm">
                                    {users.find(u => u._id === selectedAssignee)?.name}
                                </div>
                                <div className="text-xs text-gray-600">
                                    {users.find(u => u._id === selectedAssignee)?.email}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClearAssignee();
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
                            setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        className="cursor-pointer"
                    />
                )}

                {/* Dropdown menu */}
                {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg top-full">
                        {/* Clear/None option */}
                        {selectedAssignee && (
                            <div
                                className="px-4 py-3 cursor-pointer hover:bg-red-50 border-b flex items-center justify-between"
                                onClick={handleClearAssignee}
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
                                            selectedAssignee === user._id ? 'bg-blue-100' : ''
                                        }`}
                                        onClick={() => handleSelectUser(user._id)}
                                    >
                                        <div>
                                            <div className="font-medium text-sm">{user.name}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                        {selectedAssignee === user._id && (
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
    );
}
