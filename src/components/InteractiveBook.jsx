import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

/*
  InteractiveBook — 3D book preview for the Customizer.
*/

/* ── Paper texture generator ── */
function createPaperTexture(color, type) {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = color
  ctx.fillRect(0, 0, size, size)

  if (type !== 'coated-gloss' && type !== 'coated-matt') {
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * size
      const y = Math.random() * size
      ctx.fillStyle = Math.random() > 0.5
        ? `rgba(255,255,255,${0.02 + Math.random() * 0.05})`
        : `rgba(0,0,0,${0.01 + Math.random() * 0.03})`
      ctx.fillRect(x, y, 1 + Math.random() * 2, 1)
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

/* ── Cover texture for velvet ── */
function createVelvetTexture(color) {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = color
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const b = Math.random() > 0.5 ? 255 : 0
    ctx.fillStyle = `rgba(${b},${b},${b},${0.02 + Math.random() * 0.04})`
    ctx.fillRect(x, y, 1 + Math.random() * 3, 1 + Math.random() * 2)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

/* ── Text texture rendered on canvas for book pages ── */
function createTextTexture(text, fontFamily, textColor, paperColor, width, height, title) {
  const w = 512
  const h = Math.round(512 * (height / width))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  // Paper background
  ctx.fillStyle = paperColor
  ctx.fillRect(0, 0, w, h)

  const margin = w * 0.1
  const fontName = fontFamily.includes('Poppins') ? 'Poppins, sans-serif' : fontFamily.includes('Georgia') ? 'Georgia, serif' : 'EB Garamond, serif'
  const fontSize = fontFamily.includes('Garamond') ? 22 : 19
  const lineHeight = fontSize * 1.35
  ctx.fillStyle = '#1a1a1a'
  ctx.textBaseline = 'top'

  let y = margin

  // Title (centered)
  if (title) {
    const titleSize = Math.round(fontSize * 1.4)
    ctx.font = `700 ${titleSize}px ${fontName}`
    ctx.textAlign = 'center'
    ctx.fillText(title, w / 2, y)
    ctx.textAlign = 'left'
    y += titleSize * 1.8
  }

  // Body text (justified)
  ctx.font = `600 ${fontSize}px ${fontName}`
  const maxW = w - margin * 2
  const words = text.split(' ')
  let line = ''

  for (const word of words) {
    const test = line + word + ' '
    if (ctx.measureText(test).width > maxW && line !== '') {
      // Justify the line
      const lineWords = line.trim().split(' ')
      if (lineWords.length > 1) {
        const totalWordsWidth = lineWords.reduce((sum, w2) => sum + ctx.measureText(w2).width, 0)
        const extraSpace = (maxW - totalWordsWidth) / (lineWords.length - 1)
        let xPos = margin
        for (const lw of lineWords) {
          ctx.fillText(lw, xPos, y)
          xPos += ctx.measureText(lw).width + extraSpace
        }
      } else {
        ctx.fillText(line.trim(), margin, y)
      }
      line = word + ' '
      y += lineHeight
      if (y > h - margin) break
    } else {
      line = test
    }
  }
  if (y <= h - margin) ctx.fillText(line.trim(), margin, y)

  const tex = new THREE.CanvasTexture(canvas)
  return tex
}

/* ── Camera zoom for page changes (temporary, stops after arriving) ── */
function CameraZoom({ zoomToPage, controlsRef }) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())
  const animating = useRef(false)
  const defaultPos = useRef(new THREE.Vector3(2.0, 1.2, 2.5))
  const defaultTarget = useRef(new THREE.Vector3(0, 0, 0))

  useEffect(() => {
    if (zoomToPage) {
      // Subtle zoom — just 10% closer
      targetPos.current.set(1.87, 1.1, 2.35)
      targetLookAt.current.set(0.02, 0.02, 0)
      animating.current = true
    } else {
      // Don't animate back — let user keep their manual zoom/position
      animating.current = false
    }
  }, [zoomToPage])

  useFrame((_, delta) => {
    if (!animating.current) return
    const speed = Math.min(delta * 2.5, 1)
    camera.position.lerp(targetPos.current, speed)
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, speed)
      controlsRef.current.update()
    }
    if (camera.position.distanceTo(targetPos.current) < 0.01) {
      animating.current = false
    }
  })

  return null
}

/* ── Main Book ── */
const FLIP_PAGES = 5

/* ── Curved flipping page — front/back faces, spine curl, flip curl ── */
function CurvedPage({ pageW, pageH, frontMaterial, backMaterial, flipProgressArr, index }) {
  const origPositions = useRef(null)
  const segX = 16

  // Shared geometry — deforming it updates both front and back meshes
  const geo = useMemo(() => new THREE.PlaneGeometry(pageW, pageH, segX, 1), [pageW, pageH])

  useEffect(() => {
    origPositions.current = new Float32Array(geo.attributes.position.array)
  }, [geo])

  useFrame(() => {
    if (!origPositions.current) return

    const fp = flipProgressArr.current[index]
    const pos = geo.attributes.position
    const orig = origPositions.current

    // Flip curl peaks at mid-flip
    const flipCurl = Math.sin(fp * Math.PI) * 0.35

    // Gentle resting curve only when page is fully open (fp > 0.9)
    // At this point the page is rotated ~135° so Z points away from cover, no protrusion
    const restT = Math.max(0, (fp - 0.9) / 0.1) // 0 until fp=0.9, then ramps to 1
    const restCurl = restT * restT * 0.12

    for (let i = 0; i < pos.count; i++) {
      const ox = orig[i * 3]
      const oy = orig[i * 3 + 1]

      // t = 0 at spine (binding edge), t = 1 at free edge
      const t = (ox / pageW) + 0.5

      // Binding curve: steep rise near spine simulating paper bending over the binding,
      // then gradual quadratic arch toward the free edge.
      // At t=0 (spine): both components = 0 → page is anchored at binding.
      const bindingRise = Math.sin(Math.min(t / 0.12, 1) * Math.PI * 0.5) * 0.15
      const bodyArch = t * t * 0.85
      const flipZ = (bindingRise + bodyArch) * flipCurl * pageW * 0.5

      // Resting curve — lifts the free (outer) edge when page is open
      const outerLift = t * t * t * restCurl * pageW * 0.8

      pos.array[i * 3] = ox
      pos.array[i * 3 + 1] = oy
      pos.array[i * 3 + 2] = flipZ + outerLift
    }

    pos.needsUpdate = true
    geo.computeVertexNormals()
  })

  return (
    <group position={[pageW / 2, pageH / 2, 0]}>
      <mesh geometry={geo} material={frontMaterial} />
      <mesh geometry={geo} material={backMaterial} />
    </group>
  )
}

function Book({ coverColor, paperColor, fontFamily, coverMaterial, coverText, isOpen, sizeId, pageCount }) {
  const groupRef = useRef()
  const coverFrontRef = useRef()
  const flipPageRefs = useRef([])
  const progressRef = useRef(0) // 0 = closed, 1 = fully open with pages flipped

  // Page count drives book thickness (96→thin, 400→thick)
  const depthScale = 0.6 + ((pageCount - 96) / (400 - 96)) * 0.8

  // Sizes: sm = pocket, md = standard (portrait), lg = landscape (width > height)
  const dims = sizeId === 'sm'
    ? { w: 0.75, h: 1.05, d: 0.12 * depthScale }
    : sizeId === 'lg'
    ? { w: 1.45, h: 1.05, d: 0.16 * depthScale }
    : { w: 0.95, h: 1.35, d: 0.15 * depthScale }

  const bW = dims.w
  const bH = dims.h
  const bD = dims.d
  const coverT = 0.015
  const pageInset = 0.02

  const paperColorHex = useMemo(() => ({
    'offset-ivory': '#e8d9b8',
    'offset-white': '#f5f5f0',
    'coated-matt': '#d4d4d4',
    'coated-gloss': '#ffffff',
  })[paperColor] || '#e8d9b8', [paperColor])

  const textColor = paperColor === 'offset-ivory' ? '#3a3226' : '#1d1d1f'

  const paperTex = useMemo(() => createPaperTexture(paperColorHex, paperColor), [paperColorHex, paperColor])
  const velvetTex = useMemo(() => createVelvetTexture(coverColor), [coverColor])

  const coverMat = useMemo(() => {
    if (coverMaterial === 'velvet') {
      return new THREE.MeshPhongMaterial({ map: velvetTex, shininess: 5, color: '#d0d0d0' })
    }
    return new THREE.MeshPhongMaterial({ color: coverColor, shininess: 25 })
  }, [coverColor, coverMaterial, velvetTex])

  const pageBlockMat = useMemo(() =>
    new THREE.MeshPhongMaterial({ color: paperColorHex, shininess: 2 }), [paperColorHex])

  const spineMat = useMemo(() =>
    new THREE.MeshPhongMaterial({ color: coverColor, shininess: 15 }), [coverColor])

  const pageW = bW - pageInset * 2
  const pageH = bH - pageInset * 2

  // Flip page texts — each page shows different content
  const flipPageTexts = useMemo(() => [
    'Într-o dimineață de vară, soarele își arunca razele peste câmpiile nesfârșite. Copiii alergau desculți prin iarba umedă de rouă, râzând și strigând de bucurie.',
    'Casa bunicilor era mică, dar plină de căldură. Mirosul de pâine proaspătă se amesteca cu parfumul florilor de tei care intrau pe fereastră.',
    'Seara, ne adunam cu toții în jurul mesei. Bunica povestea despre vremurile de demult, iar noi ascultam fascinați, cu ochii mari și sufletul deschis.',
    'Vara trecea repede, ca un vis frumos. Fiecare zi aducea o nouă aventură, o nouă descoperire, o nouă amintire de păstrat pentru totdeauna.',
    'Și așa, între joacă și povești, între câmpuri și livezi, am crescut cu dragostea pământului în suflet și cu amintirile copilăriei în inimă.',
  ], [])

  // Front materials — text on front face only (FrontSide)
  const flipFrontMats = useMemo(() =>
    flipPageTexts.map(text => {
      const tex = createTextTexture(text, fontFamily, textColor, paperColorHex, pageW, pageH)
      return new THREE.MeshBasicMaterial({ map: tex, side: THREE.FrontSide })
    }),
    [flipPageTexts, fontFamily, textColor, paperColorHex, pageW, pageH])

  // Back material — plain paper on back face (BackSide), shared by all flip pages
  const flipBackMat = useMemo(() =>
    new THREE.MeshPhongMaterial({ color: paperColorHex, shininess: 3, side: THREE.BackSide }), [paperColorHex])

  // Page textures with rendered text (final page after all flips)
  const pageOneText = 'Am v\u0103zut lumina zilei la 10 iulie 1949, \u00eentr-un stog de paie, pe c\u00e2mpurile colhozului \u201ePobeda\u201d, din satul S\u0103rata Nou\u0103, raionul F\u0103le\u0219ti. V\u0103 ve\u021bi pune \u00eentrebarea: \u201eDe ce pe c\u00e2mp? De ce \u00eentr-o c\u0103pi\u021b\u0103 de paie?\u201d Era vremea seceri\u0219ului. Nu era timp de pierdut. Fiecare clip\u0103 era pre\u021bioas\u0103. Era nevoie s\u0103 recolteze gr\u00e2ul c\u00e2t \u00eenc\u0103 era timp frumos, f\u0103r\u0103 ploaie, c\u0103ci dac\u0103 ploua, gr\u00e2ul era pierdut. Maturii, to\u021bi ca unul, se aflau pe c\u00e2mp. \u0218i mama era acolo. Cu burta la gur\u0103, pu\u021bin folos de la ea, dar m\u0103car \u021binea gura sacului, ca altcineva s\u0103 toarne gr\u00e2ul, \u0219i tot \u00eenainte era. Dup\u0103 socoteala mamei, mai aveam p\u00e2n\u0103 la na\u0219tere vreo dou\u0103 s\u0103pt\u0103m\u00e2ni, dar eu, dornic\u0103 s\u0103 v\u0103d soarele, m-am gr\u0103bit pu\u021bin. C\u00e2nd au apucat-o durerile na\u0219terii, n-a mai reu\u0219it s\u0103 ajung\u0103 acas\u0103. O vecin\u0103 avea pe d\u00e2nsa ..'
  const pageOneTitle = 'Primele amintiri'
  const pageTwoText = 'Each morning, she would sit beneath the old oak tree, its branches heavy with memory, and weave tales that made the wind pause to listen. The words flowed like water.'

  const leftPageTex = useMemo(() =>
    createTextTexture(pageTwoText, fontFamily, textColor, paperColorHex, pageW, pageH),
    [fontFamily, textColor, paperColorHex, pageW, pageH])

  const rightPageTex = useMemo(() =>
    createTextTexture(pageOneText, fontFamily, textColor, paperColorHex, pageW, pageH, pageOneTitle),
    [fontFamily, textColor, paperColorHex, pageW, pageH])

  const leftPageMat = useMemo(() =>
    new THREE.MeshBasicMaterial({ map: leftPageTex }), [leftPageTex])

  const rightPageMat = useMemo(() =>
    new THREE.MeshBasicMaterial({ map: rightPageTex }), [rightPageTex])

  // Cover title texture
  const coverTitleTex = useMemo(() => {
    if (!coverText) return null
    const w = 512
    const h = 512
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, w, h)
    ctx.font = `bold 36px serif`
    ctx.fillStyle = '#d4af37'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const words = coverText.toUpperCase().split(' ')
    const lines = []
    let line = ''
    for (const word of words) {
      const test = line + word + ' '
      if (ctx.measureText(test).width > w * 0.8 && line) {
        lines.push(line.trim())
        line = word + ' '
      } else {
        line = test
      }
    }
    lines.push(line.trim())
    const totalH = lines.length * 44
    const startY = h / 2 - totalH / 2 + 22
    lines.forEach((l, i) => ctx.fillText(l, w / 2, startY + i * 44))
    return new THREE.CanvasTexture(canvas)
  }, [coverText])

  // Track per-page flip progress for curving
  const flipProgressArr = useRef(new Float32Array(FLIP_PAGES))

  // Animation timeline:
  // progress 0.00–0.25: cover opens
  // progress 0.25–0.90: pages flip sequentially
  const coverMaxAngle = 140 * Math.PI / 180
  const pageMaxAngle = 135 * Math.PI / 180 // pages never exceed cover

  useFrame((_, delta) => {
    const target = isOpen ? 1 : 0
    const speed = isOpen ? 0.8 : 1.2
    progressRef.current += (target - progressRef.current) * Math.min(delta * speed, 1)

    const p = progressRef.current

    // Cover opens during 0–0.25
    const coverProgress = Math.min(p / 0.25, 1)
    if (coverFrontRef.current) {
      coverFrontRef.current.rotation.y = -coverProgress * coverMaxAngle
    }

    // Flip pages with staggered timing
    for (let i = 0; i < FLIP_PAGES; i++) {
      const ref = flipPageRefs.current[i]
      if (!ref) continue

      const pageStart = 0.15 + (i / FLIP_PAGES) * 0.55
      const pageEnd = pageStart + 0.25
      const pageProgress = Math.max(0, Math.min((p - pageStart) / (pageEnd - pageStart), 1))

      // Smooth ease in-out
      const eased = pageProgress < 0.5
        ? 2 * pageProgress * pageProgress
        : 1 - Math.pow(-2 * pageProgress + 2, 2) / 2

      // Store for curve deformation
      flipProgressArr.current[i] = eased

      // Rotate — clamped to stay within cover angle
      ref.rotation.y = -eased * pageMaxAngle
    }
  })

  // Pages stacked just above page block surface (bD/2 - 0.005) but below cover (bD/2)
  const pageStackBase = bD / 2 - 0.004

  return (
    <group ref={groupRef} position={[-bW / 2, -bH / 2, 0]}>
      {/* Back cover */}
      <mesh position={[bW / 2, bH / 2, -bD / 2 - coverT / 2]} material={coverMat}>
        <boxGeometry args={[bW + 0.02, bH + 0.02, coverT]} />
      </mesh>

      {/* Spine */}
      <mesh position={[0, bH / 2, 0]} material={spineMat}>
        <boxGeometry args={[coverT, bH + 0.02, bD + coverT * 2]} />
      </mesh>

      {/* Page block */}
      <mesh position={[bW / 2, bH / 2, 0]} material={pageBlockMat}>
        <boxGeometry args={[pageW, pageH, bD - 0.01]} />
      </mesh>

      {/* Front cover (hinged at spine) */}
      <group ref={coverFrontRef} position={[0, 0, bD / 2 + coverT / 2]}>
        <mesh position={[bW / 2 + coverT / 2, bH / 2, 0]} material={coverMat}>
          <boxGeometry args={[bW + 0.02, bH + 0.02, coverT]} />
        </mesh>
        {coverTitleTex && (
          <mesh position={[bW / 2 + coverT / 2, bH * 0.65, coverT / 2 + 0.001]}>
            <planeGeometry args={[bW * 0.8, bW * 0.8]} />
            <meshBasicMaterial map={coverTitleTex} transparent />
          </mesh>
        )}
      </group>

      {/* Flipping pages — hinged at binding edge, stacked inside book */}
      {Array.from({ length: FLIP_PAGES }).map((_, i) => (
        <group
          key={`flip-${i}`}
          ref={el => flipPageRefs.current[i] = el}
          position={[pageInset, pageInset, pageStackBase + (FLIP_PAGES - i) * 0.001]}
        >
          <CurvedPage
            pageW={pageW}
            pageH={pageH}
            frontMaterial={flipFrontMats[i]}
            backMaterial={flipBackMat}
            flipProgressArr={flipProgressArr}
            index={i}
          />
        </group>
      ))}

      {/* Final text page (visible after all flip pages have turned) */}
      <mesh position={[bW / 2, bH / 2, pageStackBase]} material={rightPageMat}>
        <planeGeometry args={[pageW, pageH]} />
      </mesh>

      {/* Left page (against back cover) */}
      <mesh position={[bW / 2, bH / 2, -bD / 2 + 0.003]} rotation={[0, Math.PI, 0]} material={leftPageMat}>
        <planeGeometry args={[pageW, pageH]} />
      </mesh>

      {/* Page edge (right side) */}
      <mesh position={[bW - pageInset, bH / 2, 0]}>
        <boxGeometry args={[0.003, pageH, bD - 0.01]} />
        <meshPhongMaterial color={paperColorHex} shininess={1} />
      </mesh>
    </group>
  )
}

export default function InteractiveBook({
  coverColor = '#8c3a4a',
  paperColor = 'offset-ivory',
  fontFamily = "'EB Garamond', serif",
  coverMaterial = 'printed',
  coverText = '',
  isOpen = false,
  zoomToPage = false,
  sizeId = 'md',
  pageCount = 192,
}) {
  const controlsRef = useRef()

  return (
    <div className="interactive-box-canvas" data-lenis-prevent>
      <Canvas
        camera={{ position: [2.0, 1.2, 2.5], fov: 32 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[4, 6, 4]} intensity={0.9} />
        <directionalLight position={[-3, 4, -3]} intensity={0.5} />
        <directionalLight position={[0, 2, 5]} intensity={0.4} />

        <Book
          coverColor={coverColor}
          paperColor={paperColor}
          fontFamily={fontFamily}
          coverMaterial={coverMaterial}
          coverText={coverText}
          isOpen={isOpen}
          sizeId={sizeId}
          pageCount={pageCount}
        />

        <CameraZoom
          zoomToPage={zoomToPage}
          controlsRef={controlsRef}
        />

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          minDistance={1}
          maxDistance={6}
          autoRotate={!isOpen}
          autoRotateSpeed={-0.7}
          target={[0, 0, 0]}
        />
      </Canvas>
      <p className="interactive-box-hint">Drag to rotate · Scroll to zoom</p>
    </div>
  )
}
