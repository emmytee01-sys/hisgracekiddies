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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  CalendarToday as CalendarIcon,
  Class as ClassIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Block as BlockIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { Attendance, Student } from '../types';
import { getClassOptions } from '../utils/teacherUtils';
import { useAttendanceRealtime, useAttendanceRecords, useStudentsRealtime } from '../hooks/useFirebaseData';
import { toast } from 'react-toastify';

const AttendanceManagement: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [attendanceData, setAttendanceData] = useState<{ [key: string]: 'present' | 'absent' | 'late' }>({});

  const { data: studentsRt } = useStudentsRealtime();
  const students = (studentsRt as unknown as Student[]) || [];

  const { data: attendanceRt } = useAttendanceRealtime(selectedClass);
  const { addItem, updateItem, deleteItem } = useAttendanceRecords();

  const classes = getClassOptions();

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    loadAttendanceForDate(date);
  };

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
  };

  const loadAttendanceForDate = (date: string) => {
    const dateObj = new Date(date);
    const existingAttendance = ((attendanceRt as unknown as Attendance[]) || []).filter(
      record => new Date(record.date).toDateString() === dateObj.toDateString() && record.classId === selectedClass
    );
    const attendanceMap: { [key: string]: 'present' | 'absent' | 'late' } = {};
    existingAttendance.forEach(record => { attendanceMap[record.studentId] = record.status; });
    setAttendanceData(attendanceMap);
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    try {
      const records: Attendance[] = Object.entries(attendanceData).map(([studentId, status]) => ({
        id: '',
        studentId,
        classId: selectedClass,
        date: new Date(selectedDate),
        status,
        teacherId: 'teacher1',
      }));

      // Persist each (simple approach)
      await Promise.all(records.map(r => addItem({ ...r, date: new Date(selectedDate) })));
      toast.success('Attendance saved');
      setOpenDialog(false);
    } catch { toast.error('Failed to save attendance'); }
  };

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
      case 'present': return <CheckCircleIcon color="success" />;
      case 'absent': return <CancelIcon color="error" />;
      case 'late': return <ScheduleIcon color="warning" />;
      default: return undefined;
    }
  };

  const filteredStudents = students.filter(student => 
    !selectedClass || student.class === selectedClass
  );

  const attendanceStats = {
    present: Object.values(attendanceData).filter(status => status === 'present').length,
    absent: Object.values(attendanceData).filter(status => status === 'absent').length,
    late: Object.values(attendanceData).filter(status => status === 'late').length,
    total: filteredStudents.length,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary">
          Attendance Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => setOpenDialog(true)}
          disabled={!selectedClass || !selectedDate}
        >
          Mark Attendance
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={selectedClass}
                  label="Class"
                  onChange={(e) => handleClassChange(e.target.value)}
                >
                  <MenuItem value="">All Classes</MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Select a date and class to mark attendance
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistics */}
      {selectedClass && (
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
                      {attendanceStats.total}
                    </Typography>
                  </Box>
                  <ClassIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                      Present
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {attendanceStats.present}
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
                      Late
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {attendanceStats.late}
                    </Typography>
                  </Box>
                  <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main' }} />
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
                      Absent
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      {attendanceStats.absent}
                    </Typography>
                  </Box>
                  <CancelIcon sx={{ fontSize: 40, color: 'error.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Students List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Students {selectedClass && `- ${selectedClass}`}
          </Typography>
          
          {filteredStudents.length === 0 ? (
            <Alert severity="info">
              {selectedClass ? 'No students found in this class.' : 'Please select a class to view students.'}
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Admission No.</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Attendance Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {student.firstName} {student.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell>{student.admissionNumber}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>
                        <Chip
                          label={student.gender}
                          color={student.gender === 'male' ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {attendanceData[student.id] ? (
                          <Chip
                            label={attendanceData[student.id]}
                            color={getAttendanceStatusColor(attendanceData[student.id])}
                            icon={getAttendanceIcon(attendanceData[student.id])}
                            size="small"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not marked
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleAttendanceChange(student.id, 'present')}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleAttendanceChange(student.id, 'late')}
                          >
                            <ScheduleIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleAttendanceChange(student.id, 'absent')}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Attendance Records
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {((attendanceRt as unknown as Attendance[]) || []).slice(0, 10).map((record) => {
                  const student = students.find(s => s.id === record.studentId);
                  return (
                    <TableRow key={record.id}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {student ? `${student.firstName} ${student.lastName}` : 'Unknown'}
                      </TableCell>
                      <TableCell>{record.classId}</TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          color={getAttendanceStatusColor(record.status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Save Attendance Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Mark Attendance - {selectedDate}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to save the attendance for {selectedClass} on {selectedDate}?
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Summary:
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Typography variant="body2" color="success.main">
                  Present: {attendanceStats.present}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="warning.main">
                  Late: {attendanceStats.late}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="error.main">
                  Absent: {attendanceStats.absent}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveAttendance} variant="contained">
            Save Attendance
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceManagement; 