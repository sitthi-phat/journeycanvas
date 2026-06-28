// Machine-readable catalog of every board element type, its data fields, and the
// layout rules. This is the single source of truth used both by the public API
// (GET /api/v1/elements + Swagger docs) and by import validation (KNOWN_TYPES).

export const HANDLE_IDS = ['t', 'r', 'b', 'l', 'tl', 'tr', 'bl', 'br'];
export const EMOTIONS = ['😀', '🙂', '😐', '🙁', '😞'];
export const ACTOR_TYPES = ['teacher', 'student', 'parent', 'school_admin', 'academic', 'content_author', 'system'];
export const ACTION_TYPES = ['access', 'view_content', 'watch_video', 'take_assessment', 'submit', 'grade', 'assign', 'track_progress', 'share', 'discuss'];

// f(name, type, desc, extra?) → field descriptor
const f = (name, type, description, extra = {}) => ({ name, type, description, ...extra });

export const ELEMENTS = [
  // ---- User Journey ----
  {
    type: 'persona', category: 'user', label: 'Persona / Goal',
    description: 'Who the journey is for. Anchor for discovery.',
    data: [f('label', 'string', 'Persona name, e.g. "New Student"'), f('role', 'string', 'Their role'), f('goal', 'string', 'What they want to achieve'), f('context', 'string', 'Situation / constraints')]
  },
  {
    type: 'actor', category: 'user', label: 'Actor',
    description: 'A participant who performs actions.',
    data: [f('actorType', 'enum', 'Actor kind (or a custom string)', { enum: ACTOR_TYPES }), f('label', 'string', 'Display name'), f('isCustom', 'boolean', 'True if actorType is a free-typed custom value', { optional: true })]
  },
  {
    type: 'action', category: 'user', label: 'Action / Step',
    description: 'Something an actor does at a step in the journey.',
    data: [
      f('actionType', 'enum', 'Action kind (or a custom string)', { enum: ACTION_TYPES }),
      f('label', 'string', 'Step label'),
      f('emotion', 'enum', 'Sentiment marker', { enum: EMOTIONS, optional: true }),
      f('stepNumber', 'string', 'Optional badge number, e.g. "1"', { optional: true }),
      f('systemNote', 'string', 'What the system does at this step ("⚙️ System" line)', { optional: true }),
      f('actorNames', 'string[]', 'Names of actors performing this action', { optional: true }),
      f('actorIds', 'string[]', 'Node ids of linked Actor elements', { optional: true }),
      f('description', 'string', 'Behaviour notes', { optional: true }),
      f('tags', 'string[]', 'Freeform #tags', { optional: true }),
      f('references', 'object[]', 'Linked references', { optional: true })
    ]
  },
  {
    type: 'decision', category: 'user', label: 'Decision (diamond)',
    description: 'A branch point. Outgoing edges are flagged Yes/No (see edge.type="flag").',
    defaultSize: { width: 168, height: 124 },
    data: [f('label', 'string', 'The question, e.g. "Meets the standard?"')]
  },
  {
    type: 'marker', category: 'user', label: 'Pain / Opportunity marker',
    description: 'A discovery insight pinned near a step. Shown in User/Dual views.',
    data: [f('kind', 'enum', 'Marker kind', { enum: ['pain', 'opportunity'] }), f('text', 'string', 'The insight text')]
  },

  // ---- Application Journey ----
  {
    type: 'ui_element', category: 'app', label: 'Screen / App Step',
    description: 'An application screen. Behaviours are attributes, not separate nodes.',
    data: [
      f('label', 'string', 'Screen name'),
      f('logic', 'string[]', 'Business-logic chips (⚙️)', { optional: true }),
      f('storage', 'string[]', 'Data/storage chips (📦)', { optional: true }),
      f('notifications', 'string[]', 'Notification chips (🔔)', { optional: true }),
      f('actorContext', 'string', 'Caption "Actor · Action"', { optional: true }),
      f('linkedUserNodeId', 'string', 'Id of the user-journey node this screen serves', { optional: true }),
      f('description', 'string', 'Notes', { optional: true })
    ]
  },
  {
    type: 'transition', category: 'app', label: 'Action / Transition pill',
    description: 'A small pill connecting screens (screen → action → screen).',
    data: [f('label', 'string', 'Transition label, e.g. "Submit"')]
  },

  // ---- Structure / layout ----
  {
    type: 'title', category: 'structure', label: 'Title / Banner',
    description: 'Heading + subtitle for the top of a presentation map.',
    defaultSize: { width: 560, height: 90 },
    data: [f('title', 'string', 'Main heading'), f('subtitle', 'string', 'Subtitle')]
  },
  {
    type: 'phase', category: 'structure', label: 'Phase band (horizontal)',
    description: 'A horizontal lane (numbered) that sits BEHIND the steps it groups.',
    defaultSize: { width: 1100, height: 240 }, layout: 'Render behind content (zIndex -2).',
    data: [f('number', 'string', 'Phase number'), f('label', 'string', 'Phase name'), f('description', 'string', 'What this phase covers'), f('color', 'string', 'Hex color, e.g. "#10b981"')]
  },
  {
    type: 'stage', category: 'structure', label: 'Stage (vertical column)',
    description: 'A vertical lane/column that sits BEHIND the steps it groups.',
    defaultSize: { width: 320, height: 760 }, layout: 'Render behind content (zIndex -2).',
    data: [f('label', 'string', 'Stage name'), f('color', 'string', 'Hex color')]
  },
  {
    type: 'group_module', category: 'structure', label: 'Module / Container',
    description: 'A box that groups members. Nodes whose parentId is this module move/resize with it.',
    defaultSize: { width: 350, height: 450 }, layout: 'Render behind members (zIndex -1). Member node.position is RELATIVE to this module.',
    data: [f('label', 'string', 'Module name')]
  },

  // ---- Annotations / endpoints ----
  {
    type: 'callout', category: 'annotation', label: 'Note / Callout',
    description: 'A dashed, colored note box with bullet points.',
    defaultSize: { width: 220, height: 120 },
    data: [f('title', 'string', 'Note title'), f('lines', 'string[]', 'Bullet points'), f('color', 'string', 'Hex color')]
  },
  {
    type: 'cta', category: 'annotation', label: 'Call-to-Action / End',
    description: 'A filled "button" node that ends a journey.',
    defaultSize: { width: 210, height: 64 },
    data: [f('label', 'string', 'CTA label'), f('sublabel', 'string', 'Subtext', { optional: true }), f('color', 'string', 'Hex color')]
  },
  {
    type: 'board_link', category: 'annotation', label: 'Link to board',
    description: 'A clickable link to ANOTHER board in the same workspace. Clicking it opens that board (works in Presentation view too).',
    data: [f('boardId', 'string', 'Target board id (must be a board in the same workspace)'), f('boardName', 'string', 'Cached display name of the target board')]
  },
  {
    type: 'image_node', category: 'annotation', label: 'Image',
    description: 'A pasted/uploaded image placed on the canvas.',
    data: [f('url', 'string', 'Image URL: /uploads/<file>, an external https URL, or a base64 data: URL (exports inline local uploads as data URLs for portability)'), f('label', 'string', 'Caption', { optional: true })]
  },

  // ---- Legacy (older boards) ----
  { type: 'logic', category: 'legacy', label: 'Logic (legacy)', description: 'Legacy standalone logic block.', data: [f('label', 'string', 'Label')] },
  { type: 'storage', category: 'legacy', label: 'Storage (legacy)', description: 'Legacy standalone storage block.', data: [f('label', 'string', 'Label')] },
  { type: 'notification', category: 'legacy', label: 'Notification (legacy)', description: 'Legacy standalone notification block.', data: [f('label', 'string', 'Label')] }
];

export const KNOWN_TYPES = ELEMENTS.map((e) => e.type);

export const LAYOUT_NOTES = {
  position: 'Required. Absolute canvas coordinates { x, y } as finite numbers. If a node has parentId, its position is RELATIVE to that parent module.',
  size: 'Optional width/height (positive numbers). If omitted the element uses its intrinsic size; structure elements have sensible defaults (see each element\'s defaultSize).',
  parentId: 'Optional. The id of a group_module element to nest inside; the member then moves/resizes with the module.',
  handles: `Connection anchors. Edge.sourceHandle / targetHandle must be one of: ${HANDLE_IDS.join(', ')} (4 sides + 4 corners). Omit to use defaults.`,
  edges: 'Edge = { id, source, target, type?, sourceHandle?, targetHandle?, data? }. source/target MUST reference node ids present in the same payload.',
  decisionBranches: 'Edges leaving a "decision" node use type:"flag" with data.branch = "true" (green "Yes") or "false" (red "No"). Other edges omit type or use "default".',
  stacking: 'stage & phase render behind everything (zIndex -2); group_module behind its members (zIndex -1). Place step cards on top.',
  arrangement: 'Recommended pattern: Title banner on top → optional Persona/Actor row → stacked Phase bands (or Stage columns) → numbered Action steps left-to-right inside each band → Decision diamonds with Yes/No branches → markers/callouts → a CTA end node.'
};
