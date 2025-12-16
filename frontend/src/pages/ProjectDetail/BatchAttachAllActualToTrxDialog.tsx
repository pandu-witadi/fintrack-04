import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Actual } from '@/services/actualService';
import { Project, projectService } from '@/services/projectService';


interface BatchAttachAllActualToTrxDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedActuals: Actual[];
    onSubmit: (allActualId: string[], trxId: string) => Promise<void>;
    isSubmitting: boolean;
    currentProjectId: string;
}

export function BatchAttachAllActualToTrxDialog({
    open,
    onOpenChange,
    selectedActuals,
    onSubmit,
    isSubmitting,
    currentProjectId
}: BatchAttachAllActualToTrxDialogProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [projectsError, setProjectsError] = useState<string | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string>(currentProjectId);
    const [selectedTrxId, setSelectedTrxId] = useState<string>('');

    useEffect(() => {
        if (open) {
            fetchProjects();
            setSelectedProjectId(currentProjectId);
            setSelectedTrxId('');
        }
    }, [open, currentProjectId]);

    const fetchProjects = async () => {
        try {
            setProjectsLoading(true);
            setProjectsError(null);
            const allProjects = await projectService.getAllProject();
            setProjects(allProjects);
        } catch (error) {
            setProjectsError('Failed to fetch projects');
            console.error('Error fetching projects:', error);
        } finally {
            setProjectsLoading(false);
        }
    };

    const selectedProject = projects.find(p => p._id === selectedProjectId);
    const availableTransactions = selectedProject?.lTrx || [];
    const unlinkedActuals = selectedActuals.filter(actual => !actual.trx);

    const handleSubmit = async () => {
        if (!selectedTrxId) return;
        try {
            const actualIds = unlinkedActuals.map(actual => actual._id);
            await onSubmit(actualIds, selectedTrxId);
            setSelectedTrxId('');
            onOpenChange(false);
        } catch (error) {
            console.error('Error attaching actuals:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Attach Actuals to Transaction</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Selected Actual Transactions</Label>
                        <div className="text-sm p-2 bg-muted rounded max-h-32 overflow-y-auto">
                            {unlinkedActuals.length > 0 ? (
                                unlinkedActuals.map(actual => (
                                    <div key={actual._id} className="py-1 border-b border-muted last:border-0">
                                        <div className="font-medium">{actual.name}</div>
                                        <div className="text-muted-foreground text-xs">{actual.typ}</div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground">No unlinked actuals selected</p>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {unlinkedActuals.length} unlinked actual(s) will be attached
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="batch-projectId">Select Project</Label>
                        {projectsLoading ? (
                            <p className="text-muted-foreground text-sm">Loading projects...</p>
                        ) : projectsError ? (
                            <p className="text-muted-foreground text-sm text-red-500">Error loading projects</p>
                        ) : projects.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No projects available</p>
                        ) : (
                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project) => (
                                        <SelectItem key={project._id} value={project._id}>
                                            <div className="flex items-center gap-2">
                                                <span>{project.name}</span>
                                                {project.code && (
                                                    <span className="text-muted-foreground text-xs">
                                                        ({project.code})
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="batch-trxId">Select Transaction</Label>
                        {availableTransactions.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No transactions available in selected project</p>
                        ) : (
                            <Select value={selectedTrxId} onValueChange={setSelectedTrxId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a transaction" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTransactions.map((transaction) => (
                                        <SelectItem key={transaction._id} value={transaction._id}>
                                            <span>{transaction.name}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting || !selectedTrxId || unlinkedActuals.length === 0}
                    >
                        {isSubmitting ? 'Attaching...' : 'Attach All'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
