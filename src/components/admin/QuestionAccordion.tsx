/**
 * src/components/admin/QuestionAccordion.tsx
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
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';

import { Question, SkipLogicCondition, AdvancedQuestionType } from '../../types/formTypes';
import { SkipLogicFields } from './SkipLogicFields';

interface QuestionAccordionProps {
  question: Question;
  numbering: string; // e.g. "1.U.2" or "1.2.3"
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
  onRemove
}: QuestionAccordionProps) {
  // Provide a default skipLogic if none
  const skip: SkipLogicCondition = question.skipLogic ?? {
    referenceQuestionIndex: 0,
    operator: '==',
    value: '',
    action: 'show',
  };

  return (
    <Accordion expanded={expanded} onChange={onToggle}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          {numbering} - {question.label || '(untitled)'}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {/* Basic fields */}
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
            onChange={(e) =>
              onUpdate({
                ...question,
                // Disallow 'section' if needed
                type: e.target.value === 'section'
                  ? 'text'
                  : (e.target.value as AdvancedQuestionType),
              })
            }
          >
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="radio">Radio</MenuItem>
            <MenuItem value="checkbox">Checkbox</MenuItem>
            <MenuItem value="select">Dropdown</MenuItem>
            <MenuItem value="rating">Rating (1-5)</MenuItem>
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

        <Typography variant="subtitle2">Skip Logic</Typography>
        <SkipLogicFields
          skip={skip}
          onChange={(updatedSkip) => onUpdate({ ...question, skipLogic: updatedSkip })}
        />

        <Divider sx={{ my: 2 }} />

        <IconButton onClick={onMoveUp}>
          <ArrowUpwardIcon />
        </IconButton>
        <IconButton onClick={onMoveDown}>
          <ArrowDownwardIcon />
        </IconButton>
        <IconButton onClick={onRemove}>
          <DeleteIcon />
        </IconButton>
      </AccordionDetails>
    </Accordion>
  );
}
