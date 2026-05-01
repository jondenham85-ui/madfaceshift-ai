'use client';

import { useState } from 'react';

export default function WaitlistForm() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [status, setStatus] = useState>'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
                const res = await fetch('/api/waitlist', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email, name }),
                });
                const data = await res.json();
                if (res.ok) {
                          setStatus('success');
                          setMessage(data.message);
                          setEmail('');
                          setName('');
                } else {
                          setStatus('error');
                          setMessage(data.error || 'Something went wrong');
                }
        } catch {
                setStatus('error');
                setMessage('Network error. Please try again.');
        }
  };

  return (
        >section className="py-16 px-4 bg-gradient-to-b from-gray-900 to-black">
          >div className="max-w-md mx-auto text-center">
            >h2 className="text-3xl font-bold text-white mb-2">Join the Waitlist>/h2>
          >p className="text-gray-400 mb-8">Be the first to unlock premium AI face-swap features.>/p>
  {status === 'success' ? (
              >div className="bg-green-900/50 border border-green-500 rounded-lg p-6">
                >p className="text-green-400 text-lg font-semibold">{message}>/p>
              >/div>
            ) : (
              >form onSubmit={handleSubmit} className="space-y-4">
                >input
                 type="text"
                 placeholder="Your name (optional)"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
               />
                               >input
                 type="email"
                 placeholder="Enter your email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
                 className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
               />
                               >button
                 type="submit"
                 disabled={status === 'loading'}
                                 className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
               >
                 {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
                               >/button>
   {status === 'error' && >p className="text-red-400 text-sm">{message}>/p>}
              >/form>
            )}
         >/div>
       >/section>
     );
  }
