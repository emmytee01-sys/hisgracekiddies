import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query as fsQuery,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { User, Student, Teacher, Class, Subject, FeeStructure, AcademicSession, Assignment, Event, Attendance, Result, Payment } from '../types';

// Helper function to convert Date objects to Firestore Timestamps
const convertDatesToTimestamps = (data: any): any => {
  if (data === null || data === undefined) return data;
  
  if (data instanceof Date) {
    return Timestamp.fromDate(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(convertDatesToTimestamps);
  }
  
  if (typeof data === 'object') {
    const converted: any = {};
    for (const key in data) {
      converted[key] = convertDatesToTimestamps(data[key]);
    }
    return converted;
  }
  
  return data;
};

// Helper function to convert Firestore Timestamps to Date objects
const convertTimestampsToDates = (data: any): any => {
  if (data === null || data === undefined) return data;
  
  if (data instanceof Timestamp) {
    return data.toDate();
  }
  
  if (Array.isArray(data)) {
    return data.map(convertTimestampsToDates);
  }
  
  if (typeof data === 'object' && data.constructor === Object) {
    const converted: any = {};
    for (const key in data) {
      converted[key] = convertTimestampsToDates(data[key]);
    }
    return converted;
  }
  
  return data;
};

// Generic CRUD operations
export const createDocument = async <T>(
  collectionName: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const convertedData = convertDatesToTimestamps(data);
    const docRef = await addDoc(collection(db, collectionName), {
      ...convertedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error creating ${collectionName} document:`, error);
    throw error;
  }
};

export const getDocument = async <T>(
  collectionName: string,
  id: string
): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = convertTimestampsToDates({ id: docSnap.id, ...docSnap.data() });
      return data as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting ${collectionName} document:`, error);
    throw error;
  }
};

export const updateDocument = async <T>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> => {
  try {
    const convertedData = convertDatesToTimestamps(data);
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...convertedData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating ${collectionName} document:`, error);
    throw error;
  }
};

export const deleteDocument = async (
  collectionName: string,
  id: string
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting ${collectionName} document:`, error);
    throw error;
  }
};

export const getDocuments = async <T>(
  collectionName: string,
  conditions?: Array<{ field: string; operator: any; value: any }>,
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'asc'
): Promise<T[]> => {
  try {
    const constraints: QueryConstraint[] = [];

    if (conditions && conditions.length > 0) {
      conditions.forEach(condition => constraints.push(where(condition.field as any, condition.operator as any, condition.value)));
    }

    if (orderByField) {
      constraints.push(orderBy(orderByField as any, orderDirection));
    }

    const q = fsQuery(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => convertTimestampsToDates({ id: d.id, ...d.data() })) as T[];
  } catch (error) {
    console.error(`Error getting ${collectionName} documents:`, error);
    throw error;
  }
};

// Realtime listeners
export const listenToDocuments = <T>(
  collectionName: string,
  onUpdate: (data: T[]) => void,
  conditions?: Array<{ field: string; operator: any; value: any }>,
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'asc'
): (() => void) => {
  const constraints: QueryConstraint[] = [];

  if (conditions && conditions.length > 0) {
    conditions.forEach(condition => constraints.push(where(condition.field as any, condition.operator as any, condition.value)));
  }

  if (orderByField) {
    constraints.push(orderBy(orderByField as any, orderDirection));
  }

  const q = fsQuery(collection(db, collectionName), ...constraints);
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(d => convertTimestampsToDates({ id: d.id, ...d.data() })) as T[];
    onUpdate(items);
  });
};

// User Management
export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => createDocument<User>('users', userData);
export const getUser = async (id: string): Promise<User | null> => getDocument<User>('users', id);
export const updateUser = async (id: string, userData: Partial<User>): Promise<void> => updateDocument<User>('users', id, userData);
export const deleteUser = async (id: string): Promise<void> => deleteDocument('users', id);
export const getUsers = async (role?: string): Promise<User[]> => getDocuments<User>('users', role ? [{ field: 'role', operator: '==', value: role }] : undefined, 'firstName');
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const users = await getDocuments<User>('users', [{ field: 'email', operator: '==', value: email }]);
  return users.length > 0 ? users[0] : null;
};
export const listenToUsers = (onUpdate: (data: User[]) => void) => listenToDocuments<User>('users', onUpdate, undefined, 'firstName');

// Student Management
export const createStudent = async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => createDocument<Student>('students', studentData);
export const getStudent = async (id: string): Promise<Student | null> => getDocument<Student>('students', id);
export const updateStudent = async (id: string, studentData: Partial<Student>): Promise<void> => updateDocument<Student>('students', id, studentData);
export const deleteStudent = async (id: string): Promise<void> => deleteDocument('students', id);
export const getStudents = async (classId?: string): Promise<Student[]> => getDocuments<Student>('students', classId ? [{ field: 'class', operator: '==', value: classId }] : undefined, 'firstName');
export const listenToStudents = (onUpdate: (data: Student[]) => void, classId?: string) => listenToDocuments<Student>('students', onUpdate, classId ? [{ field: 'class', operator: '==', value: classId }] : undefined, 'firstName');
export const getStudentsByTeacher = async (teacherId: string): Promise<Student[]> => {
  const teacher = await getTeacher(teacherId);
  if (!teacher || !teacher.assignedClassId) return [];
  return getStudents(teacher.assignedClassId);
};

// Teacher Management
export const createTeacher = async (teacherData: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => createDocument<Teacher>('teachers', teacherData);
export const getTeacher = async (id: string): Promise<Teacher | null> => getDocument<Teacher>('teachers', id);
export const updateTeacher = async (id: string, teacherData: Partial<Teacher>): Promise<void> => updateDocument<Teacher>('teachers', id, teacherData);
export const deleteTeacher = async (id: string): Promise<void> => deleteDocument('teachers', id);
export const getTeachers = async (): Promise<Teacher[]> => getDocuments<Teacher>('teachers', undefined, 'firstName');
export const listenToTeachers = (onUpdate: (data: Teacher[]) => void) => listenToDocuments<Teacher>('teachers', onUpdate, undefined, 'firstName');
export const getTeacherByUserId = async (userId: string): Promise<Teacher | null> => {
  const teachers = await getDocuments<Teacher>('teachers', [{ field: 'userId', operator: '==', value: userId }]);
  return teachers.length > 0 ? teachers[0] : null;
};

// Class Management
export const createClass = async (classData: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => createDocument<Class>('classes', classData);
export const getClass = async (id: string): Promise<Class | null> => getDocument<Class>('classes', id);
export const updateClass = async (id: string, classData: Partial<Class>): Promise<void> => updateDocument<Class>('classes', id, classData);
export const deleteClass = async (id: string): Promise<void> => deleteDocument('classes', id);
export const getClasses = async (): Promise<Class[]> => getDocuments<Class>('classes', undefined, 'name');
export const listenToClasses = (onUpdate: (data: Class[]) => void) => listenToDocuments<Class>('classes', onUpdate, undefined, 'name');

// Subject Management
export const createSubject = async (subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => createDocument<Subject>('subjects', subjectData);
export const getSubject = async (id: string): Promise<Subject | null> => getDocument<Subject>('subjects', id);
export const updateSubject = async (id: string, subjectData: Partial<Subject>): Promise<void> => updateDocument<Subject>('subjects', id, subjectData);
export const deleteSubject = async (id: string): Promise<void> => deleteDocument('subjects', id);
export const getSubjects = async (): Promise<Subject[]> => getDocuments<Subject>('subjects', undefined, 'name');
export const listenToSubjects = (onUpdate: (data: Subject[]) => void) => listenToDocuments<Subject>('subjects', onUpdate, undefined, 'name');

// Fee Management
export const createFeeStructure = async (feeData: Omit<FeeStructure, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => createDocument<FeeStructure>('feeStructures', feeData);
export const getFeeStructure = async (id: string): Promise<FeeStructure | null> => getDocument<FeeStructure>('feeStructures', id);
export const updateFeeStructure = async (id: string, feeData: Partial<FeeStructure>): Promise<void> => updateDocument<FeeStructure>('feeStructures', id, feeData);
export const deleteFeeStructure = async (id: string): Promise<void> => deleteDocument('feeStructures', id);
export const getFeeStructures = async (): Promise<FeeStructure[]> => getDocuments<FeeStructure>('feeStructures', undefined, 'academicYear');
export const listenToFeeStructures = (onUpdate: (data: FeeStructure[]) => void) => listenToDocuments<FeeStructure>('feeStructures', onUpdate, undefined, 'academicYear');

// Academic Session Management
export const createAcademicSession = async (sessionData: Omit<AcademicSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => createDocument<AcademicSession>('academicSessions', sessionData);
export const getAcademicSession = async (id: string): Promise<AcademicSession | null> => getDocument<AcademicSession>('academicSessions', id);
export const updateAcademicSession = async (id: string, sessionData: Partial<AcademicSession>): Promise<void> => updateDocument<AcademicSession>('academicSessions', id, sessionData);
export const deleteAcademicSession = async (id: string): Promise<void> => deleteDocument('academicSessions', id);
export const getAcademicSessions = async (): Promise<AcademicSession[]> => getDocuments<AcademicSession>('academicSessions', undefined, 'startDate', 'desc');
export const listenToAcademicSessions = (onUpdate: (data: AcademicSession[]) => void) => listenToDocuments<AcademicSession>('academicSessions', onUpdate, undefined, 'startDate', 'desc');
export const getActiveAcademicSession = async (): Promise<AcademicSession | null> => {
  const sessions = await getDocuments<AcademicSession>('academicSessions', [{ field: 'isActive', operator: '==', value: true }]);
  return sessions.length > 0 ? sessions[0] : null;
};

// Assignment Management
export const createAssignment = async (assignmentData: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => createDocument<Assignment>('assignments', assignmentData);
export const getAssignment = async (id: string): Promise<Assignment | null> => getDocument<Assignment>('assignments', id);
export const updateAssignment = async (id: string, assignmentData: Partial<Assignment>): Promise<void> => updateDocument<Assignment>('assignments', id, assignmentData);
export const deleteAssignment = async (id: string): Promise<void> => deleteDocument('assignments', id);
export const getAssignments = async (classId?: string): Promise<Assignment[]> => getDocuments<Assignment>('assignments', classId ? [{ field: 'classId', operator: '==', value: classId }] : undefined, 'dueDate', 'desc');
export const listenToAssignments = (onUpdate: (data: Assignment[]) => void, classId?: string) => listenToDocuments<Assignment>('assignments', onUpdate, classId ? [{ field: 'classId', operator: '==', value: classId }] : undefined, 'dueDate', 'desc');

// Event Management
export const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => createDocument<Event>('events', eventData);
export const getEvent = async (id: string): Promise<Event | null> => getDocument<Event>('events', id);
export const updateEvent = async (id: string, eventData: Partial<Event>): Promise<void> => updateDocument<Event>('events', id, eventData);
export const deleteEvent = async (id: string): Promise<void> => deleteDocument('events', id);
export const getEvents = async (): Promise<Event[]> => getDocuments<Event>('events', undefined, 'date', 'desc');
export const listenToEvents = (onUpdate: (data: Event[]) => void) => listenToDocuments<Event>('events', onUpdate, undefined, 'date', 'desc');

// Attendance Management
export const createAttendanceRecord = async (attendanceData: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => createDocument<Attendance>('attendance', attendanceData);
export const getAttendanceRecord = async (id: string): Promise<Attendance | null> => getDocument<Attendance>('attendance', id);
export const updateAttendanceRecord = async (id: string, attendanceData: Partial<Attendance>): Promise<void> => updateDocument<Attendance>('attendance', id, attendanceData);
export const deleteAttendanceRecord = async (id: string): Promise<void> => deleteDocument('attendance', id);
export const getAttendanceRecords = async (classId?: string, date?: Date): Promise<Attendance[]> => {
  const conditions: Array<{ field: string; operator: any; value: any }> = [];
  if (classId) conditions.push({ field: 'classId', operator: '==', value: classId });
  if (date) conditions.push({ field: 'date', operator: '==', value: date });
  return getDocuments<Attendance>('attendance', conditions, 'date', 'desc');
};
export const listenToAttendanceRecords = (onUpdate: (data: Attendance[]) => void, classId?: string) => listenToDocuments<Attendance>('attendance', onUpdate, classId ? [{ field: 'classId', operator: '==', value: classId }] : undefined, 'date', 'desc');

// Results Management
export const createResult = async (resultData: Omit<Result, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => createDocument<Result>('results', resultData);
export const getResult = async (id: string): Promise<Result | null> => getDocument<Result>('results', id);
export const updateResult = async (id: string, resultData: Partial<Result>): Promise<void> => updateDocument<Result>('results', id, resultData);
export const deleteResult = async (id: string): Promise<void> => deleteDocument('results', id);
export const getResults = async (classId?: string, term?: string): Promise<Result[]> => {
  const conditions: Array<{ field: string; operator: any; value: any }> = [];
  if (classId) conditions.push({ field: 'classId', operator: '==', value: classId });
  if (term) conditions.push({ field: 'term', operator: '==', value: term });
  return getDocuments<Result>('results', conditions, 'dateRecorded', 'desc');
};
export const listenToResults = (onUpdate: (data: Result[]) => void, classId?: string, term?: string) => {
  const conditions: Array<{ field: string; operator: any; value: any }> = [];
  if (classId) conditions.push({ field: 'classId', operator: '==', value: classId });
  if (term) conditions.push({ field: 'term', operator: '==', value: term });
  return listenToDocuments<Result>('results', onUpdate, conditions, 'dateRecorded', 'desc');
};

// Payments Management
export const createPayment = async (paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'> & { recordedBy?: string }): Promise<string> =>
  createDocument<Payment>('payments', paymentData as any);

export const getPayment = async (id: string): Promise<Payment | null> => getDocument<Payment>('payments', id);

export const updatePayment = async (id: string, paymentData: Partial<Payment>): Promise<void> => updateDocument<Payment>('payments', id, paymentData);

export const deletePayment = async (id: string): Promise<void> => deleteDocument('payments', id);

export const getPayments = async (filters?: { studentId?: string; feeStructureId?: string; status?: string }): Promise<Payment[]> => {
  const conditions: Array<{ field: string; operator: any; value: any }> = [];
  if (filters?.studentId) conditions.push({ field: 'studentId', operator: '==', value: filters.studentId });
  if (filters?.feeStructureId) conditions.push({ field: 'feeStructureId', operator: '==', value: filters.feeStructureId });
  if (filters?.status) conditions.push({ field: 'status', operator: '==', value: filters.status });
  return getDocuments<Payment>('payments', conditions, 'paymentDate', 'desc');
};

export const listenToPayments = (
  onUpdate: (data: Payment[]) => void,
  filters?: { studentId?: string; feeStructureId?: string; status?: string }
) => {
  const conditions: Array<{ field: string; operator: any; value: any }> = [];
  if (filters?.studentId) conditions.push({ field: 'studentId', operator: '==', value: filters.studentId });
  if (filters?.feeStructureId) conditions.push({ field: 'feeStructureId', operator: '==', value: filters.feeStructureId });
  if (filters?.status) conditions.push({ field: 'status', operator: '==', value: filters.status });
  return listenToDocuments<Payment>('payments', onUpdate, conditions, 'paymentDate', 'desc');
};

// Utilities
export const convertTimestampToDate = (timestamp: Timestamp | null): Date | null => (timestamp ? timestamp.toDate() : null);
export const convertDateToTimestamp = (date: Date | null): Timestamp | null => (date ? Timestamp.fromDate(date) : null);

// Statistics
export const getStudentCount = async (): Promise<number> => (await getStudents()).length;
export const getTeacherCount = async (): Promise<number> => (await getTeachers()).length;
export const getClassCount = async (): Promise<number> => (await getClasses()).length;
export const getActiveStudentsCount = async (): Promise<number> => (await getDocuments<Student>('students', [{ field: 'isActive', operator: '==', value: true }])).length; 