/**
 * src/components/admin/FormBuilder/FormBuilder.tsx
 *
 * A comprehensive form builder:
 *  - If :formId != "new", fetch an existing form from /forms/:formId, else create blank.
 *  - Manages pages -> unsectioned questions + sections -> questions.
 *  - Includes advanced question logic (rating, skip logic placeholders).
 *  - Has a 'due_date' field on the top-level form.
 *  - Has "publish," "preview," "expand/collapse all," and normal "save" features.
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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
  Chip,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";

import { TipTapEditor } from "../../shared/TipTapEditor";
import { QuestionAccordion } from "./QuestionAccordion";    // assumes advanced question logic
import { SectionAccordion } from "./SectionAccordion";       // handles multiple questions
import { useHierFormController } from "../../../controllers/useHierFormController";
import { FormSchema } from "../../../types/formTypes";

// A fallback for your API base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

export default function FormBuilder() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();

  // Get states & actions from your custom hook
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
    // Section question-level
    addQuestionToSection,
    removeSectionQuestion,
    moveSectionQuestionUp,
    moveSectionQuestionDown,
    // Save function
    saveForm,
  } = useHierFormController();

  // For initial fetch if formId != "new"
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Expand/collapse local states
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  // 1) On mount, if we have a formId != "new", fetch it
  useEffect(() => {
    if (!formId || formId === "new") {
      console.log("New form => no fetch needed");
      return;
    }
    setFetching(true);
    setFetchError(null);

    axios
      .get(`${API_BASE_URL}/forms/${formId}`)
      .then((res) => {
        const apiData = res.data;
        console.log("Fetched existing form:", apiData);

        // Construct the local FormSchema
        const inflated: FormSchema = {
          id: apiData.id,
          title: apiData.title || "",
          description: apiData.description || "",
          published: apiData.published || false,
          country: apiData.country || "",
          created_by: apiData.created_by || "",
          updated_at: apiData.updated_at || null,
          // Add a due_date if returned by your backend
          due_date: apiData.due_date || "",
          // If your backend already returns pages with nested structure, great.
          // Otherwise you might need to transform them here.
          pages: apiData.pages ?? [
            {
              title: "Page 1",
              description: "",
              unsectioned: [],
              sections: [],
            },
          ],
        };
        setForm(inflated);
      })
      .catch((err) => {
        console.error("Error fetching form:", err);
        setFetchError(err.response?.data?.detail || err.message);
      })
      .finally(() => {
        setFetching(false);
      });
  }, [formId, setForm]);

  // If still fetching
  if (fetching) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Loading form (ID: {formId}) ...</Typography>
        <CircularProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  // If fetch error
  if (fetchError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error: {fetchError}</Typography>
      </Box>
    );
  }

  // Safeguard pages array
  const pages = form.pages ?? [];

  // 2) Expand/Collapse All
  const handleExpandCollapseAll = () => {
    setAllExpanded(!allExpanded);
    if (!allExpanded) {
      const newPageSet = new Set<number>();
      const newSecSet = new Set<string>();
      const newQSet = new Set<string>();

      pages.forEach((page, pIndex) => {
        newPageSet.add(pIndex);
        // unsectioned
        page.unsectioned.forEach((_, qIndex) => {
          newQSet.add(`p${pIndex}-Uq${qIndex}`);
        });
        // sections
        page.sections.forEach((sec, sIndex) => {
          const secKey = `p${pIndex}-s${sIndex}`;
          newSecSet.add(secKey);
          sec.questions.forEach((_, qqIndex) => {
            newQSet.add(`p${pIndex}-s${sIndex}-q${qqIndex}`);
          });
        });
      });

      setExpandedPages(newPageSet);
      setExpandedSections(newSecSet);
      setExpandedQuestions(newQSet);
    } else {
      setExpandedPages(new Set());
      setExpandedSections(new Set());
      setExpandedQuestions(new Set());
    }
  };

  // 3) Publish => sets published = true => save
  const handlePublish = async () => {
    const updatedForm = { ...form, published: true };
    setForm(updatedForm);
    await saveForm(updatedForm);
  };

  // 4) Preview => if no ID, create first, then go
  const handlePreview = async () => {
    if (!form.id) {
      const newForm = await saveForm(form);
      if (newForm?.id) {
        navigate(`/forms/preview/${newForm.id}`);
      }
    } else {
      navigate(`/forms/preview/${form.id}`);
    }
  };

  // Main heading
  const headingTitle = form.title?.trim() ? form.title : "New form";

  return (
    <Box sx={{ p: 3 }}>
      {error && <Typography color="error">{error}</Typography>}

      {/* Heading row & published chip */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography variant="h4" sx={{ mb: 0 }}>
          {headingTitle}
        </Typography>
        {form.published ? (
          <Chip label="Published" color="success" />
        ) : (
          <Chip label="Draft" color="default" />
        )}
      </Box>

      {/* ID & updated */}
      {form.id && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          ID: {form.id}
        </Typography>
      )}
      {form.updated_at && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          Last Updated: {new Date(form.updated_at).toLocaleString()}
        </Typography>
      )}

      {/* Top-level fields */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Form Description:
        </Typography>
        <TipTapEditor
          value={form.description}
          onChange={(val) => setForm((prev) => ({ ...prev, description: val }))}
        />
      </Box>

      {/* Title, Country, Due date, etc */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
        <TextField
          label="Form Title"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
        />
        <TextField
          label="Country"
          value={form.country ?? ""}
          onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
        />
        {/* The due_date if your backend supports it */}
        <TextField
          label="Due Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={form.due_date ?? ""}
          onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))}
        />
      </Box>

      {/* Buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button variant="contained" onClick={addPage}>
          Add Page
        </Button>
        <Button variant="outlined" onClick={handleExpandCollapseAll}>
          {allExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          {allExpanded ? "Collapse All" : "Expand All"}
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={loading}
          onClick={() => saveForm()} // normal save of current form state
        >
          {loading ? "Saving..." : "Save Form"}
        </Button>
        <Button variant="outlined" color="success" disabled={loading} onClick={handlePublish}>
          Publish
        </Button>
        <Button variant="outlined" color="secondary" disabled={loading} onClick={handlePreview}>
          Preview
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Render each page in an accordion */}
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
                if (newSet.has(pIndex)) newSet.delete(pIndex);
                else newSet.add(pIndex);
                return newSet;
              });
            }}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                Page {pIndex + 1}: {page.title || "(untitled)"}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              {/* Page Title */}
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Page Title:
              </Typography>
              <input
                style={{ width: "100%", marginBottom: "1rem" }}
                value={page.title}
                onChange={(e) => {
                  setForm((prev) => {
                    const pagesCopy = [...prev.pages];
                    pagesCopy[pIndex] = { ...pagesCopy[pIndex], title: e.target.value };
                    return { ...prev, pages: pagesCopy };
                  });
                }}
              />

              {/* Page Description -> TipTap */}
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

              {/* Reorder / remove page */}
              <Box sx={{ display: "flex", gap: 1, my: 2 }}>
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

              {/* Add unsectioned question or new section */}
              <Button onClick={() => addUnsectionedQuestion(pIndex)} sx={{ mr: 2 }}>
                Add Unsectioned Q
              </Button>
              <Button onClick={() => addSection(pIndex)}>Add Section</Button>

              <Divider sx={{ my: 2 }} />

              {/* Unsectioned Q's */}
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
                      // update that question in unsectioned
                      setForm((prev) => {
                        const pagesCopy = [...prev.pages];
                        const pageCopy = { ...pagesCopy[pIndex] };
                        const unsec = [...pageCopy.unsectioned];
                        unsec[qIndex] = updatedQ;
                        pageCopy.unsectioned = unsec;
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

              {/* Sections (each with multiple questions) */}
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
                        if (newSet.has(secKey)) newSet.delete(secKey);
                        else newSet.add(secKey);
                        return newSet;
                      });
                    }}
                    onMoveUp={() => moveSectionUp(pIndex, sIndex)}
                    onMoveDown={() => moveSectionDown(pIndex, sIndex)}
                    onRemove={() => removeSection(pIndex, sIndex)}
                    onAddQuestion={() => addQuestionToSection(pIndex, sIndex)}
                    onMoveQuestionUp={(qIndex) => moveSectionQuestionUp(pIndex, sIndex, qIndex)}
                    onMoveQuestionDown={(qIndex) => moveSectionQuestionDown(pIndex, sIndex, qIndex)}
                    onRemoveQuestion={(qIndex) => removeSectionQuestion(pIndex, sIndex, qIndex)}
                    onUpdateQuestion={(qIndex, updatedQ) => {
                      // update that question in the section
                      setForm((prev) => {
                        const pagesCopy = [...prev.pages];
                        const pageCopy = { ...pagesCopy[pIndex] };
                        const secs = [...pageCopy.sections];
                        const secObj = { ...secs[sIndex] };
                        const qs = [...secObj.questions];
                        qs[qIndex] = updatedQ;
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
                        if (newSet.has(qKey)) newSet.delete(qKey);
                        else newSet.add(qKey);
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

      {/* Final Save */}
      <Button
        variant="contained"
        color="primary"
        disabled={loading}
        onClick={() => saveForm(form)}
      >
        {loading ? "Saving..." : "Save Form"}
      </Button>
    </Box>
  );
}
