import { GET }
from "../route";
// Mock the Notion client jest.mock('@notionhq/client', () => ({ Client: jest.fn() }));
const { Client: MockClient } = require('@notionhq/client') describe('/api/health', () => { const originalEnv = process.env beforeEach(() => { jest.clearAllMocks() // Reset process.env for each test process.env = { ...originalEnv }
// Mock console methods to avoid test noise jest.spyOn(console, 'error').mockImplementation() })
afterEach(() => { process.env = originalEnv jest.restoreAllMocks() });

it('returns healthy status when all checks pass', async () => { process.env.NOTION_TOKEN = 'test-token' process.env.NOTION_DATABASE_ID = 'test-database-id' process.env.NOTION_PROJECTS_DB = 'test-projects-db' process.env.NOTION_BOOKS_DB = 'test-books-db' process.env.NOTION_TOOLS_DB = 'test-tools-db' process.env.NODE_ENV = 'test' process.env.npm_package_version = '1.2.3' const mockMe = jest.fn().mockResolvedValue({ id: 'user-123' }) MockClient.mockImplementation(() => ({ users: { me: mockMe }
}));
const response = await GET();
const data = await response.json();
expect(response.status).toBe(200);
expect(data.status).toBe('healthy');
expect(data.version).toBe('1.2.3');
expect(data.checks.notion.status).toBe('ok');
expect(data.checks.notion.message).toBe('Notion API connected successfully');
expect(data.checks.notion.responseTime).toBeDefined();
expect(data.checks.environment).toEqual({ nodeVersion: process.version, environment: 'test', hasNotionToken: true, hasNotionDatabaseId: true, hasProjectsDb: true, hasBooksDb: true, hasToolsDb: true });
expect(data.uptime).toBeDefined();
expect(data.timestamp).toBeDefined();
expect(data.responseTime).toBeDefined();
expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
expect(response.headers.get('X-Health-Check')).toBe('pass') });

it('returns unhealthy status when Notion token is missing', async () => { delete process.env.NOTION_TOKEN process.env.NOTION_DATABASE_ID = 'test-database-id' const response = await GET();
const data = await response.json();
expect(response.status).toBe(503);
expect(data.status).toBe('unhealthy');
expect(data.checks.notion.status).toBe('error');
expect(data.checks.notion.message).toBe('Notion token not configured');
expect(data.checks.environment.hasNotionToken).toBe(false);
expect(response.headers.get('X-Health-Check')).toBe('fail') });

it('returns unhealthy status when Notion database ID is missing', async () => { process.env.NOTION_TOKEN = 'test-token' delete process.env.NOTION_DATABASE_ID const mockMe = jest.fn().mockResolvedValue({ id: 'user-123' }) MockClient.mockImplementation(() => ({ users: { me: mockMe }
}));
const response = await GET();
const data = await response.json();
expect(response.status).toBe(503);
expect(data.status).toBe('unhealthy');
expect(data.checks.notion.status).toBe('ok');
expect(data.checks.environment.hasNotionDatabaseId).toBe(false) });

it('returns unhealthy status when Notion API fails', async () => { process.env.NOTION_TOKEN = 'test-token' process.env.NOTION_DATABASE_ID = 'test-database-id' const mockMe = jest.fn().mockRejectedValue(new Error('API request failed'));
MockClient.mockImplementation(() => ({ users: { me: mockMe }
}));
const response = await GET();
const data = await response.json();
expect(response.status).toBe(503);
expect(data.status).toBe('unhealthy');
expect(data.checks.notion.status).toBe('error');
expect(data.checks.notion.message).toBe('API request failed');
expect(data.checks.notion.responseTime).toBeDefined() });

it('handles non-Error exceptions from Notion API', async () => { process.env.NOTION_TOKEN = 'test-token' process.env.NOTION_DATABASE_ID = 'test-database-id' const mockMe = jest.fn().mockRejectedValue('String error') MockClient.mockImplementation(() => ({ users: { me: mockMe }
}));
const response = await GET();
const data = await response.json();
expect(response.status).toBe(503);
expect(data.checks.notion.status).toBe('error');
expect(data.checks.notion.message).toBe('Unknown error') });

it('uses default values when environment variables are not set', async () => { process.env.NOTION_TOKEN = 'test-token' process.env.NOTION_DATABASE_ID = 'test-database-id' delete process.env.NODE_ENV delete process.env.npm_package_version const mockMe = jest.fn().mockResolvedValue({ id: 'user-123' }) MockClient.mockImplementation(() => ({ users: { me: mockMe }
}));
const response = await GET();
const data = await response.json();
expect(data.checks.environment.environment).toBe('development');
expect(data.version).toBe('1.0.0') });

it('correctly reports missing optional database IDs', async () => { process.env.NOTION_TOKEN = 'test-token' process.env.NOTION_DATABASE_ID = 'test-database-id' delete process.env.NOTION_PROJECTS_DB delete process.env.NOTION_BOOKS_DB delete process.env.NOTION_TOOLS_DB const mockMe = jest.fn().mockResolvedValue({ id: 'user-123' }) MockClient.mockImplementation(() => ({ users: { me: mockMe }
}));
const response = await GET();
const data = await response.json();
expect(data.status).toBe('healthy') // Still healthy as these are optional expect(data.checks.environment.hasProjectsDb).toBe(false);
expect(data.checks.environment.hasBooksDb).toBe(false);
expect(data.checks.environment.hasToolsDb).toBe(false) }) })
