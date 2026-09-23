import React, { useState } from 'react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Edit2, Trash2, X, Check, Scissors } from 'lucide-react';
import type { ServiceType } from '../types';

export default function ServicesPage() {
  const { services, addService, updateService, deleteService, darkMode } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'haircut' as ServiceType, price: 0, duration: 30 });

  const handleAdd = () => {
    if (!formData.name || formData.price <= 0) return;
    addService({
      name: formData.name,
      type: formData.type,
      price: formData.price,
      duration: formData.duration,
      enabled: true,
    });
    setFormData({ name: '', type: 'haircut', price: 0, duration: 30 });
    setShowAddForm(false);
  };

  const handleUpdate = (id: string) => {
    updateService(id, formData);
    setEditingId(null);
    setFormData({ name: '', type: 'haircut', price: 0, duration: 30 });
  };

  const startEdit = (service: typeof services[0]) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      type: service.type,
      price: service.price,
      duration: service.duration,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Service Management</h2>
          <p className="text-muted-foreground">Configure services and pricing for your barber shop</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      {/* Add Service Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Haircut"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as ServiceType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="haircut">Haircut</SelectItem>
                    <SelectItem value="beard_trim">Beard Trim</SelectItem>
                    <SelectItem value="hair_wash">Hair Wash</SelectItem>
                    <SelectItem value="shaving">Shaving</SelectItem>
                    <SelectItem value="hair_coloring">Hair Coloring</SelectItem>
                    <SelectItem value="facial">Facial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (ETB)</label>
                <Input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (min)</label>
                <Input
                  type="number"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  placeholder="30"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={handleAdd}>Save Service</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  {editingId === service.id ? (
                    <>
                      <TableCell>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as ServiceType })}>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="haircut">haircut</SelectItem>
                            <SelectItem value="beard_trim">beard_trim</SelectItem>
                            <SelectItem value="hair_wash">hair_wash</SelectItem>
                            <SelectItem value="shaving">shaving</SelectItem>
                            <SelectItem value="hair_coloring">hair_coloring</SelectItem>
                            <SelectItem value="facial">facial</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={formData.price || ''}
                          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                          className="h-8 w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={formData.duration || ''}
                          onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                          className="h-8 w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={service.enabled ? "default" : "secondary"}>
                          {service.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleUpdate(service.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                            <Scissors className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{service.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs px-2 py-1 rounded bg-muted">{service.type}</code>
                      </TableCell>
                      <TableCell className="font-semibold">{service.price} ETB</TableCell>
                      <TableCell className="text-muted-foreground">{service.duration} min</TableCell>
                      <TableCell>
                        <Badge variant={service.enabled ? "default" : "secondary"}>
                          {service.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => startEdit(service)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteService(service.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
