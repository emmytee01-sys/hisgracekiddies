# Setup Guide - His Grace Kiddies Academy

## Firebase Configuration

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "hisgrace-school-management"
4. Follow the setup wizard

### 2. Enable Firebase Services

#### Authentication
1. Go to Authentication > Sign-in method
2. Enable Email/Password authentication
3. Add your first admin user

#### Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select a location close to your users

#### Storage
1. Go to Storage
2. Click "Get started"
3. Choose "Start in test mode" for development

### 3. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" > Web app
4. Register app and copy the configuration

### 4. Environment Variables

Create a `.env` file in the root directory with your Firebase configuration:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Application Configuration
REACT_APP_SCHOOL_NAME=His Grace Kiddies Academy
REACT_APP_SCHOOL_ADDRESS=Lagos, Nigeria
REACT_APP_SCHOOL_PHONE=+2348012345678
REACT_APP_SCHOOL_EMAIL=info@hisgraceacademy.com
```

### 5. Update Firebase Config

Update `src/firebase/config.ts` with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

## Initial Data Setup

### 1. Create Admin User

1. Go to Firebase Authentication
2. Add a new user with email and password
3. This will be your admin account

### 2. Create User Profile

In Firestore, create a document in the `users` collection:

```json
{
  "id": "admin-user-id",
  "email": "admin@hisgraceacademy.com",
  "role": "admin",
  "firstName": "Admin",
  "lastName": "User",
  "phoneNumber": "+2348012345678",
  "isActive": true,
  "createdAt": "2023-10-15T10:00:00Z"
}
```

### 3. Firestore Security Rules

Update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admin can read/write all documents
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Teachers can read/write their class data
    match /students/{studentId} {
      allow read, write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher');
    }
    
    // Parents can read their children's data
    match /students/{studentId} {
      allow read: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'parent' &&
         resource.data.parentId == request.auth.uid);
    }
  }
}
```

## Running the Application

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`

### 3. Login

Use the admin credentials you created in Firebase Authentication.

## Default User Roles

- **Admin**: Full system access
- **Teacher**: Manage classes, attendance, results
- **Secretary**: Student records, fee management
- **Proprietor**: Financial reports, operations monitoring
- **Parent**: View child's progress, make payments
- **Student**: View results, assignments

## Features Available

### Admin
- User management
- System configuration
- All module access

### Teacher
- Student management
- Attendance tracking
- Results recording
- Assignment management

### Secretary
- Student registration
- Fee management
- Document management

### Parent
- View child's results
- Fee payments
- Communication

### Student
- View results
- Submit assignments
- View timetable

## Troubleshooting

### Common Issues

1. **Firebase connection error**: Check your Firebase configuration
2. **Authentication error**: Ensure user exists in Firebase Auth
3. **Permission denied**: Check Firestore security rules
4. **Build errors**: Clear node_modules and reinstall dependencies

### Support

For technical support, contact the development team or create an issue in the repository. 