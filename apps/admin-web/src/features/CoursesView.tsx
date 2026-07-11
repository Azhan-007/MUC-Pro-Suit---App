import React from 'react';
import { useERPStore } from '../store';
import { BookOpen, Star, Plus } from 'lucide-react';

export default function CoursesView() {
  const store = useERPStore();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Home</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Courses</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight">Academic Curriculum</h2>
        </div>
        <button 
          onClick={() => alert("Curriculum design and course updates are synchronized via active Registrar panels.")}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-surface-tint transition-all text-sm shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface border-b border-outline-variant/60">
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Course Code</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Course Name</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Department</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Active Semester</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Credits</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline text-right">Students Enrolled</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 text-sm">
            {store.courses.map(course => (
              <tr key={course.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-4 px-6 font-mono font-bold text-on-surface-variant">{course.code}</td>
                <td className="py-4 px-6 font-bold text-on-surface">{course.name}</td>
                <td className="py-4 px-6 text-on-surface-variant">{course.department}</td>
                <td className="py-4 px-6 text-on-surface-variant">{course.semester}</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-700 font-bold text-xs rounded-lg border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{course.credits} Credits</span>
                  </span>
                </td>
                <td className="py-4 px-6 text-right font-bold text-on-surface">{course.activeStudents} Students</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
