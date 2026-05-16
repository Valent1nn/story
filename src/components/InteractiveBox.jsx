import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

/*
  InteractiveBox — 3D preview for the Customizer.

  TWO VARIANTS:
  - "closed": Lid flaps folded inward, magnetic seal.
  - "open":   Front/back faces rotated outward ~15°, flaps ajar (L-shaped).

  Animated transition between variants via spring interpolation.
*/

/* Generate a dramatic linen crosshatch texture via canvas */
function createLinenTexture(baseColor) {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  // Base color fill
  ctx.fillStyle = baseColor || '#e8e0d4'
  ctx.fillRect(0, 0, size, size)

  // HEAVY horizontal weave — thick alternating dark/bright bands
  for (let y = 0; y < size; y += 6) {
    const band = y % 18
    if (band < 6) {
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'
    } else if (band < 12) {
      ctx.strokeStyle = 'rgba(255,255,255,0.50)'
    } else {
      ctx.strokeStyle = 'rgba(0,0,0,0.18)'
    }
    ctx.lineWidth = 3.5
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(size, y)
    ctx.stroke()
  }
  // HEAVY vertical weave
  for (let x = 0; x < size; x += 6) {
    const band = x % 18
    if (band < 6) {
      ctx.strokeStyle = 'rgba(0,0,0,0.30)'
    } else if (band < 12) {
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'
    } else {
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    }
    ctx.lineWidth = 3.5
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, size)
    ctx.stroke()
  }

  // Large white highlight patches — very prominent
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const w = 12 + Math.random() * 24
    ctx.fillStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.20})`
    ctx.fillRect(x, y, w, 4)
  }
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const h = 12 + Math.random() * 24
    ctx.fillStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.20})`
    ctx.fillRect(x, y, 4, h)
  }

  // Dark groove patches for depth
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const w = 6 + Math.random() * 14
    ctx.fillStyle = `rgba(0,0,0,${0.08 + Math.random() * 0.12})`
    ctx.fillRect(x, y, w, 3)
  }

  // Texture noise — fibrous speckle
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    ctx.fillStyle = Math.random() > 0.5
      ? `rgba(255,255,255,${0.05 + Math.random() * 0.15})`
      : `rgba(0,0,0,${0.03 + Math.random() * 0.08})`
    ctx.fillRect(x, y, 2, 2)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 2)
  return tex
}

const STRAP_WIDTH = 0.125
const STRAP_SEGS = 10

function PackageBox({ color, finish, sizeId, variant = 'closed', accentColor = '#6b2232', strapColor = '#c9a96e' }) {
  const groupRef = useRef()
  const [flipped, setFlipped] = useState(false)

  // Animated open amount: 0 = closed, 1 = open
  const openRef = useRef(0)
  const targetOpen = variant === 'open' ? 1 : 0

  const scale = sizeId === 'sm' ? 0.8 : sizeId === 'lg' ? 1.15 : 1

  // Linen texture (regenerate when color changes)
  const linenTex = useMemo(() => createLinenTexture(color), [color])

  // Materials
  const { mainMat, interiorMat, accentMat } = useMemo(() => {
    const isLinen = finish === 'linen'
    const shininess = finish === 'matte' ? 5 : finish === 'foil' ? 80 : isLinen ? 8 : 20

    const matProps = { shininess }
    if (isLinen) {
      matProps.color = '#c0c0c0'
      matProps.map = linenTex
    } else {
      matProps.color = color
    }

    return {
      mainMat: new THREE.MeshPhongMaterial(matProps),
      interiorMat: new THREE.MeshPhongMaterial({ color: accentColor, shininess: 12 }),
      accentMat: new THREE.MeshPhongMaterial({
        color: finish === 'foil' ? '#e8c97a' : '#b08d57',
        shininess: finish === 'foil' ? 100 : 60,
      }),
    }
  }, [color, finish, linenTex, accentColor])

  // Refs for animated groups
  const frontWallRef = useRef()
  const backWallRef = useRef()
  const frontFlapRef = useRef()
  const backFlapRef = useRef()
  const lidSeamRef = useRef()
  const bookGroupRef = useRef()
  const strapsGroupRef = useRef()

  // Strap geometries (4 ribbons: 2 front-wall, 2 back-wall)
  const strapGeos = useMemo(() =>
    Array.from({ length: 4 }, () => new THREE.PlaneGeometry(STRAP_WIDTH, 1, 1, STRAP_SEGS)), [])
  const strapMat = useMemo(() => new THREE.MeshPhongMaterial({
    color: strapColor, shininess: 35, side: THREE.DoubleSide,
  }), [strapColor])

  // Dimensions (before useFrame so the callback can reference them)
  const t = 0.04
  const bW = 2 * scale
  const bH = 1.5 * scale
  const bD = 0.15 * scale
  const gap = 0.04

  const wW = bW + (gap + t) * 2
  const wH = bH + gap
  const wD = bD + (gap + t) * 2

  const flapH = t
  const flapD = wD / 2 + t
  const panelH = wH

  const isEmboss = finish === 'emboss'
  const textColor = finish === 'foil' ? '#e8c97a' : '#aa9100'

  // Smooth flip + open/close animation
  useFrame((_, delta) => {
    if (!groupRef.current) return
    const flipTarget = flipped ? Math.PI : 0
    groupRef.current.rotation.y += (flipTarget - groupRef.current.rotation.y) * Math.min(delta * 4, 1)

    // Smooth lerp open amount (slow and dramatic)
    openRef.current += (targetOpen - openRef.current) * Math.min(delta * 0.8, 1)
    const o = openRef.current

    // Sequenced animation: flaps lift first (0→0.4), then walls fall (0.3→1)
    const flapProgress = Math.min(o / 0.4, 1) // 0→1 during first 40% of animation
    const wallProgress = Math.max((o - 0.3) / 0.7, 0) // 0→1 starting at 30%

    // Walls fall outward to 80°
    const wallAngle = wallProgress * (80 * Math.PI / 180)
    // Flaps: closed = flat on top of lid (rotation 0). Open = lifted 35° outward.
    const flapLift = flapProgress * (35 * Math.PI / 180)

    if (frontWallRef.current) {
      frontWallRef.current.rotation.x = wallAngle
    }
    if (backWallRef.current) {
      backWallRef.current.rotation.x = -wallAngle
    }
    if (frontFlapRef.current) {
      frontFlapRef.current.rotation.x = flapLift
    }
    if (backFlapRef.current) {
      backFlapRef.current.rotation.x = -flapLift
    }
    if (lidSeamRef.current) {
      const seamVisible = o < 0.05
      lidSeamRef.current.visible = seamVisible
      if (seamVisible) {
        lidSeamRef.current.material.opacity = 1 - o * 20
      }
    }

    // ── Fabric straps: lift the book as walls fall ──
    const bookLift = wallProgress * panelH * 0.25
    if (bookGroupRef.current) {
      bookGroupRef.current.position.y = bookLift
    }

    if (strapsGroupRef.current) {
      const strapWallH = panelH * 0.5
      const innerOff = t / 2 + 0.005
      const bookFaceZ = (wD - t * 2) / 2 - 0.005
      const strapSpacing = wW * 0.18
      const strapConfigs = [
        { x: -strapSpacing, zSign: 1 },
        { x:  strapSpacing, zSign: 1 },
        { x: -strapSpacing, zSign: -1 },
        { x:  strapSpacing, zSign: -1 },
      ]

      strapsGroupRef.current.children.forEach((mesh, i) => {
        const cfg = strapConfigs[i]
        const a = wallAngle

        // Wall attachment (rotates with wall)
        const wy = t + strapWallH * Math.cos(a) + innerOff * Math.sin(a)
        const wz = cfg.zSign > 0
          ? (wD / 2 - t / 2) + strapWallH * Math.sin(a) - innerOff * Math.cos(a)
          : -(wD / 2 - t / 2) - strapWallH * Math.sin(a) + innerOff * Math.cos(a)

        // Book face attachment
        const by = t + bookLift + (wH - t) * 0.35
        const bz = cfg.zSign * bookFaceZ

        // Fabric sag — decreases quickly as strap goes taut
        const slack = Math.pow(Math.max(0, 1 - wallProgress * 1.3), 2)
        const sagAmount = slack * panelH * 0.12
        const midY = (wy + by) / 2 - sagAmount
        const midZ = (wz + bz) / 2

        // Deform ribbon vertices along quadratic bezier
        const pos = mesh.geometry.attributes.position
        for (let j = 0; j <= STRAP_SEGS; j++) {
          const param = j / STRAP_SEGS
          const omt = 1 - param
          const py = omt * omt * wy + 2 * omt * param * midY + param * param * by
          const pz = omt * omt * wz + 2 * omt * param * midZ + param * param * bz
          pos.setXYZ(j * 2, cfg.x - STRAP_WIDTH / 2, py, pz)
          pos.setXYZ(j * 2 + 1, cfg.x + STRAP_WIDTH / 2, py, pz)
        }
        pos.needsUpdate = true
        mesh.geometry.computeVertexNormals()
      })
    }

  })

  return (
    <group
      ref={groupRef}
      position={[0, -wH / 2, 0]}
      onDoubleClick={(e) => {
        e.stopPropagation()
        setFlipped((f) => !f)
      }}
    >
      {/* ── BOTTOM ── */}
      <mesh position={[0, t / 2, 0]} material={mainMat} castShadow>
        <boxGeometry args={[wW, t, wD]} />
      </mesh>
      <mesh position={[0, t + 0.001, 0]} material={interiorMat}>
        <boxGeometry args={[wW - t * 4, 0.003, wD - t * 4]} />
      </mesh>

      {/* ── LEFT WALL ── */}
      <mesh position={[-wW / 2 + t / 2, t + panelH / 2, 0]} material={mainMat} castShadow>
        <boxGeometry args={[t, panelH, wD - t * 2]} />
      </mesh>
      <mesh position={[-wW / 2 + t + 0.001, t + panelH / 2, 0]} material={interiorMat}>
        <boxGeometry args={[0.003, panelH - 0.04, wD - t * 2 - 0.04]} />
      </mesh>

      {/* ── RIGHT WALL ── */}
      <mesh position={[wW / 2 - t / 2, t + panelH / 2, 0]} material={mainMat} castShadow>
        <boxGeometry args={[t, panelH, wD - t * 2]} />
      </mesh>
      <mesh position={[wW / 2 - t - 0.001, t + panelH / 2, 0]} material={interiorMat}>
        <boxGeometry args={[0.003, panelH - 0.04, wD - t * 2 - 0.04]} />
      </mesh>

      {/* ── FRONT WALL GROUP (pivots at bottom edge) ── */}
      <group ref={frontWallRef} position={[0, t, wD / 2 - t / 2]}>
        {/* Main front face */}
        <mesh position={[0, panelH / 2, 0]} material={mainMat} castShadow>
          <boxGeometry args={[wW, panelH, t]} />
        </mesh>
        <mesh position={[0, panelH / 2, -0.001]} material={interiorMat}>
          <boxGeometry args={[wW - 0.04, panelH - 0.04, 0.003]} />
        </mesh>

        {/* Front text */}
        <Text
          position={[0, panelH * 0.55, 0.006 + t / 2]}
          fontSize={0.1 * scale}
          color={isEmboss ? color : textColor}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
          maxWidth={wW * 0.75}
          textAlign="center"
          depthOffset={-2}
          outlineWidth={isEmboss ? 0.003 : 0}
          outlineColor={isEmboss ? '#000000' : undefined}
          outlineOpacity={isEmboss ? 0.15 : 0}
        >
          Your custom text
        </Text>

        {isEmboss && (
          <>
            <Text
              position={[0, panelH * 0.55 + 0.003, 0.009 + t / 2]}
              fontSize={0.1 * scale}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.1}
              maxWidth={wW * 0.75}
              textAlign="center"
              depthOffset={-3}
              fillOpacity={0.18}
            >
              Your custom text
            </Text>
            <Text
              position={[0, panelH * 0.55 - 0.003, 0.008 + t / 2]}
              fontSize={0.1 * scale}
              color="#000000"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.1}
              maxWidth={wW * 0.75}
              textAlign="center"
              depthOffset={-3}
              fillOpacity={0.12}
            >
              Your custom text
            </Text>
          </>
        )}

        {finish === 'foil' && (
          <mesh position={[0, panelH * 0.45, 0.006 + t / 2]} material={accentMat}>
            <boxGeometry args={[wW * 0.5, 0.015, 0.004]} />
          </mesh>
        )}

        {/* ── FRONT LID FLAP (L-shape extension, pivots at top of front wall) ── */}
        <group ref={frontFlapRef} position={[0, panelH, 0]}>
          <mesh position={[0, flapH / 2, -flapD / 2 + t / 2]} material={mainMat} castShadow>
            <boxGeometry args={[wW, flapH, flapD]} />
          </mesh>
          <mesh position={[0, 0.001, -flapD / 2 + t / 2]} material={interiorMat}>
            <boxGeometry args={[wW - 0.03, 0.003, flapD - 0.03]} />
          </mesh>
        </group>
      </group>

      {/* ── BACK WALL GROUP (pivots at bottom edge) ── */}
      <group ref={backWallRef} position={[0, t, -wD / 2 + t / 2]}>
        {/* Main back face */}
        <mesh position={[0, panelH / 2, 0]} material={mainMat} castShadow>
          <boxGeometry args={[wW, panelH, t]} />
        </mesh>
        <mesh position={[0, panelH / 2, 0.001]} material={interiorMat}>
          <boxGeometry args={[wW - 0.04, panelH - 0.04, 0.003]} />
        </mesh>

        {/* Back text */}
        <Text
          position={[0, panelH * 0.55, -0.006 - t / 2]}
          fontSize={0.1 * scale}
          color={isEmboss ? color : textColor}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
          maxWidth={wW * 0.75}
          textAlign="center"
          rotation={[0, Math.PI, 0]}
          depthOffset={-2}
          outlineWidth={isEmboss ? 0.003 : 0}
          outlineColor={isEmboss ? '#000000' : undefined}
          outlineOpacity={isEmboss ? 0.15 : 0}
        >
          Your custom text
        </Text>

        {isEmboss && (
          <>
            <Text
              position={[0, panelH * 0.55 + 0.003, -0.009 - t / 2]}
              fontSize={0.1 * scale}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.1}
              maxWidth={wW * 0.75}
              textAlign="center"
              rotation={[0, Math.PI, 0]}
              depthOffset={-3}
              fillOpacity={0.18}
            >
              Your custom text
            </Text>
            <Text
              position={[0, panelH * 0.55 - 0.003, -0.008 - t / 2]}
              fontSize={0.1 * scale}
              color="#000000"
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.1}
              maxWidth={wW * 0.75}
              textAlign="center"
              rotation={[0, Math.PI, 0]}
              depthOffset={-3}
              fillOpacity={0.12}
            >
              Your custom text
            </Text>
          </>
        )}

        {/* ── BACK LID FLAP (L-shape extension, pivots at top of back wall) ── */}
        <group ref={backFlapRef} position={[0, panelH, 0]}>
          <mesh position={[0, flapH / 2, flapD / 2 - t / 2]} material={mainMat} castShadow>
            <boxGeometry args={[wW, flapH, flapD]} />
          </mesh>
          <mesh position={[0, 0.001, flapD / 2 - t / 2]} material={interiorMat}>
            <boxGeometry args={[wW - 0.03, 0.003, flapD - 0.03]} />
          </mesh>
        </group>
      </group>

      {/* ── LID SEAM (where flaps meet at center — fades out when opening) ── */}
      <mesh ref={lidSeamRef} position={[0, t + panelH + flapH + 0.001, 0]}>
        <boxGeometry args={[wW - 0.1, 0.003, 0.008]} />
        <meshPhongMaterial
          color={finish === 'foil' ? '#e8c97a' : '#b08d57'}
          shininess={finish === 'foil' ? 100 : 60}
          transparent
        />
      </mesh>

      {/* ── OUTER CONTAINER (stays in place when walls fall) ── */}
      <mesh position={[0, t + (wH - t) / 2, 0]}>
        <boxGeometry args={[wW - t * 2, wH - t, wD - t * 2]} />
        <meshPhongMaterial color={accentColor} shininess={18} />
      </mesh>

      {/* ── BOOK (lifted by straps) ── */}
      <group ref={bookGroupRef}>
        <mesh position={[0, t + (wH - t) / 2 + 0.01, 0]} castShadow>
          <boxGeometry args={[wW - t * 2 - 0.04, wH - t - 0.06, wD - t * 2 - 0.06]} />
          <meshPhongMaterial color="#5c1a2a" shininess={18} />
        </mesh>
        {/* Pages */}
        <mesh position={[0, t + (wH - t) / 2 + 0.02, 0]}>
          <boxGeometry args={[wW - t * 2 - 0.08, wH - t - 0.10, wD - t * 2 - 0.10]} />
          <meshPhongMaterial color="#f5f0e5" shininess={5} />
        </mesh>
      </group>

      {/* ── FABRIC STRAPS ── */}
      <group ref={strapsGroupRef}>
        {strapGeos.map((geo, i) => (
          <mesh key={i} geometry={geo} material={strapMat} />
        ))}
      </group>
    </group>
  )
}

export default function InteractiveBox({ color = '#f5f0e8', finish = 'matte', sizeId = 'md', variant = 'closed', accentColor = '#6b2232', strapColor = '#c9a96e' }) {
  return (
    <div className="interactive-box-canvas" data-lenis-prevent>
      <Canvas
        camera={{ position: [3.2, 2.2, 4.0], fov: 32 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[4, 6, 4]} intensity={1.0} />
        <directionalLight position={[-4, 4, -4]} intensity={0.7} />
        <directionalLight position={[0, 2, -5]} intensity={0.5} />

        <PackageBox color={color} finish={finish} sizeId={sizeId} variant={variant} accentColor={accentColor} strapColor={strapColor} />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate
          autoRotateSpeed={-0.7}
        />
      </Canvas>
      <p className="interactive-box-hint">Drag to rotate · Scroll to zoom · Double-click to flip</p>
    </div>
  )
}
