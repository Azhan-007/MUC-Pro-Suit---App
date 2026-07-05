// Department Timetable Mock Data
// Replace DEPT_TIMETABLE_DATA with an API call later without changing any UI.

export const DEPARTMENTS = ['All', 'Computer Science', 'BCA', 'Mathematics', 'English', 'Physics'];

export type PeriodType = 'Theory' | 'Lab';
export type PeriodStatus = 'Normal' | 'Replacement' | 'Suspended';

export interface DeptTimetablePeriod {
  subject: string;
  subjectCode: string;
  classCode: string;
  room: string;
  type: PeriodType;
  status: PeriodStatus;
}

export interface FacultyTimetableRow {
  id: string;
  facultyName: string;
  department: string;
  designation: string;
  shift: 'SHIFT_I' | 'SHIFT_II' | 'GIRLS';
  periods: {
    h1: DeptTimetablePeriod | null;
    h2: DeptTimetablePeriod | null;
    h3: DeptTimetablePeriod | null;
    h4: DeptTimetablePeriod | null;
    h5: DeptTimetablePeriod | null;
    h6: DeptTimetablePeriod | null;
    h7: DeptTimetablePeriod | null;
    h8: DeptTimetablePeriod | null;
  };
}

const th = (subject: string, subjectCode: string, classCode: string, room: string, status: PeriodStatus = 'Normal'): DeptTimetablePeriod =>
  ({ subject, subjectCode, classCode, room, type: 'Theory', status });

const lb = (subject: string, subjectCode: string, classCode: string, room: string, status: PeriodStatus = 'Normal'): DeptTimetablePeriod =>
  ({ subject, subjectCode, classCode, room, type: 'Lab', status });

const FACULTY_D1: FacultyTimetableRow[] = [
  {
    id: 'f1', facultyName: 'Dr. P Rizwan Ahmed', department: 'Computer Science',
    designation: 'Associate Professor', shift: 'SHIFT_I',
    periods: {
      h1: th('Database Mgmt System', 'CS301', 'III B.Sc CS - A', 'LH-01'),
      h2: th('Database Mgmt System', 'CS301', 'II B.Sc CS - B', 'LH-02'),
      h3: null,
      h4: lb('DBMS Laboratory', 'CS301P', 'III B.Sc CS - A', 'Lab-A'),
      h5: lb('DBMS Laboratory', 'CS301P', 'III B.Sc CS - A', 'Lab-A'),
      h6: th('Database Mgmt System', 'CS301', 'I B.Sc CS - A', 'LH-01'),
      h7: null,
      h8: null,
    },
  },
  {
    id: 'f2', facultyName: 'Dr. K H Kaleemullah', department: 'Computer Science',
    designation: 'HOD / Professor', shift: 'SHIFT_I',
    periods: {
      h1: null,
      h2: th('Operating System', 'CS201', 'III B.Sc CS - A', 'LH-01'),
      h3: th('Operating System', 'CS201', 'II B.Sc CS - A', 'LH-03'),
      h4: null,
      h5: th('Operating System', 'CS201', 'I B.Sc CS - A', 'LH-01'),
      h6: null,
      h7: th('HOD / Seminar', 'CS105', 'III B.Sc CS - A', 'LH-01'),
      h8: null,
    },
  },
  {
    id: 'f3', facultyName: 'Dr. Ayesha Siddiqua J', department: 'Computer Science',
    designation: 'Assistant Professor', shift: 'SHIFT_I',
    periods: {
      h1: th('Data Structures', 'CS202', 'II B.Sc CS - A', 'LH-02'),
      h2: null,
      h3: th('Data Structures', 'CS202', 'I B.Sc CS - A', 'LH-01'),
      h4: th('Data Structures', 'CS202', 'III BCA - A', 'LH-04'),
      h5: null,
      h6: th('Data Structures', 'CS202', 'II B.Sc CS - B', 'LH-02'),
      h7: null,
      h8: lb('DS Laboratory', 'CS202P', 'I B.Sc CS - A', 'Lab-B'),
    },
  },
  {
    id: 'f4', facultyName: 'Prof. S. Tamilselvan', department: 'Mathematics',
    designation: 'Assistant Professor', shift: 'SHIFT_I',
    periods: {
      h1: th('Mathematics II', 'MA102', 'I B.Sc CS - A', 'LH-01'),
      h2: th('Mathematics II', 'MA102', 'I B.Sc CS - B', 'LH-02'),
      h3: th('Mathematics II', 'MA102', 'III BCA - A', 'LH-04'),
      h4: null,
      h5: th('Mathematics II', 'MA102', 'II B.Sc CS - A', 'LH-03'),
      h6: th('Mathematics II', 'MA102', 'III B.Sc CS - A', 'LH-01', 'Replacement'),
      h7: null,
      h8: null,
    },
  },
  {
    id: 'f5', facultyName: 'Prof. H. Shabana', department: 'English',
    designation: 'Assistant Professor', shift: 'SHIFT_I',
    periods: {
      h1: null,
      h2: null,
      h3: th('English II', 'EN101', 'I B.Sc CS - A', 'LH-01'),
      h4: th('English II', 'EN101', 'II B.Sc CS - A', 'LH-02'),
      h5: th('English II', 'EN101', 'III B.Sc CS - A', 'LH-01', 'Suspended'),
      h6: null,
      h7: th('English II', 'EN101', 'III BCA - A', 'LH-04'),
      h8: null,
    },
  },
  {
    id: 'f6', facultyName: 'Dr. M. Fathima Beevi', department: 'BCA',
    designation: 'Associate Professor', shift: 'SHIFT_II',
    periods: {
      h1: th('Web Technology', 'BCA301', 'III BCA - A', 'LH-05'),
      h2: th('Web Technology', 'BCA301', 'II BCA - A', 'LH-06'),
      h3: null,
      h4: lb('Web Tech Lab', 'BCA301P', 'III BCA - A', 'Lab-C'),
      h5: lb('Web Tech Lab', 'BCA301P', 'III BCA - A', 'Lab-C'),
      h6: th('Web Technology', 'BCA301', 'I BCA - A', 'LH-05'),
      h7: null,
      h8: null,
    },
  },
  {
    id: 'f7', facultyName: 'Ms. R. Jasmine', department: 'Computer Science',
    designation: 'Assistant Professor', shift: 'GIRLS',
    periods: {
      h1: th('Python Programming', 'CS401', 'III B.Sc CS - G', 'LH-07'),
      h2: null,
      h3: th('Python Programming', 'CS401', 'II B.Sc CS - G', 'LH-07'),
      h4: lb('Python Lab', 'CS401P', 'III B.Sc CS - G', 'Lab-D'),
      h5: lb('Python Lab', 'CS401P', 'III B.Sc CS - G', 'Lab-D'),
      h6: null,
      h7: th('Python Programming', 'CS401', 'I B.Sc CS - G', 'LH-07'),
      h8: null,
    },
  },
];

const rotatePeriods = (row: FacultyTimetableRow, offset: number): FacultyTimetableRow => {
  const keys = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8'] as const;
  const vals = keys.map(k => row.periods[k]);
  const rotated = [...vals.slice(offset % 8), ...vals.slice(0, offset % 8)];
  const newPeriods = Object.fromEntries(keys.map((k, i) => [k, rotated[i]])) as FacultyTimetableRow['periods'];
  return { ...row, periods: newPeriods };
};

export const DEPT_TIMETABLE_DATA: Record<string, FacultyTimetableRow[]> = {
  D1: FACULTY_D1,
  D2: FACULTY_D1.map(r => rotatePeriods(r, 1)),
  D3: FACULTY_D1.map(r => rotatePeriods(r, 2)),
  D4: FACULTY_D1.map(r => rotatePeriods(r, 3)),
  D5: FACULTY_D1.map(r => rotatePeriods(r, 4)),
  D6: FACULTY_D1.map(r => rotatePeriods(r, 5)),
};

export const PERIOD_KEYS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8'] as const;
export type PeriodKey = typeof PERIOD_KEYS[number];
