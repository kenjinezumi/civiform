/**
 * src/controllers/useHierFormController.ts
 *
 * A custom hook that manages:
 * Form -> pages[] -> each page has unsectioned[] + sections[] -> each section has questions[].
 * No references to old 'questions' or 'pageNumber' or 'index'.
 */
import { useState } from 'react';
import { FormSchema, Page, Section, Question } from '../types/formTypes';

export function useHierFormController() {
  const [form, setForm] = useState<FormSchema>({
    title: '',
    description: '',
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

  /** Add a new page */
  function addPage() {
    setForm(prev => {
      const pageCount = prev.pages.length + 1;
      const newPage: Page = {
        title: `Page ${pageCount}`,
        description: '',
        unsectioned: [],
        sections: [],
      };
      return { ...prev, pages: [...prev.pages, newPage] };
    });
  }

  /** Add a section to a certain page */
  function addSection(pageIndex: number) {
    setForm(prev => {
      const newPages = [...prev.pages];
      const page = { ...newPages[pageIndex] };
      page.sections = [...page.sections, { title: 'New Section', questions: [] }];
      newPages[pageIndex] = page;
      return { ...prev, pages: newPages };
    });
  }

  /** Add an unsectioned question to a page */
  function addUnsectionedQuestion(pageIndex: number) {
    setForm(prev => {
      const newQ: Question = {
        label: '',
        type: 'text',
        required: false,
        placeholder: '',
        helpText: '',
        choices: [],
      };
      const newPages = [...prev.pages];
      newPages[pageIndex] = {
        ...newPages[pageIndex],
        unsectioned: [...newPages[pageIndex].unsectioned, newQ],
      };
      return { ...prev, pages: newPages };
    });
  }

  /** Add a child question inside a section (disallow 'section') */
  function addQuestionToSection(pageIndex: number, sectionIndex: number) {
    setForm(prev => {
      const newQ: Question = {
        label: '',
        type: 'text',
        required: false,
        placeholder: '',
        helpText: '',
        choices: [],
      };
      const newPages = [...prev.pages];
      const sec = { ...newPages[pageIndex].sections[sectionIndex] };
      sec.questions = [...sec.questions, newQ];
      newPages[pageIndex].sections[sectionIndex] = sec;
      return { ...prev, pages: newPages };
    });
  }

  async function saveForm() {
    try {
      setLoading(true);
      console.log('Saving form data:', form);
      // real API call if needed
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    form,
    loading,
    error,
    addPage,
    addSection,
    addUnsectionedQuestion,
    addQuestionToSection,
    saveForm,
  };
}
