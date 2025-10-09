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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Alert,
  Container,
  Breadcrumbs,
  CircularProgress,
  Link,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  FamilyRestroom as FamilyRestroomIcon,
  School as StudentIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { User, UserRole } from '../types';
import { useUsersRealtime } from '../hooks/useFirebaseData';
import { createUser, updateUser, deleteUser } from '../services/firebaseService';

const UserManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [dialogType, setDialogType] = useState<'teacher' | 'secretary' | 'parent' | 'student'>('teacher');
  const [editingItem, setEditingItem] = useState<any>(null);

  // Use Firebase data instead of mock data
  const { data: users, loading, error } = useUsersRealtime();

  const classes = ['Primary 1A', 'Primary 2A', 'Primary 3A', 'Primary 4A', 'Primary 5A', 'Primary 6A'];
  const subjects = ['Mathematics', 'English', 'Science', 'Social Studies'];

  const handleAddUser = (type: 'teacher' | 'secretary' | 'parent' | 'student') => {
    setDialogType(type);
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEditUser = (user: any, type: 'teacher' | 'secretary' | 'parent' | 'student') => {
    setDialogType(type);
    setEditingItem(user);
    setShowForm(true);
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
      // Refresh data after deletion
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleSaveUser = async (data: any) => {
    try {
      if (editingItem) {
        await updateUser(editingItem.id, data);
      } else {
        const newUser = {
          email: data.email,
          role: dialogType,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          isActive: true,
          createdAt: new Date(),
        };
        await createUser(newUser);
      }
      setShowForm(false);
      setEditingItem(null);
      // Refresh data after save
      window.location.reload();
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'error';
      case 'teacher': return 'primary';
      case 'secretary': return 'secondary';
      case 'parent': return 'info';
      case 'student': return 'success';
      default: return 'default';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <PersonIcon />;
      case 'teacher': return <SchoolIcon />;
      case 'secretary': return <PeopleIcon />;
      case 'parent': return <FamilyRestroomIcon />;
      case 'student': return <StudentIcon />;
      default: return <PersonIcon />;
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingItem(null);
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
                Back to Users
              </Link>
            </Breadcrumbs>
            <Typography variant="h4" color="primary" gutterBottom>
              {editingItem ? `Edit ${dialogType}` : `Add New ${dialogType}`}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Fill in the user information below.
            </Typography>
          </Paper>
          
          <UserForm
            user={editingItem}
            type={dialogType}
            onSave={handleSaveUser}
            onCancel={handleCancelForm}
            classes={classes}
            subjects={subjects}
          />
        </Container>
      </Box>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load users: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary">
          User Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAddUser('teacher')}
          >
            Add Teacher
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleAddUser('secretary')}
          >
            Add Secretary
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleAddUser('parent')}
          >
            Add Parent
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleAddUser('student')}
          >
            Add Student
          </Button>
        </Box>
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
                    {(users as any[]).filter((u: any) => u.role === 'teacher').length}
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
                    {(users as any[]).filter((u: any) => u.role === 'student').length}
                  </Typography>
                </Box>
                <StudentIcon sx={{ fontSize: 40, color: 'success.main' }} />
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
                    Total Parents
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {(users as any[]).filter((u: any) => u.role === 'parent').length}
                  </Typography>
                </Box>
                <FamilyRestroomIcon sx={{ fontSize: 40, color: 'info.main' }} />
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
                    Active Users
                  </Typography>
                  <Typography variant="h4" color="secondary.main">
                    {(users as any[]).filter((u: any) => u.isActive).length}
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Users Table - Modern Design */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 4px 25px rgba(138, 43, 226, 0.15)', border: '1px solid #f0f0f0' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid #f0f0f0' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Users
            </Typography>
            <Typography variant="caption" color="text.secondary" fontSize="11px">
              Active Members
            </Typography>
          </Box>
          
          <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', borderRadius: 2, px: 2, py: 1, flex: 1, maxWidth: 280 }}>
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
                <option>Role</option>
              </select>
            </Box>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(users as any[]).map((user: any) => (
                  <TableRow key={user.id} hover sx={{ '&:hover': { backgroundColor: 'rgba(138, 43, 226, 0.05)' } }}>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1.5, bgcolor: '#8A2BE2', width: 28, height: 28 }}>
                          {user.firstName?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold" color="text.primary">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontSize="10px">
                            ID: {user.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" color="text.primary" fontSize="13px">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={user.role}
                        color={getRoleColor(user.role)}
                        size="small"
                        sx={{ fontWeight: 500, fontSize: '11px' }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" color="text.primary" fontSize="13px">
                        {user.phoneNumber}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                        sx={{ 
                          fontWeight: 500,
                          fontSize: '11px',
                          backgroundColor: user.isActive ? '#00C851' : '#f5f5f5',
                          color: user.isActive ? 'white' : '#666'
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditUser(user, user.role as any)}
                          sx={{ 
                            color: '#8A2BE2',
                            '&:hover': { backgroundColor: 'rgba(138, 43, 226, 0.1)' }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteUser(user.id)}
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
              Showing 1-8 of 256K
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>
              <Box sx={{ display: 'flex', gap: 0.25 }}>
                {[1, 2, 3, 4].map((page) => (
                  <IconButton
                    key={page}
                    size="small"
                    sx={{
                      minWidth: 28,
                      height: 28,
                      backgroundColor: page === 1 ? '#8A2BE2' : 'transparent',
                      color: page === 1 ? 'white' : 'text.secondary',
                      fontSize: '12px',
                      '&:hover': {
                        backgroundColor: page === 1 ? '#7B68EE' : 'rgba(138, 43, 226, 0.1)',
                      },
                    }}
                  >
                    {page}
                  </IconButton>
                ))}
                <Typography variant="caption" color="text.secondary" sx={{ mx: 0.5 }} fontSize="10px">
                  ...
                </Typography>
                <IconButton
                  size="small"
                  sx={{
                    minWidth: 28,
                    height: 28,
                    color: 'text.secondary',
                    fontSize: '12px',
                    '&:hover': { backgroundColor: 'rgba(138, 43, 226, 0.1)' },
                  }}
                >
                  40
                </IconButton>
              </Box>
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <ArrowForwardIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

// User Form Component
interface UserFormProps {
  user: User | null;
  type: 'teacher' | 'secretary' | 'parent' | 'student';
  onSave: (data: any) => void;
  onCancel: () => void;
  classes: string[];
  subjects: string[];
}

const UserForm: React.FC<UserFormProps> = ({ user, type, onSave, onCancel, classes, subjects }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    qualification: '',
    subjects: [] as string[],
    classes: [] as string[],
    address: '',
    occupation: '',
    relationship: 'father' as 'father' | 'mother' | 'guardian',
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female',
    class: '',
    section: 'A',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

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

        {type === 'teacher' && (
          <>
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
                  value={formData.class}
                  label="Assigned Class"
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                >
                  <MenuItem value="">No Class Assigned</MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls} value={cls}>
                      {cls} ({cls} students)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </>
        )}

        {type === 'parent' && (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Occupation"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Relationship</InputLabel>
                <Select
                  value={formData.relationship}
                  label="Relationship"
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value as 'father' | 'mother' | 'guardian' })}
                >
                  <MenuItem value="father">Father</MenuItem>
                  <MenuItem value="mother">Mother</MenuItem>
                  <MenuItem value="guardian">Guardian</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        )}

        {type === 'student' && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
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
              <FormControl fullWidth required>
                <InputLabel>Class</InputLabel>
                <Select
                  value={formData.class}
                  label="Class"
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Section</InputLabel>
                <Select
                  value={formData.section}
                  label="Section"
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                >
                  <MenuItem value="A">A</MenuItem>
                  <MenuItem value="B">B</MenuItem>
                  <MenuItem value="C">C</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        )}
      </Grid>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Temporary Password:</strong> {formData.lastName} (last name in lowercase)
        </Typography>
      </Alert>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" type="submit" startIcon={<SaveIcon />}>
          {user ? 'Update' : 'Add'} {type.charAt(0).toUpperCase() + type.slice(1)}
        </Button>
      </Box>
      </Box>
    </Paper>
  );
};

export default UserManagement; 