"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  GraduationCap,
  MapPin,
  Award,
} from "lucide-react";

import type { AcademicContextData } from "@/types/commandCenter";

interface DashboardGreetingProps {
  academicContext?: AcademicContextData;
}

export function DashboardGreeting({ academicContext }: DashboardGreetingProps = {}) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Safe fallback before hydration or if academicContext is not provided
  const dateObj = currentDate || new Date();

  const dayName = academicContext?.dayName || dateObj.toLocaleDateString("en-IN", { weekday: "long" });
  const formattedDate = academicContext?.currentDateFormatted || dateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const hour = dateObj.getHours();
  const minute = dateObj.getMinutes();
  const timeVal = hour * 60 + minute;

  // Domain rule: Shift I is 8:00 AM (480m) to 12:55 PM (775m), Shift II is 1:00 PM (780m) to 5:55 PM (1075m)
  let fallbackShiftStatus = "Shifts I & II Active";
  if (timeVal >= 480 && timeVal <= 775) {
    fallbackShiftStatus = "Shift I Active (8:00 AM – 12:55 PM)";
  } else if (timeVal >= 780 && timeVal <= 1075) {
    fallbackShiftStatus = "Shift II Active (1:00 PM – 5:55 PM)";
  } else if (timeVal < 480) {
    fallbackShiftStatus = "Upcoming: Shift I (Starts 8:00 AM)";
  } else {
    fallbackShiftStatus = "Shift Operations Concluded";
  }

  const shiftStatus = academicContext?.activeShiftStatus || fallbackShiftStatus;
  const shiftParenIndex = shiftStatus.indexOf("(");
  const shiftTitle = shiftParenIndex !== -1 ? shiftStatus.slice(0, shiftParenIndex).trim() : shiftStatus;
  const shiftTimeRange = shiftParenIndex !== -1 ? shiftStatus.slice(shiftParenIndex).replace(/[()]/g, "").trim() : null;
  const academicYearText = academicContext ? `AY ${academicContext.academicYear}` : "AY 2026–27";
  const semesterText = academicContext ? `${academicContext.semesterTerm} (Sem ${academicContext.semesterNumber})` : "Odd Semester";

  return (
    <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-r from-[#0da87a] via-[#0ea97b] to-[#059669] border border-emerald-400/30 shadow-xs text-white flex flex-col md:flex-row items-stretch">
      {/* Decorative ambient atmospheric glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-1/3 -bottom-16 w-64 h-64 bg-emerald-200/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── LEFT SIDE: Wide college campus photo blending naturally onto green ── */}
      <div className="relative w-full md:w-[38%] lg:w-[36%] min-h-[220px] md:min-h-[250px] overflow-hidden shrink-0 rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl">
        <img
          src="/college.png"
          alt="Mazharul Uloom College Campus"
          className="w-full h-full object-cover object-left md:object-center [mask-image:linear-gradient(to_right,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_50%,rgba(0,0,0,0)_98%)] [-webkit-mask-image:linear-gradient(to_right,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_50%,rgba(0,0,0,0)_98%)] max-md:[mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_55%,rgba(0,0,0,0)_98%)] max-md:[-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_55%,rgba(0,0,0,0)_98%)]"
        />
      </div>

      {/* ── RIGHT SIDE: College Info, Date, Day & Important Things ── */}
      <div className="flex-1 py-4 sm:py-5 pr-5 pl-4 sm:pr-6 md:py-5 md:pr-6 md:pl-2 flex flex-col justify-between gap-3 relative z-10 min-w-0">
        {/* Top: Identity & Badges */}
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-[10.5px] font-bold text-white tracking-wider uppercase">
              <Award className="w-3.5 h-3.5 text-emerald-100" />
              NAAC Re-accredited (B+)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/25 border border-emerald-200/25 text-[10.5px] font-semibold text-white">
              Estd. 1969
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-[10.5px] font-semibold text-emerald-50">
              AMES Managed
            </span>
          </div>

          <div className="mt-3 sm:mt-4">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-[1.45rem] font-black tracking-tight text-white truncate leading-tight font-sans">
              MAZHARUL ULOOM COLLEGE (AUTONOMOUS)
            </h1>
            <p className="text-xs sm:text-[13px] font-medium text-emerald-50/90 leading-relaxed mt-1 flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
              <span>Ambur, Tirupattur Dist.</span>
              <span>&bull;</span>
              <span>Affiliated to Thiruvalluvar University</span>
            </p>
          </div>
        </div>

        {/* Bottom: 3 Cards strictly locked inside card, balanced spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2.5 border-t border-white/20">
          {/* Tile 1: Today Day & Date */}
          <div className="bg-white/15 rounded-xl p-2.5 sm:p-3 border border-white/20 flex items-center gap-2.5 min-w-0 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/25 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider leading-none mb-1 truncate">
                {dayName}
              </p>
              <p className="text-xs sm:text-[13px] font-bold text-white whitespace-nowrap truncate leading-tight">
                {formattedDate}
              </p>
            </div>
          </div>

          {/* Tile 2: Academic Session */}
          <div className="bg-white/15 rounded-xl p-2.5 sm:p-3 border border-white/20 flex items-center gap-2.5 min-w-0 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/25 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider leading-none mb-1 truncate">
                {academicYearText}
              </p>
              <p className="text-xs sm:text-[13px] font-bold text-white whitespace-nowrap truncate leading-tight">
                {semesterText}
              </p>
            </div>
          </div>

          {/* Tile 3: Shift Status */}
          <div className="bg-white/15 rounded-xl p-2.5 sm:p-3 border border-white/20 flex items-center gap-2.5 min-w-0 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/25 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 leading-none mb-1">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
                <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider truncate">
                  {shiftTimeRange || "Academic Shifts"}
                </p>
              </div>
              <p className="text-xs sm:text-[13px] font-bold text-white whitespace-nowrap truncate leading-tight">
                {shiftTitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
