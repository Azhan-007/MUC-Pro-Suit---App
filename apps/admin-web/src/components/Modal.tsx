"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg p-6 bg-white border border-slate-200 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-base font-extrabold text-slate-900 font-sans tracking-tight">{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
