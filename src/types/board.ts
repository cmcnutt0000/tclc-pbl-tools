export interface AiSuggestion {
  id: string;
  text: string;
  selected: boolean;
}

export interface CellContent {
  id: string;
  label: string;
  subtitle?: string;
  value: string;
  aiSuggestions?: AiSuggestion[];
  linkedStandardIds?: string[];
}

export interface AgendaEntry {
  id: string;
  date: string;
  leads: string;
  eventsContent: string;
  reflection: string;
}

export interface InitialPlanning {
  mainIdea: CellContent;
  standards: CellContent[];
  noticeReflect: CellContent;
  communityPartners: CellContent;
  openingActivity: CellContent;
  additional: CellContent[];
}

export interface DesignThinking {
  drivingQuestion: CellContent;
  empathize: CellContent;
  milestoneEmpathize: CellContent;
  define: CellContent;
  milestoneDefine: CellContent;
  ideate: CellContent;
  milestoneIdeate: CellContent;
  prototypeTest: CellContent;
  milestonePrototypeTest: CellContent;
}

export interface BoardContent {
  initialPlanning: InitialPlanning;
  designThinking: DesignThinking;
  agenda: AgendaEntry[];
}

export interface BoardContext {
  state?: string;
  gradeLevel?: string;
  subjects?: string[];
  location?: string;
}

let cellCounter = 0;
function nextId() {
  cellCounter++;
  return `cell-${cellCounter}-${Date.now()}`;
}

export function createEmptyCell(label: string, subtitle?: string): CellContent {
  return { id: nextId(), label, subtitle, value: "" };
}

export function createEmptyAgendaEntry(): AgendaEntry {
  return {
    id: nextId(),
    date: "",
    leads: "",
    eventsContent: "",
    reflection: "",
  };
}

export function createStandardsCell(subject: string): CellContent {
  return createEmptyCell(
    "Standards: " + subject,
    "Which " + subject + " standards will be addressed?",
  );
}

export function syncStandardsCells(
  currentStandards: CellContent[],
  subjects: string[],
): CellContent[] {
  return subjects.map((subject) => {
    const label = "Standards: " + subject;
    const existing = currentStandards.find((c) => c.label === label);
    return existing || createStandardsCell(subject);
  });
}

export function createEmptyBoardContent(): BoardContent {
  cellCounter = 0;
  return {
    initialPlanning: {
      mainIdea: createEmptyCell(
        "Main Idea / Topic",
        "What is the big idea or theme?",
      ),
      standards: [],
      noticeReflect: createEmptyCell(
        "Notice & Reflect",
        "What should students notice and reflect on?",
      ),
      communityPartners: createEmptyCell(
        "Community Partners",
        "Local organizations, businesses, or individuals who could partner on this project",
      ),
      openingActivity: createEmptyCell(
        "Opening Activity",
        "How will you hook students?",
      ),
      additional: [],
    },
    designThinking: {
      drivingQuestion: createEmptyCell(
        "Driving Question",
        "An open-ended question that guides the project",
      ),
      empathize: createEmptyCell(
        "Empathize",
        "How will students understand the people they are designing for?",
      ),
      milestoneEmpathize: createEmptyCell(
        "Milestone: Empathize",
        "Checkpoint — what should students demonstrate after empathy work?",
      ),
      define: createEmptyCell(
        "Define",
        "What is the specific problem or need?",
      ),
      milestoneDefine: createEmptyCell(
        "Milestone: Define",
        "Checkpoint — how will students show they have defined the problem?",
      ),
      ideate: createEmptyCell(
        "Ideate",
        "How will students brainstorm solutions?",
      ),
      milestoneIdeate: createEmptyCell(
        "Milestone: Ideate",
        "Checkpoint — what evidence of creative thinking will students produce?",
      ),
      prototypeTest: createEmptyCell(
        "Prototype & Test",
        "How will students build and test solutions?",
      ),
      milestonePrototypeTest: createEmptyCell(
        "Milestone: Prototype & Test",
        "Final deliverable and presentation to an authentic audience",
      ),
    },
    agenda: [createEmptyAgendaEntry()],
  };
}
