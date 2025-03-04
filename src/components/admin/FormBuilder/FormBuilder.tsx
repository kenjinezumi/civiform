/**
 * src/components/admin/FormBuilder/FormBuilder.tsx
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
import { QuestionAccordion } from "./QuestionAccordion";
import { SectionAccordion } from "./SectionAccordion";
import { useHierFormController } from "../../../controllers/useHierFormController";
import { FormSchema } from "../../../types/formTypes";

/**
 * FormBuilder:
 *  - Edits or creates a form (pages, sections, questions).
 *  - If formId != "new", fetch existing form, otherwise create from scratch.
 *  - Adds a 'due_date' field.
 */
export default function FormBuilder() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();

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
    saveForm, // normal save function from our custom hook
  } = useHierFormController();

  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // For expand/collapse all
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  // 1) If formId != "new", fetch existing from backend
  useEffect(() => {
    if (!formId || formId === "new") {
      console.log("New form => skip fetch");
      return;
    }
    setFetching(true);
    setFetchError(null);

    axios
      .get(`http://127.0.0.1:8000/forms/${formId}`)
      .then((res) => {
        const apiData = res.data;
        console.log("Fetched existing form:", apiData);
        // Build "inflated" local object
        const inflated: FormSchema = {
          id: apiData.id,
          title: apiData.title || "",
          description: apiData.description || "",
          published: apiData.published || false,
          country: apiData.country || "",
          created_by: apiData.created_by || "",
          updated_at: apiData.updated_at || null,

          // NEW: due_date from backend
          due_date: apiData.due_date || "",

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

  // if fetching
  if (fetching) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Loading form (ID: {formId})...</Typography>
        <CircularProgress sx={{ mt: 2 }} />
      </Box>
    );
  }
  // if error
  if (fetchError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{fetchError}</Typography>
      </Box>
    );
  }

  // safe fallback
  const pages = form.pages ?? [];

  // 2) Expand/Collapse All
  const handleExpandCollapseAll = () => {
    setAllExpanded(!allExpanded);
    if (!allExpanded) {
      const pSet = new Set<number>();
      const sSet = new Set<string>();
      const qSet = new Set<string>();

      pages.forEach((page, pIndex) => {
        pSet.add(pIndex);
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
      });
      setExpandedPages(pSet);
      setExpandedSections(sSet);
      setExpandedQuestions(qSet);
    } else {
      setExpandedPages(new Set());
      setExpandedSections(new Set());
      setExpandedQuestions(new Set());
    }
  };

  // 3) Publish => sets published = true -> save
  const handlePublish = async () => {
    const updatedForm = { ...form, published: true };
    setForm(updatedForm);
    await saveForm(updatedForm);
  };

  // 4) Preview => if no ID, must first create
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

  // The main heading
  const headingTitle = form.title?.trim() ? form.title : "New form";

  return (
    <Box sx={{ p: 3 }}>
      {error && <Typography color="error">{error}</Typography>}

      {/* Heading row w/ published chip */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography variant="h4" sx={{ mb: 0 }}>
          {headingTitle}
        </Typography>
        {form.published ? (
          <Chip label="Published" color="success" />
        ) : (
          <Chip label="Draft" />
        )}
      </Box>

      {/* ID & Updated */}
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

      {/* Description -> TipTap */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Form Description:
        </Typography>
        <TipTapEditor
          value={form.description}
          onChange={(val) => setForm((prev) => ({ ...prev, description: val }))}
        />
      </Box>

      {/* Title, Country, + Due Date */}
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

        {/* NEW: Due Date (type='date' or string) */}
        <TextField
          label="Due Date"
          type="date" 
          // or keep as 'text' if you want
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
          onClick={() => saveForm()} 
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

      {/* Pages */}
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

              {/* Page Description -> TipTap */}
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

              {/* Reorder / remove */}
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
                        if (newSet.has(secKey)) {
                          newSet.delete(secKey);
                        } else {
                          newSet.add(secKey);
                        }
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

      {/* Final Save Button */}
      <Button variant="contained" color="primary" disabled={loading} onClick={() => saveForm(form)}>
        {loading ? "Saving..." : "Save Form"}
      </Button>
    </Box>
  );
}
