/**
 * src/components/admin/SectionAccordion.tsx
 *
 * Renders a single section & its questions, each question is a <QuestionAccordion>.
 */
import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, IconButton, Box, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import { Section, Question } from '../../types/formTypes';
import { QuestionAccordion } from './QuestionAccordion';

interface Props {
  section: Section;
  pageIndex: number;
  sectionIndex: number;
  expanded: boolean;
  onToggle: () => void;

  // callbacks for move / remove the entire section
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;

  // moving or updating child questions
  onUpdateQuestion: (qIndex: number, updated: Question) => void;
  onMoveQuestionUp: (qIndex: number) => void;
  onMoveQuestionDown: (qIndex: number) => void;
  onRemoveQuestion: (qIndex: number) => void;

  // For numbering
  // If this is section #1 on page #2 => "2.1" for the section
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
  onUpdateQuestion,
  onMoveQuestionUp,
  onMoveQuestionDown,
  onRemoveQuestion,
}: Props) {
  const sectionNumLabel = `${pageIndex + 1}.${sectionIndex + 1}`;

  return (
    <Accordion expanded={expanded} onChange={onToggle} sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          {sectionNumLabel} - {section.title || '(untitled section)'}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {/* Title field for the section */}
        <TextField
          label="Section Title"
          value={section.title}
          onChange={(e) => {
            section.title = e.target.value; // or handle immutably from the parent
          }}
          fullWidth
          sx={{ mb: 2 }}
        />

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

        <Divider sx={{ my: 2 }} />

        {/* Child questions */}
        {section.questions.map((question, qIndex) => {
          const numbering = `${sectionNumLabel}.${qIndex + 1}`;
          return (
            <QuestionAccordion
              key={qIndex}
              question={question}
              numbering={numbering}
              expanded={false} // or track expansions at a higher level
              onToggle={() => { /* handle expansions at higher level */ }}
              onUpdate={(updated) => onUpdateQuestion(qIndex, updated)}
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
