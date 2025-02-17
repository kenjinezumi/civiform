/** src/types/formTypes.ts */

/**
 * Allowed question types.
 */
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

/**
 * Skip logic definition for a question.
 */
export interface SkipLogicCondition {
  referenceQuestionIndex: number; // e.g., index in the form's questions array
  operator: '==' | '!=' | 'contains' | 'not-contains';
  value: string;
  action: 'show' | 'hide';
}

/**
 * One question in the form, or a "section" if type='section'.
 */
export interface Question {
  label: string;
  type: AdvancedQuestionType;
  required: boolean;
  placeholder: string;
  helpText: string;
  choices: string[];
  skipLogic?: SkipLogicCondition;
  pageNumber?: number;
}

/**
 * Entire form schema.
 */
export interface FormSchema {
  title: string;
  description: string;
  questions: Question[];
}
