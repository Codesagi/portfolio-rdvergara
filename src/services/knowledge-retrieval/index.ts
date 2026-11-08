import raw from '../../data/raynard-profile.json'
export const P: any = raw

export type Evidence = { id: string; label: string; href?: string }
export type Chunk = { id: string; kind: string; title: string; summary: string; detail?: string; tags: string; evidence: string[]; brief?: string }

const arr = (x: any): string[] => (x == null ? [] : ([] as string[]).concat(x))
const j = (x: any) => arr(x).join(' ')

export function evidenceRef(id: string): Evidence {
  const pr = P.projects.find((p: any) => p.id === id)
  if (pr) return { id, label: pr.name, href: '#project-' + id }
  const ce = P.certifications.find((c: any) => c.id === id)
  if (ce) return { id, label: ce.name, href: '#credentials' }
  if (P.experience.some((e: any) => e.id === id)) return { id, label: id.replace(/-/g, ' '), href: '#experience' }
  return { id, label: id.replace(/-/g, ' ') + ' (private, not public)' }
}

const skillCats: [string, string][] = [
  ['programming_languages', 'Programming languages'], ['databases', 'Databases'],
  ['ai_and_machine_learning', 'AI and machine learning'], ['computer_vision', 'Computer vision'],
  ['tools_and_environment', 'Development tools'],
]

export const chunks: Chunk[] = [
  { id: 'contact', kind: 'contact', title: 'Contact', summary: `LinkedIn: ${P.contact?.linkedin ?? 'not published'}. Email: ${P.contact?.email ?? 'not published'}. GitHub: ${P.contact?.github ?? 'not published'}.`, tags: 'contact reach email linkedin github resume hire', evidence: [] },
  { id: 'summary', kind: 'about', title: 'Who is Raynard summary', summary: P.profile.professional_summary, tags: 'about background who introduce yourself student education', evidence: [] },
  ...P.education.map((e: any, i: number) => ({ id: 'edu' + i, kind: 'education', title: e.institution,
    summary: `${e.degree}${e.specialization ? ' (' + e.specialization + ')' : ''}${e.year_level ? ', ' + e.year_level : ''}. ${e.details ?? ''}`, tags: 'education school university degree study', evidence: [] })),
  ...P.projects.map((p: any) => ({ id: p.id, kind: 'project', title: p.name,
    summary: `${p.name} (${p.category}): ${p.description} ${p.role ? 'Role: ' + arr(p.role).join(', ') + '.' : ''}${p.technologies?.length ? ' Technologies: ' + p.technologies.join(', ') + '.' : ''}${p.achievements?.length ? ' ' + p.achievements.join(' ') : ''}`,
    detail: [j(p.technical_details), j(p.responsibilities), p.challenges ? 'Challenges: ' + j(p.challenges) : '', p.learning_outcomes ? 'Learned: ' + j(p.learning_outcomes) : ''].filter(Boolean).join(' '),
    tags: [p.category, p.type, j(p.technologies), j(p.features), j(p.role), p.organization ?? ''].join(' '), evidence: [p.id, ...arr(p.evidence)] })),
  ...skillCats.map(([k, label]) => {
    const items: any[] = P.technical_skills[k]
    return { id: k, kind: 'skills', title: label,
      summary: `${label}: ` + items.map(s => `${s.name} (${s.experience})`).join(' '), brief: `${label}: ` + items.map(s => s.name).join(', '), tags: items.map(s => s.name).join(' ') + ' skills',
      evidence: [...new Set(items.flatMap(s => arr(s.evidence)))] }
  }),
  { id: 'swe', kind: 'skills', title: 'Software development', summary: 'Software development topics: ' + P.technical_skills.software_engineering.join(', ') + '.', tags: 'skills strengths software engineering', evidence: [] },
  ...P.experience.map((e: any) => ({ id: 'exp-' + e.id, kind: 'experience', title: e.position,
    summary: `${e.position} at ${e.organization} (${e.start_date} to ${e.end_date}). Type: ${e.employment_type}${e.is_professional_employment ? '' : ' (not professional employment)'}. ${e.description}`,
    detail: 'Responsibilities: ' + j(e.responsibilities), tags: 'experience work immersion job internship ' + e.organization, evidence: [e.id] })),
  ...P.leadership.map((l: any, i: number) => ({ id: 'lead' + i, kind: 'leadership', title: l.position,
    summary: `${l.position} of a student organization (${l.duration}). ${l.description}`, tags: 'leadership organization officer team', evidence: arr(l.evidence) })),
  ...P.certifications.map((c: any) => ({ id: c.id, kind: 'certification', title: c.name, summary: `${c.name}${c.issuer ? ' by ' + c.issuer : ''}. ${c.details}`, tags: 'certification certificate course', evidence: [c.id] })),
  ...P.soft_skills.map((s: any) => ({ id: 'soft-' + s.name, kind: 'soft', title: s.name, summary: `${s.name}: ${s.description} (${s.claim_type})`, tags: 'soft skills working style behavior', evidence: arr(s.evidence) })),
  { id: 'style', kind: 'style', title: 'Working style', summary: Object.values(P.working_style).filter(v => typeof v === 'string').join(' '),
    tags: 'working style approach problem solving learning collaboration', evidence: [] },
  { id: 'improve', kind: 'style', title: 'Areas of improvement', summary: 'Currently improving: ' + P.working_style.improvement_areas.join(' '), tags: 'improving improvement weakness growth time management', evidence: ['algorhythm'] },
  { id: 'goals', kind: 'goals', title: 'Career goals', summary: `${P.profile.availability ?? ''}. Short term: ${j(P.career_goals.short_term)} Long term: ${j(P.career_goals.long_term)}`,
    tags: 'career goals interests internship intern suitable future ' + j(P.profile.career_interests), evidence: [] },
]

const STOP = new Set('a an the of to in on is are was what does do he his him raynard about tell me how with for and or any has have make makes'.split(' '))
const SYN: Record<string, string> = {
  who: 'summary background', introduce: 'summary background', background: 'summary education', thesis: 'capstone algorhythm', cv: 'computer vision opencv', vision: 'opencv mediapipe', db: 'database sql',
  databases: 'database sql supabase mysql', languages: 'programming python java', internship: 'goals career intern',
  intern: 'goals career', weakness: 'improving improvement', strengths: 'skills', teamwork: 'team soft', leader: 'leadership', ai: 'machine learning', ml: 'machine learning',
}
const stem = (w: string) => w.replace(/s$/, '')
export const normalize = (q: string) => q.toLowerCase().replace(/[^a-z0-9+#\s]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !STOP.has(w))
const words = (s: string) => new Set(normalize(s).map(stem))
const index = chunks.map(c => ({ c, title: words(c.title), body: words(c.summary + ' ' + c.tags) }))

const INTENTS: [RegExp, string[]][] = [
  [/skill|know|stack|technolog|language|framework|tool|python|java|sql|database|good at|strength|abilit|capab|proficien|expert|code|program/i, ['skills']],
  [/project|built|build|made|thesis|capstone|hackathon|algorhythm|portfolio|\bapp\b|\bwork(ed)? on/i, ['project']],
  [/experience|job|immersion|employ|history|work(ed|ing)? (at|for)/i, ['experience']],
  [/educat|school|universit|college|degree|stud(y|ied)|major|graduat|\bfeu\b|\byear\b/i, ['education']],
  [/certif|credential|topcit|cs50/i, ['certification']],
  [/leader|officer|president|organi[sz]ation|\bled\b|\blead\b|manage/i, ['leadership']],
  [/soft|style|team|collaborat|communicat|problem|approach|learn|adapt|time management|how (does|do) (he|they) work/i, ['soft', 'style']],
  [/improv|weak|growth|struggl|areas?/i, ['style']],
  [/goal|future|aspir|career|interest|suitable|hire|fit|looking for|availab|open to|why/i, ['goals']],
  [/\bwho\b|introduc|about (him|raynard)|tell me about|summary|background|overview|describe/i, ['about', 'education']],
  [/contact|email|reach|linkedin|github|resume|\bcv\b|phone|social/i, ['contact']],
]
const VOCAB = ['skill', 'project', 'experience', 'education', 'certification', 'contact', 'goal', 'career', 'language', 'database', 'internship', 'improve', 'thesis', 'hackathon']
export const detectKinds = (q: string) => {
  const fixed = normalize(q).map(t => VOCAB.find(v => t.length >= 4 && near(stem(t), v)) ?? t).join(' ')
  return [...new Set(INTENTS.flatMap(([re, k]) => (re.test(q) || re.test(fixed) ? k : [])))]
}

const near = (a: string, b: string) => {
  if (a === b) return true
  if (Math.abs(a.length - b.length) > 1) return false
  let i = 0, j = 0, d = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue }
    if (++d > 1) return false
    if (a.length > b.length) i++; else if (a.length < b.length) j++; else { i++; j++ }
  }
  return d + (a.length - i) + (b.length - j) <= 1
}

export function search(q: string, k = 3): Chunk[] {
  const kinds = detectKinds(q)
  let base = normalize(q)
  if (!base.length && !kinds.length) base = ['who']
  const toks = base.flatMap(t => [t, ...(SYN[t]?.split(' ') ?? [])]).map(stem)
  const hit = (set: Set<string>, t: string) => set.has(t) || (t.length >= 5 && [...set].some(w => near(w, t)))
  const ranked = index.map(({ c, title, body }) => {
    let s = kinds.includes(c.kind) ? 4 : 0
    for (const t of toks) { if (hit(title, t)) s += 3; if (hit(body, t)) s += 1 }
    return { c, s }
  }).filter(x => x.s >= 2).sort((a, b) => b.s - a.s)
  const top = ranked[0]?.s ?? 0
  return ranked.filter(x => x.s >= top * 0.6).slice(0, ranked[0]?.c.kind === 'skills' ? 6 : k).map(x => x.c)
}
