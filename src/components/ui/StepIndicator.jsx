import { IconFileText, IconUser, IconMail, IconMapPin, IconCamera, IconCircleCheck, IconCheck, IconId, IconFingerprint } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

const STEP_CONFIG = [
  { key: 'welcome',  Icon: IconFileText },
  { key: 'userData', Icon: IconUser },
  { key: 'otp',      Icon: IconMail },
  { key: 'document', Icon: IconId },
  { key: 'geo',      Icon: IconMapPin },
  { key: 'webauthn', Icon: IconFingerprint },
  { key: 'selfie',   Icon: IconCamera },
  { key: 'receipt',  Icon: IconCircleCheck },
]

const N = STEP_CONFIG.length
const HALF_CELL = `${50 / N}%`

export function StepIndicator({ currentStep }) {
  const currentIdx = STEP_CONFIG.findIndex(s => s.key === currentStep)

  return (
    <div className="px-4 py-3 border-b border-border bg-card">
      <div className="relative flex">
        <div
          className="absolute top-4 h-[2px] bg-border"
          style={{ left: HALF_CELL, right: HALF_CELL }}
        />
        {currentIdx > 0 && (
          <div
            className="absolute top-4 h-[2px] bg-success transition-all duration-500"
            style={{
              left: HALF_CELL,
              width: `calc((100% - 2 * ${HALF_CELL}) * ${currentIdx} / ${N - 1})`,
            }}
          />
        )}
        {STEP_CONFIG.map((step, idx) => (
          <div
            key={step.key}
            className="relative z-10 flex flex-col items-center"
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
                ? <IconCheck size={14} stroke={2.5} />
                : <step.Icon size={14} stroke={idx === currentIdx ? 2.5 : 2} />
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
