/**
 * src/components/admin/PageAccordion.tsx
 *
 * Renders a single Page, with unsectioned questions + multiple sections.
 */
import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Box, IconButton, Divider, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Page, Question, Section } from '../../types/formTypes';
import { QuestionAccordion } from './QuestionAccordion';
import { SectionAccordion } from './SectionAccordion';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';

interface PageAccordionProps {
  page: Page;
  pageIndex: number;
  expanded: boolean;
  onToggle: () => void;

  // Callbacks for page-level reordering or removal
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemovePage: () => void;

  // Add unsectioned question or add section
  onAddUnsectionedQuestion: () => void;
  onAddSection: () => void;

  // For unsectioned questions
  onUpdateUnsectionedQuestion: (qIndex: number, updated: Question) => void;
  onMoveUnsectionedQuestionUp: (qIndex: number) => void;
  onMoveUnsectionedQuestionDown: (qIndex: number) => void;
  onRemoveUnsectionedQuestion: (qIndex: number) => void;

  // For sections
  onMoveSectionUp: (secIndex: number) => void;
  onMoveSectionDown: (secIndex: number) => void;
  onRemoveSection: (secIndex: number) => void;

  // For child questions in a section
  onUpdateSectionQuestion: (
    secIndex: number,
    qIndex: number,
    updated: Question
  ) => void;
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
  onAddUnsectionedQuestion,
  onAddSection,
  onUpdateUnsectionedQuestion,
  onMoveUnsectionedQuestionUp,
  onMoveUnsectionedQuestionDown,
  onRemoveUnsectionedQuestion,
  onMoveSectionUp,
  onMoveSectionDown,
  onRemoveSection,
  onUpdateSectionQuestion,
  onMoveSectionQuestionUp,
  onMoveSectionQuestionDown,
  onRemoveSectionQuestion,
}: PageAccordionProps) {
  const pageNumLabel = (pageIndex + 1).toString();

  return (
    <Accordion expanded={expanded} onChange={onToggle}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          Page {pageNumLabel}: {page.title || '(untitled)'}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {/* Page Title / Desc */}
        <TextField
          label="Page Title"
          value={page.title}
          onChange={(e) => {
            page.title = e.target.value;
          }}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Page Description"
          value={page.description}
          onChange={(e) => {
            page.description = e.target.value;
          }}
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 2 }}
        />

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

        <Divider sx={{ my: 2 }} />

        {/* Unsectioned questions */}
        {page.unsectioned.map((q, qIndex) => {
          // numbering => pageNumLabel + ".U." + (qIndex+1)
          const numbering = `${pageNumLabel}.U.${qIndex + 1}`;
          return (
            <QuestionAccordion
              key={qIndex}
              question={q}
              numbering={numbering}
              expanded={false}
              onToggle={() => { /* handle expansions outside or track locally */ }}
              onUpdate={(upd) => onUpdateUnsectionedQuestion(qIndex, upd)}
              onMoveUp={() => onMoveUnsectionedQuestionUp(qIndex)}
              onMoveDown={() => onMoveUnsectionedQuestionDown(qIndex)}
              onRemove={() => onRemoveUnsectionedQuestion(qIndex)}
            />
          );
        })}

        <Button variant="outlined" onClick={onAddUnsectionedQuestion} sx={{ mr: 2 }}>
          Add Unsectioned Question
        </Button>
        <Button variant="outlined" onClick={onAddSection}>
          Add Section
        </Button>

        <Divider sx={{ my: 2 }} />

        {/* Sections */}
        {page.sections.map((sec, sIndex) => {
          // we can do a SectionAccordion or a simple approach
          const sectionExpanded = false; // track expansions outside if we want
          return (
            <SectionAccordion
              key={sIndex}
              section={sec}
              pageIndex={pageIndex}
              sectionIndex={sIndex}
              expanded={sectionExpanded}
              onToggle={() => {
                // handle outside
              }}
              onMoveUp={() => onMoveSectionUp(sIndex)}
              onMoveDown={() => onMoveSectionDown(sIndex)}
              onRemove={() => onRemoveSection(sIndex)}
              onUpdateQuestion={(qIndex, updated) =>
                onUpdateSectionQuestion(sIndex, qIndex, updated)
              }
              onMoveQuestionUp={(qIndex) => onMoveSectionQuestionUp(sIndex, qIndex)}
              onMoveQuestionDown={(qIndex) => onMoveSectionQuestionDown(sIndex, qIndex)}
              onRemoveQuestion={(qIndex) => onRemoveSectionQuestion(sIndex, qIndex)}
            />
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
}
