import { Check } from 'lucide-react'

function FeatureItem({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 group">
    <div className="flex items-center justify-center flex-shrink-0 w-5 h-5 mt-1 transition-colors border rounded-full bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40 group-hover:bg-blue-500/20">
      <Check className="w-3 h-3 text-blue-400" />
    </div>
    <span className="text-gray-400 transition-colors group-hover:text-gray-300">{children}</span>
  </div>
    )
}

export default FeatureItem