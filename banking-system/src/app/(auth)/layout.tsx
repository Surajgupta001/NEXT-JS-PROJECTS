import React from 'react'

function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div>
            AuthLayout
            {children}
        </div>
    )
}

export default AuthLayout
