import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { db } from './drizzle';
import { users } from './schema';

export interface User {
  id: string;
  renaissanceUserId?: string | null;
  username?: string | null;
  displayName?: string | null;
  pfpUrl?: string | null;
  publicAddress?: string | null;
  peopleUserId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserData {
  renaissanceUserId?: string;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  publicAddress?: string;
}

function rowToUser(row: typeof users.$inferSelect): User {
  return {
    id: row.id,
    renaissanceUserId: row.renaissanceUserId,
    username: row.username,
    displayName: row.displayName,
    pfpUrl: row.pfpUrl,
    publicAddress: row.publicAddress,
    peopleUserId: row.peopleUserId,
    createdAt: row.createdAt || new Date(),
    updatedAt: row.updatedAt || new Date(),
  };
}

export async function getUserByRenaissanceId(renaissanceUserId: string): Promise<User | null> {
  const results = await db
    .select()
    .from(users)
    .where(eq(users.renaissanceUserId, renaissanceUserId))
    .limit(1);
  
  if (results.length === 0) return null;
  return rowToUser(results[0]);
}

export async function getUserById(userId: string): Promise<User | null> {
  const results = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (results.length === 0) return null;
  return rowToUser(results[0]);
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const results = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  
  if (results.length === 0) return null;
  return rowToUser(results[0]);
}

export async function getOrCreateUserByRenaissanceId(
  renaissanceUserId: string,
  userData?: UserData
): Promise<User> {
  const existing = await getUserByRenaissanceId(renaissanceUserId);
  
  if (existing) {
    // Update user if new data is provided
    if (userData) {
      const now = new Date();
      const updateData: {
        username?: string | null;
        displayName?: string | null;
        pfpUrl?: string | null;
        updatedAt: Date;
      } = { updatedAt: now };
      
      if (userData.username !== undefined) updateData.username = userData.username;
      if (userData.displayName !== undefined) updateData.displayName = userData.displayName;
      if (userData.pfpUrl !== undefined) updateData.pfpUrl = userData.pfpUrl;
      
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, existing.id));
      
      return {
        ...existing,
        ...updateData,
      };
    }
    
    return existing;
  }
  
  // Create new user
  const id = uuidv4();
  const now = new Date();
  const newUser = {
    id,
    renaissanceUserId,
    username: userData?.username || null,
    displayName: userData?.displayName || null,
    pfpUrl: userData?.pfpUrl || null,
    publicAddress: userData?.publicAddress || null,
    createdAt: now,
    updatedAt: now,
  };
  
  await db.insert(users).values(newUser);
  
  return rowToUser(newUser as typeof users.$inferSelect);
}

export async function updateUserPeopleId(userId: string, peopleUserId: number): Promise<void> {
  await db
    .update(users)
    .set({ peopleUserId, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function updateUserPublicAddress(userId: string, publicAddress: string): Promise<void> {
  await db
    .update(users)
    .set({ publicAddress, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export interface UpdateUserData {
  displayName?: string | null;
  pfpUrl?: string | null;
}

export async function updateUser(userId: string, data: UpdateUserData): Promise<User | null> {
  const existing = await getUserById(userId);
  if (!existing) return null;

  const updateData: {
    displayName?: string | null;
    pfpUrl?: string | null;
    updatedAt: Date;
  } = { updatedAt: new Date() };

  if (data.displayName !== undefined) {
    updateData.displayName = data.displayName;
  }
  if (data.pfpUrl !== undefined) {
    updateData.pfpUrl = data.pfpUrl;
  }

  await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId));

  return {
    ...existing,
    ...updateData,
  };
}
