import React from 'react'

function FeatureCategory({ children, label }: { children: React.ReactNode; label: string }) {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium tracking-wider text-gray-400 uppercase">{label}</h3>
            <div className="space-y-3">{children}</div>
        </div>
    )
}

export default FeatureCategory