import { useEffect, useState } from 'react'

const FIRST = 'Hello! My name is Andrew Blad.'
const SECOND = 'Hold on tight. Jumping in 3… 2… 1…'

type Frame = { text: string; delay?: number } // no delay = a random typing keystroke

// Every snapshot of the line: type the first sentence, backspace it, type the second
const FRAMES: Frame[] = [
  { text: '' },
  ...[...FIRST].map((_, i) => ({ text: FIRST.slice(0, i + 1), delay: i === 0 ? 700 : undefined })),
  ...[...FIRST].map((_, i) => ({
    text: FIRST.slice(0, FIRST.length - i - 1),
    delay: i === 0 ? 800 : 20,
  })),
  ...[...SECOND].map((_, i) => ({
    text: SECOND.slice(0, i + 1),
    // Beat after each countdown number so it reads like a real countdown
    delay: i === 0 ? 300 : SECOND[i - 1] === '…' ? 550 : undefined,
  })),
]

type Props = { fading: boolean; onDone: () => void }

export default function Terminal({ fading, onDone }: Props) {
  const [frame, setFrame] = useState(0)
  const done = frame >= FRAMES.length - 1

  useEffect(() => {
    if (done) {
      onDone()
      return
    }
    // Human-ish typing: uneven keystrokes
    const delay = FRAMES[frame + 1].delay ?? 35 + Math.random() * 50
    const id = setTimeout(() => setFrame((f) => f + 1), delay)
    return () => clearTimeout(id)
  }, [frame, done, onDone])

  return (
    <div className={`terminal${fading ? ' terminal--out' : ''}`} aria-hidden="true">
      <p className="terminal-line">
        <span className="prompt">&gt; </span>
        {FRAMES[frame].text}
        <span className={`cursor${done ? ' cursor--blink' : ''}`} />
      </p>
    </div>
  )
}
