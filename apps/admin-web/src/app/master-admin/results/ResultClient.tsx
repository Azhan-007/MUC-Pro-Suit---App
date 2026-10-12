"use client";

import { apiClient } from "@/lib/apiClient";
import React, { useState, useMemo, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  FileCheck2, Search, CheckCircle2, AlertCircle, Save, ArrowLeft,
  XCircle, Filter, Download, BookOpen, GraduationCap, Clock
} from "lucide-react";
import {
  AcademicYear, Semester, Course, ClassEntity, SectionEntity,
  Subject, Examination, Student, Result
} from "@/types/domain";

/* ======================== PROPS ======================== */
interface ResultClientProps {
  academicYears: AcademicYear[];
  semesters: Semester[];
  courses: Course[];
  classes: ClassEntity[];
  sections: SectionEntity[];
  subjects: Subject[];
  examinations: Examination[];
  students: Student[];
  initialResults: Result[];
}

type ViewMode = "exam_list" | "entry";
type ResultStatus = Result["resultStatus"];

const GRADE_POINTS = [
  { min: 90, grade: "O", point: 10 },
  { min: 80, grade: "A+", point: 9 },
  { min: 70, grade: "A", point: 8 },
  { min: 60, grade: "B+", point: 7 },
  { min: 50, grade: "B", point: 6 },
  { min: 40, grade: "C", point: 5 },
  { min: 0, grade: "U", point: 0 }
];

/* ======================== MAIN ======================== */
export function ResultClient({
  academicYears, semesters, courses, classes, subjects,
  examinations, students, initialResults
}: ResultClientProps) {

  const [viewMode, setViewMode] = useState<ViewMode>("exam_list");
    const [localResults, setLocalResults] = useState<Result[]>(initialResults);

  const [searchQuery, setSearchQuery] = useState("");
  const [selExamId, setSelExamId] = useState<string | null>(null);
  
  // Marks entry state mapping studentId -> marks and status
  const [entryData, setEntryData] = useState<Record<string, { marks: string; status: ResultStatus }>>({});
  const [saveMessage, setSaveMessage] = useState("");

  /* -------- RESOLVED CONTEXT -------- */
  const activeAy = useMemo(() => academicYears.find(ay => ay.isActive) || academicYears[0], [academicYears]);
  const activeSem = useMemo(() => semesters.find(s => s.isActive) || semesters[0], [semesters]);

  const activeExams = useMemo(() => {
    return examinations
      .filter(e => e.academicYearId === activeAy?.id && e.semesterId === activeSem?.id)
      .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
  }, [examinations, activeAy, activeSem]);

  const filteredExams = useMemo(() => {
    let list = activeExams;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => {
        const sub = subjects.find(s => s.id === e.subjectId);
        const cls = classes.find(c => c.id === e.classId);
        return sub?.name.toLowerCase().includes(q) || 
               sub?.code.toLowerCase().includes(q) ||
               cls?.code.toLowerCase().includes(q);
      });
    }
    return list;
  }, [activeExams, searchQuery, subjects, classes]);

  const selectedExam = useMemo(() => examinations.find(e => e.id === selExamId), [examinations, selExamId]);
  
  const examStudents = useMemo(() => {
    if (!selectedExam) return [];
    const cls = classes.find(c => c.id === selectedExam.classId);
    if (!cls) return [];
    return students
      .filter(s => s.courseId === selectedExam.courseId && s.currentSemester === cls.semesterNumber)
      .sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber));
  }, [selectedExam, students, classes]);

  /* -------- ACTIONS -------- */
  const openExamEntry = useCallback((exam: Examination) => {
    setSelExamId(exam.id);
    setSaveMessage("");
    
    // Pre-fill entryData from existing results
    const examResults = localResults.filter(r => r.examinationId === exam.id);
    const newEntryData: Record<string, { marks: string; status: ResultStatus }> = {};
    
    // Students in this class
    const cls = classes.find(c => c.id === exam.classId);
    const stus = cls ? students.filter(s => s.courseId === exam.courseId && s.currentSemester === cls.semesterNumber) : [];
    stus.forEach(stu => {
      const existing = examResults.find(r => r.studentId === stu.id);
      if (existing) {
        newEntryData[stu.id] = {
          marks: existing.marksObtained !== undefined ? String(existing.marksObtained) : "",
          status: existing.resultStatus
        };
      } else {
        newEntryData[stu.id] = {
          marks: "",
          status: "NOT_ENTERED"
        };
      }
    });
    setEntryData(newEntryData);
    setViewMode("entry");
  }, [localResults, students]);

  const handleMarksChange = (studentId: string, val: string) => {
    const maxMarks = selectedExam?.examinationType.includes("CIA") ? 25 : 75; // CIA=25, Semester=75
    let numericVal = parseInt(val);
    
    setEntryData(prev => {
      const current = prev[studentId];
      if (val === "") {
        return { ...prev, [studentId]: { ...current, marks: "", status: "NOT_ENTERED" } };
      }
      
      if (isNaN(numericVal)) return prev;
      if (numericVal < 0) numericVal = 0;
      if (numericVal > maxMarks) numericVal = maxMarks;

      const isPass = numericVal >= (maxMarks * 0.4); // 40% pass mark
      
      return { 
        ...prev, 
        [studentId]: { 
          marks: String(numericVal), 
          status: isPass ? "PASS" : "FAIL" 
        } 
      };
    });
  };

  const handleStatusChange = (studentId: string, status: ResultStatus) => {
    setEntryData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        marks: status === "ABSENT" || status === "WITHHELD" ? "" : prev[studentId].marks
      }
    }));
  };

  const handleSaveResults = () => {
    if (!selectedExam) return;
    
    const maxMarks = selectedExam.examinationType.includes("CIA") ? 25 : 75;
    const now = new Date().toISOString();
    
    setLocalResults(prev => {
      const filtered = prev.filter(r => r.examinationId !== selectedExam.id);
      
      const newResults = examStudents.map(stu => {
        const entry = entryData[stu.id];
        let marks = entry.marks ? parseInt(entry.marks) : undefined;
        let grade, gradePoint;
        
        if (marks !== undefined) {
          const percent = (marks / maxMarks) * 100;
          const gp = GRADE_POINTS.find(g => percent >= g.min) || GRADE_POINTS[GRADE_POINTS.length - 1];
          grade = gp.grade;
          gradePoint = gp.point;
        }

        const res: Result = {
          id: `res-${selectedExam.id}-${stu.id}`,
          examinationId: selectedExam.id,
          studentId: stu.id,
          courseId: selectedExam.courseId,
          classId: selectedExam.classId,
          subjectId: selectedExam.subjectId,
          maxMarks,
          marksObtained: marks,
          grade,
          gradePoint,
          resultStatus: entry.status,
          enteredBy: "masteradmin",
          updatedAt: now
        };
        return res;
      });
      
      return [...filtered, ...newResults];
    });
    
    setSaveMessage("Results saved successfully.");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  /* ========================================================
     RENDER: EXAM LIST
     ======================================================== */
  if (viewMode === "exam_list") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Results Entry Desk</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Select an examination to enter marks for {activeAy?.code || "Current Year"} · {activeSem?.term || "Current Sem"}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams by subject or class..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredExams.map(exam => {
            const sub = subjects.find(s => s.id === exam.subjectId);
            const cls = classes.find(c => c.id === exam.classId);
            const entryCount = localResults.filter(r => r.examinationId === exam.id && r.resultStatus !== "NOT_ENTERED").length;
            const totalStudents = cls ? students.filter(s => s.courseId === exam.courseId && s.currentSemester === cls.semesterNumber).length : 0;
            const isComplete = totalStudents > 0 && entryCount === totalStudents;

            return (
              <div key={exam.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isComplete ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${exam.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {exam.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{sub?.code}</h3>
                <p className="text-xs text-gray-500 line-clamp-1 mb-3">{sub?.name}</p>
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-[11px] text-gray-600">
                    <GraduationCap className="w-3.5 h-3.5 text-gray-400" /> {cls?.code}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-600">
                    <Clock className="w-3.5 h-3.5 text-gray-400" /> 
                    {new Date(exam.examDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} · {exam.examinationType.replace("_", " ")}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className={`text-xs font-semibold ${isComplete ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {entryCount} / {totalStudents} Entered
                  </span>
                  <button 
                    onClick={() => openExamEntry(exam)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Enter Marks &rarr;
                  </button>
                </div>
              </div>
            );
          })}
          {filteredExams.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No examinations found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ========================================================
     RENDER: MARK ENTRY
     ======================================================== */
  if (viewMode === "entry" && selectedExam) {
    const sub = subjects.find(s => s.id === selectedExam.subjectId);
    const cls = classes.find(c => c.id === selectedExam.classId);
    const maxMarks = selectedExam.examinationType.includes("CIA") ? 25 : 75;

    const stats = {
      total: examStudents.length,
      entered: examStudents.filter(s => entryData[s.id]?.status !== "NOT_ENTERED").length,
      passed: examStudents.filter(s => entryData[s.id]?.status === "PASS").length,
      failed: examStudents.filter(s => entryData[s.id]?.status === "FAIL").length,
      absent: examStudents.filter(s => entryData[s.id]?.status === "ABSENT").length,
    };

    return (
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setViewMode("exam_list")} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Enter Marks</h2>
              <p className="text-xs text-gray-500">
                {sub?.code} - {sub?.name} · {cls?.code} · {selectedExam.examinationType.replace("_", " ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saveMessage && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {saveMessage}
              </span>
            )}
            <button
              onClick={handleSaveResults}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" /> Save Results
            </button>
          </div>
        </div>

        {/* Entry Progress Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Entered</p>
            <p className="text-2xl font-bold text-emerald-700">{stats.entered}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Passed</p>
            <p className="text-2xl font-bold text-blue-700">{stats.passed}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">Failed</p>
            <p className="text-2xl font-bold text-rose-700">{stats.failed}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Absent</p>
            <p className="text-2xl font-bold text-amber-700">{stats.absent}</p>
          </div>
        </div>

        {/* Student Roster */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4 w-16 text-center">S.No</th>
                <th className="px-5 py-4">Register Number</th>
                <th className="px-5 py-4">Student Name</th>
                <th className="px-5 py-4 w-40 text-center">Marks (Max {maxMarks})</th>
                <th className="px-5 py-4 w-48 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {examStudents.map((stu, idx) => {
                const entry = entryData[stu.id] || { marks: "", status: "NOT_ENTERED" };
                const isAbsent = entry.status === "ABSENT";
                const isWithheld = entry.status === "WITHHELD";
                
                return (
                  <tr key={stu.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-center text-gray-500">{idx + 1}</td>
                    <td className="px-5 py-3 font-mono font-medium text-gray-900">{stu.registrationNumber}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{stu.firstName} {stu.lastName}</td>
                    <td className="px-5 py-3">
                      <input
                        type="number"
                        min="0"
                        max={maxMarks}
                        value={entry.marks}
                        onChange={e => handleMarksChange(stu.id, e.target.value)}
                        disabled={isAbsent || isWithheld}
                        placeholder={isAbsent ? "ABS" : isWithheld ? "W/H" : "--"}
                        className="w-full text-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 font-semibold disabled:opacity-50 disabled:bg-gray-100"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <select
                          value={entry.status}
                          onChange={e => handleStatusChange(stu.id, e.target.value as ResultStatus)}
                          className={`w-full px-2 py-2 text-xs font-bold rounded-lg border focus:outline-none ${
                            entry.status === 'PASS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            entry.status === 'FAIL' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            entry.status === 'ABSENT' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            entry.status === 'WITHHELD' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-gray-50 text-gray-500 border-gray-200'
                          }`}
                        >
                          <option value="NOT_ENTERED">Not Entered</option>
                          <option value="PASS">Pass</option>
                          <option value="FAIL">Fail</option>
                          <option value="ABSENT">Absent</option>
                          <option value="WITHHELD">Withheld</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {examStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    No students mapped to this class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}



