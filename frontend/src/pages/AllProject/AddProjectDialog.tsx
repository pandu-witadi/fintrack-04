import { useState } from 'react';
import { Project } from '../../services/projectService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';

interface ProjectFormProps {
    project?: Project;
    onSubmit: (data: Partial<Project>) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export default function AddProjectDialog({ project, onSubmit, onCancel, isSubmitting }: ProjectFormProps) {
    const [formData, setFormData] = useState({
        code: project?.code || '',
        name: project?.name || '',
        note: project?.note || '',
        active: project?.active ?? true,
        done: project?.done ?? false,
        typ: project?.typ || 'project',
        year: project?.year?.toString() || new Date().getFullYear().toString(),
        stDate: project?.stDate || new Date().toISOString().split('T')[0],
        enDate: project?.enDate || new Date().toISOString().split('T')[0],
        client: {
            company: project?.client?.company || '',
            sub: project?.client?.sub || '',
            contact: project?.client?.contact || '',
            phone: project?.client?.phone || '',
            email: project?.client?.email || '',
            address: project?.client?.address || '',
        } as any,
    });
    const [isClientCollapsed, setIsClientCollapsed] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('client.')) {
            const clientField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                client: { ...prev.client, [clientField]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Only include client data if at least one field is filled
        const hasClientData = Object.values(formData.client).some(value => value && (typeof value === 'string' && value.trim() !== ''));
        const clientData = hasClientData ? formData.client : undefined;
        
        const data = {
            ...formData,
            client: clientData,
            year: formData.year ? parseInt(formData.year) : undefined,
            stDate: formData.stDate || undefined,
            enDate: formData.enDate || formData.stDate || undefined,
        };
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="code">code *</Label>
                    <Input
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        required
                        placeholder="Enter project code"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="typ">type</Label>
                    <Select name="typ" value={formData.typ} onValueChange={(value: string) => handleSelectChange('typ', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="project">project</SelectItem>
                            <SelectItem value="routine">routine</SelectItem>
                            <SelectItem value="other">other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">name *</Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter project name"
                    />
                </div>
                
              
                
                <div className="space-y-2">
                    <Label htmlFor="stDate">start date</Label>
                    <Input
                        id="stDate"
                        name="stDate"
                        type="date"
                        value={formData.stDate}
                        onChange={handleChange} 
                        placeholder="Select start date"
                    />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="enDate">end date</Label>
                    <Input
                        id="enDate"
                        name="enDate"
                        type="date"
                        value={formData.enDate}
                        onChange={handleChange}
                        placeholder="Select end date"
                    />
                </div>
            <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="note">note</Label>
                    <Textarea
                        id="note"
                        name="note"
                        value={formData.note}
                        onChange={handleChange as any}
                        placeholder="Enter project notes"
                    />
                </div>
                
                <div className="space-y-2 md:col-span-2 border-t pt-4">
                    <button
                        type="button"
                        onClick={() => setIsClientCollapsed(!isClientCollapsed)}
                        className="flex items-center justify-between w-full text-base font-semibold hover:text-blue-600 transition-colors"
                    >
                        <span>Client Information</span>
                        {isClientCollapsed ? 
                            <ChevronDown className="h-5 w-5" /> : 
                            <ChevronUp className="h-5 w-5" />
                        }
                    </button>
                </div>
                
                {!isClientCollapsed && (
                    <>
                <div className="space-y-2">
                    <Label htmlFor="client.company">Company</Label>
                    <Input
                        id="client.company"
                        name="client.company"
                        value={formData.client.company}
                        onChange={handleChange}
                        placeholder="Enter company name"
                        maxLength={50}
                    />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="client.sub">Sub Company</Label>
                    <Input
                        id="client.sub"
                        name="client.sub"
                        value={formData.client.sub}
                        onChange={handleChange}
                        placeholder="Enter sub company name"
                        maxLength={50}
                    />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="client.contact">Contact</Label>
                    <Input
                        id="client.contact"
                        name="client.contact"
                        value={formData.client.contact}
                        onChange={handleChange}
                        placeholder="Enter contact person"
                    />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="client.phone">Phone</Label>
                    <Input
                        id="client.phone"
                        name="client.phone"
                        value={formData.client.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                    />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="client.email">Email</Label>
                    <Input
                        id="client.email"
                        name="client.email"
                        type="email"
                        value={formData.client.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                    />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="client.address">Address</Label>
                    <Textarea
                        id="client.address"
                        name="client.address"
                        value={formData.client.address}
                        onChange={handleChange as any}
                        placeholder="Enter address"
                        maxLength={100}
                    />
                </div>
                    </>
                )}
                
                <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <input
                                id="active"
                                name="active"
                                type="checkbox"
                                checked={formData.active}
                                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="active">Active</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                id="done"
                                name="done"
                                type="checkbox"
                                checked={formData.done}
                                onChange={(e) => setFormData(prev => ({ ...prev, done: e.target.checked }))}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="done">Done</Label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
                </Button>
            </div>
        </form>
    );
}