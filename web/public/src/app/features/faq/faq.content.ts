export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: 'What is the difference between an Area, a Process, and a Procedure?',
    answer:
      'An Area groups related processes under one organizational responsibility. A Process represents the broader managed workflow, while a Procedure captures the structured execution details for a published version of that workflow.',
  },
  {
    question: 'What is the difference between Current State and Target State?',
    answer:
      'Current State represents the officially published operational baseline (AS-IS). Target State represents the intended future architecture after controlled improvement (TO-BE).',
  },
  {
    question: 'Why are draft versions not visible here?',
    answer:
      'The public portal is read-only and only exposes controlled published content. Draft, in-review, and approved-but-unpublished versions remain part of the internal governance workflow.',
  },
  {
    question: 'Why is BPMN shown in the portal?',
    answer:
      'BPMN provides a standardized process view that can be consulted without external modeling licenses, which supports accessible process communication across stakeholders.',
  },
  {
    question: 'How should I use search and filters?',
    answer:
      'Use the home-page search for fast lookup, then refine with the catalog filters by area, architecture state, or keyword to narrow the repository.',
  },
];
