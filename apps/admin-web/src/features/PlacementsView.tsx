"use client";

import React, { useState } from 'react';
import { useERPStore } from '../store';
import { useForm } from 'react-hook-form';
import { Briefcase, Building2, TrendingUp, Sparkles, Star, Plus, Trash2, Edit, Check } from 'lucide-react';
import Modal from '../components/Modal';
import { CustomSelect } from '../components/ui/CustomSelect';

interface PlacementFormValues {
  studentName: string;
  company: string;
  position: string;
  salaryPackage: string;
  status: 'Placed' | 'Selected' | 'Interview Round';
}

export default function PlacementsView() {
  const store = useERPStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlacementId, setEditingPlacementId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PlacementFormValues>();

  const isRestricted = store.activeRole === 'ADMIN';

  const handleOpenCreate = () => {
    setEditingPlacementId(null);
    reset({ studentName: '', company: '', position: '', salaryPackage: '', status: 'Selected' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plc: typeof store.placements[0]) => {
    setEditingPlacementId(plc.id);
    setValue('studentName', plc.studentName);
    setValue('company', plc.company);
    setValue('position', plc.position);
    setValue('salaryPackage', plc.salaryPackage);
    setValue('status', plc.status);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (isRestricted) {
      alert("Operational Officers (ADMIN) do not have placement record deletion privileges. Deletions are reserved for Master Admins and Super Admins.");
      return;
    }
    if (confirm("Are you sure you want to delete this placement record?")) {
      store.deletePlacement(id);
    }
  };

  const onSubmit = (values: PlacementFormValues) => {
    if (editingPlacementId) {
      store.updatePlacementStatus(editingPlacementId, values.status);
    } else {
      store.addPlacement(values);
    }
    setIsModalOpen(false);
    reset();
  };

  const activePlacedCount = store.placements.filter(p => p.status === 'Placed').length;
  const totalCount = store.placements.length;
  const placementRate = totalCount > 0 ? ((activePlacedCount / totalCount) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-8">
      {/* Breadcrumbs & Header */}
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Administrative</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Placements</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight font-display">Placement Statistics</h2>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all text-sm shadow-md active:scale-95 duration-150"
        >
          <Plus className="w-4 h-4" />
          <span>Record Placement Offer</span>
        </button>
      </div>

      {/* Stats and Placement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 border border-outline-variant rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Placement Rate</p>
            <h3 className="text-3xl font-extrabold text-slate-950 mt-1">{placementRate}%</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 flex items-center justify-center rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 border border-outline-variant rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Highest Package</p>
            <h3 className="text-3xl font-extrabold text-slate-950 mt-1">$120,000</h3>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 text-amber-600 flex items-center justify-center rounded-xl">
            <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 border border-outline-variant rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Partner Companies</p>
            <h3 className="text-3xl font-extrabold text-slate-950 mt-1">84+ Recruiters</h3>
          </div>
          <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Placements Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-outline-variant/60">
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Student Name</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Hiring Partner</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Position Offer</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Package Offered</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {store.placements.map(plc => (
              <tr key={plc.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="py-4 px-6 font-bold text-slate-900">{plc.studentName}</td>
                <td className="py-4 px-6 font-medium text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{plc.company}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-slate-600">{plc.position}</td>
                <td className="py-4 px-6 font-bold text-slate-900">{plc.salaryPackage}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                    plc.status === 'Placed'
                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                      : plc.status === 'Selected'
                      ? 'bg-sky-500/10 text-sky-700 border-sky-500/20'
                      : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                  }`}>
                    {plc.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {plc.status !== 'Placed' && (
                      <button 
                        onClick={() => store.updatePlacementStatus(plc.id, 'Placed')}
                        className="p-1 hover:bg-emerald-50 text-emerald-600 rounded transition-colors"
                        title="Mark as Placed"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleOpenEdit(plc)}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                      title="Update Record"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(plc.id)}
                      className="p-1.5 hover:bg-rose-50 text-rose-600 rounded transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {store.placements.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                  No placement records have been cataloged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record Placement Modal Dialog */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingPlacementId ? "Update Placement Status" : "Record Student Placement Offer"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!editingPlacementId ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Student Full Name</label>
                <input 
                  {...register('studentName', { required: 'Student Name is required' })}
                  type="text" 
                  placeholder="e.g. Ahmed Khan"
                  className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
                />
                {errors.studentName && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.studentName.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Hiring Partner (Company)</label>
                  <input 
                    {...register('company', { required: 'Company is required' })}
                    type="text" 
                    placeholder="e.g. Google"
                    className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
                  />
                  {errors.company && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.company.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Position Offered</label>
                  <input 
                    {...register('position', { required: 'Position is required' })}
                    type="text" 
                    placeholder="e.g. Software Engineer"
                    className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
                  />
                  {errors.position && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.position.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Salary Package (LPA / Annual)</label>
                  <input 
                    {...register('salaryPackage', { required: 'Package is required' })}
                    type="text" 
                    placeholder="e.g. $120,000"
                    className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
                  />
                  {errors.salaryPackage && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.salaryPackage.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Initial Status</label>
                  <CustomSelect 
                    {...register('status', { required: 'Status is required' })}
                    options={["Interview Round", "Selected", "Placed"]}
                    className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Update Status Offer</label>
              <CustomSelect 
                {...register('status', { required: 'Status is required' })}
                options={["Interview Round", "Selected", "Placed"]}
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
              />
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 mt-6">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-700 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-sm shadow-md"
            >
              {editingPlacementId ? "Update Status" : "Record Offer"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
