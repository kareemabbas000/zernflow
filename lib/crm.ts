export interface LeadStageConfig {
  id: string;
  label: string;
  badgeClass: string;
  dotColor: string;
}

export const LEAD_STAGES: Record<string, LeadStageConfig> = {
  lead: {
    id: "lead",
    label: "Lead",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
    dotColor: "bg-blue-500",
  },
  qualified: {
    id: "qualified",
    label: "Qualified",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
    dotColor: "bg-purple-500",
  },
  negotiation: {
    id: "negotiation",
    label: "Negotiation",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    dotColor: "bg-amber-500",
  },
  won: {
    id: "won",
    label: "Customer",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    dotColor: "bg-emerald-500",
  },
  customer: {
    id: "customer",
    label: "Customer",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    dotColor: "bg-emerald-500",
  },
  vip: {
    id: "vip",
    label: "VIP",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
    dotColor: "bg-rose-500",
  },
  lost: {
    id: "lost",
    label: "Lost",
    badgeClass: "bg-slate-500/10 text-slate-500 border-slate-500/25",
    dotColor: "bg-slate-500",
  },
  churned: {
    id: "churned",
    label: "Churned",
    badgeClass: "bg-slate-500/10 text-slate-500 border-slate-500/25",
    dotColor: "bg-slate-500",
  },
};

export const LEAD_STAGE_OPTIONS = [
  { id: "lead", label: "Lead", dot: "bg-blue-500", badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25" },
  { id: "qualified", label: "Qualified", dot: "bg-purple-500", badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25" },
  { id: "negotiation", label: "Negotiation", dot: "bg-amber-500", badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25" },
  { id: "customer", label: "Customer", dot: "bg-emerald-500", badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25" },
  { id: "vip", label: "VIP Client", dot: "bg-rose-500", badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25" },
  { id: "lost", label: "Lost / Churned", dot: "bg-slate-500", badgeClass: "bg-slate-500/10 text-slate-500 border-slate-500/25" },
];
