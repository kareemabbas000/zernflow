const fs = require('fs');

function applyStructuralRegister(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Backgrounds and colors
  content = content.replace(/bg-background/g, 'bg-[var(--paper)]');
  content = content.replace(/bg-muted\/20/g, 'bg-[var(--surface-2)]');
  content = content.replace(/bg-muted\/15/g, 'bg-[var(--surface-2)]');
  content = content.replace(/bg-muted\/10/g, 'bg-[var(--surface)]');
  content = content.replace(/bg-muted\/50/g, 'bg-[var(--surface-2)]');
  content = content.replace(/bg-muted/g, 'bg-[var(--surface)]');
  
  content = content.replace(/bg-card/g, 'bg-[var(--paper)]');
  content = content.replace(/text-foreground\/80/g, 'text-[var(--ink-2)]');
  content = content.replace(/text-foreground/g, 'text-[var(--ink)]');
  content = content.replace(/text-muted-foreground/g, 'text-[var(--ink-2)]');
  content = content.replace(/border-border\/60/g, 'border-[var(--border)]');
  content = content.replace(/border-border\/50/g, 'border-[var(--border)]');
  content = content.replace(/border-border\/70/g, 'border-[var(--border)]');
  content = content.replace(/border-border/g, 'border-[var(--border)]');

  // Accents & Shadows
  content = content.replace(/shadow-sm shadow-rose-500\/30/g, 'shadow-none');
  content = content.replace(/shadow-sm shadow-rose-500\/40/g, 'shadow-none');
  content = content.replace(/shadow-sm shadow-primary\/20/g, 'shadow-none');
  content = content.replace(/animate-pulse/g, '');
  content = content.replace(/bg-primary\/10 dark:bg-primary\/15/g, 'bg-[var(--surface)]');
  content = content.replace(/bg-primary\/\[0\.04\] dark:bg-primary\/\[0\.08\]/g, 'bg-[var(--surface-2)]');
  content = content.replace(/bg-rose-500 text-white/g, 'bg-[var(--danger)] text-white');
  content = content.replace(/text-rose-600 dark:text-rose-400/g, 'text-[var(--danger)]');

  // Radii
  content = content.replace(/rounded-xl/g, 'rounded-md');
  content = content.replace(/rounded-2xl/g, 'rounded-md');
  content = content.replace(/rounded-3xl/g, 'rounded-md');
  content = content.replace(/rounded-lg/g, 'rounded-md');
  
  // Specific structural tweaks
  content = content.replace(/border-l-4 border-l-primary/g, 'border-l-2 border-[var(--brand)]');
  content = content.replace(/border-l-4 border-l-rose-500/g, 'border-l-2 border-[var(--danger)]');
  content = content.replace(/border-l-4 border-l-transparent/g, 'border-l-2 border-transparent');
  content = content.replace(/bg-primary text-primary-foreground/g, 'bg-[var(--brand)] text-white');

  fs.writeFileSync(filePath, content, 'utf-8');
}

const files = [
  'components/inbox/conversation-list.tsx',
  'components/inbox/message-thread.tsx',
  'components/inbox/contact-panel.tsx'
];

for (const file of files) {
  applyStructuralRegister(file);
}
console.log('Structural styles applied.');
