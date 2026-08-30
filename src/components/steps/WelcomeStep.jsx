import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { IconFileText, IconArrowRight, IconAlertTriangle, IconX, IconArrowsMaximize, IconCheck } from '@tabler/icons-react'

const DOCUMENT_TITLE = 'Contrato de prestação de serviços — Captação e Edição de vídeo'
const DOCUMENT_SENDER = 'contato@nomedaagencia.com.br'

const DOCUMENT_TEXT = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS
Captação e Edição de Vídeo

Entre as partes identificadas no processo de assinatura, doravante denominadas CONTRATANTE e CONTRATADA, firmam o presente contrato nos termos a seguir.

CLÁUSULA 1 - OBJETO
O presente contrato tem por objeto a prestação de serviços de captação e edição de vídeos, incluindo produção, gravação, edição, motion graphics e entrega de arquivos finalizados nos formatos acordados entre as partes.

CLÁUSULA 2 - PRAZO
O contrato vigorará pelo período de 12 (doze) meses, a contar da data de assinatura, podendo ser renovado mediante acordo entre as partes.

CLÁUSULA 3 - REMUNERAÇÃO
O valor mensal acordado entre as partes será pago até o 5º dia útil de cada mês, mediante emissão de nota fiscal.

CLÁUSULA 4 - OBRIGAÇÕES DAS PARTES
O CONTRATANTE se compromete a fornecer briefings, materiais e aprovações dentro dos prazos acordados. A CONTRATADA se compromete a executar os serviços com diligência, qualidade técnica e criatividade.

CLÁUSULA 5 - DIREITOS AUTORAIS
Os arquivos entregues são de propriedade do CONTRATANTE após quitação integral do mês vigente. A CONTRATADA poderá utilizar os trabalhos em portfólio, salvo vedação expressa do CONTRATANTE.

CLÁUSULA 6 - CONFIDENCIALIDADE
As partes se comprometem a manter sigilo sobre todas as informações trocadas durante a vigência deste contrato, sob pena das sanções legais cabíveis.

CLÁUSULA 7 - FORO
Fica eleito o foro da Comarca de São Paulo, SP, para dirimir quaisquer dúvidas oriundas do presente contrato.

Ao assinar este documento eletronicamente, o signatário declara ter lido, compreendido e concordado com todos os termos e condições acima.`

export const CONTRACT_TEXT = DOCUMENT_TEXT

function ContractContent() {
  return (
    <div className="space-y-2.5 text-[13px] leading-relaxed text-foreground">
      {DOCUMENT_TEXT.split('\n').filter(l => l.trim()).map((line, i) => (
        <p
          key={i}
          className={
            line.startsWith('CLÁUSULA')
              ? 'font-semibold text-primary text-[12px] uppercase tracking-wide mt-3'
              : line === 'Captação e Edição de Vídeo'
              ? 'text-muted-foreground text-[12px]'
              : ''
          }
        >
          {line}
        </p>
      ))}
    </div>
  )
}

export function WelcomeStep({ onNext }) {
  const [agreed, setAgreed] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <>
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col p-4">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <IconFileText size={15} className="text-primary flex-shrink-0" />
              <p className="text-[13px] font-semibold text-foreground truncate">{DOCUMENT_TITLE}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 ml-2 h-8 w-8"
              onClick={() => setFullscreen(false)}
            >
              <IconX size={16} />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="pr-2 pb-6">
              <ContractContent />
            </div>
          </ScrollArea>
        </div>
      )}

      <div className="p-6">
        {/* Cabeçalho do documento */}
        <div className="flex items-start gap-3 mb-4 p-3 rounded-lg bg-muted/40 border border-border">
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-background border border-border flex-shrink-0">
            <IconFileText size={17} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2">{DOCUMENT_TITLE}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Enviado por: {DOCUMENT_SENDER}</p>
          </div>
        </div>

        {/* Área do contrato */}
        <div className="border border-border rounded-lg overflow-hidden mb-2">
          <ScrollArea className="h-[200px]">
            <div className="p-4">
              <ContractContent />
            </div>
          </ScrollArea>
        </div>

        {/* Botão tela cheia */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mb-4 h-8 text-xs gap-1.5"
          onClick={() => setFullscreen(true)}
        >
          <IconArrowsMaximize size={13} />
          Ver em tela cheia
        </Button>

        {/* Alert warning */}
        <div className="flex items-start gap-2 rounded-md border border-warning/50 bg-warning/10 px-3 py-2.5 text-[12px] mb-4">
          <IconAlertTriangle size={13} className="flex-shrink-0 text-warning mt-0.5" />
          <span className="text-warning-foreground leading-snug">
            <span className="font-semibold">Atenção:</span> ao assinar, serão coletados seu IP, localização e uma selfie com verificação biométrica facial para garantir a validade jurídica.
          </span>
        </div>

        {/* Checkbox de aceite */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <div
            className={`w-4 h-4 rounded-[4px] border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
              agreed ? 'bg-primary border-primary' : 'border-input hover:border-primary/40'
            }`}
            onClick={() => setAgreed(v => !v)}
          >
            {agreed && <IconCheck size={9} className="text-primary-foreground" stroke={3} />}
            <input
              type="checkbox"
              className="sr-only"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
            />
          </div>
          <span className="text-[12px] text-muted-foreground leading-snug">
            Declaro que li o contrato e estou de acordo com seus termos.
          </span>
        </label>
      </div>

      <div className="px-6 py-4 border-t border-border">
        <Button
          className="w-full"
          size="lg"
          onClick={onNext}
          disabled={!agreed}
        >
          Li e quero assinar
          <IconArrowRight size={16} />
        </Button>
      </div>
    </>
  )
}
