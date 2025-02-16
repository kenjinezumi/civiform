import { saveForm, getForm } from '../repositories/formRepository';
import { FormSchema, Question } from '../types/formTypes';

class FormService {
  // A function to validate a form before saving
  validateForm(form: FormSchema): boolean {
    if (!form.title || !form.title.trim()) return false;
    // you can add more advanced checks: duplicate question labels, etc.
    return true;
  }

  async saveFormSchema(form: FormSchema): Promise<FormSchema> {
    // Possibly transform or validate form data
    const isValid = this.validateForm(form);
    if (!isValid) {
      throw new Error('Form is invalid');
    }
    // Then delegate saving to the repository
    const saved = await saveForm(form);
    return saved;
  }

  async fetchFormSchema(formId: number): Promise<FormSchema> {
    const form = await getForm(formId);
    // transform or augment the data if needed
    return form;
  }

  // Example of a helper method: create a default question
  createDefaultQuestion(): Question {
    return {
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      helpText: '',
      choices: [],
    };
  }

  // Example: apply conditional logic or skip rules
  applyConditionalLogic(questions: Question[]): Question[] {
    // modify question array based on skip logic, etc.
    return questions;
  }
}

export const formService = new FormService();
