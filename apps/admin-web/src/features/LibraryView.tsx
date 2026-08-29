"use client";

import React, { useState } from 'react';
import { useERPStore } from '../store';
import { useForm } from 'react-hook-form';
import { Library, BookOpen, BookmarkCheck, Search, Plus, Trash2, Edit, ChevronDown } from 'lucide-react';
import Modal from '../components/Modal';
import { CustomSelect } from '../components/ui/CustomSelect';

interface BookFormValues {
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
}

export default function LibraryView() {
  const store = useERPStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All Categories');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BookFormValues>();

  const isDeleteRestricted = store.activeRole === 'ADMIN';

  const handleOpenCreate = () => {
    setEditingBookId(null);
    reset({ title: '', author: '', isbn: '', category: 'Computer Science', totalCopies: 10, availableCopies: 10 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (book: typeof store.libraryBooks[0]) => {
    setEditingBookId(book.id);
    setValue('title', book.title);
    setValue('author', book.author);
    setValue('isbn', book.isbn);
    setValue('category', book.category);
    setValue('totalCopies', book.totalCopies);
    setValue('availableCopies', book.availableCopies);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (isDeleteRestricted) {
      alert("Operational Officers (ADMIN) do not have asset deletion privileges. Deletions are reserved for Master Admins and Super Admins.");
      return;
    }
    if (confirm("Are you sure you want to remove this book from the library catalog?")) {
      store.deleteLibraryBook(id);
    }
  };

  const onSubmit = (values: BookFormValues) => {
    if (editingBookId) {
      store.updateLibraryBook(editingBookId, {
        ...values,
        totalCopies: Number(values.totalCopies),
        availableCopies: Number(values.availableCopies)
      });
    } else {
      store.addLibraryBook({
        ...values,
        totalCopies: Number(values.totalCopies),
        availableCopies: Number(values.availableCopies)
      });
    }
    setIsModalOpen(false);
    reset();
  };

  const categories = Array.from(new Set(store.libraryBooks.map(b => b.category)));

  const filteredBooks = store.libraryBooks.filter(book => {
    const matchesCategory = selectedCategoryFilter === 'All Categories' || book.category === selectedCategoryFilter;
    const matchesSearch = store.searchQuery === '' ||
      book.title.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
      book.isbn.toLowerCase().includes(store.searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Administrative</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Library</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight font-display">Library Resource Catalog</h2>
        </div>
        <div className="flex items-center gap-3">
          <CustomSelect
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            options={["All Categories", ...categories]}
            className="appearance-none pr-9 pl-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-colors focus:outline-none cursor-pointer shadow-3xs"
          />
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all text-sm shadow-md active:scale-95 duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>Add Library Asset</span>
          </button>
        </div>
      </div>

      {/* Grid of Books */}
      <div key={`${selectedCategoryFilter}-${store.searchQuery}`} className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in-0 duration-350 ease-out">
        {filteredBooks.map(book => (
          <div key={book.id} className="bg-surface-container-lowest border border-outline-variant hover:border-primary rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all group relative">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="px-2.5 py-1 bg-secondary/10 text-secondary rounded-lg font-bold text-xs uppercase">{book.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-outline font-bold bg-slate-50 border rounded px-2 py-0.5">{book.id}</span>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <button 
                      onClick={() => handleOpenEdit(book)}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                      title="Edit Catalog Details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(book.id)}
                      className="p-1.5 hover:bg-rose-50 text-rose-600 rounded transition-colors"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <h4 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-primary transition-colors leading-tight">{book.title}</h4>
              <p className="text-sm text-slate-600 mb-2">Author: <span className="font-medium text-slate-800">{book.author}</span></p>
              <p className="text-xs text-slate-400 font-mono">ISBN: {book.isbn}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500">
              <div className="flex items-center gap-1.5">
                <Library className="w-4 h-4 text-primary" />
                <span>Total Cataloged: {book.totalCopies}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                <BookmarkCheck className="w-4 h-4" />
                <span>Available to Borrow: {book.availableCopies}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredBooks.length === 0 && (
          <div className="col-span-2 text-center py-12 text-slate-400 font-medium bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm">
            No library resources match search or category criteria.
          </div>
        )}
      </div>

      {/* Book Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingBookId ? "Edit Library Asset Details" : "Catalog New Library Book"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Book Title</label>
            <input 
              {...register('title', { required: 'Book title is required', minLength: { value: 3, message: 'Must be at least 3 characters' } })}
              type="text" 
              placeholder="e.g. Introduction to Algorithms"
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
            />
            {errors.title && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Author(s)</label>
            <input 
              {...register('author', { required: 'Author name is required' })}
              type="text" 
              placeholder="e.g. Cormen, Leiserson, Rivest"
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
            />
            {errors.author && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.author.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">ISBN Number</label>
              <input 
                {...register('isbn', { required: 'ISBN is required', pattern: { value: /^[0-9-]{10,17}$/, message: 'Valid ISBN digits & hyphens' } })}
                type="text" 
                placeholder="e.g. 978-0262033848"
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-mono"
              />
              {errors.isbn && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.isbn.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Category</label>
              <CustomSelect 
                {...register('category', { required: 'Category is required' })}
                options={["Computer Science", "AI & ML", "Business Administration", "Mathematics", "General Literature"]}
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
              />
              {errors.category && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.category.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Total Copies Cataloged</label>
              <input 
                {...register('totalCopies', { required: 'Total copies required', min: { value: 0, message: 'Cannot be negative' } })}
                type="number" 
                placeholder="e.g. 15"
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
              />
              {errors.totalCopies && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.totalCopies.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Available to Borrow</label>
              <input 
                {...register('availableCopies', { required: 'Available copies required', min: { value: 0, message: 'Cannot be negative' } })}
                type="number" 
                placeholder="e.g. 8"
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
              />
              {errors.availableCopies && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.availableCopies.message}</p>}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 mt-6">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-700 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-sm shadow-md"
            >
              {editingBookId ? "Save Configurations" : "Catalog Asset"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
