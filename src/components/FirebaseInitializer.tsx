import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { initializeSampleData, checkDataExists } from '../utils/initializeFirebaseData';

const FirebaseInitializer: React.FC = () => {
  const [dataStatus, setDataStatus] = useState<{
    hasUsers: boolean;
    hasStudents: boolean;
    totalUsers: number;
    totalStudents: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkDataStatus();
  }, []);

  const checkDataStatus = async () => {
    try {
      setLoading(true);
      const status = await checkDataExists();
      setDataStatus(status);
    } catch (err) {
      setError('Failed to check data status');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    try {
      setInitializing(true);
      setError(null);
      setSuccess(null);
      
      await initializeSampleData();
      
      setSuccess('Firebase data initialized successfully!');
      await checkDataStatus(); // Refresh status
    } catch (err) {
      setError('Failed to initialize Firebase data. Please try again.');
    } finally {
      setInitializing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Firebase Data Initialization
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Data Status
          </Typography>
          
          {dataStatus && (
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {dataStatus.totalUsers}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Users
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {dataStatus.totalStudents}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Students
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Initialize Sample Data
          </Typography>
          
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            This will create sample data in Firebase for testing purposes. 
            This includes admin users, classes, students, and academic sessions.
          </Typography>

          <Button
            variant="contained"
            onClick={handleInitialize}
            disabled={initializing}
            startIcon={initializing ? <CircularProgress size={20} /> : null}
          >
            {initializing ? 'Initializing...' : 'Initialize Sample Data'}
          </Button>

          {dataStatus && (dataStatus.hasUsers || dataStatus.hasStudents) && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Sample data already exists. You can reinitialize to add more data.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default FirebaseInitializer; 