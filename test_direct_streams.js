async function testDirectLinks() {
  console.log('Testing direct MP4 extractors...');

  // 1. YouTube to direct MP4
  const ytUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  try {
    const vkr = await fetch(`https://api.vkrdownloader.com/server?vkr=${encodeURIComponent(ytUrl)}`);
    const d = await vkr.json();
    console.log('VKR YT direct downloads:', d.data?.downloads?.length || (d.data?.url ? '1 direct url' : 'none'));
  } catch(e) {
    console.log('VKR error:', e.message);
  }

  // 2. TikTok direct MP4
  const ttUrl = 'https://www.tiktok.com/@tiktok/video/7106594312292453678';
  try {
    const ttRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(ttUrl)}&hd=1`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const tt = await ttRes.json();
    console.log('TikTok direct play URL:', tt.data?.play || tt.data?.hdplay || 'none');
  } catch(e) {
    console.log('TikTok error:', e.message);
  }

  // 3. Pinterest 4K
  const pinUrl = 'https://www.pinterest.com/pin/18507048459461108/';
  try {
    const pinRes = await fetch(pinUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await pinRes.text();
    const match = html.match(/https:\/\/i\.pinimg\.com\/(?:originals|\d+x)\/[a-zA-Z0-9_\-\/]+\.(?:jpg|png|webp)/g);
    console.log('Pinterest 4K direct image URL:', match ? match[0].replace(/\/\d+x\//, '/originals/') : 'none');
  } catch(e) {
    console.log('Pinterest error:', e.message);
  }
}

testDirectLinks();
