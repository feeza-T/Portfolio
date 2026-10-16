import { useState } from 'react'
import { site } from '../../config/site'
import { RollText } from '../Navbar/Navbar'
import './CopyEmail.css'

// Click to copy your email (no backend needed); a small mail link sits beside it.
export default function CopyEmail({ big = false }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email)
    } catch {
      // older browsers: fall back to a hidden textarea
      const t = document.createElement('textarea')
      t.value = site.email
      document.body.appendChild(t)
      t.select()
      document.execCommand('copy')
      t.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div className={`cmail ${big ? 'cmail--big' : ''}`}>
      <button type="button" className={`cmail__copy ${copied ? 'is-copied' : ''}`} onClick={copy} data-cursor="Copy">
        <span className="cmail__addr">{site.email}</span>
        <span className="cmail__state" aria-live="polite">
          {copied ? 'Copied ✓' : 'Click to copy'}
        </span>
      </button>
      <a className="cmail__open" href={`mailto:${site.email}`}>
        <RollText>Open mail app</RollText> <span aria-hidden="true">↗</span>
      </a>
    </div>
  )
}
