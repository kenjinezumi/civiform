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
import { ChoicesEditor } from './ChoicesEditor';

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
  // If skipLogic is missing, provide default
  const skip: SkipLogicCondition = question.skipLogic ?? {
    referenceQuestionIndex: 0,
    operator: '==',
    value: '',
    action: 'show',
  };

  return (
    <Accordion expanded={expanded} onChange={onToggle} sx={{ mb: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          {numbering} - {question.label || '(untitled)'}
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        {/* Label */}
        <TextField
          label="Question Label"
          value={question.label}
          onChange={(e) => onUpdate({ ...question, label: e.target.value })}
          fullWidth
          sx={{ mb: 2 }}
        />

        {/* Type */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Question Type</InputLabel>
          <Select
            label="Question Type"
            value={question.type}
            onChange={(e) =>
              onUpdate({
                ...question,
                type: e.target.value as AdvancedQuestionType,
              })
            }
          >
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="radio">Radio</MenuItem>
            <MenuItem value="checkbox">Checkbox</MenuItem>
            <MenuItem value="select">Dropdown</MenuItem>
            <MenuItem value="rating">Rating</MenuItem>
          </Select>
        </FormControl>

        {/* Required Checkbox */}
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

        {/* Additional Fields for skip logic or rating or choices */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Skip Logic
        </Typography>
        <SkipLogicFields
          skip={skip}
          onChange={(updatedSkip) => onUpdate({ ...question, skipLogic: updatedSkip })}
        />

        {/* If question.type is 'radio', 'checkbox', 'select', or 'rating', we show extra UI */}
        <ChoicesEditor
          question={question}
          onUpdate={(updQ) => onUpdate(updQ)}
        />

        <Divider sx={{ my: 2 }} />

        {/* Reorder / remove */}
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
