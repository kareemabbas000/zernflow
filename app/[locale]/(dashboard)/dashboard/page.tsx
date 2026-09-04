import { getWorkspace } from "@/lib/workspace";
import { getDashboardMetrics } from "@/lib/actions/dashboard";
import { Users, MessageSquare, Zap, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const { workspace } = await getWorkspace();
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ink)] mb-1">
          Welcome to {workspace.name}
        </h1>
        <p className="text-[var(--ink-2)] text-sm">
          Here's an overview of your operations today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-xl p-5 border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[var(--ink-3)]">Active Contacts</span>
            <div className="w-8 h-8 rounded-md bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[var(--ink)]">{metrics.contactsCount.toLocaleString()}</span>
            <span className="text-xs font-medium text-[var(--success)] flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 12%
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-xl p-5 border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[var(--ink-3)]">Messages Handled</span>
            <div className="w-8 h-8 rounded-md bg-[var(--lilac)]/20 text-[var(--lilac)] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[var(--ink)]">{metrics.messagesCount.toLocaleString()}</span>
            <span className="text-xs font-medium text-[var(--success)] flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 8%
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-xl p-5 border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[var(--ink-3)]">Human Handoff Rate</span>
            <div className="w-8 h-8 rounded-md bg-[var(--coral)]/10 text-[var(--coral)] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[var(--ink)]">{metrics.handoffRate}%</span>
            <span className="text-xs font-medium text-[var(--success)] flex items-center">
              <ArrowDownRight className="w-3 h-3 mr-0.5" /> 2.1%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Flows */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--ink)]">Recent Flows</h2>
            <Link href="/dashboard/flows" className="text-sm font-medium text-[var(--brand)] hover:text-[var(--brand-hover)]">
              View all
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
            {metrics.recentFlows.length === 0 ? (
               <div className="p-8 text-center text-[var(--ink-3)] text-sm">No recent flows found.</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-[var(--surface-2)] text-[var(--ink-3)] text-xs uppercase font-medium">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Last Edited</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {metrics.recentFlows.map((flow) => (
                    <tr key={flow.id} className="hover:bg-[var(--surface)] transition-colors">
                      <td className="px-6 py-4 font-medium text-[var(--ink)]">{flow.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-bold ${flow.status === 'published' ? 'bg-[var(--success-soft)] text-[var(--success)]' : 'bg-[var(--surface-2)] text-[var(--ink-3)] border border-[var(--border)]'}`}>
                          {flow.status === 'published' ? 'Live' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[var(--ink-2)] capitalize">{flow.formatted_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[var(--ink)]">Activity Feed</h2>
          <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm p-5 space-y-6">
            {metrics.activityFeed.length === 0 ? (
               <div className="text-center text-[var(--ink-3)] text-sm py-4">No recent activity.</div>
            ) : (
              metrics.activityFeed.map((feed) => (
                <div key={feed.id} className="flex gap-4">
                  <div className="mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] flex items-center justify-center border border-[var(--border)]">
                      <Activity className="w-4 h-4 text-[var(--ink-3)]" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--ink)]">{feed.title}</p>
                    <p className="text-xs text-[var(--ink-2)] mt-1">{feed.message}</p>
                    <p className="text-xs text-[var(--ink-3)] mt-2">{feed.time} by {feed.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
