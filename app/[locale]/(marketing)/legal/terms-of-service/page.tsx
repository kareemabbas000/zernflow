import * as React from "react"

export default function TermsOfServicePage() {
  return (
    <div className="pt-32 pb-24 bg-[var(--bg)] min-h-screen">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 prose prose-slate">
        <h1 className="font-display text-4xl font-black text-[var(--text-primary)] mb-8">Terms of Service</h1>
        <p className="text-[var(--text-secondary)] mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-[var(--text-secondary)] leading-relaxed">
          <p>
            Please read these terms and conditions carefully before using Our Service.
          </p>

          <h2 className="font-bold text-2xl text-[var(--text-primary)] mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using FlowLoop, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
          </p>

          <h2 className="font-bold text-2xl text-[var(--text-primary)] mt-8 mb-4">2. Description of Service</h2>
          <p>
            FlowLoop provides an omnichannel customer communication platform, including visual flow builders and AI-assisted conversational tools. We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice.
          </p>

          <h2 className="font-bold text-2xl text-[var(--text-primary)] mt-8 mb-4">3. User Responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. You must not use the Service for any illegal or unauthorized purpose, including spamming or sending unsolicited promotional messages through connected channels (e.g., WhatsApp).
          </p>

          <h2 className="font-bold text-2xl text-[var(--text-primary)] mt-8 mb-4">4. API and Fair Usage</h2>
          <p>
            Our service may include integrations with third-party platforms. You agree to comply with the respective Terms of Service of any third-party integrations (e.g., Meta, OpenAI). Excessive usage of AI generation that exceeds reasonable limits may result in rate-limiting or account suspension.
          </p>

          <h2 className="font-bold text-2xl text-[var(--text-primary)] mt-8 mb-4">5. Limitation of Liability</h2>
          <p>
            In no event shall FlowLoop, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
        </div>
      </div>
    </div>
  )
}
