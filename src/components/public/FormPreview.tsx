// src/components/public/FormPreview.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
  Divider,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Slider,
  TextField,
} from '@mui/material';
import { FormSchema, Question } from '../../types/formTypes';

interface AnswersMap {
  [qId: string]: string | string[];
}

export default function FormPreview() {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For wizard
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Answers in memory + localStorage
  const [answers, setAnswers] = useState<AnswersMap>({});

  // 1) Fetch
  useEffect(() => {
    if (!formId) return;
    setLoading(true);
    setError(null);

    axios
      .get(`http://127.0.0.1:8000/forms/${formId}`)
      .then((res) => {
        setForm(res.data);

        // Load from local storage
        const saved = localStorage.getItem(`civiformAnswers_${formId}`);
        if (saved) {
          try {
            setAnswers(JSON.parse(saved));
          } catch {
            // ignore
          }
        }
      })
      .catch((err) => {
        setError(err.response?.data?.detail || err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [formId]);

  // 2) Save to local storage
  function storeAnswersLocally(updated: AnswersMap) {
    setAnswers(updated);
    if (formId) {
      localStorage.setItem(`civiformAnswers_${formId}`, JSON.stringify(updated));
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <CircularProgress />
        <Typography>Loading form preview ID {formId}...</Typography>
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }
  if (!form) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No form data loaded.</Typography>
      </Box>
    );
  }

  // Flatten questions to measure completion
  const pages = form.pages || [];
  const questionIds: string[] = [];
  pages.forEach((p) => {
    p.unsectioned.forEach((q) => {
      if (q.id != null) questionIds.push(String(q.id));
    });
    p.sections.forEach((sec) => {
      sec.questions.forEach((q) => {
        if (q.id != null) questionIds.push(String(q.id));
      });
    });
  });
  const totalQuestions = questionIds.length;
  const answeredCount = questionIds.filter((qid) => {
    const ans = answers[qid];
    if (Array.isArray(ans)) return ans.length > 0;
    return ans && ans.trim().length > 0;
  }).length;

  const percentComplete =
    totalQuestions === 0 ? 0 : Math.round((answeredCount / totalQuestions) * 100);

  // Current page
  const currentPage = pages[currentPageIndex];

  function handleChange(qId: string, val: string | string[]) {
    const updated = { ...answers, [qId]: val };
    storeAnswersLocally(updated);
  }

  function handleNext() {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  }
  function handlePrev() {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  }
  function handleSaveDraft() {
    storeAnswersLocally(answers);
    alert('Draft saved.');
  }
  function handleConfirmSend() {
    alert(`All done. You answered ${answeredCount}/${totalQuestions} questions!`);
  }

  // Render question input
  function renderQuestion(q: Question) {
    const qId = String(q.id ?? 'temp');
    const val = answers[qId] || (q.type === 'checkbox' ? [] : '');
    switch (q.type) {
      case 'radio':
        return (
          <FormControl>
            <FormLabel>{q.label}</FormLabel>
            <RadioGroup
              value={val}
              onChange={(e) => handleChange(qId, e.target.value)}
            >
              {q.choices.map((choice, i) => (
                <FormControlLabel
                  key={i}
                  value={choice}
                  control={<Radio />}
                  label={choice}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      case 'checkbox':
        const arrVal = Array.isArray(val) ? val : [];
        return (
          <Box>
            <Typography>{q.label}</Typography>
            {q.choices.map((choice, i) => {
              const checked = arrVal.includes(choice);
              return (
                <FormControlLabel
                  key={i}
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={() => {
                        let newArr = [...arrVal];
                        if (checked) {
                          newArr = newArr.filter((c) => c !== choice);
                        } else {
                          newArr.push(choice);
                        }
                        handleChange(qId, newArr);
                      }}
                    />
                  }
                  label={choice}
                />
              );
            })}
          </Box>
        );
      case 'rating':
        const min = q.ratingMin ?? 1;
        const max = q.ratingMax ?? 5;
        const numericVal = Number(val || min);
        return (
          <Box sx={{ width: 200 }}>
            <Typography>{q.label}</Typography>
            <Slider
              min={min}
              max={max}
              value={numericVal}
              onChange={(e, newVal) => handleChange(qId, String(newVal))}
              valueLabelDisplay="auto"
            />
          </Box>
        );
      case 'text':
      default:
        return (
          <TextField
            label={q.label}
            placeholder={q.placeholder}
            fullWidth
            multiline
            value={val}
            onChange={(e) => handleChange(qId, e.target.value)}
          />
        );
    }
  }

  if (!currentPage) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No page at index {currentPageIndex}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {form.title || 'Form Preview'}
      </Typography>
      <Typography sx={{ mb: 3 }}>{form.description}</Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <LinearProgress variant="determinate" value={percentComplete} />
        </Box>
        <Typography>{percentComplete}%</Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="h5" sx={{ mb: 1 }}>
        Page {currentPageIndex + 1}: {currentPage.title}
      </Typography>
      <Box dangerouslySetInnerHTML={{ __html: currentPage.description }} sx={{ mb: 2 }} />

      {/* unsectioned */}
      {currentPage.unsectioned.map((q, idx) => (
        <Box key={q.id ?? idx} sx={{ mb: 2 }}>
          {renderQuestion(q)}
        </Box>
      ))}

      <Divider sx={{ my: 2 }} />

      {/* sections */}
      {currentPage.sections.map((sec, sIdx) => (
        <Box key={sec.id ?? sIdx} sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {sec.title}
          </Typography>
          {sec.questions.map((q, qIdx) => (
            <Box key={q.id ?? qIdx} sx={{ mb: 2 }}>
              {renderQuestion(q)}
            </Box>
          ))}
        </Box>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handlePrev} disabled={currentPageIndex === 0}>
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentPageIndex === pages.length - 1}
        >
          Next
        </Button>
      </Box>

      {currentPageIndex === pages.length - 1 && (
        <Box sx={{ mt: 4 }}>
          <Button onClick={handleSaveDraft} sx={{ mr: 2 }}>
            Save as Draft
          </Button>
          <Button variant="contained" onClick={handleConfirmSend}>
            Confirm / Send
          </Button>
        </Box>
      )}
    </Box>
  );
}
