'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentMode, logConfiguration } from '@/lib/config';

export default function TestLocalAuth() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Log configuration on mount
  if (typeof window !== 'undefined') {
    logConfiguration();
  }

  const mode = getCurrentMode();

  const handleSignIn = async () => {
    setMessage('');
    setError('');
    const result = await signIn(email, password);
    if (result.error) {
      setError(`Sign in failed: ${result.error.message}`);
    } else {
      setMessage('Sign in successful!');
    }
  };

  const handleSignUp = async () => {
    setMessage('');
    setError('');
    const result = await signUp(email, password);
    if (result.error) {
      setError(`Sign up failed: ${result.error.message}`);
    } else {
      setMessage('Sign up successful!');
    }
  };

  const handleSignOut = async () => {
    setMessage('');
    setError('');
    await signOut();
    setMessage('Signed out successfully!');
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Test Local Authentication</h1>

      {/* Configuration Status */}
      <div className="bg-gray-100 rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-2">Current Configuration:</h2>
        <ul className="space-y-1 text-sm">
          <li>Static Data: <span className="font-mono">{mode.staticData}</span></li>
          <li>Authentication: <span className="font-mono">{mode.auth}</span></li>
          <li>Environment: <span className="font-mono">{mode.environment}</span></li>
        </ul>
      </div>

      {/* User Status */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-2">Current User:</h2>
        {user ? (
          <div className="text-sm">
            <p>ID: <span className="font-mono">{user.id}</span></p>
            <p>Email: <span className="font-mono">{user.email || 'Anonymous'}</span></p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">Not signed in</p>
        )}
      </div>

      {/* Auth Actions */}
      {!user ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="test@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="password123"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSignIn}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Sign In
            </button>
            <button
              onClick={handleSignUp}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Sign Up
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Sign Out
        </button>
      )}

      {/* Messages */}
      {message && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
          {message}
        </div>
      )}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {/* Test Accounts */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Test Accounts (Local Mode):</h3>
        <ul className="text-sm space-y-1">
          <li>• test@example.com / password123</li>
          <li>• admin@example.com / admin123</li>
        </ul>
      </div>
    </div>
  );
}