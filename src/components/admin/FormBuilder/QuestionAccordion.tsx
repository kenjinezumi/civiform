/**
 * src/components/admin/FormBuilder/QuestionAccordion.tsx
 *
 * Renders a single question, including skip-logic editing.
 */

import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  FormControlLabel,
  Checkbox,
  IconButton,
  Divider,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';

import { Question, SkipLogicCondition, AdvancedQuestionType } from '../../../types/formTypes';
import { SkipLogicFields } from './SkipLogicFields';

interface QuestionAccordionProps {
  question: Question;
  numbering: string;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (updated: Question) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export function QuestionAccordion({
  question,
  numbering,
  expanded,
  onToggle,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onRemove,
}: QuestionAccordionProps) {
  // If skipLogic is null, we provide a default object
  const skip: SkipLogicCondition = question.skipLogic ?? {
    referenceQuestionIndex: 0,
    operator: '==',
    value: '',
    action: 'show',
  };

  // Handler to push updated skip logic to the parent
  const handleSkipChange = (updatedSkip: SkipLogicCondition) => {
    onUpdate({
      ...question,
      skipLogic: updatedSkip,
    });
  };

  return (
    <Accordion expanded={expanded} onChange={onToggle} sx={{ mb: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          {numbering} - {question.label || '(untitled)'}
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        {/* Basic question fields */}
        <TextField
          label="Question Label"
          value={question.label}
          onChange={(e) => onUpdate({ ...question, label: e.target.value })}
          fullWidth
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Question Type</InputLabel>
          <Select
            label="Question Type"
            value={question.type}
            onChange={(e) => onUpdate({
              ...question,
              // If the user picks 'section', override to 'text' or disallow
              type: e.target.value === 'section' ? 'text' : (e.target.value as AdvancedQuestionType),
            })}
          >
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="radio">Radio</MenuItem>
            <MenuItem value="checkbox">Checkbox</MenuItem>
            <MenuItem value="select">Dropdown</MenuItem>
            <MenuItem value="rating">Rating</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Checkbox
              checked={question.required}
              onChange={(e) =>
                onUpdate({ ...question, required: e.target.checked })
              }
            />
          }
          label="Required?"
        />

        <Divider sx={{ my: 2 }} />

        {/* Skip Logic Section */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Skip Logic
        </Typography>
        <SkipLogicFields skip={skip} onChange={handleSkipChange} />

        <Divider sx={{ my: 2 }} />

        {/* Reorder / Remove Buttons */}
        <IconButton onClick={onMoveUp} sx={{ mr: 1 }}>
          <ArrowUpwardIcon />
        </IconButton>
        <IconButton onClick={onMoveDown} sx={{ mr: 1 }}>
          <ArrowDownwardIcon />
        </IconButton>
        <IconButton onClick={onRemove}>
          <DeleteIcon />
        </IconButton>
      </AccordionDetails>
    </Accordion>
  );
}
