/**
 * src/controllers/useHierFormController.ts
 */
import { useState } from 'react';
import { FormSchema, Page, Question } from '../types/formTypes';

// Example shape, update accordingly
export function useHierFormController() {
  // Initialize a default form for demonstration
  const [form, setForm] = useState<FormSchema>({
    title: 'Untitled Form',
    description: 'Description goes here',
    pages: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  // Example: add a new, empty page
  function addPage() {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      newPages.push({
        title: '',
        description: '',
        unsectioned: [],
        sections: []
      });
      return {
        ...prev,
        pages: newPages
      };
    });
  }

  function addSection(pageIndex: number) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      pageCopy.sections = [
        ...pageCopy.sections,
        { title: '', questions: [] }
      ];
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  function addUnsectionedQuestion(pageIndex: number) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      pageCopy.unsectioned = [
        ...pageCopy.unsectioned,
        {
          label: '',
          type: 'text',
          required: false,
          placeholder: '',
          helpText: '',
          choices: []
        }
      ];
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  function addQuestionToSection(pageIndex: number, sectionIndex: number) {
    setForm((prev: FormSchema) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const sectionsCopy = [...pageCopy.sections];
      const sectionCopy = { ...sectionsCopy[sectionIndex] };

      sectionCopy.questions = [
        ...sectionCopy.questions,
        {
          label: '',
          type: 'text',
          required: false,
          placeholder: '',
          helpText: '',
          choices: []
        }
      ];

      sectionsCopy[sectionIndex] = sectionCopy;
      pageCopy.sections = sectionsCopy;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  async function saveForm() {
    setLoading(true);
    try {
      // Example: do an API call, e.g. axios.post(...)
      console.log('Saving form', form);
      // ...
      // On success, maybe setError(null)
      setError(null);
    } catch (err) {
      // handle or display error
      setError('Save failed');
    }
    setLoading(false);
  }

  // Return everything you need, including setForm
  return {
    form,
    setForm, // <-- CRUCIAL
    loading,
    error,
    addPage,
    addSection,
    addUnsectionedQuestion,
    addQuestionToSection,
    saveForm,
  };
}
