import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

export interface UploadProgress {
  progress: number;
  downloadURL?: string;
  error?: string;
}

export const uploadFile = async (
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Create a storage reference
    const storageRef = ref(storage, path);
    
    // Create upload task
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Monitor upload progress
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => {
        // Handle upload errors
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        // Upload completed successfully
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          console.error('Error getting download URL:', error);
          reject(error);
        }
      }
    );
  });
};

export const uploadStudentPhoto = async (
  file: File,
  studentId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const path = `students/${studentId}/profile-photo/${file.name}`;
  return uploadFile(file, path, onProgress);
};

export const uploadSponsorPhoto = async (
  file: File,
  studentId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const path = `students/${studentId}/sponsor-photo/${file.name}`;
  return uploadFile(file, path, onProgress);
};

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select an image file' };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(fileExtension)) {
    return { isValid: false, error: 'Please select a valid image file (JPG, PNG, GIF, WebP)' };
  }

  return { isValid: true };
};

export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.substring(originalName.lastIndexOf('.'));
  return `${timestamp}_${randomString}${extension}`;
}; 