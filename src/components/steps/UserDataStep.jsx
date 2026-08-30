import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, User } from 'lucide-react'

function formatCPF(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
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

export function UserDataStep({ onNext }) {
  const [fields, setFields] = useState({ name: '', cpf: '', email: '' })
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setFields(prev => ({ ...prev, [name]: name === 'cpf' ? formatCPF(value) : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  function validate() {
    const errs = {}
    if (fields.name.trim().split(' ').length < 2) errs.name = 'Informe o nome completo'
    if (!validateCPF(fields.cpf)) errs.cpf = 'CPF inválido'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = 'E-mail inválido'
    return errs
  }

  function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onNext({ signerName: fields.name, signerCpf: fields.cpf, signerEmail: fields.email })
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <User size={16} className="text-primary" />
          <h2 className="text-lg font-bold text-foreground">Seus dados</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Informe seus dados para identificação do assinante. Eles serão incluídos no comprovante de assinatura.
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
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border">
        <Button className="w-full" size="lg" onClick={handleSubmit}>
          Continuar
          <ArrowRight size={16} />
        </Button>
      </div>
    </>
  )
}
