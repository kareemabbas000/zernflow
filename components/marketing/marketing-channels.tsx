"use client"

import * as React from "react"
import { MessageCircle, Instagram, Send, MessageSquare, Smartphone, Mail } from "lucide-react"

const channels = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: <MessageCircle className="w-8 h-8" />,
    description: "The world's most popular messaging app.",
    hoverTint: "hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-emerald-100",
    iconColor: "text-emerald-500",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: <Instagram className="w-8 h-8" />,
    description: "Turn followers into paying customers.",
    hoverTint: "hover:bg-fuchsia-50 hover:border-fuchsia-200 hover:shadow-fuchsia-100",
    iconColor: "text-fuchsia-500",
  },
  {
    id: "messenger",
    name: "Messenger",
    icon: <MessageSquare className="w-8 h-8" />,
    description: "Engage your Facebook audience instantly.",
    hoverTint: "hover:bg-blue-50 hover:border-blue-200 hover:shadow-blue-100",
    iconColor: "text-blue-500",
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: <Send className="w-8 h-8" />,
    description: "Fast, secure, and developer-friendly.",
    hoverTint: "hover:bg-sky-50 hover:border-sky-200 hover:shadow-sky-100",
    iconColor: "text-sky-500",
  },
  {
    id: "sms",
    name: "SMS",
    icon: <Smartphone className="w-8 h-8" />,
    description: "Direct alerts with 98% open rates.",
    hoverTint: "hover:bg-indigo-50 hover:border-indigo-200 hover:shadow-indigo-100",
    iconColor: "text-indigo-500",
  },
  {
    id: "email",
    name: "Email",
    icon: <Mail className="w-8 h-8" />,
    description: "Classic campaigns, now automated.",
    hoverTint: "hover:bg-orange-50 hover:border-orange-200 hover:shadow-orange-100",
    iconColor: "text-orange-500",
  }
]

export function MarketingChannels() {
  return (
    <section className="py-24 bg-[var(--surface-2)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] mb-4">
          Be everywhere they are.
        </h2>
        <p className="text-lg text-[var(--text-secondary)] font-medium max-w-2xl mx-auto mb-16">
          Connect your favourite platforms in one click. Build a flow once, and deploy it across every channel simultaneously.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className={`group flex items-center gap-4 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer ${channel.hoverTint}`}
            >
              <div className={`p-3 rounded-xl bg-[var(--surface-2)] transition-colors group-hover:bg-[var(--bg)] ${channel.iconColor}`}>
                {channel.icon}
              </div>
              <div className="text-left">
                <h3 className="font-bold text-[var(--text-primary)] text-lg leading-tight">
                  {channel.name}
                </h3>
                <p className="text-sm font-medium text-[var(--text-muted)] mt-1">
                  {channel.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
