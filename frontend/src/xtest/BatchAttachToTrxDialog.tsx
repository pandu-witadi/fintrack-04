import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';

interface BatchAttachToTrxDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    batchAttachToTrxForm: {
        trxId: string;
        timePlan: string;
        timeActual: string;
    };
    onBatchAttachToTrxFormChange: (field: string, value: string) => void;
    onBatchAttachToTrxSubmit: () => Promise<void>;
    selectedEvents: Set<string>;
    events: any[];
    transactions: any[];
    transactionsLoading: boolean;
    transactionsError: string | null;
    isEventUnlinked: (event: any) => boolean;
    isSubmitting: boolean;
}

export function BatchAttachToTrxDialog({
    open,
    onOpenChange,
    batchAttachToTrxForm,
    onBatchAttachToTrxFormChange,
    onBatchAttachToTrxSubmit,
    selectedEvents,
    events,
    transactions,
    transactionsLoading,
    transactionsError,
    isEventUnlinked,
    isSubmitting
}: BatchAttachToTrxDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Attach Events to Transaction</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Selected Events</Label>
                        <div className="text-sm p-2 bg-muted rounded max-h-32 overflow-y-auto">
                            {selectedEvents.size > 0 ? (
                                (() => {
                                    // Get the selected unlinked events
                                    const selectedEventIds = Array.from(selectedEvents);
                                    const selectedEventsData = events.filter(event => 
                                        selectedEventIds.includes(event._id) && isEventUnlinked(event)
                                    );
                                    
                                    return selectedEventsData.length > 0 ? (
                                        selectedEventsData.map(event => (
                                            <div key={event._id} className="py-1 border-b border-muted last:border-0">
                                                <div className="font-medium">{event.name}</div>
                                                <div className="text-muted-foreground text-xs">{event.typ} - {event.grp}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No unlinked events selected</p>
                                    );
                                })()
                            ) : (
                                <p className="text-muted-foreground">No events selected</p>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {(() => {
                                const selectedEventIds = Array.from(selectedEvents);
                                const selectedEventsData = events.filter(event => 
                                    selectedEventIds.includes(event._id) && isEventUnlinked(event)
                                );
                                return `${selectedEventsData.length} unlinked event(s) will be attached`;
                            })()}
                        </p>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="batch-trxId">Transaction</Label>
                        {transactionsLoading ? (
                            <p className="text-muted-foreground text-sm">Loading transactions...</p>
                        ) : transactionsError ? (
                            <p className="text-muted-foreground text-sm text-red-500">Error loading transactions</p>
                        ) : transactions.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No transactions available</p>
                        ) : (
                            <Select value={batchAttachToTrxForm.trxId} onValueChange={(value) => onBatchAttachToTrxFormChange('trxId', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a transaction" />
                                </SelectTrigger>
                                <SelectContent>
                                    {transactions.map((transaction) => (
                                        <SelectItem key={transaction._id} value={transaction._id}>
                                            <div className="flex justify-between w-full">
                                                <span>{transaction.name}</span>
                                                <span className="text-muted-foreground ml-2">
                                                    {transaction.typ} - {transaction.grp}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="batch-attach-timePlan">Planned Date</Label>
                            <Input
                                id="batch-attach-timePlan"
                                type="date"
                                value={batchAttachToTrxForm.timePlan}
                                onChange={(e) => onBatchAttachToTrxFormChange('timePlan', e.target.value)}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="batch-attach-timeActual">Actual Date</Label>
                            <Input
                                id="batch-attach-timeActual"
                                type="date"
                                value={batchAttachToTrxForm.timeActual}
                                onChange={(e) => onBatchAttachToTrxFormChange('timeActual', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={onBatchAttachToTrxSubmit} 
                        disabled={isSubmitting || !batchAttachToTrxForm.trxId || selectedEvents.size === 0}
                    >
                        {isSubmitting ? 'Attaching...' : 'Attach All'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
