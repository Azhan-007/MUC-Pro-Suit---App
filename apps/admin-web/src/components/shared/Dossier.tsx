"use client";

import React, { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DossierProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: string;
  children: React.ReactNode;
}

export function Dossier({
  isOpen,
  onClose,
  title,
  subtitle,
  width = "max-w-md",
  children,
}: DossierProps) {
  // Prevent body scroll when open and handle Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 flex pl-10 max-w-full">
        <div
          className={cn(
            "w-screen bg-card text-card-foreground shadow-2xl flex flex-col border-l border-border transition-transform duration-300 ease-in-out",
            width
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/70 bg-muted/20">
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              type="button"
              aria-label="Close dossier"
              className="p-1.5 rounded-lg hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground cursor-pointer focus-ring"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DossierSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="last:mb-0">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        {title}
      </h3>
      <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4">{children}</div>
    </div>
  );
}

export function DossierItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <p className="text-[11px] font-medium text-muted-foreground mb-0.5">{label}</p>
      <div className="text-sm font-semibold text-foreground leading-snug">
        {value || "—"}
      </div>
    </div>
  );
}
