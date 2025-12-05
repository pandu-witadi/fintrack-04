import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-card border-b">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden mr-2"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="h-6 w-6" />
                            </Button>
                            <div className="flex flex-col items-start">
                                <p className="text-sm font-semibold">{user?.name || 'No name'}</p>
                                <p className="text-xs text-muted-foreground">{user?.email || 'No email'}</p>
                                <p className="text-xs text-muted-foreground">{user?.role || 'guest'}</p>
                            </div>
                        </div>
                        {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="flex items-center gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button> */}
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
