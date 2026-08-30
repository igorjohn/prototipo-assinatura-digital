const STEP_CONFIG = [
  { key: 'welcome', label: 'Documento', icon: '📄' },
  { key: 'userData', label: 'Dados', icon: '👤' },
  { key: 'geo', label: 'Localização', icon: '📍' },
  { key: 'selfie', label: 'Selfie', icon: '📷' },
  { key: 'receipt', label: 'Conclusão', icon: '✅' },
]

export function StepIndicator({ currentStep }) {
  const currentIdx = STEP_CONFIG.findIndex(s => s.key === currentStep)

  return (
    <div className="step-indicator">
      {STEP_CONFIG.map((step, idx) => (
        <div key={step.key} style={{ display: 'flex', flex: 1, alignItems: 'center', flexDirection: 'column' }}>
          <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
            {idx > 0 && (
              <div className={`step-connector${idx <= currentIdx ? ' done' : ''}`} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: idx === 0 || idx === STEP_CONFIG.length - 1 ? 'none' : undefined }}>
              <div className={`step-dot ${idx < currentIdx ? 'done' : idx === currentIdx ? 'active' : 'pending'}`}>
                {idx < currentIdx ? '✓' : step.icon}
              </div>
            </div>
            {idx < STEP_CONFIG.length - 1 && (
              <div className={`step-connector${idx < currentIdx ? ' done' : ''}`} />
            )}
          </div>
          <span className={`step-label${idx === currentIdx ? ' active' : ''}`}>{step.label}</span>
        </div>
      ))}
    </div>
  )
}
