export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 py-24 px-6">
      <div className="max-w-3xl mx-auto prose prose-invert prose-slate">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>By accessing or using FlowStage, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Use License</h2>
        <p>Permission is granted to temporarily download one copy of the materials (information or software) on FlowStage's website for personal, non-commercial transitory viewing only.</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Disclaimer</h2>
        <p>The materials on FlowStage's website are provided on an 'as is' basis. FlowStage makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
      </div>
    </div>
  );
}
