import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
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
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Book as BookIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { Subject, Teacher, Class } from '../types';
import { useSubjectsRealtime, useTeachersRealtime, useClassesRealtime } from '../hooks/useFirebaseData';
import { createSubject, updateSubject, deleteSubject } from '../services/firebaseService';

interface SubjectManagementProps {}

const SubjectManagement: React.FC<SubjectManagementProps> = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  // Use Firebase data instead of mock data
  const { data: subjects, loading: subjectsLoading, error: subjectsError } = useSubjectsRealtime();
  const { data: teachers } = useTeachersRealtime();
  const { data: classes } = useClassesRealtime();

  const handleAddSubject = () => {
    setEditingSubject(null);
    setOpenDialog(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setOpenDialog(true);
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await deleteSubject(id);
      // Refresh data after deletion
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete subject:', error);
    }
  };

  const handleViewSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setViewMode('detail');
  };

    const handleSaveSubject = async (data: any) => {
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, data);
      } else {
        const newSubject = {
          name: data.name,
          code: data.code,
          description: data.description,
          teacherId: data.teacherId,
          classes: data.classes,
          credits: data.credits,
          isActive: true,
          createdAt: new Date(),
        };
        await createSubject(newSubject);
      }
      setOpenDialog(false);
      setEditingSubject(null);
      // Refresh data after save
      window.location.reload();
    } catch (error) {
      console.error('Failed to save subject:', error);
    }
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = (teachers as any[]).find((t: any) => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Not Assigned';
  };

  const getClassNames = (classIds: string[]) => {
    return classIds.map(id => {
      const cls = (classes as any[]).find((c: any) => c.id === id);
      return cls ? `${cls.name} ${cls.section}` : id;
    });
  };

  // Show loading state
  if (subjectsLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (subjectsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load subjects: {subjectsError.message}
        </Alert>
      </Box>
    );
  }

  if (viewMode === 'detail' && selectedSubject) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => setViewMode('list')} sx={{ mr: 2 }}>
              <EditIcon />
            </IconButton>
            <Typography variant="h4" color="primary">
              {selectedSubject.name} ({selectedSubject.code})
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => handleEditSubject(selectedSubject)}
          >
            Edit Subject
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Subject Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Subject Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Subject Code
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedSubject.code}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {selectedSubject.description}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Credits
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedSubject.credits} credits
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedSubject.isActive ? 'Active' : 'Inactive'}
                    color={selectedSubject.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Subject Teacher */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Subject Teacher
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {getTeacherName(selectedSubject.teacherId)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(teachers as any[]).find((t: any) => t.id === selectedSubject.teacherId)?.qualification}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Classes */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Classes Teaching This Subject
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedSubject.classes.map((cls, index) => (
                    <Chip
                      key={index}
                      label={cls}
                      color="primary"
                      variant="outlined"
                      icon={<SchoolIcon />}
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
          Subject Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddSubject}
        >
          Add New Subject
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
                    Total Subjects
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {subjects.length}
                  </Typography>
                </Box>
                <BookIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                    Active Subjects
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {(subjects as any[]).filter((s: any) => s.isActive).length}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
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
                    Total Teachers
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {teachers.length}
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, color: 'info.main' }} />
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
                    Total Classes
                  </Typography>
                  <Typography variant="h4" color="secondary.main">
                    {classes.length}
                  </Typography>
                </Box>
                <SchoolIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Subjects Table - Modern Design */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 4px 25px rgba(138, 43, 226, 0.15)', border: '1px solid #f0f0f0' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid #f0f0f0' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Subjects
            </Typography>
            <Typography variant="caption" color="text.secondary" fontSize="11px">
              All Subjects
            </Typography>
          </Box>
          
          <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', borderRadius: 2, px: 2, py: 1, flex: 1, maxWidth: 280 }}>
              <input
                type="text"
                placeholder="Search subjects..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '13px',
                  color: '#666',
                  width: '100%',
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', borderRadius: 2, px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }} fontSize="11px">
                Sort:
              </Typography>
              <select
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '12px',
                  color: '#666',
                }}
              >
                <option>Newest</option>
                <option>Oldest</option>
                <option>Name</option>
                <option>Credits</option>
              </select>
            </Box>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Teacher</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Classes</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Credits</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(subjects as any[]).map((subject: any) => (
                  <TableRow key={subject.id} hover sx={{ '&:hover': { backgroundColor: 'rgba(138, 43, 226, 0.05)' } }}>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1.5, bgcolor: '#8A2BE2', width: 28, height: 28 }}>
                          <BookIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold" color="text.primary">
                            {subject.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontSize="10px">
                            Code: {subject.code}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1, width: 24, height: 24, bgcolor: '#9370DB' }}>
                          <PersonIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="body2" fontWeight="medium" fontSize="13px">
                          {getTeacherName(subject.teacherId)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(subject.classes as any[]).slice(0, 2).map((cls: any, index: number) => (
                          <Chip 
                            key={index} 
                            label={cls} 
                            size="small" 
                            color="secondary"
                            variant="outlined"
                            icon={<SchoolIcon />}
                            sx={{ fontSize: '11px', fontWeight: 500 }}
                          />
                        ))}
                        {subject.classes.length > 2 && (
                          <Chip 
                            label={`+${subject.classes.length - 2}`} 
                            size="small" 
                            variant="outlined"
                            color="info"
                            sx={{ fontSize: '11px', fontWeight: 500 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={`${subject.credits} credits`}
                        color="primary"
                        size="small"
                        variant="outlined"
                        icon={<GroupIcon />}
                        sx={{ fontSize: '11px', fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={subject.isActive ? 'Active' : 'Inactive'}
                        color={subject.isActive ? 'success' : 'default'}
                        size="small"
                        icon={subject.isActive ? <CheckCircleIcon /> : <BlockIcon />}
                        sx={{ 
                          fontWeight: 500,
                          fontSize: '11px',
                          backgroundColor: subject.isActive ? '#00C851' : '#f5f5f5',
                          color: subject.isActive ? 'white' : '#666'
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewSubject(subject)}
                          sx={{ 
                            color: '#8A2BE2',
                            '&:hover': { backgroundColor: 'rgba(138, 43, 226, 0.1)' }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEditSubject(subject)}
                          sx={{ 
                            color: '#8A2BE2',
                            '&:hover': { backgroundColor: 'rgba(138, 43, 226, 0.1)' }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteSubject(subject.id)}
                          sx={{ 
                            color: '#FF5252',
                            '&:hover': { backgroundColor: 'rgba(255, 82, 82, 0.1)' }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <Box sx={{ p: 2.5, borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" fontSize="11px">
              Showing 1-{(subjects as any[]).length} of {(subjects as any[]).length} subjects
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <Box component="span" sx={{ fontSize: '12px' }}>‹</Box>
              </IconButton>
              <Box sx={{ display: 'flex', gap: 0.25 }}>
                {[1].map((page) => (
                  <IconButton
                    key={page}
                    size="small"
                    sx={{
                      minWidth: 28,
                      height: 28,
                      backgroundColor: '#8A2BE2',
                      color: 'white',
                      fontSize: '12px',
                      '&:hover': {
                        backgroundColor: '#7B68EE',
                      },
                    }}
                  >
                    {page}
                  </IconButton>
                ))}
              </Box>
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <Box component="span" sx={{ fontSize: '12px' }}>›</Box>
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSubject ? `Edit Subject` : `Add New Subject`}
        </DialogTitle>
        <DialogContent>
          <SubjectForm
            subject={editingSubject}
            onSave={handleSaveSubject}
            onCancel={() => setOpenDialog(false)}
            teachers={teachers as any[]}
            classes={classes as any[]}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

// Subject Form Component
interface SubjectFormProps {
  subject: Subject | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  teachers: any[];
  classes: any[];
}

const SubjectForm: React.FC<SubjectFormProps> = ({ subject, onSave, onCancel, teachers, classes }) => {
  const [formData, setFormData] = useState({
    name: subject?.name || '',
    code: subject?.code || '',
    description: subject?.description || '',
    teacherId: subject?.teacherId || '',
    classes: subject?.classes || [],
    credits: subject?.credits || 3,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const availableClasses = classes.map(cls => `${cls.name} ${cls.section}`);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Subject Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="e.g., Mathematics"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Subject Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            required
            placeholder="e.g., MATH"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            placeholder="Brief description of the subject"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Credits"
            type="number"
            value={formData.credits}
            onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
            required
            inputProps={{ min: 1, max: 10 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Note:</strong> Teachers are assigned to classes, not individual subjects. 
              The class teacher will handle all subjects for their assigned class.
            </Typography>
          </Alert>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>Classes</InputLabel>
            <Select
              multiple
              value={formData.classes}
              label="Classes"
              onChange={(e) => setFormData({ ...formData, classes: e.target.value as string[] })}
            >
              {availableClasses.map((cls) => (
                <MenuItem key={cls} value={cls}>
                  {cls}
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
          {subject ? 'Update' : 'Add'} Subject
        </Button>
      </Box>
    </Box>
  );
};

export default SubjectManagement; 