import React, { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

interface SiteLayoutProps {
  children: ReactNode;
}

function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      minHeight="100vh" 
    >
      <Header />
      <Container sx={{ flex: 1, py: 3 }}>
        {children}
      </Container>
      <Footer />
    </Box>
  );
}

export default SiteLayout;
