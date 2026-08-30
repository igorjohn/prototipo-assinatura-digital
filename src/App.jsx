import { useState } from 'react'
import { StepIndicator } from './components/ui/StepIndicator'
import { WelcomeStep } from './components/steps/WelcomeStep'
import { UserDataStep } from './components/steps/UserDataStep'
import { GeoStep } from './components/steps/GeoStep'
import { SelfieStep } from './components/steps/SelfieStep'
import { ReceiptStep } from './components/steps/ReceiptStep'

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
    <div className="app">
      <div className="card">
        <div className="card-header">
          <span className="card-header-logo">✍️</span>
          <div>
            <p className="card-header-title">Assinador Digital</p>
            <p className="card-header-subtitle">Assinatura eletrônica com validade jurídica</p>
          </div>
        </div>

        <StepIndicator currentStep={step} />

        {step === 'welcome' && <WelcomeStep onNext={advance} />}
        {step === 'userData' && <UserDataStep onNext={advance} />}
        {step === 'geo' && <GeoStep onNext={advance} signerData={collectedData} />}
        {step === 'selfie' && <SelfieStep onNext={advance} />}
        {step === 'receipt' && <ReceiptStep data={collectedData} />}
      </div>

      <p style={{ marginTop: 16, fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
        Protótipo educacional — dados coletados apenas localmente
      </p>
    </div>
  )
}
