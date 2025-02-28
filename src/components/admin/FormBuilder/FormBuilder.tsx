/**
 * src/components/admin/FormBuilder/FormBuilder.tsx
 *
 * - If :formId is "new", uses a blank form from useHierFormController.
 * - Otherwise, fetches existing form from GET /forms/:formId.
 * - Shows top-level form fields (title, country, last updated).
 * - Renders pages => unsectioned => sections => questions with skip logic.
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import {
  Box,
  Typography,
  TextField,
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

// Local components
import { TipTapEditor } from '../../shared/TipTapEditor';
import { QuestionAccordion } from './QuestionAccordion';
import { SectionAccordion } from './SectionAccordion';

// Our custom hook
import { useHierFormController } from '../../../controllers/useHierFormController';
import { FormSchema } from '../../../types/formTypes';

/** Helper to reorder array items by swapping indices. */
function swap<T>(arr: T[], i: number, j: number) {
  const tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

export default function FormBuilder() {
  const { formId } = useParams<{ formId: string }>();

  // Our custom hook
  const {
    form,
    setForm,
    loading,
    error,
    addPage,
    removePage,
    movePageUp,
    movePageDown,
    addUnsectionedQuestion,
    removeUnsectionedQuestion,
    moveUnsectionedQuestionUp,
    moveUnsectionedQuestionDown,
    addSection,
    removeSection,
    moveSectionUp,
    moveSectionDown,
    addQuestionToSection,
    removeSectionQuestion,
    moveSectionQuestionUp,
    moveSectionQuestionDown,
    saveForm,
  } = useHierFormController();

  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Expand/collapse state
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  // If formId != "new", fetch existing form from the backend
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

        // Build a fully "inflated" form object
        const inflated: FormSchema = {
          id: apiData.id,
          title: apiData.title || 'Untitled from server',
          description: apiData.description || '',
          published: apiData.published || false,
          country: apiData.country || '',
          created_by: apiData.created_by || '',
          updated_at: apiData.updated_at || null,
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

  if (fetching) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">
          Loading form (ID: {formId})...
        </Typography>
        <CircularProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{fetchError}</Typography>
      </Box>
    );
  }

  const pages = form?.pages ?? [];

  // Expand/Collapse All
  const handleExpandCollapseAll = () => {
    setAllExpanded(!allExpanded);
    if (!allExpanded) {
      const pSet = new Set<number>();
      const sSet = new Set<string>();
      const qSet = new Set<string>();

      for (let pIndex = 0; pIndex < pages.length; pIndex++) {
        pSet.add(pIndex);
        const page = pages[pIndex];

        // unsectioned
        page.unsectioned.forEach((_, qIndex) => {
          qSet.add(`p${pIndex}-Uq${qIndex}`);
        });

        // sections
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

  // Render
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Multi-Page Form Builder (with advanced question support)
      </Typography>
      {error && <Typography color="error">{error}</Typography>}

      {/* Show top-level form info */}
      <Box sx={{ mb: 2 }}>
        {/* ID */}
        {form.id && (
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Form ID:</strong> {form.id}
          </Typography>
        )}

        {/* Last Updated */}
        {form.updated_at && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            Last Updated:{' '}
            {new Date(form.updated_at).toLocaleString()}
          </Typography>
        )}

        {/* Title + Country => editable */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TextField
            label="Form Title"
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }
            fullWidth
          />
          <TextField
            label="Country"
            value={form.country ?? ''}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                country: e.target.value,
              }))
            }
            fullWidth
          />
        </Box>
      </Box>

      <Button variant="contained" onClick={addPage} sx={{ mr: 2 }}>
        Add Page
      </Button>
      <Button variant="outlined" onClick={handleExpandCollapseAll} sx={{ mr: 2 }}>
        {allExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        {allExpanded ? 'Collapse All' : 'Expand All'}
      </Button>
      <Button variant="contained" color="primary" disabled={loading} onClick={saveForm}>
        {loading ? 'Saving...' : 'Save Form'
        }
      </Button>

      <Divider sx={{ my: 2 }} />

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
              {/* Page Title */}
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Page Title:
              </Typography>
              <input
                style={{ width: '100%', marginBottom: '1rem' }}
                value={page.title}
                onChange={(e) => {
                  setForm((prev) => {
                    const pagesCopy = [...prev.pages];
                    pagesCopy[pIndex] = {
                      ...pagesCopy[pIndex],
                      title: e.target.value,
                    };
                    return { ...prev, pages: pagesCopy };
                  });
                }}
              />

              {/* Page Description with TipTap */}
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Page Description:
              </Typography>
              <TipTapEditor
                value={page.description}
                onChange={(val) => {
                  setForm((prev) => {
                    const pagesCopy = [...prev.pages];
                    pagesCopy[pIndex] = {
                      ...pagesCopy[pIndex],
                      description: val,
                    };
                    return { ...prev, pages: pagesCopy };
                  });
                }}
              />

              {/* Reorder / remove page */}
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

              {/* Unsectioned Questions */}
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
                    onUpdate={(upd) => {
                      setForm((prev) => {
                        const pagesCopy = [...prev.pages];
                        const pageCopy = { ...pagesCopy[pIndex] };
                        const unsecCopy = [...pageCopy.unsectioned];
                        unsecCopy[qIndex] = upd;
                        pageCopy.unsectioned = unsecCopy;
                        pagesCopy[pIndex] = pageCopy;
                        return { ...prev, pages: pagesCopy };
                      });
                    }}
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
                    onToggle={() => {
                      setExpandedSections((prev) => {
                        const newSet = new Set(prev);
                        newSet.has(secKey) ? newSet.delete(secKey) : newSet.add(secKey);
                        return newSet;
                      });
                    }}
                    onMoveUp={() => moveSectionUp(pIndex, sIndex)}
                    onMoveDown={() => moveSectionDown(pIndex, sIndex)}
                    onRemove={() => removeSection(pIndex, sIndex)}
                    onAddQuestion={() => addQuestionToSection(pIndex, sIndex)}
                    onMoveQuestionUp={(qIdx) => moveSectionQuestionUp(pIndex, sIndex, qIdx)}
                    onMoveQuestionDown={(qIdx) => moveSectionQuestionDown(pIndex, sIndex, qIdx)}
                    onRemoveQuestion={(qIdx) => removeSectionQuestion(pIndex, sIndex, qIdx)}
                    onUpdateQuestion={(qIdx, updQ) => {
                      setForm((prev) => {
                        const pagesCopy = [...prev.pages];
                        const pageCopy = { ...pagesCopy[pIndex] };
                        const secs = [...pageCopy.sections];
                        const secObj = { ...secs[sIndex] };
                        const qs = [...secObj.questions];
                        qs[qIdx] = updQ;
                        secObj.questions = qs;
                        secs[sIndex] = secObj;
                        pageCopy.sections = secs;
                        pagesCopy[pIndex] = pageCopy;
                        return { ...prev, pages: pagesCopy };
                      });
                    }}
                    onUpdateTitle={(newTitle) => {
                      setForm((prev) => {
                        const pagesCopy = [...prev.pages];
                        const pageCopy = { ...pagesCopy[pIndex] };
                        const secs = [...pageCopy.sections];
                        secs[sIndex] = { ...secs[sIndex], title: newTitle };
                        pageCopy.sections = secs;
                        pagesCopy[pIndex] = pageCopy;
                        return { ...prev, pages: pagesCopy };
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
