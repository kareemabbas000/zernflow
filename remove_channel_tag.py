with open("components/inbox/message-thread.tsx", "r") as f:
    text = f.read()

old_tag = """              <p className="text-sm font-bold text-[var(--ink)] truncate max-w-[160px] sm:max-w-[220px] md:max-w-[280px]">
                {contactName}
              </p>
              {conversation.channels?.display_name && (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[9.5px] font-bold text-primary shrink-0"
                  title={`Via channel: ${conversation.channels.display_name}${conversation.channels.username ? ` (@${conversation.channels.username})` : ""}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span className="truncate max-w-[90px] sm:max-w-[140px]">
                    {conversation.channels.display_name}
                  </span>
                </span>
              )}
            </div>"""

new_tag = """              <p className="text-sm font-bold text-[var(--ink)] truncate max-w-[160px] sm:max-w-[220px] md:max-w-[280px]">
                {contactName}
              </p>
            </div>"""

text = text.replace(old_tag, new_tag)

with open("components/inbox/message-thread.tsx", "w") as f:
    f.write(text)

