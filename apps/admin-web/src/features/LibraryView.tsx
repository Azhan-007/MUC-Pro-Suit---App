import React from 'react';
import { useERPStore } from '../store';
import { Library, BookOpen, BookmarkCheck, Search, Plus } from 'lucide-react';

export default function LibraryView() {
  const store = useERPStore();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Administrative</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Library</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight">Library Resource Catalog</h2>
        </div>
        <button 
          onClick={() => alert("Book acquisition or circulation logs are reserved for Library Catalogers.")}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-surface-tint transition-all text-sm shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Library Asset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {store.libraryBooks.map(book => (
          <div key={book.id} className="bg-surface-container-lowest border border-outline-variant hover:border-primary rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all group">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="px-2.5 py-1 bg-secondary/10 text-secondary rounded-lg font-bold text-xs uppercase">{book.category}</span>
                <span className="text-xs font-mono text-outline font-bold">{book.id}</span>
              </div>
              <h4 className="font-bold text-lg text-on-surface mb-1 group-hover:text-primary transition-colors">{book.title}</h4>
              <p className="text-sm text-on-surface-variant mb-2">Author: {book.author}</p>
              <p className="text-xs text-outline font-mono">ISBN: {book.isbn}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant/30 flex justify-between items-center text-xs font-bold text-outline">
              <div className="flex items-center gap-1.5">
                <Library className="w-4 h-4 text-primary" />
                <span>Total Cataloged: {book.totalCopies}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                <BookmarkCheck className="w-4 h-4" />
                <span>Available to Borrow: {book.availableCopies}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
