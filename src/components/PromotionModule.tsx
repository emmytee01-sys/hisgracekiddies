import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  LinearProgress,
  TextField,
} from '@mui/material';
import {
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Visibility as ViewIcon,
  PlayArrow as PromoteIcon,
  People as PeopleIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Student } from '../types';
import { getClassOptions } from '../utils/teacherUtils';

interface PromotionEligibility {
  studentId: string;
  studentName: string;
  currentClass: string;
  proposedClass: string;
  averageScore: number;
  isEligible: boolean;
  reason: string;
  status: 'eligible' | 'ineligible';
}

const PromotionModule: React.FC = () => {
  const { userProfile, hasRole } = useAuth();
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [eligibilityDialog, setEligibilityDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<PromotionEligibility | null>(null);

  // Mock promotion eligibility data
  const promotionEligibility: PromotionEligibility[] = [
    {
      studentId: '1',
      studentName: 'John Doe',
      currentClass: 'Primary 5',
      proposedClass: 'Primary 5',
      averageScore: 80,
      isEligible: true,
      reason: 'All subjects passed with average score above 50%',
      status: 'eligible',
    },
    {
      studentId: '2',
      studentName: 'Sarah Johnson',
      currentClass: 'Primary 5',
      proposedClass: 'Primary 5',
      averageScore: 71,
      isEligible: true,
      reason: 'All subjects passed with average score above 50%',
      status: 'eligible',
    },
    {
      studentId: '3',
      studentName: 'Michael Brown',
      currentClass: 'Primary 4',
      proposedClass: 'Primary 5',
      averageScore: 86,
      isEligible: true,
      reason: 'All subjects passed with excellent performance',
      status: 'eligible',
    },
  ];

  const classes = getClassOptions();

  const filteredEligibility = promotionEligibility.filter(eligibility => {
    const matchesClass = selectedClass === 'all' || eligibility.currentClass === selectedClass;
    const matchesSearch = eligibility.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const handleEligibilityDialog = (student: PromotionEligibility) => {
    setSelectedStudent(student);
    setEligibilityDialog(true);
  };

  const handlePromoteStudent = (studentId: string) => {
    console.log('Promoting student:', studentId);
    alert(`Promoting student ${studentId}`);
  };

  const handleBulkPromote = () => {
    const eligibleStudents = filteredEligibility.filter(e => e.isEligible);
    console.log('Bulk promoting students:', eligibleStudents.map(e => e.studentId));
    alert(`Promoting ${eligibleStudents.length} students`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary">
          Promotion Module
        </Typography>
        <Button
          variant="contained"
          startIcon={<PromoteIcon />}
          onClick={handleBulkPromote}
        >
          Promote All Eligible
        </Button>
      </Box>

      {/* Quick Stats */}
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
                    {filteredEligibility.length}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    Ready for promotion
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
                    Eligible Students
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {filteredEligibility.filter(e => e.isEligible).length}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    Meet criteria
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
                    Ineligible Students
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {filteredEligibility.filter(e => !e.isEligible).length}
                  </Typography>
                  <Typography variant="body2" color="error.main">
                    Need improvement
                  </Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: 40, color: 'error.main' }} />
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
                    Promotion Rate
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {filteredEligibility.length > 0 
                      ? Math.round((filteredEligibility.filter(e => e.isEligible).length / filteredEligibility.length) * 100)
                      : 0}%
                  </Typography>
                  <Typography variant="body2" color="info.main">
                    Success rate
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select
                  value={selectedClass}
                  label="Class"
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <MenuItem value="all">All Classes</MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Search Students"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Promotion Eligibility Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Promotion Eligibility
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Current Class</TableCell>
                  <TableCell>Proposed Class</TableCell>
                  <TableCell>Average Score</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEligibility.map((eligibility) => (
                  <TableRow key={eligibility.studentId} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {eligibility.studentName.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">{eligibility.studentName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {eligibility.currentClass}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="primary" fontWeight="bold">
                        {eligibility.proposedClass}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {eligibility.averageScore}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={eligibility.averageScore}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                          color={eligibility.averageScore >= 50 ? 'success' : 'error'}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={eligibility.status}
                        color={eligibility.status === 'eligible' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEligibilityDialog(eligibility)}
                          color="primary"
                        >
                          <ViewIcon />
                        </IconButton>
                        {eligibility.isEligible && (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handlePromoteStudent(eligibility.studentId)}
                          >
                            <PromoteIcon />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Student Eligibility Details Dialog */}
      <Dialog
        open={eligibilityDialog}
        onClose={() => setEligibilityDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Student Eligibility Details - {selectedStudent?.studentName}
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box>
              <Alert severity={selectedStudent.isEligible ? 'success' : 'error'} sx={{ mb: 2 }}>
                {selectedStudent.reason}
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Academic Performance
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Average Score
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {selectedStudent.averageScore}%
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Promotion Details
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Current Class
                          </Typography>
                          <Typography variant="body1">
                            {selectedStudent.currentClass}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Proposed Class
                          </Typography>
                          <Typography variant="body1" color="primary" fontWeight="bold">
                            {selectedStudent.proposedClass}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Eligibility Status
                          </Typography>
                          <Chip
                            label={selectedStudent.status}
                            color={selectedStudent.status === 'eligible' ? 'success' : 'error'}
                            size="small"
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEligibilityDialog(false)}>Close</Button>
          {selectedStudent?.isEligible && (
            <Button 
              variant="contained" 
              startIcon={<PromoteIcon />}
              onClick={() => handlePromoteStudent(selectedStudent.studentId)}
            >
              Promote Student
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PromotionModule; 