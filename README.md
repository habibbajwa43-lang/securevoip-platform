# 🚀 SecureVoIP Platform — Enterprise-Grade Communication System

A complete, production-ready VoIP platform with mobile apps, web portal, admin panel, and marketing site.

## 📦 Project Structure

```
voip-platform/
├── backend/          → NestJS API (Port 3001)
├── web-portal/       → Next.js User Portal (Port 3000)
├── admin-panel/      → Next.js Admin Panel (Port 3002)
├── marketing/        → Next.js Marketing Site (Port 3003)
├── mobile/           → React Native (Android & iOS)
└── docker-compose.yml
```

## 🛠️ Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Backend      | NestJS, TypeScript, PostgreSQL, Redis, WebSocket|
| Web Portal   | Next.js 14, Tailwind CSS, SIP.js, WebRTC        |
| Admin Panel  | Next.js 14, Tailwind CSS, Recharts              |
| Marketing    | Next.js 14, Tailwind CSS, Framer Motion         |
| Mobile       | React Native, Expo, react-native-sip-stack      |
| VoIP         | FreeSWITCH/Asterisk, WebRTC, SIP protocol       |
| Payments     | Stripe, PayPal, Apple Pay, Amazon Pay           |
| Auth         | JWT, PIN-based, QR Code                         |
| Security     | AES-256, bcrypt, Helmet, Rate Limiting          |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose

### 1. Clone & Setup
```bash
git clone <repo-url>
cd voip-platform
cp .env.example .env
# Fill in your credentials in .env
```

### 2. Start with Docker (Recommended)
```bash
docker-compose up -d
```

### 3. Manual Setup

#### Backend
```bash
cd backend
npm install
npm run migration:run
npm run seed
npm run start:dev
```

#### Web Portal
```bash
cd web-portal
npm install
npm run dev
```

#### Admin Panel
```bash
cd admin-panel
npm install
npm run dev
```

#### Marketing Site
```bash
cd marketing
npm install
npm run dev
```

## 🔐 Default Admin Credentials
```
Email: admin@securevoip.com
Password: Admin@123456
```

## 🌐 API Documentation
Once backend is running: http://localhost:3001/api/docs

## 📱 Mobile Setup
```bash
cd mobile
npm install
npx expo start
```

## 🔧 Environment Variables
See `.env.example` for all required variables.

## 📊 Features

### Mobile App (Android & iOS)
- ✅ HD VoIP Calling (adaptive codecs)
- ✅ Global SMS & MMS
- ✅ Multi-number support
- ✅ Dynamic Caller ID
- ✅ Call routing rules
- ✅ Do Not Disturb (DND)
- ✅ Scheduled SMS
- ✅ PIN & QR login
- ✅ White-labeling

### Web User Portal
- ✅ Phone number purchase & porting
- ✅ WebRTC browser calling
- ✅ SMS/MMS inbox
- ✅ Billing & invoices
- ✅ Usage analytics
- ✅ Call routing configuration

### Admin Panel
- ✅ User management
- ✅ Number inventory
- ✅ Dynamic pricing engine
- ✅ Real-time traffic monitoring
- ✅ Payment lifecycle tracking
- ✅ Automated suspension rules

### Security
- ✅ AES-256 encryption
- ✅ JWT with refresh tokens
- ✅ Rate limiting & DDoS protection
- ✅ VAPT-ready architecture
- ✅ GCC region optimization

## 📄 License
Proprietary — All rights reserved.
