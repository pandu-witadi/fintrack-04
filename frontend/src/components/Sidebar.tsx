import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    Home, 
    FileText, 
    ChevronLeft,
    ChevronRight,
    Menu,
    Users,
    User,
    WalletMinimal,
    ChevronDown,
    ChevronUp,
    Briefcase
} from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';

interface NavItem {
    title: string;
    href?: string;
    icon: React.ReactNode;
    roles?: string[]; // Add roles property for role-based access control
    submenu?: NavItem[]; // Add submenu property
}

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({}); // Track open submenus
    const location = useLocation();
    const { logout, user } = useAuth(); // Get user from auth context

    // Helper function to check if user has required role
    const hasRequiredRole = (roles: string[] | undefined) => {
        if (!roles || roles.length === 0) return true; // No role restriction
        if (!user) return false; // Not authenticated
        return roles.includes(user.role);
    };

    // Toggle submenu open/closed
    const toggleSubMenu = (title: string) => {
        setOpenMenus(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const navItems: NavItem[] = [
        { title: 'Dashboard', href: '/dashboard', icon: <Home className="h-5 w-5" /> },
        { 
            title: 'Work', 
            icon: <Briefcase className="h-5 w-5" />,
            submenu: [
                { title: 'My Events', href: '/finance/event', icon: <FileText className="h-5 w-5" /> }
            ]
        },
        { 
            title: 'Finance', 
            icon: <WalletMinimal className="h-5 w-5" />, 
            roles: ['admin', 'finance'],
            submenu: [
                { title: 'Time Map', href: '/finance/time-map', icon: <FileText className="h-5 w-5" /> },
                { title: 'All Projects', href: '/finance/projects', icon: <FileText className="h-5 w-5" /> },
                { title: 'All Events', href: '/finance/all-events', icon: <FileText className="h-5 w-5" /> },
                { title: 'All Trx', href: '/finance/all-trx', icon: <FileText className="h-5 w-5" /> },
                
            ]
        },
        { 
            title: 'Manage', 
            icon: <Users className="h-5 w-5" />,
            roles: ['admin'],
            submenu: [
                { title: 'All User', href: '/allUser', icon: <Users className="h-5 w-5" /> },
            ]
        },
        { 
            title: 'Profile', 
            icon: <User className="h-5 w-5" />,
            href: '/profile'
        },

    ];

    const handleLogout = () => {
        logout();
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setIsCollapsed(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Render a single navigation item
    const renderNavItem = (item: NavItem, isSubItem: boolean = false) => {
        if (!hasRequiredRole(item.roles)) return null;

        // If item has a href, render as a link
        if (item.href) {
            return (
                <Link
                    to={item.href}
                    className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      location.pathname === item.href
                        ? 'bg-blue-500 text-white'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    } ${isSubItem ? 'ml-4' : ''}`}
                >
                  {item.icon}
                  {!isCollapsed && <span className="ml-3">{item.title}</span>}
                </Link>
            );
        }

        // If item has submenu, render as a toggle
        if (item.submenu) {
            const isOpen = openMenus[item.title];
            return (
                <div>
                    <button
                        onClick={() => toggleSubMenu(item.title)}
                        className={`flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground`}
                    >
                        <div className="flex items-center">
                            {item.icon}
                            {!isCollapsed && <span className="ml-3">{item.title}</span>}
                        </div>
                        {!isCollapsed && (
                            isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                    </button>
                    {!isCollapsed && isOpen && item.submenu && (
                        <div className="mt-1 space-y-1">
                            {item.submenu
                                .filter(subItem => hasRequiredRole(subItem.roles))
                                .map((subItem, index) => (
                                    <div key={index} className="ml-8">
                                        {renderNavItem(subItem, true)}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            );
        }

        // Default case (should not happen)
        return null;
    };

    return (
        <>
            {isMobile && (
              <div className="fixed top-4 left-4 z-50">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            )}

            <div
                className={`bg-card border-r transition-all duration-300 ease-in-out ${
                  isCollapsed ? 'w-20' : 'w-64'
                } ${isMobile && isCollapsed ? 'hidden' : 'fixed md:relative'} h-screen flex flex-col`}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    {!isCollapsed && (
                        <div className="flex items-center space-x-2">
                            <div className="bg-primary w-8 h-8 rounded-lg flex items-center justify-center">
                                <span className="text-primary-foreground font-bold">P</span>
                            </div>
                            <span className="text-xl font-bold">Projects</span>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="ml-auto"
                    >
                        {isCollapsed ? (
                          <ChevronRight className="h-5 w-5" />
                        ) : (
                          <ChevronLeft className="h-5 w-5" />
                        )}
                    </Button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-2">
                        {navItems
                            .filter(item => hasRequiredRole(item.roles))
                            .map((item, index) => (
                                <li key={index}>
                                    {renderNavItem(item)}
                                </li>
                            ))}
                    </ul>
                </nav>

                 <div className="p-4 border-t">
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={handleLogout}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {!isCollapsed && <span className="ml-3">Logout</span>}
                    </Button>
                </div>
            </div>
        </>
    );
}