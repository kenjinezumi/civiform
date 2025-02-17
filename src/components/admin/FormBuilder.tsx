/**
 * src/components/admin/FormBuilder.tsx
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
import { SectionAccordion } from './SectionAccordion';
import { Question, Section } from '../../types/formTypes';

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
    setForm,
  } = useHierFormController();

  // Track which items are expanded
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  // ---- UTILS FOR IMMUTABLE UPDATES ----

  // Pages
  function updatePageTitle(pageIndex: number, newTitle: string) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      pageCopy.title = newTitle;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }
  function updatePageDescription(pageIndex: number, newDesc: string) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      pageCopy.description = newDesc;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  // Unsectioned question
  function updateUnsectionedQuestion(pageIndex: number, qIndex: number, updated: Question) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const unsecCopy = [...pageCopy.unsectioned];
      unsecCopy[qIndex] = updated;
      pageCopy.unsectioned = unsecCopy;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }
  function removeUnsectionedQuestion(pageIndex: number, qIndex: number) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const unsecCopy = [...pageCopy.unsectioned];
      unsecCopy.splice(qIndex, 1);
      pageCopy.unsectioned = unsecCopy;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  // Sections
  function updateSectionTitle(pageIndex: number, sectionIndex: number, newTitle: string) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const secCopy = [...pageCopy.sections];
      const secObj = { ...secCopy[sectionIndex] };
      secObj.title = newTitle;
      secCopy[sectionIndex] = secObj;
      pageCopy.sections = secCopy;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }
  function removeSection(pageIndex: number, sectionIndex: number) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const secCopy = [...pageCopy.sections];
      secCopy.splice(sectionIndex, 1);
      pageCopy.sections = secCopy;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  // Questions in a section
  function updateSectionQuestion(
    pageIndex: number,
    sectionIndex: number,
    qIndex: number,
    updated: Question
  ) {
    setForm((prev) => {
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
  function removeSectionQuestion(pageIndex: number, sectionIndex: number, qIndex: number) {
    setForm((prev) => {
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

  // ---- EXPANSION LOGIC ----
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
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Page Title:
              </Typography>
              <input
                value={page.title}
                onChange={(e) => updatePageTitle(pIndex, e.target.value)}
                style={{ marginBottom: '1rem', width: '100%' }}
              />

              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Page Description:
              </Typography>
              <textarea
                value={page.description}
                onChange={(e) => updatePageDescription(pIndex, e.target.value)}
                rows={2}
                style={{ width: '100%', marginBottom: '1rem' }}
              />

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
                const numbering = `${pIndex + 1}.U.${qIndex + 1}`;
                const expandedQ = expandedQuestions.has(qKey);

                return (
                  <QuestionAccordion
                    key={qKey}
                    question={question}
                    numbering={numbering}
                    expanded={expandedQ}
                    onToggle={() => toggleQuestion(qKey)}
                    onUpdate={(upd) => updateUnsectionedQuestion(pIndex, qIndex, upd)}
                    onMoveUp={() => {}}
                    onMoveDown={() => {}}
                    onRemove={() => removeUnsectionedQuestion(pIndex, qIndex)}
                  />
                );
              })}

              <Divider sx={{ my: 2 }} />

              {/* Sections */}
              {page.sections.map((sec, sIndex) => {
                const secKey = `p${pIndex}-s${sIndex}`;
                const secExpanded = expandedSections.has(secKey);
                const sectionNum = sIndex + 1;

                return (
                  <SectionAccordion
                    key={secKey}
                    section={sec}
                    pageIndex={pIndex}
                    sectionIndex={sIndex}
                    expanded={secExpanded}
                    onToggle={() => toggleSection(secKey)}
                    onMoveUp={() => {}}
                    onMoveDown={() => {}}
                    onRemove={() => removeSection(pIndex, sIndex)}
                    onUpdateTitle={(newTitle) => updateSectionTitle(pIndex, sIndex, newTitle)}
                    onUpdateQuestion={(qIndex, updatedQ) =>
                      updateSectionQuestion(pIndex, sIndex, qIndex, updatedQ)
                    }
                    onMoveQuestionUp={() => {}}
                    onMoveQuestionDown={() => {}}
                    onRemoveQuestion={(qIndex) => removeSectionQuestion(pIndex, sIndex, qIndex)}
                  />
                );
              })}
            </AccordionDetails>
          </Accordion>
        );
      })}

      <Divider sx={{ my: 3 }} />
      <Button variant="contained" disabled={loading} onClick={saveForm}>
        {loading ? 'Saving...' : 'Save Form'
        }
      </Button>
    </Box>
  );
}
