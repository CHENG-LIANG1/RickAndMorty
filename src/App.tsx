import { useEffect, useMemo, useState } from 'react'

type Screen = 'home' | 'quiz' | 'invite' | 'loading' | 'result'
type Language = 'en' | 'zh'

type Challenge = {
  name: string
  answers: number[]
  incident: string
  language?: Language
}

type Character = {
  id: number
  name: string
  status: string
  species: string
  image: string
  location: { name: string }
}

type Outcome = {
  winnerName: string
  loserName: string
  winnerCharacter: Character
  loserCharacter: Character
  destination: string
  survivalTime: string
  chaosMatch: number
  incident: string
}

const questionSets = {
  en: [
    { prompt: 'A portal opens inside your bathroom. What do you grab first?', left: 'A towel. Dignity matters.', right: 'The portal gun. Pants are optional.' },
    { prompt: 'A parasite has perfect memories of being your best friend.', left: 'Ask one question only they know.', right: 'Shoot first. Process feelings later.' },
    { prompt: 'Rick says the glowing vial is “probably safe.”', left: 'Make Rick drink it.', right: 'Drink half. Save half for science.' },
    { prompt: 'Your ship has one escape pod and two passengers.', left: 'Try to repair the ship together.', right: 'The pod now has one passenger.' },
    { prompt: 'A Meeseeks offers to fix your entire life.', left: 'Give it one small, precise task.', right: 'Ask it to make me happy forever.' },
    { prompt: 'The Council of Ricks offers you immunity for one name.', left: 'Say nothing.', right: 'Spell my friend’s name slowly.' },
  ],
  zh: [
    { prompt: '浴室里突然出现一道传送门。你先拿什么？', left: '毛巾。尊严还是要有的。', right: '传送枪。裤子可有可无。' },
    { prompt: '寄生虫拥有你和挚友之间所有完美回忆。', left: '问一个只有朋友知道的问题。', right: '先开枪，感情以后再处理。' },
    { prompt: 'Rick 说发光药剂“应该没事”。', left: '让 Rick 先喝。', right: '喝一半，另一半留给科学。' },
    { prompt: '飞船只有一个逃生舱，却有两名乘客。', left: '一起留下来修好飞船。', right: '现在逃生舱只有一名乘客了。' },
    { prompt: 'Meeseeks 愿意帮你彻底解决人生问题。', left: '只交给它一个明确的小任务。', right: '让它保证我永远快乐。' },
    { prompt: 'Rick 委员会用豁免权换一个名字。', left: '什么都不说。', right: '慢慢拼出朋友的名字。' },
  ],
} as const

const copy = {
  en: {
    terminal: 'WDF-7 // EVIDENCE TERMINAL', experiment: 'MULTIVERSE SOCIAL EXPERIMENT', incident: 'INCIDENT', audio: 'AUDIO', on: 'ON', off: 'OFF',
    homeAria: 'Go to start', audioOnAria: 'Turn audio on', audioOffAria: 'Turn audio off', languageAria: 'Switch to Chinese',
    log: 'LOG', flight: 'FLT', section: 'SEC', outcome: 'OUTCOME', unknown: 'UNKNOWN', final: 'FINAL',
    heroTitle: ['YOU BOTH ENTER.', 'ONLY ONE RETURNS.'], heroBody: ['Answer six bad decisions.', 'Send the portal to a friend.', 'Find out who makes it home.'],
    openPortal: 'OPEN THE PORTAL', howItWorks: 'HOW IT WORKS', noSignup: 'NO SIGN-UP', twoMinutes: '2 MINUTES', oneSurvivor: 'ONE SURVIVOR',
    stability: 'DIMENSIONAL STABILITY', unstable: 'UNSTABLE',
    process: [
      { title: ['ANSWER SIX', 'BAD DECISIONS'], body: 'Your choices become evidence.' },
      { title: ['SEND THE PORTAL', 'TO A FRIEND'], body: 'Same incident. Different fate.' },
      { title: ['FIND OUT WHO', 'MAKES IT HOME'], body: 'One survivor. Probably.' },
    ],
    openedPortal: 'OPENED A PORTAL.', identify: 'IDENTIFY THE SUBJECT.', yourName: 'YOUR NAME', enterName: 'ENTER NAME', question: 'Question', decision: 'DECISION', unlock: 'ENTER YOUR NAME TO UNLOCK THE CONTROLS.',
    transmission: 'TRANSMISSION READY // SUBJECT 01:', inviteTitle: ['THE PORTAL NEEDS', 'A SECOND VICTIM.'], inviteBody: 'Send this encrypted incident to a friend. Your result stays sealed until they make all six decisions.', copied: 'COPIED', copyLink: 'COPY LINK', portalCopied: 'PORTAL COPIED', copyChallenge: 'COPY CHALLENGE', demo: 'RUN A DEMO REVEAL', awaiting: ['AWAITING', 'SUBJECT 02'],
    colliding: 'COLLIDING DECISIONS', calculating: ['CALCULATING WHO', 'GETS LEFT BEHIND…'], portalCalibrating: 'Portal calibrating',
    madeIt: 'MADE IT HOME.', didNot: 'DID NOT.', survivor: 'SURVIVOR', casualty: 'CASUALTY', grabbed: 'You grabbed the portal gun.', trusted: 'trusted you.', mistake: 'That was their first mistake.',
    destination: 'DESTINATION', statusLocked: 'STATUS // LOCKED', survivalTime: 'SURVIVAL TIME', minutesSeconds: 'MINUTES // SECONDS', chaosMatch: 'CHAOS MATCH', alignment: 'MULTIVERSE ALIGNMENT',
    challengeAnother: 'CHALLENGE ANOTHER FRIEND', resultCopied: 'RESULT COPIED', copyResult: 'COPY RESULT', rendering: 'RENDERING CARD', downloaded: 'CARD DOWNLOADED', retryDownload: 'TRY DOWNLOAD AGAIN', downloadCard: 'DOWNLOAD CARD', runAgain: 'RUN IT AGAIN',
  },
  zh: {
    terminal: 'WDF-7 // 事故证据终端', experiment: '多元宇宙社会实验', incident: '事故', audio: '音效', on: '开', off: '关',
    homeAria: '返回首页', audioOnAria: '开启音效', audioOffAria: '关闭音效', languageAria: 'Switch to English',
    log: '记录', flight: '宇宙', section: '题目', outcome: '结果', unknown: '未知', final: '已定',
    heroTitle: ['两个人进去。', '只有一个回来。'], heroBody: ['回答六个糟糕选择。', '把传送门发给朋友。', '看看谁能活着回家。'],
    openPortal: '开启传送门', howItWorks: '怎么玩', noSignup: '无需注册', twoMinutes: '2 分钟', oneSurvivor: '一人幸存',
    stability: '维度稳定性', unstable: '不稳定',
    process: [
      { title: ['回答六个', '糟糕选择'], body: '你的选择都会成为证据。' },
      { title: ['把传送门', '发给朋友'], body: '同一场事故，不同的命运。' },
      { title: ['看看谁能', '活着回家'], body: '只有一个幸存者。大概。' },
    ],
    openedPortal: '打开了传送门。', identify: '确认实验对象。', yourName: '你的名字', enterName: '输入名字', question: '问题', decision: '选择', unlock: '输入名字后才能操作。',
    transmission: '传送就绪 // 实验对象 01：', inviteTitle: ['传送门还需要', '第二个受害者。'], inviteBody: '把加密事故发给朋友。对方完成六个选择之前，结果将保持封存。', copied: '已复制', copyLink: '复制链接', portalCopied: '传送门已复制', copyChallenge: '复制挑战', demo: '演示结果', awaiting: ['等待', '实验对象 02'],
    colliding: '正在碰撞两人的选择', calculating: ['正在计算', '谁会被留下……'], portalCalibrating: '传送门校准中',
    madeIt: '活着回来了。', didNot: '没能回来。', survivor: '幸存者', casualty: '遇难者', grabbed: '你抢走了传送枪。', trusted: '相信了你。', mistake: '那是 TA 犯的第一个错误。',
    destination: '目的地', statusLocked: '状态 // 已锁定', survivalTime: '存活时间', minutesSeconds: '分钟 // 秒', chaosMatch: '混乱匹配度', alignment: '多元宇宙同步率',
    challengeAnother: '再挑战一个朋友', resultCopied: '结果已复制', copyResult: '复制结果', rendering: '正在生成卡片', downloaded: '卡片已下载', retryDownload: '重新下载', downloadCard: '下载结果卡', runAgain: '再玩一次',
  },
} as const

type Copy = (typeof copy)[Language]

const characterIds = [1, 2, 3, 4, 5, 47, 118, 242, 265, 361, 600, 795]

const fallbackCharacters: Character[] = [
  {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    location: { name: 'Earth (Replacement Dimension)' },
  },
  {
    id: 2,
    name: 'Morty Smith',
    status: 'Alive',
    species: 'Human',
    image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
    location: { name: 'Earth (Replacement Dimension)' },
  },
]

function hashText(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash >>> 0)
}

function encodeChallenge(value: Challenge) {
  const bytes = new TextEncoder().encode(JSON.stringify(value))
  let binary = ''
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)))
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function decodeChallenge(value: string | null): Challenge | null {
  if (!value) return null
  try {
    const normalized = value.replaceAll('-', '+').replaceAll('_', '/')
    const binary = atob(normalized)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as Challenge
    if (!parsed.name || parsed.answers.length !== 6) return null
    if (parsed.language && parsed.language !== 'en' && parsed.language !== 'zh') return null
    return parsed
  } catch {
    return null
  }
}

function makeIncident() {
  const today = new Date()
  const day = Math.floor(today.getTime() / 86_400_000)
  return `${String((day % 89) + 10).padStart(2, '0')}-${String.fromCharCode(65 + (day % 6))}`
}

function IconArrow() {
  return (
    <svg viewBox="0 0 28 16" aria-hidden="true">
      <path d="M1 8h24M18 1l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  )
}

function IconVolume({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
      {!muted && <path d="M16 8c1.4 1 2 2.3 2 4s-.6 3-2 4M18.5 5.5c2.2 1.8 3.5 3.9 3.5 6.5s-1.3 4.8-3.5 6.5" fill="none" stroke="currentColor" strokeWidth="1.7" />}
      {muted && <path d="m16 9 6 6m0-6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" />}
    </svg>
  )
}

function Header({ muted, onToggleAudio, onHome, onToggleLanguage, incident, language, t }: { muted: boolean; onToggleAudio: () => void; onHome: () => void; onToggleLanguage: () => void; incident: string; language: Language; t: Copy }) {
  return (
    <header className="site-header">
      <button className="wordmark" onClick={onHome} aria-label={t.homeAria}>WHO DIES FIRST?</button>
      <div className="header-code">{t.terminal}<br />{t.experiment}</div>
      <div className="header-actions">
        <span className="daily-dot" />
        <span>{t.incident} {incident}</span>
        <button className="language-toggle" onClick={onToggleLanguage} aria-label={t.languageAria}><b>{language === 'en' ? '中' : 'EN'}</b></button>
        <button className="audio-toggle" onClick={onToggleAudio} aria-label={muted ? t.audioOnAria : t.audioOffAria}>
          <span>{t.audio}</span><IconVolume muted={muted} /><b>{muted ? t.off : t.on}</b>
        </button>
      </div>
    </header>
  )
}

function SideRail({ incident, outcome, t }: { incident: string; outcome: string; t: Copy }) {
  return (
    <aside className="side-rail" aria-hidden="true">
      <div className="globe-mark">◎</div>
      <strong>{incident}</strong>
      <span className="barcode" />
      <dl>
        <dt>{t.log}</dt><dd>7713.8</dd>
        <dt>{t.flight}</dt><dd>R&amp;M-C137</dd>
        <dt>{t.section}</dt><dd>6/6</dd>
        <dt>{t.outcome}</dt><dd>{outcome}</dd>
      </dl>
    </aside>
  )
}

function Home({ onStart, t }: { onStart: () => void; t: Copy }) {
  return (
    <main className="home-screen">
      <section className="hero-copy">
        <h1>{t.heroTitle[0]}<br /><span>{t.heroTitle[1]}</span></h1>
        <p>{t.heroBody.map((line) => <span key={line}>{line}<br /></span>)}</p>
        <div className="hero-actions">
          <button className="primary-button" onClick={onStart}>{t.openPortal} <IconArrow /></button>
          <button className="text-button" onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })}>{t.howItWorks} <IconArrow /></button>
        </div>
        <div className="utility-line">{t.noSignup} <i /> {t.twoMinutes} <i /> {t.oneSurvivor}</div>
      </section>
      <div className="portal-stage" aria-hidden="true">
        <div className="portal-scanline" />
        <img src="/portal-machine.png" alt="" />
        <div className="portal-status"><span>{t.stability}</span><b>23%</b><em>{t.unstable}</em></div>
      </div>
      <section className="process-strip" id="process">
        {t.process.map((item, index) => <article key={item.body}><b>{String(index + 1).padStart(2, '0')}</b><h2>{item.title[0]}<br />{item.title[1]}</h2><p>{item.body}</p></article>)}
      </section>
    </main>
  )
}

function Quiz({ challenger, onComplete, language, t }: { challenger: Challenge | null; onComplete: (name: string, answers: number[]) => void; language: Language; t: Copy }) {
  const [name, setName] = useState('')
  const [answers, setAnswers] = useState<number[]>([])
  const step = answers.length
  const questions = questionSets[language]
  const complete = step === questions.length

  function choose(answer: number) {
    if (!name.trim()) return
    const next = [...answers, answer]
    setAnswers(next)
    if (next.length === questions.length) window.setTimeout(() => onComplete(name.trim(), next), 420)
  }

  return (
    <main className="quiz-screen">
      <section className="quiz-panel">
        <div className="quiz-intro">
          <span>{challenger ? `${challenger.name.toUpperCase()} ${t.openedPortal}` : t.identify}</span>
          <label htmlFor="player-name">{t.yourName}</label>
          <input id="player-name" value={name} onChange={(event) => setName(event.target.value.slice(0, 24))} placeholder={t.enterName} autoFocus autoComplete="off" />
        </div>
        <div className="progress-track" aria-label={`${t.question} ${Math.min(step + 1, 6)} / 6`}>
          {questions.map((_, index) => <span key={index} className={index < step ? 'done' : index === step ? 'active' : ''}>{String(index + 1).padStart(2, '0')}</span>)}
        </div>
        {!complete && (
          <div className="question-wrap" key={step}>
            <p className="question-number">{t.decision} {String(step + 1).padStart(2, '0')} / 06</p>
            <h1>{questions[step].prompt}</h1>
            <div className="answer-grid">
              <button disabled={!name.trim()} onClick={() => choose(0)}><small>A</small><span>{questions[step].left}</span><IconArrow /></button>
              <button disabled={!name.trim()} onClick={() => choose(1)}><small>B</small><span>{questions[step].right}</span><IconArrow /></button>
            </div>
            {!name.trim() && <p className="name-warning">{t.unlock}</p>}
          </div>
        )}
      </section>
      <div className="quiz-portal" aria-hidden="true"><img src="/portal-machine.png" alt="" /></div>
    </main>
  )
}

function Invite({ name, link, onCopy, onDemo, copied, t }: { name: string; link: string; onCopy: () => void; onDemo: () => void; copied: boolean; t: Copy }) {
  return (
    <main className="invite-screen">
      <section className="invite-copy">
        <p className="section-code">{t.transmission} {name.toUpperCase()}</p>
        <h1>{t.inviteTitle[0]}<br /><span>{t.inviteTitle[1]}</span></h1>
        <p>{t.inviteBody}</p>
        <div className="link-box"><span>{link}</span><button onClick={onCopy}>{copied ? t.copied : t.copyLink}</button></div>
        <div className="invite-actions">
          <button className="primary-button" onClick={onCopy}>{copied ? t.portalCopied : t.copyChallenge} <IconArrow /></button>
          <button className="text-button" onClick={onDemo}>{t.demo} <IconArrow /></button>
        </div>
      </section>
      <div className="invite-portal" aria-hidden="true"><img src="/portal-machine.png" alt="" /><span>{t.awaiting[0]}<br />{t.awaiting[1]}</span></div>
    </main>
  )
}

function Loading({ t }: { t: Copy }) {
  return (
    <main className="loading-screen">
      <img src="/portal-machine.png" alt={t.portalCalibrating} />
      <p>{t.colliding}</p>
      <h1>{t.calculating[0]}<br />{t.calculating[1]}</h1>
      <div className="loading-bar"><span /></div>
    </main>
  )
}

function Result({ outcome, onReset, onCopy, onDownload, copied, downloadState, t }: { outcome: Outcome; onReset: () => void; onCopy: () => void; onDownload: () => void; copied: boolean; downloadState: 'idle' | 'working' | 'done' | 'error'; t: Copy }) {
  return (
    <main className="result-screen">
      <section className="result-report">
        <p className="section-code">{t.incident} {outcome.incident}</p>
        <h1>{outcome.winnerName.toUpperCase()} {t.madeIt}<br /><span>{outcome.loserName.toUpperCase()} {t.didNot}</span></h1>
        <div className="evidence-pair">
          <figure><img src={outcome.winnerCharacter.image} alt={outcome.winnerCharacter.name} /><figcaption>{outcome.winnerCharacter.name}<b>{t.survivor}</b></figcaption></figure>
          <figure className="casualty"><img src={outcome.loserCharacter.image} alt={outcome.loserCharacter.name} /><figcaption>{outcome.loserCharacter.name}<b>{t.casualty}</b></figcaption></figure>
          <p>{t.grabbed}<br />{outcome.loserName} {t.trusted}<br />{t.mistake}</p>
        </div>
      </section>
      <section className="result-diagnostics">
        <img src="/portal-machine.png" alt="" aria-hidden="true" />
        <div className="diagnostic-panel"><small>{t.destination}</small><strong>{outcome.destination}</strong><em>{t.statusLocked}</em></div>
        <div className="diagnostic-panel"><small>{t.survivalTime}</small><strong>{outcome.survivalTime}</strong><em>{t.minutesSeconds}</em></div>
        <div className="diagnostic-panel"><small>{t.chaosMatch}</small><strong>{outcome.chaosMatch}%</strong><em>{t.alignment}</em></div>
      </section>
      <div className="result-actions">
        <button className="primary-button" onClick={onReset}>{t.challengeAnother} <IconArrow /></button>
        <button className="utility-button" onClick={onCopy}>{copied ? t.resultCopied : t.copyResult}</button>
        <button className="utility-button" onClick={onDownload} disabled={downloadState === 'working'}>{downloadState === 'working' ? t.rendering : downloadState === 'done' ? t.downloaded : downloadState === 'error' ? t.retryDownload : t.downloadCard}</button>
        <button className="text-button" onClick={onReset}>{t.runAgain} <IconArrow /></button>
      </div>
    </main>
  )
}

async function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

async function downloadResultCard(outcome: Outcome, language: Language, t: Copy) {
  await document.fonts.ready
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const context = canvas.getContext('2d')!
  context.fillStyle = '#d7d8c8'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = '#11130f'
  context.lineWidth = 4
  context.strokeRect(28, 28, 1024, 1864)
  context.fillStyle = '#11130f'
  context.font = language === 'zh' ? '700 42px "Noto Sans SC", sans-serif' : '700 42px "IBM Plex Mono", monospace'
  context.fillText(`${t.incident.toUpperCase()} ${outcome.incident}`, 74, 112)
  context.font = language === 'zh' ? '900 104px "Noto Sans SC", sans-serif' : '800 126px "Barlow Condensed", sans-serif'
  context.fillText(`${outcome.winnerName.toUpperCase()}`, 74, 290)
  context.fillText(t.madeIt, 74, 420)
  context.fillStyle = '#ff5a24'
  context.fillText(`${outcome.loserName.toUpperCase()}`, 74, 562)
  context.fillText(t.didNot, 74, 692)

  try {
    const [winnerImage, loserImage, portal] = await Promise.all([
      loadImage(outcome.winnerCharacter.image),
      loadImage(outcome.loserCharacter.image),
      loadImage('/portal-machine.png'),
    ])
    context.globalAlpha = 0.18
    context.drawImage(portal, 390, 740, 780, 780)
    context.globalAlpha = 1
    context.drawImage(winnerImage, 74, 790, 430, 430)
    context.drawImage(loserImage, 540, 790, 430, 430)
  } catch {
    context.fillStyle = '#8cff45'
    context.fillRect(74, 790, 896, 430)
  }

  context.fillStyle = '#ff5a24'
  context.font = language === 'zh' ? '900 54px "Noto Sans SC", sans-serif' : '800 62px "Barlow Condensed", sans-serif'
  context.fillText(t.survivor, 94, 1295)
  context.fillText(t.casualty, 558, 1295)
  context.fillStyle = '#11130f'
  context.font = '700 38px "IBM Plex Mono", monospace'
  context.fillText(`${t.destination.toUpperCase()}  ${outcome.destination.toUpperCase()}`, 74, 1430)
  context.fillText(`${t.survivalTime.toUpperCase()}  ${outcome.survivalTime}`, 74, 1500)
  context.fillText(`${t.chaosMatch.toUpperCase()}  ${outcome.chaosMatch}%`, 74, 1570)
  context.font = language === 'zh' ? '500 34px "Noto Sans SC", sans-serif' : '500 34px "DM Sans", sans-serif'
  context.fillText(t.grabbed, 74, 1690)
  context.fillText(`${outcome.loserName} ${t.trusted} ${t.mistake}`, 74, 1740)
  context.font = '800 58px "Barlow Condensed", sans-serif'
  context.fillText('WHO DIES FIRST?', 74, 1840)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Could not render result card')), 'image/png')
  })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `incident-${outcome.incident}.png`
  link.href = objectUrl
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

export default function App() {
  const incident = useMemo(makeIncident, [])
  const initialChallenge = useMemo(() => decodeChallenge(new URLSearchParams(window.location.search).get('challenge')), [])
  const [screen, setScreen] = useState<Screen>(initialChallenge ? 'quiz' : 'home')
  const [language, setLanguage] = useState<Language>(() => initialChallenge?.language || (localStorage.getItem('wdf-language') === 'zh' ? 'zh' : 'en'))
  const [muted, setMuted] = useState(false)
  const [challenge] = useState<Challenge | null>(initialChallenge)
  const [creator, setCreator] = useState<Challenge | null>(null)
  const [inviteLink, setInviteLink] = useState('')
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [copied, setCopied] = useState(false)
  const [downloadState, setDownloadState] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const t = copy[language]

  useEffect(() => {
    document.body.dataset.screen = screen
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [screen])

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
    document.title = language === 'zh' ? '谁会先死？— 多元宇宙生存测试' : 'Who Dies First? — A Multiverse Survival Test'
    localStorage.setItem('wdf-language', language)
  }, [language])

  function beep() {
    if (muted) return
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const audio = new AudioContextClass()
    const oscillator = audio.createOscillator()
    const gain = audio.createGain()
    oscillator.type = 'square'
    oscillator.frequency.value = 118
    gain.gain.setValueAtTime(0.035, audio.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.12)
    oscillator.connect(gain).connect(audio.destination)
    oscillator.start()
    oscillator.stop(audio.currentTime + 0.12)
  }

  async function calculateOutcome(first: Challenge, second: Challenge) {
    setScreen('loading')
    const seed = hashText(`${first.name}${second.name}${first.answers.join('')}${second.answers.join('')}`)
    const firstId = characterIds[seed % characterIds.length]
    let secondId = characterIds[(seed * 7 + 3) % characterIds.length]
    if (secondId === firstId) secondId = characterIds[(characterIds.indexOf(firstId) + 1) % characterIds.length]
    let characters = fallbackCharacters
    try {
      const response = await fetch(`https://rickandmortyapi.com/api/character/${firstId},${secondId}`)
      if (!response.ok) throw new Error('API unavailable')
      const data = await response.json() as Character[] | Character
      characters = Array.isArray(data) ? data : [data, fallbackCharacters[1]]
    } catch {
      characters = fallbackCharacters
    }

    const weights = [2, 4, 3, 5, 2, 4]
    const score = (answers: number[]) => answers.reduce((sum, answer, index) => sum + (answer ? weights[index] : 6 - weights[index]), 0)
    const firstScore = score(first.answers)
    const secondScore = score(second.answers)
    const firstWins = firstScore === secondScore ? seed % 2 === 0 : firstScore > secondScore
    const sameAnswers = first.answers.filter((answer, index) => answer === second.answers[index]).length
    const destination = (firstWins ? characters[0] : characters[1]).location?.name || 'Earth (C-137)'
    const minutes = String((seed % 43) + 3).padStart(2, '0')
    const seconds = String((Math.floor(seed / 17) % 60)).padStart(2, '0')
    const result: Outcome = {
      winnerName: firstWins ? first.name : second.name,
      loserName: firstWins ? second.name : first.name,
      winnerCharacter: firstWins ? characters[0] : characters[1],
      loserCharacter: firstWins ? characters[1] : characters[0],
      destination,
      survivalTime: `${minutes}:${seconds}`,
      chaosMatch: 52 + sameAnswers * 7,
      incident: first.incident,
    }
    window.setTimeout(() => {
      setOutcome(result)
      setScreen('result')
    }, 1700)
  }

  function completeQuiz(name: string, answers: number[]) {
    beep()
    const entry: Challenge = { name, answers, incident: challenge?.incident || incident, language }
    if (challenge) {
      void calculateOutcome(challenge, entry)
      return
    }
    setCreator(entry)
    const encoded = encodeChallenge(entry)
    const link = `${window.location.origin}${window.location.pathname}?challenge=${encoded}`
    setInviteLink(link)
    setScreen('invite')
  }

  async function copyText(value: string) {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
    beep()
  }

  function reset() {
    window.history.replaceState({}, '', window.location.pathname)
    setOutcome(null)
    setCreator(null)
    setInviteLink('')
    setDownloadState('idle')
    setScreen('home')
  }

  async function handleDownload() {
    if (!outcome) return
    setDownloadState('working')
    try {
      await downloadResultCard(outcome, language, t)
      setDownloadState('done')
      window.setTimeout(() => setDownloadState('idle'), 2200)
    } catch {
      setDownloadState('error')
    }
  }

  const resultText = outcome ? (language === 'zh'
    ? `${outcome.winnerName} 活着回来了，${outcome.loserName} 没能回来。存活时间：${outcome.survivalTime}，混乱匹配度：${outcome.chaosMatch}%。#WhoDiesFirst`
    : `${outcome.winnerName} made it home. ${outcome.loserName} did not. Survival time: ${outcome.survivalTime}. Chaos match: ${outcome.chaosMatch}%. #WhoDiesFirst`) : ''

  return (
    <div className="app-shell" data-language={language}>
      <Header muted={muted} language={language} t={t} onToggleLanguage={() => setLanguage((value) => value === 'en' ? 'zh' : 'en')} onToggleAudio={() => setMuted((value) => !value)} onHome={reset} incident={challenge?.incident || incident} />
      <SideRail incident={challenge?.incident || incident} t={t} outcome={screen === 'result' ? t.final : t.unknown} />
      {screen === 'home' && <Home t={t} onStart={() => { beep(); setScreen('quiz') }} />}
      {screen === 'quiz' && <Quiz challenger={challenge} language={language} t={t} onComplete={completeQuiz} />}
      {screen === 'invite' && creator && <Invite name={creator.name} link={inviteLink} copied={copied} t={t} onCopy={() => void copyText(inviteLink)} onDemo={() => void calculateOutcome(creator, { name: 'Morty', answers: creator.answers.map((answer, index) => index % 2 ? answer : 1 - answer), incident: creator.incident, language })} />}
      {screen === 'loading' && <Loading t={t} />}
      {screen === 'result' && outcome && <Result outcome={outcome} copied={copied} downloadState={downloadState} t={t} onReset={reset} onCopy={() => void copyText(resultText)} onDownload={() => void handleDownload()} />}
    </div>
  )
}
