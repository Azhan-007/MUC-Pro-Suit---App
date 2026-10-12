"use client";

import React from "react";
import { Calendar } from "lucide-react";

export function AcademicYearSelector() {
  return (
    <button className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 text-sm transition-colors hover:bg-muted/50">
      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="font-medium text-foreground">AY 2025–26</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">Odd Sem</span>
    </button>
  );
}
