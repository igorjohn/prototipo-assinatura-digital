import { FileText, User, MapPin, Camera, CheckCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEP_CONFIG = [
  { key: 'welcome', label: 'Documento', Icon: FileText },
  { key: 'userData', label: 'Dados', Icon: User },
  { key: 'geo', label: 'Localização', Icon: MapPin },
  { key: 'selfie', label: 'Selfie', Icon: Camera },
  { key: 'receipt', label: 'Conclusão', Icon: CheckCircle },
]

export function StepIndicator({ currentStep }) {
  const currentIdx = STEP_CONFIG.findIndex(s => s.key === currentStep)

  return (
    <div className="px-6 py-4 border-b border-border bg-card">
      <div className="flex items-center">
        {STEP_CONFIG.map((step, idx) => (
          <div key={step.key} className={cn('flex items-center', idx < STEP_CONFIG.length - 1 ? 'flex-1' : 'flex-none')}>
            {/* Dot + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200',
                  idx < currentIdx && 'bg-success text-success-foreground',
                  idx === currentIdx && 'bg-primary text-primary-foreground ring-4 ring-primary/15',
                  idx > currentIdx && 'bg-muted text-muted-foreground'
                )}
              >
                {idx < currentIdx
                  ? <Check size={14} strokeWidth={2.5} />
                  : <step.Icon size={14} strokeWidth={idx === currentIdx ? 2.5 : 2} />
                }
              </div>
              <span className={cn(
                'text-[9px] whitespace-nowrap font-medium leading-none',
                idx === currentIdx ? 'text-primary font-semibold' : 'text-muted-foreground'
              )}>
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {idx < STEP_CONFIG.length - 1 && (
              <div className={cn(
                'flex-1 h-[2px] mx-1 mb-4 transition-colors duration-300',
                idx < currentIdx ? 'bg-success' : 'bg-border'
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
