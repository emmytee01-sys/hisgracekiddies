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
  Tabs,
  Tab,
  Badge,
  Container,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  CalendarToday as CalendarIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Sports as SportsIcon,
  MusicNote as MusicIcon,
  BeachAccess as HolidayIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { Event } from '../types';
import { useEventsRealtime, useEvents } from '../hooks/useFirebaseData';
import { toast } from 'react-toastify';

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

const EventManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  const { data: eventsRt } = useEventsRealtime();
  const { addItem, updateItem, deleteItem } = useEvents();

  const events = (eventsRt as unknown as Event[]) || [];

  const eventTypes = [
    { value: 'academic', label: 'Academic', icon: <SchoolIcon />, color: 'primary' },
    { value: 'sports', label: 'Sports', icon: <SportsIcon />, color: 'success' },
    { value: 'cultural', label: 'Cultural', icon: <MusicIcon />, color: 'secondary' },
    { value: 'holiday', label: 'Holiday', icon: <HolidayIcon />, color: 'warning' },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => setTabValue(newValue);
  const handleAddEvent = () => { setEditingEvent(null); setShowForm(true); };
  const handleEditEvent = (e: Event) => { setEditingEvent(e); setShowForm(true); };

  const handleDeleteEvent = async (id: string) => {
    try { await deleteItem(id); toast.success('Event deleted'); } catch { toast.error('Delete failed'); }
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setViewMode('detail');
  };

  const validate = (data: any) => {
    if (!data.title) return 'Title is required';
    if (!data.date) return 'Date is required';
    if (!data.type) return 'Type is required';
    return null;
  };

  const handleSaveEvent = async (data: any) => {
    const err = validate(data); if (err) { toast.error(err); return; }
    const payload = {
      title: data.title,
      description: data.description || '',
      date: new Date(data.date),
      type: data.type,
      isActive: editingEvent?.isActive ?? true,
      createdBy: data.createdBy || 'admin',
    } as Omit<Event, 'id'>;
    try {
      if (editingEvent) await updateItem(editingEvent.id, payload as Partial<Event>); else await addItem(payload);
      toast.success('Event saved');
      setShowForm(false);
    } catch { toast.error('Failed to save event'); }
  };

  const getEventTypeInfo = (type: string) => {
    return eventTypes.find(t => t.value === type) || eventTypes[0];
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return events.filter(e => e.date >= today && e.isActive).sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const getPastEvents = () => {
    const today = new Date();
    return events.filter(e => e.date < today).sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const getEventsByType = (type: string) => {
    return events.filter(e => e.type === type && e.isActive);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingEvent(null);
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
                Back to Events
              </Link>
            </Breadcrumbs>
            <Typography variant="h4" color="primary" gutterBottom>
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Fill in the event information below.
            </Typography>
          </Paper>
          
          <EventForm
            event={editingEvent}
            onSave={handleSaveEvent}
            onCancel={handleCancelForm}
            eventTypes={eventTypes}
          />
        </Container>
      </Box>
    );
  }

  if (viewMode === 'detail' && selectedEvent) {
    const eventType = getEventTypeInfo(selectedEvent.type);
    
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => setViewMode('list')} sx={{ mr: 2 }}>
              <EditIcon />
            </IconButton>
            <Typography variant="h4" color="primary">
              {selectedEvent.title}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => handleEditEvent(selectedEvent)}
          >
            Edit Event
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Event Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Event Details
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Event Type
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Box sx={{ mr: 1, color: `${eventType.color}.main` }}>
                      {eventType.icon}
                    </Box>
                    <Chip
                      label={eventType.label}
                      color={eventType.color as any}
                      size="small"
                    />
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedEvent.date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Time
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedEvent.date.toLocaleTimeString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedEvent.isActive ? 'Active' : 'Inactive'}
                    color={selectedEvent.isActive ? 'success' : 'default'}
                    size="small"
                    icon={selectedEvent.isActive ? <CheckCircleIcon /> : undefined}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Event Description */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1">
                  {selectedEvent.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Event Statistics */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Event Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {events.filter(e => e.type === selectedEvent.type).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total {eventType.label} Events
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {getUpcomingEvents().filter(e => e.type === selectedEvent.type).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Upcoming {eventType.label} Events
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {getPastEvents().filter(e => e.type === selectedEvent.type).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Past {eventType.label} Events
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary">
          Event Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddEvent}
        >
          Add New Event
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
                    Total Events
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {events.length}
                  </Typography>
                </Box>
                <EventIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                    Upcoming Events
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {getUpcomingEvents().length}
                  </Typography>
                </Box>
                <ScheduleIcon sx={{ fontSize: 40, color: 'success.main' }} />
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
                    Active Events
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {events.filter(e => e.isActive).length}
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
                    This Month
                  </Typography>
                  <Typography variant="h4" color="secondary.main">
                    {events.filter(e => {
                      const now = new Date();
                      const eventDate = e.date;
                      return eventDate.getMonth() === now.getMonth() && 
                             eventDate.getFullYear() === now.getFullYear();
                    }).length}
                  </Typography>
                </Box>
                <CalendarIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="All Events" />
            <Tab label="Upcoming Events" />
            <Tab label="Academic Events" />
            <Tab label="Sports Events" />
            <Tab label="Cultural Events" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => {
                  const eventType = getEventTypeInfo(event.type);
                  return (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ mr: 2, color: `${eventType.color}.main` }}>
                            {eventType.icon}
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {event.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {event.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={eventType.label}
                          color={eventType.color as any}
                          size="small"
                          icon={eventType.icon}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {event.date.toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.date.toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={event.isActive ? 'Active' : 'Inactive'}
                          color={event.isActive ? 'success' : 'default'}
                          size="small"
                          icon={event.isActive ? <CheckCircleIcon /> : undefined}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleViewEvent(event)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditEvent(event)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Upcoming Events
          </Typography>
          {/* List component removed as per new_code, but logic remains */}
          {getUpcomingEvents().map((event) => {
            const eventType = getEventTypeInfo(event.type);
            return (
              <Box key={event.id} sx={{ mb: 1 }}>
                <Chip
                  label={`${event.title} (${eventType.label})`}
                  color={eventType.color as any}
                  icon={eventType.icon}
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {event.date.toLocaleDateString()} - {event.description}
                </Typography>
              </Box>
            );
          })}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Academic Events
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getEventsByType('academic').map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{event.date.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={event.isActive ? 'Active' : 'Inactive'}
                        color={event.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewEvent(event)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditEvent(event)}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Sports Events
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getEventsByType('sports').map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{event.date.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={event.isActive ? 'Active' : 'Inactive'}
                        color={event.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewEvent(event)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditEvent(event)}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Cultural Events
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getEventsByType('cultural').map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{event.date.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={event.isActive ? 'Active' : 'Inactive'}
                        color={event.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewEvent(event)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditEvent(event)}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>


    </Box>
  );
};

// Event Form Component
interface EventFormProps {
  event: Event | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  eventTypes: any[];
}

const EventForm: React.FC<EventFormProps> = ({ event, onSave, onCancel, eventTypes }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date ? event.date.toISOString().split('T')[0] : '',
    type: event?.type || 'academic',
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
            label="Event Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="e.g., Annual Sports Day"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            placeholder="Describe the event details"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Event Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Event Type</InputLabel>
            <Select
              value={formData.type}
              label="Event Type"
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'sports' | 'academic' | 'cultural' | 'holiday' })}
            >
              {eventTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ mr: 1, color: `${type.color}.main` }}>
                      {type.icon}
                    </Box>
                    {type.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" type="submit" startIcon={<SaveIcon />}>
          {event ? 'Update' : 'Create'} Event
        </Button>
      </Box>
      </Box>
    </Paper>
  );
};

export default EventManagement; 