import ProjectForm from '../AllProject/AddProjectDialog.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

interface EditProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectToEdit: any;
    onUpdateProject: (data: Partial<any>) => Promise<void>;
    isSubmitting: boolean;
}

export function EditProjectDialog({
    open,
    onOpenChange,
    projectToEdit,
    onUpdateProject,
    isSubmitting
}: EditProjectDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                </DialogHeader>
                {projectToEdit && (
                    <ProjectForm 
                        project={projectToEdit}
                        onSubmit={onUpdateProject}
                        onCancel={() => onOpenChange(false)}
                        isSubmitting={isSubmitting}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
