import { useState } from 'react';
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
import { Project } from '../../services/projectService.js'; 
import ProjectTable from './ProjectTable';
import AddProjectDialog from './AddProjectDialog';


export default function FinAllProjectPage() {
    const navigate = useNavigate();
    const { projects, loading, error, fetchAllProject, createProject, deleteProject } = useProject();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleView = (project: Project) => {
        navigate(`/finance/project/${project._id}`);
    };

    const handleAddProject = () => {
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = async (data: Partial<Project>) => {
        try {
              setIsSubmitting(true);
              await createProject(data as Omit<Project, '_id' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'lBudget' | 'lActual' | 'lTrx' |  'info'>);
              toast.success('Project created successfully');
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Projects</h1>
                    <p className="text-muted-foreground">Manage your projects</p>
                </div>
                <Button onClick={handleAddProject}>
                    Add Project
                </Button>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
                <ProjectTable 
                    projects={projects} 
                    onView={handleView}
                    onDelete={handleDeleteProject}
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