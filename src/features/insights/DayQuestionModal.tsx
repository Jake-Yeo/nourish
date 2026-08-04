import { useState } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { getFriendlyDate } from '../../lib/dates/getFriendlyDate'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ModalHeader } from '../../components/ui/ModalHeader'
import { TextArea } from '../../components/ui/TextArea'
import { Typography } from '../../components/ui/Typography'

export function DayQuestionModal({ dateKey, onClose }: { dateKey: string; onClose: () => void }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const askQuestion = async () => {
    if (!question.trim()) return setError('Ask a question about this day.')
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/ask-day-question', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dateKey, question }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not answer the question.')
      setAnswer(result.answer)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not answer the question.')
    } finally {
      setIsLoading(false)
    }
  }
  return <Modal accessibleLabel="Ask about this day" onClose={onClose}>
    <ModalHeader eyebrow="Day reflection" title={`Ask about ${getFriendlyDate(dateKey)}`} onClose={onClose} />
    <Typography variant="muted">Ask about calories, nutrients, meals, patterns, or practical next steps from this day's diary.</Typography>
    <form onSubmit={event => { event.preventDefault(); void askQuestion() }}>
      <TextArea className="mt-content" value={question} onChange={event => setQuestion(event.target.value.slice(0, 1_000))} placeholder="What stands out about this day?" rows={4} />
      {error && <p className="mt-control-wide rounded-field bg-destructive-soft p-control-wide text-detail text-destructive">{error}</p>}
      <div className="pt-control-wide">
        <Button type="submit" fullWidth disabled={isLoading}>{isLoading ? <Sparkles className="animate-pulse" /> : <Send />} {isLoading ? 'Thinking…' : 'Ask question'}</Button>
      </div>
    </form>
    {answer && <div className="mt-control-wide rounded-control bg-ai-soft p-control-wide"><Typography variant="eyebrow" className="text-ai">Ithacus</Typography><Typography className="mt-control whitespace-pre-wrap leading-relaxed">{answer}</Typography></div>}
  </Modal>
}
