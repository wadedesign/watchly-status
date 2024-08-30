'use client'

import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Trash2 } from 'lucide-react';
import { WatchlyMonitorForm } from './MonitorsAdd';

// Add this interface to define the props for WatchlyMonitorForm
interface WatchlyMonitorFormProps {
  onSubmit: (formData: any) => Promise<void>;
  initialData: Monitor;
}

const API_URL = 'http://127.0.0.1:34001/monitors/monitors';

interface Monitor {
  id: number;
  name: string;
  url: string;
  method: string;
  headers?: Record<string, string>;
  frequency?: number;
  tags?: string[];
  assertions?: string[];
}

const MonitorsList: React.FC = () => {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMonitor, setEditingMonitor] = useState<Monitor | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchMonitors = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMonitors(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch monitors",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
  }, []);

  const handleEdit = (monitor: Monitor) => {
    setEditingMonitor(monitor);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Monitor deleted successfully",
        });
        fetchMonitors();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete monitor",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!editingMonitor) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/${editingMonitor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Monitor updated successfully",
        });
        setEditingMonitor(null);
        setIsEditDialogOpen(false);
        fetchMonitors();
      } else {
        toast({
          title: "Error",
          description: "Failed to update monitor",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading monitors...</div>;
  }

  return (
    <div className="space-y-4">
      {monitors.map((monitor) => (
        <Card key={monitor.id} className="bg-green-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-green-100">{monitor.name}</CardTitle>
            <div className="space-x-2">
              <Button variant="outline" size="icon" onClick={() => handleEdit(monitor)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={() => handleDelete(monitor.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-green-100">URL: {monitor.url}</p>
            <p className="text-green-100">Method: {monitor.method}</p>
            {monitor.frequency && <p className="text-green-100">Frequency: {monitor.frequency} minutes</p>}
            {monitor.tags && <p className="text-green-100">Tags: {monitor.tags.join(', ')}</p>}
          </CardContent>
        </Card>
      ))}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-green-900 text-green-100">
          <DialogHeader>
            <DialogTitle>Edit Monitor</DialogTitle>
          </DialogHeader>
          {editingMonitor && (
            <WatchlyMonitorForm 
              onSubmit={handleUpdate} 
              initialData={editingMonitor} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonitorsList;