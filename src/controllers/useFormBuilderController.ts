/** src/controllers/useFormBuilderController.ts */

import { useState } from 'react';
import { FormSchema, Question } from '../types/formTypes';

export function useFormBuilderController() {
  const [formSchema, setFormSchema] = useState<FormSchema>({
    title: '',
    description: '',
    questions: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Add a question at the end. Merge partial fields with defaults.
   */
  function addQuestion(custom?: Partial<Question>) {
    setFormSchema((prev) => {
      const defaultQ: Question = {
        label: '',
        type: 'text',
        required: false,
        placeholder: '',
        helpText: '',
        choices: [],
      };
      const newQ: Question = { ...defaultQ, ...custom };
      return { ...prev, questions: [...prev.questions, newQ] };
    });
  }

  /**
   * Insert a question at a specific index (e.g., under a section).
   */
  function insertQuestionAtIndex(custom: Partial<Question>, index: number) {
    setFormSchema((prev) => {
      const defaultQ: Question = {
        label: '',
        type: 'text',
        required: false,
        placeholder: '',
        helpText: '',
        choices: [],
      };
      const newQ: Question = { ...defaultQ, ...custom };
      const newQuestions = [...prev.questions];
      newQuestions.splice(index, 0, newQ);
      return { ...prev, questions: newQuestions };
    });
  }

  function updateTitle(title: string) {
    setFormSchema((prev) => ({ ...prev, title }));
  }

  function updateDescription(desc: string) {
    setFormSchema((prev) => ({ ...prev, description: desc }));
  }

  function updateQuestion(index: number, updated: Question) {
    setFormSchema((prev) => {
      const newQs = [...prev.questions];
      newQs[index] = updated;
      return { ...prev, questions: newQs };
    });
  }

  function removeQuestion(index: number) {
    setFormSchema((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  }

  function moveQuestion(fromIndex: number, toIndex: number) {
    setFormSchema((prev) => {
      const qs = [...prev.questions];
      if (toIndex < 0 || toIndex >= qs.length) return prev; // out of range
      const temp = qs[fromIndex];
      qs[fromIndex] = qs[toIndex];
      qs[toIndex] = temp;
      return { ...prev, questions: qs };
    });
  }

  async function saveForm() {
    try {
      setLoading(true);
      console.log('Saving form schema:', formSchema);
      // real API call if needed
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    formSchema,
    loading,
    error,
    addQuestion,
    insertQuestionAtIndex,
    updateTitle,
    updateDescription,
    updateQuestion,
    removeQuestion,
    moveQuestion,
    saveForm,
  };
}
