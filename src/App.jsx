import { useState } from 'react'
import { StepIndicator } from './components/ui/StepIndicator'
import { WelcomeStep } from './components/steps/WelcomeStep'
import { UserDataStep } from './components/steps/UserDataStep'
import { GeoStep } from './components/steps/GeoStep'
import { SelfieStep } from './components/steps/SelfieStep'
import { ReceiptStep } from './components/steps/ReceiptStep'
import { PenLine } from 'lucide-react'

const STEPS = ['welcome', 'userData', 'geo', 'selfie', 'receipt']

export default function App() {
  const [step, setStep] = useState('welcome')
  const [collectedData, setCollectedData] = useState({})

  function advance(newData = {}) {
    setCollectedData(prev => ({ ...prev, ...newData }))
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-4 px-4 sm:py-10">
      <div className="w-full max-w-[480px]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
            <PenLine size={20} />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-foreground leading-tight">Assinador Digital</p>
            <p className="text-xs text-muted-foreground">Assinatura eletrônica com validade jurídica</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <StepIndicator currentStep={step} />
          {step === 'welcome' && <WelcomeStep onNext={advance} />}
          {step === 'userData' && <UserDataStep onNext={advance} />}
          {step === 'geo' && <GeoStep onNext={advance} signerData={collectedData} />}
          {step === 'selfie' && <SelfieStep onNext={advance} />}
          {step === 'receipt' && <ReceiptStep data={collectedData} />}
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground text-center">
          Protótipo educacional — dados coletados apenas localmente
        </p>
      </div>
    </div>
  )
}
