import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Book as BookIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useClassesRealtime, useStudentsRealtime, useAssignmentsRealtime, useResultsRealtime, useAttendanceRealtime } from '../hooks/useFirebaseData';
import { Student, Class, Attendance, Assignment, Result } from '../types';

interface TeacherDashboardProps {}

const TeacherDashboard: React.FC<TeacherDashboardProps> = () => {
  const { userProfile } = useAuth();
  const [assignedClass, setAssignedClass] = useState<Class | null>(null);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([]);
  const [recentResults, setRecentResults] = useState<Result[]>([]);

  // Use Firebase data instead of mock data
  const { data: allClasses } = useClassesRealtime();
  const { data: allStudents } = useStudentsRealtime();
  const { data: allAssignments } = useAssignmentsRealtime();
  const { data: allResults } = useResultsRealtime();
  const { data: allAttendance } = useAttendanceRealtime();

  // Filter classes for the current teacher
  const classes = allClasses.filter((cls: any) => cls.teacherId === userProfile?.id);

  // Filter students for the teacher's classes
  const students = allStudents.filter((student: any) => 
    classes.some((cls: any) => student.class === cls.name)
  );

  // Filter attendance records for the teacher's classes
  const attendanceRecords = allAttendance.filter((record: any) => 
    record.teacherId === userProfile?.id
  );

  // Filter assignments for the teacher's classes
  const assignments = allAssignments.filter((assignment: any) => 
    assignment.teacherId === userProfile?.id
  );

  // Filter results for the teacher's classes
  const results = allResults.filter((result: any) => 
    result.teacherId === userProfile?.id
  );

  useEffect(() => {
    // Find the teacher's assigned class
    const teacherClass = classes.find((cls: any) => cls.teacherId === userProfile?.id);
    if (teacherClass) {
      setAssignedClass(teacherClass as any);
      
      // Get students in this class
      const classStudentsList = students.filter((student: any) => 
        student.class === (teacherClass as any).name
      );
      setClassStudents(classStudentsList as any);
      
      // Get recent attendance for this class
      const classAttendance = attendanceRecords.filter((att: any) => 
        att.classId === (teacherClass as any).name
      );
      setRecentAttendance(classAttendance as any);
      
      // Get recent assignments for this class
      const classAssignments = assignments.filter((assign: any) => 
        assign.classId === (teacherClass as any).name
      );
      setRecentAssignments(classAssignments as any);
      
      // Get recent results for this class
      const classResults = results.filter((result: any) => 
        result.classId === (teacherClass as any).name
      );
      setRecentResults(classResults as any);
    }
  }, [classes, students, attendanceRecords, assignments, results, userProfile?.id]);

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      default: return 'default';
    }
  };

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircleIcon />;
      case 'absent': return <ScheduleIcon />;
      case 'late': return <ScheduleIcon />;
      default: return undefined;
    }
  };

  const getStudentName = (studentId: string) => {
    const student = (students as any[]).find((s: any) => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const getSubjectName = (subjectId: string) => {
    const subjects = [
      { id: '1', name: 'Mathematics' },
      { id: '2', name: 'English' },
      { id: '3', name: 'Science' },
    ];
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  if (!assignedClass) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No class has been assigned to you yet. Please contact the administrator.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Welcome back, {userProfile?.firstName} {userProfile?.lastName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your class today
        </Typography>
      </Box>

      {/* Class Information Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
                <SchoolIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {assignedClass.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Academic Year: {assignedClass.academicYear}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {assignedClass.subjects.map((subject, index) => (
                    <Chip
                      key={index}
                      label={subject}
                      size="small"
                      color="primary"
                      variant="outlined"
                      icon={<BookIcon />}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" color="primary">
                {assignedClass.currentEnrollment} / {assignedClass.capacity}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Students Enrolled
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

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
                    {classStudents.length}
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
                    Active Assignments
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {recentAssignments.filter(a => a.isActive).length}
                  </Typography>
                </Box>
                <AssignmentIcon sx={{ fontSize: 40, color: 'success.main' }} />
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
                    Average Score
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {recentResults.length > 0 
                      ? Math.round(recentResults.reduce((sum, r) => sum + r.score, 0) / recentResults.length)
                      : 0}%
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
                    Today's Attendance
                  </Typography>
                  <Typography variant="h4" color="secondary.main">
                    {recentAttendance.filter(a => a.status === 'present').length}/{classStudents.length}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Students List */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  My Students
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<VisibilityIcon />}
                >
                  View All
                </Button>
              </Box>
              <List>
                {classStudents.slice(0, 5).map((student, index) => (
                  <React.Fragment key={student.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {student.firstName.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${student.firstName} ${student.lastName}`}
                        secondary={`${student.admissionNumber} • ${student.gender}`}
                      />
                      <Chip
                        label={student.isActive ? 'Active' : 'Inactive'}
                        color={student.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </ListItem>
                    {index < classStudents.slice(0, 5).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              {classStudents.length > 5 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  +{classStudents.length - 5} more students
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Assignments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Assignments
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                >
                  Create New
                </Button>
              </Box>
              <List>
                {recentAssignments.slice(0, 3).map((assignment, index) => (
                  <React.Fragment key={assignment.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          <AssignmentIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={assignment.title}
                        secondary={`${getSubjectName(assignment.subjectId)} • Due: ${assignment.dueDate.toLocaleDateString()}`}
                      />
                      <Chip
                        label={`${assignment.maxScore} pts`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </ListItem>
                    {index < recentAssignments.slice(0, 3).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Results */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Results
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<GradeIcon />}
                >
                  Record Results
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Grade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentResults.slice(0, 5).map((result) => (
                      <TableRow key={result.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {getStudentName(result.studentId)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {getSubjectName(result.subjectId)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="primary" fontWeight="bold">
                            {result.score}/{result.maxScore}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={result.grade}
                            color={result.grade === 'A' ? 'success' : result.grade === 'B' ? 'primary' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Attendance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Today's Attendance
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CalendarIcon />}
                >
                  Mark Attendance
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentAttendance.map((attendance) => (
                      <TableRow key={attendance.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {getStudentName(attendance.studentId)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={attendance.status}
                            color={getAttendanceStatusColor(attendance.status)}
                            icon={getAttendanceIcon(attendance.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {attendance.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherDashboard; 