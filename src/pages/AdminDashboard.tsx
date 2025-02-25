// src/pages/AdminDashboard.tsx
import React, { useRef } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import { Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const goToFormBuilder = () => {
    navigate('/admin/forms/builder');
  };

  

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/import/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(`Import success! Data: ${JSON.stringify(response.data)}`);
    } catch (err: any) {
      alert(`Import failed: ${err.response?.data?.detail || err.message}`);
    }
  };

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={goToFormBuilder}
        sx={{ mr: 2 }}
      >
        Create New Form
      </Button>

      <Button
        variant="outlined"
        color="secondary"
        onClick={handleImportClick}
      >
        Import Excel
      </Button>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".xls,.xlsx"
        onChange={handleFileChange}
      />
    </AdminLayout>
  );
}

export default AdminDashboard;
