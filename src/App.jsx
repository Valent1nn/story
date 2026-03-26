import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useScroll } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Customizer from './components/Customizer'
import translations from './translations'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

/* ── Framer Motion animation variants ── */
const ease = [0.25, 0.1, 0.25, 1]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.8, ease, delay },
})

const blurUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30, filter: 'blur(10px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.9, ease, delay },
})

const scaleUp = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.92 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.9, ease, delay },
})

const slideRight = (delay = 0) => ({
  initial: { opacity: 0, x: -50 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease, delay },
})

const slideLeft = (delay = 0) => ({
  initial: { opacity: 0, x: 50 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease, delay },
})

const heroContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
}

const heroChild = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease } },
}

/* Pre-computed particle burst directions (module-level, no impure calls in render) */
const SPARKLE_PARTICLES = Array.from({ length: 6 }, (_, i) => {
  const angle = (i / 6) * Math.PI * 2
  const dist = 18 + ((i * 7 + 3) % 12)
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }
})

/* ── Sparkle / decorative star component ── */
/* Stars gently fade out and back in periodically, slow idle rotation */
function Sparkle({ size = 20, top, left, right, bottom }) {
  const [isHovered, setIsHovered] = useState(false)
  const [dimmed, setDimmed] = useState(false)

  useEffect(() => {
    // Gentle fade out/in cycle (random 6–14s intervals)
    const schedule = () => {
      const interval = 6000 + Math.random() * 8000
      return setTimeout(() => {
        setDimmed(true)
        // Fade back in after 1.5–2.5s
        setTimeout(() => setDimmed(false), 1500 + Math.random() * 1000)
        timerId = schedule()
      }, interval)
    }
    let timerId = schedule()
    return () => clearTimeout(timerId)
  }, [])

  return (
    <motion.div
      className="sparkle-wrapper"
      style={{ position: 'absolute', top, left, right, bottom, pointerEvents: 'auto', cursor: 'pointer', width: size + 16, height: size + 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Particle burst on hover */}
      <AnimatePresence>
        {isHovered && SPARKLE_PARTICLES.map((p, i) => (
            <motion.span
              key={i}
              className="sparkle-particle"
              initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                scale: 0,
                x: p.x,
                y: p.y,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
        ))}
      </AnimatePresence>

      {/* Glow ring on hover */}
      <motion.div
        className="sparkle-glow"
        animate={isHovered ? { scale: 2.2, opacity: 0.5 } : { scale: 1, opacity: 0 }}
        transition={{ duration: 0.4 }}
      />

      {/* Main star — stays mounted, smoothly fades */}
      <motion.svg
        className="sparkle"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        animate={dimmed ? { opacity: 0.08, scale: 0.5 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        whileHover={{ scale: 1.5, rotate: 20 }}
      >
        <path
          d="M12 2L13.09 8.26L18 4L14.74 9.91L21 12L14.74 14.09L18 20L13.09 15.74L12 22L10.91 15.74L6 20L9.26 14.09L3 12L9.26 9.91L6 4L10.91 8.26L12 2Z"
          fill="var(--color-accent)"
          fillOpacity="0.55"
          stroke="var(--color-accent)"
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />
      </motion.svg>
    </motion.div>
  )
}

/* ── Magnetic filings grid — rotates toward cursor ── */
const FILING_ROWS = 12
const FILING_COLS = 20

function MagneticFilings({ lang }) {
  const containerRef = useRef(null)
  const filingsRef = useRef([])
  const rafRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMove = (e) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          const { x: mx, y: my } = mouseRef.current
          filingsRef.current.forEach((el) => {
            if (!el) return
            const fx = parseFloat(el.dataset.fx)
            const fy = parseFloat(el.dataset.fy)
            const angle = Math.atan2(my - fy, mx - fx) * (180 / Math.PI)
            const dist = Math.hypot(mx - fx, my - fy)
            const scale = Math.min(1.5, 1 + 40 / (dist + 60))
            el.style.transform = `rotate(${angle}deg) scaleX(${scale})`
          })
          rafRef.current = null
        })
      }
    }

    const handleLeave = () => {
      filingsRef.current.forEach((el) => {
        if (!el) return
        el.style.transform = 'rotate(0deg) scaleX(1)'
      })
    }

    container.addEventListener('mousemove', handleMove)
    container.addEventListener('mouseleave', handleLeave)
    return () => {
      container.removeEventListener('mousemove', handleMove)
      container.removeEventListener('mouseleave', handleLeave)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Pre-compute grid positions
  const filings = useMemo(() => {
    const items = []
    for (let r = 0; r < FILING_ROWS; r++) {
      for (let c = 0; c < FILING_COLS; c++) {
        items.push({ r, c, id: r * FILING_COLS + c })
      }
    }
    return items
  }, [])

  return (
    <div className="magnetic-filings" ref={containerRef}>
      {filings.map(({ r, c, id }) => {
        const xPct = ((c + 0.5) / FILING_COLS) * 100
        const yPct = ((r + 0.5) / FILING_ROWS) * 100
        return (
          <span
            key={id}
            className="filing"
            ref={(el) => {
              filingsRef.current[id] = el
              if (el) {
                el.dataset.fx = `${xPct}%`
                // store pixel equivalents once layout is done
                requestAnimationFrame(() => {
                  const rect = containerRef.current?.getBoundingClientRect()
                  if (rect) {
                    el.dataset.fx = (xPct / 100) * rect.width
                    el.dataset.fy = (yPct / 100) * rect.height
                  }
                })
              }
            }}
            style={{ left: `${xPct}%`, top: `${yPct}%` }}
          />
        )
      })}
      <p className="magnetic-filings-hint">{translations[lang].filingsHint}</p>
    </div>
  )
}

/* ── Scroll Text Lines — editorial horizontal scrolling text ── */
const SCROLL_LINE_SPEEDS = [
  { speed: 1, direction: 1 },
  { speed: 0.7, direction: -1 },
  { speed: 1.3, direction: 1 },
]

function ScrollTextLines({ scrollRef, lang }) {
  const { scrollYProgress } = useScroll({ target: scrollRef, offset: ['start end', 'end start'] })
  const t = translations[lang]

  return (
    <div className="scroll-text-bg">
      {SCROLL_LINE_SPEEDS.map((cfg, i) => {
        const line = { text: t.scrollLines[i], ...cfg }
        const baseOffset = cfg.direction * cfg.speed * 600
        return (
          <ScrollTextLine key={i} line={line} scrollYProgress={scrollYProgress} baseOffset={baseOffset} index={i} />
        )
      })}
    </div>
  )
}

function ScrollTextLine({ line, scrollYProgress, baseOffset, index }) {
  const x = useTransform(scrollYProgress, [0, 1], [baseOffset, -baseOffset])
  return (
    <motion.div
      className={`scroll-text-line ${index === 1 ? 'scroll-text-line-accent' : ''}`}
      style={{ x }}
    >
      <span>{line.text}</span>
      <span>{line.text}</span>
    </motion.div>
  )
}

/* ── Typewriter — sequential type / delete / retype ── */

function TypewriterText({ lang }) {
  const phrases = translations[lang].typewriterPhrases
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const phrase = phrases[phraseIdx]
    let timeout

    if (!isDeleting && charIdx < phrase.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), 65 + Math.floor(Math.random() * 40))
    } else if (!isDeleting && charIdx === phrase.length) {
      timeout = setTimeout(() => setIsDeleting(true), 5500)
    } else if (isDeleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), 80)
    } else if (isDeleting && charIdx === 0) {
      timeout = setTimeout(() => {
        setIsDeleting(false)
        setPhraseIdx((p) => (p + 1) % phrases.length)
      }, 400)
    }

    return () => clearTimeout(timeout)
  }, [charIdx, isDeleting, phraseIdx, phrases])

  const displayed = phrases[phraseIdx].slice(0, charIdx)

  return (
    <div className="typewriter-container">
      <span className="typewriter-text">
        {displayed}
        <span className="typewriter-cursor">|</span>
      </span>
    </div>
  )
}

/* ── Animated divider line ── */
function SectionDivider() {
  return (
    <motion.div
      className="section-divider"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    />
  )
}

/* ── Product photos carousel ── */
const productPhotos = [
  { src: 'https://images.unsplash.com/photo-1586075010882-3a0b4f7462a0?w=800&h=600&fit=crop' },
  { src: 'https://images.unsplash.com/photo-1603974372039-adc49044b6bd?w=800&h=600&fit=crop' },
  { src: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop' },
  { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop' },
]

/* Slide direction variants for carousel */
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 400 : -400,
    opacity: 0,
    scale: 0.92,
    filter: 'blur(6px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction) => ({
    x: direction > 0 ? -400 : 400,
    opacity: 0,
    scale: 0.92,
    filter: 'blur(6px)',
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
}

/* ── Scroll-driven text fill — characters go from faded to solid as user scrolls ── */
function ScrollFillText({ text, em, className, trigger, start = 'top top', end = 'bottom bottom' }) {
  const containerRef = useRef(null)

  // Build an array of { char, isEm } segments
  const segments = useMemo(() => {
    const result = []
    let remaining = text
    if (em) {
      const idx = remaining.indexOf(em)
      if (idx !== -1) {
        for (const ch of remaining.slice(0, idx)) result.push({ char: ch, isEm: false })
        for (const ch of em) result.push({ char: ch, isEm: true })
        for (const ch of remaining.slice(idx + em.length)) result.push({ char: ch, isEm: false })
      } else {
        for (const ch of remaining) result.push({ char: ch, isEm: false })
      }
    } else {
      for (const ch of remaining) result.push({ char: ch, isEm: false })
    }
    return result
  }, [text, em])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const chars = container.querySelectorAll('.sfill-char')
    if (!chars.length) return

    const triggerEl = trigger?.current || container

    const ctx = gsap.context(() => {
      gsap.fromTo(chars,
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.06,
          ease: 'none',
          scrollTrigger: {
            trigger: triggerEl,
            start,
            end,
            scrub: 2,
          },
        }
      )
    })

    return () => ctx.revert()
  }, [segments, trigger, start, end])

  return (
    <span className={className} ref={containerRef}>
      {segments.map((s, i) =>
        s.char === '\n' ? <br key={i} /> :
        s.isEm ? (
          <em key={i}><span className="sfill-char">{s.char === ' ' ? '\u00A0' : s.char}</span></em>
        ) : (
          <span key={i} className="sfill-char">{s.char === ' ' ? '\u00A0' : s.char}</span>
        )
      )}
    </span>
  )
}

/* ── 3D tilt on hover for spec cards ── */
function TiltCard({ children, className, ...rest }) {
  const cardRef = useRef(null)
  const handleMove = (e) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    el.style.transform = `perspective(800px) rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg) scale(1.03) translateY(-4px)`
  }
  const handleLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = ''
  }
  return (
    <motion.div
      ref={cardRef}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const [navScrolled, setNavScrolled] = useState(false)
  const [[activePhoto, direction], setActivePhoto] = useState([0, 0])
  const [lang, setLang] = useState('ro')

  const heroRef = useRef(null)
  const heroContentRef = useRef(null)
  const progressRef = useRef(null)
  const statementRef = useRef(null)
  const closingRef = useRef(null)

  const paginate = useCallback((dir) => {
    setActivePhoto(([prev]) => [
      (prev + dir + productPhotos.length) % productPhotos.length,
      dir,
    ])
  }, [])

  const goTo = useCallback((i) => {
    setActivePhoto(([prev]) => [i, i > prev ? 1 : -1])
  }, [])

  /* Drag-to-swipe */
  const dragX = useMotionValue(0)
  const dragOpacity = useTransform(dragX, [-200, 0, 200], [0.5, 1, 0.5])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // -- Scroll progress bar --
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          if (progressRef.current) {
            progressRef.current.style.width = `${self.progress * 100}%`
          }
        },
      })

      // -- Nav frosted glass on scroll --
      ScrollTrigger.create({
        trigger: document.body,
        start: '100px top',
        onEnter: () => setNavScrolled(true),
        onLeaveBack: () => setNavScrolled(false),
      })

      // -- Hero: opacity fade on scroll (scrub-based, no position = no bounce) --
      if (heroContentRef.current) {
        gsap.to(heroContentRef.current, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: '60% top',
            scrub: true,
          },
        })
      }

      // -- Closing: pin the text while scroll-fill plays --
      if (closingRef.current) {
        ScrollTrigger.create({
          trigger: closingRef.current,
          start: 'top top',
          end: 'bottom bottom',
          pin: '.closing-pinned',
          pinSpacing: false,
        })
      }
    })

    return () => ctx.revert()
  }, [])

  const t = translations[lang]

  return (
    <>
      <div className="scroll-progress" ref={progressRef} />

      {/* ===== NAV ===== */}
      <nav className={`nav ${navScrolled ? 'scrolled' : ''}`}>
        <a href="#hero" className="nav-logo">UNFOLD</a>
        <div className="nav-links">
          <a href="#story">{t.navStory}</a>
          <a href="#gallery">{t.navGallery}</a>
          <a href="#customize">{t.navCustomize}</a>
          <a href="#contact" className="nav-cta">{t.navInquire}</a>
          <button
            className="lang-toggle"
            onClick={() => setLang(l => l === 'en' ? 'ro' : 'en')}
            aria-label="Switch language"
          >
            <span className={lang === 'ro' ? 'lang-active' : ''}>RO</span>
            <span className="lang-sep">|</span>
            <span className={lang === 'en' ? 'lang-active' : ''}>EN</span>
          </button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="section hero" id="hero" ref={heroRef}>
        <div className="hero-bg-pattern" />
        <Sparkle size={28} top="18%" left="12%" delay={0.8} />
        <Sparkle size={18} top="25%" right="15%" delay={1.1} />
        <Sparkle size={22} bottom="28%" left="8%" delay={1.4} />
        <Sparkle size={16} bottom="22%" right="10%" delay={1.6} />
        <Sparkle size={14} top="35%" left="25%" delay={0.5} />
        <Sparkle size={12} top="14%" right="28%" delay={1.8} />
        <Sparkle size={20} bottom="35%" right="22%" delay={0.9} />
        <motion.div
          className="hero-content"
          ref={heroContentRef}
          variants={heroContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.p className="hero-eyebrow" variants={heroChild}>{t.heroEyebrow}</motion.p>
          <motion.h1 className="hero-title shimmer-text" variants={heroChild}>
            {t.heroTitle1}<br />{t.heroTitleConnector}<em>{t.heroTitle2}</em>
          </motion.h1>
          <motion.p className="hero-sub" variants={heroChild}>
            {t.heroSub1}<br />{t.heroSub2}
          </motion.p>
          <motion.div className="hero-cta-row" variants={heroChild}>
            <motion.a
              href="#customize"
              className="btn-primary"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              {t.heroCta}
            </motion.a>
            <motion.a
              href="#story"
              className="btn-ghost"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              {t.heroLearn}
            </motion.a>
          </motion.div>
        </motion.div>
        <div className="hero-scroll-indicator">
          <div className="scroll-line" />
        </div>
      </section>

      {/* ===== STORY ===== */}
      <section className="section story-section" id="story">
        <div className="section-inner">
          <div className="story-grid">
            <div className="story-text">
              <motion.p {...slideRight()} className="section-eyebrow">{t.storyEyebrow}</motion.p>
              <motion.h2 {...slideRight(0.1)} className="section-title">
                {t.storyTitle1}<br />{t.storyTitle2}
              </motion.h2>
              <motion.p {...slideRight(0.2)} className="section-body">
                {t.storyBody}
              </motion.p>
            </div>
            <motion.div {...slideLeft(0.15)} className="story-visual">
              <div className="closed-box-illustration">
                <div className="box-body">
                  <div className="box-highlight" />
                  <div className="box-seam-line" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== THE MOMENT ===== */}
      <section className="section moment-section">
        <MagneticFilings lang={lang} />
        <Sparkle size={24} top="15%" right="18%" delay={0.3} />
        <Sparkle size={16} bottom="20%" left="14%" delay={0.6} />
        <Sparkle size={12} top="40%" left="5%" delay={0.9} />
        <div className="section-inner centered-text" style={{ position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
          <motion.p {...blurUp()} className="section-eyebrow">{t.momentEyebrow}</motion.p>
          <motion.h2 {...blurUp(0.1)} className="section-title-xl">
            {t.momentTitle1}<br />{t.momentTitle2} <em>{t.momentTitle3}</em>
          </motion.h2>
          <motion.p {...blurUp(0.2)} className="section-body">
            {t.momentBody}
          </motion.p>
        </div>
      </section>

      <SectionDivider />

      {/* ===== GALLERY (Elevated Photo Carousel) ===== */}
      <section className="section gallery-section" id="gallery">
        <Sparkle size={20} top="8%" left="6%" delay={0.2} />
        <Sparkle size={14} top="12%" right="8%" delay={0.5} />
        <Sparkle size={10} bottom="15%" left="20%" delay={0.7} />
        <Sparkle size={16} bottom="10%" right="25%" delay={0.4} />
        <div className="section-inner">
          <div className="centered-text">
            <motion.p {...fadeUp()} className="section-eyebrow">{t.galleryEyebrow}</motion.p>
            <motion.h2 {...fadeUp(0.1)} className="section-title">
              {t.galleryTitle1}<br />{t.galleryTitleConnector}<em>{t.galleryTitle2}</em>
            </motion.h2>
            <motion.p {...fadeUp(0.2)} className="section-body" style={{ marginBottom: '3rem' }}>
              {t.galleryBody}
            </motion.p>
          </div>

          <motion.div {...scaleUp(0.2)} className="carousel">
            {/* Counter */}
            <div className="carousel-counter">
              <AnimatePresence mode="wait">
                <motion.span
                  key={activePhoto}
                  className="carousel-counter-current"
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.3, ease }}
                >
                  {String(activePhoto + 1).padStart(2, '0')}
                </motion.span>
              </AnimatePresence>
              <span className="carousel-counter-sep">/</span>
              <span className="carousel-counter-total">{String(productPhotos.length).padStart(2, '0')}</span>
            </div>

            {/* Main viewport */}
            <div className="carousel-viewport">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.img
                  key={activePhoto}
                  src={productPhotos[activePhoto].src}
                  alt={t.galleryCaptions[activePhoto]}
                  className="carousel-image"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.12}
                  style={{ x: dragX, opacity: dragOpacity }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60) paginate(1)
                    else if (info.offset.x > 60) paginate(-1)
                  }}
                  draggable={false}
                />
              </AnimatePresence>

              {/* Gradient overlays for depth */}
              <div className="carousel-gradient carousel-gradient-left" />
              <div className="carousel-gradient carousel-gradient-right" />

              {/* Nav buttons */}
              <motion.button
                className="carousel-btn carousel-btn-prev"
                onClick={() => paginate(-1)}
                aria-label="Previous photo"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </motion.button>
              <motion.button
                className="carousel-btn carousel-btn-next"
                onClick={() => paginate(1)}
                aria-label="Next photo"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </motion.button>
            </div>

            {/* Caption with animated underline */}
            <div className="carousel-info">
              <AnimatePresence mode="wait">
                <motion.p
                  key={activePhoto}
                  className="carousel-caption"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease }}
                >
                  {t.galleryCaptions[activePhoto]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Thumbnail strip */}
            <div className="carousel-thumbs">
              {productPhotos.map((photo, i) => (
                <motion.button
                  key={i}
                  className={`carousel-thumb ${i === activePhoto ? 'active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Photo ${i + 1}`}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  layout
                >
                  <img src={photo.src} alt="" draggable={false} />
                  {i === activePhoto && (
                    <motion.div
                      className="carousel-thumb-ring"
                      layoutId="thumbRing"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Progress bar */}
            <div className="carousel-progress">
              <motion.div
                className="carousel-progress-bar"
                animate={{ width: `${((activePhoto + 1) / productPhotos.length) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== STATEMENT ===== */}
      <section className="section statement-section" ref={statementRef}>
        <ScrollTextLines scrollRef={statementRef} lang={lang} />
        <div className="section-inner centered-text" style={{ position: 'relative', zIndex: 2 }}>
          <h2 className="statement-text">
            {t.statement1.split(' ').map((word, i) => (
              <motion.span
                key={i}
                className="statement-word"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, ease, delay: i * 0.08 }}
              >
                {word}{' '}
              </motion.span>
            ))}
          </h2>
          <h2 className="statement-text statement-accent">
            {t.statement2.split(' ').map((word, i) => (
              <motion.span
                key={i}
                className="statement-word"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, ease, delay: 0.45 + i * 0.12 }}
              >
                {word}{' '}
              </motion.span>
            ))}
          </h2>
        </div>
      </section>

      {/* ===== CUSTOMIZE ===== */}
      <section className="section customize-section" id="customize">
        <Sparkle size={22} top="6%" right="12%" delay={0.3} />
        <div className="section-inner">
          <div className="centered-text">
            <motion.p {...fadeUp()} className="section-eyebrow">{t.customizeEyebrow}</motion.p>
            <motion.h2 {...fadeUp(0.1)} className="section-title">
              {t.customizeTitle}
            </motion.h2>
            <motion.p {...fadeUp(0.2)} className="section-body">
              {t.customizeBody}
            </motion.p>
          </div>
          <motion.div {...scaleUp(0.25)}>
            <Customizer lang={lang} />
          </motion.div>
        </div>
      </section>

      {/* ===== SPECS ===== */}
      <section className="section specs-section">
        <div className="section-inner">
          <motion.p {...fadeUp()} className="section-eyebrow">{t.specsEyebrow}</motion.p>

          <div className="specs-grid">
            {t.specs.map((spec, i) => (
              <TiltCard
                className="spec-card"
                key={spec.title}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, ease, delay: i * 0.1 }}
              >
                <div className="spec-card-icon">
                  <span className="spec-card-icon-symbol">{spec.icon}</span>
                  <div className="spec-card-icon-ring" />
                </div>
                <h3 className="spec-card-title">{spec.title}</h3>
                <p className="spec-card-desc">{spec.desc}</p>
                <div className="spec-card-shine" />
              </TiltCard>
            ))}
          </div>
        </div>
      </section>


      {/* ===== CLOSING ===== */}
      <section className="section closing-section" ref={closingRef}>
        <Sparkle size={26} top="12%" left="10%" delay={0.3} />
        <Sparkle size={16} bottom="18%" right="12%" delay={0.6} />
        <Sparkle size={12} top="30%" right="6%" delay={0.8} />
        <div className="closing-pinned">
          <div className="section-inner centered-text">
            <p className="section-eyebrow">{t.closingEyebrow}</p>
            <h2 className="section-title-xl scroll-fill-heading">
              <ScrollFillText
                text={`${t.closingTitle1}\n${t.closingTitleConnector}${t.closingTitle2}`}
                em={t.closingTitle2}
                trigger={closingRef}
                start="top top"
                end="60% bottom"
              />
            </h2>
            <p className="section-body scroll-fill-body">
              <ScrollFillText
                text={t.closingBody}
                trigger={closingRef}
                start="35% top"
                end="85% bottom"
              />
            </p>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section cta-section" id="contact">
        <Sparkle size={20} top="20%" left="15%" delay={0.2} />
        <Sparkle size={14} top="30%" right="18%" delay={0.5} />
        <Sparkle size={10} bottom="30%" left="8%" delay={0.7} />
        <div className="section-inner centered-text">
          <motion.h2 {...scaleUp()} className="cta-title shimmer-text">{t.ctaTitle}</motion.h2>
          <motion.p {...fadeUp(0.1)} className="section-body">
            {t.ctaBody1}<br />{t.ctaBody2}
          </motion.p>
          <motion.div {...fadeUp(0.15)} style={{ marginTop: '4rem' }}>
            <TypewriterText lang={lang} key={lang} />
          </motion.div>
          <motion.a
            href="mailto:hello@unfold.design"
            className="btn-primary"
            {...fadeUp(0.25)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>{t.ctaButton}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.a>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-logo">UNFOLD</span>
          <span className="footer-copy">{t.footerCopy}</span>
        </div>
      </footer>
    </>
  )
}
