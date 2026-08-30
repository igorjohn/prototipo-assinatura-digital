import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { IconMail, IconArrowRight, IconRefresh, IconArrowLeft } from '@tabler/icons-react'

const RESEND_DELAY = 120 // segundos

export function OtpStep({ onNext, onBack, signerData }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)
  const [resent, setResent] = useState(false)
  const [countdown, setCountdown] = useState(RESEND_DELAY)
  const [canResend, setCanResend] = useState(false)

  const email = signerData?.signerEmail ?? ''
  const maskedEmail = email
    ? email.replace(/(.{2})(.+)(@.+)/, (_, a, b, c) => a + b.replace(/./g, '*') + c)
    : ''

  useEffect(() => {
    if (canResend) return
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer)
          setCanResend(true)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [canResend])

  const mins = String(Math.floor(countdown / 60)).padStart(2, '0')
  const secs = String(countdown % 60).padStart(2, '0')

  function handleVerify() {
    if (value.length < 5) {
      setError('Digite os 5 dígitos do código')
      return
    }
    onNext({ otpVerified: true, otpCode: value })
  }

  function handleResend() {
    setValue('')
    setError(null)
    setResent(true)
    setCountdown(RESEND_DELAY)
    setCanResend(false)
    setTimeout(() => setResent(false), 2000)
  }

  return (
    <>
      <div className="p-6">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 mb-3 h-7 text-xs text-muted-foreground hover:text-foreground gap-1">
            <IconArrowLeft size={14} />
            Voltar
          </Button>
        )}
        <div className="flex items-center gap-2 mb-1">
          <IconMail size={16} className="text-primary" />
          <h2 className="text-lg font-bold text-foreground">Verificação de e-mail</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Enviamos um código de 5 dígitos para{' '}
          <span className="font-medium text-foreground">{maskedEmail}</span>.
          Digite-o abaixo para continuar.
        </p>

        <div className="flex flex-col items-center gap-3 mb-5">
          <InputOTP
            maxLength={5}
            pattern={REGEXP_ONLY_DIGITS}
            value={value}
            onChange={v => { setValue(v); setError(null) }}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
            </InputOTPGroup>
          </InputOTP>
          {error && <p className="text-xs text-destructive">{error}</p>}

          {!canResend ? (
            <p className="text-[12px] text-muted-foreground">
              Reenviar e-mail em:{' '}
              <span className="font-mono font-medium text-foreground">{mins}:{secs}</span>
            </p>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1.5"
              onClick={handleResend}
            >
              <IconRefresh size={13} />
              {resent ? 'Código reenviado!' : 'Reenviar código'}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 text-[12px] text-muted-foreground">
          <IconMail size={12} className="flex-shrink-0" />
          <span>
            <span className="font-medium">Modo demonstração:</span> qualquer código de 5 dígitos é aceito.
          </span>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border">
        <Button className="w-full" size="lg" onClick={handleVerify} disabled={value.length < 5}>
          Verificar código
          <IconArrowRight size={16} />
        </Button>
      </div>
    </>
  )
}
