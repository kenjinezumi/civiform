// src/pages/MyForms.tsx
import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Box, 
  CircularProgress, 
  Alert, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Grid 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import AdminLayout from '../components/layout/AdminLayout';

interface FormData {
  id: number;
  title: string;
  description?: string;
  published?: boolean;
}

function MyForms() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      setError(null);
      try {
        // Adjust the URL for your actual backend endpoint
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

  // "Edit" button or entire card click -> navigate to the form builder
  const handleEditClick = (formId: number, event?: React.MouseEvent) => {
    if (event) {
      // prevent the parent card's onClick if you're also using it
      event.stopPropagation();
    }
    navigate(`/admin/forms/builder/${formId}`);
  };

  // A "Publish" or "Partner Manager" button -> navigate to partner manager
  const handlePublishClick = (formId: number, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    // Suppose your partner manager route looks like /partner-manager?formId=...
    navigate(`/partner-manager?formId=${formId}`);
  };

  // Alternatively, if you want the entire card clickable for "Edit," you can do:
  const handleCardClick = (formId: number) => {
    navigate(`/admin/forms/builder/${formId}`);
  };

  return (
    <AdminLayout>
      <Box sx={{ mt: 2, mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {t('myFormsTitle') || 'My Forms'}
        </Typography>
        <Typography variant="body1">
          {t('myFormsDesc') || 'Here you can see all your forms in a sexy layout!'}
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Grid container spacing={3} sx={{ px: 2, pb: 4 }}>
          {forms.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" align="center">
                No forms found.
              </Typography>
            </Grid>
          ) : (
            forms.map((form) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                lg={3} 
                key={form.id}
                sx={{ cursor: 'pointer' }}
              >
                <Card
                  onClick={() => handleCardClick(form.id)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                    background: `linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)`
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {form.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {form.description || 'No description'}
                    </Typography>
                    {form.published && (
                      <Typography variant="overline" display="block" color="success.main">
                        Published
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ mt: 'auto', justifyContent: 'space-between' }}>
                    {/* Edit button */}
                    <Button 
                      size="small"
                      onClick={(e) => handleEditClick(form.id, e)}
                    >
                      Edit
                    </Button>
                    {/* Publish / Manage Partners button */}
                    <Button
                      size="small"
                      onClick={(e) => handlePublishClick(form.id, e)}
                    >
                      {t('Publish') || 'Publish'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </AdminLayout>
  );
}

export default MyForms;
