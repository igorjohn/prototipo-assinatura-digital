import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { IconCircleCheck, IconDownload, IconUser, IconWorld, IconMapPin, IconDeviceDesktop, IconFingerprint, IconBattery, IconFileText } from '@tabler/icons-react'

function DataRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null
  const display = typeof value === 'boolean' ? (value ? 'Sim' : 'Não')
    : Array.isArray(value) ? value.join(', ')
    : typeof value === 'object' ? JSON.stringify(value)
    : String(value)
  return (
    <div className="flex gap-3 py-2 border-b border-border/50 last:border-0">
      <span className="text-[12px] text-muted-foreground min-w-[120px] flex-shrink-0">{label}</span>
      <span className="text-[12px] text-foreground font-medium break-all">{display}</span>
    </div>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={12} className="text-muted-foreground" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
      </div>
      <div className="rounded-lg border border-border bg-card px-3">
        {children}
      </div>
    </div>
  )
}

function downloadJson(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `comprovante-assinatura-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function ReceiptStep({ data }) {
  const { selfieBase64, ...rest } = data

  return (
    <>
      <div className="p-6">
        {/* Success header */}
        <div className="flex flex-col items-center mb-6">
          {selfieBase64 && (
            <div className="mb-4">
              <img
                src={selfieBase64}
                alt="Selfie capturada"
                className="w-[100px] h-[125px] object-cover border-[3px] border-success shadow-md"
                style={{ borderRadius: '50%' }}
              />
            </div>
          )}
          <div className="flex items-center gap-2 mb-1">
            <IconCircleCheck size={20} className="text-success" />
            <h2 className="text-lg font-bold text-foreground">Assinatura concluída!</h2>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Documento assinado com sucesso. Abaixo estão todos os dados registrados.
          </p>
          <Badge variant="outline" className="mt-3 text-success border-success/40 text-[11px]">
            Comprovante gerado
          </Badge>
        </div>

        <ScrollArea className="h-[380px] pr-1">
          <Section icon={IconUser} title="Assinante">
            <DataRow label="Nome" value={data.signerName} />
            <DataRow label="CPF" value={data.signerCpf} />
            <DataRow label="E-mail" value={data.signerEmail} />
            <DataRow label="Celular" value={data.signerPhone} />
          </Section>

          <Section icon={IconFileText} title="Documento">
            <DataRow label="Data/hora UTC" value={data.timestamp} />
            <DataRow label="Selfie capturada" value={data.selfieTimestamp} />
            <div className="flex gap-3 py-2">
              <span className="text-[12px] text-muted-foreground min-w-[120px] flex-shrink-0">Hash SHA-256</span>
              <span className="text-[10px] font-mono text-muted-foreground break-all bg-muted/50 px-2 py-1 rounded">{data.documentHash}</span>
            </div>
          </Section>

          <Section icon={IconMapPin} title="Localização GPS">
            <DataRow label="GPS lat/lng" value={data.gpsLatitude && `${data.gpsLatitude?.toFixed(6)}, ${data.gpsLongitude?.toFixed(6)}`} />
            <DataRow label="Precisão" value={data.gpsAccuracy && `±${data.gpsAccuracy}m`} />
            <DataRow label="Geoloc. negada" value={data.geoDenied} />
          </Section>

          <Section icon={IconWorld} title="Rede / IP">
            <DataRow label="IP" value={data.ip} />
            <DataRow label="Cidade" value={data.city} />
            <DataRow label="Estado" value={data.region} />
            <DataRow label="País" value={data.country} />
            <DataRow label="Org./ISP" value={data.org} />
            <DataRow label="ASN" value={data.asn} />
            <DataRow label="Fuso (IP)" value={data.timezone} />
          </Section>

          <Section icon={IconDeviceDesktop} title="Dispositivo e tela">
            <DataRow label="Plataforma" value={data.platform} />
            <DataRow label="Idioma" value={data.language} />
            <DataRow label="RAM" value={data.deviceMemory && `${data.deviceMemory} GB`} />
            <DataRow label="Núcleos CPU" value={data.hardwareConcurrency} />
            <DataRow label="Touch points" value={data.maxTouchPoints} />
            <DataRow label="On-line" value={data.onLine} />
            <DataRow label="Resolução" value={data.screenWidth && `${data.screenWidth}×${data.screenHeight}`} />
            <DataRow label="Pixel ratio" value={data.devicePixelRatio} />
            <DataRow label="Offset fuso" value={data.timezoneOffset !== undefined && `UTC${data.timezoneOffset > 0 ? `-${data.timezoneOffset / 60}` : `+${Math.abs(data.timezoneOffset) / 60}`}`} />
          </Section>

          <Section icon={IconFingerprint} title="Fingerprint">
            <DataRow label="Visitor ID" value={data.visitorId} />
            <DataRow label="Canvas hash" value={data.canvasHash?.slice(0, 32) + '...'} />
            <DataRow label="WebGL vendor" value={data.webglVendor} />
            <DataRow label="WebGL renderer" value={data.webglRenderer} />
            <DataRow label="Áudio fp." value={data.audioFingerprint} />
          </Section>

          {data.battery && (
            <Section icon={IconBattery} title="Bateria">
              <DataRow label="Nível" value={`${data.battery.level}%`} />
              <DataRow label="Carregando" value={data.battery.charging} />
            </Section>
          )}

          <Section icon={IconDeviceDesktop} title="User Agent">
            <div className="py-2">
              <p className="text-[11px] font-mono text-muted-foreground break-all">{data.userAgent}</p>
            </div>
          </Section>
        </ScrollArea>
      </div>

      <div className="px-6 py-4 border-t border-border flex flex-col gap-3">
        <Button
          className="w-full bg-success hover:bg-success/90 text-success-foreground"
          size="lg"
          onClick={() => downloadJson({ ...data, selfieBase64: selfieBase64 ? '[base64 presente no arquivo JSON]' : null, selfieBase64Full: selfieBase64 })}
        >
          <IconDownload size={16} />
          Baixar comprovante JSON
        </Button>
        <p className="text-[11px] text-muted-foreground text-center">
          Este arquivo contém todos os dados da assinatura, incluindo a selfie em base64.
        </p>
      </div>
    </>
  )
}
