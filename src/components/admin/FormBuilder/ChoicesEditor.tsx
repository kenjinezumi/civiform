/**
 * src/components/admin/FormBuilder/ChoicesEditor.tsx
 *
 * Allows the user to edit:
 *  - `question.choices` (string array) if type is 'radio' / 'checkbox' / 'select'
 *    * BUT we limit radio to 2 max choices
 *  - `ratingMin` / `ratingMax` if type = 'rating'
 */

import React from 'react';
import { Box, TextField, IconButton, Typography, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Question } from '../../../types/formTypes';

interface ChoicesEditorProps {
  question: Question;
  onUpdate: (updatedQ: Question) => void;
}

export function ChoicesEditor({ question, onUpdate }: ChoicesEditorProps) {
  // Identify question type
  const isMultipleChoice = ['radio', 'checkbox', 'select'].includes(question.type);
  const isRating = question.type === 'rating';

  // If it's a radio question => limit to 2 choices max
  const maxChoices = question.type === 'radio' ? 2 : 9999;
  const canAddChoice = question.choices.length < maxChoices;

  // Handlers for multiple-choice
  const handleAddChoice = () => {
    if (!canAddChoice) return;
    const newChoices = [...question.choices, ''];
    onUpdate({ ...question, choices: newChoices });
  };

  const handleRemoveChoice = (index: number) => {
    const newChoices = [...question.choices];
    newChoices.splice(index, 1);
    onUpdate({ ...question, choices: newChoices });
  };

  const handleChoiceChange = (index: number, newValue: string) => {
    const newChoices = [...question.choices];
    newChoices[index] = newValue;
    onUpdate({ ...question, choices: newChoices });
  };

  // Handlers for rating
  const handleRatingMin = (val: string) => {
    onUpdate({ ...question, ratingMin: parseInt(val, 10) || 0 });
  };
  const handleRatingMax = (val: string) => {
    onUpdate({ ...question, ratingMax: parseInt(val, 10) || 5 });
  };

  return (
    <Box sx={{ mt: 2 }}>
      {isMultipleChoice && (
        <>
          <Typography variant="subtitle2">Choices</Typography>
          {question.choices.map((choiceVal, idx) => (
            <Box
              key={idx}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
            >
              <TextField
                label={`Choice #${idx + 1}`}
                value={choiceVal}
                onChange={(e) => handleChoiceChange(idx, e.target.value)}
                size="small"
              />
              <IconButton
                onClick={() => handleRemoveChoice(idx)}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          {/* Add Choice button => disabled if at max */}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddChoice}
            sx={{ mt: 1 }}
            disabled={!canAddChoice}
          >
            Add Choice
          </Button>
          {question.type === 'radio' && question.choices.length >= 2 && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              (Radio limited to 2 choices)
            </Typography>
          )}
        </>
      )}

      {isRating && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Rating Range</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
            <TextField
              label="Min"
              type="number"
              size="small"
              value={question.ratingMin ?? 0}
              onChange={(e) => handleRatingMin(e.target.value)}
              sx={{ width: 80 }}
            />
            <TextField
              label="Max"
              type="number"
              size="small"
              value={question.ratingMax ?? 5}
              onChange={(e) => handleRatingMax(e.target.value)}
              sx={{ width: 80 }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
