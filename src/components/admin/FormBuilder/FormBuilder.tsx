/**
 * src/components/admin/FormBuilder/FormBuilder.tsx
 *
 * A comprehensive form builder that:
 *  - If the route param :id is "new", use a blank form from the hook.
 *  - Otherwise, fetch an existing form from the server (GET /forms/:id).
 *  - Unflatten it into form.pages if needed.
 *  - Avoids calling hooks (useState, useEffect, etc.) conditionally.
 */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import {
  Box,
  Typography,
  Button,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  CircularProgress,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';

// Custom components (import your own):
import { TipTapEditor } from '../../shared/TipTapEditor';
import { QuestionAccordion } from './QuestionAccordion';
import { SectionAccordion } from './SectionAccordion';

// Our custom hook
import { useHierFormController } from '../../../controllers/useHierFormController';

// Types
import { FormSchema, Question } from '../../../types/formTypes';

// Helper to reorder array items
function swap<T>(arr: T[], i: number, j: number) {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

export default function FormBuilder() {
  // ----------------------------------------
  // 1) Hooks must be at the top level
  // ----------------------------------------
  const { formId } = useParams<{ formId: string }>();
  // if you want a typed param:
  
  // The main form hook
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

  // Local states for fetching existing form data
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Expand/collapse states
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  // ----------------------------------------
  // 2) useEffect to fetch if not "new"
  // ----------------------------------------
  useEffect(() => {
    if (!formId || formId === 'new') {
      console.log('New form => skip fetching existing');
      return;
    }

    setFetching(true);
    setFetchError(null);

    axios
      .get(`http://127.0.0.1:8000/forms/${formId}`)
      .then((res) => {
        const apiData = res.data;
        console.log('Fetched existing form:', apiData);
        // Unflatten into local pages, if your backend only stores top-level fields
        const inflated: FormSchema = {
          id: apiData.id, // so we do PUT next time
          title: apiData.title || 'Untitled from server',
          description: apiData.description || '',
          pages: [
            {
              title: 'Page 1',
              description: '',
              unsectioned: [],
              sections: [],
            },
          ],
        };
        setForm(inflated);
      })
      .catch((err) => {
        console.error('Error fetching form:', err);
        setFetchError(err.response?.data?.detail || err.message);
      })
      .finally(() => {
        setFetching(false);
      });
  }, [formId, setForm]);

  // ----------------------------------------
  // 3) Conditionally render after Hooks
  // ----------------------------------------
  // If still fetching => spinner
  if (fetching) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Loading form (ID: {formId})...</Typography>
        <CircularProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  // If we had an error
  if (fetchError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error: {fetchError}</Typography>
      </Box>
    );
  }

  // Safe fallback so we don't crash on `form.pages`
  const pages = form.pages ?? [];

  // ----------------------------------------
  // 4) Page-level CRUD / reorder
  // ----------------------------------------
  const removePage = (pageIndex: number) => {
    setForm((prev: FormSchema) => {
      const oldPages = prev.pages ?? [];
      const newPages = [...oldPages];
      newPages.splice(pageIndex, 1);
      return { ...prev, pages: newPages };
    });
  };

  const movePageUp = (pageIndex: number) => {
    if (pageIndex <= 0) return;
    setForm((prev: FormSchema) => {
      const oldPages = prev.pages ?? [];
      const newPages = [...oldPages];
      swap(newPages, pageIndex, pageIndex - 1);
      return { ...prev, pages: newPages };
    });
  };

  const movePageDown = (pageIndex: number) => {
    setForm((prev: FormSchema) => {
      const oldPages = prev.pages ?? [];
      if (pageIndex >= oldPages.length - 1) return prev;
      const newPages = [...oldPages];
      swap(newPages, pageIndex, pageIndex + 1);
      return { ...prev, pages: newPages };
    });
  };

  // ----------------------------------------
  // 5) Unsectioned Questions logic
  // ----------------------------------------
  const removeUnsectionedQuestion = (pageIndex: number, qIndex: number) => {
    setForm((prev: FormSchema) => {
      const oldPages = prev.pages;
      const pageCopy = { ...oldPages[pageIndex] };
      const unsec = [...pageCopy.unsectioned];
      unsec.splice(qIndex, 1);
      pageCopy.unsectioned = unsec;

      const newPages = [...oldPages];
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  };

  const moveUnsectionedQuestionUp = (pageIndex: number, qIndex: number) => {
    if (qIndex <= 0) return;
    setForm((prev: FormSchema) => {
      const oldPages = prev.pages;
      const pageCopy = { ...oldPages[pageIndex] };
      const unsec = [...pageCopy.unsectioned];
      swap(unsec, qIndex, qIndex - 1);
      pageCopy.unsectioned = unsec;

      const newPages = [...oldPages];
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  };

  const moveUnsectionedQuestionDown = (pageIndex: number, qIndex: number) => {
    setForm((prev: FormSchema) => {
      const oldPages = prev.pages;
      const pageCopy = { ...oldPages[pageIndex] };
      const unsec = [...pageCopy.unsectioned];
      if (qIndex >= unsec.length - 1) return prev;
      swap(unsec, qIndex, qIndex + 1);
      pageCopy.unsectioned = unsec;

      const newPages = [...oldPages];
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  };

  // ----------------------------------------
  // 6) Section-level CRUD / reorder
  // ----------------------------------------
  const removeSection = (pageIndex: number, sectionIndex: number) => {
    setForm((prev: FormSchema) => {
      const oldPages = prev.pages;
      const pageCopy = { ...oldPages[pageIndex] };
      const secs = [...pageCopy.sections];
      secs.splice(sectionIndex, 1);
      pageCopy.sections = secs;

      const newPages = [...oldPages];
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  };

  const moveSectionUp = (pageIndex: number, sectionIndex: number) => {
    if (sectionIndex <= 0) return;
    setForm((prev: FormSchema) => {
      const oldPages = prev.pages;
      const pageCopy = { ...oldPages[pageIndex] };
      const secs = [...pageCopy.sections];
      swap(secs, sectionIndex, sectionIndex - 1);

      pageCopy.sections = secs;
      const newPages = [...oldPages];
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  };

  const moveSectionDown = (pageIndex: number, sectionIndex: number) => {
    setForm((prev: FormSchema) => {
      const oldPages = prev.pages;
      const pageCopy = { ...oldPages[pageIndex] };
      const secs = [...pageCopy.sections];
      if (sectionIndex >= secs.length - 1) return prev;
      swap(secs, sectionIndex, sectionIndex + 1);

      pageCopy.sections = secs;
      const newPages = [...oldPages];
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  };

  const updateSectionTitle = (pageIndex: number, sectionIndex: number, newTitle: string) => {
    setForm((prev: FormSchema) => {
      const oldPages = prev.pages;
      const pageCopy = { ...oldPages[pageIndex] };
      const secs = [...pageCopy.sections];
      const secCopy = { ...secs[sectionIndex] };

      secCopy.title = newTitle;
      secs[sectionIndex] = secCopy;
      pageCopy.sections = secs;

      const newPages = [...oldPages];
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  };

  // ----------------------------------------
  // 7) Section Questions
  // ----------------------------------------
  const removeSectionQuestion = (pIndex: number, sIndex: number, qIndex: number) => {
    setForm((prev: FormSchema) => {
      const oldPages = prev.pages;
      const pageCopy = { ...oldPages[pIndex] };

      const secs = [...pageCopy.sections];
      const secObj = { ...secs[sIndex] };
      const qs = [...secObj.questions];

      qs.splice(qIndex, 1);
      secObj.questions = qs;
      secs[sIndex] = secObj;

      pageCopy.sections = secs;
      const newPages = [...oldPages];
      newPages[pIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  };

  const moveSectionQuestionUp = (pIndex: number, sIndex: number, qIndex: number) => {
    if (qIndex <= 0) return;
    setForm((prev: FormSchema) => {
      const oldPages = prev.pages;
      const pageCopy = { ...oldPages[pIndex] };

      const secs = [...pageCopy.sections];
      const secObj = { ...secs[sIndex] };
      const qs = [...secObj.questions];

      swap(qs, qIndex, qIndex - 1);
      secObj.questions = qs;
      secs[sIndex] = secObj;
      pageCopy.sections = secs;

      const newPages = [...oldPages];
      newPages[pIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  };

  const moveSectionQuestionDown = (pIndex: number, sIndex: number, qIndex: number) => {
    setForm((prev: FormSchema) => {
      const oldPages = prev.pages;
      const pageCopy = { ...oldPages[pIndex] };

      const secs = [...pageCopy.sections];
      const secObj = { ...secs[sIndex] };
      const qs = [...secObj.questions];

      if (qIndex >= qs.length - 1) return prev;
      swap(qs, qIndex, qIndex + 1);

      secObj.questions = qs;
      secs[sIndex] = secObj;
      pageCopy.sections = secs;

      const newPages = [...oldPages];
      newPages[pIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  };

  // ----------------------------------------
  // 8) Page Title / Description
  // ----------------------------------------
  const updatePageTitle = (pIndex: number, newTitle: string) => {
    setForm((prev: FormSchema) => {
      const oldPages = prev.pages;
      const pageCopy = { ...oldPages[pIndex] };
      pageCopy.title = newTitle;

      const newPages = [...oldPages];
      newPages[pIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  };

  const updatePageDescription = (pIndex: number, newDesc: string) => {
    setForm((prev: FormSchema) => {
      const oldPages = prev.pages;
      const pageCopy = { ...oldPages[pIndex] };
      pageCopy.description = newDesc;

      const newPages = [...oldPages];
      newPages[pIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  };

  // ----------------------------------------
  // 9) Unsectioned Question Update
  // ----------------------------------------
  const updateUnsectionedQuestion = (pIndex: number, qIndex: number, updated: Question) => {
    setForm((prev: FormSchema) => {
      const oldPages = prev.pages;
      const pageCopy = { ...oldPages[pIndex] };
      const unsec = [...pageCopy.unsectioned];
      unsec[qIndex] = updated;
      pageCopy.unsectioned = unsec;

      const newPages = [...oldPages];
      newPages[pIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  };

  // ----------------------------------------
  // 10) Section Question Update
  // ----------------------------------------
  const updateSectionQuestion = (
    pIndex: number,
    sIndex: number,
    qIndex: number,
    updated: Question
  ) => {
    setForm((prev: FormSchema) => {
      const oldPages = prev.pages;
      const pageCopy = { ...oldPages[pIndex] };

      const secs = [...pageCopy.sections];
      const secObj = { ...secs[sIndex] };
      const qs = [...secObj.questions];

      qs[qIndex] = updated;
      secObj.questions = qs;
      secs[sIndex] = secObj;
      pageCopy.sections = secs;

      const newPages = [...oldPages];
      newPages[pIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  };

  // ----------------------------------------
  // 11) Expand/Collapse
  // ----------------------------------------
  const togglePage = (pIndex: number) => {
    setExpandedPages((prev) => {
      const newSet = new Set(prev);
      newSet.has(pIndex) ? newSet.delete(pIndex) : newSet.add(pIndex);
      return newSet;
    });
  };

  const toggleSection = (secKey: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      newSet.has(secKey) ? newSet.delete(secKey) : newSet.add(secKey);
      return newSet;
    });
  };

  const toggleQuestion = (qKey: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.has(qKey) ? newSet.delete(qKey) : newSet.add(qKey);
      return newSet;
    });
  };

  const handleExpandCollapseAll = () => {
    setAllExpanded(!allExpanded);
    if (!allExpanded) {
      // expand everything
      const pSet = new Set<number>();
      const sSet = new Set<string>();
      const qSet = new Set<string>();

      for (let pIndex = 0; pIndex < pages.length; pIndex++) {
        const page = pages[pIndex];
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
      }

      setExpandedPages(pSet);
      setExpandedSections(sSet);
      setExpandedQuestions(qSet);
    } else {
      // collapse all
      setExpandedPages(new Set());
      setExpandedSections(new Set());
      setExpandedQuestions(new Set());
    }
  };

  // ----------------------------------------
  // 12) Render everything
  // ----------------------------------------
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Hierarchical Form Builder
      </Typography>
      {error && <Typography color="error">{error}</Typography>}

      <Typography>
        <strong>ID:</strong> {form.id ?? '(new)'}
      </Typography>
      <Typography>
        <strong>Title:</strong> {form.title || '(no title)'}
      </Typography>
      <Typography sx={{ mb: 2 }}>
        <strong>Description:</strong> {form.description || '(no description)'}
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={addPage} sx={{ mr: 2 }}>
          Add Page
        </Button>
        <Button variant="outlined" onClick={handleExpandCollapseAll} sx={{ mr: 2 }}>
          {allExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          {allExpanded ? 'Collapse All' : 'Expand All'}
        </Button>
        <Button variant="contained" color="primary" disabled={loading} onClick={saveForm}>
          {loading ? 'Saving...' : 'Save Form'}
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {pages.map((page, pIndex) => {
        const pageKey = `page-${pIndex}`;
        const pageExpanded = expandedPages.has(pIndex);

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
                style={{ marginBottom: '1rem', width: '100%' }}
                value={page.title}
                onChange={(e) => updatePageTitle(pIndex, e.target.value)}
              />

              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Page Description (Rich Text):
              </Typography>
              <TipTapEditor
                value={page.description}
                onChange={(val) => updatePageDescription(pIndex, val)}
              />

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

              <Button onClick={() => addUnsectionedQuestion(pIndex)} sx={{ mr: 2 }}>
                Add Unsectioned Q
              </Button>
              <Button onClick={() => addSection(pIndex)}>Add Section</Button>

              <Divider sx={{ my: 2 }} />

              {/* Unsectioned questions */}
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

              {/* Sections */}
              {page.sections.map((sec, sIndex) => {
                const secKey = `p${pIndex}-s${sIndex}`;
                const secExpanded = expandedSections.has(secKey);

                return (
                  <SectionAccordion
                    key={secKey}
                    expanded={secExpanded}
                    onToggle={() => toggleSection(secKey)}
                    onMoveUp={() => moveSectionUp(pIndex, sIndex)}
                    onMoveDown={() => moveSectionDown(pIndex, sIndex)}
                    onRemove={() => removeSection(pIndex, sIndex)}
                    onAddQuestion={() => addQuestionToSection(pIndex, sIndex)}
                    onMoveQuestionUp={(qIdx) => moveSectionQuestionUp(pIndex, sIndex, qIdx)}
                    onMoveQuestionDown={(qIdx) => moveSectionQuestionDown(pIndex, sIndex, qIdx)}
                    onRemoveQuestion={(qIdx) => removeSectionQuestion(pIndex, sIndex, qIdx)}
                    onUpdateQuestion={(qIdx, updatedQ) =>
                      updateSectionQuestion(pIndex, sIndex, qIdx, updatedQ)
                    }
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
