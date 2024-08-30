// frontend/watchly-web/components/monitors/MonitorsAdd.tsx

'use client'

import React, { useState, FormEvent } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface Header {
  key: string;
  value: string;
}

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

interface MonitorFormProps {
  onSubmit: (formData: {
    name: string;
    url: string;
    method: string;
    headers?: Record<string, string>;
    frequency?: number;
    tags?: string[];
    assertions?: string[];
  }) => void;
  initialData?: Monitor;
}

const API_URL = 'http://127.0.0.1:34001/monitors';

interface WatchlyMonitorFormProps {
  onSubmit: (formData: any) => Promise<void>;
  initialData?: Monitor;
}

const WatchlyMonitorForm: React.FC<WatchlyMonitorFormProps> = ({ onSubmit, initialData }) => {
  const [name, setName] = useState<string>(initialData?.name || '');
  const [url, setUrl] = useState<string>(initialData?.url || '');
  const [method, setMethod] = useState<string>(initialData?.method || 'GET');
  const [headers, setHeaders] = useState<Header[]>(
    initialData?.headers 
      ? Object.entries(initialData.headers).map(([key, value]) => ({ key, value })) 
      : []
  );
  const [frequency, setFrequency] = useState<number | undefined>(initialData?.frequency);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [assertions, setAssertions] = useState<string[]>(initialData?.assertions || []);

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const updateHeader = (index: number, field: keyof Header, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
  };

  const addTag = () => {
    setTags([...tags, '']);
  };

  const updateTag = (index: number, value: string) => {
    const newTags = [...tags];
    newTags[index] = value;
    setTags(newTags);
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
  };

  const addAssertion = () => {
    setAssertions([...assertions, '']);
  };

  const updateAssertion = (index: number, value: string) => {
    const newAssertions = [...assertions];
    newAssertions[index] = value;
    setAssertions(newAssertions);
  };

  const removeAssertion = (index: number) => {
    const newAssertions = assertions.filter((_, i) => i !== index);
    setAssertions(newAssertions);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData: any = {
      name,
      url,
      method,
    };

    if (headers.length > 0) {
      formData.headers = Object.fromEntries(headers.filter(h => h.key && h.value).map(h => [h.key, h.value]));
    }
    if (frequency !== undefined) {
      formData.frequency = Number(frequency);
    }
    if (tags.length > 0) {
      formData.tags = tags.filter(t => t);
    }
    if (assertions.length > 0) {
      formData.assertions = assertions.filter(a => a);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id="monitor-form">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input 
          id="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          className="bg-green-800 text-green-100 border-green-600" 
        />
      </div>
      <div>
        <Label htmlFor="url">URL</Label>
        <Input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required className="bg-green-800 text-green-100 border-green-600" />
      </div>
      <div>
        <Label htmlFor="method">Method</Label>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="bg-green-800 text-green-100 border-green-600">
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'].map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Headers (Optional)</Label>
        {headers.map((header, index) => (
          <div key={index} className="flex space-x-2 mt-2">
            <Input placeholder="Key" value={header.key} onChange={(e) => updateHeader(index, 'key', e.target.value)} className="bg-green-800 text-green-100 border-green-600" />
            <Input placeholder="Value" value={header.value} onChange={(e) => updateHeader(index, 'value', e.target.value)} className="bg-green-800 text-green-100 border-green-600" />
            <Button type="button" onClick={() => removeHeader(index)} variant="destructive" size="icon"><X className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button type="button" onClick={addHeader} variant="outline" className="mt-2"><PlusCircle className="mr-2 h-4 w-4" /> Add Header</Button>
      </div>
      <div>
        <Label htmlFor="frequency">Frequency (minutes) (Optional)</Label>
        <Input id="frequency" type="number" min="1" value={frequency || ''} onChange={(e) => setFrequency(e.target.value ? Number(e.target.value) : undefined)} className="bg-green-800 text-green-100 border-green-600" />
      </div>
      <div>
        <Label>Tags (Optional)</Label>
        {tags.map((tag, index) => (
          <div key={index} className="flex space-x-2 mt-2">
            <Input value={tag} onChange={(e) => updateTag(index, e.target.value)} className="bg-green-800 text-green-100 border-green-600" />
            <Button type="button" onClick={() => removeTag(index)} variant="destructive" size="icon"><X className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button type="button" onClick={addTag} variant="outline" className="mt-2"><PlusCircle className="mr-2 h-4 w-4" /> Add Tag</Button>
      </div>
      <div>
        <Label>Assertions (Optional)</Label>
        {assertions.map((assertion, index) => (
          <div key={index} className="flex space-x-2 mt-2">
            <Input value={assertion} onChange={(e) => updateAssertion(index, e.target.value)} className="bg-green-800 text-green-100 border-green-600" />
            <Button type="button" onClick={() => removeAssertion(index)} variant="destructive" size="icon"><X className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button type="button" onClick={addAssertion} variant="outline" className="mt-2"><PlusCircle className="mr-2 h-4 w-4" /> Add Assertion</Button>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {initialData ? "Update Monitor" : "Create Monitor"}
      </Button>
    </form>
  );
};

const WatchlyMonitorModal: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    const token = localStorage.getItem('token');

    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You are not logged in. Please log in and try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "Monitor created successfully!",
        });
        setOpen(false);
        // You might want to trigger a refresh of the monitors list here
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.detail || "Failed to create monitor. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">Create New Monitor</Button>
      </DialogTrigger>
      <DialogContent className="bg-green-900 text-green-100 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-400">Create Monitor</DialogTitle>
          <DialogDescription className="text-green-300">
            Fill out the form below to create a new monitor.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] px-4">
          <WatchlyMonitorForm onSubmit={handleSubmit} />
        </ScrollArea>
        <DialogFooter>
          <Button 
            type="submit" 
            form="monitor-form" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Monitor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WatchlyMonitorModal;
export { WatchlyMonitorForm };
