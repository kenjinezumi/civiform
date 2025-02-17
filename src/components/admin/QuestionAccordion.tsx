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
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import { Question, AdvancedQuestionType, SkipLogicCondition } from '../../types/formTypes';
import { SkipLogicFields } from './SkipLogicFields';

interface QuestionAccordionProps {
  question: Question;
  index: number;
  expanded: boolean; // is this question's accordion expanded
  onToggle: () => void; // toggles expansion
  onUpdate: (q: Question) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export function QuestionAccordion({
  question,
  index,
  expanded,
  onToggle,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onRemove,
}: QuestionAccordionProps) {
  // default skip logic if undefined
  const skip: SkipLogicCondition = question.skipLogic || {
    referenceQuestionIndex: 0,
    operator: '==',
    value: '',
    action: 'show',
  };

  return (
    <Accordion expanded={expanded} onChange={onToggle} sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          Q{index + 1} - {question.label || '(untitled)'}
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

        <TextField
          type="number"
          label="Which page?"
          value={question.pageNumber ?? 1}
          onChange={(e) => {
            const pg = parseInt(e.target.value || '1', 10);
            onUpdate({ ...question, pageNumber: pg });
          }}
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
                type: e.target.value as AdvancedQuestionType,
              })
            }
          >
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="radio">Radio</MenuItem>
            <MenuItem value="checkbox">Checkbox</MenuItem>
            <MenuItem value="select">Dropdown</MenuItem>
            <MenuItem value="rating">Rating (1-5)</MenuItem>
            {/* etc... */}
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

        {/* Skip Logic */}
        <Typography variant="subtitle2" gutterBottom>
          Skip Logic
        </Typography>
        <SkipLogicFields
          skip={skip}
          onChange={(updated) => onUpdate({ ...question, skipLogic: updated })}
        />

        <Divider sx={{ my: 2 }} />

        {/* Move / Remove question */}
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
