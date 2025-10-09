# His Grace Kiddies Academy - School Management System

A comprehensive school management software built with React TypeScript and Firebase, designed to automate and manage academic, administrative, and financial activities for primary and secondary schools.

## 🏫 Overview

This software is an all-in-one solution designed to streamline operations for school owners, administrators, teachers, parents, and students. It provides role-based access control with different features for each user type.

## 🎨 Design System

- **Color Scheme**: Blue (#1976d2), White, and Black
- **UI Framework**: Material-UI (MUI) with custom theme
- **Responsive Design**: Mobile-first approach
- **Modern UX**: Clean, intuitive interface with smooth animations

## 👥 User Roles and Access Rights

### 1. Admin
- Full system control
- Create/manage users and roles
- Assign classes, subjects, and teachers
- View school-wide reports and analytics

### 2. Teacher
- Manage class attendance
- Record student scores
- Post assignments
- Access class timetable and teaching schedule

### 3. Secretary
- Student record and admission management
- Generate receipts and invoices
- Schedule school calendar and events

### 4. Proprietor/Owner
- Monitor school operations
- View financial summaries
- Track academic performance statistics
- Approve promotions and staff payroll

### 5. Parent
- View child's results and attendance
- Make school fee payments
- Receive notifications and updates
- Download report cards

### 6. Student/Pupil
- Access results
- Submit assignments
- View timetable
- Get school announcements

## 🧩 Core Modules

### 1. Student Registration
- Manual or bulk import
- Assign unique admission number
- Attach documents and passport
- Assign class and section

### 2. Fee Management
- Define fees per term/session/class
- Automated invoice generation
- Online/offline payments
- Track payment history
- Fee defaulters reporting

### 3. ID Card Generation
- Auto-generate student/staff ID cards
- Print with school logo and barcode/QR

### 4. Promotion Module
- Auto-check promotion eligibility
- Promote based on result/marks
- End-of-session promotion tool

### 5. Academic Sessions and Terms
- Each session has 3 terms
- Manage current/archived sessions
- Auto-reset term for new grading

### 6. Online Result Checking with Card/Token
- Generate unique result-checking tokens
- Parent/student can check result via portal or mobile app
- Show grades, teacher comments, attendance

### 7. Profiles
- **Parent Profile**: Linked to multiple wards, contact info, transaction history
- **Student Profile**: Bio-data, academic records, fee status
- **Admin Profile**: Dashboard with metrics, role control

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hisgrace-school-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a new Firebase project
   - Enable Authentication, Firestore Database, and Storage
   - Copy your Firebase config to `src/firebase/config.ts`

4. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

The application will open at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── LoginPage.tsx   # Authentication page
│   ├── Dashboard.tsx   # Main dashboard
│   └── ProtectedRoute.tsx # Route protection
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── firebase/           # Firebase configuration
│   └── config.ts       # Firebase setup
├── theme/              # Material-UI theme
│   └── index.ts        # Custom theme configuration
├── types/              # TypeScript type definitions
│   └── index.ts        # Interface definitions
├── App.tsx             # Main app component
└── index.tsx           # Entry point
```

## 🔧 Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **React Hook Form** - Form handling
- **React Query** - Data fetching
- **Recharts** - Data visualization

### Backend
- **Firebase Authentication** - User authentication
- **Firestore Database** - NoSQL database
- **Firebase Storage** - File storage
- **Firebase Security Rules** - Data security

### Development Tools
- **Create React App** - Build tool
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🔐 Security Features

- Role-based access control (RBAC)
- Protected routes
- Firebase security rules
- Input validation
- XSS protection

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🎯 Key Features

### Authentication & Authorization
- Secure login with email/password
- Role-based access control
- Session management
- Password visibility toggle

### Dashboard
- Role-specific dashboard views
- Real-time statistics
- Quick access to common actions
- Responsive navigation

### User Management
- Create and manage user accounts
- Assign roles and permissions
- Profile management
- Activity tracking

## 🔄 State Management

- React Context for authentication
- Local state for component-specific data
- Firebase real-time updates

## 📊 Data Visualization

- Charts and graphs for analytics
- Progress tracking
- Performance metrics
- Financial reports

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- Mobile app development
- Advanced analytics
- AI-powered insights
- Integration with external systems
- Multi-language support
- Advanced reporting features

---

**Built with ❤️ for His Grace Kiddies Academy** 