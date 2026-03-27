import { fetch } from 'undici';

const apifyToken = process.env.APIFY_API_TOKEN || 'test_token';
const barcodeId = "123";

const webhooksArr = [{
  eventTypes: ["ACTOR.RUN.SUCCEEDED", "ACTOR.RUN.FAILED", "ACTOR.RUN.ABORTED", "ACTOR.RUN.TIMED_OUT"],
  requestUrl: "https://aktarmatik.webtasarimi.net/api/webhook/apify",
  payloadTemplate: `{"barcodeId": "${barcodeId}", "datasetId": "{{resource.defaultDatasetId}}", "eventType": "{{eventType}}"}`
}];

const webhooksB64 = Buffer.from(JSON.stringify(webhooksArr)).toString('base64');
const apifyEndpoint = `https://api.apify.com/v2/acts/fatihtahta~trendyol-scraper/runs?token=${apifyToken}&webhooks=${webhooksB64}`;

console.log("Endpoint:", apifyEndpoint);
console.log("Webhooks decoded:", Buffer.from(webhooksB64, 'base64').toString('utf8'));

fetch(apifyEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      startUrls: ["https://www.trendyol.com/sr?q=123"]
    })
})
.then(async res => {
   console.log("Status:", res.status);
   console.log("Body:", await res.text());
})
.catch(console.error);
