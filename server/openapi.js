import { ELEMENTS, LAYOUT_NOTES, HANDLE_IDS, KNOWN_TYPES } from './elementSpec.js';

// Build a human-readable markdown overview of the elements + layout rules for the
// Swagger landing page (kept in sync with the element catalog).
function elementsMarkdown() {
  const byCat = {};
  for (const e of ELEMENTS) (byCat[e.category] ||= []).push(e);
  const catLabel = { user: 'User Journey', app: 'Application Journey', structure: 'Structure / Layout', annotation: 'Annotations / Endpoints', legacy: 'Legacy' };
  let md = '';
  for (const cat of ['user', 'app', 'structure', 'annotation', 'legacy']) {
    if (!byCat[cat]) continue;
    md += `\n**${catLabel[cat]}**\n`;
    for (const e of byCat[cat]) {
      const fields = e.data.map((d) => `\`${d.name}\`${d.optional ? '?' : ''}`).join(', ');
      md += `- \`${e.type}\` — ${e.description} _data:_ ${fields || '—'}\n`;
    }
  }
  return md;
}

const layoutMarkdown = Object.entries(LAYOUT_NOTES).map(([k, v]) => `- **${k}**: ${v}`).join('\n');

export function buildOpenApiSpec() {
  return {
    openapi: '3.0.3',
    info: {
      title: 'JourneyCanvas External API',
      version: '1.0.0',
      description: [
        'Machine-facing API to **list, export, and import** journey boards.',
        '',
        'Authenticate with the **`X-API-Key`** header (set `API_KEY` in the server `.env`). Click **Authorize** to try requests.',
        '',
        'A board is a bundle of `nodes`, `edges`, and `comments`. **Export** (`GET /boards/{id}`) returns the exact JSON shape that **import** (`POST /boards/import`) accepts, so the recommended pattern is **export → modify → import** rather than hand-building coordinates.',
        '',
        '### Element types',
        'See `GET /elements` for the machine-readable catalog. Summary:',
        elementsMarkdown(),
        '### Layout rules',
        layoutMarkdown,
        '',
        '> Import is validated strictly: unknown node `type`, missing/non-finite `position`, edges referencing missing nodes, or bad `parentId` are rejected with HTTP 400 and a precise `errors[]` list — nothing is written. This prevents broken layouts.'
      ].join('\n')
    },
    servers: [{ url: '/api/v1' }],
    security: [{ ApiKeyAuth: [] }],
    components: {
      securitySchemes: {
        ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key' }
      },
      schemas: {
        Node: {
          type: 'object',
          required: ['id', 'type', 'position'],
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: KNOWN_TYPES, description: 'Element type — see /elements' },
            position: {
              type: 'object', required: ['x', 'y'],
              properties: { x: { type: 'number' }, y: { type: 'number' } },
              description: 'Absolute canvas coords; relative to parent if parentId is set'
            },
            width: { type: 'number', nullable: true },
            height: { type: 'number', nullable: true },
            parentId: { type: 'string', nullable: true, description: 'Id of a group_module to nest within' },
            data: { type: 'object', additionalProperties: true, description: 'Per-type fields — see /elements' }
          }
        },
        Edge: {
          type: 'object',
          required: ['id', 'source', 'target'],
          properties: {
            id: { type: 'string' },
            source: { type: 'string', description: 'Source node id (must exist in the board)' },
            target: { type: 'string', description: 'Target node id (must exist in the board)' },
            type: { type: 'string', nullable: true, description: '"flag" for decision Yes/No branches' },
            sourceHandle: { type: 'string', nullable: true, enum: HANDLE_IDS },
            targetHandle: { type: 'string', nullable: true, enum: HANDLE_IDS },
            data: { type: 'object', additionalProperties: true, description: 'e.g. { branch: "true" | "false" } for flag edges' }
          }
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nodeId: { type: 'string', nullable: true },
            author: { type: 'string' },
            content: { type: 'string' },
            position: { type: 'object', nullable: true, properties: { x: { type: 'number' }, y: { type: 'number' } } },
            createdAt: { type: 'string' }
          }
        },
        BoardSummary: {
          type: 'object',
          properties: { id: { type: 'string' }, name: { type: 'string' }, workspaceId: { type: 'string' }, updatedAt: { type: 'string' } }
        },
        Board: {
          type: 'object',
          properties: {
            id: { type: 'string' }, name: { type: 'string' }, workspaceId: { type: 'string' },
            nodes: { type: 'array', items: { $ref: '#/components/schemas/Node' } },
            edges: { type: 'array', items: { $ref: '#/components/schemas/Edge' } },
            comments: { type: 'array', items: { $ref: '#/components/schemas/Comment' } }
          }
        },
        ImportRequest: {
          type: 'object',
          required: ['nodes'],
          properties: {
            id: { type: 'string', description: 'Upsert target. If a board with this id exists, its contents are REPLACED. Omit (or use an unused id) to CREATE a new board — node/edge/comment ids are then auto-remapped to stay globally unique, so re-importing an export never collides with the original.' },
            name: { type: 'string', description: 'Required when creating a new board' },
            workspaceId: { type: 'string', description: 'Target workspace; defaults to "ws-default" if omitted/unknown' },
            nodes: { type: 'array', items: { $ref: '#/components/schemas/Node' } },
            edges: { type: 'array', items: { $ref: '#/components/schemas/Edge' } },
            comments: { type: 'array', items: { $ref: '#/components/schemas/Comment' } },
            validateOnly: { type: 'boolean', description: 'If true, validate and return the report without writing' }
          }
        },
        ImportResult: {
          type: 'object',
          properties: { ok: { type: 'boolean' }, id: { type: 'string' }, name: { type: 'string' }, workspaceId: { type: 'string' }, created: { type: 'boolean' } }
        },
        ValidationError: {
          type: 'object',
          properties: { ok: { type: 'boolean', example: false }, errors: { type: 'array', items: { type: 'string' } } }
        }
      }
    },
    paths: {
      '/workspaces': {
        get: {
          summary: 'List workspaces (with their boards)',
          description: 'Returns each workspace and the boards it contains, so cross-board links (board_link nodes, which reference a board id in the same workspace) can be resolved.',
          responses: {
            200: {
              description: 'Workspaces with boards',
              content: { 'application/json': { schema: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, boards: { type: 'array', items: { $ref: '#/components/schemas/BoardSummary' } } } } } } }
            },
            401: { description: 'Invalid API key' }
          }
        }
      },
      '/boards': {
        get: {
          summary: 'List boards',
          parameters: [{ name: 'workspaceId', in: 'query', required: false, schema: { type: 'string' } }],
          responses: { 200: { description: 'Array of board summaries', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/BoardSummary' } } } } }, 401: { description: 'Invalid API key' } }
        }
      },
      '/boards/{id}': {
        get: {
          summary: 'Export a board (full bundle)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Board bundle', content: { 'application/json': { schema: { $ref: '#/components/schemas/Board' } } } }, 404: { description: 'Not found' }, 401: { description: 'Invalid API key' } }
        },
        delete: {
          summary: 'Delete a board',
          description: 'Permanently deletes the board and its nodes/edges/comments. Open clients are notified and any presentation is torn down.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Deleted', content: { 'application/json': { schema: { type: 'object', properties: { ok: { type: 'boolean' }, id: { type: 'string' } } } } } },
            404: { description: 'Not found' }, 401: { description: 'Invalid API key' }
          }
        }
      },
      '/boards/import': {
        post: {
          summary: 'Import (upsert) a board',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ImportRequest' } } } },
          responses: {
            200: { description: 'Imported / validated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ImportResult' } } } },
            400: { description: 'Validation failed — nothing written', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
            401: { description: 'Invalid API key' }
          }
        }
      },
      '/workspaces/{id}': {
        delete: {
          summary: 'Delete a workspace and all its boards',
          description: 'Permanently deletes the workspace and every board inside it (cascades nodes/edges/comments). The default workspace (ws-default) cannot be deleted.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Deleted', content: { 'application/json': { schema: { type: 'object', properties: { ok: { type: 'boolean' }, id: { type: 'string' }, deletedBoards: { type: 'integer' } } } } } },
            400: { description: 'Cannot delete the default workspace' }, 404: { description: 'Not found' }, 401: { description: 'Invalid API key' }
          }
        }
      },
      '/boards/{id}/arrange': {
        post: {
          summary: 'Auto-arrange (tidy) a board layout',
          description: 'Deterministically re-flows the presentation layer (title → cast row → numbered phase bands → steps → markers/callouts → CTA) so nothing overlaps. Uses size estimates server-side. Open clients refresh live.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Arranged', content: { 'application/json': { schema: { type: 'object', properties: { ok: { type: 'boolean' }, moved: { type: 'integer' } } } } } },
            404: { description: 'Not found' }, 401: { description: 'Invalid API key' }
          }
        }
      },
      '/elements': {
        get: {
          summary: 'Element catalog + layout rules',
          description: 'The machine-readable spec of every element type, its data fields, and how to arrange/manage them.',
          responses: { 200: { description: 'Element catalog', content: { 'application/json': { schema: { type: 'object' } } } }, 401: { description: 'Invalid API key' } }
        }
      }
    }
  };
}
