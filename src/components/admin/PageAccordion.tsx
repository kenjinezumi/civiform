/**
 * src/components/admin/PageAccordion.tsx
 *
 * Renders one Page, including unsectioned questions + sections, reorder logic, etc.
 * Typically used by a higher-level FormBuilder or PagesList component.
 */
import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Box,
  IconButton,
  Divider,
  Button,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';

import { Page, Question } from '../../types/formTypes';
import { QuestionAccordion } from './QuestionAccordion';
import { SectionAccordion } from './SectionAccordion';

interface PageAccordionProps {
  page: Page;
  pageIndex: number;
  expanded: boolean;
  onToggle: () => void;

  // reorder or remove this entire page
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemovePage: () => void;

  // update page title / description immutably
  onUpdateTitle: (pageIndex: number, newTitle: string) => void;
  onUpdateDescription: (pageIndex: number, newDesc: string) => void;

  // add unsectioned question or add section
  onAddUnsectionedQuestion: () => void;
  onAddSection: () => void;

  // reorder / remove unsectioned questions
  onUpdateUnsectionedQuestion: (qIndex: number, updated: Question) => void;
  onMoveUnsectionedQuestionUp: (qIndex: number) => void;
  onMoveUnsectionedQuestionDown: (qIndex: number) => void;
  onRemoveUnsectionedQuestion: (qIndex: number) => void;

  // reorder / remove sections
  onMoveSectionUp: (secIndex: number) => void;
  onMoveSectionDown: (secIndex: number) => void;
  onRemoveSection: (secIndex: number) => void;

  // for child questions in each section
  onAddQuestionToSection: (secIndex: number) => void;
  onUpdateSectionQuestion: (secIndex: number, qIndex: number, updated: Question) => void;
  onMoveSectionQuestionUp: (secIndex: number, qIndex: number) => void;
  onMoveSectionQuestionDown: (secIndex: number, qIndex: number) => void;
  onRemoveSectionQuestion: (secIndex: number, qIndex: number) => void;
}

export function PageAccordion({
  page,
  pageIndex,
  expanded,
  onToggle,
  onMoveUp,
  onMoveDown,
  onRemovePage,
  onUpdateTitle,
  onUpdateDescription,
  onAddUnsectionedQuestion,
  onAddSection,
  onUpdateUnsectionedQuestion,
  onMoveUnsectionedQuestionUp,
  onMoveUnsectionedQuestionDown,
  onRemoveUnsectionedQuestion,
  onMoveSectionUp,
  onMoveSectionDown,
  onRemoveSection,
  onAddQuestionToSection,
  onUpdateSectionQuestion,
  onMoveSectionQuestionUp,
  onMoveSectionQuestionDown,
  onRemoveSectionQuestion,
}: PageAccordionProps) {
  const pageLabel = pageIndex + 1;

  return (
    <Accordion expanded={expanded} onChange={onToggle}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          Page {pageLabel}: {page.title || '(untitled page)'}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TextField
          label="Page Title"
          value={page.title}
          onChange={(e) => onUpdateTitle(pageIndex, e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Page Description"
          value={page.description}
          onChange={(e) => onUpdateDescription(pageIndex, e.target.value)}
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 2 }}
        />

        {/* reorder / remove entire page */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <IconButton onClick={onMoveUp}>
            <ArrowUpwardIcon />
          </IconButton>
          <IconButton onClick={onMoveDown}>
            <ArrowDownwardIcon />
          </IconButton>
          <IconButton onClick={onRemovePage}>
            <DeleteIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Render unsectioned questions */}
        {page.unsectioned.map((q, qIndex) => {
          const numbering = `${pageLabel}.U.${qIndex + 1}`;
          return (
            <QuestionAccordion
              key={qIndex}
              question={q}
              numbering={numbering}
              expanded={false}
              onToggle={() => {}}
              onUpdate={(updatedQ) => onUpdateUnsectionedQuestion(qIndex, updatedQ)}
              onMoveUp={() => onMoveUnsectionedQuestionUp(qIndex)}
              onMoveDown={() => onMoveUnsectionedQuestionDown(qIndex)}
              onRemove={() => onRemoveUnsectionedQuestion(qIndex)}
            />
          );
        })}

        <Button variant="outlined" onClick={onAddUnsectionedQuestion} sx={{ mr: 2 }}>
          Add Unsectioned Q
        </Button>
        <Button variant="outlined" onClick={onAddSection}>
          Add Section
        </Button>

        <Divider sx={{ my: 2 }} />

        {/* Render sections */}
        {page.sections.map((section, sIndex) => {
          const secNumber = sIndex + 1;
          return (
            <SectionAccordion
              key={sIndex}
              section={section}
              pageIndex={pageIndex}
              sectionIndex={sIndex}
              expanded={false}
              onToggle={() => {}}

              // reorder / remove the entire section
              onMoveUp={() => onMoveSectionUp(sIndex)}
              onMoveDown={() => onMoveSectionDown(sIndex)}
              onRemove={() => onRemoveSection(sIndex)}

              // add question in this section
              onAddQuestion={() => onAddQuestionToSection(sIndex)}

              // reorder / remove child questions
              onMoveQuestionUp={(qIndex) => onMoveSectionQuestionUp(sIndex, qIndex)}
              onMoveQuestionDown={(qIndex) => onMoveSectionQuestionDown(sIndex, qIndex)}
              onRemoveQuestion={(qIndex) => onRemoveSectionQuestion(sIndex, qIndex)}
              onUpdateQuestion={(qIndex, updatedQ) => onUpdateSectionQuestion(sIndex, qIndex, updatedQ)}
              expandedQuestions={new Set()}
              toggleQuestion={() => {}}
            />
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
}
