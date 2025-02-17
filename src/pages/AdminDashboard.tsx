// src/pages/AdminDashboard.tsx
import React, { useRef } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import { Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
  const navigate = useNavigate();
  // A ref to the hidden file input
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Navigate to form builder if user wants to create a blank form
  const goToFormBuilder = () => {
    navigate('/admin/forms/builder');
  };

  // Trigger the file input when user clicks "Import Excel"
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Called when the user selects a file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // If you want to restrict to Excel only, you can check:
    // if (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
    //   alert("Please select an Excel file (.xls or .xlsx)");
    //   return;
    // }

    // Prepare data for upload
    const formData = new FormData();
    formData.append('file', file);

    // Call a mock or real endpoint. Once you have a backend:
    // e.g. axios.post('http://localhost:8000/import/excel', formData, ...)
    try {
      const response = await axios.post('/import/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Handle success - show message or refresh forms, etc.
      alert(`Import success! Data: ${JSON.stringify(response.data)}`);
    } catch (err: any) {
      // Show any errors
      alert(`Import failed: ${err.response?.data?.detail || err.message}`);
    }
  };

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Existing create form button */}
      <Button 
        variant="contained"
        color="primary"
        onClick={goToFormBuilder}
        sx={{ mr: 2 }}
      >
        Create New Form
      </Button>

      {/* NEW: Import Excel Button */}
      <Button 
        variant="outlined" 
        color="secondary" 
        onClick={handleImportClick}
      >
        Import Excel
      </Button>

      {/* Hidden file input (Excel) */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".xls,.xlsx"
        onChange={handleFileChange}
      />

      {/* List existing forms, stats, etc. */}
      {/* For example:
      <FormsList />
      */}
    </AdminLayout>
  );
}

export default AdminDashboard;
