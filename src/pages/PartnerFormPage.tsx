import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useParams } from "react-router-dom";

// ************ CONFIG ************
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

// ************ TYPES ************
interface Question {
  id: number;
  label: string;
  type: string;       // "text", "radio", "checkbox", "select", "rating", etc.
  required: boolean;
  placeholder: string;
  helpText: string;
  choices?: string[]; // for multiple-choice
}

interface Section {
  id: number;
  title: string;
  questions: Question[];
}

interface Page {
  id: number;
  title: string;
  description: string;
  unsectioned: Question[];
  sections: Section[];
}

interface FormData {
  id: number;
  title: string;
  description?: string;
  country?: string;
  due_date?: string;
  pages: Page[];
}

interface PartnerFormData {
  partner_id: string;
  partner_email: string;
  completion_percentage: number;
  password?: string;
  form?: FormData;
}

export default function PartnerFormPage() {
  const { partner_id } = useParams<{ partner_id: string }>();

  // Local states
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  // Partner data (includes the form) from backend
  const [partnerData, setPartnerData] = useState<PartnerFormData | null>(null);

  // Minimal login form
  const [emailInput, setEmailInput]     = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Keep track of answers, keyed by questionId
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});

  // -------------------------------
  // 1) Attempt login on user click
  //    (or you could auto-POST if you prefer)
  // -------------------------------
  const handleLogin = async () => {
    if (!partner_id) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/public/partner-forms/${partner_id}/login`,
        {
          email: emailInput.trim(),
          password: passwordInput.trim(),
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("✅ Login success:", res.data);
      setPartnerData(res.data);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error("❌ Login error:", err?.response?.data || err.message);
      setError(err.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // 2) If user is not authenticated yet, show login form
  // -------------------------------
  if (!isAuthenticated || !partnerData) {
    return (
      <Box sx={{ maxWidth: 400, margin: "auto", mt: 4 }}>
        <Card>
          <CardHeader title="Enter Your Credentials" />
          <CardContent>
            {/* Error display (if any) */}
            {error && <Alert severity="error">{error}</Alert>}

            {/* Minimal email & password fields */}
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              sx={{ mb: 2 }}
            />

            {/* If loading => disable, or show spinner */}
            <Button
              variant="contained"
              onClick={handleLogin}
              fullWidth
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // 3) If we are authenticated, but still no "form" in the data
  if (!partnerData.form) {
    return (
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Alert severity="warning">No form data found for this partner.</Alert>
      </Box>
    );
  }

  // 4) For capturing question input changes
  const handleQuestionChange = (qId: number, newValue: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: newValue,
    }));
  };

  // 5) If user clicks Save => we'd POST the answers
  const handleSaveAnswers = async () => {
    if (!partner_id) return;
    setLoading(true);
    setError(null);

    try {
      // Example payload with question answers
      // The structure depends on your backend's expectations
      const payload = {
        partner_form_id: 123, // you'd get the actual partner_form.id from partnerData
        answers_data: answers, // e.g. { "45": "User's answer for Qid 45" }
      };

      // Possibly POST to something like:
      await axios.post(`${API_BASE_URL}/public/partner-forms/${partner_id}/answers`, payload);
      alert("Answers saved!");
    } catch (err: any) {
      console.error("❌ Save error:", err?.response?.data || err.message);
      setError(err.response?.data?.detail || "Error saving answers.");
    } finally {
      setLoading(false);
    }
  };

  const theForm = partnerData.form;

  // 6) Render the form
  return (
    <Box sx={{ maxWidth: 800, margin: "auto", mt: 4 }}>
      {/* Display top-level form info */}
      <Typography variant="h3" align="center">
        {theForm.title}
      </Typography>

      {/* Display due_date if present */}
      {theForm.due_date && (
        <Typography variant="subtitle1" align="center" gutterBottom>
          Due Date: {new Date(theForm.due_date).toLocaleDateString()}
        </Typography>
      )}

      {/* Optional description */}
      {theForm.description && (
        <Typography variant="body1" sx={{ mb: 2 }}>
          {theForm.description}
        </Typography>
      )}

      {/* Pages -> unsectioned questions -> sections */}
      {theForm.pages.map((page) => (
        <Box
          key={page.id}
          sx={{
            mb: 3,
            p: 2,
            backgroundColor: "#fafafa",
            borderRadius: 1,
            border: "1px solid #ccc",
          }}
        >
          <Typography variant="h5">{page.title}</Typography>

          {/* Page description */}
          {page.description && (
            <Typography
              variant="body2"
              sx={{ fontStyle: "italic", mb: 2 }}
            >
              {page.description}
            </Typography>
          )}

          {/* Unsectioned questions */}
          {page.unsectioned.map((q) => (
            <Accordion key={q.id} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{q.label || "(Untitled Question)"}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {q.helpText && (
                  <Typography variant="caption" sx={{ mb: 1, display: "block" }}>
                    {q.helpText}
                  </Typography>
                )}
                <TextField
                  fullWidth
                  placeholder={q.placeholder}
                  value={answers[q.id] || ""}
                  onChange={(e) => handleQuestionChange(q.id, e.target.value)}
                />
              </AccordionDetails>
            </Accordion>
          ))}

          {/* Sections */}
          {page.sections.map((sec) => (
            <Box
              key={sec.id}
              sx={{
                border: "1px solid #eee",
                borderRadius: 1,
                p: 2,
                mb: 2,
                backgroundColor: "#fff",
              }}
            >
              <Typography variant="h6">{sec.title}</Typography>

              {sec.questions.map((q) => (
                <Accordion key={q.id} sx={{ mt: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{q.label || "(Untitled Question)"}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {q.helpText && (
                      <Typography variant="caption" sx={{ mb: 1, display: "block" }}>
                        {q.helpText}
                      </Typography>
                    )}
                    {/* Basic text field example */}
                    <TextField
                      fullWidth
                      placeholder={q.placeholder}
                      value={answers[q.id] || ""}
                      onChange={(e) => handleQuestionChange(q.id, e.target.value)}
                    />
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ))}
        </Box>
      ))}

      {/* Show error if saving fails */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* "Save" button */}
      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleSaveAnswers}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </Box>
    </Box>
  );
}
