"use client"

import * as React from "react"
import { useDropzone, DropzoneOptions } from "react-dropzone"
import { UploadCloud, File, X } from "lucide-react"

import { cn } from "@/lib/utils"

export interface FileUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  onChange?: (files: File[]) => void
  value?: File[]
  dropzoneOptions?: DropzoneOptions
}

export function FileUpload({
  className,
  onChange,
  value = [],
  dropzoneOptions,
  ...props
}: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      onChange?.([...value, ...acceptedFiles])
    },
    ...dropzoneOptions,
  })

  const handleRemove = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    const newFiles = [...value]
    newFiles.splice(index, 1)
    onChange?.(newFiles)
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <div
        {...getRootProps()}
        className={cn(
          "flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-8 text-center transition-colors hover:bg-[var(--surface-2)]",
          isDragActive && "border-[var(--brand)] bg-[var(--brand-soft)]"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mb-4 h-8 w-8 text-[var(--ink-3)]" />
        <p className="mb-1 text-sm font-semibold text-[var(--ink)]">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-[var(--ink-3)]">
          SVG, PNG, JPG or GIF (max. 2MB)
        </p>
      </div>

      {value.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {value.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <File className="h-5 w-5 text-[var(--brand)]" />
                <span className="text-sm font-medium text-[var(--ink)] line-clamp-1">
                  {file.name}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => handleRemove(e, index)}
                className="rounded-full p-1 hover:bg-[var(--surface-2)] text-[var(--ink-3)] hover:text-[var(--danger)] transition-colors"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
