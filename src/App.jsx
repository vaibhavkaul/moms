import { useState, useRef, useEffect, useCallback } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const POLL_MS = 4000

// ── Static data ──────────────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: 'brave',
    emoji: '🌲',
    title: 'Brave Adventure',
    sub: 'Enchanted forest quest',
    seed: "Mom and child journey through an enchanted forest, facing magical challenges together. Their bond and bravery help them overcome every obstacle in a heartwarming Mother's Day adventure.",
  },
  {
    id: 'superhero',
    emoji: '🦸‍♀️',
    title: 'Super Mom',
    sub: 'She has secret superpowers',
    seed: "Mom reveals her secret superhero powers to her child. Together they team up on an exciting mission to help their community, proving that moms are the greatest heroes of all.",
  },
  {
    id: 'moana',
    emoji: '🌊',
    title: 'Ocean Voyage',
    sub: 'Sailing magical seas',
    seed: "Mom and child sail across a beautiful magical ocean on an adventure canoe, discovering colourful islands, friendly sea creatures, and the true meaning of love and family.",
  },
  {
    id: 'space',
    emoji: '🚀',
    title: 'Space Explorers',
    sub: 'Cosmic adventures await',
    seed: "Mom and child become astronauts together, exploring colourful planets and meeting friendly aliens, discovering that no matter how far they travel, home is wherever they are together.",
  },
  {
    id: 'garden',
    emoji: '🌸',
    title: 'Magical Garden',
    sub: 'A fairy world in bloom',
    seed: "Mom and child discover their backyard has become a magical garden where giant flowers open into fairy doors, butterflies speak, and a little love makes everything grow.",
  },
  {
    id: 'custom',
    emoji: '✨',
    title: 'Your Story',
    sub: 'Write your own adventure',
    seed: null,
  },
]

const STYLES = [
  { id: 'cartoon',   label: 'Cartoon',     sub: 'Bold & vibrant' },
  { id: 'storybook', label: 'Storybook',   sub: 'Soft watercolour' },
  { id: 'manga',     label: 'Manga',       sub: 'Anime style' },
  { id: 'vintage',   label: 'Vintage',     sub: 'Retro comic' },
  { id: 'cinematic', label: '🎬 Live Action', sub: 'Photorealistic', highlight: true },
]

// ── Helper ───────────────────────────────────────────────────────────────────

function isHeic(file) {
  return file?.name?.toLowerCase().match(/\.heic?$|\.heif?$/)
}

// ── Photo upload slot ─────────────────────────────────────────────────────────

function PhotoSlot({ label, emoji, preview, file, inputRef, onPick, name, onName, nameHint }) {
  return (
    <div className="photo-slot">
      <p className="slot-label">{label}</p>
      <button
        className={`slot-zone ${preview ? 'slot-zone--filled' : ''}`}
        onClick={() => inputRef.current?.click()}
        type="button"
        aria-label={`Upload ${label} photo`}
      >
        {preview ? (
          isHeic(file) ? (
            <div className="slot-heic">
              <span>📷</span>
              <p>{file.name}</p>
            </div>
          ) : (
            <img src={preview} alt={`${label} preview`} className="slot-img" />
          )
        ) : (
          <div className="slot-placeholder">
            <span className="slot-emoji">{emoji}</span>
            <span className="slot-cta">Tap to upload</span>
          </div>
        )}
        {preview && <div className="slot-change-hint">Tap to change</div>}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        style={{ display: 'none' }}
        onChange={e => onPick(e.target.files?.[0])}
      />
      <input
        className="name-input"
        type="text"
        placeholder={nameHint}
        value={name}
        onChange={e => onName(e.target.value)}
        maxLength={30}
      />
    </div>
  )
}

// ── Step: Photos ──────────────────────────────────────────────────────────────

function PhotosStep({ momPreview, momFile, childPreview, childFile, momName, childName,
                       momRef, childRef, onPickMom, onPickChild,
                       onMomName, onChildName, errorMsg, onNext, canNext }) {
  return (
    <div className="step-wrap">
      <div className="step-header">
        <h2>Upload your photos</h2>
        <p className="step-sub">We'll put you both inside the story</p>
      </div>

      <div className="photo-row">
        <PhotoSlot
          label="Mom" emoji="👩" preview={momPreview} file={momFile}
          inputRef={momRef} onPick={onPickMom}
          name={momName} onName={onMomName} nameHint="Mom's name (optional)"
        />
        <PhotoSlot
          label="Child" emoji="🧒" preview={childPreview} file={childFile}
          inputRef={childRef} onPick={onPickChild}
          name={childName} onName={onChildName} nameHint="Child's name (optional)"
        />
      </div>

      {errorMsg && <p className="error-msg">{errorMsg}</p>}

      <button className="primary-btn" disabled={!canNext} onClick={onNext}>
        Choose Story →
      </button>
    </div>
  )
}

// ── Step: Story ───────────────────────────────────────────────────────────────

function StoryStep({ template, setTemplate, customNotes, setCustomNotes,
                      style, setStyle, errorMsg, onBack, onGenerate, canGenerate }) {
  return (
    <div className="step-wrap">
      <div className="step-header">
        <h2>Pick your story</h2>
        <p className="step-sub">Choose a template or write your own</p>
      </div>

      <div className="template-grid">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            className={`template-card ${template === t.id ? 'template-card--selected' : ''}`}
            onClick={() => setTemplate(t.id)}
            type="button"
          >
            <span className="tmpl-emoji">{t.emoji}</span>
            <span className="tmpl-title">{t.title}</span>
            <span className="tmpl-sub">{t.sub}</span>
          </button>
        ))}
      </div>

      {template === 'custom' && (
        <div className="card mt-12">
          <label className="field-label" htmlFor="custom-notes">
            Describe your adventure (a few bullet points or sentences)
          </label>
          <textarea
            id="custom-notes"
            className="custom-textarea"
            placeholder="e.g. We go on a beach adventure, find a mermaid, and end with a big hug on the sand..."
            value={customNotes}
            onChange={e => setCustomNotes(e.target.value)}
            rows={4}
          />
        </div>
      )}

      <div className="card mt-12">
        <p className="field-label">Art style</p>
        <div className="style-row">
          {STYLES.map(s => (
            <button
              key={s.id}
              className={`style-chip ${style === s.id ? 'style-chip--selected' : ''} ${s.highlight ? 'style-chip--highlight' : ''}`}
              onClick={() => setStyle(s.id)}
              type="button"
            >
              <span className="style-label">{s.label}</span>
              <span className="style-sub">{s.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {errorMsg && <p className="error-msg mt-12">{errorMsg}</p>}

      <div className="btn-row mt-12">
        <button className="ghost-btn" onClick={onBack}>← Back</button>
        <button className="primary-btn primary-btn--wide" disabled={!canGenerate} onClick={onGenerate}>
          ✨ Create Comic
        </button>
      </div>
    </div>
  )
}

// ── Step: Generating ──────────────────────────────────────────────────────────

function GeneratingStep({ statusData, onPanelClick }) {
  const panels      = statusData.panels ?? []
  const panelsDone  = statusData.panels_done ?? 0
  const panelsTotal = statusData.panels_total ?? 6
  const stepLabel   = statusData.step ?? 'Getting started…'

  const pct = panelsTotal > 0
    ? Math.round((panelsDone / (panelsTotal + 1)) * 100)
    : 5

  return (
    <div className="step-wrap generating-wrap">
      <div className="gen-header">
        <div className="spinner" />
        <h2>Creating your comic…</h2>
        <p className="gen-sub">{stepLabel}</p>
      </div>

      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="progress-label">{panelsDone} of {panelsTotal} panels drawn</p>

      {panels.length > 0 && (
        <div className="panel-preview-grid">
          {panels.map(p => (
            <div
              key={p.panel}
              className="panel-thumb panel-thumb--loaded"
              onClick={() => onPanelClick(p.image_url)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onPanelClick(p.image_url)}
              title="Tap to enlarge"
            >
              <img src={p.image_url} alt={`Panel ${p.panel}`} />
            </div>
          ))}
          {Array.from({ length: Math.max(0, panelsTotal - panels.length) }).map((_, i) => (
            <div key={`ph-${i}`} className="panel-thumb panel-thumb--pending">
              <div className="panel-pending-inner">
                <div className="mini-spinner" />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="gen-note">This usually takes 2–3 minutes. Don't close this tab!</p>
    </div>
  )
}

// ── Step: Result ──────────────────────────────────────────────────────────────

function ResultStep({ statusData, momName, childName, onReset, onPanelClick }) {
  const panels = statusData.panels ?? []

  function downloadPanel(url, n, e) {
    e.stopPropagation()
    const a = document.createElement('a')
    a.href = url
    a.download = `mom-and-me-panel-${n}.png`
    a.target = '_blank'
    a.click()
  }

return (
    <div className="step-wrap result-wrap">
      <div className="result-header">
        <div className="result-title-row">
          <span className="heart-icon">💝</span>
          <h2>
            {momName} &amp; {childName}'s<br />
            <span className="title-accent">Mother's Day Comic</span>
          </h2>
          <span className="heart-icon">💝</span>
        </div>
        <p className="result-sub">Your personalised comic book is ready! Tap a panel to enlarge.</p>
      </div>

      <div className="comic-grid">
        {panels.map(p => (
          <div
            key={p.panel}
            className="comic-panel"
            onClick={() => onPanelClick(p.image_url)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onPanelClick(p.image_url)}
          >
            <img src={p.image_url} alt={`Panel ${p.panel}`} className="comic-panel-img" />
            {p.dialogue && (
              <div className="panel-caption">{p.dialogue}</div>
            )}
            <button
              className="panel-dl-btn"
              onClick={(e) => downloadPanel(p.image_url, p.panel, e)}
              title="Download this panel"
            >
              ↓
            </button>
          </div>
        ))}
      </div>

      <div className="result-actions">
<button className="primary-btn" onClick={onReset}>💝 Make Another</button>
      </div>
    </div>
  )
}

// ── Step indicator ────────────────────────────────────────────────────────────

const STEP_LABELS = ['Photos', 'Story', 'Create', 'Done']
const STEP_INDEX  = { photos: 0, story: 1, generating: 2, result: 3 }

function StepBar({ step }) {
  const current = STEP_INDEX[step] ?? 0
  return (
    <nav className="step-bar" aria-label="Progress">
      {STEP_LABELS.map((label, i) => (
        <div key={label} className="step-item-wrap">
          <div className={`step-item ${i < current ? 'step-past' : ''} ${i === current ? 'step-current' : ''}`}>
            <div className="step-dot">{i < current ? '✓' : i + 1}</div>
            <span className="step-dot-label">{label}</span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className={`step-connector ${i < current ? 'step-connector--done' : ''}`} />
          )}
        </div>
      ))}
    </nav>
  )
}

// ── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ url, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
        <img src={url} alt="Comic panel" className="lightbox-img" />
        <button className="lightbox-close" onClick={onClose} aria-label="Close">✕</button>
      </div>
    </div>
  )
}

// ── Root App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [step, setStep] = useState('photos')

  // Photos
  const [momFile,      setMomFile]      = useState(null)
  const [momPreview,   setMomPreview]   = useState(null)
  const [childFile,    setChildFile]    = useState(null)
  const [childPreview, setChildPreview] = useState(null)
  const [momName,      setMomName]      = useState('')
  const [childName,    setChildName]    = useState('')

  // Story
  const [template,    setTemplate]    = useState(null)
  const [customNotes, setCustomNotes] = useState('')
  const [style,       setStyle]       = useState('cartoon')

  // Generation
  const [statusData,  setStatusData]  = useState({})
  const [errorMsg,    setErrorMsg]    = useState(null)
  const [lightboxUrl, setLightboxUrl] = useState(null)
  const pollRef  = useRef(null)
  const momRef   = useRef(null)
  const childRef = useRef(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }, [])

  useEffect(() => () => stopPolling(), [stopPolling])

  function pickMom(file) {
    if (!file) return
    if (momPreview) URL.revokeObjectURL(momPreview)
    setMomFile(file)
    setMomPreview(URL.createObjectURL(file))
  }

  function pickChild(file) {
    if (!file) return
    if (childPreview) URL.revokeObjectURL(childPreview)
    setChildFile(file)
    setChildPreview(URL.createObjectURL(file))
  }

  async function pollStatus(jobId) {
    try {
      const res = await fetch(`${API_BASE}/api/comic-status/${jobId}`)
      if (!res.ok) throw new Error('Status check failed')
      const data = await res.json()
      setStatusData(data)
      if (data.status === 'done') {
        stopPolling()
        setStep('result')
      } else if (data.status === 'error') {
        stopPolling()
        setErrorMsg(data.error ?? 'Generation failed — please try again')
        setStep('story')
      }
    } catch (e) {
      stopPolling()
      setErrorMsg(e.message)
      setStep('story')
    }
  }

  async function handleGenerate() {
    setStep('generating')
    setErrorMsg(null)
    setStatusData({})

    const fd = new FormData()
    fd.append('mom_photo',    momFile)
    fd.append('child_photo',  childFile)
    fd.append('story_type',   template)
    fd.append('story_notes',  customNotes)
    fd.append('style',        style)
    fd.append('mom_name',     momName  || 'Mom')
    fd.append('child_name',   childName || 'Child')

    try {
      const res = await fetch(`${API_BASE}/api/comic`, { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(err.detail ?? 'Unknown error')
      }
      const { job_id } = await res.json()
      pollRef.current = setInterval(() => pollStatus(job_id), POLL_MS)
      pollStatus(job_id)
    } catch (e) {
      setErrorMsg(e.message)
      setStep('story')
    }
  }

  function handleReset() {
    stopPolling()
    if (momPreview)   URL.revokeObjectURL(momPreview)
    if (childPreview) URL.revokeObjectURL(childPreview)
    setStep('photos')
    setMomFile(null);    setMomPreview(null)
    setChildFile(null);  setChildPreview(null)
    setMomName('');      setChildName('')
    setTemplate(null);   setCustomNotes('');  setStyle('cartoon')
    setStatusData({});   setErrorMsg(null)
  }

  const canGoToStory = !!(momFile && childFile)
  const canGenerate  = !!(template && (template !== 'custom' || customNotes.trim()))

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">💝 Mom &amp; Me Comics</div>
        <p className="app-tagline">A personalised Mother's Day comic book — starring you!</p>
      </header>

      <StepBar step={step} />

      <main className="app-main">
        {step === 'photos' && (
          <PhotosStep
            momPreview={momPreview}   momFile={momFile}
            childPreview={childPreview} childFile={childFile}
            momName={momName}         childName={childName}
            momRef={momRef}           childRef={childRef}
            onPickMom={pickMom}       onPickChild={pickChild}
            onMomName={setMomName}    onChildName={setChildName}
            errorMsg={errorMsg}
            onNext={() => { setErrorMsg(null); setStep('story') }}
            canNext={canGoToStory}
          />
        )}
        {step === 'story' && (
          <StoryStep
            template={template}         setTemplate={setTemplate}
            customNotes={customNotes}   setCustomNotes={setCustomNotes}
            style={style}               setStyle={setStyle}
            errorMsg={errorMsg}
            onBack={() => setStep('photos')}
            onGenerate={handleGenerate}
            canGenerate={canGenerate}
          />
        )}
        {step === 'generating' && (
          <GeneratingStep statusData={statusData} onPanelClick={setLightboxUrl} />
        )}
        {step === 'result' && (
          <ResultStep
            statusData={statusData}
            momName={momName   || 'Mom'}
            childName={childName || 'Child'}
            onReset={handleReset}
            onPanelClick={setLightboxUrl}
          />
        )}
      </main>

      <footer className="app-footer">
        Made with 💝 for Mother's Day
      </footer>

      {lightboxUrl && (
        <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
    </div>
  )
}
