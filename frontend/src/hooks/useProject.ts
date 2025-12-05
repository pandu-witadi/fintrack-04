// 
import { useState, useEffect } from 'react';
import { projectService, Project } from '../services/projectService';



export const useProject = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await projectService.getAllProjects();
            // Add computed counts
            const projectsWithCounts = data.map(project => ({
                ...project,
                environmentCount: project.levn?.length || 0,
                transactionCount: project.ltrx?.length || 0
            }));
            setProjects(projectsWithCounts);
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
                environmentCount: project.levn?.length || 0,
                transactionCount: project.ltrx?.length || 0
            };

            // Update the projects array with the fetched project
            setProjects(prev => {
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

    // const runFinance = async (id: string) => {
    //     try {
    //         const updatedProject = await projectService.runFinance(id);
    //         // Add computed counts
    //         const projectWithCounts = {
    //             ...updatedProject,
    //             environmentCount: updatedProject.levn?.length || 0,
    //             transactionCount: updatedProject.ltrx?.length || 0
    //         };

    //         // Update the projects array with the updated project
    //         setProjects(prev => {
    //             const existingIndex = prev.findIndex(p => p._id === id);
    //             if (existingIndex >= 0) {
    //                 // Replace existing project
    //                 const updated = [...prev];
    //                 updated[existingIndex] = projectWithCounts;
    //                 return updated;
    //             } else {
    //                 // Add new project
    //                 return [...prev, projectWithCounts];
    //             }
    //         });

    //         return projectWithCounts;
    //     } catch (err) {
    //         setError('Failed to calculate finance');
    //         console.error(err);
    //         throw err;
    //     }
    // };

    const createProject = async (projectData: Omit<Project, '_id' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'levn' | 'ltrx' |  'info'>) => {
        try {
            const newProject = await projectService.createProject(projectData);
            const projectWithCounts = {
                ...newProject,
                environmentCount: newProject.levn?.length || 0,
                transactionCount: newProject.ltrx?.length || 0
            };
            setProjects(prev => [projectWithCounts, ...prev]);
            return projectWithCounts;
        } catch (err) {
            setError('Failed to create project');
            console.error(err);
            throw err;
        }
    };

    const updateProject = async (id: string, projectData: Partial<Omit<Project, '_id' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'levn' | 'ltrx' | 'info'>>) => {
        try {
            const updatedProject = await projectService.updateProject(id, projectData);
            const projectWithCounts = {
                ...updatedProject,
                environmentCount: updatedProject.levn?.length || 0,
                transactionCount: updatedProject.ltrx?.length || 0
            };
            setProjects(prev => prev.map(project => project._id === id ? projectWithCounts : project));
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
            setProjects(prev => prev.filter(project => project._id !== id));
        } catch (err) {
            setError('Failed to delete project');
            console.error(err);
            throw err;
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    return {
        projects,
        loading,
        error,
        fetchProjects,
        fetchProjectById,
        // runFinance,
        createProject,
        updateProject,
        deleteProject
    };
};