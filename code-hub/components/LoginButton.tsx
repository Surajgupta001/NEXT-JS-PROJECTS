import { SignInButton } from '@clerk/nextjs';
import { LogIn } from 'lucide-react';
import React from 'react'

function LoginButton() {
    return (
        <SignInButton mode="modal">
            <button
                className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/20"
            >
                <LogIn className="w-4 h-4 transition-transform" />
                <span>Sign In</span>
            </button>
        </SignInButton>
    )
}

export default LoginButton