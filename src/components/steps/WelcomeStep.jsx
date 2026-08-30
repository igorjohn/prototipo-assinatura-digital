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
      <div className="card-body">
        <p className="step-title">Documento para assinatura</p>
        <p className="step-desc">
          Leia o documento abaixo com atenção. Ao continuar, você confirma que leu e concorda com os termos.
        </p>
        <div className="document-preview">
          <h3>Contrato de Prestação de Serviços</h3>
          {DOCUMENT_TEXT.split('\n').filter(l => l.trim()).map((line, i) => (
            <p key={i} className={line.startsWith('CLÁUSULA') ? 'clause' : ''}>
              {line.startsWith('CLÁUSULA') ? (
                <><span className="clause-title">{line.split(' - ')[0]} - </span>{line.split(' - ').slice(1).join(' - ')}</>
              ) : line}
            </p>
          ))}
        </div>

        <div className="alert alert-warning">
          <span>🔒</span>
          <div>
            <strong>Assinatura com validade jurídica.</strong> Serão coletados dados do dispositivo, localização e selfie para garantir a autenticidade desta assinatura.
          </div>
        </div>
      </div>

      <div className="card-footer">
        <button className="btn btn-primary" onClick={onNext}>
          Li e quero assinar →
        </button>
      </div>
    </>
  )
}
