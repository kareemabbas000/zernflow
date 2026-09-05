import sys

with open('app/[locale]/(dashboard)/dashboard/inbox/inbox-view.tsx', 'r') as f:
    text = f.read()

# 1. Add MessageSquare import
text = text.replace(
'''import { Sparkles, PanelRightClose, PanelRightOpen } from "lucide-react";''',
'''import { Sparkles, PanelRightClose, PanelRightOpen, MessageSquare } from "lucide-react";'''
)

# 2. Fix MessageThread props
text = text.replace(
'''                  <MessageThread
                    conversation={selectedConversation}
                    messages={effectiveMessages}
                    workspaceId={workspaceId}
                    onBack={isMobile ? () => selectConversation(null) : undefined}
                    onOpenProfile={() => setContactPanelOpen(!contactPanelOpen)}
                    isProfileOpen={contactPanelOpen}
                  />''',
'''                  <MessageThread
                    conversation={selectedConversation}
                    messages={effectiveMessages}
                    onOpenProfile={() => setContactPanelOpen(!contactPanelOpen)}
                    isProfileOpen={contactPanelOpen}
                  />'''
)

# 3. Fix ContactPanel props
text = text.replace(
'''                        <ContactPanel
                          contactId={selectedConversation.contacts?.id!}
                          conversationId={selectedConversation.id}
                          workspaceId={workspaceId}
                          onClose={() => setContactPanelOpen(false)}
                          isMobile={isMobile}
                        />''',
'''                        <ContactPanel
                          contactId={selectedConversation.contacts?.id!}
                          workspaceId={workspaceId}
                          onClose={() => setContactPanelOpen(false)}
                          isMobile={isMobile}
                        />'''
)

with open('app/[locale]/(dashboard)/dashboard/inbox/inbox-view.tsx', 'w') as f:
    f.write(text)
