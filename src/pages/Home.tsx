// src/pages/Home.tsx
import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SiteLayout from '../components/layout/SiteLayout';

function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation(); // <-- Hook for translations

  const handleCreateNewForm = () => {
    navigate('/admin/forms/builder');
  };

  return (
    <SiteLayout>
      <Box textAlign="center" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('welcomeTitle')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {t('welcomeDesc')}
        </Typography>

        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleCreateNewForm}
        >
          {t('createNewForm')}
        </Button>
      </Box>
    </SiteLayout>
  );
}

export default Home;
