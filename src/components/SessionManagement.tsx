import React, { useState } from 'react';
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
  Tabs,
  Tab,
  Container,
  Breadcrumbs,
  Link,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
} from '@mui/material';
import ModernTable, { TableColumn, TableAction } from './common/ModernTable';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  School as SchoolIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { AcademicSession, FeeStructure } from '../types';
import { useAcademicSessionsRealtime, useAcademicSessions, useFeeStructuresRealtime, useFeeStructures } from '../hooks/useFirebaseData';
import { toast } from 'react-toastify';

// Helper function to safely convert Firestore timestamps to Date objects
const safeToDate = (dateValue: any): Date => {
  if (dateValue instanceof Date) return dateValue;
  if (dateValue && typeof dateValue.toDate === 'function') return dateValue.toDate();
  if (dateValue && typeof dateValue.seconds === 'number') {
    return new Date(dateValue.seconds * 1000);
  }
  return new Date(dateValue);
};

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

const SessionManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [dialogType, setDialogType] = useState<'session' | 'fee'>('session');
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Modal state for notifications
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning'>('success');

  // Helper function to show modal notifications
  const showModal = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setModalMessage(message);
    setModalType(type);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const { data: sessionsRt } = useAcademicSessionsRealtime();
  const { addItem: addSession, updateItem: updateSession, deleteItem: deleteSession } = useAcademicSessions();

  const { data: feesRt } = useFeeStructuresRealtime();
  const { addItem: addFee, updateItem: updateFee, deleteItem: deleteFee } = useFeeStructures();

  const sessions = (sessionsRt as unknown as AcademicSession[]) || [];
  const feeStructures = (feesRt as unknown as FeeStructure[]) || [];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => setTabValue(newValue);

  const handleAddSession = () => { setDialogType('session'); setEditingItem(null); setShowForm(true); };
  const handleAddFeeStructure = () => { setDialogType('fee'); setEditingItem(null); setShowForm(true); };
  const handleEditItem = (item: any, type: 'session' | 'fee') => { setDialogType(type); setEditingItem(item); setShowForm(true); };

  const validateSession = (data: any) => {
    if (!data.name) return 'Session name is required';
    if (!data.startDate) return 'Start date is required';
    if (!data.endDate) return 'End date is required';
    return null;
  };

  const validateFee = (data: any) => {
    if (!data.classId || data.classId.trim() === '') return 'Class is required';
    if (!data.term || data.term.trim() === '') return 'Term is required';
    if (!data.academicYear || data.academicYear.trim() === '') return 'Academic year is required';
    if (!data.dueDate || data.dueDate.trim() === '') return 'Due date is required';
    if (!data.fees || typeof data.fees !== 'object') return 'Fee structure is required';
    
    // Check if at least one fee is greater than 0
    const totalFees = Object.values(data.fees).reduce((sum: number, fee: any) => sum + (Number(fee) || 0), 0);
    if (totalFees <= 0) return 'At least one fee amount must be greater than 0';
    
    return null;
  };

  const handleDeleteItem = async (id: string, type: 'session' | 'fee') => {
    try {
      if (type === 'session') await deleteSession(id); else await deleteFee(id);
      showModal('Deleted successfully', 'success');
    } catch { showModal('Delete failed', 'error'); }
  };

  const handleSaveItem = async (data: any) => {
    try {
      if (dialogType === 'session') {
        const err = validateSession(data); if (err) { showModal(err, 'error'); return; }
        const payload = {
          name: data.name,
          startDate: new Date(data.startDate || new Date()),
          endDate: new Date(data.endDate || new Date()),
          isActive: !!data.isActive,
          currentTerm: data.currentTerm || 'First Term',
          terms: data.terms || { first: { startDate: new Date(), endDate: new Date() }, second: { startDate: new Date(), endDate: new Date() }, third: { startDate: new Date(), endDate: new Date() } },
        } as Omit<AcademicSession, 'id'>;
        if (editingItem) await updateSession(editingItem.id, payload as Partial<AcademicSession>); else await addSession(payload);
      } else {
        const err = validateFee(data); if (err) { showModal(err, 'error'); return; }
        const payload = {
          classId: data.classId,
          term: data.term,
          academicYear: data.academicYear,
          fees: data.fees,
          dueDate: new Date(data.dueDate || new Date()),
        } as Omit<FeeStructure, 'id'>;
        if (editingItem) await updateFee(editingItem.id, payload as Partial<FeeStructure>); else await addFee(payload);
      }
      showModal('Saved successfully', 'success');
      setShowForm(false);
    } catch {
      showModal('Save failed', 'error');
    }
  };

  const handleArchiveSession = (sessionId: string) => {
    updateSession(sessionId, { isActive: false });
    showModal('Session archived', 'success');
  };

  const handleUpdateCurrentTerm = async () => {
    const activeSession = sessions.find(s => s.isActive);
    if (!activeSession) {
      showModal('No active session found', 'error');
      return;
    }

    // Calculate current term based on month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    
    let newTerm: 'First Term' | 'Second Term' | 'Third Term';
    if (currentMonth >= 8 || currentMonth <= 3) {
      newTerm = currentMonth >= 8 ? 'First Term' : 'Second Term';
    } else {
      newTerm = 'Third Term';
    }

    try {
      await updateSession(activeSession.id, { currentTerm: newTerm });
      showModal(`Current term updated to ${newTerm}`, 'success');
    } catch {
      showModal('Failed to update current term', 'error');
    }
  };

  const handleUpdateSessionTerm = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
      showModal('Session not found', 'error');
      return;
    }

    // Calculate current term based on month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    
    let newTerm: 'First Term' | 'Second Term' | 'Third Term';
    if (currentMonth >= 8 || currentMonth <= 3) {
      newTerm = currentMonth >= 8 ? 'First Term' : 'Second Term';
    } else {
      newTerm = 'Third Term';
    }

    try {
      await updateSession(sessionId, { currentTerm: newTerm });
      showModal(`Session term updated to ${newTerm}`, 'success');
    } catch {
      showModal('Failed to update session term', 'error');
    }
  };

  const getTotalFees = (fees: Record<string, number>) => {
    return Object.values(fees).reduce((sum, fee) => sum + fee, 0);
  };

  // Helper function to get current term from active sessions
  const getCurrentTermFromSessions = (): string => {
    const activeSession = sessions.find(s => s.isActive);
    if (!activeSession) return 'No Active Session';
    
    // If session has currentTerm set, use it
    if (activeSession.currentTerm) {
      return activeSession.currentTerm;
    }
    
    // Otherwise, calculate based on current month
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
                Back to Sessions
              </Link>
            </Breadcrumbs>
            <Typography variant="h4" color="primary" gutterBottom>
              {editingItem ? `Edit ${dialogType === 'session' ? 'Session' : 'Fee Structure'}` : `Add New ${dialogType === 'session' ? 'Session' : 'Fee Structure'}`}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Fill in the information below.
            </Typography>
          </Paper>
          
          {dialogType === 'session' ? (
            <SessionForm
              session={editingItem}
              onSave={handleSaveItem}
              onCancel={handleCancelForm}
            />
          ) : (
            <FeeStructureForm
              fee={editingItem}
              onSave={handleSaveItem}
              onCancel={handleCancelForm}
              sessions={sessions}
            />
          )}
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary">
          Session & Term Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddSession}
          >
            New Session
          </Button>
          <Button
            variant="outlined"
            startIcon={<PaymentIcon />}
            onClick={handleAddFeeStructure}
          >
            Add Fee Structure
          </Button>
          <Button
            variant="outlined"
            startIcon={<CalendarIcon />}
            onClick={handleUpdateCurrentTerm}
            color="info"
          >
            Update Current Term
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
                    Active Sessions
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {sessions.filter(s => s.isActive).length}
                  </Typography>
                </Box>
                <SchoolIcon sx={{ fontSize: 40, color: 'success.main' }} />
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
                    Total Sessions
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {sessions.length}
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
                    Fee Structures
                  </Typography>
                  <Typography variant="h4" color="secondary">
                    {feeStructures.length}
                  </Typography>
                </Box>
                <PaymentIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
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
                    Archived Sessions
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {sessions.filter(s => !s.isActive).length}
                  </Typography>
                </Box>
                <ArchiveIcon sx={{ fontSize: 40, color: 'warning.main' }} />
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
                    Current Term
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {getCurrentTermFromSessions()}
                  </Typography>
                </Box>
                <CalendarIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Active Sessions" />
            <Tab label="Fee Structures" />
            <Tab label="Archived Sessions" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <ModernTable
            columns={[
              {
                id: 'name',
                label: 'Session Name',
                width: 200,
                render: (value, row) => (
                  <Typography variant="h6" fontWeight="bold">
                    {row.name}
                  </Typography>
                ),
              },
              {
                id: 'duration',
                label: 'Duration',
                width: 200,
                render: (value, row) => (
                  <Typography variant="body2">
                    {safeToDate(row.startDate).toLocaleDateString()} - {safeToDate(row.endDate).toLocaleDateString()}
                  </Typography>
                ),
              },
              {
                id: 'currentTerm',
                label: 'Current Term',
                width: 150,
                render: (value, row) => (
                  <Chip 
                    label={row.currentTerm || 'Not Set'} 
                    color="success" 
                    size="small" 
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                  />
                ),
              },
              {
                id: 'terms',
                label: 'All Terms',
                width: 200,
                render: (value, row) => (
                  <Box>
                    <Chip label="First Term" color="primary" size="small" sx={{ mr: 1, mb: 1 }} />
                    <Chip label="Second Term" color="secondary" size="small" sx={{ mr: 1, mb: 1 }} />
                    <Chip label="Third Term" color="info" size="small" />
                  </Box>
                ),
              },
              {
                id: 'isActive',
                label: 'Status',
                width: 100,
              },
            ]}
            data={sessions.filter(s => s.isActive)}
            actions={[
              {
                icon: <EditIcon />,
                label: 'Edit',
                onClick: (session) => handleEditItem(session, 'session'),
                color: 'primary',
              },
              {
                icon: <CalendarIcon />,
                label: 'Update Term',
                onClick: (session) => handleUpdateSessionTerm(session.id),
                color: 'info',
              },
              {
                icon: <ArchiveIcon />,
                label: 'Archive',
                onClick: (session) => handleArchiveSession(session.id),
                color: 'warning',
              },
            ]}
            emptyMessage="No active sessions found"
            maxHeight={400}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ModernTable
            columns={[
              {
                id: 'classId',
                label: 'Class',
                width: 120,
              },
              {
                id: 'term',
                label: 'Term',
                width: 120,
              },
              {
                id: 'academicYear',
                label: 'Academic Year',
                width: 150,
              },
              {
                id: 'totalAmount',
                label: 'Total Amount',
                width: 150,
                render: (value, row) => (
                  <Typography variant="h6" color="primary">
                    ₦{getTotalFees(row.fees as Record<string, number>).toLocaleString()}
                  </Typography>
                ),
              },
              {
                id: 'dueDate',
                label: 'Due Date',
                width: 120,
                render: (value, row) => safeToDate(row.dueDate).toLocaleDateString(),
              },
            ]}
            data={feeStructures}
            actions={[
              {
                icon: <EditIcon />,
                label: 'Edit',
                onClick: (fee) => handleEditItem(fee, 'fee'),
                color: 'primary',
              },
              {
                icon: <DeleteIcon />,
                label: 'Delete',
                onClick: (fee) => handleDeleteItem(fee.id, 'fee'),
                color: 'error',
              },
            ]}
            emptyMessage="No fee structures found"
            maxHeight={400}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <ModernTable
            columns={[
              {
                id: 'name',
                label: 'Session Name',
                width: 200,
                render: (value, row) => (
                  <Typography variant="h6" fontWeight="bold">
                    {row.name}
                  </Typography>
                ),
              },
              {
                id: 'duration',
                label: 'Duration',
                width: 200,
                render: (value, row) => (
                  <Typography variant="body2">
                    {safeToDate(row.startDate).toLocaleDateString()} - {safeToDate(row.endDate).toLocaleDateString()}
                  </Typography>
                ),
              },
              {
                id: 'status',
                label: 'Status',
                width: 100,
                render: (value, row) => (
                  <Chip
                    label="Archived"
                    color="default"
                    size="small"
                  />
                ),
              },
            ]}
            data={sessions.filter(s => !s.isActive)}
            actions={[
              {
                icon: <EditIcon />,
                label: 'Edit',
                onClick: (session) => handleEditItem(session, 'session'),
                color: 'primary',
              },
            ]}
            emptyMessage="No archived sessions found"
            maxHeight={400}
          />
        </TabPanel>
      </Card>

      {/* Notification Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {modalType === 'success' && <CheckCircleIcon color="success" />}
            {modalType === 'error' && <WarningIcon color="error" />}
            {modalType === 'warning' && <WarningIcon color="warning" />}
            <Typography variant="h6">
              {modalType === 'success' ? 'Success' : modalType === 'error' ? 'Error' : 'Warning'}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>{modalMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant="contained" color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

// Session Form Component
interface SessionFormProps {
  session: AcademicSession | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const SessionForm: React.FC<SessionFormProps> = ({ session, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: session?.name || '',
    startDate: session?.startDate ? safeToDate(session.startDate).toISOString().split('T')[0] : '',
    endDate: session?.endDate ? safeToDate(session.endDate).toISOString().split('T')[0] : '',
    isActive: session?.isActive || false,
    currentTerm: session?.currentTerm || 'First Term',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Paper elevation={1} sx={{ p: 4, mb: 3 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Session Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Current Term</InputLabel>
              <Select
                value={formData.currentTerm}
                label="Current Term"
                onChange={(e) => setFormData({ ...formData, currentTerm: e.target.value as 'First Term' | 'Second Term' | 'Third Term' })}
              >
                <MenuItem value="First Term">First Term (September - December)</MenuItem>
                <MenuItem value="Second Term">Second Term (January - April)</MenuItem>
                <MenuItem value="Third Term">Third Term (May - August)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" startIcon={<SaveIcon />}>
            {session ? 'Update' : 'Create'} Session
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

// Fee Structure Form Component
interface FeeStructureFormProps {
  fee: FeeStructure | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  sessions: AcademicSession[];
}

const FeeStructureForm: React.FC<FeeStructureFormProps> = ({ fee, onSave, onCancel, sessions }) => {
  // Predefined class list matching StudentManagement
  const predefinedClasses = [
    'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5',
    'Creche', 'Reception class 2', 'Nursery 1', 'Nursery 2', 'Playgroup'
  ];
  const [formData, setFormData] = useState({
    classId: fee?.classId || '',
    term: fee?.term || 'First Term',
    academicYear: fee?.academicYear || (sessions && sessions.length > 0 ? sessions[0].name : '2023-2024'),
    fees: fee?.fees || {
      tuition: 0,
      exerciseBooks: 0,
      reportCard: 0,
      textbooks: 0,
      pta: 0,
    },
    dueDate: fee?.dueDate ? safeToDate(fee.dueDate).toISOString().split('T')[0] : '',
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
          <FormControl fullWidth required>
            <InputLabel>Class</InputLabel>
            <Select
              value={formData.classId}
              label="Class"
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            >
              {predefinedClasses.map((cls) => (
                <MenuItem key={cls} value={cls}>{cls}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Term</InputLabel>
            <Select
              value={formData.term}
              label="Term"
              onChange={(e) => setFormData({ ...formData, term: e.target.value })}
            >
              {['First Term', 'Second Term', 'Third Term'].map((term) => (
                <MenuItem key={term} value={term}>{term}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Academic Year</InputLabel>
            <Select
              value={formData.academicYear}
              label="Academic Year"
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
            >
              {sessions && (sessions as any[]).length > 0 ? (
                (sessions as any[]).map((session: any) => (
                  <MenuItem key={session.id} value={session.name}>
                    {session.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="2023-2024">2023-2024</MenuItem>
              )}
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
        
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Fee Breakdown
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Tuition Fee"
            type="number"
            value={formData.fees.tuition}
            onChange={(e) => setFormData({
              ...formData,
              fees: { ...formData.fees, tuition: Number(e.target.value) }
            })}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Exercise Books Fee"
            type="number"
            value={formData.fees.exerciseBooks}
            onChange={(e) => setFormData({
              ...formData,
              fees: { ...formData.fees, exerciseBooks: Number(e.target.value) }
            })}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Report Card Fee"
            type="number"
            value={formData.fees.reportCard}
            onChange={(e) => setFormData({
              ...formData,
              fees: { ...formData.fees, reportCard: Number(e.target.value) }
            })}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Textbooks Fee"
            type="number"
            value={formData.fees.textbooks}
            onChange={(e) => setFormData({
              ...formData,
              fees: { ...formData.fees, textbooks: Number(e.target.value) }
            })}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="PTA Fee"
            type="number"
            value={formData.fees.pta}
            onChange={(e) => setFormData({
              ...formData,
              fees: { ...formData.fees, pta: Number(e.target.value) }
            })}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" color="primary">
            Total: ₦{Object.values(formData.fees).reduce((sum: any, fee: any) => sum + (fee as number), 0).toLocaleString()}
          </Typography>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" type="submit" startIcon={<SaveIcon />}>
          {fee ? 'Update' : 'Add'} Fee Structure
        </Button>
      </Box>
      </Box>
    </Paper>
  );
};

export default SessionManagement; 