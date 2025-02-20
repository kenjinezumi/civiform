/**
 * src/components/admin/SectionAccordion.tsx
 */
import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  IconButton,
  Box,
  Button,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';

import { Section, Question } from '../../../types/formTypes';
import { QuestionAccordion } from './QuestionAccordion';

interface SectionAccordionProps {
  /** Which section object to display. */
  section: Section;
  /** For numbering, like page 1, section 2 => "1.2". */
  pageIndex: number;
  sectionIndex: number;
  /** Whether this accordion is expanded (controlled by parent). */
  expanded: boolean;
  /**
   * Called when user clicks the accordion header,
   * so parent can toggle expansion state.
   */
  onToggle: () => void;

  // Reorder / remove the entire section
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;

  // Add a question inside this section
  onAddQuestion: () => void;

  // For reordering / removing child questions
  onMoveQuestionUp: (qIndex: number) => void;
  onMoveQuestionDown: (qIndex: number) => void;
  onRemoveQuestion: (qIndex: number) => void;
  onUpdateQuestion: (qIndex: number, updated: Question) => void;

  // Optional callback to immutably set the section title
  onUpdateTitle?: (newTitle: string) => void;

  // *** ADDED for expand/collapse each question
  expandedQuestions: Set<string>;
  toggleQuestion: (qKey: string) => void;
}

export function SectionAccordion({
  section,
  pageIndex,
  sectionIndex,
  expanded,
  onToggle,
  onMoveUp,
  onMoveDown,
  onRemove,
  onAddQuestion,
  onMoveQuestionUp,
  onMoveQuestionDown,
  onRemoveQuestion,
  onUpdateQuestion,
  onUpdateTitle,
  expandedQuestions,
  toggleQuestion,
}: SectionAccordionProps) {
  const sectionNum = `${pageIndex + 1}.${sectionIndex + 1}`;

  return (
    <Accordion expanded={expanded} onChange={onToggle} sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          Section {sectionNum}: {section.title || '(untitled)'}
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        <TextField
          label="Section Title"
          value={section.title}
          onChange={(e) => {
            if (onUpdateTitle) {
              // Immutably update in parent
              onUpdateTitle(e.target.value);
            } else {
              // Direct fallback (not recommended, but just in case)
              section.title = e.target.value;
            }
          }}
          fullWidth
          sx={{ mb: 2 }}
        />

        {/* Section-level reorder/delete controls */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <IconButton onClick={onMoveUp}>
            <ArrowUpwardIcon />
          </IconButton>
          <IconButton onClick={onMoveDown}>
            <ArrowDownwardIcon />
          </IconButton>
          <IconButton onClick={onRemove}>
            <DeleteIcon />
          </IconButton>
        </Box>

        {/* Add question to this section */}
        <Button variant="outlined" onClick={onAddQuestion} sx={{ mb: 2 }}>
          Add Q in Section
        </Button>

        <Divider sx={{ my: 2 }} />

        {/* Render each question */}
        {section.questions.map((question, qIndex) => {
          const numbering = `${sectionNum}.${qIndex + 1}`;

          // Make a unique key that matches how we do unsectioned questions
          const qKey = `p${pageIndex}-s${sectionIndex}-q${qIndex}`;
          const isExpanded = expandedQuestions.has(qKey);

          return (
            <QuestionAccordion
              key={qKey}
              question={question}
              numbering={numbering}
              expanded={isExpanded}
              onToggle={() => toggleQuestion(qKey)}
              onUpdate={(upd) => onUpdateQuestion(qIndex, upd)}
              onMoveUp={() => onMoveQuestionUp(qIndex)}
              onMoveDown={() => onMoveQuestionDown(qIndex)}
              onRemove={() => onRemoveQuestion(qIndex)}
            />
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
}
