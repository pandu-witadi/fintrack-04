// 
import { useState, useEffect } from 'react';
import { projectService, Project } from '../services/projectService';


export const useProject = () => {
    const [projects, setAllProject] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllProject = async () => {
        try {
            setLoading(true);
            const data = await projectService.getAllProject();
            // Add computed counts
            const projectsWithCounts = data.map(project => ({
                ...project,
                budgetCount: project.lBudget?.length || 0,
                actualCount: project.lActual?.length || 0,
                trxCount: project.lTrx?.length || 0
            }));
            setAllProject(projectsWithCounts);
            setError(null);
        } catch (err) {
            setError('Failed to fetch projects');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectById = async (id: string) => {
        try {
            setLoading(true);
            const project = await projectService.getProjectById(id);

            // Add computed counts
            const projectWithCounts = {
                ...project,
                budgetCount: project.lBudget?.length || 0,
                actualCount: project.lActual?.length || 0,
                trxCount: project.lTrx?.length || 0
            };

            // Update the projects array with the fetched project
            setAllProject(prev => {
                const existingIndex = prev.findIndex(p => p._id === id);
                if (existingIndex >= 0) {
                    // Replace existing project
                    const updated = [...prev];
                    updated[existingIndex] = projectWithCounts;
                    return updated;
                } else {
                    // Add new project
                    return [...prev, projectWithCounts];
                }
            });

            setError(null);
            return projectWithCounts;
        } catch (err) {
            setError('Failed to fetch project');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const runFinance = async (id: string) => {
        try {
            const updatedProject = await projectService.runFinance(id);
            // Add computed counts
            const projectWithCounts = {
                ...updatedProject,
                budgetCount: updatedProject.lBudget?.length || 0,
                actualCount: updatedProject.lActual?.length || 0,
                trxCount: updatedProject.lTrx?.length || 0
            };

            // Update the projects array with the updated project
            setAllProject(prev => {
                const existingIndex = prev.findIndex(p => p._id === id);
                if (existingIndex >= 0) {
                    // Replace existing project
                    const updated = [...prev];
                    updated[existingIndex] = projectWithCounts;
                    return updated;
                } else {
                    // Add new project
                    return [...prev, projectWithCounts];
                }
            });

            return projectWithCounts;
        } catch (err) {
            setError('Failed to calculate finance');
            console.error(err);
            throw err;
        }
    };

    const createProject = async (projectData: Omit<Project, '_id' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'lBudget' | 'lActual' | 'lTrx' |  'info'>) => {
        try {
            const newProject = await projectService.createProject(projectData);
            const projectWithCounts = {
                ...newProject,
                budgetCount: newProject.lBudget?.length || 0,
                actualCount: newProject.lActual?.length || 0,
                trxCount: newProject.lTrx?.length || 0
            };
            setAllProject(prev => [projectWithCounts, ...prev]);
            return projectWithCounts;
        } catch (err) {
            setError('Failed to create project');
            console.error(err);
            throw err;
        }
    };

    const updateProject = async (id: string, projectData: Partial<Omit<Project, '_id' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'lBudget' | 'lActual' | 'lTrx' |  'info'>>) => {
        try {
            const updatedProject = await projectService.updateProject(id, projectData);
            const projectWithCounts = {
                ...updatedProject,
                budgetCount: updatedProject.lBudget?.length || 0,
                actualCount: updatedProject.lActual?.length || 0,
                trxCount: updatedProject.lTrx?.length || 0
            };
            setAllProject(prev => prev.map(project => project._id === id ? projectWithCounts : project));
            return projectWithCounts;
        } catch (err) {
            setError('Failed to update project');
            console.error(err);
            throw err;
        }
    };

    const deleteProject = async (id: string) => {
        try {
            await projectService.deleteProject(id);
            setAllProject(prev => prev.filter(project => project._id !== id));
        } catch (err) {
            setError('Failed to delete project');
            console.error(err);
            throw err;
        }
    };

    useEffect(() => {
        fetchAllProject();
    }, []);

    return {
        projects,
        loading,
        error,
        fetchAllProject,
        fetchProjectById,
        runFinance,
        createProject,
        updateProject,
        deleteProject
    };
};