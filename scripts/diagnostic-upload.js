// Simple diagnostic script to check network fetch and Supabase REST connectivity
// Usage: node scripts/diagnostic-upload.js <photoUrl>

const supabaseUrl = 'https://tvmqkondihsomlebizjj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2bXFrb25kaWhzb21sZWJpempqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTQ0NjcsImV4cCI6MjA2OTI3MDQ2N30.W1fSD_RLJjcsIoJhJDnE6Xri9AIxv5DuAlN65iqI6BE';

async function testPhotoFetch(photoUrl) {
  console.log('\n== Photo fetch test ==');
  try {
    const res = await fetch(photoUrl);
    console.log('fetch status:', res.status, res.statusText);
    const size = res.headers.get('content-length');
    console.log('content-length header:', size);
    // Try reading small chunk
    const buffer = await res.arrayBuffer();
    console.log('fetched bytes:', buffer.byteLength);
    return { ok: true };
  } catch (err) {
    console.error('photo fetch error:', err.message || err);
    return { ok: false, error: err };
  }
}

async function testSupabaseRest() {
  console.log('\n== Supabase REST test (fims_categories) ==');
  try {
    const url = `${supabaseUrl}/rest/v1/fims_categories?select=*&limit=1`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Accept: 'application/json',
      },
    });
    console.log('supabase rest status:', res.status, res.statusText);
    const body = await res.text();
    console.log('response body (truncated):', body ? body.substring(0, 200) : '');
    return { ok: true };
  } catch (err) {
    console.error('supabase REST error:', err.message || err);
    return { ok: false, error: err };
  }
}

async function main() {
  const photoUrl = process.argv[2] || 'https://via.placeholder.com/150';
  console.log('Photo URL:', photoUrl);

  const photoResult = await testPhotoFetch(photoUrl);
  const supabaseResult = await testSupabaseRest();

  console.log('\n== Summary ==');
  console.log('photo fetch ok:', photoResult.ok);
  console.log('supabase rest ok:', supabaseResult.ok);
}

main().catch(e => {
  console.error('diagnostic script error:', e);
  process.exit(1);
});
