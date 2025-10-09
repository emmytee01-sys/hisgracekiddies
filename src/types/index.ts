// User Roles
export type UserRole = 'admin' | 'teacher' | 'secretary' | 'proprietor' | 'parent' | 'student';

// User Interface
export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

// Student Interface
export interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female';
  class: string;
  section: string;
  parentId: string;
  address: string;
  phoneNumber?: string;
  profileImage?: string;
  admissionDate: Date;
  isActive: boolean;
  userId?: string; // Link to user account if student has login access
  
  // Additional Student Personal Data
  religion?: string;
  nationality?: string;
  stateOfOrigin?: string;
  lgaOfOrigin?: string;
  homeTown?: string;
  languageSpoken?: string;
  
  // Sponsor Data
  sponsorName?: string;
  sponsorRelationship?: string;
  sponsorAddress?: string;
  sponsorPhone?: string;
  sponsorEmail?: string;
  sponsorOccupation?: string;
  sponsorPhoto?: string;
  
  // Medical Information
  bloodGroup?: string;
  genotype?: string;
  disability?: string;
  
  // Academic Information
  academicSessionAdmitted?: string;
  academicTermAdmitted?: string;
  academicClassAdmitted?: string;
}

// Parent Interface
export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  occupation?: string;
  relationship: 'father' | 'mother' | 'guardian';
  children: string[]; // Array of student IDs
  userId?: string; // Link to user account
}

// Teacher Interface
export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  assignedClassId: string; // One class per teacher
  qualification: string;
  hireDate: Date;
  isActive: boolean;
  userId?: string; // Link to user account
}

// Class Interface
export interface Class {
  id: string;
  name: string;
  section: string;
  teacherId: string; // One teacher per class
  subjects: string[];
  capacity: number;
  currentEnrollment: number;
  academicYear: string;
  isActive: boolean;
  createdAt: Date;
}

// Subject Interface
export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  teacherId: string;
  classes: string[];
  credits: number;
  isActive: boolean;
  createdAt: Date;
}

// Fee Structure Interface
export interface FeeStructure {
  id: string;
  classId: string;
  term: string;
  academicYear: string;
  fees: {
    tuition: number;
    exerciseBooks: number;
    reportCard: number;
    textbooks: number;
    pta: number;
  };
  dueDate: Date;
}

// Payment Interface
export interface Payment {
  id: string;
  studentId: string;
  feeStructureId: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'online';
  paymentDate: Date;
  receiptNumber: string;
  status: 'completed' | 'incomplete';
  transactionId?: string;
}

// Attendance Interface
export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: Date;
  status: 'present' | 'absent' | 'late';
  teacherId: string;
}

// Result Interface
export interface Result {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  term: string;
  academicYear: string;
  score: number;
  maxScore: number;
  grade: string;
  remark?: string;
  teacherId: string;
  dateRecorded: Date;
}

// Assignment Interface
export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  dueDate: Date;
  maxScore: number;
  createdAt: Date;
  isActive: boolean;
}

// Assignment Submission Interface
export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submissionDate: Date;
  score?: number;
  feedback?: string;
  fileUrl?: string;
  status: 'submitted' | 'graded' | 'late';
}

// Academic Session Interface
export interface AcademicSession {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  currentTerm: 'First Term' | 'Second Term' | 'Third Term';
  terms: {
    first: { startDate: Date; endDate: Date };
    second: { startDate: Date; endDate: Date };
    third: { startDate: Date; endDate: Date };
  };
}

// Event Interface
export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'academic' | 'sports' | 'cultural' | 'holiday';
  isActive: boolean;
  createdBy: string;
}

// Notification Interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  recipientId: string;
  recipientType: UserRole;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

// Dashboard Stats Interface
export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalRevenue: number;
  pendingPayments: number;
  attendanceRate: number;
  academicPerformance: {
    excellent: number;
    good: number;
    average: number;
    belowAverage: number;
  };
} 