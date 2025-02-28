/**
 * src/types/formTypes.ts
 *
 * Defines your hierarchical model:
 * Form -> pages[] -> unsectioned[] + sections[] -> questions[]
 * plus optional `id` if we are editing an existing form.
 */

export type OperatorType = '==' | '!=' | 'contains' | 'not-contains';
export type ActionType = 'show' | 'hide';

export interface SkipLogicCondition {
  referenceQuestionIndex: number;
  operator: OperatorType;
  value: string;
  action: ActionType;
}

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

export interface Question {
  label: string;
  type: AdvancedQuestionType;
  required: boolean;
  placeholder: string;
  helpText: string;
  choices: string[];
  skipLogic?: SkipLogicCondition;
}

export interface Section {
  title: string;
  questions: Question[];
}

export interface Page {
  title: string;
  description: string;
  unsectioned: Question[];
  sections: Section[];
}

// The optional `id` means if present, we do a PUT instead of POST
export interface FormSchema {
  id?: number;
  title: string;
  description: string;
  pages: Page[];
}
