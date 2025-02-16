import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Button, TextField, Box } from '@mui/material';

function PublicForm() {
  const { formId } = useParams();
  // Mock schema or fetch from API
  const [schema] = useState({
    title: 'Sample Form',
    questions: [
      { id: 'q1', label: 'Your Name', type: 'text' },
      { id: 'q2', label: 'Your Age', type: 'number' },
    ],
  });

  const [answers, setAnswers] = useState({});

  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    // In production, call API to save data
    console.log('Submitting answers:', answers);
  };

  return (
    <Box sx={{ margin: 2 }}>
      <Typography variant="h4" gutterBottom>
        {schema.title}
      </Typography>
      {schema.questions.map((q) => (
        <Box key={q.id} mb={2}>
          <TextField
            label={q.label}
            type={q.type}
            fullWidth
            onChange={(e) => handleChange(q.id, e.target.value)}
          />
        </Box>
      ))}
      <Button variant="contained" onClick={handleSubmit}>
        Submit
      </Button>
    </Box>
  );
}

export default PublicForm;
