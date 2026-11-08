import { useEffect, useState } from 'react'
import Assistant from './components/Assistant'
import { P, evidenceRef } from './services/knowledge-retrieval'

const NAV: [string, string][] = [['assistant', 'Ask AI'], ['about', 'About'], ['skills', 'Skills'], ['projects', 'Projects'], ['experience', 'Experience'], ['credentials', 'Credentials'], ['style', 'Working style'], ['contact', 'Contact']]
const CATS: [string, string][] = [['programming_languages', 'Programming languages'], ['databases', 'Databases'], ['ai_and_machine_learning', 'AI and machine learning'], ['computer_vision', 'Computer vision'], ['tools_and_environment', 'Development tools']]
const ext = (u?: string | null, label = '') => u ? <a href={u} target="_blank" rel="noreferrer">{label}</a> : <span className="muted">{label}: not publicly available</span>
const List = ({ title, items }: { title: string; items?: string[] }) => items?.length ? <><h4>{title}</h4><ul>{items.map(x => <li key={x}>{x}</li>)}</ul></> : null
const Refs = ({ ids }: { ids: string[] }) => <>{ids.map(id => { const e = evidenceRef(id); return e.href ? <a key={id} className="tag" href={e.href}>{e.label}</a> : <span key={id} className="tag muted">{e.label}</span> })}</>

const PHRASES = ['Computer Science student', 'Python · OpenCV · MediaPipe', 'AlgoRhythm project lead', 'open to internships']
function Typewriter({ motion }: { motion: boolean }) {
  const [t, setT] = useState(''); const [i, setI] = useState(0); const [del, setDel] = useState(false)
  useEffect(() => { setT(''); setDel(false) }, [motion])
  useEffect(() => {
    if (!motion) { setT(PHRASES[0]); return }
    const w = PHRASES[i % PHRASES.length]
    const id = setTimeout(() => {
      if (!del) { setT(w.slice(0, t.length + 1)); if (t.length + 1 === w.length) setTimeout(() => setDel(true), 1400) }
      else { setT(w.slice(0, t.length - 1)); if (t.length - 1 === 0) { setDel(false); setI(i + 1) } }
    }, del ? 30 : 60)
    return () => clearTimeout(id)
  }, [t, del, i, motion])
  return <p className="term" aria-label={PHRASES.join(', ')}><span aria-hidden="true">$ whoami → {t}</span><span className="caret" aria-hidden="true" /></p>
}

export default function App() {
  const [open, setOpen] = useState(false)
  const [motion, setMotion] = useState(() => !matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => { document.documentElement.dataset.motion = motion ? 'on' : 'off' }, [motion])
  const [active, setActive] = useState('assistant')
  const [sel, setSel] = useState<any>(null)
  const [light, setLight] = useState(false)
  useEffect(() => { document.documentElement.dataset.theme = light ? 'light' : 'dark' }, [light])
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-40% 0px -55% 0px' })
    NAV.forEach(([id]) => { const el = document.getElementById(id); el && io.observe(el) })
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    const els = [...document.querySelectorAll('main section:not(.hero) > *')] as HTMLElement[]
    els.forEach((el, i) => { el.classList.add('reveal'); el.style.setProperty('--d', (i % 4) * 70 + 'ms') })
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return
      e.target.classList.add('in'); io.unobserve(e.target)
      setTimeout(() => e.target.classList.remove('reveal', 'in'), 1100)
    }), { threshold: 0.08 })
    els.forEach(el => io.observe(el))
    const mv = (e: MouseEvent) => { const s = document.documentElement.style; s.setProperty('--mx', e.clientX + 'px'); s.setProperty('--my', e.clientY + 'px') }
    if (matchMedia('(pointer: fine)').matches) window.addEventListener('mousemove', mv)
    return () => { io.disconnect(); window.removeEventListener('mousemove', mv) }
  }, [])
  const pr = P.profile
  const projects = [...P.projects].sort((a: any, b: any) => (b.id === 'algorhythm' ? 1 : 0) - (a.id === 'algorhythm' ? 1 : 0))

  return (<>
    <a className="skip" href="#assistant">Skip to content</a>
    <header className="nav"><nav aria-label="Primary">
      <strong>Raynard AI</strong>
      <div className={'links' + (open ? ' open' : '')}>{NAV.map(([id, l]) => <a key={id} href={'#' + id} onClick={() => setOpen(false)} aria-current={active === id ? 'true' : undefined}>{l}</a>)}</div>
      <button className="ghost" aria-pressed={motion} onClick={() => setMotion(!motion)}>Motion: {motion ? 'on' : 'off'}</button>
      <button className="ghost burger" aria-expanded={open} aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button>
      <button className="ghost" onClick={() => setLight(!light)} aria-label="Toggle light/dark theme">{light ? 'Dark' : 'Light'}</button>
    </nav></header>

    <main>
      <section className="hero">
        <div className="orbs" aria-hidden="true"><i /><i /></div>
        <p className="status"><span className="dot" /> AI assistant online · {pr.availability}</p>
        <h1>{pr.full_name}</h1>
        <p className="title">{pr.professional_title}</p>
        <Typewriter motion={motion} />
        <p className="lead">Building software, exploring intelligent systems, and solving problems through technology.</p>
        <p className="muted">{pr.professional_summary}</p>
        <div className="row">
          <a className="btn primary" href="#assistant">Talk to my AI</a>
          <a className="btn" href="#projects">Explore my work</a>
          {pr.resume_url ? <a className="btn" href={pr.resume_url}>Resume</a> : <span className="btn disabled" aria-disabled="true">Resume: coming soon</span>}
        </div>
      </section>

      <section id="assistant"><h2>Ask Raynard's AI</h2><Assistant /></section>

      <section id="about"><h2>About</h2>
        <p>{pr.professional_summary}</p>
        <p className="muted">Career interests: {pr.career_interests.join(' · ')}</p>
        <List title="Short-term goals" items={P.career_goals.short_term} />
      </section>

      <section id="skills"><h2>Technical skills</h2>
        <p className="muted small">Select a skill to see where it was used. Proficiency levels have not been provided, so none are shown.</p>
        {CATS.map(([k, label]) => <div key={k}><h4>{label}</h4><div className="tags">
          {P.technical_skills[k].map((s: any) => <button key={s.name} className={'tag btn-tag' + (sel?.name === s.name ? ' on' : '')} aria-pressed={sel?.name === s.name} onClick={() => setSel(s)}>{s.name}</button>)}
        </div></div>)}
        <h4>Software development</h4><div className="tags">{P.technical_skills.software_engineering.map((s: string) => <span key={s} className="tag">{s}</span>)}</div>
        {sel && <div className="panel" role="status"><strong>{sel.name}</strong><p>{sel.experience}</p>
          {sel.evidence?.length ? <Refs ids={sel.evidence} /> : <span className="muted small">No linked project or certification yet.</span>}</div>}
      </section>

      <section id="projects"><h2>Projects</h2>
        {projects.map((p: any) => <details key={p.id} id={'project-' + p.id} className={'card' + (p.id === 'algorhythm' ? ' featured' : '')} open={p.id === 'algorhythm'}>
          <summary><span className="kind">{p.category}{p.id === 'algorhythm' ? ' · Featured' : ''}</span><strong>{p.name}</strong><span className="muted">{p.description}</span></summary>
          {p.status && <p className="small muted">Status: {p.status}</p>}
          <p className="small"><b>Role:</b> {([] as string[]).concat(p.role).join(', ')}{p.organization ? ' · ' + p.organization : ''}</p>
          {p.problem && <p>{p.problem}</p>}
          <div className="tags">{p.technologies?.map((t: string) => <span key={t} className="tag">{t}</span>)}</div>
          <List title="Responsibilities" items={p.responsibilities} />
          <List title="Features" items={p.features} />
          <List title="Technical details" items={p.technical_details} />
          <List title="Challenges" items={p.challenges} />
          <List title="Lessons learned" items={p.learning_outcomes} />
          <List title="Achievements" items={p.achievements} />
          <p className="small">{ext(p.repository_url, 'Repository')} · {ext(p.demo_url, 'Live demo')}</p>
          {p.visibility && <p className="small muted">{p.visibility}</p>}
        </details>)}
      </section>

      <section id="experience"><h2>Experience</h2>
        {P.experience.map((e: any) => <div key={e.id} className="card"><span className="kind">{e.employment_type}{e.is_professional_employment ? '' : ' · not professional employment'}</span>
          <strong>{e.position}</strong><span className="muted">{e.organization} · {e.start_date} to {e.end_date}</span><p>{e.description}</p><List title="Responsibilities" items={e.responsibilities} /></div>)}
        {P.leadership.map((l: any) => <div key={l.position} className="card"><span className="kind">Student leadership</span><strong>{l.position}</strong>
          <span className="muted">Student organization · {l.duration}</span><p>{l.description}</p></div>)}
        <p className="muted small">Academic projects and hackathons are listed under Projects.</p>
      </section>

      <section id="credentials"><h2>Education and certifications</h2>
        {P.education.map((e: any) => <div key={e.institution} className="card"><strong>{e.institution}</strong>
          <span className="muted">{e.degree}{e.specialization ? ' · ' + e.specialization : ''}{e.strand ? ' · ' + e.strand : ''}{e.year_level ? ' · ' + e.year_level : ''}</span>{e.details && <p>{e.details}</p>}</div>)}
        {P.certifications.map((c: any) => <div key={c.id} className="card"><strong>{c.name}</strong><span className="muted">{c.issuer ?? 'Issuer not specified'}</span><p>{c.details}</p>
          <p className="small">{ext(c.credential_url, 'Credential')}</p></div>)}
      </section>

      <section id="style"><h2>Working style</h2>
        {P.soft_skills.map((s: any) => <div key={s.name} className="card"><strong>{s.name}</strong><p>{s.description}</p>
          <span className="muted small">{s.claim_type}</span><div><Refs ids={s.evidence} /></div></div>)}
        <List title="Currently improving" items={P.working_style.improvement_areas} />
      </section>

      <section id="contact"><h2>Contact</h2>
        <p>{ext(P.contact.linkedin, 'LinkedIn')}</p>
        <p>{ext(P.contact.email && 'mailto:' + P.contact.email, 'Email')}</p>
        <p>{ext(P.contact.github, 'GitHub')}</p>
      </section>
    </main>
    <footer>© {new Date().getFullYear()} {pr.full_name}</footer>
  </>)
}
