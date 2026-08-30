import { useState } from 'react'
import { OvalCamera } from '@/components/ui/OvalCamera'
import { Button } from '@/components/ui/button'
import { IconCamera, IconBulb, IconShield, IconFaceId, IconArrowRight, IconArrowLeft } from '@tabler/icons-react'

export function SelfieStep({ onNext, onBack }) {
  const [cameraOpen, setCameraOpen] = useState(false)

  function handleCapture({ selfieBase64, selfieAlignedBase64 }) {
    onNext({ selfieBase64, selfieAlignedBase64, selfieTimestamp: new Date().toISOString() })
  }

  if (!cameraOpen) {
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
            <IconCamera size={16} className="text-primary" />
            <h2 className="text-lg font-bold text-foreground">Verificação por selfie</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Vamos tirar uma selfie para confirmar sua identidade. Você precisará autorizar o acesso à câmera.
          </p>

          <div className="space-y-2.5 mb-5">
            {[
              { icon: IconFaceId, text: 'Posicione seu rosto dentro da moldura oval' },
              { icon: IconBulb, text: 'Mantenha uma boa iluminação no rosto' },
              { icon: IconCamera, text: 'A captura é automática quando o rosto estiver centralizado' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                  <Icon size={13} className="text-primary" />
                </div>
                <span className="pt-1">{text}</span>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-[13px] text-muted-foreground">
            <IconShield size={14} className="flex-shrink-0 mt-0.5 text-primary" />
            <span>Ao continuar, o navegador solicitará permissão para usar a câmera frontal.</span>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border">
          <Button className="w-full" size="lg" onClick={() => setCameraOpen(true)}>
            <IconCamera size={16} />
            Abrir câmera
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <IconCamera size={16} className="text-primary" />
          <h2 className="text-lg font-bold text-foreground">Posicione seu rosto</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Centralize seu rosto dentro da moldura oval. A captura acontece automaticamente.
        </p>
        <OvalCamera onCapture={handleCapture} />
      </div>
    </>
  )
}
