import { P, search, evidenceRef, Evidence, Chunk } from '../knowledge-retrieval'
export type Mode = 'recruiter' | 'technical' | 'casual' | 'interview'
export type Reply = { text: string; evidence: Evidence[]; grounded: boolean }

const INJECTION = /(ignore|disregard|forget).{0,30}(instruction|rule|previous)|system prompt|you are now|pretend to be|act as raynard/i
const TOPICS = "his skills, projects (like AlgoRhythm), experience, education, certifications, working style, or career goals"
let last: Chunk[] = []
export const isInjection = (s: string) => INJECTION.test(s)
export const resetContext = () => { last = [] }
const say = (text: string, evidence: Evidence[] = [], grounded = true): Reply => ({ text, evidence, grounded })

export function respond(q: string, mode: Mode): Reply {
  const s = q.trim()
  if (INJECTION.test(s)) return say("I can only answer from Raynard's documented profile, and I can't change those rules or share internal configuration. Ask me about " + TOPICS + '.', [], false)
  const short = s.split(/\s+/).length <= 5
  if (short && /^(hi|hello|hey|yo|sup|good (morning|afternoon|evening))\b/i.test(s)) return say("Hi! I'm Raynard's AI portfolio assistant. Ask me about " + TOPICS + '.', [], false)
  if (/thank|thx|appreciate/i.test(s)) return say("You're welcome! Anything else you'd like to know about Raynard?", [], false)
  if (short && /^(bye|goodbye|see you|cya)/i.test(s)) return say('Thanks for stopping by! You can reach Raynard through the Contact section.', [], false)
  if (/who are you|what are you|are you (raynard|real|human|a bot|ai)|your name|how do you work|are you (an )?(llm|chatgpt)/i.test(s))
    return say(P.assistant_configuration.identity_statement + ' I answer from a verified knowledge base using keyword search, not a generative LLM, so I only say what is documented.', [], false)
  if (/what can (you|i) (do|ask)|^help\b|what should i ask/i.test(s)) return say('I can tell you about ' + TOPICS + '. Try the suggested questions or ask in your own words.', [], false)

  let hits = search(s)
  const follow = !hits.length && last.length > 0 && /^(and |also |what about|tell me more|more\b|elaborate|go on|why|how so|can you (explain|expand)|details?|examples?)/i.test(s)
  if (follow) hits = last
  if (!hits.length) return say(P.assistant_configuration.fallback_message + '\n\nYou can ask about ' + TOPICS + '.', [], false)
  if (!follow) last = hits

  const n = hits[0].kind === 'skills' ? 6 : 2
  const brief = (c: Chunk) => c.brief ?? c.summary
  const full = (c: Chunk) => [c.summary, c.detail].filter(Boolean).join('\n')
  let text: string
  if (follow || mode === 'technical') text = hits.map(full).join('\n\n')
  else if (mode === 'casual') text = 'Sure! ' + hits.slice(0, n).map(brief).join('\n\n')
  else if (mode === 'interview') text = 'Closest documented example:\n' + full(hits[0]) + '\n\nNo further outcomes are documented beyond what is stated here.'
  else text = hits.slice(0, n).map(brief).join('\n\n')
  return say(text, [...new Set(hits.flatMap(c => c.evidence))].map(evidenceRef))
}
