/**
 * Renaissance People API client
 * Used to sync users across applications
 */

const PEOPLE_API_URL = process.env.RENAISSANCE_PEOPLE_API_URL;
const PEOPLE_API_KEY = process.env.RENAISSANCE_PEOPLE_API_KEY;

export interface PeopleUser {
  id: number;
  publicAddress: string;
  username: string | null;
  name: string | null;
  profilePicture: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SyncUserData {
  publicAddress: string;
  username?: string;
  name?: string;
  profilePicture?: string;
}

export interface SyncUserResponse {
  user: PeopleUser;
  created: boolean;
}

/**
 * Sync a user with the Renaissance People API
 * Creates or updates the user in the centralized database
 */
export async function syncUserWithPeopleApi(userData: SyncUserData): Promise<SyncUserResponse | null> {
  if (!PEOPLE_API_URL || !PEOPLE_API_KEY) {
    console.warn('[People API] API URL or Key not configured, skipping sync');
    return null;
  }

  try {
    console.log('[People API] Syncing user:', { 
      publicAddress: userData.publicAddress,
      username: userData.username 
    });

    const response = await fetch(`${PEOPLE_API_URL}/api/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': PEOPLE_API_KEY,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[People API] Sync failed:', {
        status: response.status,
        error: errorData,
      });
      return null;
    }

    const data = await response.json() as SyncUserResponse;
    console.log('[People API] User synced successfully:', {
      peopleUserId: data.user.id,
      created: data.created,
    });

    return data;
  } catch (error) {
    console.error('[People API] Error syncing user:', error);
    return null;
  }
}
