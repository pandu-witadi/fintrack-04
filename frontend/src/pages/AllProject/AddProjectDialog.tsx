import { useState } from 'react';
import { Project } from '../../services/projectService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
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
    typ: project?.typ || 'project',
    year: project?.year?.toString() || new Date().getFullYear().toString(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      year: formData.year ? parseInt(formData.year) : undefined,
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="code">Code *</Label>
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
          <Label htmlFor="name">Name *</Label>
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
          <Label htmlFor="typ">Type</Label>
          <Select name="typ" value={formData.typ} onValueChange={(value: string) => handleSelectChange('typ', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="project">Project</SelectItem>
              <SelectItem value="routine">Routine</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            name="year"
            type="number"
            value={formData.year}
            onChange={handleChange}
            min="1900"
            max="2100"
            placeholder="Enter year"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="note">Notes</Label>
          <Textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange as any}
            placeholder="Enter project notes"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
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