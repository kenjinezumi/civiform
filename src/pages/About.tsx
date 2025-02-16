// src/pages/About.tsx
import React from 'react';
import { Typography } from '@mui/material';
import SiteLayout from '../components/layout/SiteLayout';

function About() {
  return (
    <SiteLayout>
      <Typography variant="h5">About CiviForm</Typography>
      <Typography variant="body2">
        CiviForm is a form-building platform designed to ...
      </Typography>
    </SiteLayout>
  );
}

export default About;
