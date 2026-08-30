import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, ArrowRight, FileText } from 'lucide-react'

const DOCUMENT_TEXT = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DIGITAIS

Entre as partes identificadas no processo de assinatura, doravante denominadas CONTRATANTE e CONTRATADA, firmam o presente contrato nos termos a seguir.

CLÁUSULA 1 - OBJETO
O presente contrato tem por objeto a prestação de serviços de consultoria digital, incluindo análise de dados, desenvolvimento de soluções tecnológicas e suporte técnico especializado.

CLÁUSULA 2 - PRAZO
O contrato vigorará pelo período de 12 (doze) meses, a contar da data de assinatura, podendo ser renovado mediante acordo entre as partes.

CLÁUSULA 3 - REMUNERAÇÃO
O valor mensal acordado entre as partes será pago até o 5º dia útil de cada mês, mediante emissão de nota fiscal.

CLÁUSULA 4 - OBRIGAÇÕES DAS PARTES
O CONTRATANTE se compromete a fornecer todas as informações necessárias para a execução dos serviços. A CONTRATADA se compromete a executar os serviços com diligência e qualidade.

CLÁUSULA 5 - CONFIDENCIALIDADE
As partes se comprometem a manter sigilo sobre todas as informações trocadas durante a vigência deste contrato, sob pena das sanções legais cabíveis.

CLÁUSULA 6 - FORO
Fica eleito o foro da Comarca de São Paulo, SP, para dirimir quaisquer dúvidas oriundas do presente contrato.

Ao assinar este documento eletronicamente, o signatário declara ter lido, compreendido e concordado com todos os termos e condições acima.`

export const CONTRACT_TEXT = DOCUMENT_TEXT

export function WelcomeStep({ onNext }) {
  return (
    <>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={16} className="text-primary" />
          <h2 className="text-lg font-bold text-foreground">Documento para assinatura</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Leia o documento abaixo com atenção. Ao continuar, você confirma que leu e concorda com os termos.
        </p>

        <div className="border border-border rounded-lg overflow-hidden mb-4">
          <div className="bg-muted/50 px-4 py-2.5 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contrato de Prestação de Serviços</p>
          </div>
          <ScrollArea className="h-[280px]">
            <div className="p-4 space-y-2.5 text-[13px] leading-relaxed text-foreground">
              {DOCUMENT_TEXT.split('\n').filter(l => l.trim()).map((line, i) => (
                <p key={i} className={line.startsWith('CLÁUSULA') ? 'font-semibold text-primary text-[12px] uppercase tracking-wide mt-3' : ''}>
                  {line}
                </p>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Alert className="border-warning/30 bg-warning/10">
          <Shield size={14} className="text-warning-foreground" />
          <AlertDescription className="text-warning-foreground text-[13px]">
            <span className="font-semibold">Assinatura com validade jurídica.</span> Serão coletados dados do dispositivo, localização e selfie para garantir a autenticidade desta assinatura.
          </AlertDescription>
        </Alert>
      </div>

      <div className="px-6 py-4 border-t border-border">
        <Button className="w-full" size="lg" onClick={onNext}>
          Li e quero assinar
          <ArrowRight size={16} />
        </Button>
      </div>
    </>
  )
}
