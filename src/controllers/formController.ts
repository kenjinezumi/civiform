// src/controllers/formBuilderController.ts

import { useState, useEffect } from 'react';
import { formService } from '../services/formService';
import { FormSchema, Question } from '../types/formTypes';

/**
 * A custom hook that manages the form schema & editing logic:
 * - Loading/saving from the backend
 * - Adding/updating/removing/reordering questions
 * - Title/description updates
 */
export function useFormBuilderController(formId?: string) {
  const [formSchema, setFormSchema] = useState<FormSchema>({
    title: '',
    description: '',
    questions: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If formId is provided, load existing form
  useEffect(() => {
    if (!formId) return;
    setLoading(true);
    formService
      .loadForm(formId)
      .then((data) => setFormSchema(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [formId]);

  function updateTitle(title: string) {
    setFormSchema((prev) => ({ ...prev, title }));
  }

  function updateDescription(description: string) {
    setFormSchema((prev) => ({ ...prev, description }));
  }

  function addQuestion() {
    const newQuestion = formService.createDefaultQuestion();
    setFormSchema((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  }

  function updateQuestion(index: number, updated: Question) {
    setFormSchema((prev) => {
      const questions = [...prev.questions];
      questions[index] = updated;
      return { ...prev, questions };
    });
  }

  function removeQuestion(index: number) {
    setFormSchema((prev) => {
      const questions = prev.questions.filter((_, i) => i !== index);
      return { ...prev, questions };
    });
  }

  function moveQuestion(fromIndex: number, toIndex: number) {
    setFormSchema((prev) => {
      const questions = [...prev.questions];
      if (toIndex < 0 || toIndex >= questions.length) return prev; // out of range
      const temp = questions[fromIndex];
      questions[fromIndex] = questions[toIndex];
      questions[toIndex] = temp;
      return { ...prev, questions };
    });
  }

  async function saveForm() {
    setLoading(true);
    setError(null);
    try {
      await formService.saveForm(formSchema);
      alert('Form saved successfully!');
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
    updateTitle,
    updateDescription,
    addQuestion,
    updateQuestion,
    removeQuestion,
    moveQuestion,
    saveForm,
    setFormSchema,
  };
}
