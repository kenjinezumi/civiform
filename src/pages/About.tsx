// src/pages/About.tsx
import React from 'react';
import { Typography } from '@mui/material';
import SiteLayout from '../components/layout/SiteLayout';
import { useTranslation } from 'react-i18next';

function About() {
  const { t } = useTranslation();

  return (
    <SiteLayout>
      <Typography variant="h5" gutterBottom>
        {t('aboutTitle')}
      </Typography>
      <Typography variant="body2">
        {t('aboutDesc')}
      </Typography>
    </SiteLayout>
  );
}

export default About;
