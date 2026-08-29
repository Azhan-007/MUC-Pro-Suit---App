"use client";

import React, { useState } from 'react';
import { useERPStore } from '../store';
import { useForm } from 'react-hook-form';
import { Building2, Users, GraduationCap, MapPin, Plus, Trash2, Edit, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';

interface DeptFormValues {
  name: string;
  code: string;
  head: string;
  block: string;
}

export default function DepartmentsView() {
  const store = useERPStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<DeptFormValues>();

  const isRestricted = store.activeRole === 'ADMIN';

  const handleOpenCreate = () => {
    if (isRestricted) {
      alert("Operational Officers (ADMIN) do not have department configuration privileges. Provisioning is reserved for Master Admins and Super Admins.");
      return;
    }
    setEditingDeptId(null);
    reset({ name: '', code: '', head: '', block: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: typeof store.departments[0]) => {
    if (isRestricted) {
      alert("Operational Officers (ADMIN) do not have department configuration privileges. Modifications are reserved for Master Admins and Super Admins.");
      return;
    }
    setEditingDeptId(dept.id);
    setValue('name', dept.name);
    setValue('code', dept.code);
    setValue('head', dept.head);
    setValue('block', dept.block);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (isRestricted) {
      alert("Operational Officers (ADMIN) do not have department configuration privileges. Deletions are reserved for Master Admins and Super Admins.");
      return;
    }
    if (confirm("Are you sure you want to decommission this department? All associated courses and allocations will need manual reconfiguration.")) {
      store.deleteDepartment(id);
    }
  };

  const onSubmit = (values: DeptFormValues) => {
    if (editingDeptId) {
      store.updateDepartment(editingDeptId, values);
    } else {
      store.addDepartment(values);
    }
    setIsModalOpen(false);
    reset();
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumbs & Header */}
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Home</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Departments</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight font-display">Institutional Departments</h2>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all text-sm shadow-md active:scale-95 duration-150"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Department</span>
        </button>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {store.departments.map(dept => (
          <div 
            key={dept.id} 
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-primary/80 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden"
          >
            {/* Top slide-in gradient border accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            {/* Bottom-right radial glowing spot */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl text-primary flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-105">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{dept.code}</span>
                  {!isRestricted && (
                    <div className="flex opacity-0 group-hover:opacity-100 transition-all duration-300 gap-1.5">
                      <button 
                        onClick={() => handleOpenEdit(dept)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                        title="Edit Department"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(dept.id)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Department"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h4 className="font-bold text-lg text-slate-900 mb-2 leading-tight group-hover:text-primary transition-colors duration-300">{dept.name}</h4>
              <p className="text-sm text-slate-600 mb-6 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{dept.block}</span>
              </p>

              <div className="space-y-3 pt-4 border-t border-slate-100 text-sm text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Head of Department:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    {dept.head}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Active Students:</span>
                  <span className="font-bold text-slate-800">{dept.countStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span>Enrolled Faculty:</span>
                  <span className="font-bold text-slate-800">{dept.countFaculty}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Provision / Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingDeptId ? "Update Department Configurations" : "Provision New Department"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Department Name</label>
            <input 
              {...register('name', { required: 'Department name is required', minLength: { value: 3, message: 'Name must be at least 3 characters' } })}
              type="text" 
              placeholder="e.g. Computer Science"
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
            />
            {errors.name && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Dept Code</label>
              <input 
                {...register('code', { required: 'Code is required', pattern: { value: /^[A-Z0-9-]{2,8}$/i, message: '2-8 alphanumeric characters' } })}
                type="text" 
                placeholder="e.g. CSE"
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-mono"
              />
              {errors.code && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.code.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Block / Location</label>
              <input 
                {...register('block', { required: 'Location is required' })}
                type="text" 
                placeholder="e.g. Block A"
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
              />
              {errors.block && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.block.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Head of Department (HOD)</label>
            <input 
              {...register('head', { required: 'HOD name is required' })}
              type="text" 
              placeholder="e.g. Dr. Sarah Jenkins"
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
            />
            {errors.head && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.head.message}</p>}
          </div>

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
              {editingDeptId ? "Update configurations" : "Provision Department"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
