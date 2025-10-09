import React, { useState, useMemo } from 'react';
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
  TextField,
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
  CircularProgress,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Print as PrintIcon,
  QrCode as QrCodeIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import QRCode from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import { Student, User } from '../types';
import { getClassOptions } from '../utils/teacherUtils';
import { useStudentsRealtime, useUsersRealtime } from '../hooks/useFirebaseData';

interface IDCardData {
  id: string;
  type: 'student' | 'staff';
  name: string;
  idNumber: string;
  class?: string;
  position?: string;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  qrCode: string;
  profileImage?: string;
  phoneNumber?: string;
  address?: string;
}

const IDCardGeneration: React.FC = () => {
  const { userProfile, hasRole } = useAuth();
  const [selectedType, setSelectedType] = useState<'student' | 'staff'>('student');
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDialog, setPreviewDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState<IDCardData | null>(null);

  // Get real data from Firebase
  const { data: students, loading: studentsLoading } = useStudentsRealtime(selectedClass === 'all' ? undefined : selectedClass);
  const { data: users, loading: usersLoading } = useUsersRealtime();

  // Transform real data into ID card format
  const idCards: IDCardData[] = useMemo(() => {
    const cards: IDCardData[] = [];

    // Add student cards
    if (students) {
      (students as Student[]).forEach((student: Student) => {
        cards.push({
          id: student.id,
          type: 'student',
          name: `${student.firstName} ${student.lastName}`,
          idNumber: student.admissionNumber,
          class: student.class,
          validFrom: new Date('2024-01-01'),
          validUntil: new Date('2024-12-31'),
          isActive: student.isActive,
          qrCode: `${student.admissionNumber}-${student.firstName}-${student.lastName}-${student.class}`,
          profileImage: student.profileImage,
          phoneNumber: student.sponsorPhone || student.phoneNumber,
          address: student.address,
        });
      });
    }

    // Add staff cards (teachers, admin, secretary)
    if (users) {
      (users as User[]).forEach((user: User) => {
        if (user.role === 'teacher' || user.role === 'admin' || user.role === 'secretary') {
          cards.push({
            id: user.id,
            type: 'staff',
            name: `${user.firstName} ${user.lastName}`,
            idNumber: `STAFF${user.id.slice(-3).toUpperCase()}`,
            position: user.role.charAt(0).toUpperCase() + user.role.slice(1),
            validFrom: new Date('2024-01-01'),
            validUntil: new Date('2024-12-31'),
            isActive: user.isActive,
            qrCode: `STAFF${user.id.slice(-3).toUpperCase()}-${user.firstName}-${user.lastName}-${user.role}`,
            profileImage: user.profileImage,
            phoneNumber: user.phoneNumber,
            address: '', // Users don't have address in the current schema
          });
        }
      });
    }

    return cards;
  }, [students, users]);

  const classes = getClassOptions();

  // Filter ID cards based on user role and selections
  const filteredIDCards = useMemo(() => {
    return idCards.filter(card => {
      const matchesType = card.type === selectedType;
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           card.idNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = selectedClass === 'all' || card.class === selectedClass;
      
      return matchesType && matchesSearch && matchesClass;
    });
  }, [idCards, selectedType, searchTerm, selectedClass]);

  // Loading state
  const loading = studentsLoading || usersLoading;

  const handlePreviewCard = (card: IDCardData) => {
    setSelectedCard(card);
    setPreviewDialog(true);
  };

  const handlePrintCard = (card: IDCardData) => {
    console.log('Printing card:', card);
    alert(`Printing ID card for ${card.name}`);
  };

  const handleDownloadPNG = async (card: IDCardData) => {
    const cardElement = document.getElementById(`id-card-${card.id}`);
    if (!cardElement) {
      alert('Unable to generate ID card. Please try again.');
      return;
    }

    try {
      // Convert all images to data URLs to bypass CORS
      const images = cardElement.querySelectorAll('img');
      const imagePromises = Array.from(images).map(async (img) => {
        const src = img.src;
        if (src && !src.startsWith('data:')) {
          try {
            const response = await fetch(src);
            const blob = await response.blob();
            const dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
            img.src = dataUrl;
          } catch (err) {
            console.warn('Failed to convert image to data URL:', err);
          }
        }
      });

      await Promise.all(imagePromises);

      // Wait a bit for images to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Use html2canvas to convert the element to canvas
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Good quality for standard ID card size
        logging: false,
        allowTaint: false,
        useCORS: false,
        imageTimeout: 0,
      });

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `ID-Card-${card.name.replace(/\s+/g, '-')}-${card.idNumber}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert('Error downloading ID card. Please try again.');
    }
  };

  // ID Card Preview Component
  const IDCardPreview: React.FC<{ card: IDCardData }> = ({ card }) => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Box
          id={`id-card-${card.id}`}
          sx={{
            width: 506.5, // Standard CR80 ID card width (85.6mm at 150 DPI for display)
            height: 319, // Standard CR80 ID card height (53.98mm at 150 DPI for display)
            border: '1px solid #e0e0e0',
            borderRadius: 3,
            p: 0,
            backgroundColor: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              p: 2,
              pt: 1.2,
              pb: 0.6,
              borderBottom: '2px solid #1976d2',
            }}
          >
            {/* Logo and Academy Name */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              {/* School Logo */}
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src="/logo1.png"
                  alt="His Grace Kiddies Academy Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>
              
              {/* Academy Name */}
              <Box>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#2e7d32',
                    lineHeight: 1,
                    mb: 0.5,
                  }}
                >
                  His Grace
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#d32f2f',
                    lineHeight: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  Kiddies Academy
                </Typography>
              </Box>
            </Box>
            
            {/* Address aligned on divider line */}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.2 }}>
              <Typography
                sx={{
                  fontSize: 10,
                  color: '#666',
                }}
              >
                Plot 1 Denro/Isasi Bus Stop Akute Ogun State
              </Typography>
            </Box>
            
            {/* Student ID Card Banner */}
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 80,
                height: 20,
                bgcolor: '#ffc107',
                borderRadius: '0 8px 8px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'skewX(-15deg)',
              }}
            >
              <Typography
                sx={{
                  fontSize: 9,
                  fontWeight: 'bold',
                  color: 'black',
                  transform: 'skewX(15deg)',
                }}
              >
                Student ID Card
              </Typography>
            </Box>
          </Box>

          {/* Main Content Section */}
          <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start', height: 180 }}>
            {/* Student Photo */}
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: 2,
                bgcolor: '#f5f5f5',
                border: '2px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {card.profileImage ? (
                <img
                  src={card.profileImage}
                  alt={card.name}
                  onError={(e) => {
                    // If image fails to load, hide it and show initials instead
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div style="width: 100%; height: 100%; background-color: #1976d2; display: flex; align-items: center; justify-content: center; color: white; font-size: 40px; font-weight: bold;">${card.name.charAt(0)}</div>`;
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    bgcolor: '#1976d2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 40,
                    fontWeight: 'bold',
                  }}
                >
                  {card.name.charAt(0)}
                </Box>
              )}
            </Box>

            {/* Student Information */}
            <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: '100%' }}>
              {/* Left Column */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 'bold',
                      color: '#1976d2',
                      mb: 0.4,
                      textTransform: 'uppercase',
                    }}
                  >
                    Student Name
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 15,
                      fontWeight: 'bold',
                      color: 'black',
                      lineHeight: 1.2,
                    }}
                  >
                    {card.name}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 'bold',
                      color: '#1976d2',
                      mb: 0.4,
                      textTransform: 'uppercase',
                    }}
                  >
                    Student Reg No
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 'bold',
                      color: 'black',
                    }}
                  >
                    {card.idNumber}
                  </Typography>
                </Box>
              </Box>

              {/* Right Column */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 'bold',
                      color: '#1976d2',
                      mb: 0.4,
                      textTransform: 'uppercase',
                    }}
                  >
                    Phone
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: 'black',
                      lineHeight: 1.2,
                    }}
                  >
                    {card.phoneNumber || '+123-456-7890'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 'bold',
                      color: '#1976d2',
                      mb: 0.4,
                      textTransform: 'uppercase',
                    }}
                  >
                    Address
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 10,
                      color: 'black',
                      lineHeight: 1.2,
                    }}
                  >
                    {card.address || '123 Anywhere St., Any City, ST 12345'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => handleDownloadPNG(card)}
          >
            Download PNG
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => handlePrintCard(card)}
          >
            Print Card
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary">
          ID Card Generation
        </Typography>
        <Button
          variant="contained"
          startIcon={<CreditCardIcon />}
        >
          Generate New Cards
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
                    Total ID Cards
                  </Typography>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <>
                      <Typography variant="h4" color="primary">
                        {idCards.length}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        All active
                      </Typography>
                    </>
                  )}
                </Box>
                <CreditCardIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                    Student Cards
                  </Typography>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <>
                      <Typography variant="h4" color="success.main">
                        {idCards.filter(card => card.type === 'student').length}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        Generated
                      </Typography>
                    </>
                  )}
                </Box>
                <PersonIcon sx={{ fontSize: 40, color: 'success.main' }} />
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
                    Staff Cards
                  </Typography>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <>
                      <Typography variant="h4" color="warning.main">
                        {idCards.filter(card => card.type === 'staff').length}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        Generated
                      </Typography>
                    </>
                  )}
                </Box>
                <GroupIcon sx={{ fontSize: 40, color: 'warning.main' }} />
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
                    Expiring Soon
                  </Typography>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <>
                      <Typography variant="h4" color="error.main">
                        {idCards.filter(card => {
                          const daysUntilExpiry = Math.ceil((card.validUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                        }).length}
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        Within 30 days
                      </Typography>
                    </>
                  )}
                </Box>
                <QrCodeIcon sx={{ fontSize: 40, color: 'error.main' }} />
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
                <InputLabel>Card Type</InputLabel>
                <Select
                  value={selectedType}
                  label="Card Type"
                  onChange={(e) => setSelectedType(e.target.value as 'student' | 'staff')}
                >
                  <MenuItem value="student">Student Cards</MenuItem>
                  <MenuItem value="staff">Staff Cards</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {selectedType === 'student' && (
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
            )}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ID Cards Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Generated ID Cards
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>ID Number</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>{selectedType === 'student' ? 'Class' : 'Position'}</TableCell>
                    <TableCell>Valid From</TableCell>
                    <TableCell>Valid Until</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredIDCards.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No ID cards found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIDCards.map((card) => (
                  <TableRow key={card.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          sx={{ width: 32, height: 32 }}
                          src={card.profileImage}
                          alt={card.name}
                        >
                          {!card.profileImage && card.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">{card.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {card.idNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={card.type}
                        color={card.type === 'student' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {card.type === 'student' ? card.class : card.position}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {card.validFrom.toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {card.validUntil.toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={card.isActive ? 'Active' : 'Inactive'}
                        color={card.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handlePreviewCard(card)}
                          color="primary"
                          title="Preview"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadPNG(card)}
                          color="success"
                          title="Download PNG"
                        >
                          <DownloadIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handlePrintCard(card)}
                          color="secondary"
                          title="Print"
                        >
                          <PrintIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog}
        onClose={() => setPreviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          ID Card Preview - {selectedCard?.name}
        </DialogTitle>
        <DialogContent>
          {selectedCard && <IDCardPreview card={selectedCard} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IDCardGeneration; 