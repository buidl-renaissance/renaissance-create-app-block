import { getDb } from './drizzle';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { 
  connectors, 
  scopes, 
  connectorRecipes,
  appBlocks,
  appBlockRegistry,
  appBlockProviders,
  providerScopes,
  users,
} from './schema';

/**
 * Seed the database with v1 connectors, scopes, recipes, and first-party providers
 * Run with: npx tsx src/db/seed-connectors.ts
 */

const V1_CONNECTORS = [
  {
    id: 'events',
    name: 'Events District',
    description: 'Connect to city-wide events, calendars, and gatherings',
    iconUrl: '/connectors/events.svg',
  },
  {
    id: 'collab',
    name: 'Collab',
    description: 'Collaborative tasks, projects, and team coordination',
    iconUrl: '/connectors/collab.svg',
  },
  {
    id: 'djq',
    name: 'DJQ',
    description: 'Music queues, DJ sessions, and live audio experiences',
    iconUrl: '/connectors/djq.svg',
  },
  {
    id: 'gamenight',
    name: 'Game Night',
    description: 'Multiplayer games, tournaments, and competitive events',
    iconUrl: '/connectors/gamenight.svg',
  },
];

const V1_SCOPES = [
  // Events scopes
  { id: 'events.read', connectorId: 'events', name: 'events.read', description: 'View upcoming and past events', requiredRole: 'visitor' },
  { id: 'events.publish', connectorId: 'events', name: 'events.publish', description: 'Publish new events to the city calendar', requiredRole: 'creator' },
  { id: 'events.approve', connectorId: 'events', name: 'events.approve', description: 'Approve or reject pending events', requiredRole: 'organizer' },
  { id: 'events.checkin', connectorId: 'events', name: 'events.checkin', description: 'Check in attendees to events', requiredRole: 'organizer' },
  { id: 'events.manage', connectorId: 'events', name: 'events.manage', description: 'Full event management access', requiredRole: 'admin' },
  
  // Collab scopes
  { id: 'collab.tasks.read', connectorId: 'collab', name: 'collab.tasks.read', description: 'View tasks and projects', requiredRole: 'member' },
  { id: 'collab.tasks.create', connectorId: 'collab', name: 'collab.tasks.create', description: 'Create new tasks and projects', requiredRole: 'member' },
  { id: 'collab.tasks.assign', connectorId: 'collab', name: 'collab.tasks.assign', description: 'Assign tasks to team members', requiredRole: 'creator' },
  { id: 'collab.projects.manage', connectorId: 'collab', name: 'collab.projects.manage', description: 'Create and manage projects', requiredRole: 'organizer' },
  
  // DJQ scopes
  { id: 'djq.queue.read', connectorId: 'djq', name: 'djq.queue.read', description: 'View the current music queue', requiredRole: 'visitor' },
  { id: 'djq.queue.write', connectorId: 'djq', name: 'djq.queue.write', description: 'Add songs to the queue', requiredRole: 'member' },
  { id: 'djq.queue.manage', connectorId: 'djq', name: 'djq.queue.manage', description: 'Reorder, skip, or remove songs', requiredRole: 'organizer' },
  { id: 'djq.session.create', connectorId: 'djq', name: 'djq.session.create', description: 'Start new DJ sessions', requiredRole: 'creator' },
  
  // Game Night scopes
  { id: 'gamenight.matches.read', connectorId: 'gamenight', name: 'gamenight.matches.read', description: 'View matches and tournaments', requiredRole: 'visitor' },
  { id: 'gamenight.matches.join', connectorId: 'gamenight', name: 'gamenight.matches.join', description: 'Join available matches', requiredRole: 'member' },
  { id: 'gamenight.results.submit', connectorId: 'gamenight', name: 'gamenight.results.submit', description: 'Submit match results', requiredRole: 'member' },
  { id: 'gamenight.tournaments.create', connectorId: 'gamenight', name: 'gamenight.tournaments.create', description: 'Create new tournaments', requiredRole: 'organizer' },
];

const V1_RECIPES = [
  // Events recipes
  {
    id: 'events-view',
    connectorId: 'events',
    name: 'Show Upcoming Events',
    description: 'Display a calendar of upcoming city events',
    scopes: JSON.stringify(['events.read']),
    uiModules: JSON.stringify(['EventCalendar', 'EventList']),
  },
  {
    id: 'events-publish',
    connectorId: 'events',
    name: 'Publish Events',
    description: 'Create and publish events to the city calendar',
    scopes: JSON.stringify(['events.read', 'events.publish']),
    uiModules: JSON.stringify(['EventCalendar', 'EventList', 'EventForm']),
  },
  {
    id: 'events-community',
    connectorId: 'events',
    name: 'Community Events with Approval',
    description: 'Let community members submit events for approval',
    scopes: JSON.stringify(['events.read', 'events.publish', 'events.approve']),
    uiModules: JSON.stringify(['EventCalendar', 'EventList', 'EventForm', 'EventApprovalQueue']),
  },
  
  // Collab recipes
  {
    id: 'collab-view',
    connectorId: 'collab',
    name: 'View Tasks',
    description: 'Display team tasks and project status',
    scopes: JSON.stringify(['collab.tasks.read']),
    uiModules: JSON.stringify(['TaskBoard', 'TaskList']),
  },
  {
    id: 'collab-contribute',
    connectorId: 'collab',
    name: 'Contribute Tasks',
    description: 'Create and complete tasks',
    scopes: JSON.stringify(['collab.tasks.read', 'collab.tasks.create']),
    uiModules: JSON.stringify(['TaskBoard', 'TaskList', 'TaskForm']),
  },
  {
    id: 'collab-manage',
    connectorId: 'collab',
    name: 'Project Management',
    description: 'Full project and task management capabilities',
    scopes: JSON.stringify(['collab.tasks.read', 'collab.tasks.create', 'collab.tasks.assign', 'collab.projects.manage']),
    uiModules: JSON.stringify(['TaskBoard', 'TaskList', 'TaskForm', 'ProjectSettings', 'TeamManagement']),
  },
  
  // DJQ recipes
  {
    id: 'djq-view',
    connectorId: 'djq',
    name: 'View Live Queue',
    description: 'Display the current music queue',
    scopes: JSON.stringify(['djq.queue.read']),
    uiModules: JSON.stringify(['QueueDisplay', 'NowPlaying']),
  },
  {
    id: 'djq-request',
    connectorId: 'djq',
    name: 'Add to Queue',
    description: 'Let users request songs',
    scopes: JSON.stringify(['djq.queue.read', 'djq.queue.write']),
    uiModules: JSON.stringify(['QueueDisplay', 'NowPlaying', 'SongSearch', 'RequestForm']),
  },
  {
    id: 'djq-dj',
    connectorId: 'djq',
    name: 'DJ Controls',
    description: 'Full DJ session management',
    scopes: JSON.stringify(['djq.queue.read', 'djq.queue.write', 'djq.queue.manage', 'djq.session.create']),
    uiModules: JSON.stringify(['QueueDisplay', 'NowPlaying', 'SongSearch', 'RequestForm', 'DJControls', 'SessionManager']),
  },
  
  // Game Night recipes
  {
    id: 'gamenight-spectate',
    connectorId: 'gamenight',
    name: 'Spectate Matches',
    description: 'View ongoing matches and tournament brackets',
    scopes: JSON.stringify(['gamenight.matches.read']),
    uiModules: JSON.stringify(['MatchList', 'TournamentBracket', 'Leaderboard']),
  },
  {
    id: 'gamenight-play',
    connectorId: 'gamenight',
    name: 'Join Games',
    description: 'Join matches and submit results',
    scopes: JSON.stringify(['gamenight.matches.read', 'gamenight.matches.join', 'gamenight.results.submit']),
    uiModules: JSON.stringify(['MatchList', 'TournamentBracket', 'Leaderboard', 'MatchLobby', 'ResultForm']),
  },
  {
    id: 'gamenight-organize',
    connectorId: 'gamenight',
    name: 'Tournament Organizer',
    description: 'Create and manage tournaments',
    scopes: JSON.stringify(['gamenight.matches.read', 'gamenight.matches.join', 'gamenight.results.submit', 'gamenight.tournaments.create']),
    uiModules: JSON.stringify(['MatchList', 'TournamentBracket', 'Leaderboard', 'MatchLobby', 'ResultForm', 'TournamentCreator', 'OrganizerDashboard']),
  },
];

// First-party App Blocks that can act as providers
const FIRST_PARTY_PROVIDERS = [
  {
    id: 'block_events',
    name: 'Events District',
    slug: 'events',
    description: 'Official Renaissance City Events platform. Browse, create, and manage city-wide events and gatherings.',
    category: 'events' as const,
    iconUrl: '/connectors/events.svg',
    baseApiUrl: '/api/districts/events',
    scopes: [
      { name: 'events.read', description: 'View upcoming and past events', isPublicRead: true, requiredRole: null },
      { name: 'events.publish', description: 'Publish new events to the city calendar', isPublicRead: false, requiredRole: 'creator' },
      { name: 'events.approve', description: 'Approve or reject pending events', isPublicRead: false, requiredRole: 'organizer' },
      { name: 'events.checkin', description: 'Check in attendees to events', isPublicRead: false, requiredRole: 'organizer' },
      { name: 'events.manage', description: 'Full event management access', isPublicRead: false, requiredRole: 'admin' },
    ],
    tags: ['official', 'events', 'calendar', 'gatherings'],
  },
  {
    id: 'block_collab',
    name: 'Collab',
    slug: 'collab',
    description: 'Official collaborative workspace. Manage tasks, projects, and team coordination across the city.',
    category: 'tools' as const,
    iconUrl: '/connectors/collab.svg',
    baseApiUrl: '/api/districts/collab',
    scopes: [
      { name: 'collab.tasks.read', description: 'View tasks and projects', isPublicRead: false, requiredRole: 'member' },
      { name: 'collab.tasks.create', description: 'Create new tasks and projects', isPublicRead: false, requiredRole: 'member' },
      { name: 'collab.tasks.assign', description: 'Assign tasks to team members', isPublicRead: false, requiredRole: 'creator' },
      { name: 'collab.projects.manage', description: 'Create and manage projects', isPublicRead: false, requiredRole: 'organizer' },
    ],
    tags: ['official', 'tasks', 'projects', 'teamwork'],
  },
  {
    id: 'block_djq',
    name: 'DJQ',
    slug: 'djq',
    description: 'Official music queue and DJ sessions platform. Host and participate in live audio experiences.',
    category: 'music' as const,
    iconUrl: '/connectors/djq.svg',
    baseApiUrl: '/api/districts/djq',
    scopes: [
      { name: 'djq.queue.read', description: 'View the current music queue', isPublicRead: true, requiredRole: null },
      { name: 'djq.queue.write', description: 'Add songs to the queue', isPublicRead: false, requiredRole: 'member' },
      { name: 'djq.queue.manage', description: 'Reorder, skip, or remove songs', isPublicRead: false, requiredRole: 'organizer' },
      { name: 'djq.session.create', description: 'Start new DJ sessions', isPublicRead: false, requiredRole: 'creator' },
    ],
    tags: ['official', 'music', 'dj', 'audio', 'detroit'],
  },
  {
    id: 'block_gamenight',
    name: 'Game Night',
    slug: 'gamenight',
    description: 'Official gaming platform. Join multiplayer games, tournaments, and competitive events.',
    category: 'games' as const,
    iconUrl: '/connectors/gamenight.svg',
    baseApiUrl: '/api/districts/gamenight',
    scopes: [
      { name: 'gamenight.matches.read', description: 'View matches and tournaments', isPublicRead: true, requiredRole: null },
      { name: 'gamenight.matches.join', description: 'Join available matches', isPublicRead: false, requiredRole: 'member' },
      { name: 'gamenight.results.submit', description: 'Submit match results', isPublicRead: false, requiredRole: 'member' },
      { name: 'gamenight.tournaments.create', description: 'Create new tournaments', isPublicRead: false, requiredRole: 'organizer' },
    ],
    tags: ['official', 'games', 'tournaments', 'esports'],
  },
];

// System user for first-party blocks (fixed UUID)
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001';

async function seedConnectors() {
  const db = getDb();
  
  console.log('🌱 Seeding connectors...');
  
  // Insert connectors
  for (const connector of V1_CONNECTORS) {
    try {
      await db.insert(connectors).values(connector).onConflictDoNothing();
      console.log(`  ✓ Connector: ${connector.name}`);
    } catch (error) {
      console.log(`  ⚠ Connector ${connector.name} may already exist`);
    }
  }
  
  console.log('\n🌱 Seeding scopes...');
  
  // Insert scopes
  for (const scope of V1_SCOPES) {
    try {
      await db.insert(scopes).values(scope).onConflictDoNothing();
      console.log(`  ✓ Scope: ${scope.name}`);
    } catch (error) {
      console.log(`  ⚠ Scope ${scope.name} may already exist`);
    }
  }
  
  console.log('\n🌱 Seeding recipes...');
  
  // Insert recipes
  for (const recipe of V1_RECIPES) {
    try {
      await db.insert(connectorRecipes).values(recipe).onConflictDoNothing();
      console.log(`  ✓ Recipe: ${recipe.name}`);
    } catch (error) {
      console.log(`  ⚠ Recipe ${recipe.name} may already exist`);
    }
  }
  
  console.log('\n🌱 Seeding first-party providers...');
  
  // Ensure system user exists
  try {
    await db.insert(users).values({
      id: SYSTEM_USER_ID,
      username: 'renaissance_city',
      displayName: 'Renaissance City',
    }).onConflictDoNothing();
    console.log('  ✓ System user created/verified');
  } catch (error) {
    console.log('  ⚠ System user may already exist');
  }
  
  // Insert first-party app blocks, registry entries, and providers
  for (const provider of FIRST_PARTY_PROVIDERS) {
    try {
      // Create App Block
      await db.insert(appBlocks).values({
        id: provider.id,
        name: provider.name,
        ownerUserId: SYSTEM_USER_ID,
        description: provider.description,
        iconUrl: provider.iconUrl,
      }).onConflictDoNothing();
      console.log(`  ✓ App Block: ${provider.name}`);
      
      // Create Registry Entry
      const registryId = uuidv4();
      await db.insert(appBlockRegistry).values({
        id: registryId,
        appBlockId: provider.id,
        slug: provider.slug,
        displayName: provider.name,
        description: provider.description,
        iconUrl: provider.iconUrl,
        category: provider.category,
        visibility: 'public',
        installable: true,
        requiresApproval: false,
        tags: JSON.stringify(provider.tags),
      }).onConflictDoNothing();
      console.log(`    ✓ Registry: ${provider.slug}`);
      
      // Create Provider (or get existing)
      let providerId: string;
      const existingProvider = await db.select()
        .from(appBlockProviders)
        .where(eq(appBlockProviders.appBlockId, provider.id))
        .limit(1);
      
      if (existingProvider.length > 0) {
        providerId = existingProvider[0].id;
        console.log(`    ✓ Provider already exists`);
      } else {
        providerId = uuidv4();
        await db.insert(appBlockProviders).values({
          id: providerId,
          appBlockId: provider.id,
          baseApiUrl: provider.baseApiUrl,
          apiVersion: 'v1',
          authMethods: JSON.stringify(['user', 'service']),
          status: 'active',
          rateLimitPerMinute: 120,
        });
        console.log(`    ✓ Provider configured`);
      }
      
      // Create Provider Scopes (skip if already exist)
      const existingScopes = await db.select()
        .from(providerScopes)
        .where(eq(providerScopes.providerId, providerId));
      
      if (existingScopes.length === 0) {
        for (const scope of provider.scopes) {
          await db.insert(providerScopes).values({
            id: uuidv4(),
            providerId: providerId,
            scopeName: scope.name,
            description: scope.description,
            isPublicRead: scope.isPublicRead,
            requiredRole: scope.requiredRole,
          });
        }
        console.log(`    ✓ ${provider.scopes.length} scopes added`);
      } else {
        console.log(`    ✓ ${existingScopes.length} scopes already exist`);
      }
      
    } catch (error) {
      console.log(`  ⚠ Provider ${provider.name} may already exist:`, error);
    }
  }
  
  console.log('\n✅ Seeding complete!');
}

// Export for programmatic use
export { seedConnectors, V1_CONNECTORS, V1_SCOPES, V1_RECIPES, FIRST_PARTY_PROVIDERS };

// Run if called directly
if (require.main === module) {
  seedConnectors()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
