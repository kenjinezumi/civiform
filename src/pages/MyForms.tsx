// src/pages/MyForms.tsx
import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SiteLayout from '../components/layout/SiteLayout';

function MyForms() {
  const { t } = useTranslation();

  return (
    <SiteLayout>
      <Typography variant="h4" gutterBottom>
        {t('myFormsTitle')}
      </Typography>
      <Typography>
        {t('myFormsDesc')}
      </Typography>
      {/* You can list forms, add "create new form" buttons, etc. */}
    </SiteLayout>
  );
}

export default MyForms;
