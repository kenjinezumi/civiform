/**
 * src/types/formTypes.ts
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

export interface FormSchema {
  title: string;
  description: string;
  pages: Page[];
}
