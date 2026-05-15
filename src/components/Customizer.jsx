import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InteractiveBox from './InteractiveBox'
import translations from '../translations'

// Page count options: 96 to 400, step 4
const PAGE_COUNTS = Array.from({ length: (400 - 96) / 4 + 1 }, (_, i) => 96 + i * 4)

const BOOK_FORMATS = [
  { id: 'pocket', dims: '100 × 140 mm' },
  { id: 'standard', dims: '130 × 200 mm' },
  { id: 'landscape', dims: '297 × 210 mm' },
]

const ILLUSTRATION_PACKAGES = [
  { id: 'none' },
  { id: 'standard', range: '3–5' },
  { id: 'premium', range: '6–10' },
  { id: 'collection', range: '11–15' },
]

const ILLUSTRATION_SOURCES = [
  { id: 'ai' },
  { id: 'designer' },
]

const PAPER_TYPES = [
  { id: 'offset-ivory', weight: '90g' },
  { id: 'offset-white', weight: '90g' },
  { id: 'coated-matt', weight: '90g' },
  { id: 'coated-gloss', weight: '90g' },
]

const PRINT_TYPES = [
  { id: 'color' },
  { id: 'bw' },
]

const FONTS = [
  { id: 'garamond', name: 'Garamond', family: "'EB Garamond', serif" },
  { id: 'minion', name: 'Minion Pro', family: "'Minion Pro', serif" },
  { id: 'poppins', name: 'Poppins', family: "'Poppins', sans-serif" },
]

const COVER_MATERIALS = [
  { id: 'printed' },
  { id: 'velvet' },
]

const FINISHES = [
  { id: 'matte', css: 'finish-matte' },
  { id: 'linen', css: 'finish-linen' },
  { id: 'foil', css: 'finish-foil' },
  { id: 'emboss', css: 'finish-emboss' },
]

// Packaging colors (box exterior, inner layers, ribbon)
const PACKAGING_COLORS = [
  { id: 'ivory', hex: '#f5f0e8', dark: false },
  { id: 'charcoal', hex: '#5a5a5e', dark: true },
  { id: 'navy', hex: '#3b5278', dark: true },
  { id: 'burgundy', hex: '#8c3a4a', dark: true },
  { id: 'forest', hex: '#4a6b4e', dark: true },
  { id: 'sand', hex: '#d4c4a8', dark: false },
  { id: 'black', hex: '#1a1a1a', dark: true },
  { id: 'plum', hex: '#4a1942', dark: true },
]

const STRAP_COLORS = [
  { id: 'gold', hex: '#c9a96e', dark: false },
  { id: 'silver', hex: '#a8a9ad', dark: false },
  { id: 'ivory', hex: '#f0e6d0', dark: false },
  { id: 'black', hex: '#2a2a2a', dark: true },
  { id: 'burgundy', hex: '#6b2232', dark: true },
  { id: 'navy', hex: '#2c3e5a', dark: true },
]

const spring = { type: 'spring', stiffness: 400, damping: 25 }

/* ── Custom Dropdown ── */
function CustomDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const selected = options.find(o => o.value === value)

  return (
    <div className="custom-dropdown" ref={ref} data-lenis-prevent>
      <button
        type="button"
        className={`custom-dropdown-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span>{selected?.label}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            className="custom-dropdown-menu"
            initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {options.map(opt => (
              <li
                key={opt.value}
                className={`custom-dropdown-item ${opt.value === value ? 'active' : ''}`}
                onClick={() => { onChange(opt.value); setOpen(false) }}
              >
                {opt.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Customizer({ lang }) {
  const t = translations[lang]

  // Step 1: Book format & volume
  const [bookFormat, setBookFormat] = useState('standard')
  const [pageCount, setPageCount] = useState(192)
  const [quantity, setQuantity] = useState(1)

  // Step 2: Illustrations
  const [illustrationPkg, setIllustrationPkg] = useState('none')
  const [illustrationSource, setIllustrationSource] = useState('ai')
  const [visualSpecs, setVisualSpecs] = useState('')

  // Step 3: Interior
  const [paperType, setPaperType] = useState('offset-ivory')
  const [printType, setPrintType] = useState('color')
  const [font, setFont] = useState('garamond')

  // Step 4: Cover & packaging
  const [coverMaterial, setCoverMaterial] = useState('printed')
  const [coverText, setCoverText] = useState('')
  const [selectedFinish, setSelectedFinish] = useState('matte')
  const [packagingColor1, setPackagingColor1] = useState('ivory')
  const [packagingColor2, setPackagingColor2] = useState('burgundy')
  const [strapColor, setStrapColor] = useState('gold')

  // 3D preview variant
  const [selectedVariant, setSelectedVariant] = useState('closed')

  // Derived values for 3D preview
  const boxColor = PACKAGING_COLORS.find(c => c.id === packagingColor1)?.hex || '#f5f0e8'
  const accentColor = PACKAGING_COLORS.find(c => c.id === packagingColor2)?.hex || '#6b2232'
  const strapHex = STRAP_COLORS.find(c => c.id === strapColor)?.hex || '#c9a96e'

  const sizeId = bookFormat === 'pocket' ? 'sm' : bookFormat === 'landscape' ? 'lg' : 'md'

  return (
    <div className="customizer">
      {/* Interactive 3D preview */}
      <div className="customizer-preview">
        <InteractiveBox
          color={boxColor}
          finish={selectedFinish}
          sizeId={sizeId}
          variant={selectedVariant}
          accentColor={accentColor}
          strapColor={strapHex}
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
      </div>

      {/* Controls */}
      <div className="customizer-controls" data-lenis-prevent>

        {/* ═══ STEP 1: Book format & volume ═══ */}
        <motion.div
          className="control-group"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="control-label">
            <span className="step-number">01</span>
            {t.cfgStep1Title}
          </h3>
          <p className="control-hint">{t.cfgStep1Desc}</p>

          {/* Book format */}
          <label className="field-label">{t.cfgBookFormat}</label>
          <div className="size-options size-options--stack">
            {BOOK_FORMATS.map(fmt => (
              <motion.button
                key={fmt.id}
                className={`size-btn ${bookFormat === fmt.id ? 'active' : ''}`}
                onClick={() => setBookFormat(fmt.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
              >
                <span className="size-name">{t[`cfgFormat_${fmt.id}`]}</span>
                <span className="size-dims">{fmt.dims}</span>
              </motion.button>
            ))}
          </div>

          {/* Page count */}
          <label className="field-label">{t.cfgPageCount}</label>
          <CustomDropdown
            value={pageCount}
            options={PAGE_COUNTS.map(n => ({ value: n, label: `${n} ${t.cfgPages}` }))}
            onChange={(val) => setPageCount(Number(val))}
          />

          {/* File upload */}
          <label className="field-label">{t.cfgManuscript}</label>
          <button className="cfg-upload-btn">
            <span className="cfg-upload-icon">↑</span>
            {t.cfgUploadManuscript}
          </button>

          {/* Quantity */}
          <label className="field-label">{t.cfgQuantity}</label>
          <div className="cfg-quantity-row">
            <button
              className="cfg-qty-btn"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >−</button>
            <span className="cfg-qty-value">{quantity}</span>
            <button
              className="cfg-qty-btn"
              onClick={() => setQuantity(quantity + 1)}
            >+</button>
            <span className="cfg-qty-unit">{t.cfgPieces}</span>
          </div>
        </motion.div>

        {/* ═══ STEP 2: Illustrations ═══ */}
        <motion.div
          className="control-group"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <h3 className="control-label">
            <span className="step-number">02</span>
            {t.cfgStep2Title}
          </h3>
          <p className="control-hint">{t.cfgStep2Desc}</p>

          {/* Illustration packages */}
          <label className="field-label">{t.cfgIllustrationPkg}</label>
          <div className="finish-options">
            {ILLUSTRATION_PACKAGES.map(pkg => (
              <motion.button
                key={pkg.id}
                className={`finish-btn ${illustrationPkg === pkg.id ? 'active' : ''}`}
                onClick={() => setIllustrationPkg(pkg.id)}
                whileTap={{ scale: 0.98 }}
                transition={spring}
              >
                <span className="finish-name">{t[`cfgIllPkg_${pkg.id}`]}</span>
              </motion.button>
            ))}
          </div>

          {/* Source: own files */}
          <AnimatePresence>
            {illustrationPkg === 'none' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <label className="field-label">{t.cfgIllSourceOwn}</label>
                <button className="cfg-upload-btn">
                  <span className="cfg-upload-icon">↑</span>
                  {t.cfgUploadIllustrations}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Source: AI or Designer */}
          <AnimatePresence>
            {illustrationPkg !== 'none' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <label className="field-label">{t.cfgIllSource}</label>
                <div className="size-options size-options--stack">
                  {ILLUSTRATION_SOURCES.map(src => (
                    <motion.button
                      key={src.id}
                      className={`size-btn ${illustrationSource === src.id ? 'active' : ''}`}
                      onClick={() => setIllustrationSource(src.id)}
                      whileTap={{ scale: 0.97 }}
                      transition={spring}
                    >
                      <span className="size-name">{t[`cfgIllSrc_${src.id}`]}</span>
                      <span className="size-dims">{t[`cfgIllSrcDesc_${src.id}`]}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Visual specs */}
                <label className="field-label">{t.cfgVisualSpecs}</label>
                <textarea
                  className="cfg-textarea"
                  placeholder={t.cfgVisualSpecsPlaceholder}
                  value={visualSpecs}
                  onChange={(e) => setVisualSpecs(e.target.value)}
                  rows={3}
                />
                <button className="cfg-upload-btn" style={{ marginTop: '0.5rem' }}>
                  <span className="cfg-upload-icon">↑</span>
                  {t.cfgUploadReference}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ═══ STEP 3: Interior content ═══ */}
        <motion.div
          className="control-group"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="control-label">
            <span className="step-number">03</span>
            {t.cfgStep3Title}
          </h3>

          {/* Paper type */}
          <label className="field-label">{t.cfgPaperType}</label>
          <div className="paper-options">
            {PAPER_TYPES.map(paper => (
              <motion.button
                key={paper.id}
                className={`paper-btn ${paperType === paper.id ? 'active' : ''}`}
                onClick={() => setPaperType(paper.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
              >
                <div className={`paper-swatch paper-${paper.id}`} />
                <span className="paper-name">{t[`cfgPaper_${paper.id}`]}</span>
                <span className="paper-weight">{paper.weight}</span>
              </motion.button>
            ))}
          </div>

          {/* Print type */}
          <label className="field-label">{t.cfgPrintType}</label>
          <div className="size-options">
            {PRINT_TYPES.map(pt => (
              <motion.button
                key={pt.id}
                className={`size-btn ${printType === pt.id ? 'active' : ''}`}
                onClick={() => setPrintType(pt.id)}
                whileTap={{ scale: 0.97 }}
                transition={spring}
              >
                <span className="size-name">{t[`cfgPrint_${pt.id}`]}</span>
              </motion.button>
            ))}
          </div>

          {/* Font */}
          <label className="field-label">{t.cfgFont}</label>
          <div className="font-options">
            {FONTS.map(f => (
              <motion.button
                key={f.id}
                className={`font-btn ${font === f.id ? 'active' : ''}`}
                onClick={() => setFont(f.id)}
                whileTap={{ scale: 0.97 }}
                transition={spring}
              >
                <span className="font-preview" style={{ fontFamily: f.family }}>
                  {t.cfgFontPreviewText}
                </span>
                <span className="font-name">{f.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ═══ STEP 4: Cover & premium packaging ═══ */}
        <motion.div
          className="control-group"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h3 className="control-label">
            <span className="step-number">04</span>
            {t.cfgStep4Title}
          </h3>
          <p className="control-hint">{t.cfgStep4Desc}</p>

          {/* Cover material */}
          <label className="field-label">{t.cfgCoverMaterial}</label>
          <div className="finish-options">
            {COVER_MATERIALS.map(mat => (
              <motion.button
                key={mat.id}
                className={`finish-btn ${coverMaterial === mat.id ? 'active' : ''}`}
                onClick={() => setCoverMaterial(mat.id)}
                whileTap={{ scale: 0.98 }}
                transition={spring}
              >
                <span className="finish-name">{t[`cfgCover_${mat.id}`]}</span>
                <span className="finish-desc">{t[`cfgCoverDesc_${mat.id}`]}</span>
              </motion.button>
            ))}
          </div>

          {/* Cover text */}
          <label className="field-label">{t.cfgCoverCustom}</label>
          <textarea
            className="cfg-textarea"
            placeholder={t.cfgCoverCustomPlaceholder}
            value={coverText}
            onChange={(e) => setCoverText(e.target.value)}
            rows={2}
          />
          <button className="cfg-upload-btn" style={{ marginTop: '0.5rem' }}>
            <span className="cfg-upload-icon">↑</span>
            {t.cfgUploadCoverRef}
          </button>

          {/* Packaging finish/texture */}
          <label className="field-label">{t.cfgFinish}</label>
          <div className="finish-options">
            {FINISHES.map(finish => (
              <motion.button
                key={finish.id}
                className={`finish-btn ${selectedFinish === finish.id ? 'active' : ''}`}
                onClick={() => setSelectedFinish(finish.id)}
                whileTap={{ scale: 0.98 }}
                transition={spring}
              >
                <div className="finish-swatch-row">
                  <span className={`finish-swatch ${finish.css}`} />
                  <div>
                    <span className="finish-name">{t[`cfgFinish_${finish.id}`]}</span>
                    <span className="finish-desc">{t[`cfgFinishDesc_${finish.id}`]}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Packaging colors */}
          <label className="field-label">{t.cfgPackagingColor1}</label>
          <div className="color-swatches">
            {PACKAGING_COLORS.map(c => (
              <motion.button
                key={c.id}
                className={`swatch ${packagingColor1 === c.id ? 'active' : ''}`}
                style={{ background: c.hex }}
                onClick={() => setPackagingColor1(c.id)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={spring}
              >
                <AnimatePresence>
                  {packagingColor1 === c.id && (
                    <motion.svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      transition={spring}
                    >
                      <path d="M5 13l4 4L19 7" stroke={c.dark ? '#fff' : '#1d1d1f'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          <label className="field-label">{t.cfgPackagingColor2}</label>
          <div className="color-swatches">
            {PACKAGING_COLORS.map(c => (
              <motion.button
                key={c.id}
                className={`swatch ${packagingColor2 === c.id ? 'active' : ''}`}
                style={{ background: c.hex }}
                onClick={() => setPackagingColor2(c.id)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={spring}
              >
                <AnimatePresence>
                  {packagingColor2 === c.id && (
                    <motion.svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      transition={spring}
                    >
                      <path d="M5 13l4 4L19 7" stroke={c.dark ? '#fff' : '#1d1d1f'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          <label className="field-label">{t.cfgPackagingColor3}</label>
          <div className="color-swatches">
            {STRAP_COLORS.map(c => (
              <motion.button
                key={c.id}
                className={`swatch ${strapColor === c.id ? 'active' : ''}`}
                style={{ background: c.hex }}
                onClick={() => setStrapColor(c.id)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={spring}
              >
                <AnimatePresence>
                  {strapColor === c.id && (
                    <motion.svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      transition={spring}
                    >
                      <path d="M5 13l4 4L19 7" stroke={c.dark ? '#fff' : '#1d1d1f'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ═══ SUMMARY ═══ */}
        <motion.div
          className="control-group cfg-summary"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="control-label">
            <span className="step-number">✓</span>
            {t.cfgSummaryTitle}
          </h3>
          <div className="cfg-summary-grid">
            <div className="cfg-summary-row">
              <span className="cfg-summary-label">{t.cfgBookFormat}</span>
              <span className="cfg-summary-value">{t[`cfgFormat_${bookFormat}`]}</span>
            </div>
            <div className="cfg-summary-row">
              <span className="cfg-summary-label">{t.cfgPageCount}</span>
              <span className="cfg-summary-value">{pageCount} {t.cfgPages}</span>
            </div>
            <div className="cfg-summary-row">
              <span className="cfg-summary-label">{t.cfgQuantity}</span>
              <span className="cfg-summary-value">{quantity} {t.cfgPieces}</span>
            </div>
            <div className="cfg-summary-row">
              <span className="cfg-summary-label">{t.cfgIllustrationPkg}</span>
              <span className="cfg-summary-value">{t[`cfgIllPkg_${illustrationPkg}`]}</span>
            </div>
            <div className="cfg-summary-row">
              <span className="cfg-summary-label">{t.cfgPaperType}</span>
              <span className="cfg-summary-value">{t[`cfgPaper_${paperType}`]}</span>
            </div>
            <div className="cfg-summary-row">
              <span className="cfg-summary-label">{t.cfgPrintType}</span>
              <span className="cfg-summary-value">{t[`cfgPrint_${printType}`]}</span>
            </div>
            <div className="cfg-summary-row">
              <span className="cfg-summary-label">{t.cfgFont}</span>
              <span className="cfg-summary-value">{FONTS.find(f => f.id === font)?.name}</span>
            </div>
            <div className="cfg-summary-row">
              <span className="cfg-summary-label">{t.cfgCoverMaterial}</span>
              <span className="cfg-summary-value">{t[`cfgCover_${coverMaterial}`]}</span>
            </div>
            <div className="cfg-summary-row">
              <span className="cfg-summary-label">{t.cfgFinish}</span>
              <span className="cfg-summary-value">{t[`cfgFinish_${selectedFinish}`]}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
