import { Snowflake } from 'lucide-react'

export function WeatherChip({ label }: { label: string }) {
  return (
    <span className="label inline-flex h-8 items-center gap-1.5 rounded-full border border-hairline px-3 text-ink-2">
      <Snowflake size={13} strokeWidth={1.5} />
      {label}
    </span>
  )
}
