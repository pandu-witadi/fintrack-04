import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

import { useProject } from '@/hooks/useProject.ts';
import { useBudget } from '@/hooks/useBudget.ts';
import { useActual } from '@/hooks/useActual.ts';
import { useTrx } from '@/hooks/useTrx.ts';
import { Project } from '@/services/projectService.ts';
import { Budget, budgetService } from '@/services/budgetService.ts';
import { Actual, actualService } from '@/services/actualService.ts';
import { Trx, trxService } from '@/services/trxService.ts';
import formatCurrency from '@/utils/formatCurrency.ts';
import BudgetActualTable from './BudgetActualTable';
import ActualTrxTable from './ActualTrxTable';
import TrxActualTable from './TrxActualTable';
import { AddBudgetDialogWrapper } from './AddBudgetDialogWrapper';
import RegisterActualDialog from './RegisterActualDialog';
import RegisterTrxDialog from './RegisterTrxDialog';
import { AddActualDialog } from './AddActualDialog';
import { AddTrxDialog } from './AddTrxDialog';
import { BatchAttachToTrxDialog } from './BatchAttachToTrxDialog';

import { DetailSection } from './DetailSection';
import { EditProjectDialog } from './EditProjectDialog';

export default function ProjectDetail() {
    const { id: projectId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { 
        fetchProjectById,
        runFinance,
        updateProject,
    } = useProject();
    const {
        budgets,
        loading: budgetsLoading,
        error: budgetsError,
        getAllBudgetByProjectId,
        createBudget,
        deleteBudget,
    } = useBudget();
    
    const {
        actuals,
        loading: actualsLoading,
        error: actualsError,
        getAllActualByProjectId,
        deleteActual,
        createActual,
    } = useActual();
    
    const {
        trxs,
        loading: trxsLoading,
        error: trxsError,
        getAllTrxByProjectId,
        deleteTrx,
    } = useTrx();

    // Add state for project edit functionality
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<any>(null);

    // State to track finance calculation status
    const [isCalculating, setIsCalculating] = useState(false);

    const [project, setProject] = useState<Project | null>(null);
    const [projectLoading, setProjectLoading] = useState(true);
    const [projectError, setProjectError] = useState<string | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
    const [isRegisterActualDialogOpen, setIsRegisterActualDialogOpen] = useState(false);
    const [selectedBudgetsForActual, setSelectedBudgetsForActual] = useState<Budget[]>([]);
    const [isRegisteringActual, setIsRegisteringActual] = useState(false);
    
    // Added state for actual deletion
    const [isDeleteActualDialogOpen, setIsDeleteActualDialogOpen] = useState(false);
    const [actualToDelete, setActualToDelete] = useState<Actual | null>(null);
    
    // Added state for adding actual transactions
    const [isAddActualDialogOpen, setIsAddActualDialogOpen] = useState(false);
    
    // Added state for transaction deletion
    const [isDeleteTrxDialogOpen, setIsDeleteTrxDialogOpen] = useState(false);
    const [trxToDelete, setTrxToDelete] = useState<Trx | null>(null);
    
    // Added state for registering transactions from actual
    const [isRegisterTrxDialogOpen, setIsRegisterTrxDialogOpen] = useState(false);
    const [selectedActualsForTrx, setSelectedActualsForTrx] = useState<Actual[]>([]);
    const [isRegisteringTrx, setIsRegisteringTrx] = useState(false);
    
    // Added state for adding transactions
    const [isAddTrxDialogOpen, setIsAddTrxDialogOpen] = useState(false);
    
    // Added state for batch attach to transaction
    const [isBatchAttachDialogOpen, setIsBatchAttachDialogOpen] = useState(false);
    const [selectedActualsForAttach, setSelectedActualsForAttach] = useState<Actual[]>([]);
    const [isAttachingActuals, setIsAttachingActuals] = useState(false);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            if (!projectId) {
                setProjectError('Project ID not found');
                setProjectLoading(false);
                return;
            }

            try {
                setProjectLoading(true);
                setProjectError(null);

                // Fetch project details
                const projectData = await fetchProjectById(projectId);
                setProject(projectData);

                // Fetch budgets for this project
                await getAllBudgetByProjectId(projectId);
                
                // Fetch actuals for this project
                await getAllActualByProjectId(projectId);
                
                // Fetch transactions for this project
                await getAllTrxByProjectId(projectId);
            } catch (err) {
                console.error('Error fetching project details:', err);
                setProjectError('Failed to load project details');
            } finally {
                setProjectLoading(false);
            }
        };

        fetchProjectDetails();
    }, [projectId]);

    const handleEdit = () => {
        // Set the project data for editing
        setProjectToEdit(project);
        setIsEditDialogOpen(true);
    };

    // Add function to handle project form submission
    const handleUpdateProject = async (data: Partial<any>) => {
        if (!projectId || !projectToEdit) return;
        
        try {
            setIsSubmitting(true);
            const updatedProject = await updateProject(projectId, data);
            setProject(updatedProject);
            setIsEditDialogOpen(false);
            toast.success('Project updated successfully');
            // Refresh the project data to ensure the page reflects the changes
            fetchProjectById(projectId).then(fetchedProject => {
                setProject(fetchedProject);
            });
        } catch (error) {
            toast.error('Failed to update project');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCalculateFinance = async () => {
        if (!projectId) return;
        try {
            setIsCalculating(true);
            const updatedProject = await runFinance(projectId);
            setProject(updatedProject);
            toast.success('Finance calculated successfully');

            // Refresh budgetByProject and actualByProjectId after calculation
            // if (projectId) {
                // getAllBudgetByProjectId(projectId);
                // fetchTransactions();
            // }
        } catch (error) {
            toast.error('Failed to calculate finance');
            console.error(error);
        } finally {
            setIsCalculating(false);
        }
    };


    const handleAddBudget = () => {
        setIsFormModalOpen(true);
    };
    
    // Added function to handle adding actual transactions
    const handleAddActual = () => {
        setIsAddActualDialogOpen(true);
    };
    
    // Added function to handle adding transactions
    const handleAddTrx = () => {
        setIsAddTrxDialogOpen(true);
    };
    
    // Added function to handle transaction submission
    const handleTrxSubmit = async (data: any) => {
        if (!projectId) return;

        try {
            setIsSubmitting(true);
            // Use the createTrx function from the hook
            await trxService.registerTrx({
                ...data,
                projectId,
            });
            toast.success('Transaction created successfully');
            setIsAddTrxDialogOpen(false);
            
            // Refresh transactions after creation
            await getAllTrxByProjectId(projectId);
        } catch (error) {
            toast.error('Failed to create transaction: ' + (error as Error).message);
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFormSubmit = async (data: any) => {
        if (!projectId) return;

        try {
            setIsSubmitting(true);
            await createBudget(projectId, data);
            toast.success('Budget created successfully');
            setIsFormModalOpen(false);
        } catch (error) {
            toast.error('Failed to create budget');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Added function to handle actual transaction submission
    const handleActualSubmit = async (data: any) => {
        if (!projectId) return;

        try {
            setIsSubmitting(true);
            // Use the createActual function from the hook
            await createActual(data);
            toast.success('Actual transaction created successfully');
            setIsAddActualDialogOpen(false);
            
            // Refresh actuals after creation
            await getAllActualByProjectId(projectId);
        } catch (error) {
            toast.error('Failed to create actual transaction: ' + (error as Error).message);
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteBudget = (budget: Budget) => {
        setBudgetToDelete(budget);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteBudget = async () => {
        if (!budgetToDelete) return;

        try {
            await deleteBudget(budgetToDelete._id);
            toast.success('Budget deleted successfully');
            setIsDeleteDialogOpen(false);
            setBudgetToDelete(null);
        } catch (error) {
            toast.error('Failed to delete budget');
            console.error(error);
        }
    };
    
    // Added function to handle actual deletion
    const handleDeleteActual = (actual: Actual) => {
        setActualToDelete(actual);
        setIsDeleteActualDialogOpen(true);
    };
    
    // Added function to handle transaction deletion
    const handleDeleteTrx = (trx: Trx) => {
        setTrxToDelete(trx);
        setIsDeleteTrxDialogOpen(true);
    };

    const confirmDeleteActual = async () => {
        if (!actualToDelete) return;

        try {
            await deleteActual(actualToDelete._id);
            toast.success('Actual transaction deleted successfully');
            setIsDeleteActualDialogOpen(false);
            setActualToDelete(null);
            
            // Refresh actuals after deletion
            if (projectId) {
                await getAllActualByProjectId(projectId);
            }
        } catch (error) {
            toast.error('Failed to delete actual transaction');
            console.error(error);
        }
    };
    
    const confirmDeleteTrx = async () => {
        if (!trxToDelete) return;

        try {
            await deleteTrx(trxToDelete._id);
            toast.success('Transaction deleted successfully');
            setIsDeleteTrxDialogOpen(false);
            setTrxToDelete(null);
            
            // Refresh transactions after deletion
            if (projectId) {
                await getAllTrxByProjectId(projectId);
            }
        } catch (error) {
            toast.error('Failed to delete transaction');
            console.error(error);
        }
    };

    const handleCloneFromBudgets = async (budgetIds: string[]) => {
        if (!projectId) return;

        try {
            const clonePromises = budgetIds.map(budgetId => {
                const budget = budgets.find(b => b._id === budgetId);
                if (!budget) return Promise.reject(new Error('Budget not found'));

                return budgetService.cloneFromBudget(budgetId, {
                    name: `${budget.name} - Actual`,
                    amount: budget.amount,
                    dateEx: new Date().toISOString()
                });
            });

            await Promise.all(clonePromises);
            toast.success(`Created ${budgetIds.length} actual transaction(s) from budget`);
            
            // Refresh budgets after cloning
            await getAllBudgetByProjectId(projectId);
            
            // Refresh actuals after cloning
            await getAllActualByProjectId(projectId);
        } catch (error) {
            toast.error('Failed to create actual from budget');
            console.error(error);
        }
    };

    const handleOpenRegisterActualDialog = (selectedBudgets: Budget[]) => {
        setSelectedBudgetsForActual(selectedBudgets);
        setIsRegisterActualDialogOpen(true);
    };

    const handleOpenRegisterTrxDialog = (selectedActuals: Actual[]) => {
        setSelectedActualsForTrx(selectedActuals);
        setIsRegisterTrxDialogOpen(true);
    };

    const handleOpenBatchAttachDialog = (selectedActuals: Actual[]) => {
        setSelectedActualsForAttach(selectedActuals);
        setIsBatchAttachDialogOpen(true);
    };

    const handleBatchAttachToTrx = async (allActualId: string[], trxId: string) => {
        try {
            setIsAttachingActuals(true);
            await actualService.attachToTrx(allActualId, trxId);
            toast.success(`Attached ${allActualId.length} actual(s) to transaction`);
            
            // Refresh actuals after attachment
            if (projectId) {
                await getAllActualByProjectId(projectId);
                await getAllTrxByProjectId(projectId);
            }
        } catch (error) {
            toast.error('Failed to attach actuals to transaction');
            console.error(error);
        } finally {
            setIsAttachingActuals(false);
        }
    };

    const handleRegisterTrxSubmit = async (actualId: string, trxData: any) => {
        try {
            setIsRegisteringTrx(true);
            await trxService.registerTrx({
                ...trxData,
                projectId: projectId || '',
            });
            
            // Refresh transactions after submission
            if (projectId) {
                await getAllTrxByProjectId(projectId);
                toast.success('Transaction registered successfully');
            }
        } catch (error) {
            toast.error('Failed to register transaction');
            console.error(error);
            throw error;
        } finally {
            setIsRegisteringTrx(false);
        }
    };

    const handleRegisterActualSubmit = async (budgetId: string, actualData: any) => {
        try {
            setIsRegisteringActual(true);
            await budgetService.registerActual(budgetId, actualData);
            
            // Refresh budgets after submission
            if (projectId) {
                await getAllBudgetByProjectId(projectId);
                toast.success('Actual registered successfully');
            }
        } catch (error) {
            toast.error('Failed to register actual');
            console.error(error);
            throw error;
        } finally {
            setIsRegisteringActual(false);
        }
    };

    const loading = projectLoading || budgetsLoading || actualsLoading || trxsLoading;
    const error = projectError || budgetsError || actualsError || trxsError;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Button onClick={() => navigate('/finance/allProject')} variant="outline">
                        Back to Projects
                    </Button>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-red-600">Error</h3>
                            <p className="text-muted-foreground mt-2">{error || 'Project not found'}</p>
                            <Button onClick={() => navigate('/finance/allProject')} className="mt-4">
                                Return to Projects
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Button variant="outline" size="icon" onClick={() => navigate('/finance/allProject')}>
                <ArrowLeft className="h-4 w-4" />
            </Button>

            <DetailSection
                project={project}
                handleCalculateFinance={handleCalculateFinance}
                handleEdit={handleEdit}
                isCalculating={isCalculating}
                formatCurrency={formatCurrency}
            />

            {/* Budget Actual Section */}
            <BudgetActualTable
                budgets={budgets}
                onDelete={handleDeleteBudget}
                onAddBudget={handleAddBudget}
                onSpawn={handleCloneFromBudgets}
                onRegisterActual={handleOpenRegisterActualDialog}
            />
            
            {/* Actual Transactions Section */}
            <ActualTrxTable
                actuals={actuals}
                onDelete={handleDeleteActual}
                onAddActual={handleAddActual}
                onBatchAttachToTrx={handleOpenBatchAttachDialog}
            />
            
            {/* Transactions Section */}
            <TrxActualTable
                trxs={trxs}
                onDelete={handleDeleteTrx}
                onAddTrx={handleAddTrx}
                onRegisterTrx={handleOpenRegisterTrxDialog}
            />

            {/* Add Budget Dialog */}
            <AddBudgetDialogWrapper
                open={isFormModalOpen}
                onOpenChange={setIsFormModalOpen}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
            />
            
            {/* Add Actual Dialog */}
            <AddActualDialog
                open={isAddActualDialogOpen}
                onOpenChange={setIsAddActualDialogOpen}
                onSubmit={handleActualSubmit}
                isSubmitting={isSubmitting}
                projectId={projectId || ''}
            />
            
            {/* Add Transaction Dialog */}
            <AddTrxDialog
                open={isAddTrxDialogOpen}
                onOpenChange={setIsAddTrxDialogOpen}
                onSubmit={handleTrxSubmit}
                isSubmitting={isSubmitting}
                projectId={projectId || ''}
            />

            {/* Delete Budget Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Are you sure you want to delete the budget <strong>{budgetToDelete?.name}</strong>?</p>
                        <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteBudget}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Delete Actual Confirmation Dialog */}
            <Dialog open={isDeleteActualDialogOpen} onOpenChange={setIsDeleteActualDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Are you sure you want to delete the actual transaction <strong>{actualToDelete?.name}</strong>?</p>
                        <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteActualDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteActual}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Delete Transaction Confirmation Dialog */}
            <Dialog open={isDeleteTrxDialogOpen} onOpenChange={setIsDeleteTrxDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Are you sure you want to delete the transaction <strong>{trxToDelete?.name}</strong>?</p>
                        <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteTrxDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteTrx}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <EditProjectDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                projectToEdit={projectToEdit}
                onUpdateProject={handleUpdateProject}
                isSubmitting={isSubmitting}
            />

            <RegisterActualDialog
                open={isRegisterActualDialogOpen}
                onOpenChange={(open) => {
                    setIsRegisterActualDialogOpen(open);
                    if (!open) {
                        setSelectedBudgetsForActual([]);
                        if (projectId) {
                            getAllBudgetByProjectId(projectId);
                        }
                    }
                }}
                selectedBudgets={selectedBudgetsForActual}
                onSubmit={handleRegisterActualSubmit}
                isSubmitting={isRegisteringActual}
            />
            
            <RegisterTrxDialog
                open={isRegisterTrxDialogOpen}
                onOpenChange={(open) => {
                    setIsRegisterTrxDialogOpen(open);
                    if (!open) {
                        setSelectedActualsForTrx([]);
                        if (projectId) {
                            getAllTrxByProjectId(projectId);
                        }
                    }
                }}
                selectedActuals={selectedActualsForTrx}
                onSubmit={handleRegisterTrxSubmit}
                isSubmitting={isRegisteringTrx}
            />
            
            <BatchAttachToTrxDialog
                open={isBatchAttachDialogOpen}
                onOpenChange={(open) => {
                    setIsBatchAttachDialogOpen(open);
                    if (!open) {
                        setSelectedActualsForAttach([]);
                    }
                }}
                selectedActuals={selectedActualsForAttach}
                onSubmit={handleBatchAttachToTrx}
                isSubmitting={isAttachingActuals}
                currentProjectId={projectId || ''}
            />
        </div>
    );
}