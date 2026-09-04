import * as React from "react"

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-32 pb-24 bg-[var(--paper)] min-h-screen">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 prose prose-slate">
        <h1 className="font-display text-4xl font-black text-[var(--ink)] mb-8">Privacy Policy</h1>
        <p className="text-[var(--ink-2)] mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-[var(--ink-2)] leading-relaxed">
          <p>
            FlowStage ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by FlowStage.
          </p>

          <h2 className="font-bold text-2xl text-[var(--ink)] mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect information from you when you register on our site, place an order, subscribe to our newsletter, respond to a survey, or fill out a form. 
            This includes account data, integration metadata, and conversation logs necessary to provide our service.
          </p>

          <h2 className="font-bold text-2xl text-[var(--ink)] mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            Any of the information we collect from you may be used in one of the following ways:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>To personalize your experience</li>
            <li>To improve our website and application</li>
            <li>To improve customer service</li>
            <li>To process transactions</li>
            <li>To send periodic emails and product updates</li>
          </ul>

          <h2 className="font-bold text-2xl text-[var(--ink)] mt-8 mb-4">3. Data Security & AI Processing</h2>
          <p>
            We implement a variety of security measures to maintain the safety of your personal information. When using our Native AI Copilot features, your conversational data may be processed by third-party LLM providers (e.g., OpenAI, Anthropic) strictly for the purpose of generating responses. We do not use your private conversational data to train our foundational models.
          </p>

          <h2 className="font-bold text-2xl text-[var(--ink)] mt-8 mb-4">4. Contact Us</h2>
          <p>
            If you have any questions regarding this privacy policy, you may contact us using the information below:
            <br /><br />
            legal@flowstage.io
          </p>
        </div>
      </div>
    </div>
  )
}
