import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InteractiveBox from './InteractiveBox'

const COLORS = [
  { id: 'ivory', name: 'Ivory', hex: '#f5f0e8', dark: false },
  { id: 'charcoal', name: 'Charcoal', hex: '#5a5a5e', dark: true },
  { id: 'navy', name: 'Deep Navy', hex: '#3b5278', dark: true },
  { id: 'burgundy', name: 'Burgundy', hex: '#8c3a4a', dark: true },
  { id: 'forest', name: 'Forest', hex: '#4a6b4e', dark: true },
  { id: 'sand', name: 'Sand', hex: '#d4c4a8', dark: false },
]

const SIZES = [
  { id: 'sm', name: 'Small', dims: '20 × 15 × 5 cm', desc: 'Journals & pocket books' },
  { id: 'md', name: 'Medium', dims: '28 × 21 × 6 cm', desc: 'Standard books & photo albums' },
  { id: 'lg', name: 'Large', dims: '35 × 28 × 8 cm', desc: 'Coffee table books & portfolios' },
]

const FINISHES = [
  { id: 'matte', name: 'Soft-Touch Matte', desc: 'Velvety smooth surface with zero sheen', css: 'finish-matte' },
  { id: 'linen', name: 'Linen Cloth', desc: 'Woven textile texture with visible cross-weave', css: 'finish-linen' },
  { id: 'foil', name: 'Gold Foil Stamp', desc: 'Hot-stamped metallic lettering and accents', css: 'finish-foil' },
  { id: 'emboss', name: 'Blind Emboss', desc: 'Raised letterforms pressed into the surface', css: 'finish-emboss' },
]

const spring = { type: 'spring', stiffness: 400, damping: 25 }

export default function Customizer() {
  const [selectedColor, setSelectedColor] = useState('ivory')
  const [selectedSize, setSelectedSize] = useState('md')
  const [selectedFinish, setSelectedFinish] = useState('matte')

  const activeColor = COLORS.find(c => c.id === selectedColor)
  const activeSize = SIZES.find(s => s.id === selectedSize)
  const activeFinish = FINISHES.find(f => f.id === selectedFinish)

  return (
    <div className="customizer">
      {/* Interactive 3D preview */}
      <div className="customizer-preview">
        <InteractiveBox
          color={activeColor.hex}
          finish={selectedFinish}
          sizeId={selectedSize}
        />

        <AnimatePresence mode="wait">
          <motion.p
            key={`${selectedColor}-${selectedSize}-${selectedFinish}`}
            className="preview-label"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {activeColor.name} · {activeSize.name} · {activeFinish.name}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Controls with step indicators */}
      <div className="customizer-controls">
        {/* Step 1: Color */}
        <motion.div
          className="control-group"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0 }}
        >
          <h3 className="control-label">
            <span className="step-number">01</span>
            Color <span className="control-value">{activeColor.name}</span>
          </h3>
          <div className="color-swatches">
            {COLORS.map(color => (
              <motion.button
                key={color.id}
                className={`swatch ${selectedColor === color.id ? 'active' : ''}`}
                style={{ background: color.hex }}
                onClick={() => setSelectedColor(color.id)}
                aria-label={color.name}
                title={color.name}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={spring}
              >
                <AnimatePresence>
                  {selectedColor === color.id && (
                    <motion.svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={spring}
                    >
                      <path d="M5 13l4 4L19 7" stroke={color.dark ? '#fff' : '#1d1d1f'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Step 2: Size */}
        <motion.div
          className="control-group"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="control-label">
            <span className="step-number">02</span>
            Size
          </h3>
          <div className="size-options">
            {SIZES.map(size => (
              <motion.button
                key={size.id}
                className={`size-btn ${selectedSize === size.id ? 'active' : ''}`}
                onClick={() => setSelectedSize(size.id)}
                whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
              >
                <span className="size-name">{size.name}</span>
                <span className="size-dims">{size.dims}</span>
              </motion.button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={selectedSize}
              className="control-hint"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {activeSize.desc}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Step 3: Finish — with visual texture swatches */}
        <motion.div
          className="control-group"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="control-label">
            <span className="step-number">03</span>
            Finish
          </h3>
          <div className="finish-options">
            {FINISHES.map(finish => (
              <motion.button
                key={finish.id}
                className={`finish-btn ${selectedFinish === finish.id ? 'active' : ''}`}
                onClick={() => setSelectedFinish(finish.id)}
                whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}
                whileTap={{ scale: 0.98 }}
                transition={spring}
              >
                <div className="finish-swatch-row">
                  <span className={`finish-swatch ${finish.css}`} />
                  <div>
                    <span className="finish-name">{finish.name}</span>
                    <span className="finish-desc">{finish.desc}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
