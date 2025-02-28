/**
 * src/pages/MyForms.tsx
 *
 * Lists all forms returned by GET /forms,
 * with a search box, sort dropdown, create button,
 * and "edit" => navigate to FormBuilder
 */
import React, { useEffect, useState, ChangeEvent } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// MUI icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Minimal interface for what /forms returns
interface FormData {
  id: number;
  title: string;
  description?: string;
  published?: boolean;
  updated_at?: string;
  // etc.
}

type SortOption = 'title-asc' | 'title-desc' | 'date-latest' | 'date-oldest';

export default function MyForms() {
  const navigate = useNavigate();

  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search + sort
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('title-asc');

  // Fetch forms
  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      setError(null);
      try {
        // e.g. GET /forms
        const res = await axios.get('http://127.0.0.1:8000/forms');
        setForms(res.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, []);

  // Edit => /admin/forms/builder/:id
  const handleEditClick = (formId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(`/admin/forms/builder/${formId}`);
  };

  // Delete => might do patch or delete
  const handleDeleteClick = async (formId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this form?')) return;
    try {
      // example patch
      await axios.patch(`http://127.0.0.1:8000/forms/${formId}`, { is_deleted: true });
      setForms((prev) => prev.filter((f) => f.id !== formId));
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.detail || err.message}`);
    }
  };

  // Searching
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Sorting
  const handleSortChange = (e: SelectChangeEvent) => {
    setSortOption(e.target.value as SortOption);
  };

  // Filter
  const filteredForms = forms.filter((f) =>
    f.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort
  const sortedForms = [...filteredForms].sort((a, b) => {
    switch (sortOption) {
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      case 'date-latest':
        return (b.updated_at ? new Date(b.updated_at).getTime() : 0)
          - (a.updated_at ? new Date(a.updated_at).getTime() : 0);
      case 'date-oldest':
        return (a.updated_at ? new Date(a.updated_at).getTime() : 0)
          - (b.updated_at ? new Date(b.updated_at).getTime() : 0);
      default:
        return 0;
    }
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>My Forms</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Search Title"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <FormControl size="small">
          <InputLabel>Sort By</InputLabel>
          <Select value={sortOption} onChange={handleSortChange} label="Sort By">
            <MenuItem value="title-asc">Title (A-Z)</MenuItem>
            <MenuItem value="title-desc">Title (Z-A)</MenuItem>
            <MenuItem value="date-latest">Date (Latest)</MenuItem>
            <MenuItem value="date-oldest">Date (Oldest)</MenuItem>
          </Select>
        </FormControl>

        {/* Button to create a brand new form */}
        <Button variant="contained" onClick={() => navigate('/admin/forms/builder/new')}>
          Create New Form
        </Button>
      </Box>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {sortedForms.length === 0 ? (
          <Grid item xs={12}>
            <Typography>No forms found.</Typography>
          </Grid>
        ) : (
          sortedForms.map((f) => (
            <Grid key={f.id} item xs={12} sm={6} md={4} lg={3}>
              <Box
                sx={{
                  p: 2,
                  border: '1px solid #ccc',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: '0.3s',
                  '&:hover': { backgroundColor: '#f7f7f7' },
                }}
                onClick={() => handleEditClick(f.id)}
              >
                <Typography variant="h6">{f.title}</Typography>
                {f.description && (
                  <Typography variant="body2" color="text.secondary">
                    {f.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                  <IconButton size="small" onClick={(e) => handleEditClick(f.id, e)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={(e) => handleDeleteClick(f.id, e)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
