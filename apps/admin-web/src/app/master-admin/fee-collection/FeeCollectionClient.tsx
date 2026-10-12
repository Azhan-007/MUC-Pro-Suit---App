"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CreditCard, Search, User, IndianRupee, Receipt, CheckCircle2,
  ArrowLeft, Banknote, Smartphone, Building2, AlertCircle,
  Clock, FileText, Download, Printer
} from "lucide-react";
import {
  Student, Course, Department, FeeStructure, StudentFeeAccount,
  FeePayment, Scholarship, Fine
} from "@/types/domain";

/* ======================== PROPS ======================== */
interface FeeCollectionClientProps {
  students: Student[];
  feeStructures: FeeStructure[];
  feeAccounts: StudentFeeAccount[];
  feePayments: FeePayment[];
  courses: Course[];
  scholarships: Scholarship[];
  fines: Fine[];
  departments: Department[];
}

type ViewMode = "search" | "collect" | "receipt";

const PAYMENT_METHODS = [
  { value: "CASH" as const, label: "Cash", icon: Banknote, color: "text-emerald-600 bg-emerald-50" },
  { value: "UPI" as const, label: "UPI", icon: Smartphone, color: "text-violet-600 bg-violet-50" },
  { value: "ONLINE_GATEWAY" as const, label: "Online / Bank Transfer", icon: Building2, color: "text-blue-600 bg-blue-50" },
];

/* ======================== MAIN COMPONENT ======================== */
export function FeeCollectionClient({
  students, feeStructures, feeAccounts, feePayments, courses, scholarships, fines, departments
}: FeeCollectionClientProps) {

  const [viewMode, setViewMode] = useState<ViewMode>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<FeePayment["paymentMethod"]>("CASH");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<FeePayment | null>(null);

  // Recent transactions
  const [localPayments, setLocalPayments] = useState<FeePayment[]>(feePayments);

  /* -------- SEARCH -------- */
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return students.filter(s =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.registrationNumber.toLowerCase().includes(q) ||
      s.admissionNumber.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [students, searchQuery]);

  /* -------- STUDENT CONTEXT -------- */
  const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId), [students, selectedStudentId]);
  const studentCourse = useMemo(() => selectedStudent ? courses.find(c => c.id === selectedStudent.courseId) : null, [selectedStudent, courses]);
  const studentDept = useMemo(() => selectedStudent ? departments.find(d => d.id === selectedStudent.departmentId) : null, [selectedStudent, departments]);
  const studentAccount = useMemo(() => selectedStudent ? feeAccounts.find(a => a.studentId === selectedStudent.id) : null, [selectedStudent, feeAccounts]);
  const studentPayments = useMemo(() => selectedStudent ? localPayments.filter(p => p.studentId === selectedStudent.id) : [], [selectedStudent, localPayments]);
  const studentScholarships = useMemo(() => selectedStudent ? scholarships.filter(s => s.studentId === selectedStudent.id) : [], [selectedStudent, scholarships]);
  const studentFines = useMemo(() => selectedStudent ? fines.filter(f => f.studentId === selectedStudent.id) : [], [selectedStudent, fines]);

  /* -------- METRICS -------- */
  const todayCollections = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayPays = localPayments.filter(p => p.paymentDate.startsWith(today) && p.status === "SUCCESS");
    return {
      count: todayPays.length,
      total: todayPays.reduce((sum, p) => sum + p.amount, 0),
    };
  }, [localPayments]);

  const totalOutstanding = useMemo(() => {
    return feeAccounts.reduce((sum, a) => sum + a.outstandingAmount, 0);
  }, [feeAccounts]);

  /* -------- ACTIONS -------- */
  const selectStudent = useCallback((studentId: string) => {
    setSelectedStudentId(studentId);
    setSearchQuery("");
    setPaymentAmount("");
    setPaymentMethod("CASH");
    setPaymentRef("");
    setPaymentRemarks("");
    setViewMode("collect");
  }, []);

  const handleCollectPayment = useCallback(() => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0 || !selectedStudent || !studentAccount) return;

    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      const receipt: FeePayment = {
        id: `pay-${Date.now()}`,
        studentFeeAccountId: studentAccount.id,
        studentId: selectedStudent.id,
        amount,
        paymentDate: new Date().toISOString(),
        paymentMethod,
        receiptNumber: `RCPT-${String(localPayments.length + 1).padStart(4, "0")}`,
        transactionId: paymentRef || undefined,
        status: "SUCCESS",
        collectedBy: "masteradmin",
        remarks: paymentRemarks || undefined,
      };

      setLocalPayments(prev => [receipt, ...prev]);
      setLastReceipt(receipt);
      setIsProcessing(false);
      setViewMode("receipt");
    }, 800);
  }, [paymentAmount, paymentMethod, paymentRef, paymentRemarks, selectedStudent, studentAccount, localPayments.length]);

  /* ========================================================
     RENDER: SEARCH VIEW (Cashier Home)
     ======================================================== */
  if (viewMode === "search") {
    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Fee Collection Desk</h1>
          <p className="text-sm text-gray-500 mt-0.5">Search student to collect payment</p>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <IndianRupee className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Today&apos;s Collection</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{todayCollections.total.toLocaleString("en-IN")}</p>
            <p className="text-xs text-gray-500 mt-1">{todayCollections.count} transaction(s)</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
                <AlertCircle className="w-4.5 h-4.5 text-rose-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Outstanding</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{totalOutstanding.toLocaleString("en-IN")}</p>
            <p className="text-xs text-gray-500 mt-1">{feeAccounts.filter(a => a.outstandingAmount > 0).length} accounts</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Receipt className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Receipts</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{localPayments.filter(p => p.status === "SUCCESS").length}</p>
            <p className="text-xs text-gray-500 mt-1">This semester</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue Accounts</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{feeAccounts.filter(a => a.status === "OVERDUE").length}</p>
            <p className="text-xs text-gray-500 mt-1">Past due date</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-900">Collect Payment</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Student Name, Registration Number, or Admission Number..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition-all"
              autoFocus
            />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-3 border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50">
              {searchResults.map(stu => {
                const course = courses.find(c => c.id === stu.courseId);
                const account = feeAccounts.find(a => a.studentId === stu.id);
                return (
                  <button
                    key={stu.id}
                    onClick={() => selectStudent(stu.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-emerald-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {stu.firstName.charAt(0)}{stu.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{stu.firstName} {stu.lastName}</p>
                        <p className="text-[11px] text-gray-500">{stu.registrationNumber} · {course?.code || "—"} · Sem {stu.currentSemester}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {account && account.outstandingAmount > 0 ? (
                        <div>
                          <p className="text-sm font-bold text-rose-600">₹{account.outstandingAmount.toLocaleString("en-IN")}</p>
                          <p className="text-[10px] text-rose-500">Outstanding</p>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Paid</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {searchQuery.trim() && searchResults.length === 0 && (
            <div className="mt-3 text-center py-6">
              <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No students match &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        {localPayments.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent Transactions</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {localPayments.slice(0, 5).map(pay => {
                const stu = students.find(s => s.id === pay.studentId);
                return (
                  <div key={pay.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pay.status === "SUCCESS" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{stu?.firstName} {stu?.lastName}</p>
                        <p className="text-[11px] text-gray-500">{pay.receiptNumber} · {pay.paymentMethod} · {new Date(pay.paymentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">₹{pay.amount.toLocaleString("en-IN")}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ========================================================
     RENDER: COLLECT VIEW (Payment Desk)
     ======================================================== */
  if (viewMode === "collect" && selectedStudent) {
    const account = studentAccount;
    const shift = studentCourse?.shift === "SHIFT_I" ? "Shift I (Aided)" : "Shift II (SF)";
    const outstanding = account?.outstandingAmount || 0;
    const canPay = outstanding > 0;

    return (
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setViewMode("search"); setSelectedStudentId(null); }}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Payment Collection</h2>
            <p className="text-xs text-gray-500">Process fee payment for student</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Student Identity Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                  {selectedStudent.firstName.charAt(0)}{selectedStudent.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                  <p className="text-xs text-gray-500 font-mono">{selectedStudent.registrationNumber}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Admission No</span>
                  <span className="font-medium text-gray-900">{selectedStudent.admissionNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Course</span>
                  <span className="font-medium text-gray-900">{studentCourse?.code || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Department</span>
                  <span className="font-medium text-gray-900">{studentDept?.name || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Semester</span>
                  <span className="font-medium text-gray-900">{selectedStudent.currentSemester}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shift</span>
                  <span className="font-medium text-gray-900">{shift}</span>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Fee Summary</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Assessed</span>
                  <span className="font-medium">₹{(account?.totalAssessed || 0).toLocaleString("en-IN")}</span>
                </div>
                {(account?.scholarshipAmount || 0) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Scholarship</span>
                    <span className="font-medium">−₹{account!.scholarshipAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {(account?.fineAmount || 0) > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Fines</span>
                    <span className="font-medium">+₹{account!.fineAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold">
                  <span className="text-gray-700">Net Payable</span>
                  <span>₹{(account?.netPayable || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Paid</span>
                  <span className="font-medium text-emerald-600">₹{(account?.paidAmount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Outstanding</span>
                  <span className={`text-lg font-bold ${outstanding > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    ₹{outstanding.toLocaleString("en-IN")}
                  </span>
                </div>
                {account && (
                  <div className="mt-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${account.status === "PAID" ? "bg-emerald-100 text-emerald-700" : account.status === "OVERDUE" ? "bg-rose-100 text-rose-700" : account.status === "PARTIALLY_PAID" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                      {account.status.replace("_", " ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" /> Payment Details
              </h3>

              {!canPay ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-gray-900">No Dues</p>
                  <p className="text-sm text-gray-500 mt-1">This student has no outstanding fees for the current semester.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Amount */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Payment Amount (₹)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        min="1"
                        max={outstanding}
                        value={paymentAmount}
                        onChange={e => setPaymentAmount(e.target.value)}
                        placeholder={`Max: ₹${outstanding.toLocaleString("en-IN")}`}
                        className="w-full pl-9 pr-4 py-3 text-lg font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white"
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setPaymentAmount(String(outstanding))}
                        className="text-[11px] px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 font-medium transition-colors"
                      >
                        Full Amount (₹{outstanding.toLocaleString("en-IN")})
                      </button>
                      {outstanding > 5000 && (
                        <button
                          onClick={() => setPaymentAmount(String(Math.ceil(outstanding / 2)))}
                          className="text-[11px] px-2 py-1 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 font-medium transition-colors"
                        >
                          Half (₹{Math.ceil(outstanding / 2).toLocaleString("en-IN")})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-2 block">Payment Mode</label>
                    <div className="grid grid-cols-3 gap-3">
                      {PAYMENT_METHODS.map(method => {
                        const Icon = method.icon;
                        return (
                          <button
                            key={method.value}
                            onClick={() => setPaymentMethod(method.value)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === method.value
                              ? "border-emerald-400 bg-emerald-50/50 shadow-sm"
                              : "border-gray-100 hover:border-gray-200"
                              }`}
                          >
                            <Icon className={`w-5 h-5 ${paymentMethod === method.value ? "text-emerald-600" : "text-gray-400"}`} />
                            <span className={`text-xs font-semibold ${paymentMethod === method.value ? "text-emerald-700" : "text-gray-500"}`}>{method.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reference / Transaction ID */}
                  {paymentMethod !== "CASH" && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                        {paymentMethod === "UPI" ? "UPI Transaction ID" : "Transaction Reference"}
                      </label>
                      <input
                        type="text"
                        value={paymentRef}
                        onChange={e => setPaymentRef(e.target.value)}
                        placeholder="Enter transaction reference..."
                        className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                      />
                    </div>
                  )}

                  {/* Remarks */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Remarks (Optional)</label>
                    <input
                      type="text"
                      value={paymentRemarks}
                      onChange={e => setPaymentRemarks(e.target.value)}
                      placeholder="Add any notes..."
                      className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                    />
                  </div>

                  {/* Collect Button */}
                  <button
                    onClick={handleCollectPayment}
                    disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || isProcessing}
                    className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${paymentAmount && parseFloat(paymentAmount) > 0
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    {isProcessing ? (
                      <span className="animate-pulse">Processing Payment...</span>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        {paymentAmount && parseFloat(paymentAmount) > 0
                          ? `Collect ₹${parseFloat(paymentAmount).toLocaleString("en-IN")} via ${PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label}`
                          : "Enter Amount to Collect"
                        }
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Payment History */}
            {studentPayments.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment History</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {studentPayments.map(pay => (
                    <div key={pay.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{pay.receiptNumber}</p>
                        <p className="text-[11px] text-gray-500">
                          {pay.paymentMethod} · {new Date(pay.paymentDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">₹{pay.amount.toLocaleString("en-IN")}</p>
                        <span className={`text-[10px] font-semibold ${pay.status === "SUCCESS" ? "text-emerald-600" : "text-rose-600"}`}>
                          {pay.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================
     RENDER: RECEIPT VIEW
     ======================================================== */
  if (viewMode === "receipt" && lastReceipt && selectedStudent) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg max-w-md w-full overflow-hidden">
          {/* Success Banner */}
          <div className="bg-emerald-500 text-white px-6 py-5 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
            <h2 className="text-lg font-bold">Payment Successful</h2>
            <p className="text-emerald-100 text-sm mt-1">Transaction completed</p>
          </div>

          {/* Receipt Details */}
          <div className="p-6 space-y-4">
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-gray-900">₹{lastReceipt.amount.toLocaleString("en-IN")}</p>
              <p className="text-xs text-gray-500 mt-1">{PAYMENT_METHODS.find(m => m.value === lastReceipt.paymentMethod)?.label}</p>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Receipt No.</span>
                <span className="font-mono font-bold text-gray-900">{lastReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Student</span>
                <span className="font-medium">{selectedStudent.firstName} {selectedStudent.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reg. Number</span>
                <span className="font-mono text-gray-700">{selectedStudent.registrationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Course</span>
                <span className="font-medium">{studentCourse?.code || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date & Time</span>
                <span className="font-medium">{new Date(lastReceipt.paymentDate).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              {lastReceipt.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-mono text-gray-700">{lastReceipt.transactionId}</span>
                </div>
              )}
              {lastReceipt.remarks && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Remarks</span>
                  <span className="text-gray-700">{lastReceipt.remarks}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => { setViewMode("search"); setSelectedStudentId(null); setLastReceipt(null); }}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            New Collection
          </button>
          <button
            onClick={() => { setViewMode("collect"); setLastReceipt(null); }}
            className="px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Same Student
          </button>
        </div>
      </div>
    );
  }

  return null;
}
