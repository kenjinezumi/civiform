import { useState, useEffect } from 'react';
import { formService } from '../services/formService';
import { FormSchema, Question } from '../types/formTypes';

/**
 * A custom hook that the FormBuilder component can use.
 * It handles all logic: loading an existing form, adding/removing questions, etc.
 */
export function useFormBuilderController(formId?: number) {
  const [formSchema, setFormSchema] = useState<FormSchema>({
    title: '',
    questions: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optional: if formId is provided, we fetch an existing form
  useEffect(() => {
    if (!formId) return;
    setLoading(true);
    formService
      .fetchFormSchema(formId)
      .then((data) => setFormSchema(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [formId]);

  // Add a new question (using the service’s default question if you like)
  function addQuestion() {
    const newQuestion = formService.createDefaultQuestion();
    setFormSchema((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  }

  // Update a question at a specific index
  function updateQuestion(index: number, question: Question) {
    setFormSchema((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = question;
      return { ...prev, questions: updatedQuestions };
    });
  }

  // Remove a question
  function removeQuestion(index: number) {
    setFormSchema((prev) => {
      const updatedQuestions = prev.questions.filter((_, i) => i !== index);
      return { ...prev, questions: updatedQuestions };
    });
  }

  // Save the form (delegates to formService)
  async function saveForm(): Promise<void> {
    try {
      setLoading(true);
      await formService.saveFormSchema(formSchema);
      alert('Form saved successfully!');
    } catch (err: any) {
      alert(`Error saving form: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return {
    formSchema,
    loading,
    error,
    addQuestion,
    updateQuestion,
    removeQuestion,
    saveForm,
    setFormSchema, // sometimes you want direct access
  };
}
