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

import { Question, SkipLogicCondition, AdvancedQuestionType } from '../../types/formTypes';
import { SkipLogicFields } from './SkipLogicFields';

interface QuestionAccordionProps {
  /** The question data we are editing. */
  question: Question;
  /** A string like "2.1.3" to show the question number. */
  numbering: string;
  /** Whether this accordion is expanded (controlled by parent). */
  expanded: boolean;
  /**
   * Called when the user clicks on the accordion header,
   * so the parent can toggle the open/closed state.
   */
  onToggle: () => void;

  /** Called when user changes question fields. */
  onUpdate: (updated: Question) => void;
  /** Move question up in parent's array. */
  onMoveUp: () => void;
  /** Move question down in parent's array. */
  onMoveDown: () => void;
  /** Remove question from parent's array. */
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
  // Provide a default skip logic if the question has none
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
                // Disallow 'section' if you like
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
            <MenuItem value="rating">Rating</MenuItem>
            {/* etc... */}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Checkbox
              checked={question.required}
              onChange={(e) => onUpdate({ ...question, required: e.target.checked })}
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
