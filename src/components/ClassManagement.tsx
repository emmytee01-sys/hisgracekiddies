import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
} from '@mui/material';
import ModernTable, { TableColumn, TableAction } from './common/ModernTable';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Book as BookIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Block as BlockIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { Class, Teacher, Subject } from '../types';
import { useClassesRealtime, useTeachersRealtime, useSubjectsRealtime, useAcademicSessionsRealtime } from '../hooks/useFirebaseData';
import { useClasses } from '../hooks/useFirebaseData';
import { toast } from 'react-toastify';

interface ClassManagementProps {}

const ClassManagement: React.FC<ClassManagementProps> = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  // Realtime data
  const { data: rtClasses } = useClassesRealtime();
  const { data: rtTeachers } = useTeachersRealtime();
  const { data: rtSubjects } = useSubjectsRealtime();
  const { data: academicSessions } = useAcademicSessionsRealtime();

  // CRUD functions
  const { addItem, updateItem, deleteItem } = useClasses();

  const classes = rtClasses as Class[];
  const teachers = (rtTeachers as unknown as Teacher[]) || [];
  const subjects = (rtSubjects as unknown as Subject[]) || [];

  const sections = ['A', 'B', 'C', 'D'];
  // Use real academic sessions from the database
  const availableAcademicYears = (academicSessions as any[])?.map(session => session.name) || ['2023-2024', '2024-2025', '2025-2026'];

  const handleAddClass = () => {
    setEditingClass(null);
    setOpenDialog(true);
  };

  const handleEditClass = (cls: Class) => {
    setEditingClass(cls);
    setOpenDialog(true);
  };

  const handleDeleteClass = async (id: string) => {
    try {
      await deleteItem(id);
      toast.success('Class deleted');
    } catch (e) {
      toast.error('Failed to delete class');
    }
  };

  const handleViewClass = (cls: Class) => {
    setSelectedClass(cls);
    setViewMode('detail');
  };

  const validate = (data: any) => {
    if (!data.name) return 'Class name is required';
    if (!data.section && data.section !== '') return 'Section is required';
    if (!data.capacity || data.capacity < 1) return 'Capacity must be at least 1';
    if (!data.academicYear) return 'Academic year is required';
    return null;
  };

  const handleSaveClass = async (data: any) => {
    const error = validate(data);
    if (error) {
      toast.error(error);
      return;
    }

    const payload = {
      name: data.name,
      section: data.section ?? '',
      capacity: Number(data.capacity),
      currentEnrollment: editingClass ? editingClass.currentEnrollment : 0,
      teacherId: data.teacherId ?? '',
      subjects: Array.isArray(data.subjects) ? data.subjects : [],
      academicYear: data.academicYear,
      isActive: editingClass ? editingClass.isActive : true,
      createdAt: editingClass?.createdAt ?? new Date(),
    } as Omit<Class, 'id'>;

    try {
      if (editingClass) {
        await updateItem(editingClass.id, payload as Partial<Class>);
        toast.success('Class updated');
      } else {
        await addItem(payload);
        toast.success('Class created');
      }
      setOpenDialog(false);
    } catch (e) {
      toast.error('Failed to save class');
    }
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Not Assigned';
  };

  const getEnrollmentPercentage = (current: number, capacity: number) => {
    return capacity > 0 ? Math.round((current / capacity) * 100) : 0;
  };

  const getEnrollmentColor = (percentage: number) => {
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'success';
  };

  if (viewMode === 'detail' && selectedClass) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => setViewMode('list')}
              sx={{ mr: 2 }}
              startIcon={<EditIcon />}
            >
              Back
            </Button>
            <Typography variant="h4" color="primary">
              {selectedClass.name} - Section {selectedClass.section}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => handleEditClass(selectedClass)}
          >
            Edit Class
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Class Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Class Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Academic Year
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedClass.academicYear}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Capacity
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedClass.currentEnrollment} / {selectedClass.capacity} students
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Enrollment Rate
                  </Typography>
                  <Chip
                    label={`${getEnrollmentPercentage(selectedClass.currentEnrollment, selectedClass.capacity)}%`}
                    color={getEnrollmentColor(getEnrollmentPercentage(selectedClass.currentEnrollment, selectedClass.capacity))}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedClass.isActive ? 'Active' : 'Inactive'}
                    color={selectedClass.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Class Teacher */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Class Teacher
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {getTeacherName(selectedClass.teacherId)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {teachers.find(t => t.id === selectedClass.teacherId)?.qualification}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Subjects */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Subjects
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedClass.subjects.map((subject, index) => (
                    <Chip
                      key={index}
                      label={subject}
                      color="primary"
                      variant="outlined"
                      icon={<BookIcon />}
                    />
                  ))}
                </Box>
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
          Class Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClass}
        >
          Add New Class
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
                    Total Classes
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {classes.length}
                  </Typography>
                </Box>
                <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                    Total Students
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {classes.reduce((sum, cls) => sum + cls.currentEnrollment, 0)}
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'success.main' }} />
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
                    Total Capacity
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {classes.reduce((sum, cls) => sum + cls.capacity, 0)}
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'info.main' }} />
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
                    Active Classes
                  </Typography>
                  <Typography variant="h4" color="secondary.main">
                    {classes.filter(c => c.isActive).length}
                  </Typography>
                </Box>
                <SchoolIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Classes Table */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          All Classes
        </Typography>
        
        <ModernTable
          columns={[
            {
              id: 'name',
              label: 'Class',
              width: 250,
              render: (value, row) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <SchoolIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {row.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Class ID: {row.id}
                    </Typography>
                  </Box>
                </Box>
              ),
            },
            {
              id: 'teacherId',
              label: 'Teacher',
              width: 200,
              render: (value, row) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 1, width: 24, height: 24, bgcolor: 'secondary.main' }}>
                    <PersonIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Typography variant="body2" fontWeight="medium">
                    {getTeacherName(value)}
                  </Typography>
                </Box>
              ),
            },
            {
              id: 'enrollment',
              label: 'Students',
              width: 150,
              render: (value, row) => (
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {row.currentEnrollment} / {row.capacity}
                  </Typography>
                  <Chip
                    label={`${getEnrollmentPercentage(row.currentEnrollment, row.capacity)}%`}
                    color={getEnrollmentColor(getEnrollmentPercentage(row.currentEnrollment, row.capacity))}
                    size="small"
                    icon={<GroupIcon />}
                  />
                </Box>
              ),
            },
            {
              id: 'academicYear',
              label: 'Academic Year',
              width: 150,
            },
            {
              id: 'isActive',
              label: 'Status',
              width: 100,
            },
          ]}
          data={classes}
          actions={[
            {
              icon: <VisibilityIcon />,
              label: 'View',
              onClick: handleViewClass,
              color: 'info',
            },
            {
              icon: <EditIcon />,
              label: 'Edit',
              onClick: handleEditClass,
              color: 'primary',
            },
            {
              icon: <DeleteIcon />,
              label: 'Delete',
              onClick: (cls) => handleDeleteClass(cls.id),
              color: 'error',
            },
          ]}
          emptyMessage="No classes found"
          maxHeight={600}
        />
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingClass ? `Edit Class` : `Add New Class`}
        </DialogTitle>
        <DialogContent>
          <ClassForm
            cls={editingClass}
            onSave={handleSaveClass}
            onCancel={() => setOpenDialog(false)}
            teachers={teachers}
            subjects={subjects}
            sections={sections}
            academicYears={availableAcademicYears}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

// Class Form Component
interface ClassFormProps {
  cls: Class | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  teachers: Teacher[];
  subjects: Subject[];
  sections: string[];
  academicYears: string[];
}

const ClassForm: React.FC<ClassFormProps> = ({ cls, onSave, onCancel, teachers, subjects, sections, academicYears }) => {
  const [formData, setFormData] = useState({
    name: cls?.name || '',
    section: cls?.section || 'A',
    capacity: cls?.capacity || 30,
    teacherId: cls?.teacherId || '',
    subjects: cls?.subjects || [],
          academicYear: cls?.academicYear || (academicYears[0] || '2023-2024'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Class Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="e.g., Primary 1"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Section</InputLabel>
            <Select
              value={formData.section}
              label="Section"
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            >
              {sections.map((section) => (
                <MenuItem key={section} value={section}>{section}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
            required
            inputProps={{ min: 1, max: 50 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Academic Year</InputLabel>
            <Select
              value={formData.academicYear}
              label="Academic Year"
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
            >
                              {academicYears.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>Class Teacher</InputLabel>
            <Select
              value={formData.teacherId}
              label="Class Teacher"
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
            >
              <MenuItem value="">No Teacher Assigned</MenuItem>
              {teachers.filter(t => !t.assignedClassId || (cls && t.assignedClassId === cls.id)).map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName} - {teacher.qualification}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>Subjects</InputLabel>
            <Select
              multiple
              value={formData.subjects}
              label="Subjects"
              onChange={(e) => setFormData({ ...formData, subjects: e.target.value as string[] })}
            >
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.name}>
                  {subject.name} ({subject.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" type="submit">
          {cls ? 'Update' : 'Add'} Class
        </Button>
      </Box>
    </Box>
  );
};

export default ClassManagement; 