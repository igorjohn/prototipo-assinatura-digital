import { useEffect, useState } from 'react'
import { collectBrowserData } from '../../lib/dataCollection'
import { collectFingerprint } from '../../lib/fingerprint'
import { CONTRACT_TEXT } from './WelcomeStep'

async function requestMotionPermission() {
  if (typeof DeviceMotionEvent === 'undefined') return 'unavailable'
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      const result = await DeviceMotionEvent.requestPermission()
      return result
    } catch {
      return 'error'
    }
  }
  return 'granted'
}

function collectMotionSample(durationMs = 2000) {
  return new Promise(resolve => {
    if (typeof DeviceMotionEvent === 'undefined') {
      resolve([])
      return
    }
    const samples = []
    const handler = (e) => {
      samples.push({
        ax: e.accelerationIncludingGravity?.x,
        ay: e.accelerationIncludingGravity?.y,
        az: e.accelerationIncludingGravity?.z,
        rotAlpha: e.rotationRate?.alpha,
        rotBeta: e.rotationRate?.beta,
        rotGamma: e.rotationRate?.gamma,
        ts: e.timeStamp,
      })
    }
    window.addEventListener('devicemotion', handler)
    setTimeout(() => {
      window.removeEventListener('devicemotion', handler)
      resolve(samples.slice(0, 60))
    }, durationMs)
  })
}

export function GeoStep({ onNext }) {
  const [browserData, setBrowserData] = useState(null)
  const [loading, setLoading] = useState(true)

  const [geoStatus, setGeoStatus] = useState('idle')
  const [geoData, setGeoData] = useState(null)

  const [motionStatus, setMotionStatus] = useState('idle')
  const [motionData, setMotionData] = useState(null)

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

  useEffect(() => {
    async function fetchData() {
      const [bData, fpData] = await Promise.all([
        collectBrowserData(CONTRACT_TEXT),
        collectFingerprint(),
      ])
      setBrowserData({ ...bData, ...fpData })
      setLoading(false)
    }
    fetchData()
  }, [])

  async function handleRequestGeo() {
    setGeoStatus('requesting')
    if (!navigator.geolocation) {
      setGeoData({ geoDenied: true, geoDenyReason: 'API não disponível' })
      setGeoStatus('unavailable')
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGeoData({
          gpsLatitude: pos.coords.latitude,
          gpsLongitude: pos.coords.longitude,
          gpsAccuracy: Math.round(pos.coords.accuracy),
          gpsAltitude: pos.coords.altitude,
          gpsTimestamp: new Date(pos.timestamp).toISOString(),
          geoDenied: false,
        })
        setGeoStatus('success')
      },
      err => {
        setGeoData({ geoDenied: true, geoDenyReason: err.message })
        setGeoStatus('denied')
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    )
  }

  async function handleRequestMotion() {
    setMotionStatus('requesting')
    const result = await requestMotionPermission()
    if (result === 'granted') {
      const samples = await collectMotionSample(2000)
      setMotionData({ motionPermission: 'granted', motionSamples: samples, motionSampleCount: samples.length })
      setMotionStatus('success')
    } else {
      setMotionData({ motionPermission: result })
      setMotionStatus('denied')
    }
  }

  const geoHandled = geoStatus !== 'idle' && geoStatus !== 'requesting'
  const motionHandled = !isIOS || (motionStatus !== 'idle' && motionStatus !== 'requesting')
  const canContinue = !loading && geoHandled && motionHandled

  function handleContinue() {
    onNext({ ...browserData, ...geoData, ...motionData })
  }

  return (
    <>
      <div className="card-body">
        <p className="step-title">Permissões necessárias</p>
        <p className="step-desc">
          Para garantir a validade jurídica da assinatura, precisamos de acesso à sua localização e aos sensores do dispositivo.
        </p>

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div className="spinner spinner-dark" />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Coletando dados do dispositivo...</span>
          </div>
        )}

        {!loading && browserData?.ip && (
          <div className="geo-card" style={{ marginBottom: 12 }}>
            <span className="geo-icon">🌐</span>
            <div>
              <p className="geo-label">IP detectado</p>
              <p className="geo-value">{browserData.ip}</p>
              {browserData.city && (
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {browserData.city}, {browserData.region} — {browserData.country}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Geo permission */}
        <div className="geo-card" style={{ marginBottom: 12, flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="geo-icon">📍</span>
            <div style={{ flex: 1 }}>
              <p className="geo-label">Localização GPS</p>
              {geoStatus === 'success' && geoData ? (
                <p className="geo-value" style={{ color: 'var(--success)' }}>
                  {geoData.gpsLatitude?.toFixed(5)}, {geoData.gpsLongitude?.toFixed(5)} (±{geoData.gpsAccuracy}m)
                </p>
              ) : geoStatus === 'denied' || geoStatus === 'unavailable' ? (
                <p style={{ fontSize: 13, color: 'var(--warning)' }}>Permissão negada — registrado como negado</p>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Necessária para registrar onde o documento foi assinado</p>
              )}
            </div>
            {geoStatus === 'success' && <span style={{ color: 'var(--success)', fontSize: 18 }}>✓</span>}
          </div>
          {geoStatus === 'idle' && !loading && (
            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={handleRequestGeo}>
              Solicitar localização
            </button>
          )}
          {geoStatus === 'requesting' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
              <div className="spinner spinner-dark" style={{ width: 14, height: 14 }} />
              Aguardando permissão...
            </div>
          )}
        </div>

        {/* Motion sensor permission (iOS only) */}
        {isIOS && (
          <div className="geo-card" style={{ marginBottom: 12, flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="geo-icon">📱</span>
              <div style={{ flex: 1 }}>
                <p className="geo-label">Sensor de movimento</p>
                {motionStatus === 'success' ? (
                  <p className="geo-value" style={{ color: 'var(--success)' }}>
                    {motionData?.motionSampleCount} amostras coletadas
                  </p>
                ) : motionStatus === 'denied' ? (
                  <p style={{ fontSize: 13, color: 'var(--warning)' }}>Permissão negada — registrado como negado</p>
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Acelerômetro e giroscópio para verificação de autenticidade</p>
                )}
              </div>
              {motionStatus === 'success' && <span style={{ color: 'var(--success)', fontSize: 18 }}>✓</span>}
            </div>
            {motionStatus === 'idle' && !loading && geoHandled && (
              <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={handleRequestMotion}>
                Solicitar sensor de movimento
              </button>
            )}
            {motionStatus === 'requesting' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                <div className="spinner spinner-dark" style={{ width: 14, height: 14 }} />
                Coletando dados do sensor (2s)...
              </div>
            )}
          </div>
        )}

        {!isIOS && !loading && (
          <div className="alert alert-info" style={{ marginBottom: 0 }}>
            <span>📱</span>
            <span>Sensor de movimento coletado automaticamente em Android e desktop.</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <button
          className="btn btn-primary"
          onClick={handleContinue}
          disabled={!canContinue}
        >
          {canContinue ? 'Continuar →' : (
            <><div className="spinner" style={{ width: 14, height: 14 }} /> Aguardando permissões...</>
          )}
        </button>
      </div>
    </>
  )
}
