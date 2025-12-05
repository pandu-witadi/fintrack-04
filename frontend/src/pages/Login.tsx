import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';


export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full max-w-md p-8 space-y-8 rounded-lg border bg-card text-card-foreground shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold">FinTrack</h2>
                    <p className="text-muted-foreground mt-2">Sign in to your account</p>
                </div>
                
                {error && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                      {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your password"
                                  value={password}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                  className="pl-10 pr-10"
                                  required
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
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>
                
                <div className="text-center text-sm text-muted-foreground">
                    <p>Don't have an account? <a href="#" className="text-primary hover:underline">Sign up</a></p>
                </div>
            </div>
        </div>
    );
}