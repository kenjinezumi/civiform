/**
 * src/components/admin/FormBuilder.tsx
 *
 * The final orchestrator:
 * - Renders pages => unsectioned questions + sections => child questions
 * - No references to missing "questions" top-level or "index={...}" props on <QuestionAccordion>.
 * - Expand/Collapse logic uses sets of string keys.
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import { useHierFormController } from '../../controllers/useHierFormController';
import { QuestionAccordion } from './QuestionAccordion';
import { Question } from '../../types/formTypes';

export default function FormBuilder() {
  const {
    form,
    addPage,
    addSection,
    addUnsectionedQuestion,
    addQuestionToSection,
    saveForm,
    loading,
    error,
  } = useHierFormController();

  // Expand sets for pages, sections, questions
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  // Toggle a page
  function togglePage(pIndex: number) {
    setExpandedPages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pIndex)) newSet.delete(pIndex);
      else newSet.add(pIndex);
      return newSet;
    });
  }

  // Toggle a question by a string key
  function toggleQuestion(key: string) {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  }

  // Toggle a section by "pX-sY" key
  function toggleSection(key: string) {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  }

  // Expand/Collapse all
  function handleExpandCollapseAll() {
    setAllExpanded(!allExpanded);
    if (!allExpanded) {
      // expand everything
      const pSet = new Set<number>();
      const sSet = new Set<string>();
      const qSet = new Set<string>();

      form.pages.forEach((page, pIndex) => {
        pSet.add(pIndex);
        // unsectioned
        page.unsectioned.forEach((_, qIndex) => {
          qSet.add(`p${pIndex}-Uq${qIndex}`);
        });
        // sections
        page.sections.forEach((sec, sIndex) => {
          const secKey = `p${pIndex}-s${sIndex}`;
          sSet.add(secKey);
          sec.questions.forEach((_, qIndex) => {
            qSet.add(`p${pIndex}-s${sIndex}-q${qIndex}`);
          });
        });
      });

      setExpandedPages(pSet);
      setExpandedSections(sSet);
      setExpandedQuestions(qSet);
    } else {
      // collapse all
      setExpandedPages(new Set());
      setExpandedSections(new Set());
      setExpandedQuestions(new Set());
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {loading ? 'Loading...' : 'Hierarchical Form Builder'}
      </Typography>
      {error && <Typography color="error">{error}</Typography>}

      <Typography>Form Title: {form.title}</Typography>
      <Typography sx={{ mb: 2 }}>Form Description: {form.description}</Typography>

      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={addPage} sx={{ mr: 2 }}>
          Add Page
        </Button>
        <Button variant="outlined" onClick={handleExpandCollapseAll}>
          {allExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          {allExpanded ? 'Collapse All' : 'Expand All'}
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {form.pages.map((page, pIndex) => {
        const pageExpanded = expandedPages.has(pIndex);
        return (
          <Accordion
            key={pIndex}
            expanded={pageExpanded}
            onChange={() => togglePage(pIndex)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                Page {pIndex + 1}: {page.title || '(untitled page)'}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Page-level actions */}
              <Button
                onClick={() => addUnsectionedQuestion(pIndex)}
                sx={{ mr: 2 }}
              >
                Add Unsectioned Q
              </Button>
              <Button onClick={() => addSection(pIndex)}>
                Add Section
              </Button>

              <Divider sx={{ my: 2 }} />

              {/* Unsectioned questions */}
              {page.unsectioned.map((question, qIndex) => {
                const qKey = `p${pIndex}-Uq${qIndex}`;
                const numbering = `${pIndex+1}.U.${qIndex+1}`;
                const expandedQ = expandedQuestions.has(qKey);

                return (
                  <QuestionAccordion
                    key={qKey}
                    question={question}
                    numbering={numbering}
                    expanded={expandedQ}
                    onToggle={() => toggleQuestion(qKey)}
                    onUpdate={(upd) => {
                      page.unsectioned[qIndex] = upd; // direct mutation for brevity
                    }}
                    onMoveUp={() => {
                      // e.g. reorder unsectioned question
                    }}
                    onMoveDown={() => {}}
                    onRemove={() => {
                      page.unsectioned.splice(qIndex, 1);
                    }}
                  />
                );
              })}

              <Divider sx={{ my: 2 }} />

              {/* Sections */}
              {page.sections.map((sec, sIndex) => {
                const secKey = `p${pIndex}-s${sIndex}`;
                const secExpanded = expandedSections.has(secKey);
                return (
                  <Accordion
                    key={secKey}
                    expanded={secExpanded}
                    onChange={() => toggleSection(secKey)}
                    sx={{ mb: 2 }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>
                        Page {pIndex+1}, Section {sIndex+1}: {sec.title || '(untitled section)'}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Button
                        variant="outlined"
                        onClick={() => addQuestionToSection(pIndex, sIndex)}
                        sx={{ mb: 2 }}
                      >
                        Add Q in Section
                      </Button>

                      <Divider sx={{ mb: 2 }} />

                      {sec.questions.map((qq, qqIndex) => {
                        const childKey = `p${pIndex}-s${sIndex}-q${qqIndex}`;
                        const numbering = `${pIndex+1}.${sIndex+1}.${qqIndex+1}`;
                        const expandedQQ = expandedQuestions.has(childKey);

                        return (
                          <QuestionAccordion
                            key={childKey}
                            question={qq}
                            numbering={numbering}
                            expanded={expandedQQ}
                            onToggle={() => toggleQuestion(childKey)}
                            onUpdate={(upd) => {
                              sec.questions[qqIndex] = upd;
                            }}
                            onMoveUp={() => {
                              // move question inside section if you want
                            }}
                            onMoveDown={() => {}}
                            onRemove={() => {
                              sec.questions.splice(qqIndex, 1);
                            }}
                          />
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </AccordionDetails>
          </Accordion>
        );
      })}

      <Divider sx={{ my: 3 }} />
      <Button variant="contained" disabled={loading} onClick={saveForm}>
        {loading ? 'Saving...' : 'Save Form'}
      </Button>
    </Box>
  );
}
