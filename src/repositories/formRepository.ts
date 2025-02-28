/**
 * src/repositories/formRepository.ts
 *
 * Mock calls that simulate server interaction.
 * Replace these with real Axios/Fetch calls to your FastAPI backend.
 */

import { FormSchema, AdvancedQuestionType } from '../types/formTypes';

/**
 * Mock "save" function that echoes back the form data.
 * In real usage, you'd do something like:
 *   const response = await axios.post('/forms', form);
 *   return response.data;
 */
export async function saveFormToServer(form: FormSchema): Promise<FormSchema> {
  console.log('Saving form to server (mock):', form);

  // For example, pretend the server assigns a new ID if none exists
  const mockId = form.id ?? 999;

  // Return a "saved" object
  return Promise.resolve({
    ...form,
    id: mockId,
  });
}

/**
 * Mock "load" function that returns a sample FormSchema matching your interface.
 * In real usage:
 *   const response = await axios.get(`/forms/${formId}`);
 *   return response.data;
 */
export async function loadFormFromServer(formId: string): Promise<FormSchema> {
  console.log('Loading form from server (mock), formId =', formId);

  // Convert string param to number or default to 123
  const numericId = parseInt(formId, 10) || 123;

  // Return an example that satisfies all required fields of FormSchema
  return Promise.resolve({
    id: numericId,
    title: 'Sample Loaded Form',
    description: 'An example form loaded from the server',
    published: false,         // required by FormSchema
    country: 'USA',           // optional, but we fill it
    created_by: 'MockUser',   // optional, but we fill it
    pages: [
      {
        title: 'Page 1',
        description: 'A sample page description',
        unsectioned: [
          {
            label: 'Top-level Q1',
            type: 'text' as AdvancedQuestionType,
            required: false,
            placeholder: '',
            helpText: '',
            choices: [],
          },
        ],
        sections: [
          {
            title: 'Sample Section A',
            questions: [
              {
                label: 'Section Q1: Example question',
                type: 'radio' as AdvancedQuestionType,
                required: true,
                placeholder: '',
                helpText: '',
                choices: ['Yes', 'No'],
              },
            ],
          },
        ],
      },
      {
        title: 'Page 2',
        description: 'Another page with no unsectioned or sections',
        unsectioned: [],
        sections: [],
      },
    ],
  });
}
