import { useState } from 'react'

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
      <div className="card-body">
        <p className="step-title">Seus dados</p>
        <p className="step-desc">
          Informe seus dados para identificação do assinante. Eles serão incluídos no comprovante de assinatura.
        </p>

        <div className="form-group">
          <label className="form-label">Nome completo</label>
          <input
            className={`form-input${errors.name ? ' error' : ''}`}
            name="name"
            value={fields.name}
            onChange={handleChange}
            placeholder="Ex.: Maria da Silva Santos"
            autoComplete="name"
          />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">CPF</label>
          <input
            className={`form-input${errors.cpf ? ' error' : ''}`}
            name="cpf"
            value={fields.cpf}
            onChange={handleChange}
            placeholder="000.000.000-00"
            inputMode="numeric"
          />
          {errors.cpf && <p className="form-error">{errors.cpf}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">E-mail</label>
          <input
            className={`form-input${errors.email ? ' error' : ''}`}
            name="email"
            type="email"
            value={fields.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            autoComplete="email"
          />
          {errors.email && <p className="form-error">{errors.email}</p>}
        </div>
      </div>

      <div className="card-footer">
        <button className="btn btn-primary" onClick={handleSubmit}>
          Continuar →
        </button>
      </div>
    </>
  )
}
