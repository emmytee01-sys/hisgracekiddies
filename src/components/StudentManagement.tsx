import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Divider,
  LinearProgress,
  CircularProgress,
  Paper,
  Container,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import ModernTable, { TableColumn, TableAction } from './common/ModernTable';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Block as BlockIcon,
  PhotoCamera as PhotoIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { Student } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { filterStudentsByTeacher, getClassOptions } from '../utils/teacherUtils';
import { uploadStudentPhoto, uploadSponsorPhoto, validateImageFile, generateUniqueFileName } from '../utils/fileUpload';
import { useStudents, useClassesRealtime, useAcademicSessionsRealtime } from '../hooks/useFirebaseData';

const StudentManagement: React.FC = () => {
  const { userProfile, hasRole } = useAuth();
  // Use Firebase data instead of mock data
  const { data: allStudents, loading, error, addItem, updateItem, deleteItem } = useStudents();
  const { data: classes, loading: classesLoading } = useClassesRealtime();
  const { data: academicSessions, loading: sessionsLoading } = useAcademicSessionsRealtime();

  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [classFilter, setClassFilter] = useState('');
  
  // Modal state for notifications
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning'>('success');

  // Helper function to show modal notifications
  const showModal = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setModalMessage(message);
    setModalType(type);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  // Predefined class list
  const predefinedClasses = [
    'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5',
    'Creche', 'Reception class 2', 'Nursery 1', 'Nursery 2', 'Playgroup'
  ];

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteItem(studentId);
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleSaveStudent = async (studentData: Partial<Student>) => {
    try {
      if (editingStudent) {
        await updateItem(editingStudent.id, studentData);
        showModal('Student updated successfully', 'success');
      } else {
        // For new students, create the student first to get the ID, then update with photos
        const newStudentData = studentData as Omit<Student, 'id' | 'createdAt' | 'updatedAt'>;
        await addItem(newStudentData);
        showModal('Student registered successfully', 'success');
        
        // The student will be created and the data will be refreshed automatically
        // Photos will be handled in the form submission if they exist
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error saving student:', error);
      showModal('Error saving student. Please try again.', 'error');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  // Filter students based on user role
  const filteredStudents = hasRole(['teacher']) 
    ? filterStudentsByTeacher(allStudents as Student[], userProfile?.id || '', classes as any[])
    : allStudents;

  // Search and sort students
  const students = useMemo(() => {
    let result = [...filteredStudents];

    // Apply class filter
    if (classFilter) {
      result = result.filter(student => student.class === classFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(student => 
        student.firstName?.toLowerCase().includes(searchLower) ||
        student.lastName?.toLowerCase().includes(searchLower) ||
        student.admissionNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.admissionDate).getTime() - new Date(b.admissionDate).getTime());
        break;
      case 'class':
        result.sort((a, b) => (a.class || '').localeCompare(b.class || ''));
        break;
      case 'female':
        result.sort((a, b) => {
          if (a.gender === 'female' && b.gender !== 'female') return -1;
          if (a.gender !== 'female' && b.gender === 'female') return 1;
          return 0;
        });
        break;
      case 'male':
        result.sort((a, b) => {
          if (a.gender === 'male' && b.gender !== 'male') return -1;
          if (a.gender !== 'male' && b.gender === 'male') return 1;
          return 0;
        });
        break;
      case 'active':
        result.sort((a, b) => {
          if (a.isActive && !b.isActive) return -1;
          if (!a.isActive && b.isActive) return 1;
          return 0;
        });
        break;
      case 'inactive':
        result.sort((a, b) => {
          if (!a.isActive && b.isActive) return -1;
          if (a.isActive && !b.isActive) return 1;
          return 0;
        });
        break;
      default:
        break;
    }

    return result;
  }, [filteredStudents, searchTerm, sortBy, classFilter]);

  // Show loading state
  if (loading || classesLoading || sessionsLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading data...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error loading students
        </Typography>
        <Typography color="textSecondary" gutterBottom>
          {error.message}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  // Show the form in full page
  if (showForm) {
    // Ensure all required data is loaded before showing the form
    if (!academicSessions || !classes) {
      return (
        <Box sx={{ height: '100vh', overflow: 'auto', bgcolor: 'grey.50' }}>
          <Container maxWidth="lg" sx={{ py: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Loading form data...
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>
      );
    }

    return (
      <Box sx={{ height: '100vh', overflow: 'auto', bgcolor: 'grey.50' }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
            <Breadcrumbs sx={{ mb: 2 }}>
              <Link
                component="button"
                variant="body1"
                onClick={handleCancelForm}
                sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
              >
                <ArrowBackIcon sx={{ mr: 1 }} />
                Back to Students
              </Link>
            </Breadcrumbs>
            <Typography variant="h4" color="primary" gutterBottom>
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Fill in the student information below. Use the tabs to navigate between different sections.
            </Typography>
          </Paper>
          
          <StudentForm
            student={editingStudent}
            onSave={handleSaveStudent}
            onCancel={handleCancelForm}
            academicSessions={academicSessions}
            classes={classes}
            predefinedClasses={predefinedClasses}
          />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary">
          {hasRole(['teacher']) ? 'My Students' : 'Student Management'}
        </Typography>
        {!hasRole(['teacher']) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddStudent}
          >
            Add New Student
          </Button>
        )}
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Students
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {filteredStudents.length}
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Students
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {students.filter(s => s.isActive).length}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    New This Month
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {students.filter(s => {
                      const admissionDate = new Date(s.admissionDate);
                      const now = new Date();
                      return admissionDate.getMonth() === now.getMonth() && 
                             admissionDate.getFullYear() === now.getFullYear();
                    }).length}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Inactive Students
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {students.filter(s => !s.isActive).length}
                  </Typography>
                </Box>
                <BlockIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Students Table */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          All Students
        </Typography>
        
        {/* Data Records Section */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Data Records
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', borderRadius: 2, px: 2, py: 1, flex: 1, maxWidth: 300 }}>
              <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              <TextField
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="standard"
                InputProps={{ disableUnderline: true }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: '14px',
                    color: '#666',
                  }
                }}
              />
            </Box>
            
            {/* Filter by Class */}
            <FormControl sx={{ minWidth: 150 }}>
              <Select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                displayEmpty
                size="small"
                sx={{ 
                  background: '#f8f9fa',
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                }}
              >
                <MenuItem value="">All Classes</MenuItem>
                {predefinedClasses.map((cls) => (
                  <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Sort Dropdown */}
            <FormControl sx={{ minWidth: 150 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                displayEmpty
                size="small"
                sx={{ 
                  background: '#f8f9fa',
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                }}
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
                <MenuItem value="class">Class</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        <ModernTable
          columns={[
            {
              id: 'name',
              label: 'Student',
              width: 250,
              render: (value, row) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    sx={{ mr: 2, bgcolor: 'primary.main' }}
                    src={row.profileImage}
                    alt={`${row.firstName} ${row.lastName}`}
                  >
                    {!row.profileImage && row.firstName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {row.firstName} {row.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.admissionNumber}
                    </Typography>
                  </Box>
                </Box>
              ),
            },
            {
              id: 'admissionNumber',
              label: 'Admission No.',
              width: 150,
            },
            {
              id: 'class',
              label: 'Class',
              width: 120,
            },
            {
              id: 'gender',
              label: 'Gender',
              width: 100,
            },
            {
              id: 'sponsorPhone',
              label: 'Phone',
              width: 150,
              render: (value, row) => row.sponsorPhone || '-',
            },
            {
              id: 'sponsorAddress',
              label: 'Address',
              width: 200,
              render: (value, row) => row.sponsorAddress || '-',
            },
            {
              id: 'isActive',
              label: 'Status',
              width: 100,
            },
          ]}
          data={students}
          actions={[
            {
              icon: <EditIcon />,
              label: 'Edit',
              onClick: handleEditStudent,
              color: 'primary',
            },
            {
              icon: <DeleteIcon />,
              label: 'Delete',
              onClick: (student) => handleDeleteStudent(student.id),
              color: 'error',
            },
          ]}
          loading={loading}
          emptyMessage="No students found"
          maxHeight={600}
        />
      </Box>
      
      {/* Notification Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {modalType === 'success' && <CheckCircleIcon color="success" />}
            {modalType === 'error' && <WarningIcon color="error" />}
            {modalType === 'warning' && <WarningIcon color="warning" />}
            <Typography variant="h6">
              {modalType === 'success' ? 'Success' : modalType === 'error' ? 'Error' : 'Warning'}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>{modalMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant="contained" color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

interface StudentFormProps {
  student: Student | null;
  onSave: (data: Partial<Student>) => void;
  onCancel: () => void;
  academicSessions: any[];
  classes: any[];
  predefinedClasses: string[];
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onSave, onCancel, academicSessions, classes: availableClasses, predefinedClasses }) => {
  const [tabValue, setTabValue] = useState(0);
  const [studentPhotoFile, setStudentPhotoFile] = useState<File | null>(null);
  const [sponsorPhotoFile, setSponsorPhotoFile] = useState<File | null>(null);
  const [studentPhotoPreview, setStudentPhotoPreview] = useState<string>('');
  const [sponsorPhotoPreview, setSponsorPhotoPreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<{ student: number; sponsor: number }>({ student: 0, sponsor: 0 });
  const [isUploading, setIsUploading] = useState(false);
  
  // Modal state for notifications
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning'>('success');

  // Helper function to show modal notifications
  const showModal = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setModalMessage(message);
    setModalType(type);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  const [formData, setFormData] = useState({
    // Primary Info
    admissionNumber: '',
    firstName: '',
    lastName: '',
    middleName: '',
    profileImage: '',
    
    // Personal Data
    gender: 'male',
    dateOfBirth: '',
    religion: '',
    nationality: '',
    address: '',
    stateOfOrigin: '',
    lgaOfOrigin: '',
    homeTown: '',
    languageSpoken: '',
    
    // Sponsor Data
    sponsorName: '',
    sponsorRelationship: '',
    sponsorAddress: '',
    sponsorPhone: '',
    sponsorEmail: '',
    sponsorOccupation: '',
    sponsorPhoto: '',
    
    // Medical Information
    bloodGroup: '',
    genotype: '',
    disability: '',
    
    // Academic Information
    academicSessionAdmitted: '',
    academicTermAdmitted: '',
    academicClassAdmitted: '',
    admissionDate: '',
    
    // Class Assignment
    class: '',
    parentId: '',
  });

  // Update form data when student prop changes
  useEffect(() => {
    if (student) {
      // Set photo previews
      setStudentPhotoPreview(student.profileImage || '');
      setSponsorPhotoPreview(student.sponsorPhoto || '');
      
      setFormData({
        // Primary Info
        admissionNumber: student.admissionNumber || `HGKA/${Math.floor(1000 + Math.random() * 9000)}`,
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        middleName: student.middleName || '',
        profileImage: student.profileImage || '',
        
        // Personal Data
        gender: student.gender || 'male',
        dateOfBirth: student.dateOfBirth ? (() => {
          try {
            const date = new Date(student.dateOfBirth);
            return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
          } catch {
            return '';
          }
        })() : '',
        religion: student.religion || '',
        nationality: student.nationality || '',
        address: student.address || '',
        stateOfOrigin: student.stateOfOrigin || '',
        lgaOfOrigin: student.lgaOfOrigin || '',
        homeTown: student.homeTown || '',
        languageSpoken: student.languageSpoken || '',
        
        // Sponsor Data
        sponsorName: (student.sponsorName as string) || '',
        sponsorRelationship: (student.sponsorRelationship as string) || '',
        sponsorAddress: (student.sponsorAddress as string) || '',
        sponsorPhone: (student.sponsorPhone as string) || '',
        sponsorEmail: (student.sponsorEmail as string) || '',
        sponsorOccupation: (student.sponsorOccupation as string) || '',
        sponsorPhoto: student.sponsorPhoto || '',
        
        // Medical Information
        bloodGroup: student.bloodGroup || '',
        genotype: student.genotype || '',
        disability: student.disability || '',
        
        // Academic Information
        academicSessionAdmitted: student.academicSessionAdmitted || '',
        academicTermAdmitted: student.academicTermAdmitted || '',
        academicClassAdmitted: student.academicClassAdmitted || '',
        admissionDate: student.admissionDate ? (() => {
          try {
            const date = new Date(student.admissionDate);
            return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
          } catch {
            return new Date().toISOString().split('T')[0];
          }
        })() : new Date().toISOString().split('T')[0],
        
        // Class Assignment
        class: student.class || '',
        parentId: student.parentId || '',
      });
    } else {
      // Reset photo previews for new student
      setStudentPhotoPreview('');
      setSponsorPhotoPreview('');
      
      // Reset form for new student
      setFormData({
        // Primary Info
        admissionNumber: `HGKA/${Math.floor(1000 + Math.random() * 9000)}`,
        firstName: '',
        lastName: '',
        middleName: '',
        profileImage: '',
        
        // Personal Data
        gender: 'male',
        dateOfBirth: '',
        religion: '',
        nationality: '',
        address: '',
        stateOfOrigin: '',
        lgaOfOrigin: '',
        homeTown: '',
        languageSpoken: '',
        
        // Sponsor Data
        sponsorName: '',
        sponsorRelationship: '',
        sponsorAddress: '',
        sponsorPhone: '',
        sponsorEmail: '',
        sponsorOccupation: '',
        sponsorPhoto: '',
        
        // Medical Information
        bloodGroup: '',
        genotype: '',
        disability: '',
        
        // Academic Information
        academicSessionAdmitted: '',
        academicTermAdmitted: '',
        academicClassAdmitted: '',
        admissionDate: new Date().toISOString().split('T')[0],
        
        // Class Assignment
        class: '',
        parentId: '',
      });
    }
  }, [student]);

  const handleStudentPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        showModal(String(validation.error || 'Invalid file format'), 'error');
        return;
      }
      
      setStudentPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setStudentPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSponsorPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        showModal(String(validation.error || 'Invalid file format'), 'error');
        return;
      }
      
      setSponsorPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSponsorPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields with specific error messages
    if (!formData.firstName || formData.firstName.trim() === '') {
      showModal('First name is required.', 'error');
      return;
    }
    if (!formData.lastName || formData.lastName.trim() === '') {
      showModal('Last name is required.', 'error');
      return;
    }
    if (!formData.admissionNumber || formData.admissionNumber.trim() === '') {
      showModal('Admission number is required.', 'error');
      return;
    }
    if (!formData.dateOfBirth || formData.dateOfBirth.trim() === '') {
      showModal('Date of birth is required.', 'error');
      return;
    }
    if (!formData.gender || formData.gender.trim() === '') {
      showModal('Gender is required.', 'error');
      return;
    }
    if (!formData.address || formData.address.trim() === '') {
      showModal('Address is required.', 'error');
      return;
    }
    if (!formData.class || formData.class.trim() === '') {
      showModal('Class is required.', 'error');
      return;
    }
    if (!formData.admissionDate || formData.admissionDate.trim() === '') {
      showModal('Admission date is required.', 'error');
      return;
    }
    if (!formData.sponsorName || formData.sponsorName.trim() === '') {
      showModal('Sponsor name is required.', 'error');
      return;
    }
    if (!formData.sponsorRelationship || formData.sponsorRelationship.trim() === '') {
      showModal('Sponsor relationship is required.', 'error');
      return;
    }
    if (!formData.sponsorPhone || formData.sponsorPhone.trim() === '') {
      showModal('Sponsor phone number is required.', 'error');
      return;
    }
    if (!formData.sponsorAddress || formData.sponsorAddress.trim() === '') {
      showModal('Sponsor address is required.', 'error');
      return;
    }
    if (!formData.sponsorOccupation || formData.sponsorOccupation.trim() === '') {
      showModal('Sponsor occupation is required.', 'error');
      return;
    }
    if (!formData.academicSessionAdmitted || formData.academicSessionAdmitted.trim() === '') {
      showModal('Academic session admitted to is required.', 'error');
      return;
    }
    if (!formData.academicTermAdmitted || formData.academicTermAdmitted.trim() === '') {
      showModal('Academic term admitted to is required.', 'error');
      return;
    }
    if (!formData.academicClassAdmitted || formData.academicClassAdmitted.trim() === '') {
      showModal('Academic class admitted to is required.', 'error');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Convert form data to proper types and add missing required fields
      const processedData = {
        ...formData,
        gender: formData.gender as 'male' | 'female',
        dateOfBirth: new Date(formData.dateOfBirth),
        admissionDate: new Date(formData.admissionDate),
        isActive: true, // Set default active status
        parentId: '', // Temporary empty parent ID - should be selected from parent list
      };

      // For new students, we'll handle file uploads after student creation
      // For existing students, upload photos if files are selected
      if (student && studentPhotoFile) {
        const uploadURL = await uploadStudentPhoto(
          studentPhotoFile,
          student.id,
          (progress) => setUploadProgress(prev => ({ ...prev, student: progress }))
        );
        processedData.profileImage = uploadURL;
      }

      if (student && sponsorPhotoFile) {
        const uploadURL = await uploadSponsorPhoto(
          sponsorPhotoFile,
          student.id,
          (progress) => setUploadProgress(prev => ({ ...prev, sponsor: progress }))
        );
        processedData.sponsorPhoto = uploadURL;
      }

      onSave(processedData);
    } catch (error) {
      console.error('Error uploading files:', error);
      showModal('Error uploading photos. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };


  const states = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 
    'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 
    'Yobe', 'Zamfara'
  ];

  // LGA data for each state
  const lgaData: { [key: string]: string[] } = {
    'Abia': ['Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu Nneochi'],
    'Adamawa': ['Demsa', 'Fufure', 'Ganye', 'Gayuk', 'Gombi', 'Grie', 'Hong', 'Jada', 'Larmurde', 'Madagali', 'Maiha', 'Mayo Belwa', 'Michika', 'Mubi North', 'Mubi South', 'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South'],
    'Akwa Ibom': ['Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo Asutan', 'Ibiono-Ibom', 'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu', 'Mbo', 'Mkpat-Enin', 'Nsit-Atai', 'Nsit-Ibom', 'Nsit-Ubium', 'Obot Akara', 'Okobo', 'Onna', 'Oron', 'Oruk Anam', 'Udung-Uko', 'Ukanafun', 'Uruan', 'Urue-Offong/Oruko', 'Uyo'],
    'Anambra': ['Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North', 'Awka South', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South', 'Oyi'],
    'Bauchi': ['Alkaleri', 'Bauchi', 'Bogoro', 'Damban', 'Darazo', 'Dass', 'Gamawa', 'Ganjuwa', 'Giade', 'Itas/Gadau', 'Jama\'are', 'Katagum', 'Kirfi', 'Misau', 'Ningi', 'Shira', 'Tafawa Balewa', 'Toro', 'Warji', 'Zaki'],
    'Bayelsa': ['Brass', 'Ekeremor', 'Kolokuma/Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw', 'Yenagoa'],
    'Benue': ['Ado', 'Agatu', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West', 'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo', 'Ohimini', 'Oju', 'Okpokwu', 'Otukpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya'],
    'Borno': ['Abadam', 'Askira/Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa', 'Dikwa', 'Gubio', 'Guzamala', 'Gwoza', 'Hawul', 'Jere', 'Kaga', 'Kala/Balge', 'Konduga', 'Kukawa', 'Kwaya Kusar', 'Mafa', 'Magumeri', 'Maiduguri', 'Marte', 'Mobbar', 'Monguno', 'Ngala', 'Nganzai', 'Shani'],
    'Cross River': ['Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki', 'Calabar Municipal', 'Calabar South', 'Etung', 'Ikom', 'Obanliku', 'Obubra', 'Obudu', 'Odukpani', 'Ogoja', 'Yakuur', 'Yala'],
    'Delta': ['Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East', 'Ethiope West', 'Ika North East', 'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East', 'Ndokwa West', 'Okpe', 'Oshimili North', 'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North', 'Ughelli South', 'Ukwuani', 'Uvwie', 'Warri North', 'Warri South', 'Warri South West'],
    'Ebonyi': ['Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South', 'Ikwo', 'Ishielu', 'Ivo', 'Izzi', 'Ohaozara', 'Ohaukwu', 'Onicha'],
    'Edo': ['Akoko-Edo', 'Egor', 'Esan Central', 'Esan North-East', 'Esan South-East', 'Esan West', 'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben', 'Ikpoba Okha', 'Oredo', 'Orhionmwon', 'Ovia North-East', 'Ovia South-West', 'Owan East', 'Owan West', 'Uhunmwonde'],
    'Ekiti': ['Ado Ekiti', 'Efon', 'Ekiti East', 'Ekiti South-West', 'Ekiti West', 'Emure', 'Gbonyin', 'Ido Osi', 'Ijero', 'Ikere', 'Ikole', 'Ilejemeje', 'Irepodun/Ifelodun', 'Ise/Orun', 'Moba', 'Oye'],
    'Enugu': ['Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Ezeagu', 'Igbo Etiti', 'Igbo Eze North', 'Igbo Eze South', 'Isi Uzo', 'Nkanu East', 'Nkanu West', 'Nsukka', 'Oji River', 'Udenu', 'Udi', 'Uzo Uwani'],
    'FCT': ['Abaji', 'Abuja Municipal', 'Gwagwalada', 'Kuje', 'Kwali'],
    'Gombe': ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu/Deba'],
    'Imo': ['Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte', 'Ideato North', 'Ideato South', 'Ihitte/Uboma', 'Ikeduru', 'Isiala Mbano', 'Isu', 'Mbaitoli', 'Ngor Okpala', 'Njaba', 'Nkwerre', 'Nwangele', 'Obowo', 'Oguta', 'Ohaji/Egbema', 'Okigwe', 'Onuimo', 'Orlu', 'Orsu', 'Oru East', 'Oru West', 'Owerri Municipal', 'Owerri North', 'Owerri West', 'Unuimo'],
    'Jigawa': ['Auyo', 'Babura', 'Biriniwa', 'Birnin Kudu', 'Buji', 'Dutse', 'Gagarawa', 'Garki', 'Gumel', 'Guri', 'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin Hausa', 'Kaugama', 'Kazaure', 'Kiri Kasama', 'Kiyawa', 'Maigatari', 'Malam Madori', 'Miga', 'Ringim', 'Roni', 'Sule Tankarkar', 'Taura', 'Yankwashi'],
    'Kaduna': ['Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jema\'a', 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria'],
    'Kano': ['Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garum', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil'],
    'Katsina': ['Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi', 'Dan Musa', 'Dandume', 'Danja', 'Daura', 'Dutsi', 'Dutsin Ma', 'Faskari', 'Funtua', 'Ingawa', 'Jibia', 'Kafur', 'Kaita', 'Kankara', 'Kankia', 'Kurfi', 'Kusada', 'Mai\'Adua', 'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi', 'Sabuwa', 'Safana', 'Sandamu', 'Zango'],
    'Kebbi': ['Aleiro', 'Arewa Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin Kebbi', 'Bunza', 'Dandi', 'Fakai', 'Gwandu', 'Jega', 'Kalgo', 'Koko/Besse', 'Maiyama', 'Ngaski', 'Sakaba', 'Shanga', 'Suru', 'Wasagu/Danko', 'Yauri', 'Zuru'],
    'Kogi': ['Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah', 'Igalamela-Odolu', 'Ijumu', 'Kabba/Bunu', 'Kogi', 'Lokoja', 'Mopa-Muro', 'Ofu', 'Ogori/Magongo', 'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West'],
    'Kwara': ['Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South', 'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Offa', 'Oke Ero', 'Oyun', 'Pategi'],
    'Lagos': ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'],
    'Nasarawa': ['Akwanga', 'Awe', 'Doma', 'Karu', 'Keana', 'Keffi', 'Kokona', 'Lafia', 'Nasarawa', 'Nasarawa Egon', 'Obi', 'Toto', 'Wamba'],
    'Niger': ['Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati', 'Gbako', 'Gurara', 'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Mokwa', 'Moya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Wushishi'],
    'Ogun': ['Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Egbado North', 'Egbado South', 'Ewekoro', 'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode', 'Ikenne', 'Imeko Afon', 'Ipokia', 'Obafemi Owode', 'Odeda', 'Odogbolu', 'Ogun Waterside', 'Remo North', 'Sagamu'],
    'Ondo': ['Akoko North-East', 'Akoko North-West', 'Akoko South-East', 'Akoko South-West', 'Akure North', 'Akure South', 'Ese Odo', 'Idanre', 'Ifedore', 'Ilaje', 'Ile Oluji/Okeigbo', 'Irele', 'Odigbo', 'Okitipupa', 'Ondo East', 'Ondo West', 'Ose', 'Owo'],
    'Osun': ['Aiyedade', 'Aiyedire', 'Atakunmosa East', 'Atakunmosa West', 'Boluwaduro', 'Boripe', 'Ede North', 'Ede South', 'Egbedore', 'Ejigbo', 'Ife Central', 'Ife East', 'Ife North', 'Ife South', 'Ifedayo', 'Ifelodun', 'Ila', 'Ilesa East', 'Ilesa West', 'Irepodun', 'Irewole', 'Isokan', 'Iwo', 'Obokun', 'Odo Otin', 'Ola Oluwa', 'Olorunda', 'Oriade', 'Orolu', 'Osogbo'],
    'Oyo': ['Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West', 'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomosho North', 'Ogbomosho South', 'Ogo Oluwa', 'Olorunsogo', 'Oluyole', 'Ona Ara', 'Orelope', 'Ori Ire', 'Oyo East', 'Oyo West', 'Saki East', 'Saki West', 'Surulere'],
    'Plateau': ['Barkin Ladi', 'Bassa', 'Bokkos', 'Jos East', 'Jos North', 'Jos South', 'Kanam', 'Kanke', 'Langtang North', 'Langtang South', 'Mangu', 'Mikang', 'Pankshin', 'Qua\'an Pan', 'Riyom', 'Shendam', 'Wase'],
    'Rivers': ['Abua/Odual', 'Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Andoni', 'Asari-Toru', 'Bonny', 'Degema', 'Eleme', 'Emohua', 'Etche', 'Gokana', 'Ikwerre', 'Khana', 'Obio/Akpor', 'Ogba/Egbema/Ndoni', 'Ogu/Bolo', 'Okrika', 'Omumma', 'Opobo/Nkoro', 'Oyigbo', 'Port Harcourt', 'Tai'],
    'Sokoto': ['Binji', 'Bodinga', 'Dange Shuni', 'Gada', 'Goronyo', 'Gudu', 'Gwadabawa', 'Illela', 'Isa', 'Kebbe', 'Kware', 'Rabah', 'Sabon Birni', 'Shagari', 'Silame', 'Sokoto North', 'Sokoto South', 'Tambuwal', 'Tangaza', 'Tureta', 'Wamako', 'Wurno', 'Yabo'],
    'Taraba': ['Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Jalingo', 'Karim Lamido', 'Kumi', 'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari', 'Yorro', 'Zing'],
    'Yobe': ['Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam', 'Gujba', 'Gulani', 'Jakusko', 'Karasuwa', 'Machina', 'Nangere', 'Nguru', 'Potiskum', 'Tarmuwa', 'Yunusari', 'Yusufari'],
    'Zamfara': ['Anka', 'Bakura', 'Birnin Magaji/Kiyaw', 'Bukkuyum', 'Bungudu', 'Gummi', 'Gusau', 'Kaura Namoda', 'Maradun', 'Maru', 'Shinkafi', 'Talata Mafara', 'Tsafe', 'Zurmi']
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genotypes = ['AA', 'AS', 'AC', 'SS', 'SC', 'CC'];
  // Use real academic sessions from the database
  const availableSessions = academicSessions && Array.isArray(academicSessions) 
    ? academicSessions.map(session => session.name) 
    : ['2023-2024', '2024-2025', '2025-2026'];
  const academicTerms = ['1st Term', '2nd Term', '3rd Term'];

  return (
    <Paper elevation={1} sx={{ p: 4, mb: 3 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Primary Info" />
          <Tab label="Personal Data" />
          <Tab label="Sponsor Data" />
          <Tab label="Medical Info" />
          <Tab label="Academic Info" />
        </Tabs>
      </Box>

      {/* Primary Info Tab */}
      {tabValue === 0 && (
          <Grid container spacing={3}>
          <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
              Student Primary Information
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Student Registration Number"
              value={formData.admissionNumber}
              onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
              required
              helperText="Format: HGKA/XXXX"
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoIcon />}
                fullWidth
                sx={{ height: 56 }}
                disabled={isUploading}
              >
                Upload Student Photo
                <input 
                  type="file" 
                  hidden 
                  accept="image/*" 
                  onChange={handleStudentPhotoChange}
                />
              </Button>
              {studentPhotoPreview && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar 
                    src={studentPhotoPreview} 
                    sx={{ width: 40, height: 40 }}
                  />
                  <Typography variant="body2" color="success.main">
                    Photo selected
                  </Typography>
                </Box>
              )}
              {uploadProgress.student > 0 && uploadProgress.student < 100 && (
                <Box sx={{ width: '100%' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress.student} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    Uploading: {Math.round(uploadProgress.student)}%
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Surname"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Middle Name"
              value={formData.middleName}
              onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Class</InputLabel>
              <Select
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                label="Class"
              >
                <MenuItem value="">
                  <em>Select a class</em>
                </MenuItem>
                {predefinedClasses.map((cls) => (
                  <MenuItem key={cls} value={cls}>
                    {cls}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      )}

      {/* Personal Data Tab */}
      {tabValue === 1 && (
          <Grid container spacing={3}>
          <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
              Student Personal Data
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.gender}
                label="Gender"
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              required
              disabled={!!student}
              InputLabelProps={{ shrink: true }}
              helperText={student ? "Date of birth cannot be changed after registration" : ""}
              sx={{
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: '#000',
                  color: '#000',
                },
                '& .MuiOutlinedInput-root.Mui-disabled': {
                  backgroundColor: '#f5f5f5',
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Religion</InputLabel>
              <Select
                value={formData.religion}
                label="Religion"
                onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
              >
                <MenuItem value="">Select Religion</MenuItem>
                <MenuItem value="Christianity">Christianity</MenuItem>
                <MenuItem value="Islamic">Islamic</MenuItem>
                <MenuItem value="Others">Others</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Nationality</InputLabel>
              <Select
                value={formData.nationality}
                label="Nationality"
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              >
                <MenuItem value="">Select Nationality</MenuItem>
                <MenuItem value="Nigerian">Nigerian</MenuItem>
                <MenuItem value="Ghanaian">Ghanaian</MenuItem>
                <MenuItem value="Kenyan">Kenyan</MenuItem>
                <MenuItem value="South African">South African</MenuItem>
                <MenuItem value="Egyptian">Egyptian</MenuItem>
                <MenuItem value="Moroccan">Moroccan</MenuItem>
                <MenuItem value="Ethiopian">Ethiopian</MenuItem>
                <MenuItem value="Ugandan">Ugandan</MenuItem>
                <MenuItem value="Tanzanian">Tanzanian</MenuItem>
                <MenuItem value="American">American</MenuItem>
                <MenuItem value="British">British</MenuItem>
                <MenuItem value="Canadian">Canadian</MenuItem>
                <MenuItem value="Australian">Australian</MenuItem>
                <MenuItem value="Indian">Indian</MenuItem>
                <MenuItem value="Chinese">Chinese</MenuItem>
                <MenuItem value="Japanese">Japanese</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>State of Origin</InputLabel>
              <Select
                value={formData.stateOfOrigin}
                label="State of Origin"
                onChange={(e) => setFormData({ ...formData, stateOfOrigin: e.target.value })}
              >
                {states.map((state) => (
                  <MenuItem key={state} value={state}>{state}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>LGA of Origin</InputLabel>
              <Select
                value={formData.lgaOfOrigin}
                label="LGA of Origin"
                onChange={(e) => setFormData({ ...formData, lgaOfOrigin: e.target.value })}
                disabled={!formData.stateOfOrigin || formData.stateOfOrigin === ''}
              >
                <MenuItem value="">
                  {formData.stateOfOrigin ? 'Select LGA' : 'Select State First'}
                </MenuItem>
                {formData.stateOfOrigin && lgaData[formData.stateOfOrigin] ? 
                  lgaData[formData.stateOfOrigin].map((lga) => (
                    <MenuItem key={lga} value={lga}>{lga}</MenuItem>
                  )) : 
                  <MenuItem value="" disabled>
                    Select State First
                  </MenuItem>
                }
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Home Town"
              value={formData.homeTown}
              onChange={(e) => setFormData({ ...formData, homeTown: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Language Spoken"
              value={formData.languageSpoken}
              onChange={(e) => setFormData({ ...formData, languageSpoken: e.target.value })}
            />
          </Grid>
        </Grid>
      )}

      {/* Sponsor Data Tab */}
      {tabValue === 2 && (
          <Grid container spacing={3}>
          <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
              Sponsor Data
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name of Sponsor"
              value={formData.sponsorName}
              onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoIcon />}
                fullWidth
                sx={{ height: 56 }}
                disabled={isUploading}
              >
                Upload Sponsor's Photo
                <input 
                  type="file" 
                  hidden 
                  accept="image/*" 
                  onChange={handleSponsorPhotoChange}
                />
              </Button>
              {sponsorPhotoPreview && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar 
                    src={sponsorPhotoPreview} 
                    sx={{ width: 40, height: 40 }}
                  />
                  <Typography variant="body2" color="success.main">
                    Photo selected
                  </Typography>
                </Box>
              )}
              {uploadProgress.sponsor > 0 && uploadProgress.sponsor < 100 && (
                <Box sx={{ width: '100%' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress.sponsor} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    Uploading: {Math.round(uploadProgress.sponsor)}%
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Relationship</InputLabel>
              <Select
                value={formData.sponsorRelationship}
                label="Relationship"
                onChange={(e) => setFormData({ ...formData, sponsorRelationship: e.target.value })}
              >
                <MenuItem value="">Select Relationship</MenuItem>
                <MenuItem value="Father">Father</MenuItem>
                <MenuItem value="Mother">Mother</MenuItem>
                <MenuItem value="Guardian">Guardian</MenuItem>
                <MenuItem value="Parent">Parent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.sponsorPhone}
              onChange={(e) => setFormData({ ...formData, sponsorPhone: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={3}
              value={formData.sponsorAddress}
              onChange={(e) => setFormData({ ...formData, sponsorAddress: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.sponsorEmail}
              onChange={(e) => setFormData({ ...formData, sponsorEmail: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Occupation"
              value={formData.sponsorOccupation}
              onChange={(e) => setFormData({ ...formData, sponsorOccupation: e.target.value })}
              required
            />
          </Grid>
        </Grid>
      )}

      {/* Medical Information Tab */}
      {tabValue === 3 && (
          <Grid container spacing={3}>
          <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
              Student Medical Information
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Blood Group</InputLabel>
              <Select
                value={formData.bloodGroup}
                label="Blood Group"
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              >
                {bloodGroups.map((group) => (
                  <MenuItem key={group} value={group}>{group}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Genotype</InputLabel>
              <Select
                value={formData.genotype}
                label="Genotype"
                onChange={(e) => setFormData({ ...formData, genotype: e.target.value })}
              >
                {genotypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Disability (if any)"
              multiline
              rows={2}
              value={formData.disability}
              onChange={(e) => setFormData({ ...formData, disability: e.target.value })}
              placeholder="Describe any disability or special needs"
            />
          </Grid>
        </Grid>
      )}

      {/* Academic Information Tab */}
      {tabValue === 4 && (
          <Grid container spacing={3}>
          <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
              Academic Information
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Academic Session Admitted To</InputLabel>
              <Select
                value={formData.academicSessionAdmitted}
                label="Academic Session Admitted To"
                onChange={(e) => setFormData({ ...formData, academicSessionAdmitted: e.target.value })}
              >
                {availableSessions.map((session) => (
                  <MenuItem key={session} value={session}>{session}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Academic Term Admitted To</InputLabel>
              <Select
                value={formData.academicTermAdmitted}
                label="Academic Term Admitted To"
                onChange={(e) => setFormData({ ...formData, academicTermAdmitted: e.target.value })}
              >
                {academicTerms.map((term) => (
                  <MenuItem key={term} value={term}>{term}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Academic Class Admitted To</InputLabel>
              <Select
                value={formData.academicClassAdmitted}
                label="Academic Class Admitted To"
                onChange={(e) => setFormData({ ...formData, academicClassAdmitted: e.target.value })}
              >
                {predefinedClasses.map((cls) => (
                  <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date of Admission"
              type="date"
              value={formData.admissionDate}
              onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      )}
      
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
        <Box>
          {tabValue > 0 && (
            <Button variant="outlined" onClick={() => setTabValue(tabValue - 1)}>
              Previous
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {tabValue < 4 && (
            <Button variant="contained" onClick={() => setTabValue(tabValue + 1)}>
              Next
            </Button>
          )}
                     <Button variant="outlined" onClick={onCancel} disabled={isUploading}>
             Cancel
           </Button>
           <Button 
             variant="contained" 
             type="submit"
             disabled={isUploading}
              startIcon={<SaveIcon />}
           >
             {isUploading ? 'Uploading...' : (student ? 'Update' : 'Add') + ' Student'}
           </Button>
        </Box>
      </Box>
      
      {/* Notification Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {modalType === 'success' && <CheckCircleIcon color="success" />}
            {modalType === 'error' && <WarningIcon color="error" />}
            {modalType === 'warning' && <WarningIcon color="warning" />}
            <Typography variant="h6">
              {modalType === 'success' ? 'Success' : modalType === 'error' ? 'Error' : 'Warning'}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>{modalMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant="contained" color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </Paper>
  );
};

export default StudentManagement; 