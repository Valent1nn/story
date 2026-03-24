import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

/*
  InteractiveBox — 3D preview for the Customizer.

  STRUCTURE:
  The front and back faces extend above the box height. At the top,
  each face has a lip/flap that folds 90° inward to form the lid.
  The two flaps meet at the center — magnetic seal.

  FRONT FACE: Shows "Your custom text" instead of gold accents.
  EMBOSS: Text is raised/extruded so it's visible when zooming.
  LINEN: Procedural canvas texture with crosshatch pattern.
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

function PackageBox({ color, finish, sizeId }) {
  const groupRef = useRef()
  const [flipped, setFlipped] = useState(false)

  const scale = sizeId === 'sm' ? 0.8 : sizeId === 'lg' ? 1.15 : 1

  // Linen texture (regenerate when color changes)
  const linenTex = useMemo(() => createLinenTexture(color), [color])

  // Materials
  const { mainMat, interiorMat, accentMat } = useMemo(() => {
    const isLinen = finish === 'linen'
    const shininess = finish === 'matte' ? 5 : finish === 'foil' ? 80 : isLinen ? 8 : 20

    const matProps = { shininess }
    if (isLinen) {
      // The linen texture already has the color baked in — use white
      // so it doesn't darken from color × texture multiplication
      matProps.color = '#c0c0c0'
      matProps.map = linenTex
    } else {
      matProps.color = color
    }

    return {
      mainMat: new THREE.MeshPhongMaterial(matProps),
      interiorMat: new THREE.MeshPhongMaterial({ color: '#6b2232', shininess: 12 }),
      accentMat: new THREE.MeshPhongMaterial({
        color: finish === 'foil' ? '#e8c97a' : '#b08d57',
        shininess: finish === 'foil' ? 100 : 60,
      }),
    }
  }, [color, finish, linenTex])

  // Smooth flip
  useFrame((_, delta) => {
    if (!groupRef.current) return
    const target = flipped ? Math.PI : 0
    groupRef.current.rotation.y += (target - groupRef.current.rotation.y) * Math.min(delta * 4, 1)
  })

  // Dimensions
  const t = 0.04
  const bW = 2 * scale
  const bH = 1.5 * scale
  const bD = 0.38 * scale
  const gap = 0.04

  // Wrapper outer dims
  const wW = bW + (gap + t) * 2
  const wH = bH + gap
  const wD = bD + (gap + t) * 2

  // Lid flaps: front/back faces extend up, then fold 90° inward
  const flapH = t
  const flapD = wD / 2 + t

  const panelH = wH

  const isEmboss = finish === 'emboss'
  const textColor = finish === 'foil' ? '#e8c97a' : '#aa9100'

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

      {/* ── FRONT FACE (full height) ── */}
      <mesh position={[0, t + panelH / 2, wD / 2 - t / 2]} material={mainMat} castShadow>
        <boxGeometry args={[wW, panelH, t]} />
      </mesh>
      <mesh position={[0, t + panelH / 2, wD / 2 - t - 0.001]} material={interiorMat}>
        <boxGeometry args={[wW - 0.04, panelH - 0.04, 0.003]} />
      </mesh>

      {/* ── BACK FACE (full height) ── */}
      <mesh position={[0, t + panelH / 2, -wD / 2 + t / 2]} material={mainMat} castShadow>
        <boxGeometry args={[wW, panelH, t]} />
      </mesh>
      <mesh position={[0, t + panelH / 2, -wD / 2 + t + 0.001]} material={interiorMat}>
        <boxGeometry args={[wW - 0.04, panelH - 0.04, 0.003]} />
      </mesh>

      {/* ── FRONT LID FLAP ──
          Extension of the front face that folds 90° inward at the top,
          forming the front half of the magnetic lid. */}
      <mesh position={[0, t + panelH + flapH / 2, wD / 2 - t / 2 - flapD / 2]} material={mainMat} castShadow>
        <boxGeometry args={[wW, flapH, flapD]} />
      </mesh>
      <mesh position={[0, t + panelH + 0.001, wD / 2 - t / 2 - flapD / 2]} material={interiorMat}>
        <boxGeometry args={[wW - 0.03, 0.003, flapD - 0.03]} />
      </mesh>

      {/* ── BACK LID FLAP ──
          Mirror of front flap, forms the back half of the lid. */}
      <mesh position={[0, t + panelH + flapH / 2, -wD / 2 + t / 2 + flapD / 2]} material={mainMat} castShadow>
        <boxGeometry args={[wW, flapH, flapD]} />
      </mesh>
      <mesh position={[0, t + panelH + 0.001, -wD / 2 + t / 2 + flapD / 2]} material={interiorMat}>
        <boxGeometry args={[wW - 0.03, 0.003, flapD - 0.03]} />
      </mesh>

      {/* ── LID SEAM (where flaps meet at center) ── */}
      <mesh position={[0, t + panelH + flapH + 0.001, 0]} material={accentMat}>
        <boxGeometry args={[wW - 0.1, 0.003, 0.008]} />
      </mesh>

      {/* ── FRONT TEXT: "Your custom text" ── */}
      <Text
        position={[0, t + panelH * 0.55, wD / 2 + 0.006]}
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

      {/* BACK TEXT (mirrored) */}
      <Text
        position={[0, t + panelH * 0.55, -wD / 2 - 0.006]}
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

      {/* Emboss: same-color raised text with subtle shadow outline to mimic pressed letterforms */}
      {isEmboss && (
        <>
          {/* Front — lighter shade text slightly in front for highlight effect */}
          <Text
            position={[0, t + panelH * 0.55 + 0.003, wD / 2 + 0.009]}
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
          {/* Front — darker shade text slightly offset for shadow effect */}
          <Text
            position={[0, t + panelH * 0.55 - 0.003, wD / 2 + 0.008]}
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
          {/* Back — highlight */}
          <Text
            position={[0, t + panelH * 0.55 + 0.003, -wD / 2 - 0.009]}
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
          {/* Back — shadow */}
          <Text
            position={[0, t + panelH * 0.55 - 0.003, -wD / 2 - 0.008]}
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

      {/* Foil: shimmering accent bar under text */}
      {finish === 'foil' && (
        <mesh position={[0, t + panelH * 0.45, wD / 2 + 0.006]} material={accentMat}>
          <boxGeometry args={[wW * 0.5, 0.015, 0.004]} />
        </mesh>
      )}

      {/* ── THE BOOK ── */}
      <mesh position={[0, t + gap + bH / 2, 0]} castShadow>
        <boxGeometry args={[bW, bH - 0.06, bD]} />
        <meshPhongMaterial color="#5c1a2a" shininess={18} />
      </mesh>
      {/* Pages */}
      <mesh position={[0, t + gap + bH / 2 + 0.01, 0]}>
        <boxGeometry args={[bW - 0.04, bH - 0.1, bD - 0.06]} />
        <meshPhongMaterial color="#f5f0e5" shininess={5} />
      </mesh>
    </group>
  )
}

export default function InteractiveBox({ color = '#f5f0e8', finish = 'matte', sizeId = 'md' }) {
  return (
    <div className="interactive-box-canvas">
      <Canvas
        camera={{ position: [2.5, 1.8, 3.2], fov: 32 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[4, 6, 4]} intensity={1.0} />
        <directionalLight position={[-4, 4, -4]} intensity={0.7} />
        <directionalLight position={[0, 2, -5]} intensity={0.5} />

        <PackageBox color={color} finish={finish} sizeId={sizeId} />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate
          autoRotateSpeed={0.8}
        />
      </Canvas>
      <p className="interactive-box-hint">Drag to rotate · Scroll to zoom · Double-click to flip</p>
    </div>
  )
}
