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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { FeeStructure, Payment, Student } from '../types';
import { useFeeStructuresRealtime, useFeeStructures, usePaymentsRealtime, usePayments, useAcademicSessionsRealtime, useStudentsRealtime } from '../hooks/useFirebaseData';
import { useAuth } from '../contexts/AuthContext';
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
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`fee-tabpanel-${index}`}
      aria-labelledby={`fee-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Predefined class list matching StudentManagement
const predefinedClasses = [
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5',
  'Creche', 'Reception class ', 'Nursery 1', 'Nursery 2', 'Playgroup'
];

const FeeManagement: React.FC = () => {
  const { currentUser } = useAuth();

  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'fee' | 'payment'>('fee');
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: feeStructuresRt } = useFeeStructuresRealtime();
  const { addItem, updateItem, deleteItem } = useFeeStructures();

  const { data: paymentsRt } = usePaymentsRealtime();
  const { addItem: addPayment, updateItem: updatePayment, deleteItem: deletePayment } = usePayments();

  const { data: academicSessionsRt } = useAcademicSessionsRealtime();
  const { data: studentsRt } = useStudentsRealtime();

  const feeStructures = (feeStructuresRt as unknown as FeeStructure[]) || [];
  const payments = (paymentsRt as unknown as Payment[]) || [];
  const students = (studentsRt as unknown as any[]) || [];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddFee = () => {
    setDialogType('fee');
    setEditingItem(null);
    setOpenDialog(true);
  };

  const handleAddPayment = () => {
    setDialogType('payment');
    setEditingItem(null);
    setOpenDialog(true);
  };

  const handleEditItem = (item: any, type: 'fee' | 'payment') => {
    setDialogType(type);
    setEditingItem(item);
    setOpenDialog(true);
  };

  const handleDeleteItem = async (id: string, type: 'fee' | 'payment') => {
    try {
      if (type === 'fee') await deleteItem(id); else await deletePayment(id);
      toast.success('Deleted successfully');
    } catch { toast.error('Delete failed'); }
  };

  const handleViewPayment = (payment: Payment) => {
    // Find student information
    const student = students.find((s: any) => s.id === payment.studentId);
    // Find fee structure information
    const feeStructure = feeStructures.find(f => f.id === payment.feeStructureId);
    const totalFeeAmount = feeStructure ? Object.values(feeStructure.fees).reduce((sum, fee) => sum + fee, 0) : 0;
    const outstanding = totalFeeAmount - payment.amount;
    
    // Create a detailed view modal or navigate to payment details
    const paymentDetails = {
      ...payment,
      studentName: student ? `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim() : 'N/A',
      studentAdmissionNumber: student?.admissionNumber || 'N/A',
      studentClass: student?.class || 'N/A',
      totalFeeAmount,
      outstanding,
      feeStructureName: feeStructure ? `${feeStructure.classId} - ${feeStructure.term}` : 'N/A'
    };
    
    console.log('Payment Details:', paymentDetails);
    // For now, we'll show the details in console. You can implement a modal later
    alert(`Payment Details:\n\nStudent: ${paymentDetails.studentName}\nAdmission Number: ${paymentDetails.studentAdmissionNumber}\nClass: ${paymentDetails.studentClass}\nFee Structure: ${paymentDetails.feeStructureName}\nTotal Fee: ₦${totalFeeAmount.toLocaleString()}\nAmount Paid: ₦${payment.amount.toLocaleString()}\nOutstanding: ₦${outstanding.toLocaleString()}\nPayment Method: ${payment.paymentMethod}\nReceipt Number: ${payment.receiptNumber}\nDate: ${safeToDate(payment.paymentDate).toLocaleDateString()}\nStatus: ${payment.status}`);
  };

  const handleDeleteAllPayments = async () => {
    if (window.confirm(`Are you sure you want to delete ALL ${payments.length} payment records? This action cannot be undone.`)) {
      try {
        // Delete all payments one by one
        const deletePromises = payments.map(payment => deletePayment(payment.id));
        await Promise.all(deletePromises);
        toast.success(`Successfully deleted ${payments.length} payment records`);
      } catch (error) {
        console.error('Error deleting payments:', error);
        toast.error('Failed to delete payment records');
      }
    }
  };

  const validateFee = (data: any) => {
    if (!data.classId) return 'Class is required';
    if (!data.term) return 'Term is required';
    if (!data.academicYear) return 'Academic year is required';
    if (!data.fees) return 'Fees are required';
    return null;
  };

  const validatePayment = (data: any) => {
    if (!data.studentId) return 'Student ID is required';
    if (!data.amount || data.amount <= 0) return 'Amount must be greater than 0';
    if (!data.paymentMethod) return 'Payment method is required';
    if (!data.receiptNumber) return 'Receipt number is required';
    if (!data.status) return 'Status is required';
    return null;
  };

  const handleSaveItem = async (data: any) => {
    if (dialogType === 'fee') {
      const err = validateFee(data);
      if (err) { toast.error(err); return; }
      const payload = {
        classId: data.classId,
        term: data.term,
        academicYear: data.academicYear,
        fees: data.fees,
        dueDate: data.dueDate || new Date(),
      } as Omit<FeeStructure, 'id'>;
      try {
        if (editingItem) await updateItem(editingItem.id, payload as Partial<FeeStructure>);
        else await addItem(payload);
        toast.success('Fee structure saved');
        setOpenDialog(false);
      } catch (e) { toast.error('Failed to save fee structure'); }
    } else {
      const err = validatePayment(data);
      if (err) { toast.error(err); return; }
      // Calculate total fee amount to determine if payment is complete
      const feeStructure = feeStructures.find(f => f.id === data.feeStructureId);
      const totalFeeAmount = feeStructure ? Object.values(feeStructure.fees).reduce((sum, fee) => sum + fee, 0) : 0;
      const amountPaid = Number(data.amount);
      
      // Automatically determine status based on amount paid vs total fee
      const autoStatus = amountPaid >= totalFeeAmount ? 'completed' : 'incomplete';
      
      const payload = {
        studentId: data.studentId,
        feeStructureId: data.feeStructureId || '',
        amount: amountPaid,
        paymentMethod: data.paymentMethod,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
        receiptNumber: data.receiptNumber,
        status: autoStatus, // Use auto-determined status
        transactionId: data.transactionId || '',
        recordedBy: data.recordedBy || currentUser?.uid || '',
      } as Omit<Payment, 'id'> & { recordedBy?: string };
      
      console.log('Payment payload:', payload);
      console.log('Current user:', currentUser);
      
      try {
        if (editingItem) await updatePayment(editingItem.id, payload as Partial<Payment>);
        else await addPayment(payload);
        toast.success('Payment recorded');
        setOpenDialog(false);
      } catch (e) { 
        console.error('Payment creation error:', e);
        toast.error('Failed to save payment'); 
      }
    }
  };

  const getTotalFees = (fees: Record<string, number>) => {
    return Object.values(fees).reduce((sum, fee) => sum + fee, 0);
  };

  // Calculate dashboard metrics
  const calculateExpectedRevenue = () => {
    let totalExpected = 0;
    
    console.log('Calculating Expected Revenue:');
    console.log('Students:', students.length);
    console.log('Fee Structures:', feeStructures.length);
    
    // Group students by class
    const studentsByClass: { [className: string]: any[] } = {};
    students.forEach(student => {
      if (!studentsByClass[student.class]) {
        studentsByClass[student.class] = [];
      }
      studentsByClass[student.class].push(student);
    });
    
    console.log('Students by class:', studentsByClass);
    
    // Calculate expected revenue for each class
    Object.keys(studentsByClass).forEach(className => {
      const studentsInClass = studentsByClass[className];
      const feeStructure = feeStructures.find(fee => fee.classId === className);
      
      if (feeStructure && studentsInClass.length > 0) {
        const totalFeePerStudent = Object.values(feeStructure.fees).reduce((sum, fee) => sum + fee, 0);
        const classTotal = totalFeePerStudent * studentsInClass.length;
        totalExpected += classTotal;
        console.log(`${className}: ${studentsInClass.length} students × ₦${totalFeePerStudent} = ₦${classTotal}`);
      }
    });
    
    console.log('Total Expected Revenue:', totalExpected);
    return totalExpected;
  };

  const calculateOutstandingAmount = () => {
    let totalOutstanding = 0;
    console.log('Calculating Outstanding Amount:');
    console.log('Payments:', payments.length);
    
    payments.forEach(payment => {
      const student = students.find(s => s.id === payment.studentId);
      if (student) {
        const feeStructure = feeStructures.find(f => f.id === payment.feeStructureId);
        if (feeStructure) {
          const totalFee = Object.values(feeStructure.fees).reduce((sum, fee) => sum + fee, 0);
          const outstanding = totalFee - payment.amount;
          console.log(`Payment ${payment.id}: Fee ₦${totalFee} - Paid ₦${payment.amount} = Outstanding ₦${outstanding}`);
          // Only add to outstanding if the payment is actually incomplete (amount paid < total fee)
          if (outstanding > 0) {
            totalOutstanding += outstanding;
          }
        }
      }
    });
    
    console.log('Total Outstanding:', totalOutstanding);
    return totalOutstanding;
  };

  const calculateAmountReceived = () => {
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    console.log('Calculating Amount Received:');
    console.log('Payments:', payments.length);
    console.log('Total Amount Received:', total);
    return total;
  };

  const calculateTotalDiscounts = () => {
    let totalDiscounts = 0;
    payments.forEach(payment => {
      const student = students.find(s => s.id === payment.studentId);
      if (student) {
        const feeStructure = feeStructures.find(f => f.id === payment.feeStructureId);
        if (feeStructure) {
          const totalFee = Object.values(feeStructure.fees).reduce((sum, fee) => sum + fee, 0);
          const discount = totalFee - payment.amount;
          if (discount > 0) {
            totalDiscounts += discount;
          }
        }
      }
    });
    return totalDiscounts;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary">
          Fee Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddFee}
          >
            Add Fee Structure
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PaymentIcon />}
              onClick={handleAddPayment}
            >
              Record Payment
            </Button>
            {payments.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleDeleteAllPayments}
              >
                Delete All Payments ({payments.length})
              </Button>
            )}
          </Box>
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
                    Expected Revenue
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    ₦{calculateExpectedRevenue().toLocaleString()}
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
                    Outstanding Balance
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    ₦{calculateOutstandingAmount().toLocaleString()}
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />
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
                    Amount Paid
                  </Typography>
                  <Typography variant="h4" color="primary">
                    ₦{calculateAmountReceived().toLocaleString()}
                  </Typography>
                </Box>
                <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                    Total Discounts
                  </Typography>
                  <Typography variant="h4" color="secondary">
                    ₦{calculateTotalDiscounts().toLocaleString()}
                  </Typography>
                </Box>
                <PaymentIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Fee Structures" />
            <Tab label="Payments" />
            <Tab label="Defaulters" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Class</TableCell>
                  <TableCell>Term</TableCell>
                  <TableCell>Academic Year</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feeStructures.map((fee) => (
                  <TableRow key={fee.id} hover>
                    <TableCell>{fee.classId}</TableCell>
                    <TableCell>{fee.term}</TableCell>
                    <TableCell>{fee.academicYear}</TableCell>
                    <TableCell>
                      <Typography variant="h6" color="primary">
                        ₦{getTotalFees(fee.fees).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {safeToDate(fee.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditItem(fee, 'fee')}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteItem(fee.id, 'fee')}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Fee Amount</TableCell>
                  <TableCell>Amount Paid</TableCell>
                  <TableCell>Outstanding</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Receipt No.</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => {
                  // Find student information
                  const student = students.find((s: any) => s.id === payment.studentId);
                  // Find fee structure information
                  const feeStructure = feeStructures.find(f => f.id === payment.feeStructureId);
                  const totalFeeAmount = feeStructure ? Object.values(feeStructure.fees).reduce((sum, fee) => sum + fee, 0) : 0;
                  const outstanding = totalFeeAmount - payment.amount;
                  
                  return (
                    <TableRow key={payment.id} hover>
                      <TableCell>{student?.admissionNumber || payment.studentId}</TableCell>
                      <TableCell>
                        {student ? `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim() : 'N/A'}
                      </TableCell>
                      <TableCell>{student?.class || 'N/A'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          ₦{totalFeeAmount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" color="primary">
                          ₦{payment.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          color={outstanding > 0 ? 'error.main' : 'success.main'}
                          fontWeight="bold"
                        >
                          ₦{outstanding.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {payment.paymentMethod.replace('_', ' ')}
                        </Typography>
                      </TableCell>
                      <TableCell>{payment.receiptNumber}</TableCell>
                      <TableCell>
                        {safeToDate(payment.paymentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          color={payment.status === 'completed' ? 'success.main' : 'error.main'}
                          fontWeight="bold"
                        >
                          {payment.status}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewPayment(payment)}
                          startIcon={<VisibilityIcon />}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Students with outstanding fees will be displayed here.
          </Alert>
          <Typography variant="body1" color="text.secondary">
            This section will show students who have not paid their fees by the due date.
          </Typography>
        </TabPanel>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? `Edit ${dialogType === 'fee' ? 'Fee Structure' : 'Payment'}` : 
           `Add New ${dialogType === 'fee' ? 'Fee Structure' : 'Payment'}`}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'fee' ? (
            <FeeStructureForm
              fee={editingItem}
              onSave={handleSaveItem}
              onCancel={() => setOpenDialog(false)}
              academicSessions={academicSessionsRt || []}
            />
          ) : (
            <PaymentForm
              payment={editingItem}
              onSave={handleSaveItem}
              onCancel={() => setOpenDialog(false)}
              feeStructures={feeStructures as FeeStructure[]}
              students={students}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

// Fee Structure Form Component
interface FeeStructureFormProps {
  fee: FeeStructure | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  academicSessions: any[];
}

const FeeStructureForm: React.FC<FeeStructureFormProps> = ({ fee, onSave, onCancel, academicSessions }) => {
  const [formData, setFormData] = useState({
    classId: fee?.classId || '',
    term: fee?.term || '',
    academicYear: fee?.academicYear || '',
    fees: fee?.fees || {
      tuition: 0,
      exerciseBooks: 0,
      reportCard: 0,
      textbooks: 0,
      pta: 0,
    },
    dueDate: fee?.dueDate ? fee.dueDate.toISOString().split('T')[0] : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
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
          <FormControl fullWidth required>
            <InputLabel>Academic Year</InputLabel>
            <Select
              value={formData.academicYear}
              label="Academic Year"
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
            >
              {academicSessions && (academicSessions as any[]).length > 0 ? (
                (academicSessions as any[]).map((session: any) => (
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
            Total: ₦{Object.values(formData.fees).reduce((sum: any, fee: any) => sum + fee, 0).toLocaleString()}
          </Typography>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" type="submit">
          {fee ? 'Update' : 'Add'} Fee Structure
        </Button>
      </Box>
    </Box>
  );
};

// Payment Form Component
interface PaymentFormProps {
  payment: Payment | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  feeStructures: FeeStructure[];
  students: any[];
}

const PaymentForm: React.FC<PaymentFormProps> = ({ payment, onSave, onCancel, feeStructures, students }) => {
  const [formData, setFormData] = useState({
    studentId: payment?.studentId || '',
    feeStructureId: payment?.feeStructureId || '',
    amount: payment?.amount || 0,
    paymentMethod: payment?.paymentMethod || 'cash',
    paymentDate: payment?.paymentDate ? payment.paymentDate.toISOString().split('T')[0] : '',
    receiptNumber: payment?.receiptNumber || '',
    status: payment?.status || 'completed',
    transactionId: payment?.transactionId || '',
  });

  const [registrationNumber, setRegistrationNumber] = useState('');
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  const [suggestedAmount, setSuggestedAmount] = useState(0);
  const [discount, setDiscount] = useState(0);

  // Students data is available from parent component

  const handleStudentLookup = async (regNumber: string) => {
    if (!regNumber.trim()) {
      setStudentDetails(null);
      setSuggestedAmount(0);
      return;
    }

    setIsLoadingStudent(true);
    try {
      // Find student by admission number
      const student = students.find((s: any) => s.admissionNumber === regNumber.trim());
      
      if (student) {
        setStudentDetails(student);
        setFormData(prev => ({
          ...prev,
          studentId: student.id
        }));

        // Find fee structure for the student's class
        const studentFeeStructure = feeStructures.find(fee => 
          fee.classId === student.class
        );
        
        if (studentFeeStructure) {
          const totalFee = Object.values(studentFeeStructure.fees).reduce((sum, fee) => sum + fee, 0);
          setSuggestedAmount(totalFee);
          setFormData(prev => ({
            ...prev,
            feeStructureId: studentFeeStructure.id,
            amount: totalFee - discount
          }));
        } else {
          setSuggestedAmount(0);
        }
      } else {
        setStudentDetails(null);
        setSuggestedAmount(0);
        toast.error('Student not found with registration number: ' + regNumber);
      }
    } catch (error) {
      console.error('Error looking up student:', error);
      toast.error('Error looking up student');
    } finally {
      setIsLoadingStudent(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {/* Registration Number Input */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Student Registration Number (e.g., HGKA/8838)"
            value={registrationNumber}
            onChange={(e) => {
              setRegistrationNumber(e.target.value);
              handleStudentLookup(e.target.value);
            }}
            placeholder="Enter student registration number"
            helperText="Enter the student's registration number to auto-fill details"
            InputProps={{
              endAdornment: isLoadingStudent ? (
                <CircularProgress size={20} />
              ) : null
            }}
          />
        </Grid>

        {/* Student Details Display */}
        {studentDetails && (
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>
                Student Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Name:</strong> {studentDetails.firstName} {studentDetails.middleName} {studentDetails.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Class:</strong> {studentDetails.class}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Admission Number:</strong> {studentDetails.admissionNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Gender:</strong> {studentDetails.gender}
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        )}

        {/* Hidden Student ID field */}
        <Grid item xs={12} style={{ display: 'none' }}>
          <TextField
            fullWidth
            label="Student ID"
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Fee Structure</InputLabel>
            <Select
              value={formData.feeStructureId}
              label="Fee Structure"
              onChange={(e) => {
                const selectedFee = feeStructures.find(f => f.id === e.target.value);
                const newAmount = selectedFee ? Object.values(selectedFee.fees).reduce((sum, fee) => sum + fee, 0) : 0;
                setFormData({ 
                  ...formData, 
                  feeStructureId: e.target.value,
                  amount: newAmount - discount
                });
                setSuggestedAmount(newAmount);
              }}
            >
              {(feeStructures as FeeStructure[]).map((fee) => (
                <MenuItem key={fee.id} value={fee.id}>{fee.classId} - {fee.term}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Amount to be Paid"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            required
            helperText={suggestedAmount > 0 ? `Amount to be paid: ₦${suggestedAmount.toLocaleString()}` : ''}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>₦</Typography>
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Discount Amount"
            type="number"
            value={discount}
            onChange={(e) => {
              const discountValue = Number(e.target.value);
              setDiscount(discountValue);
              // Recalculate amount when discount changes
              if (suggestedAmount > 0) {
                setFormData(prev => ({
                  ...prev,
                  amount: suggestedAmount - discountValue
                }));
              }
            }}
            helperText="Enter discount amount to be deducted from the total fee"
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>₦</Typography>
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={formData.paymentMethod}
              label="Payment Method"
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'cash' | 'bank_transfer' | 'online' })}
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              <MenuItem value="online">Online Payment</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Payment Date"
            type="date"
            value={formData.paymentDate}
            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
            required
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Receipt Number"
            value={formData.receiptNumber}
            onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Payment Status"
            value={(() => {
              const feeStructure = feeStructures.find(f => f.id === formData.feeStructureId);
              const totalFeeAmount = feeStructure ? Object.values(feeStructure.fees).reduce((sum, fee) => sum + fee, 0) : 0;
              const amountPaid = formData.amount;
              return amountPaid >= totalFeeAmount ? 'Completed' : 'Incomplete';
            })()}
            InputProps={{
              readOnly: true,
            }}
            helperText="Status is automatically determined based on amount paid vs total fee"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Transaction ID"
            value={formData.transactionId}
            onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" type="submit">
          {payment ? 'Update' : 'Record'} Payment
        </Button>
      </Box>
    </Box>
  );
};

export default FeeManagement; 