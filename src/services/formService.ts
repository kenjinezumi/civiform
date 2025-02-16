// src/services/formService.ts

import { FormSchema, Question, SkipLogicCondition } from '../types/formTypes';
import { saveFormToServer, loadFormFromServer } from '../repositories/formRepository';

class FormService {
  // Basic validation for forms
  validateForm(form: FormSchema): boolean {
    // e.g., must have a title
    if (!form.title || !form.title.trim()) return false;
    // Additional checks if desired
    return true;
  }

  async saveForm(form: FormSchema): Promise<FormSchema> {
    // Could do deeper validation or transform data here
    const isValid = this.validateForm(form);
    if (!isValid) {
      throw new Error('Form is invalid—must have a title, etc.');
    }
    return await saveFormToServer(form);
  }

  async loadForm(formId: string): Promise<FormSchema> {
    return await loadFormFromServer(formId);
  }

  // Evaluate skip logic for a question, given all answers so far
  // For demonstration, we assume "answers" is an array of strings matching question indices
  shouldShowQuestion(
    questionIndex: number,
    question: Question,
    answers: (string | string[])[], 
    questions: Question[]
  ): boolean {
    if (!question.skipLogic) return true; // no skip logic => always show

    const { referenceQuestionIndex, operator, value, action } = question.skipLogic;
    
    // If reference is out of range, show by default
    if (referenceQuestionIndex < 0 || referenceQuestionIndex >= questions.length) {
      return true;
    }

    const refAnswer = answers[referenceQuestionIndex]; 
    let conditionMatched = false;

    // For multi-select (checkbox), refAnswer might be an array of strings
    if (Array.isArray(refAnswer)) {
      // handle operators
      if (operator === 'contains') {
        conditionMatched = refAnswer.includes(value);
      } else if (operator === 'not-contains') {
        conditionMatched = !refAnswer.includes(value);
      } else if (operator === '==' || operator === '!=') {
        // For multi-select, equality checks are less common, but let's handle
        conditionMatched =
          operator === '==' ? refAnswer.includes(value) : !refAnswer.includes(value);
      }
    } else {
      // For single-value answers (text, radio, etc.)
      if (operator === '==') {
        conditionMatched = refAnswer === value;
      } else if (operator === '!=') {
        conditionMatched = refAnswer !== value;
      } else if (operator === 'contains') {
        conditionMatched = refAnswer?.includes(value);
      } else if (operator === 'not-contains') {
        conditionMatched = !refAnswer?.includes(value);
      }
    }

    // If condition matched, we either show or hide
    if (conditionMatched && action === 'show') return true;
    if (conditionMatched && action === 'hide') return false;
    if (!conditionMatched && action === 'show') return false;
    if (!conditionMatched && action === 'hide') return true;

    return true; // fallback
  }

  // Utility to generate a default question object
  createDefaultQuestion(): Question {
    return {
      label: '',
      type: 'text',
      required: false,
      helpText: '',
      placeholder: '',
      choices: [],
    };
  }
}

export const formService = new FormService();
