/**
 * src/components/admin/FormBuilder.tsx
 */
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';

import { useHierFormController } from '../../controllers/useHierFormController';
import { TipTapEditor } from './TipTapEditor';
import { QuestionAccordion } from './QuestionAccordion';
import { SectionAccordion } from './SectionAccordion';
import { FormSchema, Question } from '../../types/formTypes';

/** Helper to swap array items */
function swap<T>(arr: T[], i: number, j: number) {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

export default function FormBuilder() {
  const {
    form,
    setForm,
    loading,
    error,
    addPage,
    addSection,
    addUnsectionedQuestion,
    addQuestionToSection,
    saveForm,
  } = useHierFormController();

  // Track expansions
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  // ------------------ REORDER PAGES ------------------ //
  function removePage(pageIndex: number) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      newPages.splice(pageIndex, 1);
      return { ...prev, pages: newPages };
    });
  }

  function movePageUp(pageIndex: number) {
    if (pageIndex <= 0) return;
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      swap(newPages, pageIndex, pageIndex - 1);
      return { ...prev, pages: newPages };
    });
  }
  function movePageDown(pageIndex: number) {
    if (pageIndex >= form.pages.length - 1) return;
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      swap(newPages, pageIndex, pageIndex + 1);
      return { ...prev, pages: newPages };
    });
  }

  // ------------------ REORDER Unsectioned Questions ------------------ //
  function moveUnsectionedQuestionUp(pageIndex: number, qIndex: number) {
    if (qIndex <= 0) return;
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const unsecCopy = [...pageCopy.unsectioned];
      swap(unsecCopy, qIndex, qIndex - 1);
      pageCopy.unsectioned = unsecCopy;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  function moveUnsectionedQuestionDown(pageIndex: number, qIndex: number) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const unsecCopy = [...pageCopy.unsectioned];
      if (qIndex >= unsecCopy.length - 1) return prev;
      swap(unsecCopy, qIndex, qIndex + 1);
      pageCopy.unsectioned = unsecCopy;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  // ------------------ REORDER Sections ------------------ //
  function moveSectionUp(pageIndex: number, sectionIndex: number) {
    if (sectionIndex <= 0) return;
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const secCopy = [...pageCopy.sections];
      swap(secCopy, sectionIndex, sectionIndex - 1);
      pageCopy.sections = secCopy;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  function moveSectionDown(pageIndex: number, sectionIndex: number) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const secCopy = [...pageCopy.sections];
      if (sectionIndex >= secCopy.length - 1) return prev;
      swap(secCopy, sectionIndex, sectionIndex + 1);
      pageCopy.sections = secCopy;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  // ------------------ REORDER Section Questions ------------------ //
  function moveSectionQuestionUp(pageIndex: number, sectionIndex: number, qIndex: number) {
    if (qIndex <= 0) return;
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const secCopy = [...pageCopy.sections];
      const secObj = { ...secCopy[sectionIndex] };
      const qArr = [...secObj.questions];
      swap(qArr, qIndex, qIndex - 1);
      secObj.questions = qArr;
      secCopy[sectionIndex] = secObj;
      pageCopy.sections = secCopy;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  function moveSectionQuestionDown(pageIndex: number, sectionIndex: number, qIndex: number) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const secCopy = [...pageCopy.sections];
      const secObj = { ...secCopy[sectionIndex] };
      const qArr = [...secObj.questions];
      if (qIndex >= qArr.length - 1) return prev;
      swap(qArr, qIndex, qIndex + 1);
      secObj.questions = qArr;
      secCopy[sectionIndex] = secObj;
      pageCopy.sections = secCopy;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  // ------------------ UPDATE / REMOVE Items ------------------ //

  function removeUnsectionedQuestion(pageIndex: number, qIndex: number) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const unsecCopy = [...pageCopy.unsectioned];
      unsecCopy.splice(qIndex, 1);
      pageCopy.unsectioned = unsecCopy;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  function removeSection(pageIndex: number, sectionIndex: number) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const secCopy = [...pageCopy.sections];
      secCopy.splice(sectionIndex, 1);
      pageCopy.sections = secCopy;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  function removeSectionQuestion(pageIndex: number, sectionIndex: number, qIndex: number) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const secCopy = [...pageCopy.sections];
      const secObj = { ...secCopy[sectionIndex] };
      const qArr = [...secObj.questions];
      qArr.splice(qIndex, 1);
      secObj.questions = qArr;
      secCopy[sectionIndex] = secObj;
      pageCopy.sections = secCopy;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  // For updating text fields
  function updatePageTitle(pageIndex: number, newTitle: string) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      pageCopy.title = newTitle;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  // Storing TipTap HTML in page.description
  function updatePageDescription(pageIndex: number, newDesc: string) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      pageCopy.description = newDesc;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  // Example for updating an unsectioned question
  function updateUnsectionedQuestion(pageIndex: number, qIndex: number, updated: Question) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const unsecCopy = [...pageCopy.unsectioned];
      unsecCopy[qIndex] = updated;
      pageCopy.unsectioned = unsecCopy;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  function updateSectionQuestion(
    pageIndex: number,
    sectionIndex: number,
    qIndex: number,
    updated: Question
  ) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const secCopy = [...pageCopy.sections];
      const secObj = { ...secCopy[sectionIndex] };
      const questionsCopy = [...secObj.questions];
      questionsCopy[qIndex] = updated;
      secObj.questions = questionsCopy;
      secCopy[sectionIndex] = secObj;
      pageCopy.sections = secCopy;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  // ------------------ EXPANSION (Pages, Sections, Questions) ------------------ //

  function togglePage(pIndex: number) {
    setExpandedPages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pIndex)) newSet.delete(pIndex);
      else newSet.add(pIndex);
      return newSet;
    });
  }

  function toggleSection(key: string) {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  }

  function toggleQuestion(key: string) {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  }

  // Expand/Collapse All
  function handleExpandCollapseAll() {
    setAllExpanded(!allExpanded);
    if (!allExpanded) {
      const pSet = new Set<number>();
      const sSet = new Set<string>();
      const qSet = new Set<string>();
      form.pages.forEach((page, pIndex) => {
        pSet.add(pIndex);
        page.unsectioned.forEach((_, qIndex) => {
          qSet.add(`p${pIndex}-Uq${qIndex}`);
        });
        page.sections.forEach((sec, sIndex) => {
          const secKey = `p${pIndex}-s${sIndex}`;
          sSet.add(secKey);
          sec.questions.forEach((_, qqIndex) => {
            qSet.add(`p${pIndex}-s${sIndex}-q${qqIndex}`);
          });
        });
      });
      setExpandedPages(pSet);
      setExpandedSections(sSet);
      setExpandedQuestions(qSet);
    } else {
      setExpandedPages(new Set());
      setExpandedSections(new Set());
      setExpandedQuestions(new Set());
    }
  }

  // ------------------ RENDER ------------------ //

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
        const pageKey = `page-${pIndex}`;

        return (
          <Accordion
            key={pageKey}
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
              {/* Page Title */}
              <Typography variant="subtitle2" sx={{ mt: 1 }}>Page Title:</Typography>
              <input
                value={page.title}
                onChange={(e) => updatePageTitle(pIndex, e.target.value)}
                style={{ marginBottom: '1rem', width: '100%' }}
              />

              {/* Page Description (TipTap) */}
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Page Description (Rich Text):
              </Typography>
              <TipTapEditor
                value={page.description}
                onChange={(val) => updatePageDescription(pIndex, val)}
              />

              {/* Move Page Up/Down + Delete Page */}
              <div style={{ marginBottom: '1rem' }}>
                <IconButton onClick={() => movePageUp(pIndex)} sx={{ mr: 1 }}>
                  <ArrowUpwardIcon />
                </IconButton>
                <IconButton onClick={() => movePageDown(pIndex)} sx={{ mr: 1 }}>
                  <ArrowDownwardIcon />
                </IconButton>

                {/* Delete Page */}
                <IconButton onClick={() => removePage(pIndex)}>
                  <DeleteIcon />
                </IconButton>
              </div>

              {/* Add unsectioned question or add section */}
              <Button onClick={() => addUnsectionedQuestion(pIndex)} sx={{ mr: 2 }}>
                Add Unsectioned Q
              </Button>
              <Button onClick={() => addSection(pIndex)}>Add Section</Button>

              <Divider sx={{ my: 2 }} />

              {/* Unsectioned Questions */}
              {page.unsectioned.map((question, qIndex) => {
                const numbering = `${pIndex + 1}.${qIndex + 1}`;
                const qKey = `p${pIndex}-Uq${qIndex}`;
                const expandedQ = expandedQuestions.has(qKey);

                return (
                  <QuestionAccordion
                    key={qKey}
                    question={question}
                    numbering={numbering}
                    expanded={expandedQ}
                    onToggle={() => toggleQuestion(qKey)}
                    onUpdate={(upd) => updateUnsectionedQuestion(pIndex, qIndex, upd)}
                    onMoveUp={() => moveUnsectionedQuestionUp(pIndex, qIndex)}
                    onMoveDown={() => moveUnsectionedQuestionDown(pIndex, qIndex)}
                    onRemove={() => removeUnsectionedQuestion(pIndex, qIndex)}
                  />
                );
              })}

              <Divider sx={{ my: 2 }} />

              {/* Sections */}
              {page.sections.map((sec, sIndex) => {
                const secKey = `p${pIndex}-s${sIndex}`;
                const secExpanded = expandedSections.has(secKey);

                return (
                  <SectionAccordion
                    key={secKey}
                    section={sec}
                    pageIndex={pIndex}
                    sectionIndex={sIndex}
                    expanded={secExpanded}
                    onToggle={() => toggleSection(secKey)}

                    onMoveUp={() => moveSectionUp(pIndex, sIndex)}
                    onMoveDown={() => moveSectionDown(pIndex, sIndex)}
                    onRemove={() => removeSection(pIndex, sIndex)}

                    onUpdateTitle={(newTitle) => {
                      // immutably update the section title
                      setForm((prev: FormSchema) => {
                        const newPages = [...prev.pages];
                        const pageCopy = { ...newPages[pIndex] };
                        const secCopy = [...pageCopy.sections];
                        const secObj = { ...secCopy[sIndex] };
                        secObj.title = newTitle;
                        secCopy[sIndex] = secObj;
                        pageCopy.sections = secCopy;
                        newPages[pIndex] = pageCopy;
                        return { ...prev, pages: newPages };
                      });
                    }}
                    onUpdateQuestion={(qIdx, updatedQ) =>
                      updateSectionQuestion(pIndex, sIndex, qIdx, updatedQ)
                    }
                    onMoveQuestionUp={(qIdx) =>
                      moveSectionQuestionUp(pIndex, sIndex, qIdx)
                    }
                    onMoveQuestionDown={(qIdx) =>
                      moveSectionQuestionDown(pIndex, sIndex, qIdx)
                    }
                    onRemoveQuestion={(qIdx) =>
                      removeSectionQuestion(pIndex, sIndex, qIdx)
                    }
                  />
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
