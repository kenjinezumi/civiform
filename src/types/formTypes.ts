/**
 * src/types/formTypes.ts
 *
 * Defines the hierarchical model:
 * Form -> pages[] -> unsectioned[] + sections[] -> questions[]
 *
 * The "unsectioned" array is for questions that are on the page
 * but not inside any named section.
 */

export type OperatorType = '==' | '!=' | 'contains' | 'not-contains';
export type ActionType = 'show' | 'hide';

export interface SkipLogicCondition {
  refQuestionId?: number;
  referenceQuestionIndex: number;
  action: 'show' | 'hide';  // or just string
  operator: string;
  value: string;
  targetSectionId?: number;
  targetQuestionId?: number;
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
    type: string;            // e.g. 'text', 'rating', 'radio', etc.
    required: boolean;
    placeholder: string;     // any placeholder text
    helpText: string;        // extra instructions
    choices: string[];       // for dropdown, radio, checkbox
    ratingMin?: number;      // rating scale min (if type='rating')
    ratingMax?: number;      // rating scale max (if type='rating')
    skipLogic?: SkipLogicCondition;  // optional advanced logic
  }

/** A section with multiple questions */
export interface Section {
  title: string;
  questions: Question[];
}

/** A page can have "unsectioned" questions plus multiple named sections. */
export interface Page {
  title: string;
  description: string;
  unsectioned: Question[];
  sections: Section[];
}

/** A form can have multiple pages. */
export interface FormSchema {
  id?: number;         // If present, we do PUT instead of POST
  title: string;
  description: string;
  published: boolean;
  country?: string;
  created_by?: string;
  pages: Page[];
}
