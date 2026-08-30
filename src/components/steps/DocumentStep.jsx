import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { IconId, IconArrowRight, IconArrowLeft, IconUpload, IconCamera, IconCheck, IconX, IconFileTypePdf } from '@tabler/icons-react'

const MAX_PDF_MB = 5

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function ModeTab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 text-[13px] font-medium rounded-md transition-colors ${
        active
          ? 'bg-background text-foreground shadow-sm border border-border'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

function PhotoCapture({ label, value, onChange }) {
  const inputRef = useRef(null)

  return (
    <div
      className={`relative rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
        value ? 'border-success/50 bg-success/5' : 'border-border hover:border-primary/40'
      }`}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={async e => {
          const file = e.target.files?.[0]
          if (!file) return
          const b64 = await fileToBase64(file)
          onChange(b64)
        }}
      />
      {value ? (
        <div className="relative">
          <img src={value} alt={label} className="w-full h-[120px] object-cover rounded-[6px]" />
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-success flex items-center justify-center">
            <IconCheck size={12} className="text-success-foreground" stroke={2.5} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[11px] text-center py-1 rounded-b-[6px]">
            {label} — toque para refazer
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-6 px-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <IconCamera size={18} className="text-muted-foreground" />
          </div>
          <p className="text-[12px] font-medium text-foreground">{label}</p>
          <p className="text-[11px] text-muted-foreground">Toque para fotografar</p>
        </div>
      )}
    </div>
  )
}

export function DocumentStep({ onNext, onBack }) {
  const [mode, setMode] = useState('pdf')
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfError, setPdfError] = useState(null)
  const [frontPhoto, setFrontPhoto] = useState(null)
  const [backPhoto, setBackPhoto] = useState(null)
  const pdfInputRef = useRef(null)

  async function handlePdfChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      setPdfError(`O arquivo deve ter no máximo ${MAX_PDF_MB} MB`)
      return
    }
    setPdfError(null)
    const b64 = await fileToBase64(file)
    setPdfFile({ name: file.name, size: file.size, base64: b64 })
  }

  function handleSkip() {
    onNext({ documentSkipped: true })
  }

  function handleContinue() {
    if (mode === 'pdf' && pdfFile) {
      onNext({
        documentMode: 'pdf',
        documentPdfName: pdfFile.name,
        documentPdfBase64: pdfFile.base64,
        documentPdfSizeKb: Math.round(pdfFile.size / 1024),
      })
    } else if (mode === 'photos' && (frontPhoto || backPhoto)) {
      onNext({
        documentMode: 'photos',
        documentFrontBase64: frontPhoto,
        documentBackBase64: backPhoto,
      })
    }
  }

  const canContinue =
    (mode === 'pdf' && !!pdfFile) ||
    (mode === 'photos' && (!!frontPhoto || !!backPhoto))

  return (
    <>
      <div className="p-6">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 mb-3 h-7 text-xs text-muted-foreground hover:text-foreground gap-1">
            <IconArrowLeft size={14} />
            Voltar
          </Button>
        )}
        <div className="flex items-center gap-2 mb-1">
          <IconId size={16} className="text-primary" />
          <h2 className="text-lg font-bold text-foreground">Documento de identidade</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Envie sua CNH digital (PDF) ou fotografe a frente e o verso do documento físico.
        </p>

        {/* Tabs de modo */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted mb-4">
          <ModeTab active={mode === 'pdf'} onClick={() => setMode('pdf')}>
            CNH Digital (PDF)
          </ModeTab>
          <ModeTab active={mode === 'photos'} onClick={() => setMode('photos')}>
            Foto do documento
          </ModeTab>
        </div>

        {/* PDF mode */}
        {mode === 'pdf' && (
          <div>
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="sr-only"
              onChange={handlePdfChange}
            />
            {pdfFile ? (
              <div className="flex items-center gap-3 rounded-lg border border-success/40 bg-success/5 p-3">
                <div className="w-9 h-9 rounded-md bg-background border border-border flex items-center justify-center flex-shrink-0">
                  <IconFileTypePdf size={18} className="text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">{pdfFile.name}</p>
                  <p className="text-[11px] text-muted-foreground">{Math.round(pdfFile.size / 1024)} KB</p>
                </div>
                <button
                  onClick={() => { setPdfFile(null); pdfInputRef.current.value = '' }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <IconX size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => pdfInputRef.current?.click()}
                className="w-full rounded-lg border-2 border-dashed border-border hover:border-primary/40 transition-colors py-8 flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <IconUpload size={20} className="text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-medium text-foreground">Selecionar PDF</p>
                  <p className="text-[11px] text-muted-foreground">Máximo {MAX_PDF_MB} MB</p>
                </div>
              </button>
            )}
            {pdfError && <p className="text-xs text-destructive mt-2">{pdfError}</p>}
          </div>
        )}

        {/* Photos mode */}
        {mode === 'photos' && (
          <div className="space-y-3">
            <PhotoCapture label="Frente do documento" value={frontPhoto} onChange={setFrontPhoto} />
            <PhotoCapture label="Verso do documento" value={backPhoto} onChange={setBackPhoto} />
            <p className="text-[11px] text-muted-foreground text-center">
              A validação automática do documento ocorre no servidor.
            </p>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-border flex flex-col gap-2">
        <Button className="w-full" size="lg" onClick={handleContinue} disabled={!canContinue}>
          Continuar
          <IconArrowRight size={16} />
        </Button>
        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={handleSkip}>
          Pular esta etapa
        </Button>
      </div>
    </>
  )
}
