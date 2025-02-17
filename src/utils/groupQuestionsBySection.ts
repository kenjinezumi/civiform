/**
 * src/utils/groupQuestionsBySection.ts
 */
import { Question } from '../types/formTypes';

export interface SectionGroup {
  sectionIndex: number | null; // index of the 'section' question, or null if unsectioned
  sectionQuestion?: Question;  // the question with type='section'
  items: Array<{ question: Question; index: number }>; // child questions
}

export function groupQuestionsBySection(questions: Question[]): SectionGroup[] {
  const groups: SectionGroup[] = [];
  let currentGroup: SectionGroup = {
    sectionIndex: null,
    sectionQuestion: undefined,
    items: [],
  };

  questions.forEach((q, i) => {
    if (q.type === 'section') {
      // push the old group if non-empty
      if (currentGroup.sectionIndex !== null || currentGroup.items.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = {
        sectionIndex: i,
        sectionQuestion: q,
        items: [],
      };
    } else {
      currentGroup.items.push({ question: q, index: i });
    }
  });

  // push the final group
  if (currentGroup.sectionIndex !== null || currentGroup.items.length > 0) {
    groups.push(currentGroup);
  }
  return groups;
}
