function DataRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null
  const display = typeof value === 'boolean' ? (value ? 'Sim' : 'Não')
    : Array.isArray(value) ? value.join(', ')
    : typeof value === 'object' ? JSON.stringify(value)
    : String(value)
  return (
    <div className="data-row">
      <span className="data-key">{label}</span>
      <span className="data-value">{display}</span>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="data-section">
      <p className="data-section-title">{title}</p>
      {children}
    </div>
  )
}

function downloadJson(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `comprovante-assinatura-${new Date().toISOString().slice(0,10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function ReceiptStep({ data }) {
  const { selfieBase64, ...rest } = data

  return (
    <>
      <div className="card-body">
        <p className="step-title" style={{ textAlign: 'center', color: 'var(--success)' }}>
          ✅ Assinatura concluída!
        </p>
        <p className="step-desc" style={{ textAlign: 'center', marginBottom: 20 }}>
          Documento assinado com sucesso. Abaixo estão todos os dados registrados para fins de comprovação.
        </p>

        {selfieBase64 && (
          <div className="selfie-oval-wrapper">
            <img src={selfieBase64} alt="Selfie capturada" className="selfie-oval" />
          </div>
        )}

        <div className="scrollable">
          <Section title="Assinante">
            <DataRow label="Nome" value={data.signerName} />
            <DataRow label="CPF" value={data.signerCpf} />
            <DataRow label="E-mail" value={data.signerEmail} />
          </Section>

          <Section title="Documento">
            <DataRow label="Data/hora UTC" value={data.timestamp} />
            <DataRow label="Selfie capturada" value={data.selfieTimestamp} />
            <div className="data-row">
              <span className="data-key">Hash SHA-256</span>
              <span className="data-value receipt-hash">{data.documentHash}</span>
            </div>
          </Section>

          <Section title="Localização GPS">
            <DataRow label="GPS lat/lng" value={data.gpsLatitude && `${data.gpsLatitude?.toFixed(6)}, ${data.gpsLongitude?.toFixed(6)}`} />
            <DataRow label="Precisão GPS" value={data.gpsAccuracy && `±${data.gpsAccuracy}m`} />
            <DataRow label="Geoloc. negada" value={data.geoDenied} />
          </Section>

          <Section title="Rede / IP">
            <DataRow label="IP" value={data.ip} />
            <DataRow label="Cidade" value={data.city} />
            <DataRow label="Estado" value={data.region} />
            <DataRow label="País" value={data.country} />
            <DataRow label="Org./ISP" value={data.org} />
            <DataRow label="ASN" value={data.asn} />
            <DataRow label="Fuso (IP)" value={data.timezone} />
          </Section>

          <Section title="Dispositivo">
            <DataRow label="Plataforma" value={data.platform} />
            <DataRow label="Idioma" value={data.language} />
            <DataRow label="Memória RAM" value={data.deviceMemory && `${data.deviceMemory} GB`} />
            <DataRow label="Núcleos CPU" value={data.hardwareConcurrency} />
            <DataRow label="Touch points" value={data.maxTouchPoints} />
            <DataRow label="On-line" value={data.onLine} />
            <DataRow label="Cookies ativos" value={data.cookiesEnabled} />
            <DataRow label="Do Not Track" value={data.doNotTrack} />
          </Section>

          <Section title="Tela">
            <DataRow label="Resolução" value={data.screenWidth && `${data.screenWidth}×${data.screenHeight}`} />
            <DataRow label="Disponível" value={data.screenAvailWidth && `${data.screenAvailWidth}×${data.screenAvailHeight}`} />
            <DataRow label="Profundidade cor" value={data.screenColorDepth && `${data.screenColorDepth} bits`} />
            <DataRow label="Pixel ratio" value={data.devicePixelRatio} />
            <DataRow label="Fuso (local)" value={data.timezone} />
            <DataRow label="Offset fuso" value={data.timezoneOffset !== undefined && `UTC${data.timezoneOffset > 0 ? `-${data.timezoneOffset / 60}` : `+${Math.abs(data.timezoneOffset) / 60}`}`} />
          </Section>

          <Section title="Fingerprint">
            <DataRow label="Visitor ID" value={data.visitorId} />
            <DataRow label="Canvas hash" value={data.canvasHash?.slice(0, 32) + '...'} />
            <DataRow label="WebGL vendor" value={data.webglVendor} />
            <DataRow label="WebGL renderer" value={data.webglRenderer} />
            <DataRow label="Áudio fp." value={data.audioFingerprint} />
          </Section>

          {data.battery && (
            <Section title="Bateria">
              <DataRow label="Nível" value={`${data.battery.level}%`} />
              <DataRow label="Carregando" value={data.battery.charging} />
            </Section>
          )}

          <Section title="Plugins">
            <DataRow label="Plugins" value={data.plugins?.length ? data.plugins : 'Nenhum detectado'} />
          </Section>

          <Section title="User Agent completo">
            <div className="data-row">
              <span className="data-value receipt-hash" style={{ minWidth: 0 }}>{data.userAgent}</span>
            </div>
          </Section>
        </div>
      </div>

      <div className="card-footer" style={{ flexDirection: 'column', gap: 8 }}>
        <button className="btn btn-success" onClick={() => downloadJson({ ...data, selfieBase64: selfieBase64 ? '[base64 omitido — presente no JSON completo]' : null, selfieBase64Full: selfieBase64 })}>
          ⬇️ Baixar comprovante JSON
        </button>
        <p style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center' }}>
          Este arquivo contém todos os dados da assinatura, incluindo a selfie em base64.
        </p>
      </div>
    </>
  )
}
