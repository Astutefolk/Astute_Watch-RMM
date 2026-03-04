'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🛡️</div>
      <h1 className="text-4xl font-bold mb-4">DATTO RMM</h1>
      <p className="text-xl text-gray-600 mb-8">
        Remote Monitoring and Management Platform
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
