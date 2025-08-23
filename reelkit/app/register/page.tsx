'use client'
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

function Page() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            // react-query
            // loading, error, debounce
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed')
            }

            console.log('Registration successful:', data);
            router.push('/login');
        } catch (error) {
            console.error('Error during registration:', error);
        }
    };

    return (
        <div className="flex items-center justify-center w-full min-h-screen px-4 bg-gray-50 dark:bg-neutral-900">
            <div className="w-full max-w-md p-6 bg-white shadow-lg dark:bg-neutral-800 rounded-xl sm:p-8">
                <h1 className="mb-6 text-2xl font-semibold text-center text-gray-900 dark:text-white">Register</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-neutral-500 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" type='text' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-neutral-500 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
                    <input className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-neutral-500 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" type='password' placeholder='Confirm Password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <button type='submit' className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">Register</button>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Already have an account?{' '}
                        <a className="font-medium text-blue-600 hover:text-blue-700" href="/login">Login</a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Page
