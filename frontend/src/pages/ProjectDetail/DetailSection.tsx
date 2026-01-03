import { format } from 'date-fns';
import { Calculator, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { IconActive } from '@/components/IconActive';
import { IconDone } from '@/components/IconDone';
import { Project } from '@/services/projectService.ts';

interface StatItem {
    label: string;
    done: number;
    total: number;
}

interface DetailSectionProps {
    project: Project;
    handleCalculateFinance: () => void;
    handleEdit: () => void;
    isCalculating: boolean;
    formatCurrency: (value: number) => string;
    budgetCount?: { done: number; total: number };
    actualCount?: { done: number; total: number };
    trxCount?: { done: number; total: number };
}

function StatisticsBlock({ stats }: { stats: StatItem[] }) {
    return (
        <div className="grid grid-cols-3 gap-0">
            {/* Statistics Block */}
            {stats.map((stat, index) => (
                <div key={index} className="rounded-none border-0 bg-card shadow-none p-3">
                    <div className="flex flex-col space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                        <div className="flex items-baseline space-x-1">
                            <span className="text-sm font-bold text-green-600">{stat.done}</span>
                            <span className="text-xs text-muted-foreground">/ {stat.total}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function DetailSection({
    project,
    handleCalculateFinance,
    handleEdit,
    isCalculating,
    formatCurrency,
    budgetCount = { done: 0, total: 0 },
    actualCount = { done: 0, total: 0 },
    trxCount = { done: 0, total: 0 }
}: DetailSectionProps) {
    const [isProjectDetailsCollapsed, setIsProjectDetailsCollapsed] = useState(false);
    const [isClientInfoCollapsed, setIsClientInfoCollapsed] = useState(false);
    const [isFinancialSummaryCollapsed, setIsFinancialSummaryCollapsed] = useState(false);

    const stats: StatItem[] = [
        {
            label: 'Budget',
            done: budgetCount.done,
            total: budgetCount.total
        },
        {
            label: 'Actual',
            done: actualCount.done,
            total: actualCount.total
        },
        {
            label: 'Trx',
            done: trxCount.done,
            total: trxCount.total
        }
    ];

    return (
        <>
            <div className="flex justify-end">
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCalculateFinance} disabled={isCalculating}>
                        <Calculator className="h-4 w-4 mr-2" />
                        {isCalculating ? 'Calculating...' : 'Calc'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                </div>
            </div>

           

            <div className="grid grid-cols-9 gap-4 mt-8">
                {/* Left Column - Project Details (4 columns) */}
                <div className="col-span-4">
                    <div className="rounded-lg border bg-card shadow-sm">
                        <div 
                            className="flex justify-between items-center p-4 cursor-pointer"
                            onClick={() => setIsProjectDetailsCollapsed(!isProjectDetailsCollapsed)}
                        >
                            <h2 className="text-base font-semibold">Project Details</h2>
                            {isProjectDetailsCollapsed ? 
                                <ChevronDown className="h-4 w-4" /> : 
                                <ChevronUp className="h-4 w-4" />
                            }
                        </div>
                        {!isProjectDetailsCollapsed && (
                            <div className="p-4 pt-0 border-t">
                                <div className="space-y-4 text-sm">
                                    {/* Main Info Row */}
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Code</span>
                                            <p className="text-lg font-bold text-blue-600 mt-1">{project.code || '-'}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</span>
                                            <p className="text-base font-medium mt-1">{project.name}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Status & Type Row */}
                                    <div className="grid grid-cols-2 gap-4 py-3 border-y">
                                        <div>
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</span>
                                            <p className="text-sm font-medium mt-1 capitalize">{project.typ}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Start Date</span>
                                            <p className="text-sm font-medium mt-1">{project.stDate ? format(new Date(project.stDate), 'MMM yyyy') : 'N/A'}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Status Indicators Row */}
                                    <div className="grid grid-cols-2 gap-4 pt-3">
                                        <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-950 p-2 rounded">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase">Active</span>
                                            <span className="ml-auto">{IconActive(project.active)}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-950 p-2 rounded">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase">Done</span>
                                            <span className="ml-auto">{IconDone(project.done)}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Notes Section */}
                                    {project.note && (
                                        <div className="pt-3 border-t">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</span>
                                            <p className="mt-2 text-sm text-muted-foreground italic">{project.note}</p>
                                        </div>
                                    )}
                                    
                                    {/* Tags Section */}
                                    {project.tags && project.tags.length > 0 && (
                                        <div className="pt-3 border-t">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tags</span>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {project.tags.map((tag: string, index: number) => (
                                                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-none">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Metadata Section */}
                                    <div className="pt-3 border-t mt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-xs">
                                                <span className="text-muted-foreground">Created:</span>
                                                <p className="text-muted-foreground mt-1">{format(new Date(project.createdAt), 'MMM dd, yyyy')}</p>
                                            </div>
                                            <div className="text-xs">
                                                <span className="text-muted-foreground">Updated:</span>
                                                <p className="text-muted-foreground mt-1">{format(new Date(project.updatedAt), 'MMM dd, yyyy')}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
                                            <div className="text-xs">
                                                <span className="text-muted-foreground">Updated By:</span>
                                                {project.updatedBy ? (
                                                    <>
                                                        <p className="font-medium mt-1">{project.updatedBy.name}</p>
                                                        <p className="text-muted-foreground text-xs">{project.updatedBy.email}</p>
                                                    </>
                                                ) : (
                                                    <p className="text-muted-foreground mt-1">-</p>
                                                )}
                                            </div>
                                            <div className="text-xs">
                                                <span className="text-muted-foreground">Project ID:</span>
                                                <p className="font-mono text-xs text-muted-foreground mt-1 break-all">{project._id}</p>
                                            </div>
                                        </div>
                                    </div>
                                    

                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Middle Column - Financial Summary (3 columns) */}
                <div className="col-span-3">
                    <div className="rounded-lg border bg-card shadow-sm">
                        <div 
                            className="flex justify-between items-center p-4 cursor-pointer"
                            onClick={() => setIsFinancialSummaryCollapsed(!isFinancialSummaryCollapsed)}
                        >
                            <h2 className="text-base font-semibold">Financial Summary</h2>
                            {isFinancialSummaryCollapsed ? 
                                <ChevronDown className="h-4 w-4" /> : 
                                <ChevronUp className="h-4 w-4" />
                            }
                        </div>
                        {!isFinancialSummaryCollapsed && (
                            <div className="rounded-lg border bg-card shadow-sm">
                     
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-semibold"> - </th>
                                        <th className="text-right p-3 font-semibold">Budget</th>
                                        <th className="text-right p-3 font-semibold">Actual</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="p-3 text-xs text-green-700">income</td>
                                        <td className="text-right p-3 font-medium text-xs">{formatCurrency(project.info?.income?.budget || 0)}</td>
                                        <td className="text-right p-3 font-medium text-xs">{formatCurrency(project.info?.income?.actual || 0)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-3 text-xs text-red-600">expense</td>
                                        <td className="text-right p-3 font-medium text-xs">{formatCurrency(project.info?.expense?.budget || 0)}</td>
                                        <td className="text-right p-3 font-medium text-xs">{formatCurrency(project.info?.expense?.actual || 0)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-3 text-xs">profit</td>
                                        <td className="text-right p-3 font-medium text-xs">{formatCurrency(project.info?.profit?.budget || 0)}</td>
                                        <td className="text-right p-3 font-medium text-xs">{formatCurrency(project.info?.profit?.actual || 0)}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 text-xs">% profit</td>
                                        <td className="text-right p-3 font-medium text-xs text-green-700">{project.info?.profit?.budget && project.info?.income?.budget ? ((project.info.profit.budget / project.info.income.budget) * 100).toFixed(2) : '0.00'}%</td>
                                        <td className="text-right p-3 font-medium text-xs text-cyan-600">{project.info?.profit?.actual && project.info?.income?.actual ? ((project.info.profit.actual / project.info.income.actual) * 100).toFixed(2) : '0.00'}%</td>
                                    </tr>
                                </tbody>
                            </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Client Information (2 columns) */}
                <div className="col-span-2 space-y-4">
                    <div className="rounded-lg border bg-card shadow-sm">
                        <div 
                            className="flex justify-between items-center p-4 cursor-pointer"
                            onClick={() => setIsClientInfoCollapsed(!isClientInfoCollapsed)}
                        >
                            <h2 className="text-base font-semibold">Client Info</h2>
                            {isClientInfoCollapsed ? 
                                <ChevronDown className="h-4 w-4" /> : 
                                <ChevronUp className="h-4 w-4" />
                            }
                        </div>
                        {!isClientInfoCollapsed && (
                            <div className="p-4 pt-0 border-t">
                                <div className="space-y-3 text-sm">
                                    {project.client?.company ? (
                                        <>
                                            <div>
                                                <span className="text-muted-foreground">Company:</span>
                                                <p className="font-medium mt-1">{project.client.company}</p>
                                            </div>
                                            {project.client.sub && (
                                                <div>
                                                    <span className="text-muted-foreground">Sub Company:</span>
                                                    <p className="font-medium mt-1">{project.client.sub}</p>
                                                </div>
                                            )}
                                            {project.client.contact && (
                                                <div>
                                                    <span className="text-muted-foreground">Contact:</span>
                                                    <p className="font-medium mt-1">{project.client.contact}</p>
                                                </div>
                                            )}
                                            {project.client.phone && (
                                                <div>
                                                    <span className="text-muted-foreground">Phone:</span>
                                                    <p className="font-medium mt-1">{project.client.phone}</p>
                                                </div>
                                            )}
                                            {project.client.email && (
                                                <div>
                                                    <span className="text-muted-foreground">Email:</span>
                                                    <p className="font-medium mt-1 break-all">{project.client.email}</p>
                                                </div>
                                            )}
                                            {project.client.address && (
                                                <div>
                                                    <span className="text-muted-foreground">Address:</span>
                                                    <p className="font-medium mt-1 text-xs">{project.client.address}</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-muted-foreground text-xs">No client information</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Statistics Block */}
                    <div className="rounded-lg border bg-card shadow-sm">
                        <div className="p-4 border-b">
                            <h3 className="text-base font-semibold">Stat</h3>
                        </div>
                        <div className="p-3">
                            <StatisticsBlock stats={stats} />
                        </div>
                    </div>
                </div>

                
            </div>
        </>
    );
}

export default DetailSection;
