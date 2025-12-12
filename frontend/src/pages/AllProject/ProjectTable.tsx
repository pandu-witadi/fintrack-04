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
    Trash2
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
import { format } from 'date-fns';


interface ProjectsTableProps {
    projects: Project[];
    onEdit?: (project: Project) => void; // Make onEdit optional
    onDelete?: (id: string) => void; // Make onDelete optional
    onView: (project: Project) => void;
}

export default function ProjectTable({ projects, onEdit, onDelete, onView }: ProjectsTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Project; direction: 'asc' | 'desc' } | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [yearFilter, setYearFilter] = useState<string>('all');
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

    // Refactored column visibility controls into a separate function
    const [visibleColumns, setVisibleColumns] = useState({
        active: true,
        code: true,
        name: true,
        typ: true,
        year: true,
        stDate: true,
        environmentCount: false,
        transactionCount: false,
        updatedAt: true,
        done: true
    });
    const renderColumnVisibilityControls = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Columns
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.active}
                    onCheckedChange={() => handleToggleColumn('active')}
                >
                    Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.code}
                    onCheckedChange={() => handleToggleColumn('code')}
                >
                    Code
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.name}
                    onCheckedChange={() => handleToggleColumn('name')}
                >
                    Name
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.typ}
                    onCheckedChange={() => handleToggleColumn('typ')}
                >
                    Type
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.year}
                    onCheckedChange={() => handleToggleColumn('year')}
                >
                    Year
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.stDate}
                    onCheckedChange={() => handleToggleColumn('stDate')}
                >
                    Start Date
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.environmentCount}
                    onCheckedChange={() => handleToggleColumn('environmentCount')}
                >
                    Events
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.transactionCount}
                    onCheckedChange={() => handleToggleColumn('transactionCount')}
                >
                    Transactions
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.updatedAt}
                    onCheckedChange={() => handleToggleColumn('updatedAt')}
                >
                    Updated At
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                    checked={visibleColumns.done}
                    onCheckedChange={() => handleToggleColumn('done')}
                >
                    Done
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    // Get unique years from projects for the filter dropdown
    const uniqueYears = useMemo(() => {
        const years = projects
            .map(project => project.year)
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
                project.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Then filter by type if not 'all'
        if (typeFilter !== 'all') {
            filteredProjects = filteredProjects.filter(project => project.typ === typeFilter);
        }
        
        // Then filter by year if not 'all'
        if (yearFilter !== 'all') {
            filteredProjects = filteredProjects.filter(project => project.year === parseInt(yearFilter));
        }
        
        // Then sort the filtered projects
        if (!sortConfig) return filteredProjects;
        
        return [...filteredProjects].sort((a, b) => {
            // Special handling for computed properties
            let aValue, bValue;
            
            if (sortConfig.key === 'environmentCount') {
                aValue = a.environmentCount ?? 0;
                bValue = b.environmentCount ?? 0;
            } else if (sortConfig.key === 'transactionCount') {
                aValue = a.transactionCount ?? 0;
                bValue = b.transactionCount ?? 0;
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
    }, [projects, sortConfig, searchTerm, typeFilter, yearFilter]);

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'project':
                return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Project</span>;
            case 'routine':
                return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Routine</span>;
            case 'other':
                return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Other</span>;
            default:
                return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Unknown</span>;
        }
    };



    return (
        <div className="space-y-4">
            <div className="flex items-center py-2 gap-2 flex-wrap">
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
                          {typeFilter === 'all' ? 'Type' : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                            <span className="font-semibold text-cyan-600">All Types</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTypeFilter('project')}>
                            Project
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTypeFilter('routine')}>
                            Routine
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTypeFilter('other')}>
                            Other
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
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
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
                                    <Power className="h-3 w-3 text-cyan-500" />
                                </TableHead>
                            )}
                            {visibleColumns.code && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('code')}>
                                    code
                                </TableHead>
                            )}
                            {visibleColumns.name && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                                    name
                                </TableHead>
                            )}  
                            {visibleColumns.typ && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('typ')}>
                                    type
                                </TableHead>
                            )}
                            {visibleColumns.year && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('year')}>
                                    year
                                </TableHead>
                            )}
                            {visibleColumns.stDate && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('stDate')}>
                                    stDate
                                </TableHead>
                            )}
                            {visibleColumns.environmentCount && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('environmentCount')}>
                                    events
                                </TableHead>
                            )}
                            {visibleColumns.transactionCount && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('transactionCount')}>
                                    transactions
                                </TableHead>
                            )}
                            {visibleColumns.updatedAt && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('updatedAt')}>
                                    updatedAt
                                </TableHead>
                            )}
                            {visibleColumns.done && (
                                <TableHead className="cursor-pointer" onClick={() => handleSort('done')}>
                                    done
                                </TableHead>
                            )}
                            <TableHead className="w-20 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAndSortedProjects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 3} className="text-center py-10">
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
                                  {visibleColumns.code && (
                                      <TableCell className="font-medium">{project.code}</TableCell>
                                  )}
                                  {visibleColumns.name && (
                                      <TableCell>
                                          <button 
                                            onClick={() => onView(project)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                          >
                                              {project.name}
                                          </button>
                                      </TableCell>
                                  )}
                                  {visibleColumns.typ && (
                                      <TableCell>{getTypeBadge(project.typ)}</TableCell>
                                  )}
                                  {visibleColumns.year && (
                                      <TableCell>{project.year || 'N/A'}</TableCell>
                                  )}
                                  {visibleColumns.stDate && (
                                      <TableCell>
                                        {project.stDate ? format(new Date(project.stDate), 'MMM dd, yyyy') : 'N/A'}
                                      </TableCell>
                                  )}
                                  {visibleColumns.environmentCount && (
                                      <TableCell>
                                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground border-gray-200">
                                              {project.environmentCount || 0}
                                          </span>
                                      </TableCell>
                                  )}
                                  {visibleColumns.transactionCount && (
                                      <TableCell>
                                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground border-gray-200">
                                              {project.transactionCount || 0}
                                          </span>
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
            <div className="text-sm text-muted-foreground">
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