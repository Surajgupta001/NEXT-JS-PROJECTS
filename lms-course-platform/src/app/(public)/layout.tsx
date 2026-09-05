import React from 'react'
import Navbar from './_components/Navbar'

export default function LayoutPublic({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Navbar />
            <main className='container px-4 mb-32 max-auto md:px-6 lg:px-8'>{children}</main>
        </div>
    )
}
