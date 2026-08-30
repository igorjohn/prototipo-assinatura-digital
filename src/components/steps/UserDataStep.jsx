import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconArrowRight, IconUser, IconArrowLeft } from '@tabler/icons-react'

function formatCPF(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function formatPhone(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function validateCPF(cpf) {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let rem = (sum * 10) % 11
  if (rem === 10 || rem === 11) rem = 0
  if (rem !== parseInt(digits[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  rem = (sum * 10) % 11
  if (rem === 10 || rem === 11) rem = 0
  return rem === parseInt(digits[10])
}

export function UserDataStep({ onNext, onBack, initialData }) {
  const [fields, setFields] = useState({
    name:  initialData?.signerName  || '',
    cpf:   initialData?.signerCpf   || '',
    email: initialData?.signerEmail || '',
    phone: initialData?.signerPhone || '',
  })
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    let formatted = value
    if (name === 'cpf') formatted = formatCPF(value)
    if (name === 'phone') formatted = formatPhone(value)
    setFields(prev => ({ ...prev, [name]: formatted }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  function validate() {
    const errs = {}
    if (fields.name.trim().split(' ').length < 2) errs.name = 'Informe o nome completo'
    if (!validateCPF(fields.cpf)) errs.cpf = 'CPF inválido'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = 'E-mail inválido'
    const phoneDigits = fields.phone.replace(/\D/g, '')
    if (phoneDigits.length < 10 || phoneDigits.length > 11) errs.phone = 'Celular inválido'
    return errs
  }

  function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onNext({
      signerName: fields.name,
      signerCpf: fields.cpf,
      signerEmail: fields.email,
      signerPhone: fields.phone,
    })
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
          <IconUser size={16} className="text-primary" />
          <h2 className="text-lg font-bold text-foreground">Seus dados</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Informe seus dados para identificação do assinante. Eles serão incluídos no comprovante.
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              name="name"
              value={fields.name}
              onChange={handleChange}
              placeholder="Ex.: Maria da Silva Santos"
              autoComplete="name"
              className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              name="cpf"
              value={fields.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              inputMode="numeric"
              className={errors.cpf ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.cpf && <p className="text-xs text-destructive">{errors.cpf}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={fields.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              autoComplete="email"
              className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Celular</Label>
            <Input
              id="phone"
              name="phone"
              value={fields.phone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              inputMode="tel"
              autoComplete="tel"
              className={errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border">
        <Button className="w-full" size="lg" onClick={handleSubmit}>
          Continuar
          <IconArrowRight size={16} />
        </Button>
      </div>
    </>
  )
}
