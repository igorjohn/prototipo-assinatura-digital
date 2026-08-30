import { FileText, User, MapPin, Camera, CheckCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEP_CONFIG = [
  { key: 'welcome', label: 'Documento', Icon: FileText },
  { key: 'userData', label: 'Dados', Icon: User },
  { key: 'geo', label: 'Localização', Icon: MapPin },
  { key: 'selfie', label: 'Selfie', Icon: Camera },
  { key: 'receipt', label: 'Conclusão', Icon: CheckCircle },
]

const N = STEP_CONFIG.length          // 5
const HALF_CELL = `${50 / N}%`        // 10% — metade da primeira/última célula

export function StepIndicator({ currentStep }) {
  const currentIdx = STEP_CONFIG.findIndex(s => s.key === currentStep)

  return (
    <div className="px-4 py-4 border-b border-border bg-card">
      <div className="relative flex">

        {/* Linha de fundo: do centro do 1º dot ao centro do último */}
        <div
          className="absolute top-4 h-[2px] bg-border"
          style={{ left: HALF_CELL, right: HALF_CELL }}
        />

        {/* Linha de progresso */}
        {currentIdx > 0 && (
          <div
            className="absolute top-4 h-[2px] bg-success transition-all duration-500"
            style={{
              left: HALF_CELL,
              width: `calc((100% - 2 * ${HALF_CELL}) * ${currentIdx} / ${N - 1})`,
            }}
          />
        )}

        {/* Cada step ocupa 1/N da largura total */}
        {STEP_CONFIG.map((step, idx) => (
          <div
            key={step.key}
            className="relative z-10 flex flex-col items-center gap-1.5"
            style={{ width: `${100 / N}%` }}
          >
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200',
                idx < currentIdx  && 'bg-success text-success-foreground',
                idx === currentIdx && 'bg-primary text-primary-foreground ring-4 ring-primary/15',
                idx > currentIdx  && 'bg-muted text-muted-foreground'
              )}
            >
              {idx < currentIdx
                ? <Check size={14} strokeWidth={2.5} />
                : <step.Icon size={14} strokeWidth={idx === currentIdx ? 2.5 : 2} />
              }
            </div>
            <span
              className={cn(
                'text-[9px] text-center leading-none font-medium',
                idx === currentIdx ? 'text-primary font-semibold' : 'text-muted-foreground'
              )}
              style={{ maxWidth: '100%', wordBreak: 'break-word' }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
