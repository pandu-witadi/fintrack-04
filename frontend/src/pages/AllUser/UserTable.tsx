import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
// ... existing code ...
import { Power, Eye, Trash2, Edit, Search } from 'lucide-react';
import { User as AuthUser } from '@/services/userService';
import { IconActive } from '@/components/IconActive';
import { format } from 'date-fns';

interface User extends AuthUser {
    createdAt: string;
    updatedAt: string;
    projectCount?: number;
}

interface UsersTableProps {
    users: User[];
    selectedIds: string[];
    onSelectAll: (checked: boolean) => void;
    onSelectRow: (id: string, checked: boolean) => void;
    onViewDetails: (user: User) => void;
    onEditUser: (user: User) => void;
    onDeleteUser: (user: User) => void;
    canAddUsers: boolean;
    sortField?: 'active' | 'name' | 'role' | 'lastAccess';
    sortOrder?: 'asc' | 'desc';
    onSort?: (field: 'active' | 'name' | 'role' | 'lastAccess') => void;
}

export function UsersTable({
    users,
    selectedIds,
    onSelectAll,
    onSelectRow,
    onViewDetails,
    onEditUser,
    onDeleteUser,
    canAddUsers,
    sortField,
    sortOrder,
    onSort,
}: UsersTableProps) {
    const [searchByName, setSearchByName] = useState<string>('');
    const [searchByNote, setSearchByNote] = useState<string>('');
    
    const formatLastAccess = (dateString?: string) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        // return date.toLocaleString();
        return format(date, 'yyyy-MM-dd HH:mm:ss');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        // return date.toLocaleDateString();
        return format(date, 'yyyy-MM-dd HH:mm:ss');
    };

    const getSortIndicator = (field: 'active' | 'name' | 'role' | 'lastAccess') => {
        if (sortField !== field) return null;
        return sortOrder === 'asc' ? ' ↑' : ' ↓';
    };

    const handleSort = (field: 'active' | 'name' | 'role' | 'lastAccess') => {
        onSort?.(field);
    };

    // Filter users based on search terms
    const filteredUsers = useMemo(() => {
        let filtered = users;

        // Filter by name if search term provided
        if (searchByName) {
            const searchNameLower = searchByName.toLowerCase();
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchNameLower)
            );
        }

        // Filter by note if search term provided
        if (searchByNote) {
            const searchNoteLower = searchByNote.toLowerCase();
            filtered = filtered.filter(user =>
                user.note && user.note.toLowerCase().includes(searchNoteLower)
            );
        }

        return filtered;
    }, [users, searchByName, searchByNote]);

    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-4">
            {/* Search controls */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name..."
                        value={searchByName}
                        onChange={(e) => setSearchByName(e.target.value)}
                        className="pl-8"
                    />
                </div>

                <div className="relative w-56">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by note..."
                        value={searchByNote}
                        onChange={(e) => setSearchByNote(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 bg-blue-50 dark:bg-blue-950 text-center">No.</TableHead>
                        <TableHead className="w-12 bg-blue-50 dark:bg-blue-950">
                            <Checkbox
                                checked={selectedIds.length === users.length && users.length > 0}
                                onCheckedChange={onSelectAll}
                            />
                        </TableHead>
                        <TableHead className={`cursor-pointer hover:bg-muted transition-colors ${
                            sortField === 'active' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-blue-50 dark:hover:bg-blue-950'
                        }`} onClick={() => handleSort('active')}>
                            <Power className="h-3 w-3 text-cyan-500" />{getSortIndicator('active')}
                        </TableHead>
                        <TableHead className={`cursor-pointer hover:bg-muted transition-colors ${
                            sortField === 'name' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-blue-50 dark:hover:bg-blue-950'
                        }`} onClick={() => handleSort('name')}>
                            name{getSortIndicator('name')}
                        </TableHead>
                        <TableHead>email</TableHead>
                        <TableHead>note</TableHead>
                        <TableHead className={`cursor-pointer hover:bg-muted transition-colors ${
                            sortField === 'role' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-blue-50 dark:hover:bg-blue-950'
                        }`} onClick={() => handleSort('role')}>
                            role{getSortIndicator('role')}
                        </TableHead>
                        <TableHead className={`cursor-pointer hover:bg-muted transition-colors ${
                            sortField === 'lastAccess' ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-blue-50 dark:hover:bg-blue-950'
                        }`} onClick={() => handleSort('lastAccess')}>
                            lastAccess{getSortIndicator('lastAccess')}
                        </TableHead>
                        <TableHead>updated</TableHead>
                        <TableHead className="text-right">actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredUsers.map((user, index) => (
                        <TableRow key={user._id} className={`hover:bg-muted/50 ${
                            selectedIds.includes(user._id) ? 'bg-blue-50 dark:bg-blue-950' : ''
                        }`}>
                            <TableCell className="text-center font-medium text-gray-500">{index + 1}</TableCell>
                            <TableCell>
                                <Checkbox
                                    checked={selectedIds.includes(user._id)}
                                    onCheckedChange={(checked) => onSelectRow(user._id, checked as boolean)}
                                />
                            </TableCell>
                            <TableCell>{IconActive(user.active)}</TableCell>
                            <TableCell className="font-medium">
                                <button
                                    onClick={() => navigate(`/manage/user/${user._id}`)}
                                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left font-medium"
                                    title={`View User Details\nCreated: ${formatDate(user.createdAt)}\nUpdated: ${formatDate(user.updatedAt)}\nLast Access: ${formatLastAccess(user.lastAccess)}`}
                                >
                                    {user.name}
                                </button>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="max-w-xs truncate" title={user.note || ''}>{user.note || '-'}</TableCell>
                            <TableCell>
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-secondary text-secondary-foreground">
                                    {user.role}
                                </span>
                            </TableCell>
                            <TableCell>{formatLastAccess(user.lastAccess)}</TableCell>
                            <TableCell>{formatDate(user.updatedAt)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {canAddUsers && (
                                        <button
                                            onClick={() => onDeleteUser(user)}
                                            className="hover:opacity-70 transition-opacity"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        
        {/* Result count */}
        <div className="text-sm text-muted-foreground">
            {filteredUsers.length > 0 
                ? `${filteredUsers.length} of ${users.length} user(s)` 
                : `No users found`}
        </div>
        </div>
    );
}
