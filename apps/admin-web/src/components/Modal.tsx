"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isDirty?: boolean;
  onDiscard?: () => void;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  isDirty = false,
  onDiscard,
  className,
}: ModalProps) {
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);

  // Reset internal prompt state when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowUnsavedPrompt(false);
    }
  }, [isOpen]);

  const handleAttemptClose = () => {
    if (isDirty) {
      setShowUnsavedPrompt(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowUnsavedPrompt(false);
    if (onDiscard) {
      onDiscard();
    }
    onClose();
  };

  const handleKeepEditing = () => {
    setShowUnsavedPrompt(false);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleAttemptClose();
          }
        }}
      >
        <DialogContent className={`sm:max-w-lg p-6 bg-white border border-slate-200/90 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl ${className || ''}`}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-base font-extrabold text-slate-900 font-sans tracking-tight">
              {title}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2">
            {children}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Unsaved Changes Protection Confirmation Dialog ──────────────── */}
      {showUnsavedPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-in fade-in-0 duration-150">
          <div
            className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 font-sans animate-in zoom-in-95 duration-150"
            role="alertdialog"
            aria-labelledby="unsaved-title"
            aria-describedby="unsaved-desc"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 id="unsaved-title" className="font-extrabold text-base text-slate-900 leading-tight">
                  Unsaved Changes
                </h4>
                <p id="unsaved-desc" className="text-xs text-slate-500 mt-0.5">
                  You have unsaved changes that will be lost if you leave this form.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleKeepEditing}
                className="px-4 h-9 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer active:scale-95"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="px-4 h-9 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
