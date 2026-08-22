import { useEffect, useMemo, useState, type FormEvent } from 'react'

type Screen = 'home' | 'quiz' | 'invite' | 'loading' | 'result'
type Language = 'en' | 'zh'

type Challenge = {
  name: string
  answers: number[]
  incident: string
  language?: Language
  protagonistId?: number
  questionIds?: number[]
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
    { prompt: 'Interdimensional Cable finds a universe where you are famous.', left: 'Watch one episode and move on.', right: 'Abandon this life immediately.' },
    { prompt: 'The Cronenberg cure has one tiny warning: “may add tentacles.”', left: 'Read the rest of the label.', right: 'Tentacles sound useful. Inject it.' },
    { prompt: 'Mr. Poopybutthole says your friend is the parasite.', left: 'Check for a bad memory first.', right: 'Nobody questions Mr. Poopybutthole.' },
    { prompt: 'You can erase one catastrophic adventure from history.', left: 'Erase the one that hurt people.', right: 'Erase the one where I looked stupid.' },
    { prompt: 'Rick leaves you alone with a button labeled “DO NOT PRESS.”', left: 'Put a chair over it and leave.', right: 'Labels are just dares with punctuation.' },
    { prompt: 'A tiny civilization lives inside your car battery.', left: 'Tell them the truth and set them free.', right: 'Free electricity is free electricity.' },
    { prompt: 'You meet a version of yourself who made every better choice.', left: 'Ask for advice.', right: 'There can only be one of us.' },
    { prompt: 'The Devil offers you cursed sneakers that make you irresistible.', left: 'Check the curse before trying them on.', right: 'Looking this good is worth one haunting.' },
    { prompt: 'Birdperson invites you to a wedding that Rick says is “probably a trap.”', left: 'Go, but park near the exit.', right: 'Skip it and send a very convincing gift card.' },
    { prompt: 'You wake up in a simulation inside another simulation.', left: 'Look for repeatable glitches.', right: 'Act normal until somebody else panics.' },
    { prompt: 'A facehugger-like alien calls you “Mom.”', left: 'Call Space Animal Control.', right: 'I have always wanted a weird child.' },
    { prompt: 'The purge starts in five minutes. Your friend forgot a weapon.', left: 'Give them my spare.', right: 'They can carry the snacks.' },
    { prompt: 'Rick offers to clone you, but the clone keeps your browser history.', left: 'Absolutely not.', right: 'Delete one folder and start the machine.' },
    { prompt: 'A portal can take you home or to a universe with free pizza forever.', left: 'Home. I know how portals lie.', right: 'Pepperoni dimension, here I come.' },
  ],
  zh: [
    { prompt: '你家马桶上突然开了个传送门。第一反应？', left: '先裹条毛巾。社死也是死。', right: '抄起传送枪。裤子哪有冒险重要。' },
    { prompt: '一个寄生虫拥有你和死党的全部共同回忆。怎么验货？', left: '问一件只有你俩知道的黑历史。', right: '先崩了再说。真朋友会理解的。' },
    { prompt: 'Rick 指着一管发光液体说：“喝不死，大概。”', left: '让 Rick 先干为敬。', right: '我喝一半，剩下一半留作遗言。' },
    { prompt: '飞船要炸了，逃生舱只有一个座。你和朋友都在。', left: '一起修。要死也死得有团队精神。', right: '舱门一关，友情到站。' },
    { prompt: 'Meeseeks 说能帮你解决人生问题。你许什么愿？', left: '只给一个具体小任务，别作死。', right: '让我永远快乐。应该不会出事吧。' },
    { prompt: 'Rick 委员会说：报一个名字，就放你走。', left: '闭嘴。朋友可以坑，不能卖。', right: '把朋友全名、生日、住址都交代了。' },
    { prompt: '跨维度电视播到一个你已经成名的宇宙。你会？', left: '看一集爽完就关。做人要知足。', right: '立刻抛弃本宇宙，过去顶替自己。' },
    { prompt: '克罗南伯格解药写着：“副作用可能长触手。”', left: '先把说明书剩下半页看完。', right: '触手听着就实用，直接扎。' },
    { prompt: '屎屁屁先生说：你朋友才是寄生虫。信谁？', left: '先找一段不快乐的共同回忆。', right: '屎屁屁先生还能骗我？直接动手。' },
    { prompt: '你能从历史中删除一次灾难级冒险。删哪次？', left: '删掉伤害无辜路人的那次。', right: '删掉我出丑的那次，必须的。' },
    { prompt: 'Rick 留你看着一个写着“千万别按”的按钮。', left: '拿椅子压住按钮，离它远点。', right: '都写这么大了，不按多不给面子。' },
    { prompt: '你的汽车电池里住着一整个微型文明。', left: '告诉他们真相，然后放人。', right: '他们发电，我开车，双赢。大概。' },
    { prompt: '你遇见了一个每次都选对的平行宇宙自己。', left: '赶紧取经，能抄一点是一点。', right: '世界上不需要两个这么优秀的我。' },
    { prompt: '恶魔送你一双受诅咒的鞋，穿上人见人爱。', left: '先问清楚到底怎么个诅咒法。', right: '帅都帅了，闹点鬼怎么了。' },
    { prompt: '鸟人请你参加婚礼，Rick 说：“八成是陷阱。”', left: '去，但车头必须朝着出口。', right: '不去，随个红包证明友情还在。' },
    { prompt: '你在模拟世界里醒来，发现外面还是一层模拟。', left: '找能稳定复现的系统漏洞。', right: '先装正常，等别人第一个崩溃。' },
    { prompt: '一只抱脸虫一样的外星生物开口叫你“妈”。', left: '立刻联系银河系流浪动物中心。', right: '来都来了，先养两天看看。' },
    { prompt: '净化之夜五分钟后开始，朋友没带武器。', left: '把备用武器给 TA，不能真不管。', right: '武器没有，零食袋可以帮我拿。' },
    { prompt: 'Rick 能克隆你，但克隆体会继承浏览器记录。', left: '这个险不能冒，坚决不克隆。', right: '等我删个文件夹，马上开机。' },
    { prompt: '传送门一边通往家，一边通往披萨永久免费的宇宙。', left: '回家。免费这两个字最贵。', right: '还想什么，意大利辣香肠宇宙走起。' },
  ],
} as const

const QUESTION_COUNT = 10
const protagonistOptions = [
  { id: 1, name: 'Rick' },
  { id: 2, name: 'Morty' },
  { id: 3, name: 'Summer' },
  { id: 4, name: 'Beth' },
  { id: 5, name: 'Jerry' },
] as const

const copy = {
  en: {
    terminal: 'WDF-7 // EVIDENCE TERMINAL', experiment: 'MULTIVERSE SOCIAL EXPERIMENT', incident: 'INCIDENT', audio: 'AUDIO', on: 'ON', off: 'OFF',
    homeAria: 'Go to start', audioOnAria: 'Turn audio on', audioOffAria: 'Turn audio off', languageAria: 'Switch to Chinese',
    log: 'LOG', flight: 'FLT', section: 'SEC', outcome: 'OUTCOME', unknown: 'UNKNOWN', final: 'FINAL',
    heroTitle: ['YOU BOTH ENTER.', 'ONLY ONE RETURNS.'], heroBody: ['A two-player Rick and Morty survival test.', 'Choose a hero, answer ten terrible choices, then send them to a friend.', 'The multiverse decides who dies first.'],
    openPortal: 'START THE TEST', howItWorks: 'HOW IT WORKS', noSignup: 'NO SIGN-UP', twoMinutes: '2 PLAYERS', oneSurvivor: 'ONE SURVIVOR',
    stability: 'DIMENSIONAL STABILITY', unstable: 'UNSTABLE',
    process: [
      { title: ['ANSWER TEN', 'BAD DECISIONS'], body: 'Choose a hero and pick what you would actually do.' },
      { title: ['SEND IT', 'TO A FRIEND'], body: 'They answer the exact same ten questions.' },
      { title: ['SEE WHO', 'DIES FIRST'], body: 'One result. Permanent bragging rights.' },
    ],
    openedPortal: 'OPENED A PORTAL.', identify: 'CHOOSE YOUR HERO.', yourName: 'YOUR NAME', enterName: 'ENTER NAME', chooseHero: 'CHOOSE YOUR HERO', question: 'Question', decision: 'DECISION', unlock: 'CHOOSE A HERO TO UNLOCK THE CONTROLS.', finishTitle: 'TEN BAD DECISIONS. ONE LAST DETAIL.', finishBody: 'Sign the incident report before we open the portal.', finishAction: 'CONTINUE TO THE VERDICT',
    transmission: 'TRANSMISSION READY // SUBJECT 01:', inviteTitle: ['THE PORTAL NEEDS', 'A SECOND VICTIM.'], inviteBody: 'Send this incident to a friend for the real two-player verdict—or reveal a result right now. They face the same ten decisions.', copied: 'COPIED', copyLink: 'COPY LINK', portalCopied: 'PORTAL COPIED', copyChallenge: 'COPY CHALLENGE', demo: 'REVEAL RESULT NOW', awaiting: ['AWAITING', 'SUBJECT 02'],
    colliding: 'COLLIDING DECISIONS', calculating: ['CALCULATING WHO', 'GETS LEFT BEHIND…'], portalCalibrating: 'Portal calibrating',
    madeIt: 'MADE IT HOME.', didNot: 'DID NOT.', survivor: 'SURVIVOR', casualty: 'CASUALTY', grabbed: 'You grabbed the portal gun.', trusted: 'trusted you.', mistake: 'That was their first mistake.',
    destination: 'DESTINATION', statusLocked: 'STATUS // LOCKED', survivalTime: 'SURVIVAL TIME', minutesSeconds: 'MINUTES // SECONDS', chaosMatch: 'CHAOS MATCH', alignment: 'MULTIVERSE ALIGNMENT',
    challengeAnother: 'CHALLENGE ANOTHER FRIEND', resultCopied: 'RESULT COPIED', copyResult: 'COPY RESULT', rendering: 'RENDERING CARD', downloaded: 'CARD DOWNLOADED', retryDownload: 'TRY DOWNLOAD AGAIN', downloadCard: 'DOWNLOAD CARD', runAgain: 'RUN IT AGAIN',
  },
  zh: {
    terminal: 'WDF-7 // 送命记录终端', experiment: '多元宇宙友情质检', incident: '事故', audio: '音效', on: '开', off: '关',
    homeAria: '返回首页', audioOnAria: '开启音效', audioOffAria: '关闭音效', languageAria: 'Switch to English',
    log: '记录', flight: '宇宙', section: '题目', outcome: '结局', unknown: '待开奖', final: '已判',
    heroTitle: ['两个人进传送门。', '总得有一个先寄。'], heroBody: ['一个双人《瑞克和莫蒂》生存测试。', '选主角、答 10 道送命题，再甩给朋友。', '最后看你俩谁先领盒饭。'],
    openPortal: '开始送命测试', howItWorks: '到底怎么玩', noSignup: '不用注册', twoMinutes: '两个人玩', oneSurvivor: '大概活一个',
    stability: '维度稳定性', unstable: '随时要炸',
    process: [
      { title: ['选主角，再答', '10 道送命题'], body: '别装，选你真会干的。' },
      { title: ['把挑战', '甩给朋友'], body: '让 TA 答同一套题。' },
      { title: ['看谁先', '领盒饭'], body: '输的人负责被笑一整年。' },
    ],
    openedPortal: '给你挖了个传送门坑。', identify: '先选个主角替你挡刀。', yourName: '最后，怎么称呼你', enterName: '例如：小雷', chooseHero: '选一个主角替你冒险', question: '送命题', decision: '送命题', unlock: '先选个主角，不然这题没人替你背锅。', finishTitle: '10 道送命题答完了。', finishBody: '最后留个名字，再生成挑战链接或公布结局。', finishAction: '签字，开启传送门',
    transmission: '传送门已就绪 // 一号倒霉蛋：', inviteTitle: ['还差一个', '冤种朋友。'], inviteBody: '把链接甩给朋友，等 TA 答完同一套 10 道题；不想等，也可以现在直接看结果。', copied: '到手了', copyLink: '复制链接', portalCopied: '链接到手', copyChallenge: '复制挑战链接', demo: '直接看结果', awaiting: ['等待二号', '倒霉蛋'],
    colliding: '正在对比你俩的人性下限', calculating: ['多元宇宙正在决定', '谁先领盒饭……'], portalCalibrating: '传送门正在憋大招',
    madeIt: '苟回来了。', didNot: '先寄了。', survivor: '命硬', casualty: '已寄', grabbed: '你抢到了传送枪。', trusted: '居然信了你。', mistake: '这就是 TA 本局最大的失误。',
    destination: '出事地点', statusLocked: '结局 // 已锁死', survivalTime: '苟活时间', minutesSeconds: '分钟 // 秒', chaosMatch: '塑料友情指数', alignment: '友情越高 // 死得越齐',
    challengeAnother: '再坑一个朋友', resultCopied: '判决已复制', copyResult: '复制判决', rendering: '正在做死亡证明', downloaded: '死亡证明已保存', retryDownload: '再存一次', downloadCard: '保存死亡证明', runAgain: '重新送一次',
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

function pickQuestionIds() {
  const ids = questionSets.en.map((_, index) => index)
  for (let index = ids.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]]
  }
  return ids.slice(0, QUESTION_COUNT)
}

function detectBrowserLanguage(): Language {
  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language]
  return browserLanguages.some((value) => value.toLowerCase().startsWith('zh')) ? 'zh' : 'en'
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
    if (!parsed.name || !Array.isArray(parsed.answers) || parsed.answers.length < 6 || parsed.answers.length > QUESTION_COUNT) return null
    if (parsed.language && parsed.language !== 'en' && parsed.language !== 'zh') return null
    if (parsed.questionIds && (parsed.questionIds.length !== parsed.answers.length || new Set(parsed.questionIds).size !== parsed.questionIds.length || parsed.questionIds.some((id) => !Number.isInteger(id) || id < 0 || id >= questionSets.en.length))) return null
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
        <dt>{t.section}</dt><dd>{QUESTION_COUNT}/{QUESTION_COUNT}</dd>
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

function Quiz({ challenger, onComplete, language, t }: { challenger: Challenge | null; onComplete: (name: string, answers: number[], protagonistId: number, questionIds: number[]) => void; language: Language; t: Copy }) {
  const [name, setName] = useState('')
  const [protagonistId, setProtagonistId] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const step = answers.length
  const questionIds = useMemo(() => challenger?.questionIds || (challenger ? Array.from({ length: QUESTION_COUNT }, (_, index) => index) : pickQuestionIds()), [challenger])
  const questions = questionIds.map((id) => questionSets[language][id])
  const complete = step === questions.length

  function choose(answer: number) {
    if (!protagonistId) return
    setAnswers((currentAnswers) => [...currentAnswers, answer])
  }

  function finishQuiz(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim() || !protagonistId) return
    onComplete(name.trim(), answers, protagonistId, questionIds)
  }

  return (
    <main className="quiz-screen">
      <section className="quiz-panel">
        <div className="quiz-intro">
          <span>{challenger ? `${challenger.name.toUpperCase()} ${t.openedPortal}` : t.identify}</span>
        </div>
        <fieldset className="protagonist-picker">
          <legend>{t.chooseHero}</legend>
          <div>
            {protagonistOptions.map((hero) => (
              <button type="button" key={hero.id} className={protagonistId === hero.id ? 'selected' : ''} onClick={() => setProtagonistId(hero.id)} aria-pressed={protagonistId === hero.id}>
                <img src={`https://rickandmortyapi.com/api/character/avatar/${hero.id}.jpeg`} alt="" />
                <span>{hero.name}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <div className="progress-track" style={{ gridTemplateColumns: `repeat(${questions.length}, 1fr)` }} aria-label={`${t.question} ${Math.min(step + 1, questions.length)} / ${questions.length}`}>
          {questions.map((_, index) => <span key={index} className={index < step ? 'done' : index === step ? 'active' : ''}>{String(index + 1).padStart(2, '0')}</span>)}
        </div>
        {!complete && (
          <div className="question-wrap" key={step}>
            <p className="question-number">{t.decision} {String(step + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}</p>
            <h1>{questions[step].prompt}</h1>
            <div className="answer-grid">
              <button disabled={!protagonistId} onClick={() => choose(0)}><small>A</small><span>{questions[step].left}</span><IconArrow /></button>
              <button disabled={!protagonistId} onClick={() => choose(1)}><small>B</small><span>{questions[step].right}</span><IconArrow /></button>
            </div>
            {!protagonistId && <p className="name-warning">{t.unlock}</p>}
          </div>
        )}
        {complete && (
          <form className="quiz-finish" onSubmit={finishQuiz}>
            <p className="question-number">{t.final}</p>
            <h1>{t.finishTitle}</h1>
            <p>{t.finishBody}</p>
            <label htmlFor="player-name">{t.yourName}</label>
            <input id="player-name" value={name} onChange={(event) => setName(event.target.value.slice(0, 24))} placeholder={t.enterName} autoFocus autoComplete="off" />
            <button className="primary-button" type="submit" disabled={!name.trim()}>{t.finishAction} <IconArrow /></button>
          </form>
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
  context.fillText(`${outcome.loserName} ${t.trusted}`, 74, 1740)
  context.fillText(t.mistake, 74, 1790)
  context.font = '800 58px "Barlow Condensed", sans-serif'
  context.fillText('WHO DIES FIRST?', 74, 1860)

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
  const [language, setLanguage] = useState<Language>(() => {
    if (initialChallenge?.language) return initialChallenge.language
    const savedPreference = localStorage.getItem('wdf-language-preference')
    if (savedPreference === 'zh' || savedPreference === 'en') return savedPreference
    return detectBrowserLanguage()
  })
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
  }, [language])

  function toggleLanguage() {
    setLanguage((currentLanguage) => {
      const nextLanguage = currentLanguage === 'en' ? 'zh' : 'en'
      localStorage.setItem('wdf-language-preference', nextLanguage)
      return nextLanguage
    })
  }

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
    const firstId = first.protagonistId || characterIds[seed % characterIds.length]
    const secondId = second.protagonistId || characterIds[(seed * 7 + 3) % characterIds.length]
    let characters = fallbackCharacters
    try {
      const response = await fetch(`https://rickandmortyapi.com/api/character/${firstId},${secondId}`)
      if (!response.ok) throw new Error('API unavailable')
      const data = await response.json() as Character[] | Character
      characters = Array.isArray(data) ? data : [data, fallbackCharacters[1]]
    } catch {
      characters = fallbackCharacters
    }
    const firstCharacter = characters.find((character) => character.id === firstId) || fallbackCharacters[0]
    const secondCharacter = characters.find((character) => character.id === secondId) || fallbackCharacters[1]

    const weights = [2, 4, 3, 5, 2, 4, 3, 5, 4, 2]
    const score = (answers: number[]) => answers.reduce((sum, answer, index) => sum + (answer ? weights[index] : 6 - weights[index]), 0)
    const firstScore = score(first.answers)
    const secondScore = score(second.answers)
    const firstWins = firstScore === secondScore ? seed % 2 === 0 : firstScore > secondScore
    const sameAnswers = first.answers.filter((answer, index) => answer === second.answers[index]).length
    const destination = (firstWins ? firstCharacter : secondCharacter).location?.name || 'Earth (C-137)'
    const minutes = String((seed % 43) + 3).padStart(2, '0')
    const seconds = String((Math.floor(seed / 17) % 60)).padStart(2, '0')
    const result: Outcome = {
      winnerName: firstWins ? first.name : second.name,
      loserName: firstWins ? second.name : first.name,
      winnerCharacter: firstWins ? firstCharacter : secondCharacter,
      loserCharacter: firstWins ? secondCharacter : firstCharacter,
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

  function completeQuiz(name: string, answers: number[], protagonistId: number, questionIds: number[]) {
    beep()
    const entry: Challenge = { name, answers, incident: challenge?.incident || incident, language, protagonistId, questionIds }
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
    ? `${outcome.winnerName} 苟回来了，${outcome.loserName} 先寄了。苟活 ${outcome.survivalTime}，塑料友情指数 ${outcome.chaosMatch}%。来测测你和朋友谁先死：#WhoDiesFirst`
    : `${outcome.winnerName} made it home. ${outcome.loserName} did not. Survival time: ${outcome.survivalTime}. Chaos match: ${outcome.chaosMatch}%. #WhoDiesFirst`) : ''

  return (
    <div className="app-shell" data-language={language}>
      <Header muted={muted} language={language} t={t} onToggleLanguage={toggleLanguage} onToggleAudio={() => setMuted((value) => !value)} onHome={reset} incident={challenge?.incident || incident} />
      <SideRail incident={challenge?.incident || incident} t={t} outcome={screen === 'result' ? t.final : t.unknown} />
      {screen === 'home' && <Home t={t} onStart={() => { beep(); setScreen('quiz') }} />}
      {screen === 'quiz' && <Quiz challenger={challenge} language={language} t={t} onComplete={completeQuiz} />}
      {screen === 'invite' && creator && <Invite name={creator.name} link={inviteLink} copied={copied} t={t} onCopy={() => void copyText(inviteLink)} onDemo={() => void calculateOutcome(creator, { name: 'Morty', answers: creator.answers.map((answer, index) => index % 2 ? answer : 1 - answer), incident: creator.incident, language, protagonistId: creator.protagonistId === 2 ? 1 : 2, questionIds: creator.questionIds })} />}
      {screen === 'loading' && <Loading t={t} />}
      {screen === 'result' && outcome && <Result outcome={outcome} copied={copied} downloadState={downloadState} t={t} onReset={reset} onCopy={() => void copyText(resultText)} onDownload={() => void handleDownload()} />}
    </div>
  )
}
