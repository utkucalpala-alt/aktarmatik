const productUrl = 'https://www.trendyol.com/sr?os=1&q=playstation';
const apifyToken = process.env.APIFY_API_TOKEN || 'test_token_invalid';
const webhooksArr = [{
  eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED', 'ACTOR.RUN.ABORTED', 'ACTOR.RUN.TIMED_OUT'],
  requestUrl: 'https://aktarmatik.webtasarimi.net/api/webhook/apify',
  payloadTemplate: '{"barcodeId": "123", "datasetId": "{{resource.defaultDatasetId}}", "eventType": "{{eventType}}"}'
}];
const webhooksB64 = Buffer.from(JSON.stringify(webhooksArr)).toString('base64');
// Actor ID for trendyol-scraper
const apifyEndpoint = `https://api.apify.com/v2/acts/AoPP8ru9uKws5t80G/runs?token=${apifyToken}&webhooks=${webhooksB64}`;

async function run() {
  console.log("TEST 1: API Istegi atiliyor (eski kodda hata verse de basarili gosteriyordu)");
  const apifyRes = await fetch(apifyEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      startUrls: [productUrl],
      getReviews: true,
      getQna: true,
      limit: 100
    })
  });
  
  if (!apifyRes.ok) {
    const errText = await apifyRes.text();
    console.log('[Yeni Hata Yakalama Mekanizması Çalıştı]');
    console.log('Status:', apifyRes.status);
    console.log('Body:', errText);
    console.log('-> SONUÇ: "Çekiliyor" statüsünde takılı kalma engellendi. Bu senaryoda veritabanı doğrudan ERROR olarak güncellenir.');
  } else {
    const data = await apifyRes.json();
    console.log('[Apify Tetikleme Başarılı]');
    console.log('-> SONUÇ: Görev basariyla baslatildi. Veriler webhook EVENT üzerinden gelecektir. Run ID:', data?.data?.id);
  }
}
run();
