// src/pages/PartnerManager.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

interface Form {
  id: number;
  title: string;
  // any other fields (description, published, etc.)
}

interface PartnerFormOut {
  id: number;
  form_id: number;
  partner_id: string;
  partner_name?: string;
  partner_email?: string;
  public_url: string;
  completion_percentage: number;
}

// This is the data for creating a partner form
interface PartnerFormCreate {
  form_id: number;
  partner_id: string;
  partner_name?: string;
  partner_email?: string;
  public_url: string; // or you let backend generate
  completion_percentage?: number;
}

function PartnerManager() {
  // State to store the list of available forms
  const [forms, setForms] = useState<Form[]>([]);
  // The selected form ID for publishing
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);

  // Partner form input fields
  const [partnerId, setPartnerId] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [publicUrl, setPublicUrl] = useState('');

  // List of created partner forms (for display)
  const [partnerForms, setPartnerForms] = useState<PartnerFormOut[]>([]);

  // 1) Fetch forms on mount
  useEffect(() => {
    axios.get<Form[]>('/forms')
      .then(res => {
        setForms(res.data);
      })
      .catch(err => {
        console.error('Error fetching forms:', err);
      });
  }, []);

  // 2) Optionally fetch partner forms for the selected form
  //    if you want to see partner forms per form. Or skip if you don't need.
  useEffect(() => {
    if (selectedFormId !== null) {
      // Maybe your backend has /partner-forms?form_id=XYZ or something
      // For example, if your partner_form_router has a route:
      //   GET /partner-forms?form_id=123
      axios.get<PartnerFormOut[]>(`/partner-forms?form_id=${selectedFormId}`)
        .then(res => setPartnerForms(res.data))
        .catch(err => console.error('Error fetching partner forms:', err));
    }
  }, [selectedFormId]);

  const handleCreatePartnerForm = async () => {
    if (!selectedFormId) {
      alert('Please select a form first.');
      return;
    }

    const payload: PartnerFormCreate = {
      form_id: selectedFormId,
      partner_id: partnerId,
      partner_name: partnerName || undefined,
      partner_email: partnerEmail || undefined,
      public_url: publicUrl || '', // or let backend generate
      completion_percentage: 0.0
    };

    try {
      const res = await axios.post<PartnerFormOut>('/partner-forms', payload);
      const created = res.data;
      // Add it to our local state for display
      setPartnerForms((prev) => [...prev, created]);
      // Clear fields
      setPartnerId('');
      setPartnerName('');
      setPartnerEmail('');
      setPublicUrl('');
      alert(`Partner form created! URL: ${created.public_url}`);
    } catch (err: any) {
      console.error('Error creating partner form:', err);
      alert(`Error: ${err.response?.data?.detail || err.message}`);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Partner Manager
      </Typography>

      {/* Select which form to publish */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel id="select-form-label">Select a Form</InputLabel>
          <Select
            labelId="select-form-label"
            label="Select a Form"
            value={selectedFormId ?? ''}
            onChange={(e) => setSelectedFormId(e.target.value as number)}
          >
            <MenuItem value="">-- None --</MenuItem>
            {forms.map((f) => (
              <MenuItem key={f.id} value={f.id}>
                {f.title} (ID: {f.id})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Create new PartnerForm */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 400 }}>
        <TextField
          label="Partner ID"
          value={partnerId}
          onChange={(e) => setPartnerId(e.target.value)}
        />
        <TextField
          label="Partner Name (optional)"
          value={partnerName}
          onChange={(e) => setPartnerName(e.target.value)}
        />
        <TextField
          label="Partner Email (optional)"
          value={partnerEmail}
          onChange={(e) => setPartnerEmail(e.target.value)}
        />
        <TextField
          label="Public URL Slug (optional)"
          helperText="Leave empty to let the backend generate a random slug."
          value={publicUrl}
          onChange={(e) => setPublicUrl(e.target.value)}
        />
        <Button variant="contained" onClick={handleCreatePartnerForm}>
          Create Partner Form
        </Button>
      </Box>

      {/* Display partner forms for the selected form */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Existing Partner URLs for this Form
        </Typography>
        <List>
          {partnerForms.map((pf) => (
            <ListItem key={pf.id}>
              <ListItemText
                primary={`Partner ID: ${pf.partner_id}, Name: ${pf.partner_name || ''}`}
                secondary={
                  <>
                    URL: {pf.public_url} <br />
                    Completion: {pf.completion_percentage}%
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
}

export default PartnerManager;
