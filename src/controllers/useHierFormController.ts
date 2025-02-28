/**
 * src/controllers/useHierFormController.ts
 *
 * A custom hook that manages the FormSchema state and
 * decides when to POST or PUT.
 */
import { useState } from 'react';
import axios, { AxiosResponse } from 'axios';
// Remove the unused `Section` if you're not using it in this file
import { FormSchema, Page, Question, AdvancedQuestionType } from '../types/formTypes';

export function useHierFormController() {
  // The local form state
  const [form, setForm] = useState<FormSchema>({
    title: 'Untitled Form',
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

  // For async states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transform local => backend shape
  function mapFormToApi(localForm: FormSchema) {
    return {
      title: localForm.title,
      description: localForm.description,
      published: true,
      country: 'USA',
      created_by: 'john_doe',
    };
  }

  // Save => create or update
  async function saveForm() {
    setLoading(true);
    setError(null);

    try {
      const payload = mapFormToApi(form);
      let response: AxiosResponse<any>;

      if (form.id) {
        // We have an ID => PUT /forms/:id
        response = await axios.put(
          `http://127.0.0.1:8000/forms/${form.id}`,
          payload
        );
      } else {
        // No ID => POST /forms
        response = await axios.post(
          'http://127.0.0.1:8000/forms',
          payload
        );
      }

      console.log('Form saved successfully:', response.data);
      alert(`Form saved! ID: ${response.data.id}`);

      // If newly created, store the ID so we do PUT next time
      setForm((prev) => ({
        ...prev,
        id: response.data.id,
      }));
    } catch (err: any) {
      console.error('Error saving form:', err);
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }

  // Example page/section/question helpers
  function addPage() {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const newPage: Page = {
        title: `Page ${newPages.length + 1}`,
        description: '',
        unsectioned: [],
        sections: [],
      };
      newPages.push(newPage);
      return { ...prev, pages: newPages };
    });
  }

  function addSection(pageIndex: number) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      newPages[pageIndex] = {
        ...newPages[pageIndex],
        sections: [
          ...newPages[pageIndex].sections,
          { title: 'New Section', questions: [] },
        ],
      };
      return { ...prev, pages: newPages };
    });
  }

  function addUnsectionedQuestion(pageIndex: number) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const defaultQ: Question = {
        label: '',
        type: 'text' as AdvancedQuestionType,
        required: false,
        placeholder: '',
        helpText: '',
        choices: [],
      };
      newPages[pageIndex] = {
        ...newPages[pageIndex],
        unsectioned: [...newPages[pageIndex].unsectioned, defaultQ],
      };
      return { ...prev, pages: newPages };
    });
  }

  function addQuestionToSection(pageIndex: number, sectionIndex: number) {
    setForm((prev) => {
      const newPages = [...prev.pages];
      const pageCopy = { ...newPages[pageIndex] };
      const sectionsCopy = [...pageCopy.sections];
      sectionsCopy[sectionIndex] = {
        ...sectionsCopy[sectionIndex],
        questions: [
          ...sectionsCopy[sectionIndex].questions,
          {
            label: '',
            type: 'text' as AdvancedQuestionType,
            required: false,
            placeholder: '',
            helpText: '',
            choices: [],
          },
        ],
      };
      pageCopy.sections = sectionsCopy;
      newPages[pageIndex] = pageCopy;
      return { ...prev, pages: newPages };
    });
  }

  return {
    form,
    setForm,
    loading,
    error,
    addPage,
    addSection,
    addUnsectionedQuestion,
    addQuestionToSection,
    saveForm,
  };
}
