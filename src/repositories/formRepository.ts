// src/repositories/formRepository.ts

// Mock calls that simulate server interaction
// Replace these with real API calls (Axios, Fetch, etc.) when connecting to your FastAPI backend.

import { FormSchema } from '../types/formTypes';

export async function saveFormToServer(form: FormSchema): Promise<FormSchema> {
  console.log('Saving form to server (mock):', form);
  // In real usage, you'd do something like:
  // const response = await axios.post('/forms', form);
  // return response.data;
  return Promise.resolve(form);
}

export async function loadFormFromServer(formId: string): Promise<FormSchema> {
  console.log('Loading form from server (mock), formId = ', formId);
  // Real usage:
  // const response = await axios.get(`/forms/${formId}`);
  // return response.data;
  // For now, just mock some example data:
  return Promise.resolve({
    title: 'Sample Loaded Form',
    description: 'An example form loaded from the server',
    questions: [
      {
        label: 'Do you like ice cream?',
        type: 'radio',
        required: true,
        helpText: '',
        placeholder: '',
        choices: ['Yes', 'No'],
      },
      {
        label: 'Which flavors do you like?',
        type: 'checkbox',
        required: false,
        helpText: 'Pick as many as you want',
        placeholder: '',
        choices: ['Chocolate', 'Vanilla', 'Strawberry'],
        skipLogic: {
          referenceQuestionIndex: 0,
          operator: '==',
          value: 'Yes',
          action: 'show',
        },
      },
    ],
  });
}
