export interface ContentSection {
  title: string;
  paragraphs: string[];
}

export const methodologySections: ContentSection[] = [
  {
    title: 'Repository Structure',
    paragraphs: [
      'The portal organizes the repository through the hierarchy Area, Process, and Procedure.',
      'Each published process view is presented as a controlled consultation artifact for stakeholders.',
    ],
  },
  {
    title: 'Architecture Views',
    paragraphs: [
      'Current State represents the officially published operational baseline and corresponds to AS-IS.',
      'Target State represents the intended future architecture after controlled improvement and corresponds to TO-BE.',
    ],
  },
  {
    title: 'BPMN and Publication',
    paragraphs: [
      'BPMN is used to render the published operational flow directly in the browser.',
      'Only published content is fully consultable in the public portal, while archived versions remain metadata-only for historical traceability.',
    ],
  },
];
