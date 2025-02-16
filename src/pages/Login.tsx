// src/pages/Login.tsx

import React, { useState } from 'react';
import { TextField, Button, Typography, Paper, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthController } from '../controllers/authController';

function Login() {
  const navigate = useNavigate();
  const { login, error, loading } = useAuthController();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
    // If there was no error, that means login succeeded
    if (!error) {
      navigate('/admin');
    }
  };

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="80vh"
    >
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          CiviForm Login
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button 
            type="submit"
            variant="contained" 
            fullWidth
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default Login;
