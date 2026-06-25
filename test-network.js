const dns = require('dns');

console.log('📋 Testing DNS resolution...');

dns.lookup('db.assnqdrucchkyfnylctz.supabase.co', (err, address, family) => {
  if (err) {
    console.error('❌ DNS lookup failed:', err.message);
    console.log('📋 Trying alternative...');
    
    dns.lookup('aws-0-eu-central-1.pooler.supabase.com', (err2, address2, family2) => {
      if (err2) {
        console.error('❌ Both DNS lookups failed!');
        console.log('📋 This is a network/DNS issue on your machine.');
        console.log('📋 Try changing your DNS server to 8.8.8.8');
      } else {
        console.log('✅ Pooler IP resolved:', address2);
        console.log('📋 Use this IP in your DATABASE_URL');
      }
    });
  } else {
    console.log('✅ Direct IP resolved:', address);
    console.log('📋 Use this IP in your DATABASE_URL');
  }
});