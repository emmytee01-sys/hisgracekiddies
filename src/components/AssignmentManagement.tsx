import React, { useMemo, useState } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Tabs,
  Tab,
  LinearProgress,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  FileUpload as FileUploadIcon,
} from '@mui/icons-material';
import { Assignment, AssignmentSubmission, Teacher, Student, Class } from '../types';
import { useAssignmentsRealtime, useAssignments } from '../hooks/useFirebaseData';
import { toast } from 'react-toastify';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AssignmentManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [gradingMode, setGradingMode] = useState(false);

  const { data: assignmentsRt } = useAssignmentsRealtime();
  const { addItem, updateItem, deleteItem } = useAssignments();

  const assignments = (assignmentsRt as unknown as Assignment[]) || [];
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);

  const [students] = useState<Student[]>([
    {
      id: '1',
      admissionNumber: 'HGA001',
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'Michael',
      dateOfBirth: new Date('2015-03-15'),
      gender: 'male',
      class: 'Primary 1A',
      section: 'A',
      parentId: '1',
      address: '123 Student Street, Lagos',
      phoneNumber: '+234 805 678 9012',
      admissionDate: new Date('2023-09-01'),
      isActive: true,
      userId: '4',
    },
    {
      id: '2',
      admissionNumber: 'HGA002',
      firstName: 'Jane',
      lastName: 'Smith',
      middleName: 'Elizabeth',
      dateOfBirth: new Date('2015-07-22'),
      gender: 'female',
      class: 'Primary 1A',
      section: 'A',
      parentId: '2',
      address: '456 Student Avenue, Lagos',
      phoneNumber: '+234 806 789 0123',
      admissionDate: new Date('2023-09-01'),
      isActive: true,
      userId: '5',
    },
  ]);

  const [classes] = useState<Class[]>([
    {
      id: '1',
      name: 'Primary 1',
      section: 'A',
      capacity: 30,
      currentEnrollment: 25,
      teacherId: '1',
      subjects: ['Mathematics', 'English', 'Science'],
      academicYear: '2023-2024',
      isActive: true,
      createdAt: new Date('2023-09-01'),
    },
  ]);

  const subjects = [
    { id: '1', name: 'Mathematics', code: 'MATH' },
    { id: '2', name: 'English', code: 'ENG' },
    { id: '3', name: 'Science', code: 'SCI' },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => setTabValue(newValue);
  const handleAddAssignment = () => { setEditingAssignment(null); setOpenDialog(true); };
  const handleEditAssignment = (a: Assignment) => { setEditingAssignment(a); setOpenDialog(true); };

  const validate = (data: any) => {
    if (!data.title) return 'Title is required';
    if (!data.classId) return 'Class is required';
    if (!data.dueDate) return 'Due date is required';
    if (!data.maxScore || data.maxScore < 1) return 'Max score must be at least 1';
    return null;
  };

  const handleSaveAssignment = async (data: any) => {
    const err = validate(data); if (err) { toast.error(err); return; }
    const payload = {
      title: data.title,
      description: data.description || '',
      subjectId: data.subjectId || '',
      classId: data.classId,
      teacherId: data.teacherId || '',
      dueDate: new Date(data.dueDate),
      maxScore: Number(data.maxScore),
      createdAt: editingAssignment?.createdAt ?? new Date(),
      isActive: editingAssignment?.isActive ?? true,
    } as Omit<Assignment, 'id'>;
    try {
      if (editingAssignment) await updateItem(editingAssignment.id, payload as Partial<Assignment>); else await addItem(payload);
      toast.success('Assignment saved');
      setOpenDialog(false);
    } catch { toast.error('Failed to save assignment'); }
  };

  const handleDeleteAssignment = async (id: string) => {
    try { await deleteItem(id); toast.success('Assignment deleted'); } catch { toast.error('Delete failed'); }
  };

  const handleViewAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setViewMode('detail');
  };

  const handleGradeSubmission = (submissionId: string, score: number, feedback: string) => {
    setSubmissions(submissions.map(s => 
      s.id === submissionId ? { ...s, score, feedback, status: 'graded' } : s
    ));
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const getSubmissionStatus = (assignmentId: string) => {
    const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignmentId);
    const totalStudents = students.length;
    const submittedCount = assignmentSubmissions.length;
    const gradedCount = assignmentSubmissions.filter(s => s.status === 'graded').length;
    
    return {
      total: totalStudents,
      submitted: submittedCount,
      graded: gradedCount,
      pending: totalStudents - submittedCount,
    };
  };

  const getAverageScore = (assignmentId: string) => {
    const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignmentId && s.score !== undefined);
    if (assignmentSubmissions.length === 0) return 0;
    
    const totalScore = assignmentSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);
    return Math.round(totalScore / assignmentSubmissions.length);
  };

  if (viewMode === 'detail' && selectedAssignment) {
    const assignmentSubmissions = submissions.filter(s => s.assignmentId === selectedAssignment.id);
    const status = getSubmissionStatus(selectedAssignment.id);
    const averageScore = getAverageScore(selectedAssignment.id);
    
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => setViewMode('list')} sx={{ mr: 2 }}>
              <EditIcon />
            </IconButton>
            <Typography variant="h4" color="primary">
              {selectedAssignment.title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => handleEditAssignment(selectedAssignment)}
            >
              Edit Assignment
            </Button>
            <Button
              variant="contained"
              startIcon={<GradeIcon />}
              onClick={() => setGradingMode(!gradingMode)}
            >
              {gradingMode ? 'View Mode' : 'Grade Submissions'}
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Assignment Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Assignment Details
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Subject
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {getSubjectName(selectedAssignment.subjectId)}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {selectedAssignment.description}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Due Date
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedAssignment.dueDate.toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Max Score
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedAssignment.maxScore} points
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Submission Statistics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Submission Statistics
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Students
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {status.total}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Submitted
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {status.submitted}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Graded
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {status.graded}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Average Score
                  </Typography>
                  <Typography variant="h4" color="secondary.main">
                    {averageScore}/{selectedAssignment.maxScore}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Submissions List */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Student Submissions
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Submission Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Feedback</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.map((student) => {
                        const submission = assignmentSubmissions.find(s => s.studentId === student.id);
                        return (
                          <TableRow key={student.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                  <PersonIcon />
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {student.firstName} {student.lastName}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {student.admissionNumber}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {submission ? submission.submissionDate.toLocaleDateString() : 'Not submitted'}
                            </TableCell>
                            <TableCell>
                              {submission ? (
                                <Chip
                                  label={submission.status}
                                  color={submission.status === 'graded' ? 'success' : 'warning'}
                                  size="small"
                                />
                              ) : (
                                <Chip label="Not submitted" color="default" size="small" />
                              )}
                            </TableCell>
                            <TableCell>
                              {submission && submission.score !== undefined ? (
                                <Typography variant="body1" fontWeight="bold">
                                  {submission.score}/{selectedAssignment.maxScore}
                                </Typography>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>
                              {submission && submission.feedback ? (
                                <Typography variant="body2" noWrap>
                                  {submission.feedback}
                                </Typography>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {submission && (
                                <IconButton
                                  color="primary"
                                  onClick={() => {
                                    // Handle grading
                                  }}
                                >
                                  <GradeIcon />
                                </IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
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
          Assignment Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddAssignment}
        >
          Create Assignment
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
                    Total Assignments
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {assignments.length}
                  </Typography>
                </Box>
                <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                    Active Assignments
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {assignments.filter(a => a.isActive).length}
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
                    Total Submissions
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {submissions.length}
                  </Typography>
                </Box>
                <FileUploadIcon sx={{ fontSize: 40, color: 'info.main' }} />
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
                    Pending Grades
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {submissions.filter(s => s.status !== 'graded').length}
                  </Typography>
                </Box>
                <GradeIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="All Assignments" />
            <Tab label="Recent Submissions" />
            <Tab label="Grading Queue" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Assignments Table - Modern Design */}
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 25px rgba(138, 43, 226, 0.15)', border: '1px solid #f0f0f0' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid #f0f0f0' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Assignments
                </Typography>
                <Typography variant="caption" color="text.secondary" fontSize="11px">
                  All Active Assignments
                </Typography>
              </Box>
              
              <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', borderRadius: 2, px: 2, py: 1, flex: 1, maxWidth: 280 }}>
                  <input
                    type="text"
                    placeholder="Search assignments..."
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
                    <option>Due Date</option>
                    <option>Title</option>
                    <option>Subject</option>
                    <option>Status</option>
                  </select>
                </Box>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Assignment</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Due Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Submissions</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Average Score</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Status</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.map((assignment) => {
                      const status = getSubmissionStatus(assignment.id);
                      const averageScore = getAverageScore(assignment.id);
                      return (
                        <TableRow key={assignment.id} hover sx={{ '&:hover': { backgroundColor: 'rgba(138, 43, 226, 0.05)' } }}>
                          <TableCell sx={{ py: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ mr: 1.5, color: '#8A2BE2' }}>
                                <AssignmentIcon fontSize="small" />
                              </Box>
                              <Box>
                                <Typography variant="body2" fontWeight="bold" color="text.primary">
                                  {assignment.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontSize="10px" noWrap>
                                  {assignment.description}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            <Chip
                              label={getSubjectName(assignment.subjectId)}
                              color="primary"
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 500, fontSize: '11px' }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            <Box>
                              <Typography variant="body2" fontSize="13px">
                                {assignment.dueDate.toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" fontSize="10px">
                                {assignment.dueDate.toLocaleTimeString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            <Box>
                              <Typography variant="body2" fontSize="13px">
                                {status.submitted}/{status.total}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={(status.submitted / status.total) * 100}
                                sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            <Typography variant="body2" fontWeight="bold" fontSize="13px">
                              {averageScore}/{assignment.maxScore}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            <Chip
                              label={assignment.isActive ? 'Active' : 'Inactive'}
                              color={assignment.isActive ? 'success' : 'default'}
                              size="small"
                              sx={{ 
                                fontWeight: 500,
                                fontSize: '11px',
                                backgroundColor: assignment.isActive ? '#00C851' : '#f5f5f5',
                                color: assignment.isActive ? 'white' : '#666'
                              }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ py: 1.5 }}>
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                              <IconButton
                                size="small"
                                onClick={() => handleViewAssignment(assignment)}
                                sx={{ 
                                  color: '#8A2BE2',
                                  '&:hover': { backgroundColor: 'rgba(138, 43, 226, 0.1)' }
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleEditAssignment(assignment)}
                                sx={{ 
                                  color: '#8A2BE2',
                                  '&:hover': { backgroundColor: 'rgba(138, 43, 226, 0.1)' }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteAssignment(assignment.id)}
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
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Pagination */}
              <Box sx={{ p: 2.5, borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" fontSize="11px">
                  Showing 1-{assignments.length} of {assignments.length} assignments
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
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Recent Submissions
          </Typography>
          <List>
            {submissions.slice(0, 5).map((submission) => {
              const assignment = assignments.find(a => a.id === submission.assignmentId);
              const student = students.find(s => s.id === submission.studentId);
              return (
                <ListItem key={submission.id} divider>
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${student?.firstName} ${student?.lastName} - ${assignment?.title}`}
                    secondary={`Submitted: ${submission.submissionDate.toLocaleDateString()} | Score: ${submission.score}/${assignment?.maxScore}`}
                  />
                  <Chip
                    label={submission.status}
                    color={submission.status === 'graded' ? 'success' : 'warning'}
                    size="small"
                  />
                </ListItem>
              );
            })}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Pending Grades
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Assignment</TableCell>
                  <TableCell>Submission Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.filter(s => s.status !== 'graded').map((submission) => {
                  const assignment = assignments.find(a => a.id === submission.assignmentId);
                  const student = students.find(s => s.id === submission.studentId);
                  return (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {student?.firstName} {student?.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {student?.admissionNumber}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {assignment?.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getSubjectName(assignment?.subjectId || '')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {submission.submissionDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={submission.status}
                          color="warning"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<GradeIcon />}
                          onClick={() => {
                            // Handle grading
                          }}
                        >
                          Grade
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAssignment ? `Edit Assignment` : `Create New Assignment`}
        </DialogTitle>
        <DialogContent>
          <AssignmentForm
            assignment={editingAssignment}
            onSave={handleSaveAssignment}
            onCancel={() => setOpenDialog(false)}
            subjects={subjects}
            classes={classes}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

// Assignment Form Component
interface AssignmentFormProps {
  assignment: Assignment | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  subjects: any[];
  classes: Class[];
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ assignment, onSave, onCancel, subjects, classes }) => {
  const [formData, setFormData] = useState({
    title: assignment?.title || '',
    description: assignment?.description || '',
    subjectId: assignment?.subjectId || '',
    classId: assignment?.classId || '1',
    dueDate: assignment?.dueDate ? assignment.dueDate.toISOString().split('T')[0] : '',
    maxScore: assignment?.maxScore || 20,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Assignment Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="e.g., Mathematics Quiz - Chapter 1"
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
            placeholder="Describe the assignment requirements"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Subject</InputLabel>
            <Select
              value={formData.subjectId}
              label="Subject"
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
            >
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Class</InputLabel>
            <Select
              value={formData.classId}
              label="Class"
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            >
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.name} {cls.section}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Maximum Score"
            type="number"
            value={formData.maxScore}
            onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
            required
            inputProps={{ min: 1, max: 100 }}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" type="submit">
          {assignment ? 'Update' : 'Create'} Assignment
        </Button>
      </Box>
    </Box>
  );
};

export default AssignmentManagement; 