/**
 * src/pages/MyForms.tsx
 *
 * Full code with each form tile at full width (one item per row).
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

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface FormData {
  id: number;
  title: string;
  description?: string;
  published?: boolean;
  updated_at?: string;
  country?: string;
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

  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      setError(null);
      try {
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

  const handleEditClick = (formId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(`/admin/forms/builder/${formId}`);
  };

  const handleDeleteClick = async (formId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this form?')) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/forms/${formId}`);
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

  const filtered = forms.filter((f) =>
    f.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) => {
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

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Forms
      </Typography>

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

        <Button variant="contained" onClick={() => navigate('/admin/forms/builder/new')}>
          Create New Form
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {sorted.length === 0 ? (
        <Typography>No forms match your search.</Typography>
      ) : (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {sorted.map((form) => (
            <Grid key={form.id} item xs={12}>
              <Box
                sx={{
                  p: 2,
                  border: '1px solid #ccc',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: '0.3s',
                  '&:hover': { backgroundColor: '#f7f7f7' },
                }}
                onClick={() => handleEditClick(form.id)}
              >
                <Typography variant="h6">
                  {form.title} (ID: {form.id})
                </Typography>
                {form.description && (
                  <Typography variant="body2" color="text.secondary">
                    {form.description}
                  </Typography>
                )}
                {form.country && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Country:</strong> {form.country}
                  </Typography>
                )}
                {form.updated_at && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Last Updated:{' '}
                    {new Date(form.updated_at).toLocaleString()}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                  <IconButton size="small" onClick={(e) => handleEditClick(form.id, e)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => handleDeleteClick(form.id, e)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
