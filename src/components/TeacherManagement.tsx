import React, { useMemo, useState } from 'react';
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
  Alert,
  Avatar,
  Switch,
  FormControlLabel,
  IconButton,
  Container,
  Breadcrumbs,
  Link,
  Paper,
} from '@mui/material';
import ModernTable, { TableColumn, TableAction } from './common/ModernTable';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { Teacher, Class } from '../types';
import { useTeachersRealtime, useClassesRealtime, useTeachers } from '../hooks/useFirebaseData';
import { toast } from 'react-toastify';

interface TeacherManagementProps {}

const TeacherManagement: React.FC<TeacherManagementProps> = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  // Realtime data
  const { data: rtTeachers } = useTeachersRealtime();
  const { data: rtClasses } = useClassesRealtime();

  const { addItem, updateItem, deleteItem } = useTeachers();

  const teachers = (rtTeachers as unknown as Teacher[]) || [];
  const classes = (rtClasses as unknown as Class[]) || [];

  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setShowForm(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setShowForm(true);
  };

  const handleDeleteTeacher = async (id: string) => {
    try {
      await deleteItem(id);
      toast.success('Teacher deleted');
    } catch (e) {
      toast.error('Failed to delete teacher');
    }
  };

  const handleViewTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setViewMode('detail');
  };

  const handleToggleStatus = (teacherId: string) => {
    // This function is not directly used in the new_code, but kept for consistency
    // The status update will be handled by the realtime hook or a separate update function
  };

  const validate = (data: any) => {
    if (!data.firstName) return 'First name is required';
    if (!data.lastName) return 'Last name is required';
    if (!data.email) return 'Email is required';
    if (!data.assignedClassId) return 'Assigned class is required';
    return null;
  };

  const handleSaveTeacher = async (data: any) => {
    const err = validate(data);
    if (err) {
      toast.error(err);
      return;
    }

    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber ?? '',
      assignedClassId: data.assignedClassId,
      qualification: data.qualification ?? '',
      hireDate: editingTeacher?.hireDate ?? new Date(),
      isActive: editingTeacher?.isActive ?? true,
      userId: editingTeacher?.userId ?? undefined,
    } as Omit<Teacher, 'id'>;

    try {
      if (editingTeacher) {
        await updateItem(editingTeacher.id, payload as Partial<Teacher>);
        toast.success('Teacher updated');
      } else {
        await addItem(payload);
        toast.success('Teacher created');
      }
      setShowForm(false);
    } catch (e) {
      toast.error('Failed to save teacher');
    }
  };

  const getAssignedClassName = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? `${cls.name} ${cls.section}` : 'Not Assigned';
  };

  const getAssignedClassSubjects = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.subjects : [];
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTeacher(null);
  };

  // Show the form in full page
  if (showForm) {
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
                Back to Teachers
              </Link>
            </Breadcrumbs>
            <Typography variant="h4" color="primary" gutterBottom>
              {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Fill in the teacher information below.
            </Typography>
          </Paper>
          
          <TeacherForm
            teacher={editingTeacher}
            classes={classes}
            onSave={handleSaveTeacher}
            onCancel={handleCancelForm}
          />
        </Container>
      </Box>
    );
  }

  if (viewMode === 'detail' && selectedTeacher) {
    const assignedClass = classes.find(c => c.id === selectedTeacher.assignedClassId);
    
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => setViewMode('list')} sx={{ mr: 2 }}>
              <EditIcon />
            </IconButton>
            <Typography variant="h4" color="primary">
              {selectedTeacher.firstName} {selectedTeacher.lastName}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => handleEditTeacher(selectedTeacher)}
          >
            Edit Teacher
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Teacher Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Teacher Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedTeacher.email}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Phone Number
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedTeacher.phoneNumber}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Qualification
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedTeacher.qualification}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Hire Date
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedTeacher.hireDate.toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedTeacher.isActive ? 'Active' : 'Inactive'}
                    color={selectedTeacher.isActive ? 'success' : 'default'}
                    size="small"
                    icon={selectedTeacher.isActive ? <CheckCircleIcon /> : <BlockIcon />}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Assigned Class */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Assigned Class
                </Typography>
                {assignedClass ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {assignedClass.name} - Section {assignedClass.section}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {assignedClass.currentEnrollment} / {assignedClass.capacity} students
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Academic Year
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {assignedClass.academicYear}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Subjects Teaching
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {assignedClass.subjects.map((subject, index) => (
                          <Chip key={index} label={subject} size="small" color="primary" />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No class assigned
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary">
          Teacher Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddTeacher}
        >
          Add New Teacher
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Teachers
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {teachers.length}
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                    Active Teachers
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {teachers.filter(t => t.isActive).length}
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
                    Assigned Classes
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {teachers.filter(t => t.assignedClassId).length}
                  </Typography>
                </Box>
                <SchoolIcon sx={{ fontSize: 40, color: 'info.main' }} />
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
                    Inactive Teachers
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {teachers.filter(t => !t.isActive).length}
                  </Typography>
                </Box>
                <BlockIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Teachers Table */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          All Teachers
        </Typography>
        
        <ModernTable
          columns={[
            {
              id: 'name',
              label: 'Teacher',
              width: 250,
              render: (value, row) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {row.firstName} {row.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.phoneNumber}
                    </Typography>
                  </Box>
                </Box>
              ),
            },
            {
              id: 'email',
              label: 'Email',
              width: 200,
            },
            {
              id: 'assignedClassId',
              label: 'Assigned Class',
              width: 150,
              render: (value, row) => (
                <Chip
                  label={getAssignedClassName(value)}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              ),
            },
            {
              id: 'qualification',
              label: 'Qualification',
              width: 150,
            },
            {
              id: 'isActive',
              label: 'Status',
              width: 100,
            },
          ]}
          data={teachers}
          actions={[
            {
              icon: <VisibilityIcon />,
              label: 'View',
              onClick: handleViewTeacher,
              color: 'info',
            },
            {
              icon: <EditIcon />,
              label: 'Edit',
              onClick: handleEditTeacher,
              color: 'primary',
            },
            {
              icon: <DeleteIcon />,
              label: 'Delete',
              onClick: (teacher) => handleDeleteTeacher(teacher.id),
              color: 'error',
            },
          ]}
          emptyMessage="No teachers found"
          maxHeight={600}
        />
      </Box>


    </Box>
  );
};

// Teacher Form Component
interface TeacherFormProps {
  teacher: Teacher | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  classes: Class[];
}

const TeacherForm: React.FC<TeacherFormProps> = ({ teacher, onSave, onCancel, classes }) => {
  const [formData, setFormData] = useState({
    firstName: teacher?.firstName || '',
    lastName: teacher?.lastName || '',
    email: teacher?.email || '',
    phoneNumber: teacher?.phoneNumber || '',
    qualification: teacher?.qualification || '',
    assignedClassId: teacher?.assignedClassId || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const availableClasses = classes.filter(cls => !cls.teacherId || cls.teacherId === teacher?.id);

  return (
    <Paper elevation={1} sx={{ p: 4, mb: 3 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Qualification"
            value={formData.qualification}
            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>Assigned Class</InputLabel>
            <Select
              value={formData.assignedClassId}
              label="Assigned Class"
              onChange={(e) => setFormData({ ...formData, assignedClassId: e.target.value })}
            >
              <MenuItem value="">No Class Assigned</MenuItem>
              {availableClasses.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.name} {cls.section} ({cls.currentEnrollment}/{cls.capacity} students)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Note:</strong> This teacher will be responsible for all subjects in the assigned class.
        </Typography>
      </Alert>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" type="submit" startIcon={<SaveIcon />}>
          {teacher ? 'Update' : 'Add'} Teacher
        </Button>
      </Box>
      </Box>
    </Paper>
  );
};

export default TeacherManagement; 