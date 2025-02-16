// src/types/formTypes.ts

export type AdvancedQuestionType =
  | 'text'
  | 'number'
  | 'date'
  | 'time'
  | 'email'
  | 'phone'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'rating'
  | 'file'
  | 'section';

export interface SkipLogicCondition {
  // For demonstration: we let the user pick the index of the question to reference
  referenceQuestionIndex: number;
  operator: '==' | '!=' | 'contains' | 'not-contains';
  value: string; // "Yes", "No", etc.
  action: 'show' | 'hide';
}

export interface Question {
  label: string;
  type: AdvancedQuestionType;
  required: boolean;
  helpText: string;
  placeholder: string;

  // For multiple-choice types (radio, checkbox, select)
  choices: string[];

  // Basic skip logic
  skipLogic?: SkipLogicCondition;
}

export interface FormSchema {
  title: string;
  description?: string;
  questions: Question[];
}
