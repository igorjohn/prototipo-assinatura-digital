import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { IconFingerprint, IconArrowRight, IconArrowLeft, IconLoader2, IconCheck, IconAlertTriangle, IconShieldCheck } from '@tabler/icons-react'

function bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

function hexToUint8Array(hex) {
  return new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)))
}

async function runWebAuthn(signerEmail, signerName, documentHash) {
  const regChallenge = crypto.getRandomValues(new Uint8Array(32))
  const userId = crypto.getRandomValues(new Uint8Array(16))

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: regChallenge,
      rp: { name: 'Assinador Digital', id: window.location.hostname },
      user: {
        id: userId,
        name: signerEmail || 'signatario',
        displayName: signerName || 'Signatário',
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },   // ES256 (ECDSA P-256)
        { type: 'public-key', alg: -257 },  // RS256 fallback
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'discouraged',
      },
      timeout: 60000,
      attestation: 'none',
    },
  })

  // Usa o hash do documento como challenge — vincula a assinatura ao documento
  const hashBytes = hexToUint8Array(documentHash)

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: hashBytes,
      rpId: window.location.hostname,
      allowCredentials: [{ type: 'public-key', id: credential.rawId }],
      userVerification: 'required',
      timeout: 60000,
    },
  })

  return {
    webAuthnCompleted: true,
    webAuthnTimestamp: new Date().toISOString(),
    webAuthnCredentialId: bufferToBase64(assertion.rawId),
    webAuthnSignature: bufferToBase64(assertion.response.signature),
    webAuthnAuthenticatorData: bufferToBase64(assertion.response.authenticatorData),
    webAuthnClientDataJSON: bufferToBase64(assertion.response.clientDataJSON),
  }
}

export function WebAuthnStep({ onNext, onBack, signerData }) {
  const [phase, setPhase] = useState('checking') // checking | unavailable | idle | registering | signing | success | error
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    async function check() {
      if (!window.PublicKeyCredential) { setPhase('unavailable'); return }
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        setPhase(available ? 'idle' : 'unavailable')
      } catch {
        setPhase('unavailable')
      }
    }
    check()
  }, [])

  async function handleStart() {
    setError(null)
    setPhase('registering')
    try {
      // Fase 1: registro (exibe Face ID / Touch ID pela primeira vez)
      // Fase 2: asserção com hash do documento como challenge
      // Ambas ocorrem dentro de runWebAuthn — mudamos o label visual após ~2s
      const timer = setTimeout(() => setPhase('signing'), 2200)
      const data = await runWebAuthn(
        signerData?.signerEmail,
        signerData?.signerName,
        signerData?.documentHash || '0'.repeat(64),
      )
      clearTimeout(timer)
      setResult(data)
      setPhase('success')
    } catch (err) {
      setPhase('error')
      if (err.name === 'NotAllowedError') {
        setError('Autenticação cancelada ou biometria não autorizada.')
      } else if (err.name === 'InvalidStateError') {
        setError('Já existe uma chave cadastrada para este documento. Recarregue a página.')
      } else {
        setError(err.message || 'Erro desconhecido na autenticação biométrica.')
      }
    }
  }

  function handleContinue() {
    onNext(result ?? { webAuthnCompleted: false, webAuthnSkipped: true })
  }

  function handleSkip() {
    onNext({ webAuthnCompleted: false, webAuthnSkipped: true })
  }

  const isLoading = phase === 'registering' || phase === 'signing'

  return (
    <>
      <div className="p-6">
        {onBack && phase !== 'checking' && !isLoading && (
          <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 mb-3 h-7 text-xs text-muted-foreground hover:text-foreground gap-1">
            <IconArrowLeft size={14} />
            Voltar
          </Button>
        )}

        <div className="flex items-center gap-2 mb-1">
          <IconFingerprint size={16} className="text-primary" />
          <h2 className="text-lg font-bold text-foreground">Assinatura biométrica</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Confirme sua identidade com a biometria do dispositivo para assinar criptograficamente este documento.
        </p>

        {/* Checking */}
        {phase === 'checking' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <IconLoader2 size={14} className="animate-spin" />
            Verificando suporte do dispositivo...
          </div>
        )}

        {/* Unavailable */}
        {phase === 'unavailable' && (
          <div className="rounded-lg border border-warning/40 bg-warning/10 p-4">
            <div className="flex items-start gap-2">
              <IconAlertTriangle size={15} className="text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-warning-foreground mb-1">Biometria não disponível</p>
                <p className="text-[12px] text-muted-foreground leading-snug">
                  Face ID, Touch ID ou Windows Hello não foram detectados neste dispositivo ou navegador. A etapa pode ser pulada.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Idle */}
        {phase === 'idle' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2.5 text-[12px] text-muted-foreground">
              {[
                'O dispositivo gerará um par de chaves criptográficas (ECDSA P-256) no Secure Enclave.',
                'Você será solicitado a autenticar com Face ID, Touch ID ou PIN.',
                'Após autenticar, o dispositivo assina o hash do documento com sua chave privada.',
                'A chave privada nunca sai do hardware do dispositivo.',
              ].map((txt, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[9px] font-bold text-primary">{i + 1}</span>
                  </div>
                  <span className="leading-snug">{txt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading states */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <IconFingerprint size={32} className="text-primary animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-semibold text-foreground">
                {phase === 'registering' ? 'Criando chave segura...' : 'Assinando o documento...'}
              </p>
              <p className="text-[12px] text-muted-foreground mt-1">
                {phase === 'registering'
                  ? 'Confirme com sua biometria quando solicitado.'
                  : 'Confirme novamente para assinar o documento.'}
              </p>
            </div>
          </div>
        )}

        {/* Success */}
        {phase === 'success' && result && (
          <div className="space-y-3">
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
                <IconShieldCheck size={28} className="text-success" />
              </div>
              <p className="text-[14px] font-semibold text-foreground">Assinatura criptográfica concluída</p>
            </div>
            <div className="rounded-lg border border-border bg-card px-3 py-2 space-y-1">
              <div className="flex gap-2 py-1.5 border-b border-border/50">
                <span className="text-[11px] text-muted-foreground min-w-[110px]">Credential ID</span>
                <span className="text-[10px] font-mono text-muted-foreground break-all">{result.webAuthnCredentialId.slice(0, 32)}…</span>
              </div>
              <div className="flex gap-2 py-1.5 border-b border-border/50">
                <span className="text-[11px] text-muted-foreground min-w-[110px]">Assinatura</span>
                <span className="text-[10px] font-mono text-muted-foreground break-all">{result.webAuthnSignature.slice(0, 32)}…</span>
              </div>
              <div className="flex gap-2 py-1.5">
                <span className="text-[11px] text-muted-foreground min-w-[110px]">Timestamp</span>
                <span className="text-[11px] text-foreground">{result.webAuthnTimestamp}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {phase === 'error' && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
            <div className="flex items-start gap-2">
              <IconAlertTriangle size={15} className="text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-destructive mb-1">Falha na autenticação</p>
                <p className="text-[12px] text-muted-foreground leading-snug">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-border flex flex-col gap-2">
        {phase === 'idle' && (
          <Button className="w-full" size="lg" onClick={handleStart}>
            <IconFingerprint size={16} />
            Autenticar com biometria
          </Button>
        )}
        {phase === 'error' && (
          <Button className="w-full" size="lg" onClick={handleStart}>
            Tentar novamente
          </Button>
        )}
        {phase === 'success' && (
          <Button className="w-full" size="lg" onClick={handleContinue}>
            Continuar
            <IconArrowRight size={16} />
          </Button>
        )}
        {(phase === 'unavailable' || phase === 'error') && (
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={handleSkip}>
            Pular esta etapa
          </Button>
        )}
        {phase === 'checking' && (
          <Button className="w-full" size="lg" disabled>
            <IconLoader2 size={16} className="animate-spin" />
            Verificando...
          </Button>
        )}
        {isLoading && (
          <Button className="w-full" size="lg" disabled>
            <IconLoader2 size={16} className="animate-spin" />
            Aguardando biometria...
          </Button>
        )}
      </div>
    </>
  )
}
