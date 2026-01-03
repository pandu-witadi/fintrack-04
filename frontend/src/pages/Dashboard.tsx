import { useAuth } from '../context/AuthContext'
import { useDashboard } from '../hooks/useDashboard'

export default function Dashboard() {
    const { user } = useAuth();
    const { summary, loading, error } = useDashboard();

    const headerContent = (
        <div>
            <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
        </div>
    );

    if (loading) {
        return (
            <div className="space-y-6">
                {headerContent}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h3 className="text-lg font-semibold">Loading...</h3>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                {headerContent}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-red-600">Error</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {headerContent}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h3 className="text-lg font-semibold">Total Users</h3>
                    <p className="text-3xl font-bold mt-2">{summary?.users || 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">+2 from last month</p>
                </div>
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h3 className="text-lg font-semibold">Total Projects</h3>
                    <p className="text-3xl font-bold mt-2">{summary?.projects || 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">+2 from last month</p>
                </div>
                
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h3 className="text-lg font-semibold">Total Events</h3>
                    <p className="text-3xl font-bold mt-2">{summary?.events || 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">3 due this week</p>
                </div>
                
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h3 className="text-lg font-semibold">Total Transactions</h3>
                    <p className="text-3xl font-bold mt-2">{summary?.transactions || 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">Your account is in good standing</p>
                </div>
            </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                          <div className="bg-primary w-6 h-6 rounded-full flex items-center justify-center">
                              <span className="text-primary-foreground text-xs">P</span>
                          </div>
                      </div>
                      <div>
                          <p className="font-medium">Project "Website Redesign" created</p>
                          <p className="text-sm text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <div className="bg-primary w-6 h-6 rounded-full flex items-center justify-center">
                                <span className="text-primary-foreground text-xs">T</span>
                            </div>
                        </div>
                        <div>
                            <p className="font-medium">Task "Update documentation" completed</p>
                            <p className="text-sm text-muted-foreground">Yesterday</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <div className="bg-primary w-6 h-6 rounded-full flex items-center justify-center">
                                <span className="text-primary-foreground text-xs">M</span>
                            </div>
                        </div>
                        <div>
                            <p className="font-medium">Meeting with design team scheduled</p>
                            <p className="text-sm text-muted-foreground">2 days ago</p>
                        </div>
                      </div>
                </div>
            </div>
        </div>
    );
}