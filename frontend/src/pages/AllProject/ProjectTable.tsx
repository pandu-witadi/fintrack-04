import { useState, useMemo } from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
import { 
    X,  
    Search, 
    Filter,
    Power,
    Eye,
    Trash2,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { IconActive } from '@/components/IconActive';
import { IconDone } from '@/components/IconDone';
import { Project as BaseProject } from '../../services/projectService';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Project extends BaseProject {
    environmentCount?: number;
    transactionCount?: number;
}
import { format, getYear } from 'date-fns';
import formatCurrency from '@/utils/formatCurrency';

interface StatCount {
    done: number;
    total: number;
}

interface StatData {
    budgetCount: StatCount;
    actualCount: StatCount;
    trxCount: StatCount;
}

interface ProjectsTableProps {
    projects: Project[];
    onEdit?: (project: Project) => void; // Make onEdit optional
    onDelete?: (id: string) => void; // Make onDelete optional
    onView: (project: Project) => void;
    projectStats?: Record<string, StatData>; // Map of projectId to stats
    onAddProject?: () => void; // Add project button handler
}

export default function ProjectTable({ projects, onEdit, onDelete, onView, projectStats, onAddProject }: ProjectsTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Project; direction: 'asc' | 'desc' } | null>({
        key: 'stDate' as keyof Project,
        direction: 'desc'
    });
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [yearFilter, setYearFilter] = useState<string>('all');
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredAndSortedProjects.map(project => project._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        }
    };

    const handleSort = (key: keyof Project) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleDeleteClick = (project: Project) => {
        setProjectToDelete(project);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (projectToDelete && onDelete) {
            onDelete(projectToDelete._id);
            setDeleteDialogOpen(false);
            setProjectToDelete(null);
        }
    };

    const handleToggleColumn = (column: keyof typeof visibleColumns) => {
        setVisibleColumns(prev => ({
            ...prev,
            [column]: !prev[column]
        }));
    };

    const renderSortIndicator = (columnKey: keyof Project) => {
        if (!sortConfig || sortConfig.key !== columnKey) return null;
        return sortConfig.direction === 'asc' 
            ? <ArrowUp className="h-4 w-4 ml-1 inline" />
            : <ArrowDown className="h-4 w-4 ml-1 inline" />;
    };

    // Refactored column visibility controls into a separate function
    const [visibleColumns, setVisibleColumns] = useState({
        active: true,
        codename: true,
        // name: true,
        typ: true,
        year: false,
        stDate: true,
        client: true,
        updatedAt: false,
        done: true,
        budget: true,
        actual: true,
        taskStat: true
    });
    const renderColumnVisibilityControls = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    columns
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.active}
                    onCheckedChange={() => handleToggleColumn('active')}
                >
                    active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.codename}
                    onCheckedChange={() => handleToggleColumn('codename')}
                >
                    code/name
                </DropdownMenuCheckboxItem>
                {/* <DropdownMenuCheckboxItem 
                    checked={visibleColumns.name}
                    onCheckedChange={() => handleToggleColumn('name')}
                >
                    name
                </DropdownMenuCheckboxItem> */}
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.typ}
                    onCheckedChange={() => handleToggleColumn('typ')}
                >
                    type
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.year}
                    onCheckedChange={() => handleToggleColumn('year')}
                >
                    year
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.stDate}
                    onCheckedChange={() => handleToggleColumn('stDate')}
                >
                    stDate
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.client}
                    onCheckedChange={() => handleToggleColumn('client')}
                >
                    client
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.updatedAt}
                    onCheckedChange={() => handleToggleColumn('updatedAt')}
                >
                    updatedAt
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.done}
                    onCheckedChange={() => handleToggleColumn('done')}
                >
                    done
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.budget}
                    onCheckedChange={() => handleToggleColumn('budget')}
                >
                    budget
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.actual}
                    onCheckedChange={() => handleToggleColumn('actual')}
                >
                    actual
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.taskStat}
                    onCheckedChange={() => handleToggleColumn('taskStat')}
                >
                    task
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    // Get unique years from projects for the filter dropdown
    const uniqueYears = useMemo(() => {
        const years = projects
            .map(project => {
                if (project.stDate) {
                    return getYear(new Date(project.stDate));
                }
                return project.year;
            })
            .filter((year): year is number => year !== undefined)
            .filter((year, index, self) => self.indexOf(year) === index)
            .sort((a, b) => b - a);
        return years;
    }, [projects]);

    const filteredAndSortedProjects = useMemo(() => {
        // First filter projects based on search term
        let filteredProjects = projects;
        if (searchTerm) {
            filteredProjects = projects.filter(project => 
                (project.code && project.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
                project.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Then filter by type if not 'all'
        if (typeFilter !== 'all') {
            filteredProjects = filteredProjects.filter(project => project.typ === typeFilter);
        }
        
        // Then filter by active if not 'all'
        if (activeFilter !== 'all') {
            const activeValue = activeFilter === 'true';
            filteredProjects = filteredProjects.filter(project => project.active === activeValue);
        }
        
        // Then filter by year if not 'all'
        if (yearFilter !== 'all') {
            const yearFromFilter = parseInt(yearFilter);
            filteredProjects = filteredProjects.filter(project => {
                const projectYear = project.stDate ? getYear(new Date(project.stDate)) : project.year;
                return projectYear === yearFromFilter;
            });
        }
        
        // Then sort the filtered projects
        if (!sortConfig) {
            // Default sort by stDate descending if no sort config
            return [...filteredProjects].sort((a, b) => {
                const aValue = a.stDate ? new Date(a.stDate).getTime() : 0;
                const bValue = b.stDate ? new Date(b.stDate).getTime() : 0;
                return bValue - aValue; // descending
            });
        }
        
        return [...filteredProjects].sort((a, b) => {
            // Special handling for computed properties
            let aValue, bValue;
            
            if (sortConfig.key === 'environmentCount') {
                aValue = a.environmentCount ?? 0;
                bValue = b.environmentCount ?? 0;
            } else if (sortConfig.key === 'transactionCount') {
                aValue = a.transactionCount ?? 0;
                bValue = b.transactionCount ?? 0;
            } else if (sortConfig.key === 'stDate') {
                // Special handling for date comparison
                aValue = a.stDate ? new Date(a.stDate).getTime() : 0;
                bValue = b.stDate ? new Date(b.stDate).getTime() : 0;
            } else if (sortConfig.key === 'client') {
                // Special handling for client company comparison
                aValue = a.client?.company || '';
                bValue = b.client?.company || '';
            } else if (sortConfig.key === 'code') {
                // Special handling for optional code field
                aValue = a.code || '';
                bValue = b.code || '';
            } else {
                aValue = a[sortConfig.key];
                bValue = b[sortConfig.key];
            }
            
            // Handle undefined values
            if (aValue === undefined && bValue === undefined) return 0;
            if (aValue === undefined) return 1;
            if (bValue === undefined) return -1;
            
            // Handle different types
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortConfig.direction === 'asc' 
                  ? aValue.localeCompare(bValue) 
                  : bValue.localeCompare(aValue);
            }
            
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortConfig.direction === 'asc' 
                  ? aValue - bValue 
                  : bValue - aValue;
            }
            
            if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
                return sortConfig.direction === 'asc' 
                  ? (aValue === bValue ? 0 : aValue ? -1 : 1) 
                  : (aValue === bValue ? 0 : aValue ? 1 : -1);
            }
            
            // Convert to string for comparison if types don't match
            return sortConfig.direction === 'asc' 
              ? String(aValue).localeCompare(String(bValue)) 
              : String(bValue).localeCompare(String(aValue));
        });
    }, [projects, sortConfig, searchTerm, typeFilter, yearFilter, activeFilter]);

    const getTypeProjectBadge = (type: string) => {
        switch (type) {
            case 'project':
                return <span className="bg-blue-100 text-green-800 text-xs px-2 py-1 rounded-none">project</span>;
            case 'routine':
                return <span className="bg-green-100 text-brown-800 text-xs px-2 py-1 rounded-none">routine</span>;
            case 'other':
                return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-none">other</span>;
            default:
                return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-none">unknown</span>;
        }
    };

    const renderStatCell = (stat: StatCount | undefined) => {
        if (!stat) return <span className="text-xs text-muted-foreground">-</span>;
        return (
            <div className="text-center">
                <div className="text-sm font-medium">
                    <span className="text-green-700">{stat.done}</span>
                    <span className="text-muted-foreground">/{stat.total}</span>
                </div>
            </div>
        );
    };

    const renderTaskCell = (project: Project) => {
        const stats = projectStats?.[project._id];
        if (!stats) return <span className="text-xs text-muted-foreground">-</span>;
        
        return (
            <div className="flex items-center gap-2 justify-center text-xs">
                <div className="text-center">
                    <span className="text-green-700 font-medium">{stats.budgetCount.done}</span>
                    <span className="text-muted-foreground">/{stats.budgetCount.total}</span>
                </div>
                <span className="text-muted-foreground">--</span>
                <div className="text-center">
                    <span className="text-green-700 font-medium">{stats.actualCount.done}</span>
                    <span className="text-muted-foreground">/{stats.actualCount.total}</span>
                </div>
                <span className="text-muted-foreground">--</span>
                <div className="text-center">
                    <span className="text-green-700 font-medium">{stats.trxCount.done}</span>
                    <span className="text-muted-foreground">/{stats.trxCount.total}</span>
                </div>
            </div>
        );
    };

    const renderBudgetCell = (project: Project) => {
        if (!project.info) return <span className="text-xs text-muted-foreground">-</span>;
        
        const income = project.info.income?.budget || 0;
        const expense = project.info.expense?.budget || 0;
        const profit = project.info.profit?.budget || 0;
        
        return (
            <div className="flex flex-col gap-1 text-right text-xs">
                <div className="text-green-600">{formatCurrency(income)}</div>
                <div className="text-red-400">{formatCurrency(expense)}</div>
                { income >= expense ? 
                    <div className="text-green-500">{formatCurrency(profit)}</div> 
                    : <div className="text-red-500">{formatCurrency(profit)}</div> 
                }    
            </div>
        );
    };

    const renderActualCell = (project: Project) => {
        if (!project.info) return <span className="text-xs text-muted-foreground">-</span>;
        
        const income = project.info.income?.actual || 0;
        const expense = project.info.expense?.actual || 0;
        const profit = project.info.profit?.actual || 0;
        
        return (
            <div className="flex flex-col gap-1 text-right text-xs">
                <div className="text-green-600">{formatCurrency(income)}</div>
                <div className="text-red-400">{formatCurrency(expense)}</div>
                { income >= expense ? 
                    <div className="text-green-500">{formatCurrency(profit)}</div> 
                    : <div className="text-red-500">{formatCurrency(profit)}</div> 
                }    
            </div>
        );
    };

    const calculateSelectedIncome = useMemo(() => {
        return selectedIds.reduce((sum, id) => {
            const project = filteredAndSortedProjects.find(p => p._id === id);
            if (project?.active && project?.info?.income?.budget) {
                return sum + project.info.income.budget;
            }
            return sum;
        }, 0);
    }, [selectedIds, filteredAndSortedProjects]);

    const calculateSelectedExpense = useMemo(() => {
        return selectedIds.reduce((sum, id) => {
            const project = filteredAndSortedProjects.find(p => p._id === id);
            if (project?.active && project?.info?.expense?.budget) {
                return sum + project.info.expense.budget;
            }
            return sum;
        }, 0);
    }, [selectedIds, filteredAndSortedProjects]);

    const calculateSelectedProfit = useMemo(() => {
        return selectedIds.reduce((sum, id) => {
            const project = filteredAndSortedProjects.find(p => p._id === id);
            if (project?.active && project?.info?.profit?.budget) {
                return sum + project.info.profit.budget;
            }
            return sum;
        }, 0);
    }, [selectedIds, filteredAndSortedProjects]);

    const calculateSelectedActualIncome = useMemo(() => {
        return selectedIds.reduce((sum, id) => {
            const project = filteredAndSortedProjects.find(p => p._id === id);
            if (project?.active && project?.info?.income?.actual) {
                return sum + project.info.income.actual;
            }
            return sum;
        }, 0);
    }, [selectedIds, filteredAndSortedProjects]);

    const calculateSelectedActualExpense = useMemo(() => {
        return selectedIds.reduce((sum, id) => {
            const project = filteredAndSortedProjects.find(p => p._id === id);
            if (project?.active && project?.info?.expense?.actual) {
                return sum + project.info.expense.actual;
            }
            return sum;
        }, 0);
    }, [selectedIds, filteredAndSortedProjects]);

    const calculateSelectedActualProfit = useMemo(() => {
        return selectedIds.reduce((sum, id) => {
            const project = filteredAndSortedProjects.find(p => p._id === id);
            if (project?.active && project?.info?.profit?.actual) {
                return sum + project.info.profit.actual;
            }
            return sum;
        }, 0);
    }, [selectedIds, filteredAndSortedProjects]);



    return (
        <div className="flex flex-col h-screen">
            <div className="flex items-center py-2 gap-2 flex-wrap justify-between flex-shrink-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by code or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                              <Filter className="h-4 w-4" />
                              {activeFilter === 'all' ? 'Active' : (activeFilter === 'true' ? 'Active' : 'Inactive')}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => setActiveFilter('all')}>
                                <span className="font-semibold text-cyan-600">All Status</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveFilter('true')}>
                                active
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveFilter('false')}>
                                inactive
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                              <Filter className="h-4 w-4" />
                              {typeFilter === 'all' ? 'Type' : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                                <span className="font-semibold text-cyan-600">All Types</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTypeFilter('project')}>
                                project
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTypeFilter('routine')}>
                                routine
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTypeFilter('other')}>
                                other   
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                {yearFilter === 'all' ? 'Year' : yearFilter}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => setYearFilter('all')}>
                              <span className="font-semibold text-cyan-600">All Years</span>
                            </DropdownMenuItem>
                            {uniqueYears.map(year => (
                                <DropdownMenuItem key={year} onClick={() => setYearFilter(year.toString())}>
                                    {year}
                                </DropdownMenuItem>
                            ))}
                            {uniqueYears.length === 0 && (
                                <DropdownMenuItem disabled>
                                    No years available
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {renderColumnVisibilityControls()}
                </div>
                {onAddProject && (
                    <Button onClick={onAddProject} className="ml-auto">
                        Add Project
                    </Button>
                )}
            </div>
            <div className="rounded-md border flex-1 overflow-hidden flex flex-col">
                <Table className="border-spacing-y-2">
                    <TableHeader className="border-b-3 border-gray-300 sticky top-0 bg-white z-10">
                        <TableRow>
                            <TableHead className="w-12">No</TableHead>
                            <TableHead className="w-12">
                                <Checkbox
                                  checked={selectedIds.length === filteredAndSortedProjects.length && filteredAndSortedProjects.length > 0}
                                  onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            {visibleColumns.active && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('active')}>
                                    <div className="flex items-center">
                                        <Power className="h-3 w-3 text-cyan-500" />
                                        {renderSortIndicator('active')}
                                    </div>
                                </TableHead>
                            )}
                            {visibleColumns.codename && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('code')}>
                                    <div className="flex items-center gap-2">
                                        code/name
                                        {renderSortIndicator('code')}
                                    </div>
                                </TableHead>
                            )}
                            {/* {visibleColumns.name && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                                    name
                                </TableHead>
                            )} */}
                            {visibleColumns.typ && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('typ')}>
                                    <div className="flex items-center">
                                        type
                                        {renderSortIndicator('typ')}
                                    </div>
                                </TableHead>
                            )}
                            {visibleColumns.year && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('year')}>
                                    <div className="flex items-center">
                                        year
                                        {renderSortIndicator('year')}
                                    </div>
                                </TableHead>
                            )}
                            {visibleColumns.stDate && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('stDate')}>
                                    <div className="flex items-center">
                                        stDate
                                        {renderSortIndicator('stDate')}
                                    </div>
                                </TableHead>
                            )}
                            {visibleColumns.client && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('client' as keyof Project)}>
                                    <div className="flex items-center">
                                        client
                                        {renderSortIndicator('client' as keyof Project)}
                                    </div>
                                </TableHead>
                            )}
                            {visibleColumns.updatedAt && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('updatedAt')}>
                                    <div className="flex items-center">
                                        updatedAt
                                        {renderSortIndicator('updatedAt')}
                                    </div>
                                </TableHead>
                            )}
                            {visibleColumns.done && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('done')}>
                                    <div className="flex items-center">
                                        done
                                        {renderSortIndicator('done')}
                                    </div>
                                </TableHead>
                            )}
                            {visibleColumns.budget && (
                                <TableHead className="text-right">
                                    <div className="text-sm">budget</div>
                                    <div className="text-xs text-green-600 font-normal mt-1">{formatCurrency(calculateSelectedIncome)}</div>
                                    <div className="text-xs text-red-400 font-normal">{formatCurrency(calculateSelectedExpense)}</div>
                                    <div className="text-xs text-green-500 font-normal">{formatCurrency(calculateSelectedProfit)}</div>
                                </TableHead>
                            )}
                            {visibleColumns.actual && (
                                <TableHead className="text-right">
                                    <div className="text-sm">actual</div>
                                    <div className="text-xs text-green-600 font-normal mt-1">{formatCurrency(calculateSelectedActualIncome)}</div>
                                    <div className="text-xs text-red-400 font-normal">{formatCurrency(calculateSelectedActualExpense)}</div>
                                    <div className="text-xs text-green-500 font-normal">{formatCurrency(calculateSelectedActualProfit)}</div>
                                </TableHead>
                            )}
                            {visibleColumns.taskStat && (
                                <TableHead className="text-center">task</TableHead>
                            )}
                            <TableHead className="w-20 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="border-spacing-y-2 overflow-y-auto">
                        {filteredAndSortedProjects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="text-center py-10">
                                    <X className="text-red-500" size={16} />No projects found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAndSortedProjects.map((project, index) => (
                                <TableRow key={project._id} className="hover:bg-muted/50">
                                    <TableCell className="text-center text-sm text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.includes(project._id)}
                                            onCheckedChange={(checked) => handleSelectRow(project._id, checked as boolean)}
                                        />
                                    </TableCell>
                                    {visibleColumns.active && (
                                        <TableCell>{IconActive(project.active)}</TableCell>
                                    )}
                                
                                    {visibleColumns.codename && (
                                        <TableCell>
                                            <button 
                                                onClick={() => onView(project)}
                                                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-sm"
                                            >
                                                {project.name}
                                            </button>
                                            <div className="text-xs text-muted-foreground">{project.code || '-'}</div>
                                        </TableCell>
                                    )}
                                    {/* {visibleColumns.name && (
                                        <TableCell className="font-medium">{project.name}</TableCell>
                                    )} */}
                                    {visibleColumns.typ && (
                                        <TableCell>{getTypeProjectBadge(project.typ)}</TableCell>
                                    )}
                                    {visibleColumns.year && (
                                        <TableCell>{project.stDate ? getYear(new Date(project.stDate)) : (project.year || 'N/A')}</TableCell>
                                    )}
                                    {visibleColumns.stDate && (
                                        <TableCell>
                                            {project.stDate ? format(new Date(project.stDate), 'yyyy-MM') : 'N/A'}
                                        </TableCell>
                                    )}
                                    {visibleColumns.client && (
                                        <TableCell>
                                            <div className="text-sm">{project.client?.company || '-'}</div>
                                            {project.client?.contact && (
                                                <div className="text-xs text-muted-foreground">{project.client.contact}</div>
                                            )}
                                        </TableCell>
                                    )}
                                    {visibleColumns.updatedAt && (
                                        <TableCell>
                                            {format(new Date(project.updatedAt), 'MMM dd, yyyy')}
                                        </TableCell>
                                    )}
                                    {visibleColumns.done && (
                                        <TableCell>{IconDone(project.done)}</TableCell>
                                    )}
                                    {visibleColumns.budget && (
                                        <TableCell className="px-2">{renderBudgetCell(project)}</TableCell>
                                    )}
                                    {visibleColumns.actual && (
                                        <TableCell className="px-2">{renderActualCell(project)}</TableCell>
                                    )}
                                    {visibleColumns.taskStat && (
                                        <TableCell className="px-2">{renderTaskCell(project)}</TableCell>
                                    )}
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteClick(project)}
                                            disabled={!onDelete}
                                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {/* Selection info */}
            <div className="text-sm text-muted-foreground flex-shrink-0 py-2">
                {selectedIds.length > 0 
                    ? `${selectedIds.length} of ${filteredAndSortedProjects.length} project(s) selected` 
                    : `${filteredAndSortedProjects.length} project(s) total`}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete project "{projectToDelete?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}