# IoT-Based Supply Chain Management System

A runnable full-stack B.Tech project starter with React/Vite, Express, MongoDB, JWT/RBAC, Socket.IO, IoT simulator, ESP32 firmware and a separate Python ML service.

## Requirements
- Node.js 20+, npm
- MongoDB 6+ (local or Atlas)
- Python 3.10+ (ML service optional)

## Run
1. Copy `.env.example` to `server/.env` and set `MONGO_URI` and a strong `JWT_SECRET`.
2. Install root tools: `npm install`
3. Install services: `npm install --prefix server && npm install --prefix client`
4. Start MongoDB.
5. Start backend and frontend: `npm run dev`
6. Open http://localhost:5173. Register the first user; the first registered account is assigned Admin. Subsequent registrations default to Warehouse Manager.
7. Seed demo records (optional, after registering): `npm run seed --prefix server`.
8. ML service (optional): `cd ml && python -m venv .venv && source .venv/bin/activate` (Windows: `.venv\\Scripts\\activate`), `pip install -r requirements.txt`, `uvicorn app:app --reload --port 8000`.

## Simulator
With backend running, run `node simulator/simulator.js`. Set `API_URL`, `DEVICE_KEY`, `DEVICE_ID`, and `INTERVAL_MS` as environment variables. Register a device in the UI; its generated device key is shown once. The simulator posts to `/api/iot/ingest` and supports `MODE=normal|hot|cold|humid|dry|disconnect|gps`.

## ESP32
Open `firmware/esp32_supply_chain.ino` in Arduino IDE. Install Adafruit DHT sensor library and ArduinoJson. Configure Wi-Fi, API URL, device ID and device key. Connect DHT22 data to GPIO 4; optional NEO-6M uses UART2 RX=16/TX=17. This firmware sends hardware readings (source `hardware`).

## API overview
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- CRUD `/api/goods`, `/api/shipments`, `/api/devices`
- `POST /api/iot/ingest` (device key authentication)
- `GET /api/readings`, `GET /api/alerts`; `PATCH /api/alerts/:id`
- `GET /api/analytics/summary`, `GET /api/analytics/export.csv`
- Socket.IO event `telemetry:new`, `alert:new`

## Important limitations
This is a complete educational MVP foundation, not a production-certified logistics platform. Configure HTTPS, rate limiting, secret rotation, audit retention, backups and deployment security before production. The ML model is a demonstration classifier trained on generated proxy labels; it does not establish actual spoilage and must be replaced/retrained with labelled domain data. Alert thresholds are the operational safety mechanism and remain active when ML is offline. Simulated coordinates are explicitly marked `simulated` and must not be interpreted as real GPS.

## Roles
Admin: all routes. Warehouse Manager: goods, devices, monitoring. Logistics Manager: shipments, monitoring and alerts. API authorization is enforced server-side.
