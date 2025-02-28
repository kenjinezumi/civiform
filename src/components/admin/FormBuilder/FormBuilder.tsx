/**
 * src/components/admin/FormBuilder/FormBuilder.tsx
 *
 * A comprehensive form builder that:
 *  - If the route param :formId is "new", uses a blank form from useHierFormController.
 *  - Otherwise, fetches existing form data from the server (GET /forms/:formId).
 *  - Includes "unsectioned" questions + "sections" on each page, plus advanced question logic (rating, skip).
 *  - Avoids calling hooks conditionally.
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

// Local components (TipTap editor, question/section accordions)
import { TipTapEditor } from '../../shared/TipTapEditor';
import { QuestionAccordion } from './QuestionAccordion';
import { SectionAccordion } from './SectionAccordion';

// Our custom hook that manages the entire form state (including advanced question logic)
import { useHierFormController } from '../../../controllers/useHierFormController';

// Types
import { FormSchema, Question, SkipLogicCondition } from '../../../types/formTypes';

/** Helper to reorder array items by swapping indices. */
function swap<T>(arr: T[], i: number, j: number) {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

export default function FormBuilder() {
  // ----------------------------------------
  // 1) Hooks at top level
  // ----------------------------------------
  const { formId } = useParams<{ formId: string }>();

  // Our form management hook: includes advanced question logic if implemented
  const {
    form,
    setForm,
    loading,
    error,
    // Page-level
    addPage,
    removePage,
    movePageUp,
    movePageDown,
    // Unsectioned
    addUnsectionedQuestion,
    removeUnsectionedQuestion,
    moveUnsectionedQuestionUp,
    moveUnsectionedQuestionDown,
    // Section-level
    addSection,
    removeSection,
    moveSectionUp,
    moveSectionDown,
    // Section questions
    addQuestionToSection,
    removeSectionQuestion,
    moveSectionQuestionUp,
    moveSectionQuestionDown,
    // Optional advanced question logic, e.g. addRatingQuestionToSection or setSkipLogicOnQuestion

    // Save form
    saveForm,
  } = useHierFormController();

  // Local states for fetching existing form
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Expand/collapse logic
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  // ----------------------------------------
  // 2) If formId != "new", fetch existing form from backend
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

        // If backend returns nested pages + unsectioned + sections, we can set it directly.
        // Otherwise, 'inflate' or transform as needed:
        const inflated: FormSchema = {
          id: apiData.id,
          title: apiData.title || 'Untitled from server',
          description: apiData.description || '',
          published: apiData.published || false,
          country: apiData.country || '',
          created_by: apiData.created_by || '',
          pages: apiData.pages ?? [
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
  // 3) Return loading / error states
  // ----------------------------------------
  if (fetching) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Loading form (ID: {formId})...</Typography>
        <CircularProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Box sx={{ p: 3 }}>
<Typography color="error">
{error && typeof error === 'object' ? JSON.stringify(error) : error}
</Typography>
      </Box>
    );
  }

  // If we have the form, let's safe-guard the pages array
  const pages = form?.pages ?? [];

  // ----------------------------------------
  // Expand/Collapse All
  // ----------------------------------------
  const handleExpandCollapseAll = () => {
    setAllExpanded(!allExpanded);
    if (!allExpanded) {
      // expand everything
      const pSet = new Set<number>();
      const sSet = new Set<string>();
      const qSet = new Set<string>();

      for (let pIndex = 0; pIndex < pages.length; pIndex++) {
        pSet.add(pIndex);
        const page = pages[pIndex];
        page.unsectioned.forEach((_, qIndex) => {
          qSet.add(`p${pIndex}-Uq${qIndex}`);
        });
        page.sections.forEach((section, sIndex) => {
          const secKey = `p${pIndex}-s${sIndex}`;
          sSet.add(secKey);
          section.questions.forEach((_, qqIndex) => {
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
  // Render
  // ----------------------------------------
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Multi-Page Form Builder (with advanced question support)
      </Typography>
      {error && <Typography color="error">{error}</Typography>}

      <Typography sx={{ mb: 2 }}>
        <strong>Form ID:</strong> {form.id ?? '(new)'}
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

      <Divider sx={{ mb: 3 }} />

      {/* Render each page */}
      {pages.map((page, pIndex) => {
        const pageKey = `page-${pIndex}`;
        const pageExpanded = expandedPages.has(pIndex);

        return (
          <Accordion
            key={pageKey}
            expanded={pageExpanded}
            onChange={() => {
              setExpandedPages((prev) => {
                const newSet = new Set(prev);
                newSet.has(pIndex) ? newSet.delete(pIndex) : newSet.add(pIndex);
                return newSet;
              });
            }}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                Page {pIndex + 1}: {page.title || '(untitled)'}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              {/* PAGE TITLE */}
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Page Title:
              </Typography>
              <input
                style={{ width: '100%', marginBottom: '1rem' }}
                value={page.title}
                onChange={(e) => {
                  // inline approach to updating page title
                  setForm((prev) => {
                    const pagesCopy = [...prev.pages];
                    pagesCopy[pIndex] = { ...pagesCopy[pIndex], title: e.target.value };
                    return { ...prev, pages: pagesCopy };
                  });
                }}
              />

              {/* PAGE DESCRIPTION (Rich Text) */}
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Page Description:
              </Typography>
              <TipTapEditor
                value={page.description}
                onChange={(val) => {
                  setForm((prev) => {
                    const pagesCopy = [...prev.pages];
                    pagesCopy[pIndex] = { ...pagesCopy[pIndex], description: val };
                    return { ...prev, pages: pagesCopy };
                  });
                }}
              />

              {/* Move / Remove Page */}
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

              {/* Buttons: add unsectioned Q or add section */}
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
                    onToggle={() => {
                      setExpandedQuestions((prev) => {
                        const newSet = new Set(prev);
                        newSet.has(qKey) ? newSet.delete(qKey) : newSet.add(qKey);
                        return newSet;
                      });
                    }}
                    onUpdate={(updatedQ) => {
                      // inline approach to updating unsectioned question
                      setForm((prev) => {
                        const pageCopy = { ...prev.pages[pIndex] };
                        const unsec = [...pageCopy.unsectioned];
                        unsec[qIndex] = updatedQ;
                        pageCopy.unsectioned = unsec;
                        const newPages = [...prev.pages];
                        newPages[pIndex] = pageCopy;
                        return { ...prev, pages: newPages };
                      });
                    }}
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
                    onToggle={() => {
                      setExpandedSections((prev) => {
                        const newSet = new Set(prev);
                        newSet.has(secKey) ? newSet.delete(secKey) : newSet.add(secKey);
                        return newSet;
                      });
                    }}
                    // reorder / remove entire section
                    onMoveUp={() => moveSectionUp(pIndex, sIndex)}
                    onMoveDown={() => moveSectionDown(pIndex, sIndex)}
                    onRemove={() => removeSection(pIndex, sIndex)}
                    // add question
                    onAddQuestion={() => addQuestionToSection(pIndex, sIndex)}
                    // reorder / remove child questions
                    onMoveQuestionUp={(qIdx) => moveSectionQuestionUp(pIndex, sIndex, qIdx)}
                    onMoveQuestionDown={(qIdx) => moveSectionQuestionDown(pIndex, sIndex, qIdx)}
                    onRemoveQuestion={(qIdx) => removeSectionQuestion(pIndex, sIndex, qIdx)}
                    onUpdateQuestion={(qIdx, updatedQ) => {
                      // inline approach to updating a question in the section
                      setForm((prev) => {
                        const pageCopy = { ...prev.pages[pIndex] };
                        const secCopy = { ...pageCopy.sections[sIndex] };
                        const qs = [...secCopy.questions];
                        qs[qIdx] = updatedQ;
                        secCopy.questions = qs;
                        pageCopy.sections[sIndex] = secCopy;
                        const newPages = [...prev.pages];
                        newPages[pIndex] = pageCopy;
                        return { ...prev, pages: newPages };
                      });
                    }}
                    // rename the section
                    onUpdateTitle={(newTitle) => {
                      setForm((prev) => {
                        const pageCopy = { ...prev.pages[pIndex] };
                        const secCopy = { ...pageCopy.sections[sIndex], title: newTitle };
                        pageCopy.sections[sIndex] = secCopy;
                        const newPages = [...prev.pages];
                        newPages[pIndex] = pageCopy;
                        return { ...prev, pages: newPages };
                      });
                    }}
                    expandedQuestions={expandedQuestions}
                    toggleQuestion={(qKey: string) => {
                      setExpandedQuestions((prev) => {
                        const newSet = new Set(prev);
                        newSet.has(qKey) ? newSet.delete(qKey) : newSet.add(qKey);
                        return newSet;
                      });
                    }}
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
