'use client'

interface AdminPageHeaderProps {
  title: string
  subtitle?: string
}

export default function AdminPageHeader({
  title,
  subtitle,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-4">
      <h1 className="h3 mb-1">{title}</h1>
      {subtitle && <p className="text-muted">{subtitle}</p>}
    </div>
  )
}
