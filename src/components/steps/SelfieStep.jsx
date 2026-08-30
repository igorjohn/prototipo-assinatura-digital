import { useState } from 'react'
import { OvalCamera } from '../ui/OvalCamera'

export function SelfieStep({ onNext }) {
  const [cameraOpen, setCameraOpen] = useState(false)

  function handleCapture(selfieBase64) {
    onNext({ selfieBase64, selfieTimestamp: new Date().toISOString() })
  }

  if (!cameraOpen) {
    return (
      <>
        <div className="card-body">
          <p className="step-title">Verificação por selfie</p>
          <p className="step-desc">
            Vamos tirar uma selfie para confirmar sua identidade. Você precisará autorizar o acesso à câmera.
          </p>

          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            <span>📷</span>
            <div>
              <strong>Como funciona:</strong>
              <ul style={{ marginTop: 6, paddingLeft: 18, fontSize: 13, lineHeight: 1.8 }}>
                <li>Posicione seu rosto dentro da moldura oval</li>
                <li>Mantenha uma boa iluminação no rosto</li>
                <li>A captura é automática quando o rosto estiver centralizado</li>
                <li>Todo o processamento ocorre localmente no seu dispositivo</li>
              </ul>
            </div>
          </div>

          <div className="alert alert-warning">
            <span>🔒</span>
            <span>Ao continuar, o navegador solicitará permissão para usar a câmera frontal.</span>
          </div>
        </div>
        <div className="card-footer">
          <button className="btn btn-primary" onClick={() => setCameraOpen(true)}>
            📷 Abrir câmera
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="card-body">
        <p className="step-title">Posicione seu rosto</p>
        <p className="step-desc">
          Centralize seu rosto dentro da moldura oval. A captura acontece automaticamente.
        </p>
        <OvalCamera onCapture={handleCapture} />
      </div>
    </>
  )
}
