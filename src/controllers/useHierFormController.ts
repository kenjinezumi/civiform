/**
 * src/controllers/useHierFormController.ts
 *
 * Manages a multi-page form (pages -> unsectioned & sections -> questions).
 * Includes advanced skip logic, rating, etc. Also handles create/update via axios.
 */

import { useState } from "react";
import axios from "axios";
import {
  FormSchema,
  Page,
  Section,
  Question,
  AdvancedQuestionType,
  SkipLogicCondition,
} from "../types/formTypes";

/** Helper to swap array items (for reorder logic) */
function swap<T>(arr: T[], i: number, j: number) {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

export function useHierFormController() {
  // Local form state: default to a new form with one blank page
  const [form, setForm] = useState<FormSchema>({
    title: "My Multi-Page Form",
    description: "A multi-page form with sections",
    published: false,
    country: "",
    created_by: "",
    updated_at: null,
    pages: [
      {
        title: "Page 1",
        description: "",
        unsectioned: [],
        sections: [],
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ----------------------------------
  // PAGE-LEVEL CRUD
  // ----------------------------------
  function addPage() {
    setForm((prev) => {
      const newPages = [...prev.pages];
      newPages.push({
        title: `Page ${newPages.length + 1}`,
        description: "",
        unsectioned: [],
        sections: [],
      });
      return { ...prev, pages: newPages };
    });
  }

  function removePage(pageIndex: number) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      newPages.splice(pageIndex, 1);
      return { ...prev, pages: newPages };
    });
  }

  function movePageUp(pageIndex: number) {
    if (pageIndex <= 0) return;
    setForm((prev) => {
      const pagesCopy = [...prev.pages];
      swap(pagesCopy, pageIndex, pageIndex - 1);
      return { ...prev, pages: pagesCopy };
    });
  }

  function movePageDown(pageIndex: number) {
    setForm((prev) => {
      const pagesCopy = [...prev.pages];
      if (pageIndex >= pagesCopy.length - 1) return prev;
      swap(pagesCopy, pageIndex, pageIndex + 1);
      return { ...prev, pages: pagesCopy };
    });
  }

  // ----------------------------------
  // UNSECTIONED QUESTIONS
  // ----------------------------------
  function addUnsectionedQuestion(pageIndex: number) {
    setForm((prev) => {
      const pagesCopy = [...prev.pages];
      const pageObj = { ...pagesCopy[pageIndex] };

      const defaultQ: Question = {
        label: "",
        type: "text",
        required: false,
        placeholder: "",
        helpText: "",
        choices: [],
      };

      pageObj.unsectioned = [...pageObj.unsectioned, defaultQ];
      pagesCopy[pageIndex] = pageObj;
      return { ...prev, pages: pagesCopy };
    });
  }

  function removeUnsectionedQuestion(pageIndex: number, qIndex: number) {
    setForm((prev) => {
      const pagesCopy = [...prev.pages];
      const pageObj = { ...pagesCopy[pageIndex] };
      const unsec = [...pageObj.unsectioned];
      unsec.splice(qIndex, 1);
      pageObj.unsectioned = unsec;
      pagesCopy[pageIndex] = pageObj;
      return { ...prev, pages: pagesCopy };
    });
  }

  function moveUnsectionedQuestionUp(pageIndex: number, qIndex: number) {
    if (qIndex <= 0) return;
    setForm((prev) => {
      const pagesCopy = [...prev.pages];
      const pageObj = { ...pagesCopy[pageIndex] };
      const unsec = [...pageObj.unsectioned];
      swap(unsec, qIndex, qIndex - 1);
      pageObj.unsectioned = unsec;
      pagesCopy[pageIndex] = pageObj;
      return { ...prev, pages: pagesCopy };
    });
  }

  function moveUnsectionedQuestionDown(pageIndex: number, qIndex: number) {
    setForm((prev) => {
      const pagesCopy = [...prev.pages];
      const pageObj = { ...pagesCopy[pageIndex] };
      const unsec = [...pageObj.unsectioned];
      if (qIndex >= unsec.length - 1) return prev;
      swap(unsec, qIndex, qIndex + 1);
      pageObj.unsectioned = unsec;
      pagesCopy[pageIndex] = pageObj;
      return { ...prev, pages: pagesCopy };
    });
  }

  // ----------------------------------
  // SECTIONS
  // ----------------------------------
  function addSection(pageIndex: number) {
    setForm((prev) => {
      const pagesCopy = [...prev.pages];
      const pageObj = { ...pagesCopy[pageIndex] };
      pageObj.sections = [
        ...pageObj.sections,
        { title: "New Section", questions: [] },
      ];
      pagesCopy[pageIndex] = pageObj;
      return { ...prev, pages: pagesCopy };
    });
  }

  function removeSection(pageIndex: number, sectionIndex: number) {
    setForm((prev) => {
      const pagesCopy = [...prev.pages];
      const pageObj = { ...pagesCopy[pageIndex] };
      const secs = [...pageObj.sections];
      secs.splice(sectionIndex, 1);
      pageObj.sections = secs;
      pagesCopy[pageIndex] = pageObj;
      return { ...prev, pages: pagesCopy };
    });
  }

  function moveSectionUp(pageIndex: number, sectionIndex: number) {
    if (sectionIndex <= 0) return;
    setForm((prev) => {
      const pagesCopy = [...prev.pages];
      const pageObj = { ...pagesCopy[pageIndex] };
      const secs = [...pageObj.sections];
      swap(secs, sectionIndex, sectionIndex - 1);
      pageObj.sections = secs;
      pagesCopy[pageIndex] = pageObj;
      return { ...prev, pages: pagesCopy };
    });
  }

  function moveSectionDown(pageIndex: number, sectionIndex: number) {
    setForm((prev) => {
      const pagesCopy = [...prev.pages];
      const pageObj = { ...pagesCopy[pageIndex] };
      const secs = [...pageObj.sections];
      if (sectionIndex >= secs.length - 1) return prev;
      swap(secs, sectionIndex, sectionIndex + 1);
      pageObj.sections = secs;
      pagesCopy[pageIndex] = pageObj;
      return { ...prev, pages: pagesCopy };
    });
  }

  // ----------------------------------
  // QUESTIONS IN A SECTION
  // ----------------------------------
  function addQuestionToSection(pageIndex: number, sectionIndex: number) {
    setForm((prev) => {
      const pagesCopy = [...prev.pages];
      const pageObj = { ...pagesCopy[pageIndex] };
      const secs = [...pageObj.sections];

      const defaultQ: Question = {
        label: "",
        type: "text",
        required: false,
        placeholder: "",
        helpText: "",
        choices: [],
        ratingMin: undefined,
        ratingMax: undefined,
      };

      secs[sectionIndex] = {
        ...secs[sectionIndex],
        questions: [...secs[sectionIndex].questions, defaultQ],
      };
      pageObj.sections = secs;
      pagesCopy[pageIndex] = pageObj;
      return { ...prev, pages: pagesCopy };
    });
  }

  function removeSectionQuestion(
    pageIndex: number,
    sectionIndex: number,
    qIndex: number
  ) {
    setForm((prev) => {
      const pagesCopy = [...prev.pages];
      const pageObj = { ...pagesCopy[pageIndex] };
      const secs = [...pageObj.sections];
      const secObj = { ...secs[sectionIndex] };
      const qs = [...secObj.questions];
      qs.splice(qIndex, 1);
      secObj.questions = qs;
      secs[sectionIndex] = secObj;
      pageObj.sections = secs;
      pagesCopy[pageIndex] = pageObj;
      return { ...prev, pages: pagesCopy };
    });
  }

  function moveSectionQuestionUp(pageIndex: number, sectionIndex: number, qIndex: number) {
    if (qIndex <= 0) return;
    setForm((prev) => {
      const pagesCopy = [...prev.pages];
      const pageObj = { ...pagesCopy[pageIndex] };
      const secs = [...pageObj.sections];
      const secObj = { ...secs[sectionIndex] };
      const qs = [...secObj.questions];
      swap(qs, qIndex, qIndex - 1);
      secObj.questions = qs;
      secs[sectionIndex] = secObj;
      pageObj.sections = secs;
      pagesCopy[pageIndex] = pageObj;
      return { ...prev, pages: pagesCopy };
    });
  }

  function moveSectionQuestionDown(pageIndex: number, sectionIndex: number, qIndex: number) {
    setForm((prev) => {
      const pagesCopy = [...prev.pages];
      const pageObj = { ...pagesCopy[pageIndex] };
      const secs = [...pageObj.sections];
      const secObj = { ...secs[sectionIndex] };
      const qs = [...secObj.questions];
      if (qIndex >= qs.length - 1) return prev;
      swap(qs, qIndex, qIndex + 1);
      secObj.questions = qs;
      secs[sectionIndex] = secObj;
      pageObj.sections = secs;
      pagesCopy[pageIndex] = pageObj;
      return { ...prev, pages: pagesCopy };
    });
  }

  // ----------------------------------
  // ADVANCED: e.g. rating, skip logic
  // ----------------------------------
  function addRatingQuestionToSection(pageIndex: number, sectionIndex: number) {
    setForm((prev) => {
      const pagesCopy = [...prev.pages];
      const pageObj = { ...pagesCopy[pageIndex] };
      const secs = [...pageObj.sections];

      const ratingQ: Question = {
        label: "Rate from 1-5",
        type: "rating",
        required: false,
        placeholder: "",
        helpText: "Pick a number",
        choices: [],
        ratingMin: 1,
        ratingMax: 5,
      };

      secs[sectionIndex] = {
        ...secs[sectionIndex],
        questions: [...secs[sectionIndex].questions, ratingQ],
      };
      pageObj.sections = secs;
      pagesCopy[pageIndex] = pageObj;
      return { ...prev, pages: pagesCopy };
    });
  }

  function setSkipLogicOnQuestion(
    pageIndex: number,
    sectionIndex: number,
    qIndex: number,
    skip: SkipLogicCondition
  ) {
    setForm((prev) => {
      const pagesCopy = [...prev.pages];
      const pageObj = { ...pagesCopy[pageIndex] };
      const secs = [...pageObj.sections];
      const secObj = { ...secs[sectionIndex] };
      const qs = [...secObj.questions];

      const qCopy = { ...qs[qIndex] };
      qCopy.skipLogic = skip;
      qs[qIndex] = qCopy;

      secObj.questions = qs;
      secs[sectionIndex] = secObj;
      pageObj.sections = secs;
      pagesCopy[pageIndex] = pageObj;
      return { ...prev, pages: pagesCopy };
    });
  }

  // ----------------------------------
  // SAVE => create or update
  // If user passes an updatedForm, we send that; else we use local `form`.
  // This logs the payload for debugging.
  async function saveForm(updatedForm?: FormSchema) {
    setLoading(true);
    setError(null);

    const payload = updatedForm ?? form; // use override if provided
    console.log("Saving form to server =>", payload);

    try {
      let resp;
      if (payload.id) {
        // PUT /forms/:id
        resp = await axios.put(
          `http://127.0.0.1:8000/forms/${payload.id}`,
          payload
        );
      } else {
        // POST /forms
        resp = await axios.post("http://127.0.0.1:8000/forms", payload);
      }

      console.log("Saved OK =>", resp.data);
      setForm(resp.data); // update local state with server result
      alert(`Form saved! ID: ${resp.data.id}`);

      // Return the updated form data if we need to chain
      return resp.data as FormSchema;
    } catch (err: any) {
      console.error("Error saving form:", err);
      setError(err.response?.data?.detail || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
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
    // Sections
    addSection,
    removeSection,
    moveSectionUp,
    moveSectionDown,
    // Section questions
    addQuestionToSection,
    removeSectionQuestion,
    moveSectionQuestionUp,
    moveSectionQuestionDown,
    // Advanced
    addRatingQuestionToSection,
    setSkipLogicOnQuestion,
    // Save
    saveForm,
  };
}
