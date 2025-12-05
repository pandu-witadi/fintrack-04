import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
    children: React.ReactNode;
    roles?: string[]; // Add roles property for role-based access control
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
    const { isAuthenticated, loading, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
        // Check if user has required role
        else if (!loading && isAuthenticated && roles && user) {
            if (!roles.includes(user.role)) {
                // Redirect to dashboard if user doesn't have required role
                navigate('/dashboard');
            }
        }
    }, [isAuthenticated, loading, navigate, roles, user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Check role access
    if (isAuthenticated && roles && user) {
        if (!roles.includes(user.role)) {
            return null; // Don't render children if user doesn't have required role
        }
    }

    return isAuthenticated ? <>{children}</> : null;
}
