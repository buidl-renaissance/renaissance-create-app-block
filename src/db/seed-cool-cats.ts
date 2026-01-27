import { getDb } from './drizzle';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { 
  appBlocks,
  users,
  serviceAccounts,
} from './schema';
import { createHash, randomBytes } from 'crypto';

/**
 * Seed the database with the "Cool Cats" app block for local development
 * Run with: npx tsx src/db/seed-cool-cats.ts
 */

// Local dev user (fixed UUID for consistency)
const LOCAL_DEV_USER_ID = '00000000-0000-0000-0000-000000000002';
const COOL_CATS_BLOCK_ID = 'cool-cats-local-dev';

// GitHub repository configuration
const COOL_CATS_GITHUB_CONFIG = {
  repoOwner: 'buidl-renaissance',
  repoName: 'renaissance-cool-cats',
  workflowFile: 'claude-automation.yml',
  branch: 'main',
};

// PRD data structured according to the schema
const COOL_CATS_PRD = {
  overview: {
    problem: 'This platform addresses the challenge of cat overpopulation and the need for more effective adoption channels, making it easier for cats to find loving homes.',
    description: 'Cool Cats is a community-driven platform that connects cat enthusiasts with adoption agencies to facilitate the sharing of cat photos and stories. It aims to enhance the cat adoption process while fostering a supportive network for cat lovers.',
    blockName: 'Cool Cats',
    blockType: 'community',
  },
  targetAudience: {
    description: 'Individuals passionate about cat welfare and adoption.',
    demographics: [
      'Age: 18-45',
      'Pet owners or prospective pet adopters',
      'Social media users',
      'Local community members in Detroit',
    ],
    painPoints: [
      'Difficulty in finding adoptable cats',
      'Limited awareness of local adoption events',
      'Lack of community engagement around cat welfare',
      'Need for a platform to share and celebrate cat stories',
    ],
  },
  features: {
    mustHave: [
      {
        name: 'Photo Sharing',
        description: 'Allow users to upload and share photos of cats in need of adoption, fostering engagement.',
      },
      {
        name: 'Social Feed Interaction',
        description: 'Enable commenting and liking on shared photos to create community interactions.',
      },
    ],
    shouldHave: [
      {
        name: 'Event Listings',
        description: 'Provide a calendar of events related to cat adoption and community awareness.',
      },
      {
        name: 'Member Profiles',
        description: 'Create profiles for members to showcase available cats and share personal stories.',
      },
    ],
    niceToHave: [
      {
        name: 'Collaboration Tools',
        description: 'Facilitate partnerships with local adoption agencies for events and promotions.',
      },
    ],
    futureIdeas: [],
  },
  technicalRequirements: [
    'User authentication system',
    'Photo upload and storage solution',
    'Social interaction capabilities (likes, comments)',
    'Event management system',
  ],
  successMetrics: [
    'Number of cats successfully adopted through the platform',
    'Engagement metrics (likes, comments, shares)',
    'Number of active users and profiles created',
    'Partnerships established with adoption agencies',
  ],
  timeline: {
    phases: [
      {
        name: 'Phase 1: Launch',
        description: 'Develop core features and launch the Cool Cats platform.',
      },
      {
        name: 'Phase 2: Community Building',
        description: 'Focus on user engagement and partnerships with local agencies.',
      },
      {
        name: 'Phase 3: Expansion',
        description: 'Introduce additional features based on user feedback and community needs.',
      },
    ],
  },
};

// Onboarding data includes summary and PRD
const COOL_CATS_ONBOARDING_DATA = {
  summary: {
    name: 'Cool Cats',
    tagline: 'Connecting cat lovers with cats in need of homes',
    description: 'A community-driven platform that connects cat enthusiasts with adoption agencies to facilitate the sharing of cat photos and stories.',
    targetAudience: 'Cat lovers, pet adopters, and local community members passionate about cat welfare in Detroit',
    coreFeatures: [
      'Photo sharing for adoptable cats',
      'Social feed with likes and comments',
      'Event calendar for adoption events',
      'Member profiles for agencies and individuals',
      'Collaboration tools with adoption agencies',
    ],
    nextSteps: [
      'Set up user authentication',
      'Configure photo upload and storage',
      'Build social interaction features',
      'Create event management system',
    ],
  },
  processedAnswers: [
    {
      question: 'What problem does your app block solve?',
      answer: 'Cat overpopulation and the need for more effective adoption channels',
      keyPoints: ['Cat overpopulation', 'Adoption channels', 'Finding loving homes'],
    },
    {
      question: 'Who is your target audience?',
      answer: 'Individuals passionate about cat welfare and adoption, ages 18-45, in the Detroit area',
      keyPoints: ['Cat enthusiasts', 'Pet adopters', 'Detroit community'],
    },
    {
      question: 'What are the core features?',
      answer: 'Photo sharing, social feed interaction, event listings, member profiles, and collaboration tools',
      keyPoints: ['Photo sharing', 'Social features', 'Events', 'Profiles'],
    },
  ],
  prd: COOL_CATS_PRD,
};

function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

function generateApiKey(): string {
  return `rc_${randomBytes(32).toString('hex')}`;
}

async function seedCoolCats() {
  const db = getDb();
  
  console.log('🐱 Seeding Cool Cats app block...\n');
  
  // Ensure local dev user exists
  try {
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, LOCAL_DEV_USER_ID))
      .limit(1);
    
    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: LOCAL_DEV_USER_ID,
        username: 'local_dev',
        displayName: 'Local Developer',
      });
      console.log('  ✓ Local dev user created');
    } else {
      console.log('  ✓ Local dev user already exists');
    }
  } catch (error) {
    console.log('  ⚠ Error with local dev user:', error);
  }
  
  // Check if Cool Cats already exists
  const existingBlock = await db.select()
    .from(appBlocks)
    .where(eq(appBlocks.id, COOL_CATS_BLOCK_ID))
    .limit(1);
  
  if (existingBlock.length > 0) {
    console.log('  ✓ Cool Cats block already exists, updating...');
    
    // Update existing block
    await db.update(appBlocks)
      .set({
        name: 'Cool Cats',
        description: 'A community-driven platform that connects cat enthusiasts with adoption agencies to facilitate the sharing of cat photos and stories.',
        status: 'active',
        blockType: 'community',
        onboardingStage: 'complete',
        onboardingData: JSON.stringify(COOL_CATS_ONBOARDING_DATA),
        githubRepoOwner: COOL_CATS_GITHUB_CONFIG.repoOwner,
        githubRepoName: COOL_CATS_GITHUB_CONFIG.repoName,
        githubWorkflowFile: COOL_CATS_GITHUB_CONFIG.workflowFile,
        githubBranch: COOL_CATS_GITHUB_CONFIG.branch,
        updatedAt: new Date(),
      })
      .where(eq(appBlocks.id, COOL_CATS_BLOCK_ID));
    
    console.log('  ✓ Cool Cats block updated');
  } else {
    // Create Cool Cats app block
    try {
      await db.insert(appBlocks).values({
        id: COOL_CATS_BLOCK_ID,
        name: 'Cool Cats',
        ownerUserId: LOCAL_DEV_USER_ID,
        description: 'A community-driven platform that connects cat enthusiasts with adoption agencies to facilitate the sharing of cat photos and stories.',
        iconUrl: null, // Can be set later
        status: 'active',
        blockType: 'community',
        onboardingStage: 'complete',
        onboardingData: JSON.stringify(COOL_CATS_ONBOARDING_DATA),
        githubRepoOwner: COOL_CATS_GITHUB_CONFIG.repoOwner,
        githubRepoName: COOL_CATS_GITHUB_CONFIG.repoName,
        githubWorkflowFile: COOL_CATS_GITHUB_CONFIG.workflowFile,
        githubBranch: COOL_CATS_GITHUB_CONFIG.branch,
      });
      console.log('  ✓ Cool Cats block created');
      
      // Create service account for the block
      const serviceAccountId = uuidv4();
      const apiKey = generateApiKey();
      const apiKeyHash = hashApiKey(apiKey);
      
      await db.insert(serviceAccounts).values({
        id: serviceAccountId,
        appBlockId: COOL_CATS_BLOCK_ID,
        apiKeyHash,
      });
      
      // Update block with service account reference
      await db.update(appBlocks)
        .set({ serviceAccountId })
        .where(eq(appBlocks.id, COOL_CATS_BLOCK_ID));
      
      console.log('  ✓ Service account created');
      console.log(`    API Key (save this!): ${apiKey}`);
      
    } catch (error) {
      console.log('  ⚠ Error creating Cool Cats block:', error);
    }
  }
  
  console.log('\n✅ Cool Cats seeding complete!');
  console.log('\n📋 Block Details:');
  console.log(`   ID: ${COOL_CATS_BLOCK_ID}`);
  console.log(`   Name: Cool Cats`);
  console.log(`   Type: community`);
  console.log(`   Status: active`);
  console.log(`   Owner: ${LOCAL_DEV_USER_ID} (local_dev)`);
  console.log(`   GitHub: https://github.com/${COOL_CATS_GITHUB_CONFIG.repoOwner}/${COOL_CATS_GITHUB_CONFIG.repoName}`);
}

// Export for programmatic use
export { seedCoolCats, COOL_CATS_BLOCK_ID, COOL_CATS_PRD, COOL_CATS_ONBOARDING_DATA, COOL_CATS_GITHUB_CONFIG, LOCAL_DEV_USER_ID };

// Run if called directly
if (require.main === module) {
  seedCoolCats()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
