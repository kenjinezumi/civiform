/**
 * src/controllers/useHierFormController.ts
 *
 * A custom hook that manages top-level FormSchema state:
 * - addPage, addSection, addUnsectionedQuestion, addQuestionToSection
 * - plus a saveForm stub
 * - returns { form, setForm, loading, error, ... } to consumer.
 */
import { useState } from 'react';
import { FormSchema, Page, Question } from '../types/formTypes';
import axios from 'axios';

export function useHierFormController() {
  const [form, setForm] = useState<FormSchema>({
    title: 'My Form',
    description: 'A multi-page form',
    pages: [
      {
        title: 'Page 1',
        description: '',
        unsectioned: [],
        sections: [],
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example: add a new page at the end
  function addPage() {
    setForm((prev) => {
      const newPageCount = prev.pages.length + 1;
      const newPage: Page = {
        title: `Page ${newPageCount}`,
        description: '',
        unsectioned: [],
        sections: [],
      };
      return { ...prev, pages: [...prev.pages, newPage] };
    });
  }

  // Add a new section to an existing page
  function addSection(pageIndex: number) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      pageCopy.sections = [
        ...pageCopy.sections,
        { title: 'New Section', questions: [] },
      ];
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  // Add a new unsectioned question to a page
  function addUnsectionedQuestion(pageIndex: number) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };

      const defaultQ: Question = {
        label: '',
        type: 'text',
        required: false,
        placeholder: '',
        helpText: '',
        choices: [],
      };
      pageCopy.unsectioned = [...pageCopy.unsectioned, defaultQ];

      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  // Add a child question to a specific section
  function addQuestionToSection(pageIndex: number, sectionIndex: number) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const sectionsCopy = [...pageCopy.sections];
  
      const defaultQ: Question = {
        label: '',
        type: 'text',
        required: false,
        placeholder: '',
        helpText: '',
        choices: [],
      };
  
      const secObj = { ...sectionsCopy[sectionIndex] };
      secObj.questions = [...secObj.questions, defaultQ];
      sectionsCopy[sectionIndex] = secObj;
      pageCopy.sections = sectionsCopy;
      newPages[pageIndex] = pageCopy;
  
      return { ...prev, pages: newPages };
    });
  }
  
  // A stub for saving the form
  async function saveForm() {
    setLoading(true);
    setError(null);
    try {
      // Adjust your backend endpoint as needed
      const response = await axios.post('http://127.0.0.1:8000/forms/', form);
      console.log('Form saved successfully:', response.data);
      alert(`Form saved! ID: ${response.data.id}`);
    } catch (err: any) {
      console.error('Error saving form:', err);
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    form,
    setForm, // so the consumer can do advanced reorder / remove logic
    loading,
    error,
    addPage,
    addSection,
    addUnsectionedQuestion,
    addQuestionToSection,
    saveForm,
  };
}
