const { sendPaymentFailedEmail, sendSubscriptionCancelledEmail } = require('./src/lib/email');

async function testEmailIntegration() {
  console.log('Testing email integration...\n');
  
  // Mock environment variables
  process.env.RESEND_API_KEY = 're_123456789'; // This will fail but shows the integration works
  
  // Test payment failed email
  console.log('1. Testing payment failed email...');
  try {
    const result1 = await sendPaymentFailedEmail('test@example.com', 'sub_123456789');
    console.log('Payment failed email result:', result1.success ? 'Success' : 'Failed');
    if (!result1.success) {
      console.log('Error:', result1.error.message);
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  console.log('\n2. Testing subscription cancelled email...');
  try {
    const result2 = await sendSubscriptionCancelledEmail('test@example.com', 'sub_123456789');
    console.log('Subscription cancelled email result:', result2.success ? 'Success' : 'Failed');
    if (!result2.success) {
      console.log('Error:', result2.error.message);
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  console.log('\nEmail integration test completed.');
}

testEmailIntegration();