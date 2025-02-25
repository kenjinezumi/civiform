// src/components/layout/AdminLayout.tsx
import React, { FC, ReactNode } from 'react';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: FC<AdminLayoutProps> = ({ children }) => {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            CiviForm Admin
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
        {children}
      </Container>
    </>
  );
};

export default AdminLayout;
