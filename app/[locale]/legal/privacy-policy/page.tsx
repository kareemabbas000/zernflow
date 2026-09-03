export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 py-24 px-6">
      <div className="max-w-3xl mx-auto prose prose-invert prose-slate">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
        <p>When you use FlowStage, we collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This includes your name, email address, phone number, and payment information.</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. How We Use Information</h2>
        <p>We use the information we collect about you to provide, maintain, and improve our services, including providing customer support, processing transactions, and sending related information, such as confirmations and invoices.</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Data Security</h2>
        <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
      </div>
    </div>
  );
}
