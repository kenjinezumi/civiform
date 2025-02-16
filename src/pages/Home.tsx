// src/pages/Home.tsx
import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SiteLayout from '../components/layout/SiteLayout';

function Home() {
  const navigate = useNavigate();

  const handleCreateNewForm = () => {
    navigate('/admin/forms/builder');
  };

  return (
    // If your Home is already wrapped in a layout, you can omit SiteLayout here
    <Box textAlign="center" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to CiviForm!
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Build and manage forms with ease—like Kobo Toolbox, but fully customizable.
      </Typography>

      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleCreateNewForm}
      >
        Create a New Form
      </Button>
    </Box>
  );
}

export default Home;
