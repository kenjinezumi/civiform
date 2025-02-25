// src/pages/MyForms.tsx
import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SiteLayout from '../components/layout/SiteLayout';
import axios from 'axios';

interface FormData {
  id: number;
  title: string;
  description?: string;
  published?: boolean;
  // ... (any other fields returned by your backend)
}

function MyForms() {
  const { t } = useTranslation();
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use your real backend URL, e.g. "http://127.0.0.1:8000/forms/"
        const response = await axios.get('http://127.0.0.1:8000/forms/');
        setForms(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {t('myFormsTitle')}
      </Typography>

      <Typography>
        {t('myFormsDesc')}
      </Typography>

      <Box sx={{ mt: 3 }}>
        {loading && <CircularProgress />}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && forms.length === 0 && (
          <Typography variant="body1">No forms found.</Typography>
        )}

        {!loading && !error && forms.length > 0 && (
          <Box>
            {forms.map((form) => (
              <Box key={form.id} sx={{ mb: 2 }}>
                <Typography variant="h6">
                  {form.title} (ID: {form.id})
                </Typography>
                <Typography variant="body2">
                  {form.description || 'No description provided'}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </>
  );
}

export default MyForms;
