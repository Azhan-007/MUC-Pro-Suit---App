"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useERPStore } from '../store';
import { useForm, Controller } from 'react-hook-form';
import { 
  Library, BookOpen, BookmarkCheck, Search, Plus, Trash2, Edit, 
  Eye, AlertTriangle, CheckCircle2, X, RefreshCw, Layers, UserCheck, 
  ArrowLeftRight, RotateCcw, Calendar, Check, AlertCircle, Building, BookMarked
} from 'lucide-react';
import Modal from '../components/Modal';
import { CustomSelect } from '../components/ui/CustomSelect';
import type { LibraryBook, LibraryTransaction } from '../types';

interface BookFormValues {
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  publisher?: string;
  location?: string;
  status: 'Available' | 'Issued' | 'Reserved' | 'Lost' | 'Damaged';
}

interface IssueFormValues {
  bookId: string;
  studentId: string;
  issueDate: string;
  dueDate: string;
}

export default function LibraryView() {
  const store = useERPStore();

  // ── Tab State: Catalog vs Issued Transactions ──────────────────────────
  const [activeTab, setActiveTab] = useState<'catalog' | 'transactions'>('catalog');

  // ── Catalog Filters & Modals ───────────────────────────────────────────
  const [bookSearch, setBookSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All Categories');
  const [selectedAvailabilityFilter, setSelectedAvailabilityFilter] = useState('All Availability');

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  const [isBookDeleteModalOpen, setIsBookDeleteModalOpen] = useState(false);
  const [deletingBook, setDeletingBook] = useState<LibraryBook | null>(null);

  const [isBookDetailsModalOpen, setIsBookDetailsModalOpen] = useState(false);
  const [viewingBook, setViewingBook] = useState<LibraryBook | null>(null);

  // ── Issue Book Modal State ─────────────────────────────────────────────
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  // ── Return Confirmation Modal State ────────────────────────────────────
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returningTx, setReturningTx] = useState<LibraryTransaction | null>(null);

  // ── Form Hooks ─────────────────────────────────────────────────────────
  const { 
    control: bookControl, register: bookRegister, handleSubmit: bookHandleSubmit, 
    reset: bookReset, setValue: bookSetValue, watch: bookWatch, formState: { errors: bookErrors } 
  } = useForm<BookFormValues>({
    defaultValues: {
      category: 'Computer Science',
      totalCopies: 10,
      availableCopies: 10,
      status: 'Available',
    }
  });

  const { 
    control: issueControl, register: issueRegister, handleSubmit: issueHandleSubmit, 
    reset: issueReset, setValue: issueSetValue, watch: issueWatch, formState: { errors: issueErrors } 
  } = useForm<IssueFormValues>({
    defaultValues: {
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
  });

  const watchTotalCopies = bookWatch('totalCopies');
  const watchAvailableCopies = bookWatch('availableCopies');
  const watchBookId = issueWatch('bookId');

  // Selected book info in Issue Modal
  const selectedIssueBook = useMemo(() => {
    return store.libraryBooks.find(b => b.id === watchBookId);
  }, [watchBookId, store.libraryBooks]);

  // Options from store
  const categoryOptions = useMemo(
    () => ["All Categories", ...Array.from(new Set(store.libraryBooks.map(b => b.category)))],
    [store.libraryBooks]
  );

  // ── Live KPI Metrics ───────────────────────────────────────────────────
  const totalCatalogedBooks = store.libraryBooks.length;
  const totalCopiesCount = store.libraryBooks.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
  const totalAvailableCopiesCount = store.libraryBooks.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
  const totalIssuedCopiesCount = Math.max(0, totalCopiesCount - totalAvailableCopiesCount);
  const activeTransactionsCount = store.libraryTransactions.filter(t => t.status === 'Active' || t.status === 'Overdue').length;

  // ── Filtered Books ────────────────────────────────────────────────────
  const filteredBooks = useMemo(() => {
    const q = (bookSearch || store.searchQuery).trim().toLowerCase();

    return store.libraryBooks.filter(book => {
      const matchCat = selectedCategoryFilter === 'All Categories' || book.category === selectedCategoryFilter;
      
      const matchAvail = selectedAvailabilityFilter === 'All Availability' ||
        (selectedAvailabilityFilter === 'Available to Borrow' && book.availableCopies > 0) ||
        (selectedAvailabilityFilter === 'Fully Issued' && book.availableCopies === 0);

      const matchSearch = !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.isbn.toLowerCase().includes(q) ||
        book.id.toLowerCase().includes(q);

      return matchCat && matchAvail && matchSearch;
    });
  }, [store.libraryBooks, selectedCategoryFilter, selectedAvailabilityFilter, bookSearch, store.searchQuery]);

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleOpenCreateBook = useCallback(() => {
    setEditingBookId(null);
    bookReset({
      title: '',
      author: '',
      isbn: '',
      category: 'Computer Science',
      totalCopies: 10,
      availableCopies: 10,
      publisher: 'MUC Academic Press',
      location: 'Shelf A-12',
      status: 'Available',
    });
    setIsBookModalOpen(true);
  }, [bookReset]);

  const handleOpenEditBook = useCallback((book: LibraryBook) => {
    setEditingBookId(book.id);
    bookSetValue('title', book.title);
    bookSetValue('author', book.author);
    bookSetValue('isbn', book.isbn);
    bookSetValue('category', book.category);
    bookSetValue('totalCopies', book.totalCopies);
    bookSetValue('availableCopies', book.availableCopies);
    bookSetValue('publisher', book.publisher || 'MUC Academic Press');
    bookSetValue('location', book.location || 'Shelf A-12');
    bookSetValue('status', book.status || 'Available');
    setIsBookModalOpen(true);
  }, [bookSetValue]);

  const handleOpenDeleteBook = useCallback((book: LibraryBook) => {
    setDeletingBook(book);
    setIsBookDeleteModalOpen(true);
  }, []);

  const confirmDeleteBook = useCallback(() => {
    if (!deletingBook) return;
    
    // Check if active issued copies exist
    const currentlyIssued = deletingBook.totalCopies - deletingBook.availableCopies;
    if (currentlyIssued > 0) {
      alert(`Cannot delete book: "${deletingBook.title}" has ${currentlyIssued} active issued copies. Please process returns before removing from catalog.`);
      setIsBookDeleteModalOpen(false);
      setDeletingBook(null);
      return;
    }

    store.deleteLibraryBook(deletingBook.id);
    setIsBookDeleteModalOpen(false);
    setDeletingBook(null);
  }, [deletingBook, store]);

  const onSubmitBook = useCallback((values: BookFormValues) => {
    const tot = Number(values.totalCopies);
    const avail = Number(values.availableCopies);

    const payload = {
      ...values,
      totalCopies: tot,
      availableCopies: Math.min(tot, avail),
    };

    if (editingBookId) {
      store.updateLibraryBook(editingBookId, payload);
    } else {
      store.addLibraryBook(payload);
    }
    setIsBookModalOpen(false);
    bookReset();
  }, [editingBookId, store, bookReset]);

  // ── Issue Book Handlers ────────────────────────────────────────────────
  const handleOpenIssueModal = useCallback(() => {
    const availableBook = store.libraryBooks.find(b => b.availableCopies > 0) || store.libraryBooks[0];
    const defaultStudent = store.students[0];

    issueReset({
      bookId: availableBook?.id || '',
      studentId: defaultStudent?.id || '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setIsIssueModalOpen(true);
  }, [store.libraryBooks, store.students, issueReset]);

  const onSubmitIssue = useCallback((values: IssueFormValues) => {
    const book = store.libraryBooks.find(b => b.id === values.bookId);
    const student = store.students.find(s => s.id === values.studentId);

    if (!book || book.availableCopies <= 0) {
      alert("Selected book is currently out of stock or fully issued.");
      return;
    }

    if (!student) {
      alert("Invalid student selected.");
      return;
    }

    store.issueLibraryBook({
      bookId: book.id,
      bookTitle: book.title,
      isbn: book.isbn,
      studentId: student.id,
      studentName: student.name,
      issueDate: values.issueDate,
      dueDate: values.dueDate,
    });

    setIsIssueModalOpen(false);
    issueReset();
  }, [store, issueReset]);

  // ── Return Book Handlers ───────────────────────────────────────────────
  const handleOpenReturnModal = useCallback((tx: LibraryTransaction) => {
    setReturningTx(tx);
    setIsReturnModalOpen(true);
  }, []);

  const confirmReturn = useCallback(() => {
    if (!returningTx) return;
    store.returnLibraryBook(returningTx.id);
    setIsReturnModalOpen(false);
    setReturningTx(null);
  }, [returningTx, store]);

  return (
    <div className="space-y-8">
      {/* ── Page Header & Tab Controls ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Administrative</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Library</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight font-display">
            Library Resource & Circulation Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Book inventory cataloging, member borrowing transactions & circulation management
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'catalog' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Library className="w-4 h-4" />
              <span>Book Catalog</span>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'transactions' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Circulation ({store.libraryTransactions.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleOpenIssueModal}
              className="flex items-center gap-2 px-3.5 h-10 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all text-xs shadow-md cursor-pointer active:scale-95 duration-150 whitespace-nowrap"
            >
              <BookMarked className="w-4 h-4" />
              <span>Issue Book</span>
            </button>

            <button 
              onClick={handleOpenCreateBook}
              className="flex items-center gap-2 px-3.5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer active:scale-95 duration-150 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Catalog New Book</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: BOOK CATALOG TAB ───────────────────────────────── */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Catalog Titles</p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{totalCatalogedBooks}</h4>
            </div>
            <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Copies</p>
              <h4 className="text-2xl font-black text-slate-800 mt-1">{totalCopiesCount}</h4>
            </div>
            <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
              <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Available Copies</p>
              <h4 className="text-2xl font-black text-emerald-700 mt-1">{totalAvailableCopiesCount}</h4>
            </div>
            <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
              <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">Currently Issued</p>
              <h4 className="text-2xl font-black text-amber-700 mt-1">{totalIssuedCopiesCount}</h4>
            </div>
            <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
              <p className="text-[10px] font-extrabold text-primary uppercase tracking-wider">Active Borrowers</p>
              <h4 className="text-2xl font-black text-primary mt-1">{activeTransactionsCount}</h4>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Search Catalog
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={bookSearch}
                    onChange={e => setBookSearch(e.target.value)}
                    placeholder="Title, author, ISBN, category..."
                    className="w-full h-10 pl-9 pr-8 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  />
                  {bookSearch && (
                    <button onClick={() => setBookSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="min-w-[170px]">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                <CustomSelect
                  value={selectedCategoryFilter}
                  onChange={e => setSelectedCategoryFilter(e.target.value)}
                  options={categoryOptions}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="min-w-[160px]">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Availability</label>
                <CustomSelect
                  value={selectedAvailabilityFilter}
                  onChange={e => setSelectedAvailabilityFilter(e.target.value)}
                  options={["All Availability", "Available to Borrow", "Fully Issued"]}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {(selectedCategoryFilter !== 'All Categories' || selectedAvailabilityFilter !== 'All Availability' || bookSearch) && (
                <button
                  onClick={() => {
                    setSelectedCategoryFilter('All Categories');
                    setSelectedAvailabilityFilter('All Availability');
                    setBookSearch('');
                  }}
                  className="h-10 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer whitespace-nowrap"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Grid of Books */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBooks.map(book => (
              <div 
                key={book.id} 
                className="bg-white border border-slate-200 hover:border-primary rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all group relative overflow-hidden"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-2.5 py-1 bg-secondary/10 text-secondary rounded-lg font-bold text-xs uppercase">
                      {book.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 border rounded px-2 py-0.5">{book.id}</span>
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1 z-10">
                        <button 
                          onClick={() => { setViewingBook(book); setIsBookDetailsModalOpen(true); }}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 rounded cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleOpenEditBook(book)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded cursor-pointer"
                          title="Edit Book"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleOpenDeleteBook(book)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded cursor-pointer"
                          title="Delete Book"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-primary transition-colors leading-tight">{book.title}</h4>
                  <p className="text-xs text-slate-600 mb-2">Author: <strong className="text-slate-800">{book.author}</strong></p>
                  <p className="text-xs text-slate-400 font-mono">ISBN: {book.isbn}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Library className="w-4 h-4 text-primary" />
                    <span>Total Cataloged: {book.totalCopies}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${
                    book.availableCopies > 0 
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                      : 'text-rose-700 bg-rose-50 border-rose-200'
                  }`}>
                    <BookmarkCheck className="w-4 h-4" />
                    <span>Available: {book.availableCopies}</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredBooks.length === 0 && (
              <div className="col-span-2 text-center py-16 text-slate-400 font-medium bg-white border border-slate-200 rounded-2xl shadow-xs">
                No library resource items match your search or filter criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SECTION 2: ISSUED TRANSACTIONS TAB ───────────────────────── */}
      {activeTab === 'transactions' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Transaction ID</th>
                  <th className="py-4 px-6">Book Details</th>
                  <th className="py-4 px-6">Student Borrower</th>
                  <th className="py-4 px-6">Issue Date</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {store.libraryTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-500">{tx.id}</td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{tx.bookTitle}</p>
                      <p className="text-[10px] text-slate-400 font-mono">ISBN: {tx.isbn}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{tx.studentName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{tx.studentId}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{tx.issueDate}</td>
                    <td className="py-4 px-6 font-mono font-bold text-amber-700">{tx.dueDate}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                        tx.status === 'Returned'
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : tx.status === 'Overdue'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {tx.status !== 'Returned' && (
                        <button
                          onClick={() => handleOpenReturnModal(tx)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold text-[10px] border border-emerald-200 transition-all cursor-pointer ml-auto"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Process Return</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {store.libraryTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No active borrowing transactions recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal 1: Catalog / Edit Book Modal ───────────────────────── */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title={editingBookId ? "Edit Library Resource Details" : "Catalog New Library Asset"}
      >
        <form onSubmit={bookHandleSubmit(onSubmitBook)} className="space-y-4">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              Book Title <span className="text-rose-500">*</span>
            </label>
            <input
              {...bookRegister('title', { required: 'Title is required', minLength: { value: 3, message: 'Must be at least 3 characters' } })}
              type="text"
              placeholder="e.g. Introduction to Algorithms"
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
            />
            {bookErrors.title && <p className="text-[10px] text-rose-600 font-bold mt-1">{bookErrors.title.message}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              Author(s) <span className="text-rose-500">*</span>
            </label>
            <input
              {...bookRegister('author', { required: 'Author is required' })}
              type="text"
              placeholder="e.g. Cormen, Leiserson, Rivest"
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
            />
            {bookErrors.author && <p className="text-[10px] text-rose-600 font-bold mt-1">{bookErrors.author.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                ISBN Number <span className="text-rose-500">*</span>
              </label>
              <input
                {...bookRegister('isbn', { required: 'ISBN is required' })}
                type="text"
                placeholder="e.g. 978-0262033848"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono focus:outline-none focus:border-primary text-slate-900"
              />
              {bookErrors.isbn && <p className="text-[10px] text-rose-600 font-bold mt-1">{bookErrors.isbn.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Category / Subject
              </label>
              <Controller
                name="category"
                control={bookControl}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={["Computer Science", "AI & ML", "Business Administration", "Mathematics", "General Literature"]}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Total Cataloged Copies <span className="text-rose-500">*</span>
              </label>
              <input
                {...bookRegister('totalCopies', { 
                  required: 'Total copies required', 
                  min: { value: 1, message: 'Must be at least 1 copy' } 
                })}
                type="number"
                placeholder="10"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
              />
              {bookErrors.totalCopies && <p className="text-[10px] text-rose-600 font-bold mt-1">{bookErrors.totalCopies.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Available Copies
              </label>
              <input
                {...bookRegister('availableCopies', { 
                  required: 'Available copies required', 
                  min: { value: 0, message: 'Cannot be negative' },
                  validate: val => Number(val) <= Number(watchTotalCopies) || 'Cannot exceed Total Copies'
                })}
                type="number"
                placeholder="10"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
              />
              {bookErrors.availableCopies && <p className="text-[10px] text-rose-600 font-bold mt-1">{bookErrors.availableCopies.message}</p>}
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBookModalOpen(false)}
              className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer"
            >
              {editingBookId ? "Save Configurations" : "Catalog Asset"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 2: Book Details View Modal ──────────────────────────── */}
      <Modal
        isOpen={isBookDetailsModalOpen}
        onClose={() => setIsBookDetailsModalOpen(false)}
        title="Library Resource Catalog Record"
      >
        {viewingBook && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 bg-secondary/10 text-secondary font-bold rounded text-[10px] uppercase">
                  {viewingBook.category}
                </span>
                <span className="font-mono font-bold text-slate-400">{viewingBook.id}</span>
              </div>
              <h4 className="font-bold text-base text-slate-900 pt-1">{viewingBook.title}</h4>
              <p className="text-slate-500 font-medium">Author: {viewingBook.author}</p>
            </div>

            <div className="space-y-2.5 border-t border-b border-slate-100 py-3">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">ISBN Number:</span>
                <span className="font-bold font-mono text-slate-900">{viewingBook.isbn}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Total Copies:</span>
                <span className="font-bold text-slate-900">{viewingBook.totalCopies}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Available to Borrow:</span>
                <span className="font-bold text-emerald-700">{viewingBook.availableCopies}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Currently Issued:</span>
                <span className="font-bold text-amber-700">{Math.max(0, viewingBook.totalCopies - viewingBook.availableCopies)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsBookDetailsModalOpen(false)}
                className="px-5 h-9 bg-primary text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close Catalog Record
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal 3: Issue Book Modal ─────────────────────────────────── */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue Library Book to Student"
      >
        <form onSubmit={issueHandleSubmit(onSubmitIssue)} className="space-y-4">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              Select Book to Borrow <span className="text-rose-500">*</span>
            </label>
            <Controller
              name="bookId"
              control={issueControl}
              rules={{ required: 'Book selection is required' }}
              render={({ field }) => (
                <CustomSelect
                  value={field.value}
                  onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                  options={store.libraryBooks.filter(b => b.availableCopies > 0).map(b => `${b.title} (Avail: ${b.availableCopies})`)}
                  className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                />
              )}
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              Select Student Borrower <span className="text-rose-500">*</span>
            </label>
            <Controller
              name="studentId"
              control={issueControl}
              rules={{ required: 'Student selection is required' }}
              render={({ field }) => (
                <CustomSelect
                  value={field.value}
                  onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                  options={store.students.map(s => `${s.name} (${s.id})`)}
                  className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Issue Date
              </label>
              <input
                {...issueRegister('issueDate', { required: 'Issue date is required' })}
                type="text"
                placeholder="2026-10-15"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono focus:outline-none focus:border-primary text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Return Due Date
              </label>
              <input
                {...issueRegister('dueDate', { required: 'Due date is required' })}
                type="text"
                placeholder="2026-10-29"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono focus:outline-none focus:border-primary text-slate-900"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsIssueModalOpen(false)}
              className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 h-10 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all text-xs shadow-md cursor-pointer"
            >
              Confirm Book Issue
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 4: Process Return Confirmation Modal ─────────────────── */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Confirm Library Book Return"
      >
        {returningTx && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 space-y-1">
              <p className="font-bold text-slate-900">Process Return for "{returningTx.bookTitle}"</p>
              <p className="text-slate-600">Borrower: <strong>{returningTx.studentName}</strong> ({returningTx.studentId})</p>
              <p className="text-slate-500 font-mono">Issued: {returningTx.issueDate} · Due: {returningTx.dueDate}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReturn}
                className="px-5 h-10 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all text-xs cursor-pointer"
              >
                Confirm Return & Restore Stock
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal 5: Custom Delete Book Confirmation Modal ─────────────── */}
      <Modal
        isOpen={isBookDeleteModalOpen}
        onClose={() => setIsBookDeleteModalOpen(false)}
        title="Confirm Book Removal"
      >
        {deletingBook && (
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Remove Book from Library Catalog?</p>
                <p>You are about to remove <strong>"{deletingBook.title}"</strong> ({deletingBook.isbn}).</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBookDeleteModalOpen(false)}
                className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteBook}
                className="px-5 h-10 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all text-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
