// src/pages/CreateForm.tsx
import React, { useState } from 'react';
import { Typography, TextField, Button, Box } from '@mui/material';
import axios from 'axios';
import AdminLayout from '../components/layout/AdminLayout'; // or SiteLayout, if you prefer

function CreateForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // For example, your FastAPI endpoint might be at http://127.0.0.1:8000/forms
  // If you have a base URL in .env or a proxy, adjust accordingly
  const handleSubmit = async () => {
    const formData = {
      title,
      description,
      published: false,
      sections: [],
    };

    try {
      const response = await axios.post('http://127.0.0.1:8000/forms', formData);
      alert(`Form created successfully! ID: ${response.data.id}`);
      // Clear inputs
      setTitle('');
      setDescription('');
    } catch (err: any) {
      alert(`Error creating form: ${err.response?.data?.detail || err.message}`);
    }
  };

  return (
    <AdminLayout>
      <Typography variant="h5" gutterBottom>
        Create a New Form
      </Typography>

      <Box sx={{ mt: 2, maxWidth: 500 }}>
        <TextField
          label="Form Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Form Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={2}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </AdminLayout>
  );
}

export default CreateForm;
