import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { IconMail, IconArrowRight, IconRefresh } from '@tabler/icons-react'

export function OtpStep({ onNext, signerData }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)
  const [resent, setResent] = useState(false)

  const email = signerData?.signerEmail ?? ''
  const maskedEmail = email
    ? email.replace(/(.{2})(.+)(@.+)/, (_, a, b, c) => a + b.replace(/./g, '*') + c)
    : ''

  function handleVerify() {
    if (value.length < 5) {
      setError('Digite os 5 dígitos do código')
      return
    }
    // Accepts any 5-digit code (demo mode)
    onNext({ otpVerified: true, otpCode: value })
  }

  function handleResend() {
    setValue('')
    setError(null)
    setResent(true)
    setTimeout(() => setResent(false), 3000)
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <IconMail size={16} className="text-primary" />
          <h2 className="text-lg font-bold text-foreground">Verificação de e-mail</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Enviamos um código de 5 dígitos para{' '}
          <span className="font-medium text-foreground">{maskedEmail}</span>.
          Digite-o abaixo para continuar.
        </p>

        <div className="flex flex-col items-center gap-4 mb-6">
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
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 text-[12px] text-muted-foreground">
          <IconMail size={12} className="flex-shrink-0" />
          <span>
            <span className="font-medium">Modo demonstração:</span> qualquer código de 5 dígitos é aceito.
          </span>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border space-y-2">
        <Button className="w-full" size="lg" onClick={handleVerify} disabled={value.length < 5}>
          Verificar código
          <IconArrowRight size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={handleResend}
        >
          <IconRefresh size={13} />
          {resent ? 'Código reenviado' : 'Reenviar código'}
        </Button>
      </div>
    </>
  )
}
