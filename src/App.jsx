import { useState, useRef, useEffect, useCallback } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const POLL_MS = 4000

// ── Static data ──────────────────────────────────────────────────────────────

const MOVIE_TEMPLATES = [
  {
    id: 'lion_king',
    emoji: '🦁',
    title: 'The Lion King',
    sub: 'Pride Lands adventure',
    seed: "Mom and child explore the majestic Pride Lands, learn about the Circle of Life from wise Rafiki, sing with Timon and Pumbaa, and discover that true courage comes from the love between a parent and child.",
  },
  {
    id: 'frozen',
    emoji: '❄️',
    title: 'Frozen',
    sub: 'Into the ice kingdom',
    seed: "A magical eternal winter blankets the kingdom! Mom and child journey through snow-dusted forests and ice palaces, meet Olaf the snowman, and discover that love is the most powerful magic of all.",
  },
  {
    id: 'brave',
    emoji: '🏹',
    title: 'Brave',
    sub: 'Scottish highland quest',
    seed: "In a misty Scottish kingdom, mom and child follow glowing wisps through ancient forests and crumbling castles, solving a magical riddle and proving that the bravest thing of all is the love between them.",
  },
  {
    id: 'finding_nemo',
    emoji: '🐠',
    title: 'Finding Nemo',
    sub: 'Underwater rescue',
    seed: "Mom and child dive into the dazzling Great Barrier Reef, ride ocean currents with sea turtles, dodge playful sharks, and explore the deep blue — learning that no ocean is too wide when a parent's love is the compass.",
  },
  {
    id: 'encanto',
    emoji: '🪄',
    title: 'Encanto',
    sub: 'Magic family casita',
    seed: "In a magical Casita full of living rooms and impossible staircases, mom and child discover their own extraordinary gifts, share arepas, and celebrate the miracle that is their family.",
  },
  {
    id: 'moana',
    emoji: '🌊',
    title: 'Moana',
    sub: 'Sailing magical seas',
    seed: "Guided by the ocean itself, mom and child sail across glittering seas in a voyager canoe, befriend the demigod Maui, restore the heart of Te Fiti, and prove that the ocean loves the brave.",
  },
  {
    id: 'inside_out',
    emoji: '🎭',
    title: 'Inside Out',
    sub: 'Emotion adventure',
    seed: "Mom and child journey through the colourful islands of the mind — Joy's golden meadows, Sadness's quiet lakes — discovering that every feeling matters and love is the memory that never fades.",
  },
  {
    id: 'tangled',
    emoji: '🏮',
    title: 'Tangled',
    sub: 'Lantern festival night',
    seed: "Long golden hair, a magical tower, and a sky full of glowing lanterns! Mom and child set out on a daring adventure through the kingdom, outsmart villains, and share the most beautiful night of their lives.",
  },
  {
    id: 'little_mermaid',
    emoji: '🧜‍♀️',
    title: 'The Little Mermaid',
    sub: 'Under the sea',
    seed: "Mom and child dive into a shimmering underwater kingdom, collect sunken treasures, sing with Sebastian the crab, and discover that the most magical thing about the sea is coming home together.",
  },
  {
    id: 'toy_story',
    emoji: '🚀',
    title: 'Toy Story',
    sub: 'Toys come alive!',
    seed: "When the lights go out, mom and child's favourite toys spring to life for a daring adventure across the bedroom and beyond — with Woody, Buzz Lightyear, and the whole gang proving that friendship and love save the day.",
  },
]

const BOOK_TEMPLATES = [
  {
    id: 'goodnight_moon',
    emoji: '🌙',
    title: 'Goodnight Moon',
    sub: 'Cosy bedtime magic',
    seed: "As mom tucks child in for the night, each goodnight opens a door to a softly glowing magical world — moonlit meadows, sleepy stars, and gentle creatures — before the cosiest goodnight of all.",
  },
  {
    id: 'hungry_caterpillar',
    emoji: '🐛',
    title: 'The Very Hungry Caterpillar',
    sub: 'Colourful nature journey',
    seed: "Mom and child follow a very hungry caterpillar through a world of giant fruit and colourful leaves, watching it grow and transform into a beautiful butterfly — a story about patience, wonder, and growing together.",
  },
  {
    id: 'winnie_pooh',
    emoji: '🍯',
    title: 'Winnie-the-Pooh',
    sub: 'Hundred Acre Wood',
    seed: "A golden afternoon in the Hundred Acre Wood! Mom and child join Pooh, Piglet, and Tigger for a gentle adventure — a honey hunt, a bouncing expedition, and the discovery that a best friend is the greatest adventure of all.",
  },
  {
    id: 'wild_things',
    emoji: '👑',
    title: 'Where the Wild Things Are',
    sub: 'Wild rumpus kingdom',
    seed: "A magical boat carries the child to the land of Wild Things where they are crowned king and the wild rumpus begins — but when it ends, mom's love is the thing that sails them safely home.",
  },
  {
    id: 'matilda',
    emoji: '📚',
    title: 'Matilda',
    sub: 'Magical book adventures',
    seed: "A clever child discovers they have extraordinary powers! Mom and child outsmart the horrible headmistress, levitate chalk, and turn the school library into a portal to every adventure ever written.",
  },
  {
    id: 'cat_in_hat',
    emoji: '🎩',
    title: 'The Cat in the Hat',
    sub: 'A very silly day',
    seed: "On a cold wet day a tall striped cat arrives with a giant red bow — and suddenly nothing is ordinary! Mom and child tumble through impossible rooms, ride Thing One and Thing Two, and clean it all up just in time.",
  },
  {
    id: 'giving_tree',
    emoji: '🌳',
    title: 'The Giving Tree',
    sub: 'A love that grows',
    seed: "A great apple tree loves a child with her whole heart — through every season, every age, every adventure — giving everything she has, just like a mom. A tender story of endless, unconditional love.",
  },
  {
    id: 'gruffalo',
    emoji: '🦊',
    title: 'The Gruffalo',
    sub: 'Deep dark wood',
    seed: "Mom and child venture into the deep dark wood, outwitting a fox, an owl, and a snake with the tale of a terrifying imaginary creature — until the Gruffalo turns out to be very real indeed.",
  },
  {
    id: 'charlottes_web',
    emoji: '🕷️',
    title: "Charlotte's Web",
    sub: 'Friendship on the farm',
    seed: "On a gentle farm, mom and child meet Wilbur the pig and Charlotte the spider, whose beautiful words weave a story about friendship so powerful that it echoes long after the last page.",
  },
  {
    id: 'narnia',
    emoji: '🦁',
    title: 'The Lion, the Witch & the Wardrobe',
    sub: 'Through the wardrobe',
    seed: "Behind the coats in the old wardrobe lies a snow-covered kingdom! Mom and child step into Narnia, meet the great lion Aslan, defeat the White Witch, and are crowned rulers of a world born from pure imagination.",
  },
]

const STYLES = [
  { id: 'cartoon',   label: 'Cartoon',   sub: 'Bold & vibrant' },
  { id: 'storybook', label: 'Storybook', sub: 'Soft watercolour' },
  { id: 'manga',     label: 'Manga',     sub: 'Anime style' },
  { id: 'vintage',   label: 'Vintage',   sub: 'Retro comic' },
]

// ── Helper ───────────────────────────────────────────────────────────────────

function isHeic(file) {
  return file?.name?.toLowerCase().match(/\.heic?$|\.heif?$/)
}

// ── Photo upload slot ─────────────────────────────────────────────────────────

function PhotoSlot({ label, emoji, preview, file, inputRef, onPick, name, onName, nameHint, showName = true }) {
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
      {showName && (
        <input
          className="name-input"
          type="text"
          placeholder={nameHint}
          value={name}
          onChange={e => onName(e.target.value)}
          maxLength={30}
        />
      )}
    </div>
  )
}

// ── Step: Photos ──────────────────────────────────────────────────────────────

function PhotosStep({ momPreview, momFile, childPreview, childFile, childName,
                       momRef, childRef, onPickMom, onPickChild,
                       onChildName, errorMsg, onNext, canNext }) {
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
          showName={false}
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

function TemplateSection({ label, templates, selected, onSelect }) {
  return (
    <div className="story-section">
      <p className="story-section-label">{label}</p>
      <div className="template-grid">
        {templates.map(t => (
          <button
            key={t.id}
            className={`template-card ${selected === t.id ? 'template-card--selected' : ''}`}
            onClick={() => onSelect(t.id)}
            type="button"
          >
            <span className="tmpl-emoji">{t.emoji}</span>
            <span className="tmpl-title">{t.title}</span>
            <span className="tmpl-sub">{t.sub}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function StoryStep({ template, setTemplate, customNotes, setCustomNotes,
                      style, setStyle, errorMsg, onBack, onGenerate, canGenerate }) {
  return (
    <div className="step-wrap">
      <div className="step-header">
        <h2>Pick your story</h2>
        <p className="step-sub">Choose a template or write your own</p>
      </div>

      <TemplateSection label="🎬 Disney Movies" templates={MOVIE_TEMPLATES} selected={template} onSelect={setTemplate} />
      <TemplateSection label="📖 Children's Books" templates={BOOK_TEMPLATES} selected={template} onSelect={setTemplate} />

      <div className="story-section">
        <p className="story-section-label">✨ Your Story</p>
        <button
          className={`template-card template-card--wide ${template === 'custom' ? 'template-card--selected' : ''}`}
          onClick={() => setTemplate('custom')}
          type="button"
        >
          <span className="tmpl-emoji">✨</span>
          <span className="tmpl-title">Write your own adventure</span>
        </button>
        {template === 'custom' && (
          <textarea
            className="custom-textarea mt-12"
            placeholder="e.g. We go on a beach adventure, find a mermaid, and end with a big hug on the sand..."
            value={customNotes}
            onChange={e => setCustomNotes(e.target.value)}
            rows={4}
          />
        )}
      </div>

      <div className="card mt-12">
        <p className="field-label">Art style</p>
        <div className="style-row">
          {STYLES.map(s => (
            <button
              key={s.id}
              className={`style-chip ${style === s.id ? 'style-chip--selected' : ''}`}
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

      <p className="gen-note">
        This takes 2–3 minutes.
        <strong> Bookmark this page</strong> — if you close the tab you can come back to it later.
      </p>
    </div>
  )
}

// ── Step: Result ──────────────────────────────────────────────────────────────

function ResultStep({ statusData, childName, onReset, onPanelClick, jobId }) {
  const panels = statusData.panels ?? []
  const [copied, setCopied] = useState(false)

  function shareComic() {
    const url = `${window.location.origin}${window.location.pathname}?comic=${jobId}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  async function downloadPanel(url, n, e) {
    e.stopPropagation()
    try {
      const blob = await fetch(url).then(r => r.blob())
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `mom-and-me-panel-${n}.png`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      // fallback: open in new tab
      window.open(url, '_blank')
    }
  }

return (
    <div className="step-wrap result-wrap">
      <div className="result-header">
        <div className="result-title-row">
          <span className="heart-icon">💝</span>
          <h2>
            {childName}'s<br />
            <span className="title-accent">Mother's Day Comic</span>
          </h2>
          <span className="heart-icon">💝</span>
        </div>
        <p className="result-sub">Your personalised comic book is ready! Tap a panel to enlarge.</p>
      </div>

      <div className="comic-scroll">
        {panels.map(p => (
          <div key={p.panel} className="comic-panel">
            <img src={p.image_url} alt={`Panel ${p.panel}`} className="comic-panel-img" />
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
        {jobId && (
          <button className="ghost-btn" onClick={shareComic}>
            {copied ? '✓ Copied!' : '🔗 Share'}
          </button>
        )}
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

  // Resume from URL on mount (?comic=<job_id>)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sharedJobId = params.get('comic')
    if (!sharedJobId) return

    setJobId(sharedJobId)
    setStep('generating')

    fetch(`${API_BASE}/api/comic-status/${sharedJobId}`)
      .then(r => r.json())
      .then(data => {
        setStatusData(data)
        if (data.status === 'done') {
          setStep('result')
        } else if (data.status === 'error') {
          setErrorMsg(data.error ?? 'Generation failed')
          setStep('photos')
          window.history.replaceState({}, '', window.location.pathname)
        } else {
          // still processing — start polling
          pollRef.current = setInterval(() => pollStatus(sharedJobId), POLL_MS)
        }
      })
      .catch(() => {
        setStep('photos')
        window.history.replaceState({}, '', window.location.pathname)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Photos
  const [momFile,      setMomFile]      = useState(null)
  const [momPreview,   setMomPreview]   = useState(null)
  const [childFile,    setChildFile]    = useState(null)
  const [childPreview, setChildPreview] = useState(null)
  const [childName,    setChildName]    = useState('')

  // Story
  const [template,    setTemplate]    = useState(null)
  const [customNotes, setCustomNotes] = useState('')
  const [style,       setStyle]       = useState('cartoon')

  // Generation
  const [jobId,       setJobId]       = useState(null)
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
    const tpl = [...MOVIE_TEMPLATES, ...BOOK_TEMPLATES].find(t => t.id === template)
    fd.append('story_type',   tpl?.seed ?? template)
    fd.append('story_notes',  customNotes)
    fd.append('style',        style)
    fd.append('mom_name',     'Mom')
    fd.append('child_name',   childName || 'Child')

    try {
      const res = await fetch(`${API_BASE}/api/comic`, { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(err.detail ?? 'Unknown error')
      }
      const { job_id } = await res.json()
      setJobId(job_id)
      window.history.pushState({}, '', `?comic=${job_id}`)
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
    window.history.replaceState({}, '', window.location.pathname)
    setStep('photos')
    setJobId(null)
    setMomFile(null);    setMomPreview(null)
    setChildFile(null);  setChildPreview(null)
    setChildName('')
    setTemplate(null);   setCustomNotes('');  setStyle('cartoon')
    setStatusData({});   setErrorMsg(null)
  }

  const canGoToStory = !!(momFile && childFile)
  const canGenerate  = !!(template && (template !== 'custom' || customNotes.trim()))

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">💝 Mom &amp; Me Comics</div>
        <p className="app-tagline">A personalised Mother's Day comic book — starring the mom and her child!</p>
      </header>

      <StepBar step={step} />

      <main className="app-main">
        {step === 'photos' && (
          <PhotosStep
            momPreview={momPreview}   momFile={momFile}
            childPreview={childPreview} childFile={childFile}
            childName={childName}
            momRef={momRef}           childRef={childRef}
            onPickMom={pickMom}       onPickChild={pickChild}
            onChildName={setChildName}
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
            childName={childName || 'Child'}
            onReset={handleReset}
            onPanelClick={setLightboxUrl}
            jobId={jobId}
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
