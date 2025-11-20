export interface InquiryNotificationData {
  inquiryRefNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  companyName?: string;
  subject: string;
  message: string;
  productId?: string;
  productName?: string;
  productSku?: string;
  sourcePage?: string;
  inquiryUrl: string;
}

export function generateInquiryNotificationHtml(data: InquiryNotificationData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; border-radius: 5px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #555; }
    .value { margin-top: 5px; }
    .message-box { background-color: white; padding: 15px; border-left: 4px solid #0066cc; margin-top: 10px; }
    .footer { margin-top: 20px; padding: 20px; text-align: center; font-size: 12px; color: #777; }
    .button { display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Inquiry Received</h1>
      <p>Reference: ${data.inquiryRefNumber}</p>
    </div>
    
    <div class="content">
      <div class="field">
        <div class="label">Customer Name:</div>
        <div class="value">${data.customerName}</div>
      </div>
      
      <div class="field">
        <div class="label">Email:</div>
        <div class="value"><a href="mailto:${data.customerEmail}">${data.customerEmail}</a></div>
      </div>
      
      ${
        data.customerPhone
          ? `
      <div class="field">
        <div class="label">Phone:</div>
        <div class="value">${data.customerPhone}</div>
      </div>
      `
          : ''
      }
      
      ${
        data.companyName
          ? `
      <div class="field">
        <div class="label">Company:</div>
        <div class="value">${data.companyName}</div>
      </div>
      `
          : ''
      }
      
      <div class="field">
        <div class="label">Subject:</div>
        <div class="value">${data.subject}</div>
      </div>
      
      ${
        data.productName
          ? `
      <div class="field">
        <div class="label">Product:</div>
        <div class="value">${data.productName} ${data.productSku ? `(SKU: ${data.productSku})` : ''}</div>
      </div>
      `
          : ''
      }
      
      ${
        data.sourcePage
          ? `
      <div class="field">
        <div class="label">Source Page:</div>
        <div class="value"><a href="${data.sourcePage}">${data.sourcePage}</a></div>
      </div>
      `
          : ''
      }
      
      <div class="field">
        <div class="label">Message:</div>
        <div class="message-box">${data.message.replace(/\n/g, '<br>')}</div>
      </div>
      
      <div style="text-align: center;">
        <a href="${data.inquiryUrl}" class="button">View Inquiry</a>
      </div>
    </div>
    
    <div class="footer">
      <p>This is an automated notification. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateInquiryNotificationText(data: InquiryNotificationData): string {
  const text = `
New Inquiry Received
Reference: ${data.inquiryRefNumber}

Customer Details:
-----------------
Name: ${data.customerName}
Email: ${data.customerEmail}
${data.customerPhone ? `Phone: ${data.customerPhone}` : ''}
${data.companyName ? `Company: ${data.companyName}` : ''}

Inquiry Details:
----------------
Subject: ${data.subject}
${data.productName ? `Product: ${data.productName} ${data.productSku ? `(SKU: ${data.productSku})` : ''}` : ''}
${data.sourcePage ? `Source Page: ${data.sourcePage}` : ''}

Message:
--------
${data.message}

---
View this inquiry: ${data.inquiryUrl}

This is an automated notification.
  `.trim();

  return text;
}
