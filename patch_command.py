import re

with open("components/ui/command.tsx", "r") as f:
    text = f.read()

# Add import for Dialog at the top
if 'import { Dialog, DialogContent } from "@/components/ui/dialog"' not in text:
    text = text.replace('import { Command as CommandPrimitive } from "cmdk"', 'import { Command as CommandPrimitive } from "cmdk"\nimport { Dialog, DialogContent } from "@/components/ui/dialog"')

# Replace CommandDialog implementation
old_dialog = '''const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <CommandPrimitive.Dialog {...props}>
      <div className="fixed inset-0 z-50 bg-[var(--ink)]/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <div className="fixed left-[50%] top-[50%] z-50 grid w-[95vw] sm:w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-[var(--border)] bg-[var(--surface)] shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl overflow-hidden">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[var(--ink-3)] [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </div>
    </CommandPrimitive.Dialog>
  )
}'''

new_dialog = '''const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg border-[var(--border)] bg-[var(--surface)]">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[var(--ink-3)] [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}'''

text = text.replace(old_dialog, new_dialog)

with open("components/ui/command.tsx", "w") as f:
    f.write(text)

