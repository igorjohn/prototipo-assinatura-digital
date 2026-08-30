import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { IconWorld, IconMapPin, IconDeviceMobile, IconCheck, IconLoader2, IconArrowRight, IconAlertTriangle } from '@tabler/icons-react'
import { collectBrowserData } from '@/lib/dataCollection'
import { collectFingerprint } from '@/lib/fingerprint'
import { CONTRACT_TEXT } from './WelcomeStep'

async function requestMotionPermission() {
  if (typeof DeviceMotionEvent === 'undefined') return 'unavailable'
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    try { return await DeviceMotionEvent.requestPermission() } catch { return 'error' }
  }
  return 'granted'
}

function collectMotionSample(durationMs = 2000) {
  return new Promise(resolve => {
    if (typeof DeviceMotionEvent === 'undefined') { resolve([]); return }
    const samples = []
    const handler = (e) => samples.push({
      ax: e.accelerationIncludingGravity?.x, ay: e.accelerationIncludingGravity?.y, az: e.accelerationIncludingGravity?.z,
      rotAlpha: e.rotationRate?.alpha, rotBeta: e.rotationRate?.beta, rotGamma: e.rotationRate?.gamma, ts: e.timeStamp,
    })
    window.addEventListener('devicemotion', handler)
    setTimeout(() => { window.removeEventListener('devicemotion', handler); resolve(samples.slice(0, 60)) }, durationMs)
  })
}

function PermissionCard({ icon: Icon, label, status, value, onRequest, loading, disabled }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-background border border-border flex-shrink-0 mt-0.5">
        <Icon size={16} className="text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[13px] font-semibold text-foreground">{label}</p>
          {status === 'success' && <Badge variant="outline" className="text-success border-success/40 text-[10px] py-0 px-1.5">Concedida</Badge>}
          {(status === 'denied' || status === 'unavailable') && <Badge variant="outline" className="text-destructive border-destructive/40 text-[10px] py-0 px-1.5">Negada</Badge>}
        </div>
        {value && <p className="text-xs text-muted-foreground">{value}</p>}
        {status === 'idle' && !loading && !disabled && (
          <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={onRequest}>
            Solicitar permissão
          </Button>
        )}
        {status === 'requesting' && (
          <div className="flex items-center gap-1.5 mt-1">
            <IconLoader2 size={12} className="animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Aguardando...</span>
          </div>
        )}
      </div>
      {status === 'success' && (
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-success/10 flex-shrink-0">
          <IconCheck size={12} className="text-success" stroke={2.5} />
        </div>
      )}
    </div>
  )
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
      const [bData, fpData] = await Promise.all([collectBrowserData(CONTRACT_TEXT), collectFingerprint()])
      setBrowserData({ ...bData, ...fpData })
      setLoading(false)
    }
    fetchData()
  }, [])

  async function handleRequestGeo() {
    setGeoStatus('requesting')
    if (!navigator.geolocation) {
      setGeoData({ geoDenied: true, geoDenyReason: 'API não disponível' })
      setGeoStatus('unavailable'); return
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGeoData({ gpsLatitude: pos.coords.latitude, gpsLongitude: pos.coords.longitude, gpsAccuracy: Math.round(pos.coords.accuracy), gpsAltitude: pos.coords.altitude, gpsTimestamp: new Date(pos.timestamp).toISOString(), geoDenied: false })
        setGeoStatus('success')
      },
      err => { setGeoData({ geoDenied: true, geoDenyReason: err.message }); setGeoStatus('denied') },
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

  return (
    <>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <IconMapPin size={16} className="text-primary" />
          <h2 className="text-lg font-bold text-foreground">Permissões necessárias</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Para garantir a validade jurídica da assinatura, precisamos de acesso à sua localização e aos sensores do dispositivo.
        </p>

        <div className="space-y-3">
          {/* IP card */}
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <IconLoader2 size={14} className="animate-spin" />
              Coletando dados do dispositivo...
            </div>
          ) : browserData?.ip && (
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-background border border-border flex-shrink-0 mt-0.5">
                <IconWorld size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-foreground mb-0.5">IP detectado</p>
                <p className="text-xs font-mono text-muted-foreground">{browserData.ip}</p>
                {browserData.city && (
                  <p className="text-xs text-muted-foreground mt-0.5">{browserData.city}, {browserData.region} — {browserData.country}</p>
                )}
              </div>
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-success/10 flex-shrink-0">
                <IconCheck size={12} className="text-success" stroke={2.5} />
              </div>
            </div>
          )}

          <PermissionCard
            icon={IconMapPin}
            label="Localização GPS"
            status={geoStatus}
            value={
              geoStatus === 'success' && geoData
                ? `${geoData.gpsLatitude?.toFixed(5)}, ${geoData.gpsLongitude?.toFixed(5)} (±${geoData.gpsAccuracy}m)`
                : geoStatus === 'denied' || geoStatus === 'unavailable'
                ? 'Permissão negada — registrado como negado'
                : 'Necessária para registrar onde o documento foi assinado'
            }
            onRequest={handleRequestGeo}
            loading={loading}
          />

          {isIOS && (
            <PermissionCard
              icon={IconDeviceMobile}
              label="Sensor de movimento"
              status={motionStatus}
              value={
                motionStatus === 'success'
                  ? `${motionData?.motionSampleCount} amostras coletadas`
                  : motionStatus === 'denied'
                  ? 'Permissão negada — registrado como negado'
                  : 'Acelerômetro e giroscópio para verificação de autenticidade'
              }
              onRequest={handleRequestMotion}
              loading={loading}
              disabled={!geoHandled}
            />
          )}

          {!isIOS && !loading && (
            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
              <IconDeviceMobile size={13} className="flex-shrink-0 mt-0.5" />
              <span>Sensor de movimento coletado automaticamente em Android e desktop.</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border">
        <Button
          className="w-full"
          size="lg"
          onClick={() => onNext({ ...browserData, ...geoData, ...motionData })}
          disabled={!canContinue}
        >
          {canContinue ? (
            <><span>Continuar</span><IconArrowRight size={16} /></>
          ) : (
            <><IconLoader2 size={16} className="animate-spin" /><span>Aguardando permissões...</span></>
          )}
        </Button>
      </div>
    </>
  )
}
