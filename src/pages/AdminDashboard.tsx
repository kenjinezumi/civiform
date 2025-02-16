import React from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import { Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();

  const goToFormBuilder = () => {
    navigate('/admin/forms/builder');
  };

  return (
    <AdminLayout>
      <Typography variant="h4">Admin Dashboard</Typography>
      <Button variant="contained" color="primary" onClick={goToFormBuilder}>
        Create New Form
      </Button>
      {/* Display existing forms, stats, etc. */}
    </AdminLayout>
  );
}

export default AdminDashboard;
