// Prebuilt EdTech discovery journeys, authored in the presentation / "infographic"
// style: a Title banner on top, a cast row (Persona + Actors), then horizontal
// Phase bands holding numbered Action step cards (each with a "⚙️ System" line),
// Decision diamonds with Yes/No branches, Pain/Opportunity markers, Note callouts,
// and a Call-to-Action end node. The first template ("All Elements Showcase")
// exercises every element type, including an Application-Journey screen lane.
//
// Each template uses template-local ids that are remapped to fresh ids on add.

// ----- layout grid -----------------------------------------------------------
const W = 1320;            // banner / phase-band width
const BAND_H = 260;        // phase-band height
const GAP = 22;            // gap between bands
const BANDS_START = 330;   // first band top (leaves room for banner + cast row)

const bandY = (i) => BANDS_START + i * (BAND_H + GAP);
const SX0 = 350;           // first step column x (after the phase label region)
const SPITCH = 230;        // pitch between step columns
const sx = (c) => SX0 + c * SPITCH;
const sy = (i) => bandY(i) + 86;   // step-card row inside a band
const my = (i) => bandY(i) + 170;  // lower row for markers

// ----- node/edge builders ----------------------------------------------------
const node = (id, type, x, y, data = {}, extra = {}) => ({ id, type, position: { x, y }, data, ...extra });

const banner = (id, title, subtitle) => node(id, 'title', 0, 0, { title, subtitle }, { width: W, height: 84 });
const phaseBand = (id, n, label, desc, color, i) =>
  node(id, 'phase', 0, bandY(i), { number: String(n), label, description: desc, color }, { width: W, height: BAND_H, style: { zIndex: -2 } });
const persona = (id, data) => node(id, 'persona', 0, 110, data);
const castActor = (id, c, data) => node(id, 'actor', 340 + c * 280, 110, data);

// an Action step card: pass step number + system note inline in data
const step = (id, i, c, data) => node(id, 'action', sx(c), sy(i), data);
const decisionAt = (id, i, c, label) => node(id, 'decision', sx(c), bandY(i) + 66, { label }, { width: 168, height: 124 });
const markerAt = (id, i, c, kind, text) => node(id, 'marker', sx(c), my(i), { kind, text });
const calloutAt = (id, i, title, lines, color) => node(id, 'callout', 1052, bandY(i) + 60, { title, lines, color }, { width: 244, height: 134 });
const ctaAt = (id, i, c, label, sublabel, color) => node(id, 'cta', sx(c), bandY(i) + 92, { label, sublabel, color }, { width: 224, height: 64 });

const edge = (source, target, label = '') => ({ id: `e-${source}-${target}`, source, target, label });
// edge leaving a Decision (flaggable Yes/No — rendered green/red by the flag edge)
const branchEdge = (source, target, branch) => ({ id: `e-${source}-${target}`, source, target, type: 'flag', data: { branch } });

const RAW_TEMPLATES = [
  // ===========================================================================
  // 0) ALL-ELEMENTS SHOWCASE — demonstrates every element type
  // ===========================================================================
  {
    id: 'all-elements-showcase',
    name: '⭐ All Elements Showcase',
    description: 'One board that uses every element: title, phase bands, persona, actors, numbered steps with system notes, a decision with Yes/No + redo loop, markers, a callout, a CTA, and an app-screen lane.',
    nodes: [
      banner('ttl', 'User Journey: Onboarding', 'New student signs up, takes a starter quiz, and unlocks the next lesson'),
      persona('p', { label: 'New Student', role: 'student', goal: 'Start learning fast', context: 'Unsure how to begin; on mobile' }),
      castActor('ac_s', 0, { actorType: 'student', label: 'Student' }),
      castActor('ac_t', 1, { actorType: 'teacher', label: 'Teacher' }),

      // Band 1 — Discover
      phaseBand('b0', 1, 'Discover', 'Find Aksorn and decide to start', '#6366f1', 0),
      step('a1', 0, 0, { actionType: 'access', label: 'Visit landing page', emotion: '🙂', stepNumber: '1', systemNote: 'Capture campaign source', actorNames: ['Student'] }),
      markerAt('m1', 0, 2, 'opportunity', 'Offer one-tap SSO / school login'),

      // Band 2 — Sign Up
      phaseBand('b1', 2, 'Sign Up', 'Create an account and profile', '#0ea5e9', 1),
      step('a2', 1, 0, { actionType: 'access', label: 'Create account', emotion: '😐', stepNumber: '2', systemNote: 'Validate email · create profile', actorNames: ['Student'] }),
      calloutAt('c1', 1, 'Validation rules', ['Email must be unique', 'Password ≥ 8 chars', 'Verify within 24h'], '#f59e0b'),

      // Band 3 — First Lesson & Quiz
      phaseBand('b2', 3, 'First Lesson & Quiz', 'Watch a lesson, then take a starter quiz', '#10b981', 2),
      step('a3', 2, 0, { actionType: 'view_content', label: 'Watch first lesson', emotion: '🙂', stepNumber: '3', systemNote: 'Stream video · save progress', actorNames: ['Student'] }),
      step('a4', 2, 1, { actionType: 'take_assessment', label: 'Take starter quiz', emotion: '😀', stepNumber: '4', systemNote: 'Auto-grade · compute score', actorNames: ['Student'] }),
      decisionAt('d1', 2, 2, 'Passed the quiz?'),

      // Band 4 — Outcome
      phaseBand('b3', 4, 'Outcome', 'Unlock next steps or retry', '#8b5cf6', 3),
      step('a5', 3, 0, { actionType: 'share', label: 'Unlock next lesson', emotion: '😀', stepNumber: '5', systemNote: 'Update learning path', actorNames: ['Student'] }),
      step('a6', 3, 1, { actionType: 'take_assessment', label: 'Retake the quiz', emotion: '😟', stepNumber: '6', systemNote: 'Reset attempt counter', actorNames: ['Student'] }),
      markerAt('m2', 3, 2, 'pain', 'Repeated fails frustrate kids — add hints'),
      ctaAt('cta', 3, 3, 'Go to Aksorn Collection', 'Explore more lessons', '#10b981'),

      // Band 5 — Application Journey (screens)
      phaseBand('b4', 5, 'App Journey', 'The screens behind the journey', '#64748b', 4),
      node('mod', 'group_module', 360, bandY(4) + 44, { label: 'Onboarding service' }, { width: 900, height: 176, style: { zIndex: -1 } }),
      node('S1', 'ui_element', 392, bandY(4) + 78, { label: 'Landing screen', linkedUserNodeId: 'a1', actorContext: 'Student · Discover', logic: ['Track source'], storage: [], notifications: [] }),
      node('T1', 'transition', 612, bandY(4) + 96, { label: 'Sign up' }),
      node('S2', 'ui_element', 742, bandY(4) + 78, { label: 'Sign-up screen', linkedUserNodeId: 'a2', actorContext: 'Student · Create account', logic: ['Validate input'], storage: ['Save profile'], notifications: ['Send verification email'] }),
      node('T2', 'transition', 962, bandY(4) + 96, { label: 'Start quiz' }),
      node('S3', 'ui_element', 1092, bandY(4) + 78, { label: 'Quiz screen', linkedUserNodeId: 'a4', actorContext: 'Student · Take quiz', logic: ['Auto-grade'], storage: ['Save score'], notifications: [] })
    ],
    edges: [
      edge('a1', 'a2'), edge('a2', 'a3'), edge('a3', 'a4'), edge('a4', 'd1'),
      branchEdge('d1', 'a5', 'true'),
      branchEdge('d1', 'a6', 'false'),
      edge('a6', 'a4', 'retry'),
      edge('a5', 'cta'),
      edge('S1', 'T1'), edge('T1', 'S2'), edge('S2', 'T2'), edge('T2', 'S3')
    ]
  },

  // ===========================================================================
  // 1) STUDENT ONBOARDING — clean linear user journey
  // ===========================================================================
  {
    id: 'student-onboarding',
    name: 'Student Onboarding',
    description: 'A new student signs up and completes a first lesson — title, phase bands, numbered steps with system notes, a callout and a CTA.',
    nodes: [
      banner('ttl', 'Student Onboarding', 'From first visit to first completed lesson'),
      persona('p', { label: 'New Student', role: 'student', goal: 'Start learning quickly', context: 'Not sure how to begin' }),
      castActor('ac', 0, { actorType: 'student', label: 'Student' }),

      phaseBand('b0', 1, 'Discover', 'Land and decide to start', '#6366f1', 0),
      step('a1', 0, 0, { actionType: 'access', label: 'Sign up / Log in', emotion: '😐', stepNumber: '1', systemNote: 'Create account · verify email', actorNames: ['Student'] }),
      calloutAt('c1', 0, 'Make it frictionless', ['Allow SSO / school login', 'Skip optional fields'], '#0ea5e9'),

      phaseBand('b1', 2, 'First Lesson', 'Experience real value fast', '#10b981', 1),
      step('a2', 1, 0, { actionType: 'view_content', label: 'View first lesson', emotion: '🙂', stepNumber: '2', systemNote: 'Recommend a starter lesson', actorNames: ['Student'] }),
      step('a3', 1, 1, { actionType: 'take_assessment', label: 'Try a starter quiz', emotion: '😀', stepNumber: '3', systemNote: 'Auto-grade · show score', actorNames: ['Student'] }),

      phaseBand('b2', 3, 'Hooked', 'Set up the next session', '#8b5cf6', 2),
      step('a4', 2, 0, { actionType: 'track_progress', label: 'See progress & streak', emotion: '😀', stepNumber: '4', systemNote: 'Update dashboard', actorNames: ['Student'] }),
      ctaAt('cta', 2, 2, 'Start next lesson', 'Keep the momentum', '#10b981')
    ],
    edges: [edge('a1', 'a2'), edge('a2', 'a3'), edge('a3', 'a4'), edge('a4', 'cta')]
  },

  // ===========================================================================
  // 2) TEACHER ASSIGNS & GRADES — decision + redo loop
  // ===========================================================================
  {
    id: 'teacher-assign-grade',
    name: 'Teacher Assigns & Grades',
    description: 'Teacher grades; a decision sends weak work back to redo, otherwise publishes the grade — shows Decision + Yes/No branches and a loop.',
    nodes: [
      banner('ttl', 'Teacher Assigns & Grades', 'Assign → submit → grade → publish or redo'),
      persona('p', { label: 'Ms. Lee — Teacher', role: 'teacher', goal: 'Assess understanding efficiently', context: 'Grading takes too long' }),
      castActor('t', 0, { actorType: 'teacher', label: 'Teacher' }),
      castActor('st', 1, { actorType: 'student', label: 'Student' }),

      phaseBand('b0', 1, 'Assign', 'Set the work', '#6366f1', 0),
      step('a1', 0, 0, { actionType: 'assign', label: 'Set assignment', emotion: '🙂', stepNumber: '1', systemNote: 'Publish assignment · notify class', actorNames: ['Teacher'] }),
      markerAt('m1', 0, 2, 'pain', 'Manual grading is slow — auto-grade quizzes?'),

      phaseBand('b1', 2, 'Submit', 'Student turns it in', '#0ea5e9', 1),
      step('a2', 1, 0, { actionType: 'submit', label: 'Submit work', emotion: '😐', stepNumber: '2', systemNote: 'Store submission · timestamp', actorNames: ['Student'] }),

      phaseBand('b2', 3, 'Grade', 'Assess and decide', '#10b981', 2),
      step('a3', 2, 0, { actionType: 'grade', label: 'Grade & give feedback', emotion: '🙁', stepNumber: '3', systemNote: 'Record grade · attach comments', actorNames: ['Teacher'] }),
      decisionAt('d1', 2, 1, 'Meets the standard?'),

      phaseBand('b3', 4, 'Outcome', 'Publish or send back', '#8b5cf6', 3),
      step('a5', 3, 0, { actionType: 'share', label: 'Publish final grade', emotion: '😀', stepNumber: '4', systemNote: 'Release grade · notify student', actorNames: ['Teacher'] }),
      step('a4', 3, 1, { actionType: 'submit', label: 'Redo & resubmit', emotion: '😟', stepNumber: '4b', systemNote: 'Reopen submission', actorNames: ['Student'] }),
      ctaAt('cta', 3, 3, 'View class report', 'See cohort performance', '#6366f1')
    ],
    edges: [
      edge('a1', 'a2'), edge('a2', 'a3'), edge('a3', 'd1'),
      branchEdge('d1', 'a5', 'true'),
      branchEdge('d1', 'a4', 'false'),
      edge('a4', 'a3', 'resubmit'),
      edge('a5', 'cta')
    ]
  },

  // ===========================================================================
  // 3) LIVE CLASS — loop / rejoin
  // ===========================================================================
  {
    id: 'live-class',
    name: 'Live Class Session',
    description: 'Teacher and students run a live class; dropped students rejoin (looping).',
    nodes: [
      banner('ttl', 'Live Class Session', 'Join → teach & learn → recover from drop-offs'),
      persona('p', { label: 'Class of 30 Students', role: 'student', goal: 'Follow the live lesson', context: 'Unstable connections, varied devices' }),
      castActor('t', 0, { actorType: 'teacher', label: 'Teacher' }),
      castActor('st', 1, { actorType: 'student', label: 'Student' }),

      phaseBand('b0', 1, 'Join', 'Everyone enters the room', '#6366f1', 0),
      step('a1', 0, 0, { actionType: 'access', label: 'Join live class', emotion: '🙂', stepNumber: '1', systemNote: 'Authenticate · admit to room', actorNames: ['Student'] }),
      markerAt('m1', 0, 2, 'pain', 'Students drop off on weak connections'),

      phaseBand('b1', 2, 'Teach & Learn', 'Deliver and interact', '#10b981', 1),
      step('a2', 1, 0, { actionType: 'share', label: 'Share screen / material', emotion: '😀', stepNumber: '2', systemNote: 'Broadcast stream', actorNames: ['Teacher'] }),
      step('a3', 1, 1, { actionType: 'discuss', label: 'Ask & answer questions', emotion: '🙂', stepNumber: '3', systemNote: 'Queue questions · capture chat', actorNames: ['Student'] }),

      phaseBand('b2', 3, 'Recover', 'Bring dropped students back', '#ef4444', 2),
      step('a4', 2, 0, { actionType: 'access', label: 'Rejoin after dropout', emotion: '😟', stepNumber: '4', systemNote: 'Restore session · resync state', actorNames: ['Student'] }),
      calloutAt('c1', 2, 'Resilience', ['Auto-reconnect on drop', 'Resume at last point'], '#ef4444')
    ],
    edges: [edge('a1', 'a2'), edge('a2', 'a3'), edge('a3', 'a4', 'connection drops'), edge('a4', 'a1', 'rejoin')]
  },

  // ===========================================================================
  // 4) ARENA ENGAGEMENT — hook & celebrate
  // ===========================================================================
  {
    id: 'arena-engagement',
    name: 'Arena Engagement',
    description: 'Online/offline English class for kids: hook with media, run an interactive activity, celebrate, start class.',
    nodes: [
      banner('ttl', 'Arena Engagement', 'Hook young learners, then lead into the class'),
      persona('p', { label: 'Ms. Lee — English Teacher', role: 'teacher', goal: 'Hook kids and lead into starting class', context: 'Online & offline class for young kids who lose focus' }),
      castActor('t', 0, { actorType: 'teacher', label: 'Teacher' }),
      castActor('st', 1, { actorType: 'student', label: 'Student (Kid)' }),

      phaseBand('b0', 1, 'Warm-up', 'Grab attention', '#6366f1', 0),
      step('a1', 0, 0, { actionType: 'share', label: 'Present opening media', emotion: '🙂', stepNumber: '1', systemNote: 'Play opener · show script', actorNames: ['Teacher'] }),
      markerAt('m1', 0, 2, 'pain', 'Kids lose focus online — need an engaging opener'),

      phaseBand('b1', 2, 'Engage', 'Get them participating', '#0ea5e9', 1),
      step('a2', 1, 0, { actionType: 'watch_video', label: 'Watch & warm up', emotion: '😀', stepNumber: '2', systemNote: 'Track watch completion', actorNames: ['Student'] }),
      step('a3', 1, 1, { actionType: 'take_assessment', label: 'Launch jigsaw / MCQ', emotion: '😀', stepNumber: '3', systemNote: 'Score activity live', actorNames: ['Student'] }),

      phaseBand('b2', 3, 'Interact', 'Hands-on activity', '#10b981', 2),
      step('a4', 2, 0, { actionType: 'share', label: 'Interact via shared screen', emotion: '😀', stepNumber: '4', systemNote: 'Sync kid-screen state', actorNames: ['Teacher'] }),
      step('a5', 2, 1, { actionType: 'submit', label: 'Complete activity', emotion: '🙂', stepNumber: '5', systemNote: 'Record completion', actorNames: ['Student'] }),

      phaseBand('b3', 4, 'Celebrate', 'Reward and transition', '#f59e0b', 3),
      step('a6', 3, 0, { actionType: 'view_content', label: 'Celebrate & start class', emotion: '😀', stepNumber: '6', systemNote: 'Play celebration · open class', actorNames: ['Teacher'] }),
      markerAt('m2', 3, 1, 'opportunity', 'End with a celebration sound + screen'),
      ctaAt('cta', 3, 3, 'Begin today’s lesson', 'Carry the energy in', '#f59e0b')
    ],
    edges: [edge('a1', 'a2'), edge('a2', 'a3'), edge('a3', 'a4'), edge('a4', 'a5'), edge('a5', 'a6'), edge('a6', 'cta')]
  }
];

// Pick connection anchors from the geometry between the two nodes so lines exit/enter
// the facing sides: vertical links go bottom → top, horizontal links go right → left.
// Handle ids match those in NodeHandles ('t','r','b','l').
function withEdgeHandles(template) {
  const byId = Object.fromEntries(template.nodes.map((n) => [n.id, n]));
  return {
    ...template,
    edges: template.edges.map((e) => {
      const s = byId[e.source];
      const t = byId[e.target];
      if (!s || !t) return e;
      const dx = t.position.x - s.position.x;
      const dy = t.position.y - s.position.y;
      let sourceHandle, targetHandle;
      if (Math.abs(dx) >= Math.abs(dy)) {
        sourceHandle = dx >= 0 ? 'r' : 'l';
        targetHandle = dx >= 0 ? 'l' : 'r';
      } else {
        sourceHandle = dy >= 0 ? 'b' : 't';
        targetHandle = dy >= 0 ? 't' : 'b';
      }
      // Keep explicit handles (e.g. a Decision node's 'true'/'false' output); only fill what's missing
      return { ...e, sourceHandle: e.sourceHandle ?? sourceHandle, targetHandle: e.targetHandle ?? targetHandle };
    })
  };
}

export const EDTECH_TEMPLATES = RAW_TEMPLATES.map(withEdgeHandles);
