// ═══════════════════════════════════════
// DevPath — Project Test Definitions
// Real test cases for auto-grading
// ═══════════════════════════════════════

import type { TestCase } from '../lib/code-runner';

export interface ProjectTests {
  projectId: string;
  testCases: TestCase[];
  setupCode?: string; // Code to prepend before running tests
}

/**
 * Test cases mapped by project ID.
 * Each test has a name, input passed to stdin/args, and expected output.
 */
export const projectTests: Record<string, ProjectTests> = {
  // ── Algorithm: LRU Cache ──
  'lru-cache': {
    projectId: 'lru-cache',
    testCases: [
      {
        name: 'Create cache with capacity 2',
        input: '',
        expected: 'Cache created with capacity 2',
      },
      {
        name: 'Get from empty cache returns -1',
        input: 'get_empty',
        expected: '-1',
      },
      {
        name: 'Put and get single item',
        input: 'put_get_single',
        expected: '42',
      },
      {
        name: 'Evicts least recently used',
        input: 'evict_lru',
        expected: '-1\n3',
      },
      {
        name: 'Get updates recency',
        input: 'get_updates_recency',
        expected: '1\n-1\n3',
      },
      {
        name: 'Overwrite existing key',
        input: 'overwrite',
        expected: '10\n20',
      },
    ],
    setupCode: `
// Test harness for LRU Cache
const cache = new LRUCache(2);
const testInput = input.trim();

if (testInput === '') {
  console.log('Cache created with capacity 2');
} else if (testInput === 'get_empty') {
  console.log(cache.get('missing'));
} else if (testInput === 'put_get_single') {
  cache.put('a', 42);
  console.log(cache.get('a'));
} else if (testInput === 'evict_lru') {
  cache.put('a', 1);
  cache.put('b', 2);
  cache.put('c', 3); // evicts 'a'
  console.log(cache.get('a'));
  console.log(cache.get('c'));
} else if (testInput === 'get_updates_recency') {
  cache.put('a', 1);
  cache.put('b', 2);
  cache.get('a'); // makes 'a' recent
  cache.put('c', 3); // evicts 'b'
  console.log(cache.get('a'));
  console.log(cache.get('b'));
  console.log(cache.get('c'));
} else if (testInput === 'overwrite') {
  cache.put('x', 10);
  console.log(cache.get('x'));
  cache.put('x', 20);
  console.log(cache.get('x'));
}
`,
  },

  // ── Algorithm: Path Finder ──
  'path-finder': {
    projectId: 'path-finder',
    testCases: [
      {
        name: 'Find shortest path in simple grid',
        input: '3 3\n0 0 0\n0 0 0\n0 0 0\n0 0\n2 2',
        expected: '4',
      },
      {
        name: 'Path blocked returns -1',
        input: '3 3\n0 0 0\n1 1 1\n0 0 0\n0 0\n2 2',
        expected: '-1',
      },
      {
        name: 'Start equals end',
        input: '3 3\n0 0 0\n0 0 0\n0 0 0\n1 1\n1 1',
        expected: '0',
      },
      {
        name: 'Path around obstacle',
        input: '5 5\n0 0 0 0 0\n0 1 1 1 0\n0 0 0 1 0\n0 1 0 0 0\n0 0 0 0 0\n0 0\n4 4',
        expected: '8',
      },
      {
        name: '1x1 grid',
        input: '1 1\n0\n0 0\n0 0',
        expected: '0',
      },
    ],
  },

  // ── Backend: REST API ──
  'rest-api': {
    projectId: 'rest-api',
    testCases: [
      {
        name: 'Create a new item',
        input: 'create',
        expected: '{"success": true, "id": 1}',
      },
      {
        name: 'Get all items returns array',
        input: 'getAll',
        expected: '[]',
      },
      {
        name: 'Get item by ID',
        input: 'getById',
        expected: '{"id": 1, "name": "Test"}',
      },
      {
        name: 'Update item',
        input: 'update',
        expected: '{"success": true, "updated": true}',
      },
      {
        name: 'Delete item',
        input: 'delete',
        expected: '{"success": true, "deleted": true}',
      },
      {
        name: 'Get non-existent returns 404',
        input: 'notFound',
        expected: '{"error": "Not found"}',
      },
    ],
  },

  // ── Backend: CLI Tool ──
  'cli-tool': {
    projectId: 'cli-tool',
    testCases: [
      {
        name: 'Help flag shows usage',
        input: '--help',
        expected: 'Usage:',
        hidden: false,
      },
      {
        name: 'Version flag shows version',
        input: '--version',
        expected: '1.0.0',
      },
      {
        name: 'Process with valid input',
        input: 'process hello',
        expected: 'HELLO',
      },
      {
        name: 'Error on no arguments',
        input: '',
        expected: 'Error: No command specified',
      },
    ],
  },

  // ── Frontend: Animated Portfolio ──
  'animated-portfolio': {
    projectId: 'animated-portfolio',
    testCases: [
      {
        name: 'Contains header element',
        input: 'check_header',
        expected: 'true',
      },
      {
        name: 'Contains navigation',
        input: 'check_nav',
        expected: 'true',
      },
      {
        name: 'Has responsive meta tag',
        input: 'check_viewport',
        expected: 'true',
      },
      {
        name: 'Contains portfolio section',
        input: 'check_portfolio',
        expected: 'true',
      },
    ],
  },

  // ── Frontend: React Kanban ──
  'react-kanban': {
    projectId: 'react-kanban',
    testCases: [
      {
        name: 'Initializes with default columns',
        input: 'init',
        expected: 'Columns: To Do, In Progress, Done',
      },
      {
        name: 'Add card to column',
        input: 'add_card',
        expected: 'Card added: Task 1',
      },
      {
        name: 'Move card between columns',
        input: 'move_card',
        expected: 'Moved to: In Progress',
      },
      {
        name: 'Delete card',
        input: 'delete_card',
        expected: 'Card deleted',
      },
    ],
  },

  // ── Frontend: Design System ──
  'design-system': {
    projectId: 'design-system',
    testCases: [
      {
        name: 'Button component renders',
        input: 'button',
        expected: 'Button rendered',
      },
      {
        name: 'Input component accepts value',
        input: 'input_test',
        expected: 'Input value: test',
      },
      {
        name: 'Card component renders children',
        input: 'card',
        expected: 'Card content visible',
      },
    ],
  },

  // ── Frontend: Real-time Dashboard ──
  'real-time-dashboard': {
    projectId: 'real-time-dashboard',
    testCases: [
      {
        name: 'Dashboard initializes with widgets',
        input: 'init',
        expected: 'Widgets loaded: 4',
      },
      {
        name: 'Data updates in real-time',
        input: 'update',
        expected: 'Data refreshed',
      },
      {
        name: 'Charts render correctly',
        input: 'charts',
        expected: 'Charts rendered: bar, line, pie',
      },
    ],
  },

  // ── Backend: GraphQL Server ──
  'graphql-server': {
    projectId: 'graphql-server',
    testCases: [
      {
        name: 'Query returns user data',
        input: 'query { user(id: 1) { name } }',
        expected: '{"data":{"user":{"name":"Alice"}}}',
      },
      {
        name: 'Mutation creates user',
        input: 'mutation { createUser(name: "Bob") { id } }',
        expected: '{"data":{"createUser":{"id":2}}}',
      },
      {
        name: 'Invalid query returns error',
        input: 'query { invalid }',
        expected: '{"errors":[]}',
      },
    ],
  },

  // ── Backend: Microservices ──
  'microservices': {
    projectId: 'microservices',
    testCases: [
      {
        name: 'Service discovery works',
        input: 'discover',
        expected: 'Services: auth, users, orders',
      },
      {
        name: 'Health check returns OK',
        input: 'health',
        expected: '{"status": "healthy"}',
      },
      {
        name: 'Inter-service communication',
        input: 'communicate',
        expected: 'Response from users service',
      },
    ],
  },

  // ── Fullstack: Blog Platform ──
  'blog-platform': {
    projectId: 'blog-platform',
    testCases: [
      {
        name: 'Create a blog post',
        input: 'create_post',
        expected: 'Post created: Hello World',
      },
      {
        name: 'List all posts',
        input: 'list_posts',
        expected: 'Posts: 1',
      },
      {
        name: 'Get post by slug',
        input: 'get_post',
        expected: 'Found: Hello World',
      },
      {
        name: 'Add comment to post',
        input: 'add_comment',
        expected: 'Comment added',
      },
      {
        name: 'Delete post',
        input: 'delete_post',
        expected: 'Post deleted',
      },
    ],
  },

  // ── Fullstack: E-commerce Store ──
  'ecommerce-store': {
    projectId: 'ecommerce-store',
    testCases: [
      {
        name: 'Add item to cart',
        input: 'add_to_cart',
        expected: 'Cart: 1 item',
      },
      {
        name: 'Calculate cart total',
        input: 'cart_total',
        expected: 'Total: $29.99',
      },
      {
        name: 'Apply discount code',
        input: 'apply_discount',
        expected: 'Discount applied: 10%',
      },
      {
        name: 'Checkout flow',
        input: 'checkout',
        expected: 'Order placed',
      },
      {
        name: 'Empty cart',
        input: 'empty_cart',
        expected: 'Cart: 0 items',
      },
    ],
  },

  // ── Fullstack: Social Platform ──
  'social-platform': {
    projectId: 'social-platform',
    testCases: [
      {
        name: 'Create user profile',
        input: 'create_profile',
        expected: 'Profile created',
      },
      {
        name: 'Follow another user',
        input: 'follow',
        expected: 'Following: user2',
      },
      {
        name: 'Create a post',
        input: 'create_post',
        expected: 'Post published',
      },
      {
        name: 'Like a post',
        input: 'like_post',
        expected: 'Likes: 1',
      },
    ],
  },

  // ── DevOps: CI/CD Pipeline ──
  'ci-cd-pipeline': {
    projectId: 'ci-cd-pipeline',
    testCases: [
      {
        name: 'Pipeline config is valid YAML',
        input: 'validate',
        expected: 'Config: valid',
      },
      {
        name: 'Contains build step',
        input: 'check_build',
        expected: 'Build step: present',
      },
      {
        name: 'Contains test step',
        input: 'check_test',
        expected: 'Test step: present',
      },
      {
        name: 'Contains deploy step',
        input: 'check_deploy',
        expected: 'Deploy step: present',
      },
    ],
  },

  // ── DevOps: Kubernetes Deploy ──
  'kubernetes-deploy': {
    projectId: 'kubernetes-deploy',
    testCases: [
      {
        name: 'Deployment manifest is valid',
        input: 'validate_deployment',
        expected: 'Deployment: valid',
      },
      {
        name: 'Service manifest is valid',
        input: 'validate_service',
        expected: 'Service: valid',
      },
      {
        name: 'Resource limits are set',
        input: 'check_limits',
        expected: 'Resource limits: configured',
      },
    ],
  },

  // ── AI/ML: Sentiment API ──
  'sentiment-api': {
    projectId: 'sentiment-api',
    testCases: [
      {
        name: 'Positive text returns positive',
        input: 'I love this product!',
        expected: 'positive',
      },
      {
        name: 'Negative text returns negative',
        input: 'This is terrible and awful',
        expected: 'negative',
      },
      {
        name: 'Neutral text returns neutral',
        input: 'The meeting is at 3pm',
        expected: 'neutral',
      },
      {
        name: 'Empty input returns error',
        input: '',
        expected: 'Error: No text provided',
      },
      {
        name: 'Returns confidence score',
        input: 'score:I am so happy today',
        expected: 'positive:0.',
      },
    ],
  },

  // ── AI/ML: Image Classifier ──
  'image-classifier': {
    projectId: 'image-classifier',
    testCases: [
      {
        name: 'Classify returns top prediction',
        input: 'classify',
        expected: 'Prediction:',
      },
      {
        name: 'Returns confidence percentage',
        input: 'confidence',
        expected: '%',
      },
      {
        name: 'Handles invalid input',
        input: 'invalid',
        expected: 'Error: Invalid image data',
      },
    ],
  },
};

/**
 * Get test cases for a specific project
 */
export function getProjectTests(projectId: string): ProjectTests | null {
  return projectTests[projectId] || null;
}

/**
 * Get all project IDs that have test cases
 */
export function getTestedProjectIds(): string[] {
  return Object.keys(projectTests);
}
