import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  AlertTitle,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { runAllMigrations } from '../utils/migrateBasicToPrimary';

interface MigrationResult {
  success: boolean;
  students?: { totalProcessed: number; updated: number; errors: number };
  classes?: { totalProcessed: number; updated: number; errors: number };
  subjects?: { totalProcessed: number; updated: number; errors: number };
}

const MigrationRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunMigration = async () => {
    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const migrationResult = await runAllMigrations();
      setResult(migrationResult);
    } catch (err: any) {
      console.error('Migration error:', err);
      setError(err.message || 'An error occurred during migration');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom color="primary">
            Database Migration: Basic → Primary
          </Typography>
          <Typography variant="body2" color="textSecondary">
            This migration will update all database records to replace "Basic" with "Primary" in class names.
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>What will be updated?</AlertTitle>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Students" 
                secondary="Updates class and academicClassAdmitted fields (e.g., Basic 1 → Primary 1)" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Classes" 
                secondary="Updates class names (e.g., Basic 1 → Primary 1)" 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Subjects" 
                secondary="Updates classes arrays in subject records" 
              />
            </ListItem>
          </List>
        </Alert>

        {isRunning && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Running migration...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Migration Failed</AlertTitle>
            {error}
          </Alert>
        )}

        {result && (
          <Box sx={{ mb: 3 }}>
            <Alert 
              severity={result.success ? "success" : "error"} 
              icon={result.success ? <SuccessIcon /> : <ErrorIcon />}
              sx={{ mb: 2 }}
            >
              <AlertTitle>Migration Completed</AlertTitle>
              {result.success ? 'All updates have been applied successfully!' : 'Migration completed with errors.'}
            </Alert>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Migration Summary
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                {result.students && (
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">
                      <strong>Students:</strong> {result.students.updated} of {result.students.totalProcessed} updated
                    </Typography>
                    {result.students.errors > 0 ? (
                      <Chip label={`${result.students.errors} errors`} color="error" size="small" />
                    ) : (
                      <Chip label="Success" color="success" size="small" icon={<SuccessIcon />} />
                    )}
                  </Box>
                )}

                {result.classes && (
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">
                      <strong>Classes:</strong> {result.classes.updated} of {result.classes.totalProcessed} updated
                    </Typography>
                    {result.classes.errors > 0 ? (
                      <Chip label={`${result.classes.errors} errors`} color="error" size="small" />
                    ) : (
                      <Chip label="Success" color="success" size="small" icon={<SuccessIcon />} />
                    )}
                  </Box>
                )}

                {result.subjects && (
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">
                      <strong>Subjects:</strong> {result.subjects.updated} of {result.subjects.totalProcessed} updated
                    </Typography>
                    {result.subjects.errors > 0 ? (
                      <Chip label={`${result.subjects.errors} errors`} color="error" size="small" />
                    ) : (
                      <Chip label="Success" color="success" size="small" icon={<SuccessIcon />} />
                    )}
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />
                
                <Alert severity="info" icon={<InfoIcon />}>
                  The migration is complete. Please refresh the page to see the updated data.
                </Alert>
              </CardContent>
            </Card>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayIcon />}
            onClick={handleRunMigration}
            disabled={isRunning}
          >
            {isRunning ? 'Running Migration...' : 'Run Migration'}
          </Button>
          
          {result && (
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MigrationRunner;

