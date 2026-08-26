import { Card } from '../../components/ui/Card'
import { Typography } from '../../components/ui/Typography'
import type { ResearchSource } from '../../types/photoMeal'

type ResearchDisclosure = { internetUsed: boolean; summary: string; sources: ResearchSource[] }
export function SourcesUsedCard({ disclosure }: { disclosure: ResearchDisclosure }) {
  return <Card className="mb-control-wide grid gap-control p-control-wide">
    <Typography variant="eyebrow">Sources used</Typography>
    <Typography variant="body" className="font-bold text-ink">OpenClaw research note</Typography>
    <Typography variant="muted" className="whitespace-pre-line">{disclosure.summary}</Typography>
    {disclosure.sources.length > 0 && <ul className="list-disc pl-content text-caption text-muted">{disclosure.sources.map((source, index) => <li key={`${source.title}-${source.url || index}`}><span className="font-bold text-ink">{source.title}</span>{source.url && <span className="block break-all">{source.url}</span>}</li>)}</ul>}
  </Card>
}
