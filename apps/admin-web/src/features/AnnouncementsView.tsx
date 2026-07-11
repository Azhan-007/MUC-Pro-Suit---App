import React, { useState } from 'react';
import { useERPStore } from '../store';
import { Megaphone, Plus, Bell, Clock, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Modal from '../components/Modal';

export default function AnnouncementsView() {
  const store = useERPStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ title: string; content: string; category: 'primary' | 'secondary' }>();

  const onSubmitForm = (values: { title: string; content: string; category: 'primary' | 'secondary' }) => {
    store.addAnnouncement({
      title: values.title,
      content: values.content,
      category: values.category
    });
    setIsModalOpen(false);
    reset();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Administrative</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Announcements</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight">System Announcements</h2>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-surface-tint transition-all text-sm shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Announcement</span>
        </button>
      </div>

      <div className="space-y-6 max-w-4xl">
        {store.announcements.map(ann => (
          <div key={ann.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start gap-4 mb-3">
              <div className="flex items-center gap-2">
                <Megaphone className={`w-5 h-5 ${ann.category === 'primary' ? 'text-primary' : 'text-secondary'}`} />
                <h4 className="font-bold text-lg text-on-surface">{ann.title}</h4>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border capitalize ${
                ann.category === 'primary' 
                  ? 'bg-primary/10 text-primary border-primary/20' 
                  : 'bg-secondary/15 text-secondary border-secondary/20'
              }`}>
                {ann.category} Alert
              </span>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{ann.content}</p>

            <div className="flex items-center gap-1.5 text-[10px] font-bold text-outline uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-outline" />
              <span>{ann.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Publish Public Announcement">
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-outline uppercase mb-1.5">Announcement Title</label>
            <input 
              {...register('title', { required: true })}
              type="text" 
              placeholder="e.g. End Semester Exam Routine"
              className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-outline uppercase mb-1.5">Detail Content</label>
            <textarea 
              {...register('content', { required: true })}
              placeholder="e.g. End Semester examinations begin Nov 20. Confirm details in curriculum."
              rows={4}
              className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-outline uppercase mb-1.5">Alert Level Category</label>
            <select 
              {...register('category')}
              className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="primary">Primary (Standard Information)</option>
              <option value="secondary">Secondary (Urgent Notice)</option>
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
              Publish Announcement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
