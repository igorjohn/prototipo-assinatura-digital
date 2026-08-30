import { useState } from 'react'
import { StepIndicator } from './components/ui/StepIndicator'
import { WelcomeStep } from './components/steps/WelcomeStep'
import { UserDataStep } from './components/steps/UserDataStep'
import { OtpStep } from './components/steps/OtpStep'
import { DocumentStep } from './components/steps/DocumentStep'
import { GeoStep } from './components/steps/GeoStep'
import { WebAuthnStep } from './components/steps/WebAuthnStep'
import { SelfieStep } from './components/steps/SelfieStep'
import { ReceiptStep } from './components/steps/ReceiptStep'

function SignatureIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
      <path fill="currentColor" fillRule="evenodd" d="M5.25 5.5a2.25 2.25 0 0 1 4.5 0v4.711c-1.85.33-3.813.88-5.425 1.793C2.368 13.112.75 14.87.75 17.5a5.75 5.75 0 0 0 11.5 0v-4.854c.855.338 1.5 1.222 1.5 2.354v1.25h3.023l.345-.691l.342-.683a4.75 4.75 0 0 1 4.248-2.626H23v-2.5h-1.292a7.25 7.25 0 0 0-5.932 3.082c-.653-1.425-1.931-2.516-3.526-2.778V5.5a4.75 4.75 0 1 0-9.5 0V8h2.5zm.306 8.68c1.17-.662 2.657-1.122 4.194-1.425V17.5a3.25 3.25 0 0 1-6.5 0c0-1.404.802-2.469 2.306-3.32M14 20.25h9v-2.5h-9z" clipRule="evenodd" />
    </svg>
  )
}

const STEPS = ['welcome', 'userData', 'otp', 'document', 'geo', 'webauthn', 'selfie', 'receipt']

export default function App() {
  const [step, setStep] = useState('welcome')
  const [collectedData, setCollectedData] = useState({})

  function advance(newData = {}) {
    setCollectedData(prev => ({ ...prev, ...newData }))
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
  }

  function goBack() {
    const idx = STEPS.indexOf(step)
    if (idx > 0) setStep(STEPS[idx - 1])
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col items-center py-4 px-4 sm:py-10">
      <div className="w-full max-w-[480px]">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
            <SignatureIcon />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-foreground leading-tight">Assinador Digital</p>
            <p className="text-xs text-muted-foreground">Assinatura eletrônica com validade jurídica</p>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <StepIndicator currentStep={step} />
          {step === 'welcome'   && <WelcomeStep onNext={advance} />}
          {step === 'userData'  && <UserDataStep onNext={advance} onBack={goBack} initialData={collectedData} />}
          {step === 'otp'       && <OtpStep onNext={advance} onBack={goBack} signerData={collectedData} />}
          {step === 'document'  && <DocumentStep onNext={advance} onBack={goBack} />}
          {step === 'geo'       && <GeoStep onNext={advance} onBack={goBack} />}
          {step === 'webauthn'  && <WebAuthnStep onNext={advance} onBack={goBack} signerData={collectedData} />}
          {step === 'selfie'    && <SelfieStep onNext={advance} onBack={goBack} />}
          {step === 'receipt'   && <ReceiptStep data={collectedData} />}
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground text-center">
          Protótipo educacional — dados coletados apenas localmente
        </p>
      </div>
    </div>
  )
}
