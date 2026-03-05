'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface ApiKey {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export default function SettingsPage() {
  const { isAuthenticated, accessToken } = useAuthStore();
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<{ key: string; name: string } | null>(null);
  const [keysCopied, setKeysCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchApiKeys();
  }, [isAuthenticated]);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/auth/api-keys', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setApiKeys(response.data.apiKeys);
      setError('');
    } catch (err: any) {
      setError('Failed to load API keys');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      setError('Please enter a key name');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        '/api/auth/api-keys',
        { name: newKeyName },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setCreatedKey({ key: response.data.key, name: response.data.name });
      setNewKeyName('');
      setSuccess('API key created successfully. Save it in a secure location!');
      await fetchApiKeys();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleKey = async (keyId: string, currentState: boolean) => {
    try {
      await axios.patch(
        `/api/auth/api-keys/${keyId}`,
        { isActive: !currentState },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setSuccess(`API key ${!currentState ? 'enabled' : 'disabled'} successfully`);
      await fetchApiKeys();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setKeysCopied(true);
    setTimeout(() => setKeysCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your API keys and system settings</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-700 dark:text-green-200">{success}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* API Key Creation Card */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Create New API Key</h2>
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production Agent, Staging"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !newKeyName.trim()}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? 'Creating...' : 'Create API Key'}
              </button>
            </form>
          </div>

          {/* Created Key Display */}
          {createdKey && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">🎉 New API Key Created</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Name: <strong>{createdKey.name}</strong></p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded p-3 break-all font-mono text-sm text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{createdKey.key}</span>
                  <button
                    onClick={() => copyToClipboard(createdKey.key)}
                    className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
                  >
                    {keysCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  ⚠️ Save this key in a secure location. You will not see it again.
                </p>
              </div>
            </div>
          )}

          {/* API Keys List */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Your API Keys</h2>
            
            {loading && !apiKeys.length ? (
              <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                <p>Loading API keys...</p>
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                <p>No API keys yet. Create one above to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">{key.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Created {new Date(key.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          key.isActive
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                            : 'bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {key.isActive ? '✓ Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleToggleKey(key.id, key.isActive)}
                        className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-900 dark:text-white rounded transition-colors"
                      >
                        {key.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions Card */}
          <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-6 border border-slate-300 dark:border-slate-600">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">📖 How to Use API Keys</h3>
            <div className="space-y-2 text-slate-700 dark:text-slate-300 text-sm">
              <p>1. Create an API key above and save it securely</p>
              <p>2. Use it with your agents by setting the <code className="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded font-mono">x-api-key</code> header</p>
              <p>3. Example: <code className="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded font-mono text-xs">x-api-key: your-key-here</code></p>
              <p>4. Disable keys when they are no longer needed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
