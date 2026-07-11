import React from 'react';
import { useERPStore } from '../store';
import { CalendarDays, Clock, MapPin, Plus } from 'lucide-react';

export default function TimetableView() {
  const store = useERPStore();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Dashboard</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Timetable</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight">Lecture Schedules</h2>
        </div>
        <button 
          onClick={() => alert("Timetable scheduler wizard is restricted to Admin Academic Planners.")}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-surface-tint transition-all text-sm shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Allocate Lecture Slot</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {store.timetable.map(slot => (
          <div key={slot.id} className="bg-surface-container-lowest border border-outline-variant hover:border-primary rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg font-bold text-xs">{slot.day} Slot</span>
                <span className="text-xs text-outline font-bold font-mono">{slot.id}</span>
              </div>
              <h4 className="font-bold text-lg text-on-surface mb-2">{slot.courseName}</h4>
              <p className="text-sm text-on-surface-variant font-medium">Lecturer: {slot.facultyName}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant/30 flex justify-between items-center text-xs font-bold text-outline uppercase">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>{slot.time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>{slot.room}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
