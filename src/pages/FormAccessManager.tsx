// src/pages/FormAccessManager.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  TextField,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// Type definition for each participant record
interface Participant {
  id: number;
  partner_id: string;
  partner_name?: string;
  partner_email?: string;
  password?: string;
  completion_percentage: number;
}

// The base URL from your .env
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

export default function FormAccessManager() {
  const { formId } = useParams<{ formId: string }>();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local state for creating new participants
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Which participant IDs have revealed passwords
  const [showPwdSet, setShowPwdSet] = useState<Set<number>>(new Set());

  // Overall completion: average of completion_percentage
  const overallCompletion = participants.length
    ? participants.reduce((acc, p) => acc + p.completion_percentage, 0) /
      participants.length
    : 0;

  useEffect(() => {
    if (!formId) return;
    fetchParticipants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  async function fetchParticipants() {
    if (!formId) return;
    setLoading(true);
    setError(null);
    try {
      // Use the base URL from env
      const res = await axios.get(
        `${API_BASE_URL}/forms/${formId}/participants`
      );
      setParticipants(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }

  // Create a new participant
  async function handleCreateParticipant() {
    if (!formId) return;
    try {
      const payload = {
        partner_name: newName,
        partner_email: newEmail,
      };
      // POST to the /forms/:formId/participants endpoint
      const res = await axios.post(
        `${API_BASE_URL}/forms/${formId}/participants`,
        payload
      );
      setParticipants((prev) => [...prev, res.data]);
      setNewName('');
      setNewEmail('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  }

  // Toggle show/hide for a participant's password
  function handleToggleShowPwd(participantId: number) {
    setShowPwdSet((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(participantId)) {
        newSet.delete(participantId);
      } else {
        newSet.add(participantId);
      }
      return newSet;
    });
  }

  // Regenerate password => calls PATCH to /forms/:formId/participants/:pf_id
  async function handleRegeneratePassword(p: Participant) {
    if (!formId) return;
    setLoading(true);
    setError(null);
    try {
      // Example PATCH call. Adjust logic/payload as your backend requires
      const res = await axios.patch(
        `${API_BASE_URL}/forms/${formId}/participants/${p.id}`,
        {
          regeneratePassword: true,
        }
      );
      const updatedParticipant = res.data as Participant;

      // Update participant array
      setParticipants((prev) =>
        prev.map((oldP) =>
          oldP.id === updatedParticipant.id ? updatedParticipant : oldP
        )
      );

      // Optionally show the new password
      setShowPwdSet((prev) => {
        const newSet = new Set(prev);
        newSet.add(updatedParticipant.id);
        return newSet;
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Manage Access - Form ID {formId}
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}
      {loading && <CircularProgress sx={{ mb: 2 }} />}

      {/* Overall Completion */}
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Overall Completion: {overallCompletion.toFixed(1)}%
      </Typography>

      {/* Create new participant */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          label="Name"
          size="small"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <TextField
          label="Email"
          size="small"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleCreateParticipant}
          disabled={!newName && !newEmail}
        >
          Add Participant
        </Button>
      </Box>

      {/* Display participants */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Password</TableCell>
            <TableCell>Unique URL</TableCell>
            <TableCell>Completion</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {participants.map((p) => {
            // Example "public" URL
            const uniqueUrl = `http://mydomain.com/forms/public?slug=${p.partner_id}`;

            const isShowingPwd = showPwdSet.has(p.id);
            const displayedPwd = p.password
              ? isShowingPwd
                ? p.password
                : '********'
              : '(none)';

            return (
              <TableRow key={p.id}>
                <TableCell>{p.partner_name}</TableCell>
                <TableCell>{p.partner_email}</TableCell>
                <TableCell>
                  {displayedPwd}{' '}
                  {p.password && (
                    <Button
                      size="small"
                      onClick={() => handleToggleShowPwd(p.id)}
                      sx={{ ml: 1 }}
                    >
                      {isShowingPwd ? 'Hide' : 'Show'}
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <a href={uniqueUrl} target="_blank" rel="noreferrer">
                    {uniqueUrl}
                  </a>
                </TableCell>
                <TableCell>{p.completion_percentage.toFixed(1)}%</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleRegeneratePassword(p)}
                  >
                    Regenerate
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
