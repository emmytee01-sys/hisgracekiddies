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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  Container,
  Breadcrumbs,
  Link,
  TablePagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Grade as GradeIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { Result, Student } from '../types';
import { useResultsRealtime, useResults, useStudentsRealtime } from '../hooks/useFirebaseData';
import { toast } from 'react-toastify';

// Predefined class list matching StudentManagement
const predefinedClasses = [
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5',
  'Creche', 'Reception class 2', 'Nursery 1', 'Nursery 2', 'Playgroup'
];

const ResultsManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const { data: studentsRt } = useStudentsRealtime();
  const students = (studentsRt as unknown as Student[]) || [];

  const { data: resultsRt } = useResultsRealtime();
  const { addItem, updateItem, deleteItem } = useResults();

  const results = (resultsRt as unknown as Result[]) || [];

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get paginated results
  const paginatedResults = results.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const subjects = [
    { id: '1', name: 'Mathematics' },
    { id: '2', name: 'English Language' },
    { id: '3', name: 'Science' },
  ];

  const handleAddResult = () => { setEditingResult(null); setShowForm(true); };
  const handleEditResult = (result: Result) => { setEditingResult(result); setShowForm(true); };

  const validate = (data: any) => {
    if (!data.studentId) return 'Student is required';
    if (!data.subjectId) return 'Subject is required';
    if (!data.classId) return 'Class is required';
    if (!data.term) return 'Term is required';
    if (data.score == null || data.maxScore == null) return 'Scores are required';
    return null;
  };

  const calculateGrade = (score: number, maxScore: number): string => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const handleDeleteResult = async (resultId: string) => {
    try { await deleteItem(resultId); toast.success('Result deleted'); } catch { toast.error('Delete failed'); }
  };

  const handleSaveResult = async (data: any) => {
    const err = validate(data); if (err) { toast.error(err); return; }

    const payload = {
      studentId: data.studentId,
      subjectId: data.subjectId,
      classId: data.classId,
      term: data.term,
      academicYear: data.academicYear,
      score: Number(data.score),
      maxScore: Number(data.maxScore),
      grade: calculateGrade(Number(data.score), Number(data.maxScore)),
      remark: data.remark || '',
      teacherId: data.teacherId || 'teacher1',
      dateRecorded: editingResult?.dateRecorded ?? new Date(),
    } as Omit<Result, 'id'>;

    try {
      if (editingResult) await updateItem(editingResult.id, payload as Partial<Result>); else await addItem(payload);
      toast.success('Result saved');
      setShowForm(false);
    } catch { toast.error('Failed to save result'); }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'success';
      case 'B': return 'primary';
      case 'C': return 'warning';
      case 'D': return 'secondary';
      case 'F': return 'error';
      default: return 'default';
    }
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown';
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown';
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingResult(null);
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
                Back to Results
              </Link>
            </Breadcrumbs>
            <Typography variant="h4" color="primary" gutterBottom>
              {editingResult ? 'Edit Result' : 'Add New Result'}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Fill in the result information below.
            </Typography>
          </Paper>
          
          <ResultForm
            result={editingResult}
            students={students}
            subjects={subjects}
            predefinedClasses={predefinedClasses}
            onSave={handleSaveResult}
            onCancel={handleCancelForm}
          />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary">
          Results Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddResult}
        >
          Add Result
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Results
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {results.length}
                  </Typography>
                </Box>
                <GradeIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                  <Typography variant="h4" color="success.main">
                    {results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 0}%
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
                    Excellent Grades (A)
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {results.filter(r => r.grade === 'A').length}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'info.main' }} />
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
                    Students with Results
                  </Typography>
                  <Typography variant="h4" color="secondary.main">
                    {new Set(results.map(r => r.studentId)).size}
                  </Typography>
                </Box>
                <SchoolIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Results Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Class</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Term</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', maxWidth: 150 }}>Remark</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedResults.map((result) => (
                  <TableRow key={result.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {getStudentName(result.studentId)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getSubjectName(result.subjectId)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {result.classId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {result.term}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                        {result.score}/{result.maxScore}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={result.grade}
                        color={getGradeColor(result.grade)}
                        size="small"
                        sx={{ minWidth: 40 }}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 150 }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {result.remark || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditResult(result)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteResult(result.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 20, 50, 100]}
            component="div"
            count={results.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>


    </Box>
  );
};

// Result Form Component
interface ResultFormProps {
  result: Result | null;
  students: Student[];
  subjects: any[];
  predefinedClasses: string[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

const ResultForm: React.FC<ResultFormProps> = ({ result, students, subjects, predefinedClasses, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    studentId: result?.studentId || '',
    subjectId: result?.subjectId || '',
    classId: result?.classId || '',
    term: result?.term || '',
    academicYear: result?.academicYear || '2023/2024',
    score: result?.score || 0,
    maxScore: result?.maxScore || 100,
    remark: result?.remark || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const calculateGrade = (score: number, maxScore: number): string => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const currentGrade = calculateGrade(formData.score, formData.maxScore);

  return (
    <Paper elevation={1} sx={{ p: 4, mb: 3 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Student</InputLabel>
            <Select
              value={formData.studentId}
              label="Student"
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            >
              {students.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Subject</InputLabel>
            <Select
              value={formData.subjectId}
              label="Subject"
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
            >
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Class</InputLabel>
            <Select
              value={formData.classId}
              label="Class"
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            >
              {predefinedClasses.map((cls: string) => (
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
          <TextField
            fullWidth
            label="Academic Year"
            value={formData.academicYear}
            onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Score"
            type="number"
            value={formData.score}
            onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
            required
            inputProps={{ min: 0, max: formData.maxScore }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Maximum Score"
            type="number"
            value={formData.maxScore}
            onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
            required
            inputProps={{ min: 1 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Calculated Grade: {currentGrade}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Percentage: {formData.maxScore > 0 ? Math.round((formData.score / formData.maxScore) * 100) : 0}%
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Remark"
            multiline
            rows={3}
            value={formData.remark}
            onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" type="submit" startIcon={<SaveIcon />}>
          {result ? 'Update' : 'Add'} Result
        </Button>
      </Box>
      </Box>
    </Paper>
  );
};

export default ResultsManagement; 