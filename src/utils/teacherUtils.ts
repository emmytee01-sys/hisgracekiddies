import { useAuth } from '../contexts/AuthContext';
import { Student, Class, Attendance, Assignment, Result } from '../types';

// Get teacher's assigned class
export const useTeacherClass = () => {
  const { userProfile } = useAuth();
  
  // Mock data - in real app, this would come from Firebase
  const classes: Class[] = [
    {
      id: '1',
      name: 'Primary 5',
      section: '',
      capacity: 30,
      currentEnrollment: 25,
      teacherId: 'demo-teacher-1',
      subjects: ['Mathematics', 'English', 'Science', 'Social Studies'],
      academicYear: '2023-2024',
      isActive: true,
      createdAt: new Date('2023-09-01'),
    },
  ];

  const assignedClass = classes.find(cls => cls.teacherId === userProfile?.id);
  return assignedClass;
};

// Filter students by teacher's assigned class
export const filterStudentsByTeacher = (students: Student[], teacherId: string, classes: Class[]) => {
  const teacherClass = classes.find(cls => cls.teacherId === teacherId);
  if (!teacherClass) return [];
  
  return students.filter(student => student.class === teacherClass.name);
};

// Filter attendance by teacher's assigned class
export const filterAttendanceByTeacher = (attendance: Attendance[], teacherId: string, classes: Class[]) => {
  const teacherClass = classes.find(cls => cls.teacherId === teacherId);
  if (!teacherClass) return [];
  
  return attendance.filter(att => att.classId === teacherClass.name);
};

// Filter assignments by teacher's assigned class
export const filterAssignmentsByTeacher = (assignments: Assignment[], teacherId: string, classes: Class[]) => {
  const teacherClass = classes.find(cls => cls.teacherId === teacherId);
  if (!teacherClass) return [];
  
  return assignments.filter(assign => assign.classId === teacherClass.name);
};

// Filter results by teacher's assigned class
export const filterResultsByTeacher = (results: Result[], teacherId: string, classes: Class[]) => {
  const teacherClass = classes.find(cls => cls.teacherId === teacherId);
  if (!teacherClass) return [];
  
  return results.filter(result => result.classId === teacherClass.name);
};

// Get class options for Nigerian school system
export const getClassOptions = () => [
  'Primary 1',
  'Primary 2', 
  'Primary 3',
  'Primary 4',
  'Primary 5',
  'Nursery 1',
  'Nursery 2',
  'KG 1',
  'KG 2',
  'Playgroup',
  'Creche'
]; 