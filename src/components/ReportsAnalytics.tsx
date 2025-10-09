import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon,
  Grade as GradeIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { filterStudentsByTeacher, getClassOptions } from '../utils/teacherUtils';
import { Student } from '../types';
import { useStudentsRealtime, useClassesRealtime } from '../hooks/useFirebaseData';

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

const ReportsAnalytics: React.FC = () => {
  const { userProfile, hasRole } = useAuth();
  const { data: allStudents } = useStudentsRealtime();
  const { data: classes } = useClassesRealtime();
  const [tabValue, setTabValue] = useState(0);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  // Mock students data for filtering - TODO: Replace with real data
  const mockStudents = [
    { 
      id: '1', 
      admissionNumber: 'HGA001',
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'Michael',
      class: 'Primary 5', 
      section: '',
      parentId: 'parent1',
      address: '123 Main Street',
      dateOfBirth: new Date('2010-05-15'),
      gender: 'male' as const,
      admissionDate: new Date('2023-09-01'),
      isActive: true,
      userId: '4',
    },
    { 
      id: '2', 
      admissionNumber: 'HGA002',
      firstName: 'Sarah',
      lastName: 'Johnson',
      middleName: 'Elizabeth',
      class: 'Primary 5', 
      section: '',
      parentId: 'parent2',
      address: '456 Oak Avenue',
      dateOfBirth: new Date('2011-03-20'),
      gender: 'female' as const,
      admissionDate: new Date('2023-09-01'),
      isActive: true,
      userId: '5',
    },
    { 
      id: '3', 
      admissionNumber: 'HGA003',
      firstName: 'Michael',
      lastName: 'Brown',
      middleName: 'David',
      class: 'Primary 5', 
      section: '',
      parentId: 'parent3',
      address: '789 Pine Street',
      dateOfBirth: new Date('2010-08-10'),
      gender: 'male' as const,
      admissionDate: new Date('2023-09-01'),
      isActive: true,
      userId: '6',
    },
    { 
      id: '4', 
      admissionNumber: 'HGA004',
      firstName: 'Emma',
      lastName: 'Wilson',
      middleName: 'Grace',
      class: 'Primary 4', 
      section: '',
      parentId: 'parent4',
      address: '321 Elm Street',
      dateOfBirth: new Date('2011-12-05'),
      gender: 'female' as const,
      admissionDate: new Date('2023-09-01'),
      isActive: true,
      userId: '7',
    },
    { 
      id: '5', 
      admissionNumber: 'HGA005',
      firstName: 'David',
      lastName: 'Lee',
      middleName: 'James',
      class: 'Primary 5', 
      section: '',
      parentId: 'parent5',
      address: '654 Maple Avenue',
      dateOfBirth: new Date('2009-07-15'),
      gender: 'male' as const,
      admissionDate: new Date('2023-09-01'),
      isActive: true,
      userId: '8',
    },
  ];

  // Filter students based on user role
  const filteredStudents = hasRole(['teacher']) 
    ? filterStudentsByTeacher(allStudents as Student[], userProfile?.id || '', classes as any[])
    : allStudents;

  // Mock data for charts - filtered by teacher's class if applicable
  const attendanceData = hasRole(['teacher']) ? [
    { month: 'Jan', present: 22, absent: 3, late: 2 },
    { month: 'Feb', present: 24, absent: 1, late: 1 },
    { month: 'Mar', present: 23, absent: 2, late: 2 },
    { month: 'Apr', present: 25, absent: 0, late: 0 },
    { month: 'May', present: 24, absent: 1, late: 1 },
    { month: 'Jun', present: 25, absent: 0, late: 0 },
  ] : [
    { month: 'Jan', present: 85, absent: 15, late: 5 },
    { month: 'Feb', present: 88, absent: 12, late: 3 },
    { month: 'Mar', present: 82, absent: 18, late: 7 },
    { month: 'Apr', present: 90, absent: 10, late: 2 },
    { month: 'May', present: 87, absent: 13, late: 4 },
    { month: 'Jun', present: 92, absent: 8, late: 1 },
  ];

  const academicPerformance = hasRole(['teacher']) ? [
    { subject: 'Mathematics', average: 85, excellent: 8, good: 12, needsImprovement: 5 },
    { subject: 'English', average: 88, excellent: 10, good: 12, needsImprovement: 3 },
    { subject: 'Science', average: 82, excellent: 7, good: 13, needsImprovement: 5 },
    { subject: 'Social Studies', average: 86, excellent: 9, good: 11, needsImprovement: 5 },
  ] : [
    { subject: 'Mathematics', average: 78, excellent: 25, good: 45, needsImprovement: 30 },
    { subject: 'English', average: 82, excellent: 30, good: 50, needsImprovement: 20 },
    { subject: 'Science', average: 75, excellent: 20, good: 40, needsImprovement: 40 },
    { subject: 'Social Studies', average: 80, excellent: 28, good: 48, needsImprovement: 24 },
  ];

  const feeCollectionData = [
    { month: 'Jan', collected: 450000, pending: 50000, total: 500000 },
    { month: 'Feb', collected: 480000, pending: 20000, total: 500000 },
    { month: 'Mar', collected: 420000, pending: 80000, total: 500000 },
    { month: 'Apr', collected: 500000, pending: 0, total: 500000 },
    { month: 'May', collected: 470000, pending: 30000, total: 500000 },
    { month: 'Jun', collected: 490000, pending: 10000, total: 500000 },
  ];

  const studentDistribution = hasRole(['teacher']) ? [
    { name: 'Primary 5', value: 25, color: '#8884d8' },
  ] : [
    { name: 'Primary 1', value: 25, color: '#8884d8' },
    { name: 'Primary 2', value: 28, color: '#82ca9d' },
    { name: 'Primary 3', value: 22, color: '#ffc658' },
    { name: 'Primary 4', value: 30, color: '#ff7300' },
    { name: 'Primary 5', value: 26, color: '#00C49F' },
  ];

  const topPerformers = hasRole(['teacher']) ? [
    { name: 'John Doe', class: 'Primary 5', average: 92, rank: 1 },
    { name: 'Sarah Johnson', class: 'Primary 5', average: 89, rank: 2 },
    { name: 'Michael Brown', class: 'Primary 5', average: 87, rank: 3 },
  ] : [
    { name: 'John Doe', class: 'Primary 5', average: 92, rank: 1 },
    { name: 'Jane Smith', class: 'Primary 4', average: 89, rank: 2 },
    { name: 'Michael Johnson', class: 'Primary 5', average: 87, rank: 3 },
    { name: 'Sarah Wilson', class: 'Primary 3', average: 85, rank: 4 },
    { name: 'David Brown', class: 'Primary 5', average: 83, rank: 5 },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary">
          {hasRole(['teacher']) ? 'My Class Reports' : 'Reports & Analytics'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
          >
            Filter
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
          >
            Print
          </Button>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {hasRole(['teacher']) ? 'My Students' : 'Total Students'}
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {hasRole(['teacher']) ? filteredStudents.length : 155}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +5% from last month
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
                    Average Attendance
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    87%
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +2% from last month
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
                    Academic Performance
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    79%
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +3% from last term
                  </Typography>
                </Box>
                <GradeIcon sx={{ fontSize: 40, color: 'info.main' }} />
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
                    Fee Collection
                  </Typography>
                  <Typography variant="h4" color="secondary.main">
                    94%
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +1% from last month
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={selectedClass}
                  label="Class"
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <MenuItem value="all">All Classes</MenuItem>
                  <MenuItem value="primary1">Primary 1</MenuItem>
                  <MenuItem value="primary2">Primary 2</MenuItem>
                  <MenuItem value="primary3">Primary 3</MenuItem>
                  <MenuItem value="primary4">Primary 4</MenuItem>
                  <MenuItem value="primary5">Primary 5</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Period</InputLabel>
                <Select
                  value={selectedPeriod}
                  label="Period"
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <MenuItem value="current">Current Term</MenuItem>
                  <MenuItem value="last">Last Term</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search"
                placeholder="Search reports..."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Academic Performance" />
            <Tab label="Attendance Reports" />
            <Tab label="Financial Reports" />
            <Tab label="Student Analytics" />
            <Tab label="Teacher Performance" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Academic Performance Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={academicPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="average" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top Performers
                  </Typography>
                  <List>
                    {topPerformers.map((student, index) => (
                      <ListItem key={index} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: index < 3 ? 'primary.main' : 'grey.500' }}>
                            {student.rank}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={student.name}
                          secondary={`${student.class} - ${student.average}%`}
                        />
                        <Chip
                          label={`${student.average}%`}
                          color={student.average >= 90 ? 'success' : 'primary'}
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Subject-wise Performance
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Subject</TableCell>
                          <TableCell>Average Score</TableCell>
                          <TableCell>Excellent (90%+)</TableCell>
                          <TableCell>Good (70-89%)</TableCell>
                          <TableCell>Needs Improvement</TableCell>
                          <TableCell>Progress</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {academicPerformance.map((subject) => (
                          <TableRow key={subject.subject}>
                            <TableCell>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {subject.subject}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="h6" color="primary">
                                {subject.average}%
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ mr: 1 }}>
                                  {subject.excellent}%
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={subject.excellent}
                                  sx={{ width: 60, height: 8, borderRadius: 4 }}
                                  color="success"
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ mr: 1 }}>
                                  {subject.good}%
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={subject.good}
                                  sx={{ width: 60, height: 8, borderRadius: 4 }}
                                  color="primary"
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ mr: 1 }}>
                                  {subject.needsImprovement}%
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={subject.needsImprovement}
                                  sx={{ width: 60, height: 8, borderRadius: 4 }}
                                  color="warning"
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={subject.average >= 80 ? 'Excellent' : subject.average >= 70 ? 'Good' : 'Needs Work'}
                                color={subject.average >= 80 ? 'success' : subject.average >= 70 ? 'primary' : 'warning'}
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
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Attendance Trend (6 Months)
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="present" stroke="#82ca9d" strokeWidth={2} />
                      <Line type="monotone" dataKey="absent" stroke="#ff7300" strokeWidth={2} />
                      <Line type="monotone" dataKey="late" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Attendance Summary
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Present Rate
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      87%
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Absent Rate
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      12%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Late Rate
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      3.7%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Fee Collection Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={feeCollectionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="collected" fill="#82ca9d" />
                      <Bar dataKey="pending" fill="#ff7300" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Financial Summary
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Collected
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      ₦2.81M
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Pending Collection
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      ₦190K
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Collection Rate
                    </Typography>
                    <Typography variant="h4" color="primary.main">
                      94%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Student Distribution by Class
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={studentDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {studentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Student Demographics
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Gender Distribution
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Chip label="Male: 78 students" color="primary" />
                      <Chip label="Female: 77 students" color="secondary" />
                    </Box>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Age Distribution
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Chip label="5-7 years: 45" color="success" />
                      <Chip label="8-10 years: 68" color="info" />
                      <Chip label="11-12 years: 42" color="warning" />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Academic Status
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Chip label="Excellent: 35" color="success" />
                      <Chip label="Good: 85" color="primary" />
                      <Chip label="Average: 35" color="warning" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Teacher Performance Overview
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Teacher</TableCell>
                          <TableCell>Class</TableCell>
                          <TableCell>Students</TableCell>
                          <TableCell>Average Attendance</TableCell>
                          <TableCell>Average Performance</TableCell>
                          <TableCell>Assignments Given</TableCell>
                          <TableCell>Rating</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Sarah Johnson</TableCell>
                          <TableCell>Primary 1A</TableCell>
                          <TableCell>25</TableCell>
                          <TableCell>92%</TableCell>
                          <TableCell>85%</TableCell>
                          <TableCell>12</TableCell>
                          <TableCell>
                            <Chip label="Excellent" color="success" size="small" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>David Wilson</TableCell>
                          <TableCell>Primary 2A</TableCell>
                          <TableCell>28</TableCell>
                          <TableCell>88%</TableCell>
                          <TableCell>82%</TableCell>
                          <TableCell>15</TableCell>
                          <TableCell>
                            <Chip label="Good" color="primary" size="small" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Mary Thompson</TableCell>
                          <TableCell>Primary 3A</TableCell>
                          <TableCell>22</TableCell>
                          <TableCell>85%</TableCell>
                          <TableCell>78%</TableCell>
                          <TableCell>10</TableCell>
                          <TableCell>
                            <Chip label="Good" color="primary" size="small" />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default ReportsAnalytics; 