import { eq, desc } from 'drizzle-orm';
import { getDb } from './drizzle';
import { blockSubmissions, type BlockSubmission, type NewBlockSubmission, type BlockSubmissionStatus } from './schema';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new block submission
 */
export async function createBlockSubmission(
  data: Omit<NewBlockSubmission, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'adminNotes'>
): Promise<BlockSubmission> {
  const db = getDb();
  const id = uuidv4();
  
  await db.insert(blockSubmissions).values({
    id,
    blockName: data.blockName,
    submitterName: data.submitterName,
    email: data.email,
    projectDescription: data.projectDescription,
    projectUrl: data.projectUrl,
    iconUrl: data.iconUrl,
    status: 'pending',
  });

  const submission = await db.select()
    .from(blockSubmissions)
    .where(eq(blockSubmissions.id, id))
    .get();
  
  if (!submission) {
    throw new Error('Failed to create block submission');
  }

  return submission;
}

/**
 * Get a block submission by ID
 */
export async function getBlockSubmissionById(id: string): Promise<BlockSubmission | null> {
  const db = getDb();
  const submission = await db.select()
    .from(blockSubmissions)
    .where(eq(blockSubmissions.id, id))
    .get();
  return submission || null;
}

/**
 * Get all block submissions (for admin)
 */
export async function getAllBlockSubmissions(): Promise<BlockSubmission[]> {
  const db = getDb();
  return db.select()
    .from(blockSubmissions)
    .orderBy(desc(blockSubmissions.createdAt))
    .all();
}

/**
 * Get block submissions by status
 */
export async function getBlockSubmissionsByStatus(status: BlockSubmissionStatus): Promise<BlockSubmission[]> {
  const db = getDb();
  return db.select()
    .from(blockSubmissions)
    .where(eq(blockSubmissions.status, status))
    .orderBy(desc(blockSubmissions.createdAt))
    .all();
}

/**
 * Update block submission status and optional admin notes
 */
export async function updateBlockSubmissionStatus(
  id: string,
  status: BlockSubmissionStatus,
  adminNotes?: string
): Promise<BlockSubmission | null> {
  const db = getDb();
  
  await db.update(blockSubmissions)
    .set({
      status,
      adminNotes,
      updatedAt: new Date(),
    })
    .where(eq(blockSubmissions.id, id));

  return getBlockSubmissionById(id);
}

/**
 * Check if a submission with the same email and block name already exists
 */
export async function hasExistingSubmission(email: string, blockName: string): Promise<boolean> {
  const db = getDb();
  const existing = await db.select()
    .from(blockSubmissions)
    .where(eq(blockSubmissions.email, email))
    .all();
  
  return existing.some(
    (submission) =>
      submission.blockName.toLowerCase() === blockName.toLowerCase() &&
      submission.status === 'pending'
  );
}
