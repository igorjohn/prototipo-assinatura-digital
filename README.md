# Assinador Digital — Protótipo

<div align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-default-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-deployed-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)

**Protótipo educacional de assinatura eletrônica com trilha de auditoria forense.**

[Demo ao vivo](https://prototipo-assinatura-digital.pages.dev) · [Reportar bug](https://github.com/igorjohn/prototipo-assinatura-digital/issues)

</div>

---

## Sobre o projeto

Este protótipo demonstra como uma solução de assinatura eletrônica com validade jurídica pode ser construída inteiramente no browser, sem enviar dados para um servidor. Ele coleta uma trilha de evidências abrangente para comprovar a autenticidade e o contexto da assinatura.

> **Aviso:** este é um protótipo de cunho exclusivamente educacional. Os dados coletados ficam apenas na memória do navegador e são descartados ao fechar a aba. Não há backend, banco de dados nem transmissão de informações a terceiros.

## Fluxo de assinatura

```
Documento → Dados do assinante → Permissões → Selfie KYC → Comprovante
```

| Etapa | O que acontece |
|---|---|
| **Documento** | Exibição do contrato; o assinante lê antes de prosseguir |
| **Dados** | Nome completo, CPF (com validação de dígitos) e e-mail |
| **Permissões** | IP, geolocalização GPS e sensor de movimento (iOS) |
| **Selfie** | Câmera frontal com moldura oval e detecção de rosto em tempo real |
| **Comprovante** | Resumo de toda a trilha de auditoria + download em JSON |

## Dados coletados para a trilha de auditoria

- Identidade do assinante (nome, CPF, e-mail)
- Hash SHA-256 do documento
- IP público + cidade, região, país e ISP (via ipapi.co)
- Coordenadas GPS (latitude, longitude, precisão)
- Fingerprint do navegador (FingerprintJS + canvas + WebGL + AudioContext)
- User agent, plataforma, idioma, memória RAM, núcleos de CPU
- Resolução e pixel ratio da tela
- Nível e status da bateria
- Amostras do acelerômetro e giroscópio (iOS 13+)
- Selfie capturada automaticamente quando o rosto é reconhecido na moldura

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | React 18 + Vite 5 |
| UI | shadcn/ui + Tailwind CSS 4 |
| Ícones | Lucide React |
| Detecção de rosto | @vladmandic/face-api (TinyFaceDetector) |
| Fingerprint | @fingerprintjs/fingerprintjs |
| Deploy | Cloudflare Pages (auto-deploy via GitHub Actions) |

## Como rodar localmente

**Pré-requisitos:** Node.js 20+

```bash
# Clone o repositório
git clone https://github.com/igorjohn/prototipo-assinatura-digital.git
cd prototipo-assinatura-digital

# Instale as dependências
npm install

# Rode o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173) no navegador.

## Build e deploy

```bash
# Build de produção
npm run build

# Deploy manual para Cloudflare Pages
npm run deploy
```

O deploy automático é configurado via GitHub Actions: todo push na branch `main` aciona o workflow `.github/workflows/deploy.yml`, que faz o build e publica no Cloudflare Pages.

## Estrutura do projeto

```
src/
├── components/
│   ├── steps/          # Etapas do fluxo de assinatura
│   │   ├── WelcomeStep.jsx
│   │   ├── UserDataStep.jsx
│   │   ├── GeoStep.jsx
│   │   ├── SelfieStep.jsx
│   │   └── ReceiptStep.jsx
│   └── ui/             # Componentes de interface
│       ├── OvalCamera.jsx    # Câmera KYC com overlay oval
│       └── StepIndicator.jsx
├── lib/
│   ├── dataCollection.js  # Coleta de dados do dispositivo/rede
│   ├── faceDetection.js   # Wrapper do face-api.js
│   ├── fingerprint.js     # Canvas, WebGL e audio fingerprint
│   └── utils.js           # Utilitário cn() do shadcn
└── styles/
    └── global.css         # Tailwind v4 + tokens shadcn

public/
└── models/              # Pesos do TinyFaceDetector (face-api.js)
```

## Licença

MIT — use à vontade para estudar, adaptar e apresentar como referência técnica.
