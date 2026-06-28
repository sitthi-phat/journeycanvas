import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the project .env (journey_tool/.env)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const apiKey = (process.env.GEMINI_API_KEY || '').trim();
let genAI = null;

// Known placeholder values that should be treated as "no key configured"
const PLACEHOLDER_KEYS = new Set([
  'your_gemini_api_key_here',
  'changeme',
  'todo'
]);

if (apiKey && !PLACEHOLDER_KEYS.has(apiKey.toLowerCase())) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('Gemini AI service initialized successfully with API key.');
  } catch (err) {
    console.error('Error initializing Gemini API:', err);
  }
} else {
  console.warn('WARNING: Gemini API Key is missing or invalid. Falling back to mock AI outputs.');
}

/**
 * Perform OCR on a base64 encoded image to generate digitized node items
 */
export async function digitizeCanvasImage(base64Image, mimeType = 'image/png') {
  if (!genAI) {
    return getMockOCRResponse();
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      You are an expert UX and Business Systems Analyst. 
      Analyze the attached canvas image (sketches, UI mockups, or journey diagrams).
      1. Extract all text elements, sticky notes, hand-drawn shapes, or wireframe labels.
      2. Classify each identified element into one of the following node types:
         - 'actor' (e.g. Customer, Admin, Merchant)
         - 'action' (e.g. Click/Tap, Fill Form, Scan)
         - 'ui_element' (e.g. OTP screen, Login panel)
         - 'logic' (e.g. Age validation, OTP validation)
      3. Propose a sensible relative layout coordinates (x, y) where x increases from left to right, and y is around 100-300 for user-journey nodes, and 600-800 for system-journey nodes.
      
      Respond STRICTLY with a JSON array of objects with the format:
      [
        {
          "type": "actor" | "action" | "ui_element" | "logic",
          "label": "Extracted text content here",
          "x": number,
          "y": number
        }
      ]
    `;

    const imageParts = [
      {
        inlineData: {
          data: base64Image.split(',')[1] || base64Image,
          mimeType: mimeType
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini OCR Error:', error);
    return getMockOCRResponse();
  }
}

/**
 * Automatically generate the corresponding Application Journey nodes based on User Journey nodes.
 */
export async function autoGenerateAppJourney(userNodes, userEdges = []) {
  if (!genAI) {
    return getMockAppJourneyResponse(userNodes);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      You are a software architect on an Education Technology (EdTech) product. Actors are typically
      Teacher, Student, Parent/Guardian, School Admin, Academic, or Content Author.

      You are given a User Journey: a set of ACTION steps (and actors) plus the EDGES that connect the
      actions in order. For EACH user action, design the application **screen** the user is on for that step.

      Output ONE 'ui_element' screen per user action — no more, no less, and DO NOT merge steps.
      For each screen set:
        - 'linkedUserNodeId': the id of the user action it is for (REQUIRED, exact match).
        - 'label': a short, human-readable screen name (e.g. "Login screen", "Quiz screen", "Submission screen").
        - 'actorContext': "<Actor> · <Action>" naming who does it (infer the actor from the action wording).
        - 'logic' (⚙️ checks), 'storage' (📦 remembered data), 'notifications' (🔔 messages): short arrays; use [] when none.
      Do NOT output any edges or transition nodes — the app will connect the screens itself, following the
      user journey order below.

      User actions:
      ${JSON.stringify(userNodes.filter((n) => n.type === 'action'), null, 2)}

      User journey edges (order between actions):
      ${JSON.stringify(userEdges, null, 2)}

      Respond STRICTLY with a JSON object:
      {
        "nodes": [
          { "type": "ui_element", "linkedUserNodeId": "string", "label": "Screen name", "actorContext": "Actor · Action", "logic": ["..."], "storage": ["..."], "notifications": ["..."] }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini Auto-Generate App Journey Error:', error);
    return getMockAppJourneyResponse(userNodes);
  }
}

/**
 * Analyze canvas nodes and edges to:
 * 1. Clean up coordinate placements.
 * 2. Generate a structured System Architecture Matrix Table.
 */
export async function restructureAndSummarize(nodes, edges) {
  if (!genAI) {
    return getMockMatrixResponse(nodes, edges);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      You are a Product Owner and Software Architect for an Education Technology (EdTech) product
      (actors are typically Teacher, Student, Parent/Guardian, School Admin, Academic, or Content Author).
      Analyze the current user and application journey nodes and edges. Application steps are 'ui_element'
      screens; each screen's system behaviours live in its data as arrays: 'logic' (⚙️ checks), 'storage'
      (📦 remembered data), and 'notifications' (🔔 messages), and 'actorContext' names who/what it serves.
      
      Nodes:
      ${JSON.stringify(nodes, null, 2)}
      
      Edges:
      ${JSON.stringify(edges, null, 2)}
      
      Your tasks:
      1. Clean layout: Provide optimized coordinates (x, y) for nodes so that the diagram aligns nicely in two distinct layers (User lane y ~ 100-400, App lane y ~ 600-900) without overlaps.
      2. Synthesis Matrix: Compile a structured System Architecture Matrix. Group nodes into relationship flows mapping:
         [Actor] -> [User Action] -> [Application Response/System Node] -> [Module/Feature Container]
         and represent this as a clean markdown table string.
      
      Respond STRICTLY with a JSON object in this format:
      {
        "cleanedNodes": [
          {
            "id": "string",
            "x": number,
            "y": number
          }
        ],
        "matrixMarkdown": "string (detailed markdown table with columns: Module/Feature, Actor, User Action, System Response)"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini Summarize/Matrix Error:', error);
    return getMockMatrixResponse(nodes, edges);
  }
}

// Fallbacks for offline / missing API Key configurations
function getMockOCRResponse() {
  return [
    { type: 'actor', label: 'Teacher', x: 100, y: 150 },
    { type: 'action', label: 'Assign homework', x: 300, y: 150 },
    { type: 'ui_element', label: 'Assignment Setup Screen', x: 300, y: 650 },
    { type: 'logic', label: 'Validate due date & class', x: 500, y: 750 }
  ];
}

// Plain-language screen name suggested per action type (offline fallback only).
const SCREEN_BY_ACTION = {
  access: 'Login screen',
  view_content: 'Content screen',
  watch_video: 'Video player',
  take_assessment: 'Quiz screen',
  submit: 'Submission screen',
  grade: 'Grading screen',
  assign: 'Assignment screen',
  track_progress: 'Progress dashboard',
  share: 'Share screen',
  discuss: 'Discussion screen'
};

// One screen per user action. The client connects them following the user-journey order.
function getMockAppJourneyResponse(userNodes) {
  const labelOf = (n) => n.data?.label || n.label || 'Step';
  const actions = userNodes.filter((n) => n.type === 'action');
  const actorName = userNodes.find((n) => n.type === 'actor')
    ? labelOf(userNodes.find((n) => n.type === 'actor'))
    : 'User';

  const nodes = actions.map((node) => {
    const act = labelOf(node);
    const actType = node.data?.actionType;
    return {
      type: 'ui_element',
      linkedUserNodeId: node.id,
      label: actType && SCREEN_BY_ACTION[actType] ? SCREEN_BY_ACTION[actType] : `${act} screen`,
      actorContext: `${actorName} · ${act}`,
      logic: [`Check & process: ${act}`],
      storage: [],
      notifications: []
    };
  });

  return { nodes };
}

function getMockMatrixResponse(nodes, edges) {
  let table = `| Module/Feature | Actor | User Action | System Response |\n`;
  table += `| :--- | :--- | :--- | :--- |\n`;
  table += `| **Authentication** | Teacher | Access / Log in | 📺 Login Screen, ⚙️ Verify Credentials, 📦 Store Session |\n`;
  table += `| **Assignments** | Student | Submit Assignment | 📺 Upload Screen, ⚙️ Validate Submission, 🔔 Notify Teacher |\n`;
  table += `| **Progress** | Parent / Guardian | Track Progress | 📺 Progress Dashboard, 📦 Read Grades & Attendance |\n`;
  
  const cleanedNodes = nodes.map((node, i) => ({
    id: node.id,
    x: (node.position?.x || node.x || 100) + (i % 2 === 0 ? 10 : -10), // slight shake to show movement
    y: node.type === 'actor' || node.type === 'action' ? 200 : 700
  }));

  return {
    cleanedNodes,
    matrixMarkdown: table
  };
}
