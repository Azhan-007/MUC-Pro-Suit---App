import React from 'react';
import { useERPStore } from '../store';
import { FileText, Calendar, Clock, MapPin, Sparkles } from 'lucide-react';

export default function ExamsView() {
  const store = useERPStore();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Academic</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Examinations</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight">Examination Schedule</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {store.examSchedules.map(exam => (
          <div key={exam.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-primary transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileText className="w-24 h-24 text-primary" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 rounded-lg text-xs font-bold border border-amber-500/20 uppercase tracking-wider font-sans">Official Session</span>
                <span className="text-xs font-mono font-bold text-outline">{exam.id}</span>
              </div>
              <h4 className="font-bold text-lg text-on-surface leading-tight mb-1">{exam.subject}</h4>
              <p className="text-sm text-on-surface-variant font-medium mb-6">Course: {exam.course}</p>

              <div className="space-y-3 pt-4 border-t border-outline-variant/30 text-sm">
                <div className="flex items-center gap-2.5 text-on-surface-variant">
                  <Calendar className="w-4 h-4 text-outline" />
                  <span className="font-bold text-on-surface">{exam.date}</span>
                </div>
                <div className="flex items-center gap-2.5 text-on-surface-variant">
                  <Clock className="w-4 h-4 text-outline" />
                  <span>{exam.time} • Duration: {exam.duration}</span>
                </div>
                <div className="flex items-center gap-2.5 text-on-surface-variant">
                  <MapPin className="w-4 h-4 text-outline" />
                  <span>Room: {exam.room}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
