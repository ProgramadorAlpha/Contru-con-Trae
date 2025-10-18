# Guía de Deployment - Funcionalidades IA

## 📋 Pre-requisitos

### Cuentas y Servicios
- [ ] Cuenta de Anthropic con API key
- [ ] Créditos suficientes en cuenta de Anthropic
- [ ] Storage configurado (S3, Azure Blob, o local)
- [ ] Base de datos PostgreSQL/MySQL
- [ ] Servidor Node.js o Python

### Variables de Entorno

Crear archivo `.env` en el backend:

```env
# Claude API
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Storage
STORAGE_TYPE=s3  # s3, azure, local
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_BUCKET_NAME=constructpro-receipts
AWS_REGION=us-east-1

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/constructpro

# Rate Limiting
RATE_LIMIT_WINDOW=3600  # 1 hora en segundos
RATE_LIMIT_MAX_REQUESTS=100

# Security
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=your-encryption-key
```

Crear archivo `.env` en el frontend:

```env
VITE_API_URL=https://api.constructpro.com
VITE_ANTHROPIC_API_KEY=  # Dejar vacío, se usa desde backend
```

---

## 🗄️ Base de Datos

### Migraciones SQL

#### 1. Tabla de Logs de IA

```sql
CREATE TABLE ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  feature VARCHAR(50) NOT NULL,  -- 'chat', 'voice', 'receipt_scan', etc.
  action VARCHAR(100) NOT NULL,
  input_data JSONB,
  output_data JSONB,
  confidence DECIMAL(3,2),
  processing_time INTEGER,  -- en milisegundos
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_ai_logs_user_id (user_id),
  INDEX idx_ai_logs_feature (feature),
  INDEX idx_ai_logs_created_at (created_at)
);
```

#### 2. Tabla de Alertas IA

```sql
CREATE TABLE ai_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,  -- 'contract_expiring', 'permit_renewal', etc.
  severity VARCHAR(20) NOT NULL,  -- 'low', 'medium', 'high', 'critical'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  document_id UUID REFERENCES documents(id),
  project_id UUID REFERENCES projects(id),
  due_date TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_ai_alerts_type (type),
  INDEX idx_ai_alerts_severity (severity),
  INDEX idx_ai_alerts_is_read (is_read)
);
```

#### 3. Tabla de Conversaciones IA

```sql
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  messages JSONB NOT NULL,  -- Array de mensajes
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_ai_conversations_user_id (user_id)
);
```

---

## 🚀 Backend Deployment

### Opción 1: Node.js/Express

#### Instalación de Dependencias

```bash
npm install @anthropic-ai/sdk express multer sharp aws-sdk
```

#### Estructura de Archivos

```
backend/
├── src/
│   ├── routes/
│   │   └── claude.routes.js
│   ├── controllers/
│   │   └── claude.controller.js
│   ├── services/
│   │   ├── claude.service.js
│   │   ├── storage.service.js
│   │   └── analytics.service.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── rateLimit.middleware.js
│   └── app.js
└── package.json
```

#### Ejemplo de Implementación

```javascript
// src/services/claude.service.js
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function analyzeReceipt(imageBase64) {
  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL,
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: imageBase64
          }
        },
        {
          type: 'text',
          text: `Analiza este recibo y extrae los siguientes datos en formato JSON:
          {
            "total": número,
            "date": "YYYY-MM-DD",
            "supplier": "nombre del proveedor",
            "items": ["item1", "item2"],
            "rfc": "RFC si está visible",
            "invoiceNumber": "número de factura"
          }`
        }
      ]
    }]
  });

  return JSON.parse(response.content[0].text);
}

// src/controllers/claude.controller.js
export async function handleAnalyzeReceipt(req, res) {
  try {
    const { image, projectContext } = req.body;
    
    // Analizar con Claude
    const extractedData = await analyzeReceipt(image);
    
    // Sugerir categoría
    const suggestedCategory = categorizePurchase(extractedData.items);
    
    // Log de uso
    await logAIUsage({
      userId: req.user.id,
      feature: 'receipt_scan',
      action: 'analyze_receipt',
      inputData: { imageSize: image.length },
      outputData: extractedData,
      confidence: 0.9,
      processingTime: Date.now() - req.startTime
    });
    
    res.json({
      extractedData,
      suggestedCategory,
      confidence: 0.9
    });
  } catch (error) {
    console.error('Error analyzing receipt:', error);
    res.status(500).json({ error: error.message });
  }
}

// src/routes/claude.routes.js
import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { rateLimitAI } from '../middleware/rateLimit.middleware.js';
import * as claudeController from '../controllers/claude.controller.js';

const router = express.Router();

router.post('/chat', authenticate, rateLimitAI, claudeController.handleChat);
router.post('/analyze-receipt', authenticate, rateLimitAI, claudeController.handleAnalyzeReceipt);
router.post('/voice-to-text', authenticate, rateLimitAI, claudeController.handleVoiceToText);
router.post('/semantic-search', authenticate, claudeController.handleSemanticSearch);
router.post('/categorize-document', authenticate, claudeController.handleCategorizeDocument);

export default router;
```

#### Rate Limiting

```javascript
// src/middleware/rateLimit.middleware.js
import rateLimit from 'express-rate-limit';

export const rateLimitAI = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS),
  message: 'Demasiadas solicitudes, por favor intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: req.rateLimit.resetTime
    });
  }
});
```

### Opción 2: Python/FastAPI

#### Instalación de Dependencias

```bash
pip install anthropic fastapi uvicorn python-multipart boto3 pillow
```

#### Ejemplo de Implementación

```python
# app/services/claude_service.py
from anthropic import Anthropic
import os
import json

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

async def analyze_receipt(image_base64: str):
    response = client.messages.create(
        model=os.getenv("ANTHROPIC_MODEL"),
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/jpeg",
                        "data": image_base64
                    }
                },
                {
                    "type": "text",
                    "text": """Analiza este recibo y extrae los datos en JSON:
                    {
                        "total": float,
                        "date": "YYYY-MM-DD",
                        "supplier": str,
                        "items": [str],
                        "rfc": str,
                        "invoiceNumber": str
                    }"""
                }
            ]
        }]
    )
    
    return json.loads(response.content[0].text)

# app/routers/claude.py
from fastapi import APIRouter, Depends, HTTPException
from app.services.claude_service import analyze_receipt
from app.middleware.auth import get_current_user
from app.middleware.rate_limit import rate_limit

router = APIRouter(prefix="/api/claude", tags=["claude"])

@router.post("/analyze-receipt")
@rate_limit(max_requests=30, window=3600)
async def analyze_receipt_endpoint(
    image: str,
    project_context: list,
    current_user = Depends(get_current_user)
):
    try:
        extracted_data = await analyze_receipt(image)
        
        # Log usage
        await log_ai_usage(
            user_id=current_user.id,
            feature="receipt_scan",
            action="analyze_receipt",
            input_data={"image_size": len(image)},
            output_data=extracted_data
        )
        
        return {
            "extractedData": extracted_data,
            "suggestedCategory": categorize_purchase(extracted_data["items"]),
            "confidence": 0.9
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 📦 Frontend Deployment

### Build para Producción

```bash
# Instalar dependencias
npm install

# Build
npm run build

# El output estará en dist/
```

### Configuración de Nginx

```nginx
server {
    listen 80;
    server_name constructpro.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name constructpro.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Frontend
    location / {
        root /var/www/constructpro/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔐 Seguridad

### SSL/TLS
```bash
# Obtener certificado con Let's Encrypt
sudo certbot --nginx -d constructpro.com
```

### Firewall
```bash
# Permitir solo puertos necesarios
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Secrets Management
```bash
# Usar AWS Secrets Manager o similar
aws secretsmanager create-secret \
  --name constructpro/anthropic-key \
  --secret-string "sk-ant-xxxxx"
```

---

## 📊 Monitoreo

### Logs

```javascript
// Winston para logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Métricas con Prometheus

```javascript
import prometheus from 'prom-client';

const aiRequestDuration = new prometheus.Histogram({
  name: 'ai_request_duration_seconds',
  help: 'Duration of AI requests in seconds',
  labelNames: ['feature', 'status']
});

const aiRequestTotal = new prometheus.Counter({
  name: 'ai_requests_total',
  help: 'Total number of AI requests',
  labelNames: ['feature']
});
```

### Alertas

```yaml
# alertmanager.yml
route:
  receiver: 'team-email'
  
receivers:
  - name: 'team-email'
    email_configs:
      - to: 'dev@constructpro.com'
        from: 'alerts@constructpro.com'
        
# Reglas de alerta
groups:
  - name: ai_features
    rules:
      - alert: HighAIErrorRate
        expr: rate(ai_requests_total{status="error"}[5m]) > 0.05
        annotations:
          summary: "High error rate in AI features"
```

---

## 🧪 Testing en Producción

### Smoke Tests

```bash
# Test chat endpoint
curl -X POST https://api.constructpro.com/api/claude/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola", "context": {}}'

# Test receipt analysis
curl -X POST https://api.constructpro.com/api/claude/analyze-receipt \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"image": "base64...", "projectContext": []}'
```

### Load Testing

```bash
# Usar k6 para load testing
k6 run load-test.js
```

```javascript
// load-test.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  let response = http.post(
    'https://api.constructpro.com/api/claude/chat',
    JSON.stringify({ message: 'Test', context: {} }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 5s': (r) => r.timings.duration < 5000,
  });
}
```

---

## 🔄 CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy AI Features

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - uses: actions/upload-artifact@v2
        with:
          name: dist
          path: dist/
          
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v2
      - name: Deploy to server
        run: |
          scp -r dist/* user@server:/var/www/constructpro/
          ssh user@server 'sudo systemctl restart nginx'
```

---

## 📋 Checklist de Deployment

### Pre-deployment
- [ ] Variables de entorno configuradas
- [ ] Base de datos migrada
- [ ] API key de Anthropic válida
- [ ] Storage configurado
- [ ] SSL/TLS configurado
- [ ] Firewall configurado
- [ ] Backups configurados

### Deployment
- [ ] Build exitoso
- [ ] Tests pasando
- [ ] Deploy a staging
- [ ] Smoke tests en staging
- [ ] Deploy a producción
- [ ] Smoke tests en producción

### Post-deployment
- [ ] Monitoreo activo
- [ ] Alertas configuradas
- [ ] Logs funcionando
- [ ] Métricas recolectándose
- [ ] Documentación actualizada
- [ ] Equipo notificado

---

## 🆘 Troubleshooting

### Error: "Claude API key invalid"
```bash
# Verificar API key
echo $ANTHROPIC_API_KEY

# Probar directamente
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

### Error: "Rate limit exceeded"
- Verificar límites en dashboard de Anthropic
- Ajustar rate limiting en backend
- Implementar cola de requests

### Error: "Image too large"
```javascript
// Comprimir imagen antes de enviar
import sharp from 'sharp';

const compressed = await sharp(imageBuffer)
  .resize(1920, 1080, { fit: 'inside' })
  .jpeg({ quality: 80 })
  .toBuffer();
```

---

## 📞 Soporte

- **Documentación**: https://docs.constructpro.com
- **Email**: dev@constructpro.com
- **Slack**: #ai-features
- **On-call**: +52 xxx xxx xxxx

---

**Última actualización**: 2024-01-18
**Versión**: 1.0.0
