import React, { useState } from 'react';
import { useERPStore } from '../store';
import { useForm } from 'react-hook-form';
import { 
  GraduationCap, Plus, Mail, BookOpen, Clock, Calendar, 
  Trash2, Edit, Check, Eye, HelpCircle, Users
} from 'lucide-react';
import Modal from '../components/Modal';

interface FacultyFormValues {
  name: string;
  email: string;
  department: string;
  course: string;
  subject: string;
  time: string;
  status: 'Marked' | 'Pending' | 'Scheduled';
}

export default function FacultyView() {
  const store = useERPStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacultyId, setEditingFacultyId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FacultyFormValues>({
    defaultValues: {
      status: 'Scheduled',
    }
  });

  const onSubmitForm = (values: FacultyFormValues) => {
    if (editingFacultyId) {
      store.updateFaculty(editingFacultyId, values);
      setEditingFacultyId(null);
    } else {
      store.addFaculty(values);
    }
    setIsModalOpen(false);
    reset();
  };

  const handleEdit = (fac: typeof store.faculties[0]) => {
    setEditingFacultyId(fac.id);
    setValue('name', fac.name);
    setValue('email', fac.email);
    setValue('department', fac.department);
    setValue('course', fac.course);
    setValue('subject', fac.subject);
    setValue('time', fac.time);
    setValue('status', fac.status);
    setIsModalOpen(true);
  };

  const filteredFaculties = store.faculties.filter(fac => {
    return store.searchQuery === '' || 
      fac.name.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
      fac.subject.toLowerCase().includes(store.searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Home</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Faculty Management</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight">Faculty Hub</h2>
        </div>
        <button 
          onClick={() => { setEditingFacultyId(null); reset(); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-surface-tint transition-all text-sm shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Faculty</span>
        </button>
      </div>

      {/* Grid of Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaculties.map((fac) => (
          <div key={fac.id} className="bg-surface-container-lowest border border-outline-variant hover:border-primary rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 relative group">
            <div>
              {/* Header Profile details */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {fac.avatarUrl ? (
                    <img 
                      className="w-12 h-12 rounded-full object-cover border border-outline-variant shadow-sm" 
                      src={fac.avatarUrl} 
                      alt={fac.name} 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-sm border border-outline-variant shadow-sm">
                      {fac.initials}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-base text-on-surface leading-tight">{fac.name}</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5 font-mono">{fac.id}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  fac.status === 'Marked'
                    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                    : fac.status === 'Pending'
                    ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                    : 'bg-primary/10 text-primary border-primary/20'
                }`}>
                  {fac.status}
                </span>
              </div>

              {/* Metadata */}
              <div className="space-y-3 mt-6 border-t border-outline-variant/30 pt-4 text-sm">
                <div className="flex items-center gap-2.5 text-on-surface-variant">
                  <Mail className="w-4 h-4 text-outline" />
                  <span>{fac.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-on-surface-variant">
                  <BookOpen className="w-4 h-4 text-outline" />
                  <span>{fac.subject}</span>
                </div>
                <div className="flex items-center gap-2.5 text-on-surface-variant">
                  <Clock className="w-4 h-4 text-outline" />
                  <span>{fac.time} ({fac.course})</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-6 pt-4 border-t border-outline-variant/30 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-outline font-bold uppercase">{fac.department}</span>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleEdit(fac)}
                  className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                  title="Edit Profile"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { if(confirm("Are you sure?")) store.deleteFaculty(fac.id); }}
                  className="p-2 hover:bg-error/10 rounded-lg text-error transition-colors"
                  title="Delete Profile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Faculty Modal Dialog */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingFacultyId ? 'Edit Faculty Profile' : 'Add New Faculty Profile'}
      >
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-outline uppercase mb-1.5">Full Name</label>
            <input 
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
              type="text" 
              placeholder="e.g. Dr. Maria Garcia"
              className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            />
            {errors.name && <p className="text-xs text-error mt-1 font-bold">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-outline uppercase mb-1.5">Institutional Email</label>
            <input 
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Must be a valid email' } })}
              type="email" 
              placeholder="e.g. maria.g@muc.edu"
              className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            />
            {errors.email && <p className="text-xs text-error mt-1 font-bold">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1.5">Department</label>
              <select 
                {...register('department', { required: 'Department is required' })}
                className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
              >
                <option value="">Select Dept</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Business Administration">Business Administration</option>
              </select>
              {errors.department && <p className="text-xs text-error mt-1 font-bold">{errors.department.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1.5">Course Assigned</label>
              <input 
                {...register('course', { required: 'Course is required' })}
                placeholder="e.g. B.Tech CS"
                className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
              />
              {errors.course && <p className="text-xs text-error mt-1 font-bold">{errors.course.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1.5">Primary Subject</label>
              <input 
                {...register('subject', { required: 'Subject is required' })}
                placeholder="e.g. Machine Learning"
                className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
              />
              {errors.subject && <p className="text-xs text-error mt-1 font-bold">{errors.subject.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1.5">Lecture Time Slot</label>
              <input 
                {...register('time', { required: 'Time is required' })}
                placeholder="e.g. 11:00 AM"
                className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
              />
              {errors.time && <p className="text-xs text-error mt-1 font-bold">{errors.time.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-outline uppercase mb-1.5">Log Status</label>
            <select 
              {...register('status')}
              className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Pending">Pending</option>
              <option value="Marked">Marked</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/30 mt-6">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-surface hover:bg-surface-container-high border border-outline-variant rounded-xl text-sm font-bold text-on-surface-variant transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-surface-tint transition-all text-sm shadow-md"
            >
              {editingFacultyId ? 'Save Changes' : 'Register Faculty'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
