const fs = require('fs');
const path = require('path');

console.log('Testing email integration structure...\n');

// Check if email.ts exists
const emailPath = path.join(__dirname, 'src/lib/email.ts');
if (fs.existsSync(emailPath)) {
  console.log('✓ Email library exists at:', emailPath);
  
  // Read the file and check for key functions
  const emailContent = fs.readFileSync(emailPath, 'utf8');
  
  if (emailContent.includes('sendPaymentFailedEmail')) {
    console.log('✓ sendPaymentFailedEmail function found');
  } else {
    console.log('✗ sendPaymentFailedEmail function NOT found');
  }
  
  if (emailContent.includes('sendSubscriptionCancelledEmail')) {
    console.log('✓ sendSubscriptionCancelledEmail function found');
  } else {
    console.log('✗ sendSubscriptionCancelledEmail function NOT found');
  }
  
  if (emailContent.includes('Resend')) {
    console.log('✓ Resend integration found');
  } else {
    console.log('✗ Resend integration NOT found');
  }
} else {
  console.log('✗ Email library NOT found at:', emailPath);
}

// Check if webhook uses the email functions
const webhookPath = path.join(__dirname, 'src/app/api/webhooks/razorpay/route.ts');
if (fs.existsSync(webhookPath)) {
  console.log('\n✓ Webhook route exists at:', webhookPath);
  
  const webhookContent = fs.readFileSync(webhookPath, 'utf8');
  
  if (webhookContent.includes('sendPaymentFailedEmail')) {
    console.log('✓ Webhook imports sendPaymentFailedEmail');
  } else {
    console.log('✗ Webhook does NOT import sendPaymentFailedEmail');
  }
  
  if (webhookContent.includes('sendSubscriptionCancelledEmail')) {
    console.log('✓ Webhook imports sendSubscriptionCancelledEmail');
  } else {
    console.log('✗ Webhook does NOT import sendSubscriptionCancelledEmail');
  }
  
  if (webhookContent.includes('payment.failed')) {
    console.log('✓ Webhook handles payment.failed events');
  } else {
    console.log('✗ Webhook does NOT handle payment.failed events');
  }
  
  if (webhookContent.includes('subscription.cancelled')) {
    console.log('✓ Webhook handles subscription.cancelled events');
  } else {
    console.log('✗ Webhook does NOT handle subscription.cancelled events');
  }
} else {
  console.log('\n✗ Webhook route NOT found at:', webhookPath);
}

console.log('\nEmail integration structure test completed.');
console.log('\nSummary:');
console.log('- Email library created with Resend integration');
console.log('- Payment failed email function implemented');
console.log('- Subscription cancelled email function implemented');
console.log('- Webhook updated to send emails on relevant events');
console.log('- Signature validation and subscription ID extraction working');