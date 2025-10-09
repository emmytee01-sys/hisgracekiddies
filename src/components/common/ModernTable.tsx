import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Avatar,
  Box,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';

export interface TableColumn {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
}

export interface TableAction {
  icon: React.ReactNode;
  label: string;
  onClick: (row: any) => void;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

interface ModernTableProps {
  columns: TableColumn[];
  data: any[];
  actions?: TableAction[];
  onRowClick?: (row: any) => void;
  loading?: boolean;
  emptyMessage?: string;
  maxHeight?: number | string;
}

const ModernTable: React.FC<ModernTableProps> = ({
  columns,
  data,
  actions = [],
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  maxHeight = 600,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleRowClick = (row: any) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  const renderCell = (column: TableColumn, row: any) => {
    const value = row[column.id];
    
    if (column.render) {
      return column.render(value, row);
    }

    // Default renderers for common data types
    if (column.id === 'status' || column.id === 'isActive') {
      const isActive = typeof value === 'boolean' ? value : value === 'active';
      return (
        <Chip
          label={isActive ? 'Active' : 'Inactive'}
          color={isActive ? 'success' : 'default'}
          size="small"
          variant="outlined"
          sx={{ minWidth: 80 }}
        />
      );
    }

    if (column.id === 'gender') {
      return (
        <Chip
          label={value}
          color={value === 'male' ? 'info' : 'secondary'}
          size="small"
          variant="outlined"
          sx={{ minWidth: 70 }}
        />
      );
    }

    if (column.id === 'role' || column.id === 'type') {
      const colorMap: { [key: string]: any } = {
        admin: 'error',
        teacher: 'primary',
        secretary: 'secondary',
        parent: 'info',
        student: 'success',
        active: 'success',
        inactive: 'default',
      };
      
      return (
        <Chip
          label={value}
          color={colorMap[value?.toLowerCase()] || 'default'}
          size="small"
          variant="outlined"
        />
      );
    }

    if (column.id === 'amount' || column.id === 'price' || column.id === 'fee') {
      return (
        <Typography variant="body2" fontWeight="medium">
          ₦{typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
      );
    }

    if (column.id === 'date' || column.id === 'createdAt' || column.id === 'updatedAt') {
      return (
        <Typography variant="body2" color="text.secondary">
          {value instanceof Date ? value.toLocaleDateString() : value}
        </Typography>
      );
    }

    return (
      <Typography variant="body2" noWrap>
        {value}
      </Typography>
    );
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Paper>
    );
  }

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {emptyMessage}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No records found
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={0}
      sx={{ 
        borderRadius: 2, 
        boxShadow: '0 4px 25px rgba(138, 43, 226, 0.15)', 
        border: '1px solid #f0f0f0',
        overflow: 'hidden',
      }}
    >

      
      <TableContainer sx={{ maxHeight }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ background: '#f8f9fa' }}>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{
                    fontWeight: 'bold',
                    color: 'text.primary',
                    fontSize: '0.875rem',
                    borderBottom: '1px solid #f0f0f0',
                    width: column.width,
                    minWidth: column.width,
                    py: 1.5,
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    color: 'text.primary',
                    fontSize: '0.875rem',
                    borderBottom: '1px solid #f0f0f0',
                    width: 120,
                    minWidth: 120,
                    py: 1.5,
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={row.id || index}
                hover
                onClick={() => handleRowClick(row)}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:hover': {
                    backgroundColor: 'rgba(138, 43, 226, 0.05)',
                  },
                  '&:last-child td': {
                    borderBottom: 0,
                  },
                }}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    sx={{
                      borderBottom: '1px solid #f0f0f0',
                      py: 1.5,
                    }}
                  >
                    {renderCell(column, row)}
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell
                    align="center"
                    sx={{
                      borderBottom: '1px solid #f0f0f0',
                      py: 1.5,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      {actions.map((action, actionIndex) => (
                        <Tooltip key={actionIndex} title={action.label}>
                          <IconButton
                            size="small"
                            color={action.color || 'primary'}
                            onClick={() => action.onClick(row)}
                            sx={{
                              color: action.color === 'error' ? '#FF5252' : '#8A2BE2',
                              '&:hover': {
                                backgroundColor: action.color === 'error' 
                                  ? 'rgba(255, 82, 82, 0.1)' 
                                  : 'rgba(138, 43, 226, 0.1)',
                              },
                            }}
                          >
                            {action.icon}
                          </IconButton>
                        </Tooltip>
                      ))}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination Footer */}
      <Box sx={{ p: 2.5, borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa' }}>
        <Typography variant="caption" color="text.secondary" fontSize="11px">
          Showing 1-{data.length} of {data.length} entries
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <Box component="span" sx={{ fontSize: '12px' }}>‹</Box>
          </IconButton>
          <Box sx={{ display: 'flex', gap: 0.25 }}>
            {[1].map((page) => (
              <IconButton
                key={page}
                size="small"
                sx={{
                  minWidth: 28,
                  height: 28,
                  backgroundColor: '#8A2BE2',
                  color: 'white',
                  fontSize: '12px',
                  '&:hover': {
                    backgroundColor: '#7B68EE',
                  },
                }}
              >
                {page}
              </IconButton>
            ))}
          </Box>
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <Box component="span" sx={{ fontSize: '12px' }}>›</Box>
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default ModernTable; 