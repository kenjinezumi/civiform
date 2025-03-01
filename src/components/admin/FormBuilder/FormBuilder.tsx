/**
 * src/components/admin/FormBuilder/FormBuilder.tsx
 *
 * If :formId = "new", we use a blank form from useHierFormController.
 * Otherwise, fetch existing form via GET /forms/:formId.
 *
 * Shows:
 * - Form-level Title & Description
 * - Publish status (Chip)
 * - Publish button (always sets published=true)
 * - Multi-page structure (pages -> sections -> questions)
 */

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import { QuestionAccordion } from "./QuestionAccordion";
import { SectionAccordion } from "./SectionAccordion";

import { useHierFormController } from "../../../controllers/useHierFormController";
import { FormSchema } from "../../../types/formTypes";

/** Helper: swap array items */
function swap<T>(arr: T[], i: number, j: number) {
  const tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

export default function FormBuilder() {
  const { formId } = useParams<{ formId: string }>();

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

  // For expand/collapse logic
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [allExpanded, setAllExpanded] = useState(false);

  // 1) If formId != "new", fetch existing form
  useEffect(() => {
    if (!formId || formId === "new") {
      console.log("Creating a new form => skip fetch");
      return;
    }
    setFetching(true);
    setFetchError(null);

    axios
      .get(`http://127.0.0.1:8000/forms/${formId}`)
      .then((res) => {
        const apiData = res.data;
        console.log("Fetched existing form:", apiData);

        // Build an "inflated" object if needed
        const inflated: FormSchema = {
          id: apiData.id,
          title: apiData.title || "",
          description: apiData.description || "",
          published: apiData.published || false,
          country: apiData.country || "",
          created_by: apiData.created_by || "",
          updated_at: apiData.updated_at || null,
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
        <Typography color="error">{fetchError}</Typography>
      </Box>
    );
  }

  const pages = form?.pages ?? [];

  // 2) Expand/Collapse All
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
      setExpandedPages(new Set());
      setExpandedSections(new Set());
      setExpandedQuestions(new Set());
    }
  };

  /**
   * 3) Publish button => always sets form.published = true,
   * then calls saveForm so it sends { published: true } to backend.
   */
  const handlePublish = async () => {
    const updatedForm = { ...form, published: true }; // Ensure we set published to true
    setForm(updatedForm); // Update state
    console.log("Sending to server:", updatedForm); // Should show published: true
    await saveForm(updatedForm); // Send the correct object to the server
  };

  // 4) Render
  // The heading: use form.title or fallback to "New form"
  const headingTitle = form.title?.trim() ? form.title : "New form";

  return (
    <Box sx={{ p: 3 }}>
      {error && <Typography color="error">{error}</Typography>}

      {/* Title Row with Published Chip */}
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

      {/* If we have an ID, show it. Also updated_at */}
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

      {/* Form-level description => TipTap */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Form Description:
        </Typography>
        <TipTapEditor
          value={form.description}
          onChange={(val) => setForm((prev) => ({ ...prev, description: val }))}
        />
      </Box>

      {/* Title, country, etc. */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
        <TextField
          label="Form Title"
          value={form.title}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, title: e.target.value }))
          }
        />
        <TextField
          label="Country"
          value={form.country ?? ""}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, country: e.target.value }))
          }
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
          onClick={() => saveForm()} // Call saveForm without modifying `published`
        >
          {loading ? "Saving..." : "Save Form"}
        </Button>
        {/* <--- "Publish" always sets published=true ---> */}
        <Button
          variant="outlined"
          color="success"
          onClick={handlePublish}
          disabled={loading}
        >
          Publish
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
                    pagesCopy[pIndex] = {
                      ...pagesCopy[pIndex],
                      title: e.target.value,
                    };
                    return { ...prev, pages: pagesCopy };
                  });
                }}
              />

              {/* Page Description (TipTap) */}
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

              <Button
                onClick={() => addUnsectionedQuestion(pIndex)}
                sx={{ mr: 2 }}
              >
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
                        newSet.has(qKey)
                          ? newSet.delete(qKey)
                          : newSet.add(qKey);
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
                    onMoveDown={() =>
                      moveUnsectionedQuestionDown(pIndex, qIndex)
                    }
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
                        if (newSet.has(secKey)) newSet.delete(secKey);
                        else newSet.add(secKey);
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
                    onMoveQuestionUp={(qIdx) =>
                      moveSectionQuestionUp(pIndex, sIndex, qIdx)
                    }
                    onMoveQuestionDown={(qIdx) =>
                      moveSectionQuestionDown(pIndex, sIndex, qIdx)
                    }
                    onRemoveQuestion={(qIdx) =>
                      removeSectionQuestion(pIndex, sIndex, qIdx)
                    }
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

      <Button
        variant="contained"
        color="primary"
        disabled={loading}
        onClick={() => saveForm()} // Call saveForm without modifying `published`
      >
        {loading ? "Saving..." : "Save Form"}
      </Button>
    </Box>
  );
}
