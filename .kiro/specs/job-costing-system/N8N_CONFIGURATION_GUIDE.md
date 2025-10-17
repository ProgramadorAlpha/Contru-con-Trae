# n8n Workflow Configuration Guide

## Overview

This guide explains how to configure the n8n workflow for automated expense creation from OCR-processed receipts. The workflow integrates with the ConstructPro Job Costing System via the OCR Expense API endpoint.

## Prerequisites

- n8n instance running (cloud or self-hosted)
- ConstructPro deployed and accessible
- Email account for receiving receipts
- OCR service (Google Cloud Vision, AWS Textract, or similar)

## Workflow Architecture

```
Email with Receipt
      ↓
Gmail Trigger (Monitor inbox)
      ↓
Extract Attachment
      ↓
OCR Processing (Extract text)
      ↓
Parse Data (Extract fields)
      ↓
Data Transformation
      ↓
HTTP Request to ConstructPro API
      ↓
Success/Error Notification
```

## Step-by-Step Configuration

### Step 1: Set Up Gmail Trigger

1. **Add Gmail Trigger Node**
   - Node Type: `Gmail Trigger`
   - Trigger On: `Message Received`
   - Label/Folder: `Receipts` (or your preferred label)
   - Polling Interval: `5 minutes`

2. **Configure Gmail Credentials**
   - Create OAuth2 credentials in n8n
   - Authorize access to Gmail account
   - Test connection

3. **Filter Configuration**
   - Subject contains: `Receipt`, `Invoice`, `Factura`
   - Has attachment: `Yes`
   - From: Specific suppliers (optional)

### Step 2: Extract Attachment

1. **Add Function Node**
   - Name: `Extract Attachment`
   - Code:
   ```javascript
   const attachments = $input.item.json.attachments || [];
   const imageAttachments = attachments.filter(att => 
     att.mimeType.startsWith('image/') || 
     att.mimeType === 'application/pdf'
   );
   
   if (imageAttachments.length === 0) {
     throw new Error('No image or PDF attachment found');
   }
   
   return {
     json: {
       attachment: imageAttachments[0],
       emailSubject: $input.item.json.subject,
       emailFrom: $input.item.json.from,
       emailDate: $input.item.json.date
     }
   };
   ```

### Step 3: OCR Processing

#### Option A: Google Cloud Vision API

1. **Add HTTP Request Node**
   - Name: `Google Cloud Vision OCR`
   - Method: `POST`
   - URL: `https://vision.googleapis.com/v1/images:annotate`
   - Authentication: `Generic Credential Type` → `Google Cloud Vision API`
   
2. **Request Body**
   ```json
   {
     "requests": [
       {
         "image": {
           "content": "{{$json.attachment.data}}"
         },
         "features": [
           {
             "type": "DOCUMENT_TEXT_DETECTION"
           }
         ]
       }
     ]
   }
   ```

3. **Extract Text**
   - Add Function Node: `Extract OCR Text`
   ```javascript
   const response = $input.item.json;
   const text = response.responses[0].fullTextAnnotation?.text || '';
   
   return {
     json: {
       rawText: text,
       confidence: response.responses[0].fullTextAnnotation?.pages[0]?.confidence || 0,
       emailSubject: $input.item.json.emailSubject,
       emailFrom: $input.item.json.emailFrom,
       emailDate: $input.item.json.emailDate,
       attachment: $input.item.json.attachment
     }
   };
   ```

#### Option B: AWS Textract

1. **Add AWS Textract Node**
   - Operation: `Analyze Document`
   - Feature Types: `FORMS`, `TABLES`
   - Document: `{{$json.attachment.data}}`

2. **Extract Text**
   - Similar to Google Vision, extract text from response

### Step 4: Parse Expense Data

1. **Add Function Node**
   - Name: `Parse Expense Data`
   - Code:
   ```javascript
   const text = $input.item.json.rawText;
   
   // Regular expressions for common patterns
   const amountRegex = /(?:total|amount|monto|importe)[:\s]*\$?\s*([0-9,]+\.?\d{0,2})/i;
   const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
   const invoiceRegex = /(?:invoice|factura|receipt)[#:\s]*([A-Z0-9\-]+)/i;
   
   // Extract fields
   const amountMatch = text.match(amountRegex);
   const dateMatch = text.match(dateRegex);
   const invoiceMatch = text.match(invoiceRegex);
   
   // Parse amount
   let amount = 0;
   if (amountMatch) {
     amount = parseFloat(amountMatch[1].replace(/,/g, ''));
   }
   
   // Parse date
   let date = new Date().toISOString().split('T')[0];
   if (dateMatch) {
     const parts = dateMatch[1].split(/[\/\-]/);
     if (parts.length === 3) {
       // Assume MM/DD/YYYY or DD/MM/YYYY format
       const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
       date = `${year}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
     }
   }
   
   // Extract supplier from email
   const emailFrom = $input.item.json.emailFrom;
   const supplierMatch = emailFrom.match(/<(.+?)@(.+?)>/);
   const supplier = supplierMatch ? supplierMatch[2].split('.')[0] : 'Unknown';
   
   return {
     json: {
       amount: amount,
       date: date,
       supplier: supplier,
       description: $input.item.json.emailSubject || 'Expense from email',
       invoiceNumber: invoiceMatch ? invoiceMatch[1] : null,
       rawText: text,
       confidence: $input.item.json.confidence,
       attachment: $input.item.json.attachment
     }
   };
   ```

### Step 5: Data Transformation

1. **Add Function Node**
   - Name: `Transform to ConstructPro Format`
   - Code:
   ```javascript
   const data = $input.item.json;
   
   // Transform to ConstructPro API format
   return {
     json: {
       amount: data.amount,
       currency: 'USD', // or detect from text
       date: data.date,
       supplier: data.supplier,
       description: data.description,
       invoiceNumber: data.invoiceNumber,
       ocrData: {
         rawText: data.rawText,
         extractedFields: {
           amount: data.amount,
           date: data.date,
           supplier: data.supplier,
           invoiceNumber: data.invoiceNumber
         },
         confidence: data.confidence,
         processedAt: new Date().toISOString()
       },
       attachmentData: data.attachment.data,
       attachmentName: data.attachment.filename,
       attachmentMimeType: data.attachment.mimeType,
       isAutoCreated: true,
       status: 'pending_approval'
     }
   };
   ```

### Step 6: Send to ConstructPro API

1. **Add HTTP Request Node**
   - Name: `Create Expense in ConstructPro`
   - Method: `POST`
   - URL: `https://your-domain.com/api/expenses/auto-create`
   - Authentication: `Header Auth`
     - Name: `Authorization`
     - Value: `Bearer {{$env.CONSTRUCTPRO_API_KEY}}`
   
2. **Headers**
   ```json
   {
     "Content-Type": "application/json"
   }
   ```

3. **Body**
   ```json
   {{$json}}
   ```

4. **Error Handling**
   - Enable "Continue On Fail"
   - Add error output

### Step 7: Success/Error Notifications

#### Success Notification

1. **Add IF Node**
   - Name: `Check API Response`
   - Condition: `{{$json.success}} === true`

2. **Add Slack/Email Node** (True branch)
   - Name: `Send Success Notification`
   - Message:
   ```
   ✅ Expense Created Successfully
   
   Amount: ${{$json.expense.amount}}
   Supplier: {{$json.expense.supplier}}
   Date: {{$json.expense.date}}
   Status: Pending Approval
   
   View in ConstructPro: https://your-domain.com/expense-approvals
   ```

#### Error Notification

1. **Add Slack/Email Node** (False branch)
   - Name: `Send Error Notification`
   - Message:
   ```
   ❌ Expense Creation Failed
   
   Error: {{$json.error}}
   
   Please review manually:
   - Email Subject: {{$json.emailSubject}}
   - Amount: ${{$json.amount}}
   - Supplier: {{$json.supplier}}
   ```

## Environment Variables

Configure these in n8n:

```bash
# ConstructPro API
CONSTRUCTPRO_API_URL=https://your-domain.com/api
CONSTRUCTPRO_API_KEY=your-api-key-here

# OCR Service (if using Google Cloud Vision)
GOOGLE_CLOUD_VISION_API_KEY=your-google-api-key

# Notification Services
SLACK_WEBHOOK_URL=your-slack-webhook-url
NOTIFICATION_EMAIL=admin@your-domain.com
```

## Testing the Workflow

### Test Data

Send a test email with this sample receipt:

```
ACME Hardware Store
123 Main Street
Invoice #: INV-2024-001

Date: 01/15/2024

Items:
- Cement bags (10) ......... $150.00
- Steel rebar ............... $280.00
- Tools rental .............. $70.00

Subtotal: $500.00
Tax (10%): $50.00
TOTAL: $550.00

Thank you for your business!
```

### Verification Steps

1. **Check n8n Execution Log**
   - Verify workflow triggered
   - Check each node executed successfully
   - Review extracted data

2. **Check ConstructPro**
   - Go to Expense Approvals page
   - Verify expense appears with status "Pending Approval"
   - Check OCR data is attached
   - Verify attachment is uploaded

3. **Test Error Handling**
   - Send email without attachment → Should fail gracefully
   - Send email with invalid data → Should create expense with low confidence
   - Send malformed request → Should trigger error notification

## Monitoring & Maintenance

### Daily Monitoring

- Check n8n execution history
- Review failed executions
- Monitor API error rates
- Check notification logs

### Weekly Review

- Review OCR accuracy
- Adjust parsing rules if needed
- Update supplier mappings
- Optimize workflow performance

### Monthly Maintenance

- Update OCR patterns for new suppliers
- Review and improve data extraction rules
- Check API usage and costs
- Update documentation

## Troubleshooting

### Common Issues

#### Issue: OCR not extracting data correctly
**Solution:**
- Improve image quality (ask suppliers for better scans)
- Adjust OCR confidence threshold
- Add more regex patterns for different formats
- Use machine learning for better extraction

#### Issue: API requests failing
**Solution:**
- Check API key is valid
- Verify API endpoint URL
- Check request format matches API specification
- Review API error logs in Vercel

#### Issue: Duplicate expenses created
**Solution:**
- Add deduplication logic (check invoice number)
- Implement idempotency key
- Add email message ID tracking

#### Issue: Wrong supplier detected
**Solution:**
- Create supplier mapping table
- Use email domain for supplier detection
- Add manual supplier override option

## Advanced Features

### Auto-Classification

Add logic to automatically assign:
- Project (based on supplier or keywords)
- Cost Code (based on description)
- Approval workflow (based on amount)

```javascript
// Example auto-classification
function autoClassify(expense) {
  // Project assignment
  if (expense.supplier.includes('ACME')) {
    expense.projectId = 'project-123';
  }
  
  // Cost code assignment
  if (expense.description.includes('cement') || expense.description.includes('concrete')) {
    expense.costCodeId = 'cost-code-foundation';
  }
  
  // Approval routing
  if (expense.amount > 1000) {
    expense.requiresManagerApproval = true;
  }
  
  return expense;
}
```

### Confidence Scoring

Implement confidence scoring for OCR results:

```javascript
function calculateConfidence(ocrData) {
  let score = ocrData.confidence || 0;
  
  // Reduce score if critical fields missing
  if (!ocrData.amount) score *= 0.5;
  if (!ocrData.date) score *= 0.8;
  if (!ocrData.supplier) score *= 0.9;
  
  // Increase score if invoice number found
  if (ocrData.invoiceNumber) score *= 1.1;
  
  return Math.min(score, 1.0);
}
```

### Batch Processing

Process multiple receipts from a single email:

```javascript
// Extract all attachments
const attachments = $input.item.json.attachments.filter(att => 
  att.mimeType.startsWith('image/') || att.mimeType === 'application/pdf'
);

// Process each attachment
return attachments.map(attachment => ({
  json: {
    attachment: attachment,
    emailSubject: $input.item.json.subject,
    emailFrom: $input.item.json.from
  }
}));
```

## Security Considerations

1. **API Key Management**
   - Store API keys in n8n credentials
   - Rotate keys regularly
   - Use environment-specific keys

2. **Data Privacy**
   - Ensure OCR service complies with data protection laws
   - Don't log sensitive data
   - Implement data retention policies

3. **Access Control**
   - Restrict n8n workflow access
   - Use role-based permissions
   - Audit workflow changes

## Performance Optimization

1. **Reduce API Calls**
   - Batch process when possible
   - Cache supplier mappings
   - Use webhooks instead of polling

2. **Improve OCR Speed**
   - Resize images before OCR
   - Use faster OCR service for simple receipts
   - Implement parallel processing

3. **Error Recovery**
   - Implement retry logic with exponential backoff
   - Queue failed requests for manual review
   - Send alerts for repeated failures

## Success Metrics

Track these metrics to measure workflow effectiveness:

- **Automation Rate**: % of expenses created automatically
- **Accuracy Rate**: % of expenses with correct data
- **Processing Time**: Average time from email to expense creation
- **Error Rate**: % of failed workflow executions
- **Manual Review Rate**: % of expenses requiring manual correction

## Support & Resources

- n8n Documentation: https://docs.n8n.io
- ConstructPro API Reference: `docs/API_REFERENCE.md`
- n8n Workflow Template: `docs/n8n-ocr-expense-workflow.json`
- Community Forum: [Your support channel]

---

**Last Updated:** 2024-01-15  
**Version:** 1.0.0  
**Status:** Production Ready
