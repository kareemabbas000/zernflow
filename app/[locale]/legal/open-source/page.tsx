import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ArrowLeft, ShieldCheck, FileText, Code2, Heart } from "lucide-react";

export const metadata = {
  title: "Open Source Notices & Legal Attribution | KA COMM",
  description: "Third-party open-source notices, MIT licenses, and software attributions for KA COMM.",
};

export default function OpenSourceLegalPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <BrandLogo size="sm" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 w-full space-y-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            Legal & Compliance
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Open Source Software Notices</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            KA COMM incorporates and builds upon open-source software libraries. In accordance with license terms,
            below are the legal notices, acknowledgments, and copyright declarations for the open-source components used.
          </p>
        </div>

        {/* Architecture & Intellectual Property Distinction */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Software Architecture & Attribution</h2>
              <p className="text-xs text-muted-foreground">Original code, custom modifications, and third-party modules</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">KA COMM</strong> is an AI-powered omnichannel customer communication platform
              engineered and developed by <strong className="text-foreground">Kareem Abbas</strong>.
            </p>
            <p>
              Certain core components and templates incorporate portions of MIT-licensed open-source code.
              All modified files and newly authored subsystems (including the custom Headless OAuth Engine, Multi-Channel Handlers,
              Dynamic Realtime Inbox Subscriptions, and UI Architecture) are maintained under applicable licenses.
            </p>
          </div>
        </section>

        {/* MIT License Notice */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">The MIT License (MIT)</h2>
              <p className="text-xs text-muted-foreground">Standard Open-Source License Terms</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-muted/30 p-5 font-mono text-xs text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Permission is hereby granted, free of charge, to any person obtaining a copy
              of this software and associated documentation files (the &quot;Software&quot;), to deal
              in the Software without restriction, including without limitation the rights
              to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
              copies of the Software, and to permit persons to whom the Software is
              furnished to do so, subject to the following conditions:
            </p>
            <p>
              The above copyright notice and this permission notice shall be included in all
              copies or substantial portions of the Software.
            </p>
            <p className="uppercase font-sans font-semibold text-[11px] text-foreground">
              THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
              AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
              LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
              OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
              SOFTWARE.
            </p>
          </div>
        </section>

        {/* Key Open Source Libraries */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-foreground">Third-Party Libraries & Dependencies</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-border p-3 bg-muted/20">
              <div className="font-semibold text-foreground">Next.js & React</div>
              <div className="text-muted-foreground mt-0.5">MIT License © Vercel, Inc. & Meta, Inc.</div>
            </div>
            <div className="rounded-lg border border-border p-3 bg-muted/20">
              <div className="font-semibold text-foreground">Supabase Client & Auth</div>
              <div className="text-muted-foreground mt-0.5">Apache-2.0 / MIT License © Supabase, Inc.</div>
            </div>
            <div className="rounded-lg border border-border p-3 bg-muted/20">
              <div className="font-semibold text-foreground">Tailwind CSS & Lucide Icons</div>
              <div className="text-muted-foreground mt-0.5">MIT License © Tailwind Labs & Lucide Contributors</div>
            </div>
            <div className="rounded-lg border border-border p-3 bg-muted/20">
              <div className="font-semibold text-foreground">XYFlow / React Flow</div>
              <div className="text-muted-foreground mt-0.5">MIT License © webkid GmbH</div>
            </div>
          </div>
        </section>
      </main>

      {/* Permanent Footer */}
      <footer className="border-t border-border bg-card/80 py-6 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" showText={false} />
            <span className="font-semibold text-foreground">KA COMM</span>
            <span>—</span>
            <span>AI-Powered Omnichannel Communication</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-medium text-foreground">
              © 2026 KA COMM • Developed by Kareem Abbas
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
