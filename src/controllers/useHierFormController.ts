/**
 * src/controllers/useHierFormController.ts
 *
 * A custom hook that manages a multi-page form with:
 *   pages[] -> unsectioned[] + sections[] -> questions[]
 * plus advanced question fields like rating (ratingMin, ratingMax)
 * and optional skipLogic.
 *
 * Also includes create/update logic for the backend via axios.
 */

import { useState } from 'react';
import axios from 'axios';
import {
  FormSchema,
  Page,
  Section,
  Question,
  AdvancedQuestionType,
  SkipLogicCondition,
} from '../types/formTypes';

/** Helper to swap array items (for reorder logic) */
function swap<T>(arr: T[], i: number, j: number) {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

export function useHierFormController() {
  // 1) Local form state: default to a new form with one page
  const [form, setForm] = useState<FormSchema>({
    title: 'My Multi-Page Form',
    description: 'A multi-page form with sections',
    published: false,
    country: '',
    created_by: '',
    pages: [
      {
        title: 'Page 1',
        description: '',
        unsectioned: [],
        sections: [],
      },
    ],
  });

  // Loading/error states for async calls
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //
  // -----------------------------
  // PAGE-LEVEL CRUD / reorder
  // -----------------------------
  function addPage() {
    setForm((prev) => {
      const newPages = [...prev.pages];
      newPages.push({
        title: `Page ${newPages.length + 1}`,
        description: '',
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

  //
  // -----------------------------
  // UNSECTIONED QUESTIONS
  // -----------------------------
  function addUnsectionedQuestion(pageIndex: number) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageObj = { ...newPages[pageIndex] };
      const defaultQ: Question = {
        label: '',
        type: 'text' as AdvancedQuestionType,
        required: false,
        placeholder: '',
        helpText: '',
        choices: [],
      };
      pageObj.unsectioned = [...pageObj.unsectioned, defaultQ];
      newPages[pageIndex] = pageObj;
      return { ...prev, pages: newPages };
    });
  }

  function removeUnsectionedQuestion(pageIndex: number, qIndex: number) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageObj = { ...newPages[pageIndex] };
      const unsec = [...pageObj.unsectioned];
      unsec.splice(qIndex, 1);
      pageObj.unsectioned = unsec;
      newPages[pageIndex] = pageObj;
      return { ...prev, pages: newPages };
    });
  }

  function moveUnsectionedQuestionUp(pageIndex: number, qIndex: number) {
    if (qIndex <= 0) return;
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageObj = { ...newPages[pageIndex] };
      const unsec = [...pageObj.unsectioned];
      swap(unsec, qIndex, qIndex - 1);
      pageObj.unsectioned = unsec;
      newPages[pageIndex] = pageObj;
      return { ...prev, pages: newPages };
    });
  }

  function moveUnsectionedQuestionDown(pageIndex: number, qIndex: number) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageObj = { ...newPages[pageIndex] };
      const unsec = [...pageObj.unsectioned];
      if (qIndex >= unsec.length - 1) return prev;
      swap(unsec, qIndex, qIndex + 1);
      pageObj.unsectioned = unsec;
      newPages[pageIndex] = pageObj;
      return { ...prev, pages: newPages };
    });
  }

  //
  // -----------------------------
  // SECTIONS
  // -----------------------------
  function addSection(pageIndex: number) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageObj = { ...newPages[pageIndex] };
      pageObj.sections = [
        ...pageObj.sections,
        { title: 'New Section', questions: [] },
      ];
      newPages[pageIndex] = pageObj;
      return { ...prev, pages: newPages };
    });
  }

  function removeSection(pageIndex: number, sectionIndex: number) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageObj = { ...newPages[pageIndex] };
      const secs = [...pageObj.sections];
      secs.splice(sectionIndex, 1);
      pageObj.sections = secs;
      newPages[pageIndex] = pageObj;
      return { ...prev, pages: newPages };
    });
  }

  function moveSectionUp(pageIndex: number, sectionIndex: number) {
    if (sectionIndex <= 0) return;
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageObj = { ...newPages[pageIndex] };
      const secs = [...pageObj.sections];
      swap(secs, sectionIndex, sectionIndex - 1);
      pageObj.sections = secs;
      newPages[pageIndex] = pageObj;
      return { ...prev, pages: newPages };
    });
  }

  function moveSectionDown(pageIndex: number, sectionIndex: number) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageObj = { ...newPages[pageIndex] };
      const secs = [...pageObj.sections];
      if (sectionIndex >= secs.length - 1) return prev;
      swap(secs, sectionIndex, sectionIndex + 1);
      pageObj.sections = secs;
      newPages[pageIndex] = pageObj;
      return { ...prev, pages: newPages };
    });
  }

  //
  // -----------------------------
  // QUESTIONS IN A SECTION
  // -----------------------------
  function addQuestionToSection(pageIndex: number, sectionIndex: number) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageObj = { ...newPages[pageIndex] };
      const sectionsCopy = [...pageObj.sections];

      const defaultQ: Question = {
        label: '',
        type: 'text',
        required: false,
        placeholder: '',
        helpText: '',
        choices: [],
      };

      sectionsCopy[sectionIndex] = {
        ...sectionsCopy[sectionIndex],
        questions: [...sectionsCopy[sectionIndex].questions, defaultQ],
      };

      pageObj.sections = sectionsCopy;
      newPages[pageIndex] = pageObj;
      return { ...prev, pages: newPages };
    });
  }

  function removeSectionQuestion(pageIndex: number, sectionIndex: number, qIndex: number) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageObj = { ...newPages[pageIndex] };
      const secs = [...pageObj.sections];
      const secObj = { ...secs[sectionIndex] };
      const qs = [...secObj.questions];
      qs.splice(qIndex, 1);
      secObj.questions = qs;
      secs[sectionIndex] = secObj;
      pageObj.sections = secs;
      newPages[pageIndex] = pageObj;
      return { ...prev, pages: newPages };
    });
  }

  function moveSectionQuestionUp(pageIndex: number, sectionIndex: number, qIndex: number) {
    if (qIndex <= 0) return;
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageObj = { ...newPages[pageIndex] };
      const secs = [...pageObj.sections];
      const secObj = { ...secs[sectionIndex] };
      const qs = [...secObj.questions];
      swap(qs, qIndex, qIndex - 1);
      secObj.questions = qs;
      secs[sectionIndex] = secObj;
      pageObj.sections = secs;
      newPages[pageIndex] = pageObj;
      return { ...prev, pages: newPages };
    });
  }

  function moveSectionQuestionDown(pageIndex: number, sectionIndex: number, qIndex: number) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageObj = { ...newPages[pageIndex] };
      const secs = [...pageObj.sections];
      const secObj = { ...secs[sectionIndex] };
      const qs = [...secObj.questions];
      if (qIndex >= qs.length - 1) return prev;
      swap(qs, qIndex, qIndex + 1);
      secObj.questions = qs;
      secs[sectionIndex] = secObj;
      pageObj.sections = secs;
      newPages[pageIndex] = pageObj;
      return { ...prev, pages: newPages };
    });
  }

  //
  // -------------- ADVANCED --------------
  // e.g. adding a rating question or skipLogic
  //
  function addRatingQuestionToSection(pageIndex: number, sectionIndex: number) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageObj = { ...newPages[pageIndex] };
      const sectionsCopy = [...pageObj.sections];

      const ratingQ: Question = {
        label: 'Rate from 1-5',
        type: 'rating' as AdvancedQuestionType,
        required: false,
        placeholder: '',
        helpText: 'Pick a number',
        choices: [],
        // optional rating fields
        ratingMin: 1,
        ratingMax: 5,
      };

      sectionsCopy[sectionIndex] = {
        ...sectionsCopy[sectionIndex],
        questions: [...sectionsCopy[sectionIndex].questions, ratingQ],
      };

      pageObj.sections = sectionsCopy;
      newPages[pageIndex] = pageObj;
      return { ...prev, pages: newPages };
    });
  }

  // Example: function to set skipLogic on a question
  function setSkipLogicOnQuestion(
    pageIndex: number,
    sectionIndex: number,
    qIndex: number,
    skip: SkipLogicCondition
  ) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageObj = { ...newPages[pageIndex] };
      const secs = [...pageObj.sections];
      const secObj = { ...secs[sectionIndex] };
      const qs = [...secObj.questions];
      const qCopy = { ...qs[qIndex] };

      qCopy.skipLogic = skip;
      qs[qIndex] = qCopy;
      secObj.questions = qs;
      secs[sectionIndex] = secObj;
      pageObj.sections = secs;
      newPages[pageIndex] = pageObj;
      return { ...prev, pages: newPages };
    });
  }

  //
  // -----------------------------
  // SAVE => create or update
  // -----------------------------
  async function saveForm() {
    setLoading(true);
    setError(null);
    try {
      console.log('Sending to server:', form);
      let response;
      if (form.id) {
        // If we have an id => update
        response = await axios.put(`http://127.0.0.1:8000/forms/${form.id}`, form);
      } else {
        // Otherwise => create
        response = await axios.post('http://127.0.0.1:8000/forms', form);
      }
      console.log('Form saved successfully:', response.data);
      // If newly created, store id for next time
      setForm(response.data);
      alert(`Form saved! ID: ${response.data.id}`);
    } catch (err: any) {
      console.error('Error saving form:', err);
      console.error('Response data:', err.response?.data);
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }

  //
  // Return all state + actions
  //
  return {
    form,
    setForm,
    loading,
    error,

    // Page actions
    addPage,
    removePage,
    movePageUp,
    movePageDown,

    // Unsectioned question actions
    addUnsectionedQuestion,
    removeUnsectionedQuestion,
    moveUnsectionedQuestionUp,
    moveUnsectionedQuestionDown,

    // Section actions
    addSection,
    removeSection,
    moveSectionUp,
    moveSectionDown,

    // Section question actions
    addQuestionToSection,
    removeSectionQuestion,
    moveSectionQuestionUp,
    moveSectionQuestionDown,

    // Advanced extras
    addRatingQuestionToSection,
    setSkipLogicOnQuestion,

    // Save
    saveForm,
  };
}
