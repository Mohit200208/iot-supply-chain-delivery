// Sends simulated telemetry through the same authenticated ingestion endpoint as ESP32.
const API=process.env.API_URL||'http://localhost:5000/api',DEVICE_ID=process.env.DEVICE_ID||'DEMO-ESP32-01',DEVICE_KEY=process.env.DEVICE_KEY;
const mode=process.env.MODE||'normal',interval=Number(process.env.INTERVAL_MS||5000);
if(!DEVICE_KEY){console.error('Set DEVICE_KEY to the one-time key returned when registering a device.');process.exit(1);}
let tick=0;const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function send(){tick++;if(mode==='disconnect'){console.log('Disconnect mode: no telemetry sent');return;}
let temperature=4+Math.sin(tick/5)*1.2,humidity=88+Math.sin(tick/7)*2,latitude=28.6139+(tick%20)*.001,longitude=77.209+(tick%20)*.001;
if(mode==='hot')temperature=18;if(mode==='cold')temperature=-3;if(mode==='humid')humidity=99;if(mode==='dry')humidity=10;if(mode==='gps'){temperature=4;humidity=88;}
const body={temperature,humidity,latitude,longitude,source:'simulated',recordedAt:new Date().toISOString()};
try{const r=await fetch(`${API}/iot/ingest`,{method:'POST',headers:{'content-type':'application/json','x-device-id':DEVICE_ID,'x-device-key':DEVICE_KEY},body:JSON.stringify(body)});console.log(r.status,await r.text());}catch(e){console.error('API unreachable:',e.message);}}
console.log(`Simulator ${DEVICE_ID} mode=${mode} interval=${interval}ms`);while(true){await send();await sleep(interval);}
