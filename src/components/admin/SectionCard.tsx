/**
 * src/components/admin/SectionCard.tsx
 */

import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  IconButton,
  Box,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import { SectionGroup } from '../../utils/groupQuestionsBySection';
import { QuestionAccordion } from './QuestionAccordion';
import { Question } from '../../types/formTypes';

interface SectionCardProps {
  group: SectionGroup;
  expandedSections: Set<number>;
  expandedQuestions: Set<number>;
  onToggleSection: (sectionIndex: number) => void;
  onToggleQuestion: (qIndex: number) => void;

  // callbacks from your controller
  updateQuestion: (index: number, q: Question) => void;
  moveQuestion: (fromIndex: number, toIndex: number) => void;
  removeQuestion: (index: number) => void;

  // if user wants to add question after a group
  onAddQuestionHere: () => void;
}

export function SectionCard({
  group,
  expandedSections,
  expandedQuestions,
  onToggleSection,
  onToggleQuestion,
  updateQuestion,
  moveQuestion,
  removeQuestion,
  onAddQuestionHere,
}: SectionCardProps) {
  const { sectionIndex, sectionQuestion, items } = group;
  const groupTitle = sectionQuestion
    ? `Section: ${sectionQuestion.label || '(untitled)'}`
    : 'Unsectioned Questions';

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardHeader
        title={groupTitle}
        action={
          <Box>
            <Divider orientation="vertical" flexItem sx={{ mr: 1 }} />
            <Typography
              variant="button"
              onClick={onAddQuestionHere}
              sx={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              Add Question Here
            </Typography>
          </Box>
        }
      />
      <CardContent>
        {/* If there's a real section => collapsible accordion */}
        {sectionQuestion && (
          <Accordion
            expanded={expandedSections.has(sectionIndex!)}
            onChange={() => sectionIndex !== null && onToggleSection(sectionIndex)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Section Advanced Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                label="Section Label"
                value={sectionQuestion.label}
                onChange={(e) =>
                  updateQuestion(sectionIndex!, {
                    ...sectionQuestion,
                    label: e.target.value,
                  })
                }
                fullWidth
                sx={{ mb: 2 }}
              />

              {/* Which page? */}
              <TextField
                type="number"
                label="Which page?"
                value={sectionQuestion.pageNumber ?? 1}
                onChange={(e) => {
                  const pg = parseInt(e.target.value || '1', 10);
                  updateQuestion(sectionIndex!, {
                    ...sectionQuestion,
                    pageNumber: pg,
                  });
                }}
                fullWidth
                sx={{ mb: 2 }}
              />

              {/* Move / Remove section */}
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <IconButton
                  onClick={() => moveQuestion(sectionIndex!, sectionIndex! - 1)}
                >
                  <ArrowUpwardIcon />
                </IconButton>
                <IconButton
                  onClick={() => moveQuestion(sectionIndex!, sectionIndex! + 1)}
                >
                  <ArrowDownwardIcon />
                </IconButton>
                <IconButton onClick={() => removeQuestion(sectionIndex!)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Child questions in this group */}
        {items.map(({ question, index }) => (
          <QuestionAccordion
            key={index}
            question={question}
            index={index}
            expanded={expandedQuestions.has(index)}
            onToggle={() => onToggleQuestion(index)}
            onUpdate={(q) => updateQuestion(index, q)}
            onMoveUp={() => moveQuestion(index, index - 1)}
            onMoveDown={() => moveQuestion(index, index + 1)}
            onRemove={() => removeQuestion(index)}
          />
        ))}
      </CardContent>
    </Card>
  );
}
