import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InteractiveBox from './InteractiveBox'
import translations from '../translations'

const COLORS = [
  { id: 'ivory', nameKey: 'colorIvory', hex: '#f5f0e8', dark: false },
  { id: 'charcoal', nameKey: 'colorCharcoal', hex: '#5a5a5e', dark: true },
  { id: 'navy', nameKey: 'colorNavy', hex: '#3b5278', dark: true },
  { id: 'burgundy', nameKey: 'colorBurgundy', hex: '#8c3a4a', dark: true },
  { id: 'forest', nameKey: 'colorForest', hex: '#4a6b4e', dark: true },
  { id: 'sand', nameKey: 'colorSand', hex: '#d4c4a8', dark: false },
]

const SIZES = [
  { id: 'sm', nameKey: 'sizeSmall', dims: '20 × 15 × 5 cm', descKey: 'sizeSmallDesc' },
  { id: 'md', nameKey: 'sizeMedium', dims: '28 × 21 × 6 cm', descKey: 'sizeMediumDesc' },
  { id: 'lg', nameKey: 'sizeLarge', dims: '35 × 28 × 8 cm', descKey: 'sizeLargeDesc' },
]

const ACCENT_COLORS = [
  { id: 'burgundy', nameKey: 'accentBurgundy', hex: '#6b2232' },
  { id: 'midnight', nameKey: 'accentMidnight', hex: '#1a1a2e' },
  { id: 'espresso', nameKey: 'accentEspresso', hex: '#3c2415' },
  { id: 'slate', nameKey: 'accentSlate', hex: '#4a4a4a' },
  { id: 'emerald', nameKey: 'accentEmerald', hex: '#1b4332' },
  { id: 'plum', nameKey: 'accentPlum', hex: '#4a1942' },
]

const FINISHES = [
  { id: 'matte', nameKey: 'finishMatte', descKey: 'finishMatteDesc', css: 'finish-matte' },
  { id: 'linen', nameKey: 'finishLinen', descKey: 'finishLinenDesc', css: 'finish-linen' },
  { id: 'foil', nameKey: 'finishFoil', descKey: 'finishFoilDesc', css: 'finish-foil' },
  { id: 'emboss', nameKey: 'finishEmboss', descKey: 'finishEmbossDesc', css: 'finish-emboss' },
]

const spring = { type: 'spring', stiffness: 400, damping: 25 }

export default function Customizer({ lang }) {
  const [selectedColor, setSelectedColor] = useState('ivory')
  const [selectedSize, setSelectedSize] = useState('md')
  const [selectedFinish, setSelectedFinish] = useState('matte')
  const [selectedVariant, setSelectedVariant] = useState('closed')
  const [selectedAccent, setSelectedAccent] = useState('burgundy')

  const t = translations[lang]
  const activeColor = COLORS.find(c => c.id === selectedColor)
  const activeAccent = ACCENT_COLORS.find(a => a.id === selectedAccent)
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
          variant={selectedVariant}
          accentColor={activeAccent.hex}
        />

        {/* Variant toggle */}
        <div className="variant-toggle">
          {['closed', 'open'].map((v) => (
            <motion.button
              key={v}
              className={`variant-btn ${selectedVariant === v ? 'active' : ''}`}
              onClick={() => setSelectedVariant(v)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {v === 'closed' ? t.custVariantClosed : t.custVariantOpen}
              {selectedVariant === v && (
                <motion.div
                  className="variant-btn-indicator"
                  layoutId="variantIndicator"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={`${selectedColor}-${selectedSize}-${selectedFinish}`}
            className="preview-label"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {t[activeColor.nameKey]} · {t[activeAccent.nameKey]} · {t[activeSize.nameKey]} · {t[activeFinish.nameKey]}
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
            {t.custStepColor} <span className="control-value">{t[activeColor.nameKey]}</span>
          </h3>
          <div className="color-swatches">
            {COLORS.map(color => (
              <motion.button
                key={color.id}
                className={`swatch ${selectedColor === color.id ? 'active' : ''}`}
                style={{ background: color.hex }}
                onClick={() => setSelectedColor(color.id)}
                aria-label={t[color.nameKey]}
                title={t[color.nameKey]}
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

        {/* Step 2: Accent Color */}
        <motion.div
          className="control-group"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <h3 className="control-label">
            <span className="step-number">02</span>
            {t.custStepInterior} <span className="control-value">{t[activeAccent.nameKey]}</span>
          </h3>
          <div className="color-swatches">
            {ACCENT_COLORS.map(accent => (
              <motion.button
                key={accent.id}
                className={`swatch ${selectedAccent === accent.id ? 'active' : ''}`}
                style={{ background: accent.hex }}
                onClick={() => setSelectedAccent(accent.id)}
                aria-label={t[accent.nameKey]}
                title={t[accent.nameKey]}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={spring}
              >
                <AnimatePresence>
                  {selectedAccent === accent.id && (
                    <motion.svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={spring}
                    >
                      <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Step 3: Size */}
        <motion.div
          className="control-group"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="control-label">
            <span className="step-number">03</span>
            {t.custStepSize}
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
                <span className="size-name">{t[size.nameKey]}</span>
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
              {t[activeSize.descKey]}
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
            <span className="step-number">04</span>
            {t.custStepFinish}
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
                    <span className="finish-name">{t[finish.nameKey]}</span>
                    <span className="finish-desc">{t[finish.descKey]}</span>
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
