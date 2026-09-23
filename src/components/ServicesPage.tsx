import React, { useState } from 'react';
import { useStore } from '../store';
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
          <h2 className="text-2xl font-bold">Service Management</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure services and pricing for your barber shop
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-sm rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* Add Service Form */}
      {showAddForm && (
        <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className="text-lg font-semibold mb-4">New Service</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Service Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                placeholder="e.g., Haircut"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ServiceType })}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
              >
                <option value="haircut">Haircut</option>
                <option value="beard_trim">Beard Trim</option>
                <option value="hair_wash">Hair Wash</option>
                <option value="shaving">Shaving</option>
                <option value="hair_coloring">Hair Coloring</option>
                <option value="facial">Facial</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Price (ETB)</label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                placeholder="300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Duration (min)</label>
              <input
                type="number"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                placeholder="30"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600">
              Save Service
            </button>
            <button onClick={() => setShowAddForm(false)} className={`px-4 py-2 rounded-lg text-sm ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Services Table */}
      <div className={`rounded-xl border overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Service</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Duration</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {services.map((service) => (
                <tr key={service.id} className={`${darkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'} transition-colors`}>
                  {editingId === service.id ? (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`px-2 py-1 rounded border text-sm w-full ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as ServiceType })}
                          className={`px-2 py-1 rounded border text-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                        >
                          <option value="haircut">haircut</option>
                          <option value="beard_trim">beard_trim</option>
                          <option value="hair_wash">hair_wash</option>
                          <option value="shaving">shaving</option>
                          <option value="hair_coloring">hair_coloring</option>
                          <option value="facial">facial</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={formData.price || ''}
                          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                          className={`px-2 py-1 rounded border text-sm w-24 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={formData.duration || ''}
                          onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                          className={`px-2 py-1 rounded border text-sm w-20 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${service.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {service.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleUpdate(service.id)} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-500/20 text-gray-400 rounded hover:bg-gray-500/30">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <Scissors className="w-4 h-4 text-emerald-500" />
                          </div>
                          <span className="font-medium text-sm">{service.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                          {service.type}
                        </code>
                      </td>
                      <td className="px-6 py-4 font-semibold text-sm">{service.price} ETB</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{service.duration} min</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${service.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {service.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => startEdit(service)} className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteService(service.id)} className="p-1.5 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
