/**
 * src/pages/FormAccessManager.tsx
 *
 * Manages participant (partner) records for a published form.
 * - If the form is not published, you can optionally disable the creation flow.
 * - Creates new participants => displays partner_id + generated password from the backend.
 * - Provides "show/hide" password toggle, plus a "Regenerate" button to call an endpoint.
 */

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

// A minimal interface for the form's published status, etc.
interface FormSummary {
  id: number;
  title: string;
  published: boolean;
  // Add due_date or other fields if you want to show them here
}

// The base URL from your .env or fallback
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';
const FRONTEND_BASE_URL = window.location.origin; // Use the frontend's base URL

export default function FormAccessManager() {
  const { formId } = useParams<{ formId: string }>();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [formInfo, setFormInfo] = useState<FormSummary | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local state for creating new participants
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Track which participant IDs currently have their password "revealed"
  const [showPwdSet, setShowPwdSet] = useState<Set<number>>(new Set());

  // Overall completion: average of completion_percentage
  const overallCompletion = participants.length
    ? participants.reduce((acc, p) => acc + p.completion_percentage, 0) / participants.length
    : 0;

  // -------------------------------------------
  // 1) On mount, fetch the form info and participants
  // -------------------------------------------
  useEffect(() => {
    if (!formId) return;
    fetchFormInfo();
    fetchParticipants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  // Fetch minimal form info (to check if published)
  async function fetchFormInfo() {
    if (!formId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/forms/${formId}`);
      // Suppose the backend returns {id, title, published, ...}
      const data = res.data;
      setFormInfo({
        id: data.id,
        title: data.title,
        published: data.published,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }

  // Fetch all participants for this form
  async function fetchParticipants() {
    if (!formId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/forms/${formId}/participants`);
      setParticipants(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------------------
  // 2) Create a new participant
  // -------------------------------------------
  async function handleCreateParticipant() {
    if (!formId) return;
    // (Optionally) check if form is published:
    if (!formInfo?.published) {
      setError('Cannot add participants until the form is published.');
      return;
    }

    try {
      const payload = {
        partner_name: newName.trim() || undefined,
        partner_email: newEmail.trim() || undefined,
      };
      // POST to /forms/:formId/participants
      const res = await axios.post(`${API_BASE_URL}/forms/${formId}/participants`, payload);

      // The backend presumably returns the newly created participant, including partner_id + password
      const newParticipant: Participant = res.data;
      setParticipants((prev) => [...prev, newParticipant]);

      // Clear input fields
      setNewName('');
      setNewEmail('');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  }

  // -------------------------------------------
  // 3) Show/hide password
  // -------------------------------------------
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

  // -------------------------------------------
  // 4) Regenerate a participant's password
  // -------------------------------------------
  async function handleRegeneratePassword(pId: number) {
    if (!formId) return;
    // check published, optional
    if (!formInfo?.published) {
      setError('Cannot regenerate password unless the form is published.');
      return;
    }

    try {
      // POST or PATCH to some endpoint that regenerates the password
      const res = await axios.post(
        `${API_BASE_URL}/forms/${formId}/participants/${pId}/regenerate-password`
      );
      // The backend returns the updated participant with the new password
      const updatedParticipant: Participant = res.data;
      // Update local state
      setParticipants((prev) =>
        prev.map((p) => (p.id === pId ? updatedParticipant : p))
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  }

  // -------------------------------------------
  // 5) Render
  // -------------------------------------------
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Manage Access - Form ID {formId}
      </Typography>

      {/* If there's an error message */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* If loading while pulling data */}
      {loading && <CircularProgress sx={{ mb: 2 }} />}

      {/* Show minimal form info, e.g. "Title: X, Published: yes/no" */}
      {formInfo && (
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Form Title: {formInfo.title} <br />
          Status: {formInfo.published ? 'Published' : 'Draft'}
        </Typography>
      )}

      {/* Overall Completion */}
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Overall Completion: {overallCompletion.toFixed(1)}%
      </Typography>

      {/* Create new participant (only if published) */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          label="Participant Name"
          size="small"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={!formInfo?.published}
        />
        <TextField
          label="Participant Email"
          size="small"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          disabled={!formInfo?.published}
        />
        <Button
          variant="contained"
          onClick={handleCreateParticipant}
          disabled={!newName && !newEmail && !formInfo?.published}
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
            // Example "public" URL for partner usage
            // e.g. /partner-forms/:partner_id (or whatever route you use)
            const uniqueUrl = `${FRONTEND_BASE_URL}/partner-forms/${p.partner_id}`;

            // Is this participant's password currently revealed?
            const isShowingPwd = showPwdSet.has(p.id);
            const displayedPwd = p.password
              ? isShowingPwd
                ? p.password
                : '********'
              : '(none)';

            return (
              <TableRow key={p.id}>
                <TableCell>{p.partner_name || '(No Name)'}</TableCell>
                <TableCell>{p.partner_email || '(No Email)'}</TableCell>
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
                    onClick={() => handleRegeneratePassword(p.id)}
                    disabled={!formInfo?.published}
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
