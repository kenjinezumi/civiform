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

/** Helper to swap items in an array */
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

  // track expansions
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  /** For ALL questions (both unsectioned & within sections), we use the same Set. */
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  // -----------------------------------------------------------------
  // 1) PAGES: remove, reorder
  // -----------------------------------------------------------------
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
    setForm((prev: FormSchema) => {
      if (pageIndex >= prev.pages.length - 1) return prev;
      const newPages = [...prev.pages];
      swap(newPages, pageIndex, pageIndex + 1);
      return { ...prev, pages: newPages };
    });
  }

  // -----------------------------------------------------------------
  // 2) UNSECTIONED QUESTIONS: remove, reorder
  // -----------------------------------------------------------------
  function removeUnsectionedQuestion(pageIndex: number, qIndex: number) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const unsecCopy = [...pageCopy.unsectioned];
      // remove the question from array
      unsecCopy.splice(qIndex, 1);
      pageCopy.unsectioned = unsecCopy;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }
  function moveUnsectionedQuestionUp(pageIndex: number, qIndex: number) {
    if (qIndex <= 0) return;
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const unsec = [...pageCopy.unsectioned];
      swap(unsec, qIndex, qIndex - 1);
      pageCopy.unsectioned = unsec;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }
  function moveUnsectionedQuestionDown(pageIndex: number, qIndex: number) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const unsec = [...pageCopy.unsectioned];
      if (qIndex >= unsec.length - 1) return prev;
      swap(unsec, qIndex, qIndex + 1);
      pageCopy.unsectioned = unsec;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  // -----------------------------------------------------------------
  // 3) SECTIONS: remove, reorder, update
  // -----------------------------------------------------------------
  function removeSection(pageIndex: number, sectionIndex: number) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageC = { ...newPages[pageIndex] };
      const secs = [...pageC.sections];
      secs.splice(sectionIndex, 1);
      pageC.sections = secs;
      newPages[pageIndex] = pageC;
      return { ...prev, pages: newPages };
    });
  }
  function moveSectionUp(pageIndex: number, sectionIndex: number) {
    if (sectionIndex <= 0) return;
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageC = { ...newPages[pageIndex] };
      const secs = [...pageC.sections];
      swap(secs, sectionIndex, sectionIndex - 1);
      pageC.sections = secs;
      newPages[pageIndex] = pageC;
      return { ...prev, pages: newPages };
    });
  }
  function moveSectionDown(pageIndex: number, sectionIndex: number) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageC = { ...newPages[pageIndex] };
      const secs = [...pageC.sections];
      if (sectionIndex >= secs.length - 1) return prev;
      swap(secs, sectionIndex, sectionIndex + 1);
      pageC.sections = secs;
      newPages[pageIndex] = pageC;
      return { ...prev, pages: newPages };
    });
  }

  // NEW: Update section title immutably
  function updateSectionTitle(pageIndex: number, sectionIndex: number, newTitle: string) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageC = { ...newPages[pageIndex] };
      const secs = [...pageC.sections];
      const secCopy = { ...secs[sectionIndex] };
      secCopy.title = newTitle;
      secs[sectionIndex] = secCopy;
      pageC.sections = secs;
      newPages[pageIndex] = pageC;
      return { ...prev, pages: newPages };
    });
  }

  // -----------------------------------------------------------------
  // 4) SECTION QUESTIONS: remove, reorder
  // -----------------------------------------------------------------
  function removeSectionQuestion(pageIndex: number, sectionIndex: number, qIndex: number) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageC = { ...newPages[pageIndex] };
      const secs = [...pageC.sections];
      const secObj = { ...secs[sectionIndex] };
      const qs = [...secObj.questions];
      qs.splice(qIndex, 1);
      secObj.questions = qs;
      secs[sectionIndex] = secObj;
      pageC.sections = secs;
      newPages[pageIndex] = pageC;
      return { ...prev, pages: newPages };
    });
  }
  function moveSectionQuestionUp(pageIndex: number, sectionIndex: number, qIndex: number) {
    if (qIndex <= 0) return;
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageC = { ...newPages[pageIndex] };
      const secs = [...pageC.sections];
      const secObj = { ...secs[sectionIndex] };
      const qs = [...secObj.questions];
      swap(qs, qIndex, qIndex - 1);
      secObj.questions = qs;
      secs[sectionIndex] = secObj;
      pageC.sections = secs;
      newPages[pageIndex] = pageC;
      return { ...prev, pages: newPages };
    });
  }
  function moveSectionQuestionDown(pageIndex: number, sectionIndex: number, qIndex: number) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageC = { ...newPages[pageIndex] };
      const secs = [...pageC.sections];
      const secObj = { ...secs[sectionIndex] };
      const qs = [...secObj.questions];
      if (qIndex >= qs.length - 1) return prev;
      swap(qs, qIndex, qIndex + 1);
      secObj.questions = qs;
      secs[sectionIndex] = secObj;
      pageC.sections = secs;
      newPages[pageIndex] = pageC;
      return { ...prev, pages: newPages };
    });
  }

  // -----------------------------------------------------------------
  // 5) PAGE TITLE / DESCRIPTION
  // -----------------------------------------------------------------
  function updatePageTitle(pageIndex: number, newTitle: string) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pCopy = { ...newPages[pageIndex] };
      pCopy.title = newTitle;
      newPages[pageIndex] = pCopy;
      return { ...prev, pages: newPages };
    });
  }
  function updatePageDescription(pageIndex: number, newDesc: string) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pCopy = { ...newPages[pageIndex] };
      pCopy.description = newDesc;
      newPages[pageIndex] = pCopy;
      return { ...prev, pages: newPages };
    });
  }

  // -----------------------------------------------------------------
  // 6) UNSECTIONED QUESTION UPDATE
  // -----------------------------------------------------------------
  function updateUnsectionedQuestion(pageIndex: number, qIndex: number, updated: Question) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pCopy = { ...newPages[pageIndex] };
      const unsec = [...pCopy.unsectioned];
      unsec[qIndex] = updated;
      pCopy.unsectioned = unsec;
      newPages[pageIndex] = pCopy;
      return { ...prev, pages: newPages };
    });
  }

  // -----------------------------------------------------------------
  // 7) SECTION QUESTION UPDATE
  // -----------------------------------------------------------------
  function updateSectionQuestion(
    pageIndex: number,
    sectionIndex: number,
    qIndex: number,
    updated: Question
  ) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageC = { ...newPages[pageIndex] };
      const secs = [...pageC.sections];
      const secObj = { ...secs[sectionIndex] };
      const qs = [...secObj.questions];
      qs[qIndex] = updated;
      secObj.questions = qs;
      secs[sectionIndex] = secObj;
      pageC.sections = secs;
      newPages[pageIndex] = pageC;
      return { ...prev, pages: newPages };
    });
  }

  // -----------------------------------------------------------------
  // 8) EXPAND / COLLAPSE
  // -----------------------------------------------------------------
  const togglePage = (pIndex: number) => {
    setExpandedPages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pIndex)) newSet.delete(pIndex);
      else newSet.add(pIndex);
      return newSet;
    });
  };
  const toggleSection = (secKey: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(secKey)) newSet.delete(secKey);
      else newSet.add(secKey);
      return newSet;
    });
  };
  const toggleQuestion = (qKey: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(qKey)) newSet.delete(qKey);
      else newSet.add(qKey);
      return newSet;
    });
  };

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

  // -----------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------
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

      {/* RENDER EACH PAGE */}
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
              {/* PAGE TITLE */}
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Page Title:
              </Typography>
              <input
                style={{ marginBottom: '1rem', width: '100%' }}
                value={page.title}
                onChange={(e) => updatePageTitle(pIndex, e.target.value)}
              />

              {/* PAGE DESCRIPTION (TIPTAP) */}
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Page Description (Rich Text):
              </Typography>
              <TipTapEditor
                value={page.description}
                onChange={(val) => updatePageDescription(pIndex, val)}
              />

              {/* Move / Delete Page */}
              <Box sx={{ display: 'flex', gap: 1, my: 2 }}>
                <IconButton onClick={() => movePageUp(pIndex)}>
                  <ArrowUpwardIcon />
                </IconButton>
                <IconButton onClick={() => movePageDown(pIndex)}>
                  <ArrowDownwardIcon />
                </IconButton>
                <IconButton onClick={() => removePage(pIndex)}>
                  <DeleteIcon />
                </IconButton>
              </Box>

              {/* Add Unsectioned Question or Add Section */}
              <Button onClick={() => addUnsectionedQuestion(pIndex)} sx={{ mr: 2 }}>
                Add Unsectioned Q
              </Button>
              <Button onClick={() => addSection(pIndex)}>Add Section</Button>

              <Divider sx={{ my: 2 }} />

              {/* UNSECTIONED QUESTIONS */}
              {page.unsectioned.map((question, qIndex) => {
                const qKey = `p${pIndex}-Uq${qIndex}`;
                const numbering = `${pIndex + 1}.${qIndex + 1}`;
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

              {/* SECTIONS */}
              {page.sections.map((sec, sIndex) => {
                const secKey = `p${pIndex}-s${sIndex}`;
                const secExpanded = expandedSections.has(secKey);

                return (
                  <SectionAccordion
                    key={secKey}
                    expanded={secExpanded}
                    onToggle={() => toggleSection(secKey)}
                    // reorder / remove entire section
                    onMoveUp={() => moveSectionUp(pIndex, sIndex)}
                    onMoveDown={() => moveSectionDown(pIndex, sIndex)}
                    onRemove={() => removeSection(pIndex, sIndex)}
                    // add question to this section
                    onAddQuestion={() => addQuestionToSection(pIndex, sIndex)}
                    // reorder / remove child question
                    onMoveQuestionUp={(qIdx) => moveSectionQuestionUp(pIndex, sIndex, qIdx)}
                    onMoveQuestionDown={(qIdx) => moveSectionQuestionDown(pIndex, sIndex, qIdx)}
                    onRemoveQuestion={(qIdx) => removeSectionQuestion(pIndex, sIndex, qIdx)}
                    onUpdateQuestion={(qIdx, updatedQ) =>
                      updateSectionQuestion(pIndex, sIndex, qIdx, updatedQ)
                    }
                    // NEW: pass the title updater
                    onUpdateTitle={(newTitle) => updateSectionTitle(pIndex, sIndex, newTitle)}
                    
                   
                    expandedQuestions={expandedQuestions}
                    toggleQuestion={toggleQuestion}
                    
                    section={sec}
                    pageIndex={pIndex}
                    sectionIndex={sIndex}
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
