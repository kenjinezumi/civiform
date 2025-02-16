import React, { useState } from 'react';
import {
  Typography,
  Button,
  Box,
  IconButton,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Select,
  InputLabel,
  FormControl,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

import { useFormBuilderController } from '../../controllers/formController';
import { Question } from '../../types/formTypes';
import AdminLayout from '../layout/AdminLayout';

/**
 * Additional types to demonstrate advanced question types:
 * - 'rating' (1-5)
 * - 'file' (file upload placeholder)
 * - 'section' (non-question, used as a title/heading)
 */
const QUESTION_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'radio', label: 'Single Select (Radio)' },
  { value: 'checkbox', label: 'Multi Select (Checkbox)' },
  { value: 'select', label: 'Dropdown' },
  { value: 'rating', label: 'Rating (1-5)' },
  { value: 'file', label: 'File Upload' },
  { value: 'section', label: 'Section Title (non-question)' },
];

function FormBuilder() {
  const {
    formSchema,
    loading,
    error,
    updateTitle,
    updateDescription,
    addQuestion,
    updateQuestion,
    removeQuestion,
    moveQuestion,
    saveForm,
  } = useFormBuilderController();

  // Track expanded panels for advanced settings
  const [expanded, setExpanded] = useState<number | false>(false);

  const handleAccordionToggle = (panelIndex: number) => {
    setExpanded((prev) => (prev === panelIndex ? false : panelIndex));
  };

  // Helper: update a question property
  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: any
  ) => {
    const updatedQ = { ...formSchema.questions[index], [field]: value };
    updateQuestion(index, updatedQ);
  };

  // Add a choice to multiple-choice types
  const addChoiceToQuestion = (index: number) => {
    const question = formSchema.questions[index];
    question.choices = [...question.choices, ''];
    updateQuestion(index, question);
  };

  // Update a specific choice
  const updateChoice = (qIndex: number, cIndex: number, value: string) => {
    const question = formSchema.questions[qIndex];
    question.choices[cIndex] = value;
    updateQuestion(qIndex, question);
  };

  // Basic preview function (just a placeholder for the demonstration)
  const previewQuestion = (index: number) => {
    const q = formSchema.questions[index];
    alert(`Previewing question: ${q.label}\n(Type: ${q.type})`);
  };

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>
        {loading ? 'Loading...' : 'KoBo-like Form Builder'}
      </Typography>
      {error && <Typography color="error">{error}</Typography>}

      {/* Form Title & Description */}
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Form Title"
          value={formSchema.title}
          onChange={(e) => updateTitle(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Form Description"
          value={formSchema.description}
          onChange={(e) => updateDescription(e.target.value)}
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={addQuestion}>
          Add Question
        </Button>
      </Box>

      {/* Render each question in a Card */}
      {formSchema.questions.map((q, index) => (
        <Card key={index} variant="outlined" sx={{ mb: 2 }}>
          <CardHeader
            sx={{ bgcolor: '#f5f5f5' }}
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  Q{index + 1}: {q.label || '(Untitled)'}
                </Typography>
                <IconButton onClick={() => moveQuestion(index, index - 1)}>
                  <ArrowUpwardIcon />
                </IconButton>
                <IconButton onClick={() => moveQuestion(index, index + 1)}>
                  <ArrowDownwardIcon />
                </IconButton>
                <IconButton onClick={() => removeQuestion(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
            subheader={`Question Type: ${q.type}`}
          />
          <CardContent>
            {/* BASIC SETTINGS */}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Question Label"
                  value={q.label}
                  onChange={(e) =>
                    handleQuestionChange(index, 'label', e.target.value)
                  }
                  fullWidth
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Question Type</InputLabel>
                  <Select
                    label="Question Type"
                    value={q.type}
                    onChange={(e) =>
                      handleQuestionChange(index, 'type', e.target.value)
                    }
                  >
                    {QUESTION_TYPES.map((typeOption) => (
                      <MenuItem key={typeOption.value} value={typeOption.value}>
                        {typeOption.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Required / Basic toggles */}
              <Grid
                item
                xs={12}
                sm={6}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={q.required}
                      onChange={(e) =>
                        handleQuestionChange(
                          index,
                          'required',
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Required?"
                />
              </Grid>

              {/* If not a 'section' question type, show placeholder */}
              {q.type !== 'section' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Placeholder"
                    value={q.placeholder}
                    onChange={(e) =>
                      handleQuestionChange(index, 'placeholder', e.target.value)
                    }
                    fullWidth
                  />
                </Grid>
              )}

              {/* Quick Preview button */}
              <Grid
                item
                xs={12}
                sm={6}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
              >
                <Button variant="outlined" onClick={() => previewQuestion(index)}>
                  Preview
                </Button>
              </Grid>
            </Grid>

            {/* For multiple-choice or rating question types, show choices */}
            {(q.type === 'radio' ||
              q.type === 'checkbox' ||
              q.type === 'select') && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2">Choices</Typography>
                {q.choices.map((choice, cIndex) => (
                  <TextField
                    key={cIndex}
                    label={`Choice ${cIndex + 1}`}
                    value={choice}
                    onChange={(e) => updateChoice(index, cIndex, e.target.value)}
                    sx={{ display: 'block', mb: 1 }}
                  />
                ))}
                <Button
                  variant="outlined"
                  onClick={() => addChoiceToQuestion(index)}
                >
                  Add Choice
                </Button>
              </Box>
            )}

            {/* If rating type, show a note about scale */}
            {q.type === 'rating' && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2">
                  Rating Scale (1-5) by default
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In a real app, you might allow customizing max rating or
                  labels.
                </Typography>
              </Box>
            )}

            {/* If file upload type, placeholder for file logic */}
            {q.type === 'file' && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2">File Upload</Typography>
                <Typography variant="body2" color="text.secondary">
                  In a real app, you'd handle file inputs, storage, etc.
                </Typography>
              </Box>
            )}

            {/* ADVANCED SETTINGS (Accordion) */}
            <Accordion
              expanded={expanded === index}
              onChange={() => handleAccordionToggle(index)}
              sx={{ mt: 3 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Advanced Settings</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Help Text</Typography>
                  <TextField
                    label="Additional Help"
                    value={q.helpText}
                    onChange={(e) =>
                      handleQuestionChange(index, 'helpText', e.target.value)
                    }
                    fullWidth
                    multiline
                    rows={2}
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Skip Logic (Optional)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Show or hide this question based on another question's answer.
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        type="number"
                        label="Reference Q# Index"
                        value={q.skipLogic?.referenceQuestionIndex ?? ''}
                        onChange={(e) =>
                          handleQuestionChange(index, 'skipLogic', {
                            ...q.skipLogic,
                            referenceQuestionIndex: +e.target.value,
                          })
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth>
                        <InputLabel>Operator</InputLabel>
                        <Select
                          label="Operator"
                          value={q.skipLogic?.operator ?? ''}
                          onChange={(e) =>
                            handleQuestionChange(index, 'skipLogic', {
                              ...q.skipLogic,
                              operator: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="==">==</MenuItem>
                          <MenuItem value="!=">!=</MenuItem>
                          <MenuItem value="contains">contains</MenuItem>
                          <MenuItem value="not-contains">not-contains</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="Value"
                        value={q.skipLogic?.value ?? ''}
                        onChange={(e) =>
                          handleQuestionChange(index, 'skipLogic', {
                            ...q.skipLogic,
                            value: e.target.value,
                          })
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth>
                        <InputLabel>Action</InputLabel>
                        <Select
                          label="Action"
                          value={q.skipLogic?.action ?? ''}
                          onChange={(e) =>
                            handleQuestionChange(index, 'skipLogic', {
                              ...q.skipLogic,
                              action: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="show">Show</MenuItem>
                          <MenuItem value="hide">Hide</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      ))}

      {/* SAVE FORM BUTTON */}
      <Button variant="contained" color="primary" onClick={saveForm} disabled={loading}>
        {loading ? 'Saving...' : 'Save Form'}
      </Button>
    </AdminLayout>
  );
}

export default FormBuilder;
