"use client";

import React from 'react';
import { useERPStore } from '../store';
import { Building2, Users, GraduationCap, MapPin, Plus } from 'lucide-react';

export default function DepartmentsView() {
  const store = useERPStore();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Home</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Departments</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight">Institutional Departments</h2>
        </div>
        <button 
          onClick={() => alert("Quick Department Provisioning is managed in Master Admin Suite.")}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-surface-tint transition-all text-sm shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Department</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {store.departments.map(dept => (
          <div key={dept.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-primary transition-all duration-300">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl text-primary flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-outline uppercase font-mono">{dept.code}</span>
              </div>

              <h4 className="font-bold text-lg text-on-surface mb-2">{dept.name}</h4>
              <p className="text-sm text-on-surface-variant mb-6 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-outline" />
                <span>{dept.block}</span>
              </p>

              <div className="space-y-3 pt-4 border-t border-outline-variant/30 text-sm text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Head of Department:</span>
                  <span className="font-bold text-on-surface">{dept.head}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Students:</span>
                  <span className="font-bold text-on-surface">{dept.countStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span>Enrolled Faculty:</span>
                  <span className="font-bold text-on-surface">{dept.countFaculty}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

