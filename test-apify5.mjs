import { fetch } from 'undici';
import fs from 'fs';
const apifyToken = process.env.APIFY_API_TOKEN || 'test';
const barcodeId = "123";
const webhooksArr = [{
  eventTypes: ["ACTOR.RUN.SUCCEEDED", "ACTOR.RUN.FAILED", "ACTOR.RUN.ABORTED", "ACTOR.RUN.TIMED_OUT"],
  requestUrl: "https://aktarmatik.webtasarimi.net/api/webhook/apify",
  payloadTemplate: `{"barcodeId": "${barcodeId}", "datasetId": "{{resource.defaultDatasetId}}", "eventType": "{{eventType}}"}`
}];
const webhooksB64 = Buffer.from(JSON.stringify(webhooksArr)).toString('base64');
const apifyEndpoint = `https://api.apify.com/v2/acts/AoPP8ru9uKws5t80G/runs?token=${apifyToken}&webhooks=${webhooksB64}`;
fetch(apifyEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      startUrls: ["https://www.trendyol.com/sr?q=123"]
    })
})
.then(async res => {
   const t = await res.text();
   fs.writeFileSync('out4.txt', JSON.stringify({status: res.status, body: JSON.parse(t)}, null, 2), 'utf8');
})
.catch(console.error);
