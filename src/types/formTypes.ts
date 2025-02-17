/**
 * src/types/formTypes.ts
 *
 * Hierarchical model:
 * - FormSchema -> pages[] -> unsectioned[] + sections[] -> questions[]
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
  | 'section'; // We'll ensure we never add 'section' inside a real section's questions.

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
  questions: Question[]; // child questions
}

export interface Page {
  title: string;
  description: string;
  unsectioned: Question[]; // questions not inside a section
  sections: Section[];
}

export interface FormSchema {
  title: string;
  description: string;
  pages: Page[];
}
