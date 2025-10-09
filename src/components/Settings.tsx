import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  School as SchoolIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Backup as BackupIcon,
  RestoreFromTrash as RestoreIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import MigrationRunner from './MigrationRunner';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');

  // Mock settings data
  const [schoolInfo, setSchoolInfo] = useState({
    name: 'His Grace Kiddies Academy',
    address: '123 School Street, Lagos, Nigeria',
    phone: '+234 802 345 6789',
    email: 'info@hisgraceacademy.com',
    website: 'www.hisgraceacademy.com',
    principal: 'Mrs. Grace Johnson',
    established: '2010',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    assignmentReminders: true,
    feeReminders: true,
    attendanceAlerts: true,
    eventNotifications: true,
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
    autoLogout: true,
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'en',
    fontSize: 'medium',
    compactMode: false,
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleOpenDialog = (type: string) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleSaveSettings = () => {
    // Handle saving settings
    setOpenDialog(false);
  };

  const renderGeneralSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              School Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                School Name
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {schoolInfo.name}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Address
              </Typography>
              <Typography variant="body1">
                {schoolInfo.address}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="body1">
                {schoolInfo.phone}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {schoolInfo.email}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => handleOpenDialog('school')}
            >
              Edit School Info
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Version
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                v1.0.0
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1">
                January 15, 2024
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Database Status
              </Typography>
              <Chip
                label="Connected"
                color="success"
                size="small"
                icon={<CheckCircleIcon />}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Storage Usage
              </Typography>
              <Typography variant="body1">
                2.5 GB / 10 GB
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<BackupIcon />}
              onClick={() => handleOpenDialog('backup')}
            >
              Create Backup
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderNotificationSettings = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Notification Preferences
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.emailNotifications}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    emailNotifications: e.target.checked
                  })}
                />
              }
              label="Email Notifications"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.smsNotifications}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    smsNotifications: e.target.checked
                  })}
                />
              }
              label="SMS Notifications"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.pushNotifications}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    pushNotifications: e.target.checked
                  })}
                />
              }
              label="Push Notifications"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.assignmentReminders}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    assignmentReminders: e.target.checked
                  })}
                />
              }
              label="Assignment Reminders"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.feeReminders}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    feeReminders: e.target.checked
                  })}
                />
              }
              label="Fee Reminders"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.attendanceAlerts}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    attendanceAlerts: e.target.checked
                  })}
                />
              }
              label="Attendance Alerts"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.eventNotifications}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    eventNotifications: e.target.checked
                  })}
                />
              }
              label="Event Notifications"
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
          >
            Save Notification Settings
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const renderSecuritySettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={security.twoFactorAuth}
                    onChange={(e) => setSecurity({
                      ...security,
                      twoFactorAuth: e.target.checked
                    })}
                  />
                }
                label="Two-Factor Authentication"
              />
              <Typography variant="body2" color="text.secondary">
                Add an extra layer of security to your account
              </Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Session Timeout (minutes)
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={security.sessionTimeout}
                  onChange={(e) => setSecurity({
                    ...security,
                    sessionTimeout: e.target.value as number
                  })}
                >
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                  <MenuItem value={120}>2 hours</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Password Expiry (days)
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={security.passwordExpiry}
                  onChange={(e) => setSecurity({
                    ...security,
                    passwordExpiry: e.target.value as number
                  })}
                >
                  <MenuItem value={30}>30 days</MenuItem>
                  <MenuItem value={60}>60 days</MenuItem>
                  <MenuItem value={90}>90 days</MenuItem>
                  <MenuItem value={180}>180 days</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={security.autoLogout}
                    onChange={(e) => setSecurity({
                      ...security,
                      autoLogout: e.target.checked
                    })}
                  />
                }
                label="Auto Logout on Inactivity"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Access Logs
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Admin Login"
                  secondary="Today at 9:30 AM"
                />
                <Chip label="Success" color="success" size="small" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Teacher Login"
                  secondary="Today at 8:15 AM"
                />
                <Chip label="Success" color="success" size="small" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WarningIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Failed Login Attempt"
                  secondary="Yesterday at 11:45 PM"
                />
                <Chip label="Failed" color="error" size="small" />
              </ListItem>
            </List>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => handleOpenDialog('logs')}
            >
              View All Logs
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAppearanceSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Appearance Settings
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Theme
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={appearance.theme}
                  onChange={(e) => setAppearance({
                    ...appearance,
                    theme: e.target.value
                  })}
                >
                  <MenuItem value="light">Light Theme</MenuItem>
                  <MenuItem value="dark">Dark Theme</MenuItem>
                  <MenuItem value="auto">Auto (System)</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Language
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={appearance.language}
                  onChange={(e) => setAppearance({
                    ...appearance,
                    language: e.target.value
                  })}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="ar">Arabic</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Font Size
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={appearance.fontSize}
                  onChange={(e) => setAppearance({
                    ...appearance,
                    fontSize: e.target.value
                  })}
                >
                  <MenuItem value="small">Small</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="large">Large</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={appearance.compactMode}
                    onChange={(e) => setAppearance({
                      ...appearance,
                      compactMode: e.target.checked
                    })}
                  />
                }
                label="Compact Mode"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Color Scheme
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Primary Color
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#1976d2',
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: '2px solid #1976d2'
                  }}
                />
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#2e7d32',
                    borderRadius: 1,
                    cursor: 'pointer'
                  }}
                />
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#ed6c02',
                    borderRadius: 1,
                    cursor: 'pointer'
                  }}
                />
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#9c27b0',
                    borderRadius: 1,
                    cursor: 'pointer'
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Accent Color
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#000000',
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: '2px solid #000000'
                  }}
                />
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#424242',
                    borderRadius: 1,
                    cursor: 'pointer'
                  }}
                />
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#666666',
                    borderRadius: 1,
                    cursor: 'pointer'
                  }}
                />
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#999999',
                    borderRadius: 1,
                    cursor: 'pointer'
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderBackupSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Backup & Restore
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Last Backup
              </Typography>
              <Typography variant="body1">
                January 14, 2024 at 2:30 AM
              </Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Backup Size
              </Typography>
              <Typography variant="body1">
                1.2 GB
              </Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Auto Backup
              </Typography>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable daily automatic backup"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<BackupIcon />}
                onClick={() => handleOpenDialog('backup')}
              >
                Create Backup
              </Button>
              <Button
                variant="outlined"
                startIcon={<RestoreIcon />}
                onClick={() => handleOpenDialog('restore')}
              >
                Restore
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Maintenance
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              System is running optimally. No maintenance required.
            </Alert>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Database Status
              </Typography>
              <Chip
                label="Healthy"
                color="success"
                size="small"
                icon={<CheckCircleIcon />}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Cache Status
              </Typography>
              <Chip
                label="Optimized"
                color="success"
                size="small"
                icon={<CheckCircleIcon />}
              />
            </Box>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => handleOpenDialog('maintenance')}
            >
              Run System Check
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderDatabaseSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MigrationRunner />
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Settings
      </Typography>

      {/* Navigation Tabs */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', overflowX: 'auto' }}>
            <Button
              variant={activeTab === 'general' ? 'contained' : 'text'}
              onClick={() => handleTabChange('general')}
              startIcon={<SchoolIcon />}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              General
            </Button>
            <Button
              variant={activeTab === 'notifications' ? 'contained' : 'text'}
              onClick={() => handleTabChange('notifications')}
              startIcon={<NotificationsIcon />}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              Notifications
            </Button>
            <Button
              variant={activeTab === 'security' ? 'contained' : 'text'}
              onClick={() => handleTabChange('security')}
              startIcon={<SecurityIcon />}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              Security
            </Button>
            <Button
              variant={activeTab === 'appearance' ? 'contained' : 'text'}
              onClick={() => handleTabChange('appearance')}
              startIcon={<PaletteIcon />}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              Appearance
            </Button>
            <Button
              variant={activeTab === 'backup' ? 'contained' : 'text'}
              onClick={() => handleTabChange('backup')}
              startIcon={<BackupIcon />}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              Backup & Restore
            </Button>
            <Button
              variant={activeTab === 'database' ? 'contained' : 'text'}
              onClick={() => handleTabChange('database')}
              startIcon={<StorageIcon />}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              Database
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Content */}
      {activeTab === 'general' && renderGeneralSettings()}
      {activeTab === 'notifications' && renderNotificationSettings()}
      {activeTab === 'security' && renderSecuritySettings()}
      {activeTab === 'appearance' && renderAppearanceSettings()}
      {activeTab === 'backup' && renderBackupSettings()}
      {activeTab === 'database' && renderDatabaseSettings()}

      {/* Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'school' && 'Edit School Information'}
          {dialogType === 'backup' && 'Create Backup'}
          {dialogType === 'restore' && 'Restore from Backup'}
          {dialogType === 'logs' && 'Access Logs'}
          {dialogType === 'maintenance' && 'System Maintenance'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'school' && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="School Name"
                    value={schoolInfo.name}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={schoolInfo.address}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={schoolInfo.phone}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={schoolInfo.email}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
          {dialogType === 'backup' && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                This will create a complete backup of all school data including:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Student records" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Teacher information" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Academic data" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Financial records" />
                </ListItem>
              </List>
              <Alert severity="info" sx={{ mt: 2 }}>
                Backup will be saved to cloud storage and can be restored later if needed.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSettings}>
            {dialogType === 'school' ? 'Save Changes' : 'Proceed'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 