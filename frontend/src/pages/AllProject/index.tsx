import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { useProject } from '../../hooks/useProject.js';
import { useBudget } from '../../hooks/useBudget.js';
import { useActual } from '../../hooks/useActual.js';
import { useTrx } from '../../hooks/useTrx.js';
import { Project } from '../../services/projectService.js'; 
import ProjectTable from './ProjectTable';
import AddProjectDialog from './AddProjectDialog';


export default function FinAllProjectPage() {
    const navigate = useNavigate();
    const { projects, loading, error, fetchAllProject, createProject, deleteProject } = useProject();
    const { budgets, getAllBudget } = useBudget();
    const { actuals, getAllActual } = useActual();
    const { trxs, getAllTrx } = useTrx();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch budget, actual, and transaction data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([getAllBudget(), getAllActual(), getAllTrx()]);
            } catch (error) {
                console.error('Error fetching stats data:', error);
            }
        };
        fetchData();
    }, []);
    const projectStats = useMemo(() => {
        const stats: Record<string, any> = {};
        
        projects.forEach(project => {
            // Filter budgets by project ID - handle both string and object references
            const projectBudgets = budgets.filter(b => {
                const budgetProjectId = typeof b.project === 'string' ? b.project : b.project?._id;
                return budgetProjectId === project._id;
            });
            
            // Filter actuals by project ID
            const projectActuals = actuals.filter(a => a.project?._id === project._id);
            
            // Filter transactions by project ID
            const projectTrxs = trxs.filter(t => t.project?._id === project._id);

            stats[project._id] = {
                budgetCount: {
                    done: projectBudgets.filter(b => b.done).length,
                    total: projectBudgets.length
                },
                actualCount: {
                    done: projectActuals.filter(a => a.done).length,
                    total: projectActuals.length
                },
                trxCount: {
                    done: projectTrxs.filter(t => t.done).length,
                    total: projectTrxs.length
                }
            };
        });
        
        return stats;
    }, [projects, budgets, actuals, trxs]);

    const handleView = (project: Project) => {
        navigate(`/finance/project/${project._id}`);
    };

    const handleAddProject = () => {
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = async (data: Partial<Project>) => {
        try {
                setIsSubmitting(true);
                await createProject(data as Omit<Project, 
                    '_id' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'lBudget' | 'lActual' | 'lTrx' |  'info'>
                );
                toast.success('Project created successfully')
                setIsFormModalOpen(false);
        } catch (error) {
            toast.error('Failed to create project');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProject = async (id: string) => {
        try {
            await deleteProject(id);
            toast.success('Project deleted successfully');
        } catch (error) {
            toast.error('Failed to delete project');
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-red-600">Error</h3>
                    <p className="text-muted-foreground">{error}</p>
                    <Button onClick={fetchAllProject} className="mt-4">Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6 shadow-sm p-2">
                <ProjectTable 
                    projects={projects} 
                    onView={handleView}
                    onDelete={handleDeleteProject}
                    projectStats={projectStats}
                    onAddProject={handleAddProject}
                />
            </div>

            <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add Project</DialogTitle>
                    </DialogHeader>
                    <AddProjectDialog 
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsFormModalOpen(false)}
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}