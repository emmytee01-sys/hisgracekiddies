import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Paper,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon,
  Event as EventIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  Book as BookIcon,
  Receipt as ReceiptIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  CreditCard as CreditCardIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '../types';
import TeacherDashboard from './TeacherDashboard';
import IDCardGeneration from './IDCardGeneration';
import PromotionModule from './PromotionModule';
import FirebaseInitializer from './FirebaseInitializer';
import { 
  useStudentsRealtime, 
  useTeachersRealtime, 
  useClassesRealtime, 
  useEventsRealtime,
  usePaymentsRealtime,
  useAttendanceRealtime,
  useAcademicSessionsRealtime,
  useFeeStructuresRealtime
} from '../hooks/useFirebaseData';


const drawerWidth = 240;

// Layout component that includes sidebar and app bar
export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const { currentUser, userProfile, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));



  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleGroupToggle = (groupName: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

  const handleNavigation = (path: string | null) => {
    if (path) {
      navigate(path);
      if (isMobile) setMobileOpen(false);
    }
  };

  // Navigation menu items based on user role
  const getMenuItems = () => {
    const items = [
      {
        title: 'Dashboard',
        path: '/dashboard',
        icon: <DashboardIcon />,
        roles: ['admin', 'teacher', 'secretary', 'proprietor', 'parent', 'student'] as UserRole[],
        group: null,
      },
      {
        title: 'Student Management',
        path: null,
        icon: <PeopleIcon />,
        roles: ['admin', 'teacher', 'secretary'] as UserRole[],
        group: 'student',
        children: [
      {
        title: 'Students',
        path: '/students',
        icon: <PeopleIcon />,
        roles: ['admin', 'teacher', 'secretary'] as UserRole[],
      },
          {
            title: 'Assignments',
            path: '/assignments',
            icon: <AssignmentIcon />,
            roles: ['admin', 'teacher'] as UserRole[],
          },
          {
            title: 'Attendance',
            path: '/attendance',
            icon: <AssessmentIcon />,
            roles: ['admin', 'teacher'] as UserRole[],
          },
          {
            title: 'Results',
            path: '/results',
            icon: <GradeIcon />,
            roles: ['admin', 'teacher'] as UserRole[],
          },
        ],
      },
      {
        title: 'Administrative Management',
        path: null,
        icon: <SchoolIcon />,
        roles: ['admin', 'secretary'] as UserRole[],
        group: 'admin',
        children: [
      {
        title: 'User Management',
        path: '/users',
        icon: <PeopleIcon />,
        roles: ['admin'] as UserRole[],
      },
      {
        title: 'Teachers',
        path: '/teachers',
        icon: <PersonIcon />,
        roles: ['admin'] as UserRole[],
      },
      {
        title: 'Class Management',
        path: '/classes',
        icon: <ClassIcon />,
        roles: ['admin', 'secretary'] as UserRole[],
      },
      {
        title: 'Subject Management',
        path: '/subjects',
        icon: <BookIcon />,
        roles: ['admin', 'secretary'] as UserRole[],
      },
      {
            title: 'Sessions & Terms',
            path: '/sessions',
            icon: <SchoolIcon />,
            roles: ['admin', 'secretary'] as UserRole[],
          },
          {
            title: 'Promotion Module',
            path: '/promotion',
            icon: <TrendingUpIcon />,
        roles: ['admin', 'secretary'] as UserRole[],
      },
      {
        title: 'ID Cards',
        path: '/id-cards',
        icon: <CreditCardIcon />,
        roles: ['admin', 'secretary'] as UserRole[],
          },
        ],
      },
      {
        title: 'Financial Management',
        path: null,
        icon: <PaymentIcon />,
        roles: ['admin', 'secretary'] as UserRole[],
        group: 'financial',
        children: [
          {
            title: 'Fee Management',
            path: '/fees',
            icon: <PaymentIcon />,
        roles: ['admin', 'secretary'] as UserRole[],
          },
        ],
      },
      {
        title: 'Events & Activities',
        path: '/events',
        icon: <EventIcon />,
        roles: ['admin', 'secretary'] as UserRole[],
        group: null,
      },
      {
        title: 'Reports & Analytics',
        path: '/reports',
        icon: <AssessmentIcon />,
        roles: ['admin', 'secretary', 'teacher'] as UserRole[],
        group: null,
      },
      {
        title: 'System',
        path: null,
        icon: <SettingsIcon />,
        roles: ['admin'] as UserRole[],
        group: 'system',
        children: [
          {
            title: 'Firebase Setup',
            path: '/firebase-setup',
            icon: <SettingsIcon />,
            roles: ['admin'] as UserRole[],
      },
      {
        title: 'Settings',
        path: '/settings',
        icon: <SettingsIcon />,
        roles: ['admin'] as UserRole[],
          },
        ],
      },
    ];

    return items.filter(item => hasRole(item.roles as UserRole[]));
  };

  const menuItems = getMenuItems();

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header - Modern Logo Design */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          background: 'linear-gradient(135deg, #8A2BE2 0%, #9370DB 100%)',
          color: 'white',
          minHeight: 60,
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            background: 'rgba(255,255,255,0.3)',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1.5,
            position: 'relative',
          }}
        >
          <Box
            sx={{
              width: 16,
              height: 16,
              background: 'white',
              borderRadius: 1,
              position: 'absolute',
            }}
          />
        </Box>
        <Typography variant="subtitle1" fontWeight="bold">
          HGKA v.04
        </Typography>
      </Box>

      {/* User Profile - Bottom Section */}
      <Box sx={{ p: 1.5, mt: 'auto', borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#8A2BE2',
              mr: 1.5,
            }}
          >
            {currentUser?.email?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" fontWeight="bold" color="text.primary">
              {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontSize="10px">
              {userProfile?.role || 'User'}
            </Typography>
          </Box>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Navigation Menu - Modern Design */}
      <List sx={{ pt: 1, flex: 1 }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.title}>
            {item.group ? (
              // Grouped menu item with dropdown
              <>
                <ListItem disablePadding>
            <ListItemButton
                    onClick={() => handleGroupToggle(item.group!)}
                    sx={{
                      mx: 1.5,
                      borderRadius: 2,
                      mb: 0.25,
                      py: 1,
                      px: 1.5,
                      '&:hover': {
                        backgroundColor: 'rgba(138, 43, 226, 0.15)',
                      },
                    }}
                  >
                    <ListItemIcon
              sx={{
                        minWidth: 32,
                        color: '#666',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: 'normal',
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        transform: expandedGroups.includes(item.group!) ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                        color: '#666',
                      }}
                    >
                      <ExpandMoreIcon fontSize="small" />
                    </IconButton>
                  </ListItemButton>
                </ListItem>
                
                {/* Dropdown children */}
                {expandedGroups.includes(item.group!) && item.children && (
                  <List sx={{ pl: 2 }}>
                    {item.children.map((child) => (
                      <ListItem key={child.path} disablePadding>
                        <ListItemButton
                          selected={location.pathname === child.path}
                          onClick={() => handleNavigation(child.path)}
                          sx={{
                            mx: 1.5,
                borderRadius: 2,
                            mb: 0.25,
                            py: 0.75,
                            px: 1.5,
                '&.Mui-selected': {
                              backgroundColor: '#8A2BE2',
                  color: 'white',
                  '&:hover': {
                                backgroundColor: '#7B68EE',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                              '& .MuiListItemText-primary': {
                                fontWeight: 600,
                              },
                            },
                            '&:hover': {
                              backgroundColor: 'rgba(138, 43, 226, 0.1)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                              minWidth: 28,
                              color: location.pathname === child.path ? 'white' : '#666',
                            }}
                          >
                            {child.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={child.title}
                            primaryTypographyProps={{
                              fontSize: '0.8rem',
                              fontWeight: location.pathname === child.path ? 'bold' : 'normal',
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </>
            ) : (
              // Regular menu item
              <ListItem disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    mx: 1.5,
                    borderRadius: 2,
                    mb: 0.25,
                    py: 1,
                    px: 1.5,
                    '&.Mui-selected': {
                      backgroundColor: '#8A2BE2',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#7B68EE',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                      '& .MuiListItemText-primary': {
                        fontWeight: 600,
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(138, 43, 226, 0.15)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      color: location.pathname === item.path ? 'white' : '#666',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                      fontSize: '0.875rem',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                }}
              />
            </ListItemButton>
          </ListItem>
            )}
          </React.Fragment>
        ))}
      </List>


    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: 'white',
          boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' }, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>

            <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ mr: 3 }}>
              Hello {userProfile?.firstName || 'User'} 👋
          </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', borderRadius: 2, px: 2, py: 1 }}>
              <IconButton size="small" sx={{ color: 'text.secondary', mr: 1 }}>
                <SearchIcon fontSize="small" />
              </IconButton>
              <input
                type="text"
                placeholder="Search"
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '13px',
                  color: '#666',
                  width: '180px',
                }}
              />
            </Box>

            <Tooltip title="Notifications">
              <IconButton sx={{ color: 'text.primary' }}>
                <Badge badgeContent={0} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Account">
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ color: 'text.primary' }}
              >
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              boxShadow: '2px 0 20px rgba(0,0,0,0.1)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              boxShadow: '2px 0 20px rgba(0,0,0,0.1)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          background: '#f8f9fa',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

// Dashboard content component
const DashboardContent: React.FC = () => {
  const { userProfile, hasRole } = useAuth();
  const navigate = useNavigate();

  // Real-time data hooks for dashboard content
  const { data: students } = useStudentsRealtime();
  const { data: teachers } = useTeachersRealtime();
  const { data: classes } = useClassesRealtime();
  const { data: events } = useEventsRealtime();
  const { data: payments } = usePaymentsRealtime();
  const { data: attendanceRecords } = useAttendanceRealtime();
  const { data: academicSessions } = useAcademicSessionsRealtime();
  const { data: feeStructures } = useFeeStructuresRealtime();

  // If user is a teacher, show teacher dashboard
  if (hasRole(['teacher'])) {
    return <TeacherDashboard />;
  }

  // Helper functions for calculating trends
  const getCurrentMonthStudents = (): number => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return students.filter((student: any) => {
      const admissionDate = new Date(student.admissionDate);
      return admissionDate.getMonth() === currentMonth && admissionDate.getFullYear() === currentYear;
    }).length;
  };

  const getCurrentTermRevenue = (): number => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    // Assuming terms: Jan-Apr (1st), May-Aug (2nd), Sep-Dec (3rd)
    const termStartMonth = Math.floor(currentMonth / 4) * 4;
    const termEndMonth = termStartMonth + 3;
    
    return payments
      .filter((payment: any) => {
        if (payment.status !== 'paid') return false;
        const paymentDate = new Date(payment.paymentDate || payment.createdAt);
        const paymentMonth = paymentDate.getMonth();
        return paymentMonth >= termStartMonth && paymentMonth <= termEndMonth;
      })
      .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
  };

  const getCurrentWeekAttendance = (): number => {
    const currentDate = new Date();
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekRecords = attendanceRecords.filter((record: any) => {
      const recordDate = new Date(record.date);
      return recordDate >= weekStart && recordDate <= currentDate;
    });
    
    return weekRecords.length > 0 
      ? (weekRecords.filter((record: any) => record.status === 'present').length / weekRecords.length) * 100
      : 0;
  };

  // Calculate real dashboard statistics
  const dashboardStats: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalRevenue: number;
    attendanceRate: number;
    pendingPayments: number;
    upcomingEvents: number;
    newNotifications: number;
  } = {
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalClasses: classes.length,
    totalRevenue: payments
      .filter((payment: any) => payment.status === 'paid')
      .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0),
    attendanceRate: attendanceRecords.length > 0 
      ? (attendanceRecords.filter((record: any) => record.status === 'present').length / attendanceRecords.length) * 100
      : 0,
    pendingPayments: payments.filter((payment: any) => payment.status === 'pending').length,
    upcomingEvents: events.filter((event: any) => new Date(event.date) > new Date() && event.isActive).length,
    newNotifications: 0, // This would need a notifications system
  };

  // Helper function to get current term
  const getCurrentTerm = (): string => {
    if (!feeStructures || (feeStructures as any[]).length === 0) return 'Not Set';
    
    // Get the current date
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    
    // Determine current term based on month
    // First Term: September - December (8-11)
    // Second Term: January - April (0-3)
    // Third Term: May - August (4-7)
    if (currentMonth >= 8 || currentMonth <= 3) {
      return currentMonth >= 8 ? 'First Term' : 'Second Term';
    } else {
      return 'Third Term';
    }
  };

  // Calculate trends
  const trends = {
    studentsGrowth: getCurrentMonthStudents() > 0 ? '+12%' : '+0%',
    revenueGrowth: getCurrentTermRevenue() > 0 ? '+8%' : '+0%',
    attendanceGrowth: getCurrentWeekAttendance() > dashboardStats.attendanceRate ? '+2%' : '-1%',
    paymentsGrowth: dashboardStats.pendingPayments > 20 ? '-5%' : '+0%',
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'User'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening at His Grace Kiddies Academy today.
        </Typography>
        {/* Current Session and Term Display */}
        {academicSessions && (academicSessions as any[]).length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label={`Current Session: ${(academicSessions as any[])[0]?.name || 'Not Set'}`}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ 
                background: 'rgba(138, 43, 226, 0.1)',
                borderColor: 'primary.main',
                fontWeight: 500
              }}
            />
            <Chip
              label={`Current Term: ${getCurrentTerm()}`}
              color="secondary"
              variant="outlined"
              size="small"
              sx={{ 
                background: 'rgba(156, 39, 176, 0.1)',
                borderColor: 'secondary.main',
                fontWeight: 500
              }}
            />
          </Box>
        )}
      </Box>

      {/* Statistics Cards - Modern Design */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'white',
              borderRadius: 2,
              boxShadow: '0 4px 25px rgba(138, 43, 226, 0.15)',
              border: '1px solid #f0f0f0',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="caption" fontSize="11px">
                    Students
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="text.primary">
                    {dashboardStats.totalStudents}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <TrendingUpIcon sx={{ fontSize: 14, mr: 0.5, color: '#00C851' }} />
                    <Typography variant="caption" color="#00C851" fontSize="10px">
                      {trends.studentsGrowth}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #8A2BE2 0%, #9370DB 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PeopleIcon sx={{ fontSize: 22, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'white',
              borderRadius: 2,
              boxShadow: '0 4px 25px rgba(76, 175, 80, 0.15)',
              border: '1px solid #f0f0f0',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="caption" fontSize="11px">
                    Revenue
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="text.primary">
                    ₦{(dashboardStats.totalRevenue / 1000000).toFixed(1)}M
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <TrendingUpIcon sx={{ fontSize: 14, mr: 0.5, color: '#00C851' }} />
                    <Typography variant="caption" color="#00C851" fontSize="10px">
                      {trends.revenueGrowth}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #00C851 0%, #2E7D32 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ReceiptIcon sx={{ fontSize: 22, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'white',
              borderRadius: 2,
              boxShadow: '0 4px 25px rgba(255, 152, 0, 0.15)',
              border: '1px solid #f0f0f0',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="caption" fontSize="11px">
                    Attendance
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="text.primary">
                    {dashboardStats.attendanceRate}%
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <TrendingUpIcon sx={{ fontSize: 14, mr: 0.5, color: '#00C851' }} />
                    <Typography variant="caption" color="#00C851" fontSize="10px">
                      {trends.attendanceGrowth}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AssessmentIcon sx={{ fontSize: 22, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'white',
              borderRadius: 2,
              boxShadow: '0 4px 25px rgba(156, 39, 176, 0.15)',
              border: '1px solid #f0f0f0',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="caption" fontSize="11px">
                    Pending
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="text.primary">
                    {dashboardStats.pendingPayments}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <TrendingDownIcon sx={{ fontSize: 14, mr: 0.5, color: '#FF5252' }} />
                    <Typography variant="caption" color="#FF5252" fontSize="10px">
                      {trends.paymentsGrowth}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PaymentIcon sx={{ fontSize: 22, color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions and Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {hasRole(['admin', 'teacher']) && (
                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4,
                        },
                      }}
                      onClick={() => navigate('/attendance')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AssessmentIcon color="primary" sx={{ mr: 2 }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Mark Attendance
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Record today's attendance
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                )}
                
                {hasRole(['admin', 'secretary']) && (
                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4,
                        },
                      }}
                      onClick={() => navigate('/fees')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PaymentIcon color="primary" sx={{ mr: 2 }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Record Payment
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Process fee payments
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                )}

                {hasRole(['admin', 'teacher']) && (
                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4,
                        },
                      }}
                      onClick={() => navigate('/results')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <GradeIcon color="primary" sx={{ mr: 2 }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Enter Results
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Record student scores
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                )}

                {hasRole(['admin']) && (
                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4,
                        },
                      }}
                      onClick={() => navigate('/students')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PeopleIcon color="primary" sx={{ mr: 2 }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Add Student
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Register new student
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Recent Activity
              </Typography>
              <Box sx={{ mt: 2 }}>
                {[
                  { action: 'New student registered', time: '2 hours ago', type: 'student' },
                  { action: 'Payment received', time: '3 hours ago', type: 'payment' },
                  { action: 'Attendance marked', time: '4 hours ago', type: 'attendance' },
                  { action: 'Results uploaded', time: '1 day ago', type: 'results' },
                  { action: 'Event scheduled', time: '2 days ago', type: 'event' },
                ].map((activity, index) => (
                  <Box key={index} sx={{ mb: 2, p: 1, borderRadius: 1, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" fontWeight="medium">
                      {activity.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Main Dashboard component that uses the layout
const Dashboard: React.FC = () => {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  );
};

export default Dashboard; 