import axios from 'axios';
import { FormSchema } from '../types/formTypes';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

// Save a new form to the backend
export async function saveForm(form: FormSchema) {
  const response = await api.post('/forms', form);
  return response.data;
}

// Fetch an existing form (by ID)
export async function getForm(formId: number) {
  const response = await api.get(`/forms/${formId}`);
  return response.data;
}

// ... etc. for deleteForm, updateForm, listForms
