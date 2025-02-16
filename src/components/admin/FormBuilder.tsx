import React from 'react';
import { Button, TextField, Paper, Typography, Box } from '@mui/material';
import AdminLayout from '../layout/AdminLayout';
import { useFormBuilderController } from '../../controllers/formController';
import { Question } from '../../types/formTypes';

function FormBuilder() {
  // If we’re creating a new form, we omit formId
  // If editing an existing form, pass formId to load from the backend
  const {
    formSchema,
    loading,
    error,
    addQuestion,
    updateQuestion,
    removeQuestion,
    saveForm,
  } = useFormBuilderController();

  // Handler for changing the form's title
  const handleTitleChange = (title: string) => {
    // We can directly set formSchema or add a setFormSchema function in the controller
    // For brevity, let’s do a partial approach:
    updateFormTitle(title);
  };

  // A helper to update the form's title (assuming we have direct or indirect access)
  function updateFormTitle(title: string) {
    // In a real scenario, we might have setFormSchema from the controller
    // For now, let's just do a quick approach:
    // setFormSchema({...formSchema, title}); — if you exposed setFormSchema
    // Or define a controller method: updateFormTitle()
    // For demonstration, we’ll assume we have setFormSchema from the controller:
    // ...
  }

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const updatedQ = { ...formSchema.questions[index], [field]: value };
    updateQuestion(index, updatedQ);
  };

  // Render logic
  return (
    <AdminLayout>
      <Typography variant="h5" gutterBottom>
        Form Builder
      </Typography>

      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="Form Title"
          value={formSchema.title}
          onChange={(e) => handleTitleChange(e.target.value)}
        />
      </Paper>

      {/* Render the questions */}
      {formSchema.questions.map((question, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1">
              {`Question #${index + 1}`}
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={() => removeQuestion(index)}
            >
              Remove
            </Button>
          </Box>

          {/* Example: label, placeholder, required, etc. */}
          <TextField
            fullWidth
            label="Label"
            value={question.label}
            onChange={(e) => handleQuestionChange(index, 'label', e.target.value)}
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            label="Placeholder"
            value={question.placeholder}
            onChange={(e) => handleQuestionChange(index, 'placeholder', e.target.value)}
            sx={{ mt: 2 }}
          />

          {/* ... You can expand with type selection, required checkbox, choices, etc. */}
        </Paper>
      ))}

      <Button variant="contained" onClick={addQuestion} sx={{ mr: 2 }}>
        Add Question
      </Button>
      <Button variant="contained" color="secondary" onClick={saveForm}>
        Save Form
      </Button>
    </AdminLayout>
  );
}

export default FormBuilder;
