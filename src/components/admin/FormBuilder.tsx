/**
 * src/components/admin/FormBuilder.tsx
 *
 * A final example combining:
 * - Collapsible sections
 * - Collapsible child questions
 * - Expand/Collapse all
 * - Skip logic fields
 * - "Which page?" field
 * - Add question under a section
 */

import React, { useState } from 'react';
import {
  Typography,
  Button,
  Box,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';

import { useTranslation } from 'react-i18next';
import { useFormBuilderController } from '../../controllers/useFormBuilderController';
import { Question, AdvancedQuestionType } from '../../types/formTypes';

interface SectionGroup {
  sectionIndex: number | null;
  sectionQuestion?: Question;
  items: Array<{ question: Question; index: number }>;
}

/** Group questions by last 'section' encountered. */
function groupQuestionsBySection(questions: Question[]): SectionGroup[] {
  const groups: SectionGroup[] = [];
  let currentGroup: SectionGroup = {
    sectionIndex: null,
    sectionQuestion: undefined,
    items: [],
  };

  questions.forEach((q, i) => {
    if (q.type === 'section') {
      // push old group if not empty
      if (currentGroup.sectionIndex !== null || currentGroup.items.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = {
        sectionIndex: i,
        sectionQuestion: q,
        items: [],
      };
    } else {
      currentGroup.items.push({ question: q, index: i });
    }
  });
  // push final group
  if (currentGroup.sectionIndex !== null || currentGroup.items.length > 0) {
    groups.push(currentGroup);
  }
  return groups;
}

function FormBuilder() {
  const { t } = useTranslation();
  const {
    formSchema,
    loading,
    error,
    addQuestion,
    insertQuestionAtIndex,
    updateQuestion,
    removeQuestion,
    moveQuestion,
    updateTitle,
    updateDescription,
    saveForm,
  } = useFormBuilderController();

  // Group by sections
  const groups = groupQuestionsBySection(formSchema.questions);

  // Keep track of "expandedSections" and "expandedQuestions"
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  // Toggle a single section
  const handleToggleSection = (secIndex: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(secIndex)) {
        newSet.delete(secIndex);
      } else {
        newSet.add(secIndex);
      }
      return newSet;
    });
  };

  // Toggle a single child question
  const handleToggleQuestion = (qIndex: number) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(qIndex)) {
        newSet.delete(qIndex);
      } else {
        newSet.add(qIndex);
      }
      return newSet;
    });
  };

  // Expand or Collapse ALL sections + child questions
  const handleExpandCollapseAll = () => {
    setAllExpanded(!allExpanded);
    if (!allExpanded) {
      // expand everything
      const secSet = new Set<number>();
      const qSet = new Set<number>();
      groups.forEach((group) => {
        if (group.sectionIndex !== null) {
          secSet.add(group.sectionIndex);
        }
        group.items.forEach((item) => qSet.add(item.index));
      });
      setExpandedSections(secSet);
      setExpandedQuestions(qSet);
    } else {
      // collapse everything
      setExpandedSections(new Set());
      setExpandedQuestions(new Set());
    }
  };

  // Add a top-level unsectioned question
  const handleAddQuestion = () => {
    addQuestion({
      label: '',
      type: 'text',
      required: false,
      choices: [],
      helpText: '',
      placeholder: '',
    });
  };

  // Add a new "section" at the end
  const handleAddSection = () => {
    addQuestion({
      label: 'New Section',
      type: 'section',
      required: false,
      choices: [],
      helpText: '',
      placeholder: '',
    });
  };

  // Insert a new question after the last item in a group
  const handleAddQuestionInGroup = (group: SectionGroup) => {
    let insertIndex: number;
    if (group.sectionIndex !== null) {
      // has a real section
      if (group.items.length > 0) {
        const lastItemIndex = group.items[group.items.length - 1].index;
        insertIndex = lastItemIndex + 1;
      } else {
        insertIndex = group.sectionIndex + 1; // no child items => after the section
      }
    } else {
      // unsectioned group
      if (group.items.length > 0) {
        const lastIndex = group.items[group.items.length - 1].index;
        insertIndex = lastIndex + 1;
      } else {
        // truly empty
        insertIndex = formSchema.questions.length;
      }
    }

    insertQuestionAtIndex(
      {
        label: '',
        type: 'text',
        required: false,
        helpText: '',
        placeholder: '',
        choices: [],
      },
      insertIndex
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {loading ? 'Loading...' : 'Form Builder with Skip Logic & Sections'}
      </Typography>
      {error && <Typography color="error">{error}</Typography>}

      {/* Title & Desc */}
      <TextField
        label="Form Title"
        value={formSchema.title}
        onChange={(e) => updateTitle(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Form Description"
        value={formSchema.description}
        onChange={(e) => updateDescription(e.target.value)}
        fullWidth
        multiline
        rows={2}
        sx={{ mb: 2 }}
      />

      {/* Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" onClick={handleAddQuestion}>
          Add Unsectioned Question
        </Button>
        <Button variant="outlined" onClick={handleAddSection}>
          Create Section
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleExpandCollapseAll}
          startIcon={allExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ ml: 'auto' }}
        >
          {allExpanded ? 'Collapse All' : 'Expand All'}
        </Button>
      </Box>

      {/* Render grouped sections */}
      {groups.map((group, gIdx) => {
        const { sectionIndex, sectionQuestion, items } = group;
        const groupTitle = sectionQuestion
          ? `Section: ${sectionQuestion.label || '(untitled)'}`
          : 'Unsectioned Questions';

        return (
          <Card key={gIdx} variant="outlined" sx={{ mb: 3 }}>
            <CardHeader
              title={groupTitle}
              action={
                <Button variant="outlined" onClick={() => handleAddQuestionInGroup(group)}>
                  Add Question Here
                </Button>
              }
            />
            <CardContent>
              {/* If there's a real section => collapsible accordion */}
              {sectionQuestion && (
                <Accordion
                  expanded={expandedSections.has(sectionIndex!)}
                  onChange={() => {
                    if (sectionIndex !== null) handleToggleSection(sectionIndex);
                  }}
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

              {/* Child questions */}
              {items.map(({ question, index }) => {
                // If skip logic is missing, we'll default on read
                const skip = question.skipLogic || {
                  referenceQuestionIndex: 0,
                  operator: '==',
                  value: '',
                  action: 'show',
                };

                const isExpanded = expandedQuestions.has(index);

                return (
                  <Accordion
                    key={index}
                    expanded={isExpanded}
                    onChange={() => handleToggleQuestion(index)}
                    sx={{ mb: 2 }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>
                        Q{index + 1} - {question.label || '(untitled)'}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {/* Basic fields */}
                      <TextField
                        label="Question Label"
                        value={question.label}
                        onChange={(e) =>
                          updateQuestion(index, {
                            ...question,
                            label: e.target.value,
                          })
                        }
                        fullWidth
                        sx={{ mb: 2 }}
                      />

                      <TextField
                        type="number"
                        label="Which page?"
                        value={question.pageNumber ?? 1}
                        onChange={(e) => {
                          const pg = parseInt(e.target.value || '1', 10);
                          updateQuestion(index, { ...question, pageNumber: pg });
                        }}
                        fullWidth
                        sx={{ mb: 2 }}
                      />

                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Question Type</InputLabel>
                        <Select
                          label="Question Type"
                          value={question.type}
                          onChange={(e) =>
                            updateQuestion(index, {
                              ...question,
                              type: e.target.value as AdvancedQuestionType,
                            })
                          }
                        >
                          <MenuItem value="text">Text</MenuItem>
                          <MenuItem value="radio">Radio</MenuItem>
                          <MenuItem value="checkbox">Checkbox</MenuItem>
                          <MenuItem value="select">Dropdown</MenuItem>
                          <MenuItem value="rating">Rating (1-5)</MenuItem>
                          {/* etc... */}
                        </Select>
                      </FormControl>

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={question.required}
                            onChange={(e) =>
                              updateQuestion(index, {
                                ...question,
                                required: e.target.checked,
                              })
                            }
                          />
                        }
                        label="Required?"
                      />

                      <Divider sx={{ my: 2 }} />

                      {/* Skip Logic fields */}
                      <Typography variant="subtitle2" gutterBottom>
                        Skip Logic
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <TextField
                          label="Reference Q#"
                          type="number"
                          value={skip.referenceQuestionIndex}
                          onChange={(e) => {
                            const val = parseInt(e.target.value || '0', 10);
                            updateQuestion(index, {
                              ...question,
                              skipLogic: {
                                ...skip,
                                referenceQuestionIndex: val,
                              },
                            });
                          }}
                          sx={{ width: 130 }}
                        />
                        <FormControl sx={{ width: 150 }}>
                          <InputLabel>Operator</InputLabel>
                          <Select
                            label="Operator"
                            value={skip.operator}
                            onChange={(e) => {
                              updateQuestion(index, {
                                ...question,
                                skipLogic: {
                                  ...skip,
                                  operator: e.target.value as '==' | '!=' | 'contains' | 'not-contains',
                                },
                              });
                            }}
                          >
                            <MenuItem value="==">==</MenuItem>
                            <MenuItem value="!=">!=</MenuItem>
                            <MenuItem value="contains">contains</MenuItem>
                            <MenuItem value="not-contains">not-contains</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          label="Value"
                          value={skip.value}
                          onChange={(e) => {
                            updateQuestion(index, {
                              ...question,
                              skipLogic: {
                                ...skip,
                                value: e.target.value,
                              },
                            });
                          }}
                          sx={{ width: 130 }}
                        />
                        <FormControl sx={{ width: 120 }}>
                          <InputLabel>Action</InputLabel>
                          <Select
                            label="Action"
                            value={skip.action}
                            onChange={(e) => {
                              updateQuestion(index, {
                                ...question,
                                skipLogic: {
                                  ...skip,
                                  action: e.target.value as 'show' | 'hide',
                                },
                              });
                            }}
                          >
                            <MenuItem value="show">Show</MenuItem>
                            <MenuItem value="hide">Hide</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Move / Remove question */}
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <IconButton onClick={() => moveQuestion(index, index - 1)}>
                          <ArrowUpwardIcon />
                        </IconButton>
                        <IconButton onClick={() => moveQuestion(index, index + 1)}>
                          <ArrowDownwardIcon />
                        </IconButton>
                        <IconButton onClick={() => removeQuestion(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      <Divider sx={{ my: 3 }} />
      <Button variant="contained" color="primary" onClick={saveForm} disabled={loading}>
        {loading ? 'Saving...' : 'Save Form'}
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleExpandCollapseAll}
        startIcon={allExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        sx={{ ml: 2 }}
      >
        {allExpanded ? 'Collapse All' : 'Expand All'}
      </Button>
    </Box>
  );
}

export default FormBuilder;
