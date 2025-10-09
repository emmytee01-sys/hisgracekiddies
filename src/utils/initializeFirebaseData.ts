import {
  createStudent,
  createClass,
  createAcademicSession,
  createTeacher,
  createSubject,
} from '../services/firebaseService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const initializeSampleData = async () => {
  try {
    console.log('Starting Firebase data initialization...');

    // Create admin user profile for existing Firebase Auth user
    const adminUser = {
      id: 'sBTLRu4wo8cv826uS11v1j1Zl3o1', // Your actual UID
      firstName: 'Admin',
      lastName: 'User',
      email: 'tosinoke0@gmail.com',
      role: 'admin' as const,
      isActive: true,
      createdAt: new Date(),
    };

    console.log('Creating admin user profile...');
    await setDoc(doc(db, 'users', adminUser.id), adminUser);

    // Create sample class
    const primary1Class = {
      name: 'Primary 1',
      section: '',
      teacherId: '',
      subjects: [],
      capacity: 30,
      currentEnrollment: 0,
      academicYear: '2023-2024',
      isActive: true,
    };

    console.log('Creating classes...');
    await createClass(primary1Class);
    
    // Create more sample classes
    const classes = [
      {
        name: 'Primary 2',
        section: '',
        teacherId: '',
        subjects: [],
        capacity: 30,
        currentEnrollment: 0,
        academicYear: '2023-2024',
        isActive: true,
      },
      {
        name: 'Primary 3',
        section: '',
        teacherId: '',
        subjects: [],
        capacity: 30,
        currentEnrollment: 0,
        academicYear: '2023-2024',
        isActive: true,
      },
      {
        name: 'Nursery 1',
        section: '',
        teacherId: '',
        subjects: [],
        capacity: 25,
        currentEnrollment: 0,
        academicYear: '2023-2024',
        isActive: true,
      },
      {
        name: 'KG 1',
        section: '',
        teacherId: '',
        subjects: [],
        capacity: 25,
        currentEnrollment: 0,
        academicYear: '2023-2024',
        isActive: true,
      }
    ];
    
    for (const classData of classes) {
      await createClass(classData);
    }
    
    // Create sample teachers
    console.log('Creating teachers...');
    const teachers = [
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@hisgraceacademy.com',
        phoneNumber: '+2348012345679',
        assignedClassId: '', // Will be assigned later
        qualification: 'B.Ed Primary Education',
        hireDate: new Date('2023-01-15'),
        isActive: true,
      },
      {
        firstName: 'Michael',
        lastName: 'Williams',
        email: 'michael.williams@hisgraceacademy.com',
        phoneNumber: '+2348012345680',
        assignedClassId: '', // Will be assigned later
        qualification: 'M.Ed Curriculum Studies',
        hireDate: new Date('2023-02-01'),
        isActive: true,
      }
    ];
    
    for (const teacherData of teachers) {
      await createTeacher(teacherData);
    }
    
    // Create sample subjects
    console.log('Creating subjects...');
    const subjects = [
      {
        name: 'Mathematics',
        code: 'MATH',
        description: 'Primary mathematics for primary school',
        teacherId: '', // Will be assigned when teachers are assigned to classes
        classes: ['Primary 1', 'Primary 2', 'Primary 3'],
        credits: 1,
        isActive: true,
      },
      {
        name: 'English Language',
        code: 'ENG',
        description: 'English language and literature',
        teacherId: '', // Will be assigned when teachers are assigned to classes
        classes: ['Primary 1', 'Primary 2', 'Primary 3', 'Nursery 1', 'KG 1'],
        credits: 1,
        isActive: true,
      },
      {
        name: 'Science',
        code: 'SCI',
        description: 'Primary science for primary school',
        teacherId: '', // Will be assigned when teachers are assigned to classes
        classes: ['Primary 1', 'Primary 2', 'Primary 3'],
        credits: 1,
        isActive: true,
      },
      {
        name: 'Social Studies',
        code: 'SOS',
        description: 'Social studies and citizenship',
        teacherId: '', // Will be assigned when teachers are assigned to classes
        classes: ['Primary 1', 'Primary 2', 'Primary 3'],
        credits: 1,
        isActive: true,
      }
    ];
    
    for (const subjectData of subjects) {
      await createSubject(subjectData);
    }

    // Create sample student
    const student1 = {
      admissionNumber: 'HGKA/1001',
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'Michael',
      dateOfBirth: new Date('2015-03-15'),
      gender: 'male' as const,
      class: 'Primary 1',
      section: '',
      parentId: 'parent1',
      address: '123 Main Street, Lagos',
      phoneNumber: '+2348012345678',
      profileImage: '',
      admissionDate: new Date('2023-09-01'),
      isActive: true,
      religion: 'Christianity',
      nationality: 'Nigerian',
      stateOfOrigin: 'Lagos',
      lgaOfOrigin: 'Ikeja',
      homeTown: 'Lagos',
      languageSpoken: 'English',
      sponsorName: 'Mr. John Doe',
      sponsorRelationship: 'Father',
      sponsorAddress: '123 Main Street, Lagos',
      sponsorPhone: '+2348012345678',
      sponsorEmail: 'john.doe@email.com',
      sponsorOccupation: 'Engineer',
      sponsorPhoto: '',
      bloodGroup: 'O+',
      genotype: 'AA',
      disability: 'None',
      academicSessionAdmitted: '2023-2024',
      academicTermAdmitted: '1st Term',
      academicClassAdmitted: 'Primary 1',
    };

    console.log('Creating student...');
    await createStudent(student1);

    // Create sample academic session
    const academicSession = {
      name: '2023-2024 Academic Session',
      startDate: new Date('2023-09-01'),
      endDate: new Date('2024-07-19'),
      isActive: true,
      currentTerm: 'First Term' as const,
      terms: {
        first: { startDate: new Date('2023-09-01'), endDate: new Date('2023-12-15') },
        second: { startDate: new Date('2024-01-08'), endDate: new Date('2024-04-05') },
        third: { startDate: new Date('2024-04-22'), endDate: new Date('2024-07-19') },
      },
    };

    console.log('Creating academic session...');
    await createAcademicSession(academicSession);

    console.log('✅ Firebase data initialization completed successfully!');

  } catch (error) {
    console.error('❌ Error initializing Firebase data:', error);
    throw error;
  }
};

export const checkDataExists = async () => {
  try {
    const { getUsers, getStudents } = await import('../services/firebaseService');
    
    const users = await getUsers();
    const students = await getStudents();
    
    return {
      hasUsers: users.length > 0,
      hasStudents: students.length > 0,
      totalUsers: users.length,
      totalStudents: students.length,
    };
  } catch (error) {
    console.error('Error checking data existence:', error);
    return {
      hasUsers: false,
      hasStudents: false,
      totalUsers: 0,
      totalStudents: 0,
    };
  }
}; 