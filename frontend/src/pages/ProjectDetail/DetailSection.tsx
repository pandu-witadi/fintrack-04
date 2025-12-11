import { format } from 'date-fns';
import { Calculator, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { IconActive } from '@/components/IconActive';
import { IconDone } from '@/components/IconDone';


interface Project {
    _id: string;
    name: string;
    code: string;
    typ: string;
    year?: number;
    active: boolean;
    done: boolean;
    createdAt: string;
    updatedAt: string;
    note?: string;
    updatedBy?: {
        name: string;
        email: string;
    };
    info?: {
        income?: {
            budget: number;
            actual: number;
        };
        expense?: {
            budget: number;
            actual: number;
        };
        profit?: {
            budget: number;
            actual: number;
        };
    };
}

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
        <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
                <div key={index} className="rounded-lg border bg-card shadow-sm p-6">
                    <div className="flex flex-col space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-2xl font-bold text-primary">{stat.done}</span>
                            <span className="text-sm text-muted-foreground">/ {stat.total}</span>
                        </div>
                        <div className="mt-2 w-full bg-secondary rounded-full h-2">
                            <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{
                                    width: stat.total > 0 ? `${(stat.done / stat.total) * 100}%` : '0%'
                                }}
                            />
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
    const [isFinancialSummaryCollapsed, setIsFinancialSummaryCollapsed] = useState(false);

    const stats: StatItem[] = [
        {
            label: 'Budgets',
            done: budgetCount.done,
            total: budgetCount.total
        },
        {
            label: 'Actuals',
            done: actualCount.done,
            total: actualCount.total
        },
        {
            label: 'Transactions',
            done: trxCount.done,
            total: trxCount.total
        }
    ];

    return (
        <>
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div>
                        <h1 className="text-2xl font-bold">{project.name}</h1>
                        {/* <p className="text-muted-foreground text-sm">Project details and events</p> */}
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCalculateFinance} disabled={isCalculating}>
                        <Calculator className="h-4 w-4 mr-2" />
                        {isCalculating ? 'Calculating...' : 'calc'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                </div>
            </div>

           

            <div className="grid grid-cols-5 gap-8 mt-8">
                {/* Left Column - Project Details (2 columns) */}
                <div className="col-span-3">
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
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Code:</span>
                                        <span>{project.code}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Name:</span>
                                        <span>{project.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Type:</span>
                                        <span>{project.typ}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Year:</span>
                                        <span>{project.year || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Active:</span>
                                        <span>{IconActive(project.active)}</span>
                                    </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Done:</span>
                                        <span>{IconDone(project.done)}</span>
                                    </div>
                                    {project.note && (
                                        <div className="mt-2">
                                            <span className="text-muted-foreground">Notes:</span>
                                            <p className="mt-1">{project.note}</p>
                                        </div>
                                    )}
                                       <div className="p-4 pt-0 border-t">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Created:</span>
                                        <span>{format(new Date(project.createdAt), 'MMM dd, yyyy')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Updated:</span>
                                        <span>{format(new Date(project.updatedAt), 'MMM dd, yyyy')}</span>
                                    </div>
                                    <div className="flex flex-col mt-3">
                                        <span className="text-muted-foreground">Project ID:</span>
                                        <span className="font-mono text-xs truncate">{project._id}</span>
                                    </div>
                                    {project.updatedBy && (
                                        <div className="mt-3 pt-3 border-t">
                                            <span className="text-muted-foreground">Updated By:</span>
                                            <p className="mt-1">{project.updatedBy.name}</p>
                                            <p className="text-muted-foreground text-xs">{project.updatedBy.email}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Financial Summary (1 column) */}
                <div className="col-span-2">
                    {/* Statistics Block */}
                    <StatisticsBlock stats={stats} />
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

                
            </div>
        </>
    );
}

export default DetailSection;
