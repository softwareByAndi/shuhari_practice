// Local/Mock Auth Provider for development
// This provides authentication functionality without requiring Supabase connection

export type LocalUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type LocalSession = {
  user: LocalUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

// Storage keys for browser localStorage
const STORAGE_KEYS = {
  SESSION: 'local_auth_session',
  USER: 'local_auth_user',
} as const;

// Mock users database (in production, these would be in a real database)
const MOCK_USERS: Map<string, { password: string; user: LocalUser }> = new Map([
  ['test@example.com', {
    password: 'password123',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'test@example.com',
      user_metadata: { name: 'Test User' },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }
  }],
  ['admin@example.com', {
    password: 'admin123',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'admin@example.com',
      user_metadata: { name: 'Admin User', role: 'admin' },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }
  }],
]);

// Event emitter for auth state changes
type AuthChangeCallback = (event: string, session: LocalSession | null) => void;
const authCallbacks: Set<AuthChangeCallback> = new Set();

function emitAuthChange(event: string, session: LocalSession | null) {
  authCallbacks.forEach(callback => {
    try {
      callback(event, session);
    } catch (error) {
      console.error('Error in auth change callback:', error);
    }
  });
}

// Helper functions for localStorage
function getStoredSession(): LocalSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!stored) return null;

    const session = JSON.parse(stored) as LocalSession;

    // Check if session is expired
    if (session.expires_at < Date.now()) {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      localStorage.removeItem(STORAGE_KEYS.USER);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error reading session from localStorage:', error);
    return null;
  }
}

function storeSession(session: LocalSession | null) {
  if (typeof window === 'undefined') return;

  try {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(session.user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  } catch (error) {
    console.error('Error storing session in localStorage:', error);
  }
}

// Generate mock tokens
function generateMockToken(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
}

function createSession(user: LocalUser): LocalSession {
  return {
    user,
    access_token: generateMockToken('access'),
    refresh_token: generateMockToken('refresh'),
    expires_at: Date.now() + (60 * 60 * 24 * 7 * 1000), // 7 days from now
  };
}

// Main auth functions
export async function getSession(): Promise<{ data: { session: LocalSession | null }, error: null }> {
  const session = getStoredSession();
  return { data: { session }, error: null };
}

export async function signUp(email: string, password: string): Promise<{ data: { user: LocalUser | null, session: LocalSession | null }, error: Error | null }> {
  // Check if user already exists
  if (MOCK_USERS.has(email)) {
    return {
      data: { user: null, session: null },
      error: new Error('User already exists')
    };
  }

  // Create new user
  const newUser: LocalUser = {
    id: `550e8400-e29b-41d4-a716-${Math.random().toString(36).substr(2, 12)}`,
    email,
    user_metadata: { name: email.split('@')[0] },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Store in mock database
  MOCK_USERS.set(email, { password, user: newUser });

  // Create session
  const session = createSession(newUser);
  storeSession(session);

  // Emit auth change event
  setTimeout(() => emitAuthChange('SIGNED_IN', session), 0);

  return {
    data: { user: newUser, session },
    error: null
  };
}

export async function signInWithPassword(email: string, password: string): Promise<{ data: { user: LocalUser | null, session: LocalSession | null }, error: Error | null }> {
  const userData = MOCK_USERS.get(email);

  if (!userData) {
    return {
      data: { user: null, session: null },
      error: new Error('Invalid email or password')
    };
  }

  if (userData.password !== password) {
    return {
      data: { user: null, session: null },
      error: new Error('Invalid email or password')
    };
  }

  // Create session
  const session = createSession(userData.user);
  storeSession(session);

  // Emit auth change event
  setTimeout(() => emitAuthChange('SIGNED_IN', session), 0);

  return {
    data: { user: userData.user, session },
    error: null
  };
}

export async function signOut(): Promise<{ error: Error | null }> {
  storeSession(null);

  // Emit auth change event
  setTimeout(() => emitAuthChange('SIGNED_OUT', null), 0);

  return { error: null };
}

export function onAuthStateChange(callback: AuthChangeCallback): { data: { subscription: { unsubscribe: () => void } } } {
  authCallbacks.add(callback);

  // Immediately call with current session
  const session = getStoredSession();
  if (session) {
    callback('INITIAL_SESSION', session);
  }

  return {
    data: {
      subscription: {
        unsubscribe: () => {
          authCallbacks.delete(callback);
        }
      }
    }
  };
}

// Anonymous user support (for local development)
export function createAnonymousUser(): LocalUser {
  return {
    id: `anon_${Math.random().toString(36).substr(2, 12)}`,
    email: undefined,
    user_metadata: { is_anonymous: true },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function signInAnonymously(): Promise<{ data: { user: LocalUser | null, session: LocalSession | null }, error: Error | null }> {
  const user = createAnonymousUser();
  const session = createSession(user);
  storeSession(session);

  // Emit auth change event
  setTimeout(() => emitAuthChange('SIGNED_IN', session), 0);

  return {
    data: { user, session },
    error: null
  };
}