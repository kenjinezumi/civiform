export type QuestionType = 'text' | 'number' | 'date' | 'select' | 'radio';

export interface Condition {
  questionIndex: number;
  value: string;
  action: 'show' | 'hide';
}

export interface Question {
  label: string;
  type: QuestionType;
  required: boolean;
  placeholder: string;
  helpText: string;
  choices: string[];      // for select/radio
  condition?: Condition;  // skip logic
}

export interface FormSchema {
  title: string;
  questions: Question[];
}
