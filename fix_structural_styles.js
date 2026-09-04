const fs = require('fs');

function applyStructuralRegister(filePath) {
  if (!fs.existsSync(filePath)) return;
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
  content = content.replace(/bg-accent/g, 'bg-[var(--surface)]');

  // Accents & Shadows
  content = content.replace(/shadow-sm/g, 'shadow-none');
  content = content.replace(/shadow-md/g, 'shadow-none');
  content = content.replace(/shadow-lg/g, 'shadow-none');
  content = content.replace(/animate-pulse/g, '');
  content = content.replace(/bg-primary\/10 dark:bg-primary\/15/g, 'bg-[var(--brand-soft)]');
  content = content.replace(/bg-primary\/10/g, 'bg-[var(--brand-soft)]');
  content = content.replace(/text-primary/g, 'text-[var(--brand)]');
  content = content.replace(/border-primary/g, 'border-[var(--brand)]');
  content = content.replace(/bg-primary/g, 'bg-[var(--brand)]');
  content = content.replace(/text-primary-foreground/g, 'text-white');

  // Radii
  content = content.replace(/rounded-xl/g, 'rounded-md');
  content = content.replace(/rounded-2xl/g, 'rounded-md');
  content = content.replace(/rounded-3xl/g, 'rounded-md');
  content = content.replace(/rounded-lg/g, 'rounded-md');
  content = content.replace(/rounded-full/g, 'rounded-sm');

  fs.writeFileSync(filePath, content, 'utf-8');
}

const files = [
  'components/flow-builder/flow-canvas.tsx',
  'components/flow-builder/node-palette.tsx',
  'components/flows/flows-view.tsx',
  'app/[locale]/(dashboard)/dashboard/contacts/contacts-view.tsx',
  'components/contacts/contacts-data-table.tsx'
];

for (const file of files) {
  applyStructuralRegister(file);
}
console.log('Structural styles applied.');
