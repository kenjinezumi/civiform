// src/pages/AdminDashboard.tsx
import React from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import { Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const goToFormBuilder = () => {
    navigate('/admin/forms/builder');
  };

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>
        {t('adminDashboard')}
      </Typography>
      <Button variant="contained" color="primary" onClick={goToFormBuilder}>
        {t('adminCreateForm')}
      </Button>
      {/* Display existing forms, stats, etc. */}
    </AdminLayout>
  );
}

export default AdminDashboard;
