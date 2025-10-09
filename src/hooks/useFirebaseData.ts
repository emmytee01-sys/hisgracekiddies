import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

interface UseFirebaseDataOptions<T> {
  onSuccess?: (data: T[]) => void;
  onError?: (error: Error) => void;
  autoLoad?: boolean;
}

interface UseFirebaseDataReturn<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  addItem: (item: any) => Promise<void>;
  updateItem: (id: string, item: Partial<T>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const useFirebaseData = <T>(
  fetchFunction: () => Promise<T[]>,
  createFunction: (item: any) => Promise<string>,
  updateFunction: (id: string, item: Partial<T>) => Promise<void>,
  deleteFunction: (id: string) => Promise<void>,
  options: UseFirebaseDataOptions<T> = {}
): UseFirebaseDataReturn<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { onSuccess, onError, autoLoad = true } = options;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      onError?.(error);
      toast.error(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, onSuccess, onError]);

  const addItem = useCallback(async (item: any) => {
    try {
      await createFunction(item);
      await loadData();
      toast.success('Item added successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add item');
      toast.error(`Failed to add item: ${error.message}`);
      throw error;
    }
  }, [createFunction, loadData]);

  const updateItem = useCallback(async (id: string, item: Partial<T>) => {
    try {
      await updateFunction(id, item);
      await loadData();
      toast.success('Item updated successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update item');
      toast.error(`Failed to update item: ${error.message}`);
      throw error;
    }
  }, [updateFunction, loadData]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      await deleteFunction(id);
      await loadData();
      toast.success('Item deleted successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete item');
      toast.error(`Failed to delete item: ${error.message}`);
      throw error;
    }
  }, [deleteFunction, loadData]);

  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [loadData, autoLoad]);

  return {
    data,
    loading,
    error,
    refresh: loadData,
    addItem,
    updateItem,
    deleteItem,
  };
};

// Realtime variant
export const useRealtimeCollection = <T>(
  listenFunction: (onUpdate: (data: T[]) => void) => Promise<() => void> | (() => void),
  options: { onError?: (error: Error) => void } = {}
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    const setupListener = async () => {
      try {
        const result = listenFunction((items) => {
          setData(items);
          setLoading(false);
        });
        
        if (result instanceof Promise) {
          unsubRef.current = await result;
        } else {
          unsubRef.current = result;
        }
      } catch (err) {
        const e = err instanceof Error ? err : new Error('Unknown error');
        setError(e);
        options.onError?.(e);
        setLoading(false);
      }
    };
    
    setupListener();
    
    return () => {
      if (unsubRef.current) {
        unsubRef.current();
      }
    };
  }, [listenFunction, options]);

  return { data, loading, error };
};

// Specific hooks for different data types (unchanged below)
export const useStudents = (classId?: string) => {
  const fetchFunction = useCallback(
    () => import('../services/firebaseService').then(m => m.getStudents(classId)),
    [classId]
  );
  const createFunction = useCallback(
    (student: any) => import('../services/firebaseService').then(m => m.createStudent(student)),
    []
  );
  const updateFunction = useCallback(
    (id: string, student: any) => import('../services/firebaseService').then(m => m.updateStudent(id, student)),
    []
  );
  const deleteFunction = useCallback(
    (id: string) => import('../services/firebaseService').then(m => m.deleteStudent(id)),
    []
  );

  return useFirebaseData(fetchFunction, createFunction, updateFunction, deleteFunction);
};

export const useStudentsRealtime = (classId?: string) =>
  useRealtimeCollection((onUpdate) => import('../services/firebaseService').then(m => m.listenToStudents(onUpdate, classId)));

export const useTeachers = () => {
  const fetchFunction = useCallback(
    () => import('../services/firebaseService').then(m => m.getTeachers()),
    []
  );
  const createFunction = useCallback(
    (teacher: any) => import('../services/firebaseService').then(m => m.createTeacher(teacher)),
    []
  );
  const updateFunction = useCallback(
    (id: string, teacher: any) => import('../services/firebaseService').then(m => m.updateTeacher(id, teacher)),
    []
  );
  const deleteFunction = useCallback(
    (id: string) => import('../services/firebaseService').then(m => m.deleteTeacher(id)),
    []
  );

  return useFirebaseData(fetchFunction, createFunction, updateFunction, deleteFunction);
};

export const useTeachersRealtime = () =>
  useRealtimeCollection((onUpdate) => import('../services/firebaseService').then(m => m.listenToTeachers(onUpdate)));

export const useClasses = () => {
  const fetchFunction = useCallback(
    () => import('../services/firebaseService').then(m => m.getClasses()),
    []
  );
  const createFunction = useCallback(
    (classData: any) => import('../services/firebaseService').then(m => m.createClass(classData)),
    []
  );
  const updateFunction = useCallback(
    (id: string, classData: any) => import('../services/firebaseService').then(m => m.updateClass(id, classData)),
    []
  );
  const deleteFunction = useCallback(
    (id: string) => import('../services/firebaseService').then(m => m.deleteClass(id)),
    []
  );

  return useFirebaseData(fetchFunction, createFunction, updateFunction, deleteFunction);
};

export const useClassesRealtime = () =>
  useRealtimeCollection((onUpdate) => import('../services/firebaseService').then(m => m.listenToClasses(onUpdate)));

export const useSubjects = () => {
  return useFirebaseData(
    () => import('../services/firebaseService').then(m => m.getSubjects()),
    (subject) => import('../services/firebaseService').then(m => m.createSubject(subject)),
    (id, subject) => import('../services/firebaseService').then(m => m.updateSubject(id, subject)),
    (id) => import('../services/firebaseService').then(m => m.deleteSubject(id))
  );
};

export const useSubjectsRealtime = () =>
  useRealtimeCollection((onUpdate) => import('../services/firebaseService').then(m => m.listenToSubjects(onUpdate)));

export const useUsers = (role?: string) => {
  return useFirebaseData(
    () => import('../services/firebaseService').then(m => m.getUsers(role)),
    (user) => import('../services/firebaseService').then(m => m.createUser(user)),
    (id, user) => import('../services/firebaseService').then(m => m.updateUser(id, user)),
    (id) => import('../services/firebaseService').then(m => m.deleteUser(id))
  );
};

export const useUsersRealtime = () =>
  useRealtimeCollection((onUpdate) => import('../services/firebaseService').then(m => m.listenToUsers(onUpdate)));

export const useFeeStructures = () => {
  return useFirebaseData(
    () => import('../services/firebaseService').then(m => m.getFeeStructures()),
    (feeStructure) => import('../services/firebaseService').then(m => m.createFeeStructure(feeStructure)),
    (id, feeStructure) => import('../services/firebaseService').then(m => m.updateFeeStructure(id, feeStructure)),
    (id) => import('../services/firebaseService').then(m => m.deleteFeeStructure(id))
  );
};

export const useFeeStructuresRealtime = () =>
  useRealtimeCollection((onUpdate) => import('../services/firebaseService').then(m => m.listenToFeeStructures(onUpdate)));

export const useAcademicSessions = () => {
  return useFirebaseData(
    () => import('../services/firebaseService').then(m => m.getAcademicSessions()),
    (session) => import('../services/firebaseService').then(m => m.createAcademicSession(session)),
    (id, session) => import('../services/firebaseService').then(m => m.updateAcademicSession(id, session)),
    (id) => import('../services/firebaseService').then(m => m.deleteAcademicSession(id))
  );
};

export const useAcademicSessionsRealtime = () =>
  useRealtimeCollection((onUpdate) => import('../services/firebaseService').then(m => m.listenToAcademicSessions(onUpdate)));

export const useAssignmentsRealtime = (classId?: string) =>
  useRealtimeCollection((onUpdate) => import('../services/firebaseService').then(m => m.listenToAssignments(onUpdate, classId)));

export const useEventsRealtime = () =>
  useRealtimeCollection((onUpdate) => import('../services/firebaseService').then(m => m.listenToEvents(onUpdate)));

export const useAttendanceRealtime = (classId?: string) =>
  useRealtimeCollection((onUpdate) => import('../services/firebaseService').then(m => m.listenToAttendanceRecords(onUpdate, classId)));

export const useResultsRealtime = (classId?: string, term?: string) =>
  useRealtimeCollection((onUpdate) => import('../services/firebaseService').then(m => m.listenToResults(onUpdate, classId, term))); 

export const useAssignments = (classId?: string) => {
  return useFirebaseData(
    () => import('../services/firebaseService').then(m => m.getAssignments(classId)),
    (assignment) => import('../services/firebaseService').then(m => m.createAssignment(assignment)),
    (id, assignment) => import('../services/firebaseService').then(m => m.updateAssignment(id, assignment)),
    (id) => import('../services/firebaseService').then(m => m.deleteAssignment(id))
  );
};

export const useEvents = () => {
  return useFirebaseData(
    () => import('../services/firebaseService').then(m => m.getEvents()),
    (event) => import('../services/firebaseService').then(m => m.createEvent(event)),
    (id, event) => import('../services/firebaseService').then(m => m.updateEvent(id, event)),
    (id) => import('../services/firebaseService').then(m => m.deleteEvent(id))
  );
};

export const useAttendanceRecords = (classId?: string, date?: Date) => {
  return useFirebaseData(
    () => import('../services/firebaseService').then(m => m.getAttendanceRecords(classId, date)),
    (record) => import('../services/firebaseService').then(m => m.createAttendanceRecord(record)),
    (id, record) => import('../services/firebaseService').then(m => m.updateAttendanceRecord(id, record)),
    (id) => import('../services/firebaseService').then(m => m.deleteAttendanceRecord(id))
  );
};

export const useResults = (classId?: string, term?: string) => {
  return useFirebaseData(
    () => import('../services/firebaseService').then(m => m.getResults(classId, term)),
    (result) => import('../services/firebaseService').then(m => m.createResult(result)),
    (id, result) => import('../services/firebaseService').then(m => m.updateResult(id, result)),
    (id) => import('../services/firebaseService').then(m => m.deleteResult(id))
  );
}; 

export const usePayments = (filters?: { studentId?: string; feeStructureId?: string; status?: string }) => {
  return useFirebaseData(
    () => import('../services/firebaseService').then(m => m.getPayments(filters)),
    (payment) => import('../services/firebaseService').then(m => m.createPayment(payment)),
    (id, payment) => import('../services/firebaseService').then(m => m.updatePayment(id, payment)),
    (id) => import('../services/firebaseService').then(m => m.deletePayment(id))
  );
};

export const usePaymentsRealtime = (filters?: { studentId?: string; feeStructureId?: string; status?: string }) =>
  useRealtimeCollection((onUpdate) => import('../services/firebaseService').then(m => m.listenToPayments(onUpdate, filters))); 