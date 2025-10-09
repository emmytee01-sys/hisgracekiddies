import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Migration script to update all student records
 * Changes class names from "Basic X" to "Primary X"
 * Also updates academicClassAdmitted field
 */
export const migrateBasicToPrimary = async () => {
  try {
    console.log('Starting migration: Basic → Primary...');
    
    // Get all students
    const studentsRef = collection(db, 'students');
    const studentsSnapshot = await getDocs(studentsRef);
    
    let updatedCount = 0;
    let errorCount = 0;
    const updates: Promise<void>[] = [];
    
    studentsSnapshot.forEach((studentDoc) => {
      const studentData = studentDoc.data();
      const studentId = studentDoc.id;
      let needsUpdate = false;
      const updateData: any = {};
      
      // Check and update class field
      if (studentData.class && typeof studentData.class === 'string') {
        const updatedClass = studentData.class.replace(/Basic\s+(\d+)/gi, 'Primary $1');
        if (updatedClass !== studentData.class) {
          updateData.class = updatedClass;
          needsUpdate = true;
          console.log(`  - ${studentData.firstName} ${studentData.lastName}: "${studentData.class}" → "${updatedClass}"`);
        }
      }
      
      // Check and update academicClassAdmitted field
      if (studentData.academicClassAdmitted && typeof studentData.academicClassAdmitted === 'string') {
        const updatedAcademicClass = studentData.academicClassAdmitted.replace(/Basic\s+(\d+)/gi, 'Primary $1');
        if (updatedAcademicClass !== studentData.academicClassAdmitted) {
          updateData.academicClassAdmitted = updatedAcademicClass;
          needsUpdate = true;
          console.log(`  - ${studentData.firstName} ${studentData.lastName}: Academic class "${studentData.academicClassAdmitted}" → "${updatedAcademicClass}"`);
        }
      }
      
      // If updates are needed, add to batch
      if (needsUpdate) {
        const updatePromise = updateDoc(doc(db, 'students', studentId), updateData)
          .then(() => {
            updatedCount++;
          })
          .catch((error) => {
            console.error(`Error updating student ${studentId}:`, error);
            errorCount++;
          });
        
        updates.push(updatePromise);
      }
    });
    
    // Wait for all updates to complete
    await Promise.all(updates);
    
    console.log('\n✅ Migration completed!');
    console.log(`  - Total students processed: ${studentsSnapshot.size}`);
    console.log(`  - Students updated: ${updatedCount}`);
    console.log(`  - Errors: ${errorCount}`);
    
    return {
      success: true,
      totalProcessed: studentsSnapshot.size,
      updated: updatedCount,
      errors: errorCount,
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

/**
 * Migration script to update all class records
 * Changes class names from "Basic X" to "Primary X"
 */
export const migrateClassesBasicToPrimary = async () => {
  try {
    console.log('Starting class migration: Basic → Primary...');
    
    // Get all classes
    const classesRef = collection(db, 'classes');
    const classesSnapshot = await getDocs(classesRef);
    
    let updatedCount = 0;
    let errorCount = 0;
    const updates: Promise<void>[] = [];
    
    classesSnapshot.forEach((classDoc) => {
      const classData = classDoc.data();
      const classId = classDoc.id;
      
      // Check and update name field
      if (classData.name && typeof classData.name === 'string') {
        const updatedName = classData.name.replace(/Basic\s+(\d+)/gi, 'Primary $1');
        if (updatedName !== classData.name) {
          console.log(`  - Class: "${classData.name}" → "${updatedName}"`);
          
          const updatePromise = updateDoc(doc(db, 'classes', classId), {
            name: updatedName,
          })
            .then(() => {
              updatedCount++;
            })
            .catch((error) => {
              console.error(`Error updating class ${classId}:`, error);
              errorCount++;
            });
          
          updates.push(updatePromise);
        }
      }
    });
    
    // Wait for all updates to complete
    await Promise.all(updates);
    
    console.log('\n✅ Class migration completed!');
    console.log(`  - Total classes processed: ${classesSnapshot.size}`);
    console.log(`  - Classes updated: ${updatedCount}`);
    console.log(`  - Errors: ${errorCount}`);
    
    return {
      success: true,
      totalProcessed: classesSnapshot.size,
      updated: updatedCount,
      errors: errorCount,
    };
    
  } catch (error) {
    console.error('❌ Class migration failed:', error);
    throw error;
  }
};

/**
 * Migration script to update subject records
 * Updates classes array to change "Basic X" to "Primary X"
 */
export const migrateSubjectsBasicToPrimary = async () => {
  try {
    console.log('Starting subject migration: Basic → Primary...');
    
    // Get all subjects
    const subjectsRef = collection(db, 'subjects');
    const subjectsSnapshot = await getDocs(subjectsRef);
    
    let updatedCount = 0;
    let errorCount = 0;
    const updates: Promise<void>[] = [];
    
    subjectsSnapshot.forEach((subjectDoc) => {
      const subjectData = subjectDoc.data();
      const subjectId = subjectDoc.id;
      
      // Check and update classes array
      if (subjectData.classes && Array.isArray(subjectData.classes)) {
        const updatedClasses = subjectData.classes.map((className: string) => 
          className.replace(/Basic\s+(\d+)/gi, 'Primary $1')
        );
        
        const hasChanges = subjectData.classes.some((className: string, index: number) => 
          className !== updatedClasses[index]
        );
        
        if (hasChanges) {
          console.log(`  - Subject "${subjectData.name}": classes updated`);
          
          const updatePromise = updateDoc(doc(db, 'subjects', subjectId), {
            classes: updatedClasses,
          })
            .then(() => {
              updatedCount++;
            })
            .catch((error) => {
              console.error(`Error updating subject ${subjectId}:`, error);
              errorCount++;
            });
          
          updates.push(updatePromise);
        }
      }
    });
    
    // Wait for all updates to complete
    await Promise.all(updates);
    
    console.log('\n✅ Subject migration completed!');
    console.log(`  - Total subjects processed: ${subjectsSnapshot.size}`);
    console.log(`  - Subjects updated: ${updatedCount}`);
    console.log(`  - Errors: ${errorCount}`);
    
    return {
      success: true,
      totalProcessed: subjectsSnapshot.size,
      updated: updatedCount,
      errors: errorCount,
    };
    
  } catch (error) {
    console.error('❌ Subject migration failed:', error);
    throw error;
  }
};

/**
 * Run all migrations
 */
export const runAllMigrations = async () => {
  console.log('═══════════════════════════════════════════════');
  console.log('  DATABASE MIGRATION: Basic → Primary');
  console.log('═══════════════════════════════════════════════\n');
  
  try {
    // Migrate students
    const studentsResult = await migrateBasicToPrimary();
    console.log('\n');
    
    // Migrate classes
    const classesResult = await migrateClassesBasicToPrimary();
    console.log('\n');
    
    // Migrate subjects
    const subjectsResult = await migrateSubjectsBasicToPrimary();
    console.log('\n');
    
    console.log('═══════════════════════════════════════════════');
    console.log('  MIGRATION SUMMARY');
    console.log('═══════════════════════════════════════════════');
    console.log(`Students: ${studentsResult.updated}/${studentsResult.totalProcessed} updated`);
    console.log(`Classes: ${classesResult.updated}/${classesResult.totalProcessed} updated`);
    console.log(`Subjects: ${subjectsResult.updated}/${subjectsResult.totalProcessed} updated`);
    console.log(`Total Errors: ${studentsResult.errors + classesResult.errors + subjectsResult.errors}`);
    console.log('═══════════════════════════════════════════════\n');
    
    return {
      success: true,
      students: studentsResult,
      classes: classesResult,
      subjects: subjectsResult,
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

