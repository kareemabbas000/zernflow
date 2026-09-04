"use client";

import { useState } from "react";
import {
  Settings,
  Hash,
  Save,
  Plus,
  X,
  Check,
  Eye,
  EyeOff,
  Users,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
  Info,
  Scale,
  Building,
  Key,
  Loader2,
  Trash2,
  User as UserIcon,
  CreditCard,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamView } from "@/components/settings/team-view";
import { updateProfile } from "@/lib/actions/profile";
import { useRouter } from "next/navigation";

interface WorkspaceSettings {
  id: string;
  name: string;
  plan: string;
  status: string;
  hasAiKey: boolean;
  globalKeywords: string[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function SettingsView({
  workspace,
  subscription,
  user,
  teamData,
}: {
  workspace: WorkspaceSettings;
  subscription: any;
  user: any;
  teamData: any;
}) {
  const router = useRouter();
  
  // Workspace State
  const [name, setName] = useState(workspace.name);
  const [aiKey, setAiKey] = useState("");
  const [showAiKey, setShowAiKey] = useState(false);
  const [keywords, setKeywords] = useState<string[]>(workspace.globalKeywords);
  const [newKeyword, setNewKeyword] = useState("");
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  
  // Profile State
  const [profileName, setProfileName] = useState(user?.user_metadata?.full_name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profilePassword, setProfilePassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Global States
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addKeyword() {
    const trimmed = newKeyword.trim().toLowerCase();
    if (!trimmed) return;
    if (keywords.includes(trimmed)) {
      setNewKeyword("");
      return;
    }
    setKeywords((prev) => [...prev, trimmed]);
    setNewKeyword("");
  }

  function removeKeyword(kw: string) {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  }

  async function handleSaveWorkspace() {
    if (savingWorkspace) return;
    setSavingWorkspace(true);
    setError(null);
    setSaved(false);

    try {
      const supabase = createClient();
      const update: Record<string, unknown> = {
        name: name.trim(),
        global_keywords: keywords,
      };

      if (aiKey.trim()) {
        update.ai_api_key = aiKey.trim();
      }

      const { error: updateError } = await supabase
        .from("workspaces")
        .update(update)
        .eq("id", workspace.id);

      if (updateError) throw new Error(updateError.message);

      setSaved(true);
      setAiKey("");
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save workspace.");
    } finally {
      setSavingWorkspace(false);
    }
  }

  async function handleSaveProfile() {
    if (savingProfile) return;
    setSavingProfile(true);
    setError(null);
    setSaved(false);

    try {
      const { error: profileError } = await updateProfile({
        full_name: profileName,
        email: profileEmail !== user?.email ? profileEmail : undefined,
        password: profilePassword ? profilePassword : undefined,
      });

      if (profileError) throw new Error(profileError);

      setSaved(true);
      setProfilePassword("");
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-background relative overflow-hidden font-sans">
      {/* Ambient glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="border-b border-border bg-background/50 backdrop-blur-xl px-8 py-6 shrink-0 relative z-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary animate-spin-slow" />
            Platform Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your workspace, billing, team, and personal profile.
          </p>
        </div>
      </motion.div>

      {/* Settings form */}
      <div className="flex-1 overflow-auto relative z-10 p-6 md:p-8">
        <Tabs defaultValue="workspace" className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
          
          {/* Vertical Tabs List */}
          <div className="md:w-64 shrink-0">
            <TabsList className="flex flex-col h-auto bg-transparent items-stretch space-y-1 p-0">
              <TabsTrigger value="workspace" className="justify-start px-4 py-3 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:border border-transparent data-[state=active]:border-border rounded-lg text-left">
                <Building className="h-4 w-4 mr-3" />
                Workspace
              </TabsTrigger>
              <TabsTrigger value="profile" className="justify-start px-4 py-3 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:border border-transparent data-[state=active]:border-border rounded-lg text-left">
                <UserIcon className="h-4 w-4 mr-3" />
                Personal Profile
              </TabsTrigger>
              <TabsTrigger value="team" className="justify-start px-4 py-3 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:border border-transparent data-[state=active]:border-border rounded-lg text-left">
                <Users className="h-4 w-4 mr-3" />
                Team Roster
              </TabsTrigger>
              <TabsTrigger value="billing" className="justify-start px-4 py-3 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:border border-transparent data-[state=active]:border-border rounded-lg text-left">
                <CreditCard className="h-4 w-4 mr-3" />
                Billing & Plans
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-w-0">
            {/* WORKSPACE TAB */}
            <TabsContent value="workspace" className="mt-0 space-y-6 outline-none">
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                
                <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Workspace Details</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Core identity and configuration</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                        Workspace Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* AI Configuration */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                      <Key className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">AI Copilot & LLM Configuration</h2>
                      <p className="text-xs text-muted-foreground">Custom AI key for generative responses</p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type={showAiKey ? "text" : "password"}
                      value={aiKey}
                      onChange={(e) => setAiKey(e.target.value)}
                      placeholder={
                        workspace.hasAiKey
                          ? "Enter a new key to replace current key"
                          : "sk-ant-... or sk-... (optional)"
                      }
                      className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 pr-12 text-sm font-mono placeholder:text-muted-foreground placeholder:font-sans outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAiKey(!showAiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {showAiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>

                {/* Save Workspace Actions */}
                <div className="flex items-center justify-end gap-4 pt-2">
                   <AnimatePresence>
                     {saved && <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-sm font-medium text-[var(--success)] flex items-center gap-1"><Check className="w-4 h-4"/> Saved</motion.span>}
                     {error && <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-sm font-medium text-[var(--danger)]">{error}</motion.span>}
                   </AnimatePresence>
                   <button
                     onClick={handleSaveWorkspace}
                     disabled={savingWorkspace}
                     className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-all"
                   >
                     {savingWorkspace ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                     Save Workspace
                   </button>
                </div>

                {/* Danger Zone */}
                <motion.div variants={itemVariants} className="mt-12 rounded-2xl border border-red-500/20 bg-red-500/5 p-6 shadow-sm space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Danger Zone
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Irreversible and destructive actions.</p>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-xl bg-background">
                    <div>
                      <p className="font-bold text-sm text-foreground">Delete Workspace</p>
                      <p className="text-xs text-muted-foreground">Permanently delete this workspace and all its data.</p>
                    </div>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </motion.div>

              </motion.div>
            </TabsContent>

            {/* PROFILE TAB */}
            <TabsContent value="profile" className="mt-0 space-y-6 outline-none">
               <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                
                <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Personal Details</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage your user profile</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Security</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Update your password</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Leave blank to keep current password"
                        value={profilePassword}
                        onChange={(e) => setProfilePassword(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Save Profile Actions */}
                <div className="flex items-center justify-end gap-4 pt-2">
                   <AnimatePresence>
                     {saved && <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-sm font-medium text-[var(--success)] flex items-center gap-1"><Check className="w-4 h-4"/> Saved</motion.span>}
                     {error && <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-sm font-medium text-[var(--danger)]">{error}</motion.span>}
                   </AnimatePresence>
                   <button
                     onClick={handleSaveProfile}
                     disabled={savingProfile}
                     className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-all"
                   >
                     {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                     Save Profile
                   </button>
                </div>

              </motion.div>
            </TabsContent>

            {/* TEAM TAB */}
            <TabsContent value="team" className="mt-0 outline-none">
              <TeamView
                workspaceId={workspace.id}
                workspaceName={workspace.name}
                currentUserId={teamData.currentUserId}
                currentUserRole={teamData.currentUserRole}
                members={teamData.members}
                pendingInvites={teamData.pendingInvites}
              />
            </TabsContent>

            {/* BILLING TAB */}
            <TabsContent value="billing" className="mt-0 outline-none">
               <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                
                <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Subscription & Billing</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage scalable multi-tenant plans</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                     {/* Plan Details */}
                     <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Current Plan</p>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-2xl font-bold capitalize text-foreground">{subscription?.plan_id || workspace.plan}</span>
                           <span className="px-2 py-0.5 rounded-full bg-[var(--success-soft)] text-[var(--success)] text-xs font-bold">Active</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">Renews on {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'Next Month'}</p>
                     </div>

                     {/* Usage */}
                     <div className="p-5 rounded-xl border border-[var(--border)] bg-background">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Platform Usage</p>
                        <div className="space-y-3 mt-4">
                           <div>
                              <div className="flex justify-between text-xs mb-1">
                                 <span className="font-medium text-foreground">Active Flows</span>
                                 <span className="text-muted-foreground">3 / 10</span>
                              </div>
                              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                 <div className="h-full bg-primary w-[30%] rounded-full"></div>
                              </div>
                           </div>
                           <div>
                              <div className="flex justify-between text-xs mb-1">
                                 <span className="font-medium text-foreground">Monthly Messages</span>
                                 <span className="text-muted-foreground">48k / 100k</span>
                              </div>
                              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                 <div className="h-full bg-purple-500 w-[48%] rounded-full"></div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                </motion.div>

                {/* Available Plans */}
                <motion.div variants={itemVariants} className="space-y-4 pt-6">
                   <h3 className="text-base font-bold text-foreground">Available Plans</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Free Tier */}
                      <div className="rounded-2xl border border-[var(--border)] bg-background p-6 flex flex-col hover:border-primary/30 transition-colors">
                         <h4 className="font-bold text-lg">Starter</h4>
                         <p className="text-2xl font-bold mt-2">$0<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
                         <p className="text-xs text-muted-foreground mt-2 flex-1">Perfect for individuals just getting started with automations.</p>
                         <ul className="space-y-2 text-sm text-muted-foreground mt-6 mb-6">
                           <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--success)]" /> 1 Workspace</li>
                           <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--success)]" /> 1,000 Messages</li>
                           <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--success)]" /> 3 Flows</li>
                         </ul>
                         <button className="w-full py-2 rounded-lg border border-[var(--border)] font-bold text-sm bg-[var(--surface-2)] text-[var(--ink-2)]" disabled>
                           Current Plan
                         </button>
                      </div>

                      {/* Pro Tier */}
                      <div className="rounded-2xl border border-[var(--brand)] bg-[var(--brand-soft)]/20 p-6 flex flex-col relative shadow-md shadow-[var(--brand)]/5">
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--brand)] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">Most Popular</div>
                         <h4 className="font-bold text-lg text-[var(--brand)]">Pro</h4>
                         <p className="text-2xl font-bold mt-2">$49<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
                         <p className="text-xs text-muted-foreground mt-2 flex-1">For growing teams that need more power and volume.</p>
                         <ul className="space-y-2 text-sm text-foreground mt-6 mb-6 font-medium">
                           <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--brand)]" /> Unlimited Workspaces</li>
                           <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--brand)]" /> 100,000 Messages</li>
                           <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--brand)]" /> Unlimited Flows</li>
                           <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--brand)]" /> Remove Branding</li>
                         </ul>
                         <button className="w-full py-2 rounded-lg border border-transparent font-bold text-sm bg-[var(--brand)] text-white shadow-sm hover:bg-[var(--brand-hover)] transition-colors">
                           Upgrade to Pro
                         </button>
                      </div>

                      {/* Enterprise Tier */}
                      <div className="rounded-2xl border border-[var(--border)] bg-background p-6 flex flex-col hover:border-purple-500/30 transition-colors">
                         <h4 className="font-bold text-lg">Enterprise</h4>
                         <p className="text-2xl font-bold mt-2">Custom</p>
                         <p className="text-xs text-muted-foreground mt-2 flex-1">Dedicated support, SLAs, and unlimited everything for scale.</p>
                         <ul className="space-y-2 text-sm text-muted-foreground mt-6 mb-6">
                           <li className="flex gap-2"><Check className="w-4 h-4 text-purple-500" /> Dedicated Account Manager</li>
                           <li className="flex gap-2"><Check className="w-4 h-4 text-purple-500" /> Unlimited Volume</li>
                           <li className="flex gap-2"><Check className="w-4 h-4 text-purple-500" /> SSO & Advanced Security</li>
                         </ul>
                         <button className="w-full py-2 rounded-lg border border-[var(--border)] font-bold text-sm bg-background hover:bg-[var(--surface-2)] transition-colors">
                           Contact Sales
                         </button>
                      </div>

                   </div>
                </motion.div>

              </motion.div>
            </TabsContent>

          </div>
        </Tabs>
      </div>
    </div>
  );
}
