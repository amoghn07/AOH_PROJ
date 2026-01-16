# Vendor Dispute Analyzer

**AI-Powered Vendor Dispute Management System**

Transform messy vendor emails into actionable insights using Claude 3.5 Sonnet.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up API key
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY

# 3. Run the server
npm run server

# 4. Open browser
# http://localhost:3001
```

## 📚 Documentation Hub

### **START HERE** 👇
- **[FINAL_README.md](./FINAL_README.md)** - Complete product overview

### Setup & Deployment
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Detailed setup & deployment guide
- **[QUICKSTART.md](./QUICKSTART.md)** - Quick 5-minute setup

### Technical Details
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture & design
- **[EXAMPLE_OUTPUT.md](./EXAMPLE_OUTPUT.md)** - Example outputs & samples
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Project overview
- **[PROJECT_STATUS.txt](./PROJECT_STATUS.txt)** - Status & checklist

## ✨ What This Does

```
📧 Vendor Email
    ↓
🧠 Parse & Extract
    ↓
📋 Retrieve Context (Contracts, Payment History)
    ↓
🤖 Claude AI Analysis
    ↓
📊 Generate Resolution Case
    ↓
💻 Web UI for Approval
```

## 🎯 Features

✅ Email parsing & analysis  
✅ Claude 3.5 Sonnet integration  
✅ Contract term review  
✅ Payment history lookup  
✅ Dispute categorization  
✅ Confidence scoring  
✅ Recommendation generation  
✅ Draft response writing  
✅ Modern web UI  
✅ RESTful API  
✅ Production-ready Docker setup  

## 📂 What's Included

- **Backend API** - Express.js with email analysis endpoint
- **Frontend UI** - Modern web interface for reviewing cases
- **Sample Data** - 3 vendors with realistic disputes
- **Email Agent** - Claude-powered analysis logic
- **TypeScript** - Full type safety
- **Documentation** - Complete guides & examples

## 🔧 Configuration

### Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-...your-api-key...
NODE_ENV=development
PORT=3001
LOG_LEVEL=info
```

### Customize Claude's Behavior

Edit `src/config/constants.ts` to change the system prompt and align with your company policies.

### Add Your Vendors

Edit `src/data/vendors.ts` and add vendor information and contracts.

## 📡 API

### Analyze Email
```bash
POST /api/analyze
Content-Type: application/json

{
  "vendorId": "VENDOR-001",
  "subject": "Invoice INV-2024-0004 - Underpayment",
  "body": "We believe you underpaid invoice..."
}
```

### Get Vendors
```bash
GET /api/vendors
```

### Sample Emails
```bash
GET /api/sample-emails
```

### Health Check
```bash
GET /api/health
```

## 🛠️ Commands

```bash
npm run server          # Start dev server on port 3001
npm run build           # Compile TypeScript to JavaScript
npm start              # Run compiled production server
npm run analyze-email  # Process sample emails (demo)
npm run server:prod    # Build and start production
```

## 🐳 Docker

```bash
# Build
docker build -t vendor-analyzer .

# Run
docker run -e ANTHROPIC_API_KEY=sk-ant-... -p 3001:3001 vendor-analyzer

# Or use Docker Compose
docker-compose up
```

## 📊 How It Works

### Email Analysis Pipeline

1. **Parse Email** - Extract vendor info, invoice numbers, amounts, complaint type, tone
2. **Retrieve Context** - Get vendor contract, payment terms, payment history
3. **Claude Analysis** - Review contract, check payments, generate recommendation
4. **Create Case** - Package with reasoning, draft response, approval routing
5. **Display Results** - Show in web UI for manager review

### Sample Disputes Included

1. **TechSupply Co.** - Invoice payment + early discount question
2. **Office Solutions** - Custom modification charges dispute
3. **Logistics Express** - Fuel surcharge clarification

## 🚀 Deployment

### Development
```bash
npm run server
```

### Production
```bash
npm run server:prod
# or
docker-compose up -d
```

### Cloud Platforms
- **Heroku** - See DEPLOYMENT_GUIDE.md
- **AWS/GCP/Azure** - See DEPLOYMENT_GUIDE.md
- **Self-hosted** - See DEPLOYMENT_GUIDE.md

## 🧠 AI Integration

Uses **Claude 3.5 Sonnet** with custom system prompt to:
- Analyze disputes objectively
- Reference contract clauses
- Review payment history
- Generate fair recommendations
- Draft professional responses

System prompt can be customized in `src/config/constants.ts`

## 📈 Performance

- Analysis time: ~5-10 seconds per email
- UI response: < 100ms
- Concurrent requests: Unlimited
- No database required (uses in-memory data)

## 🔒 Security

- API key stored in `.env` (never committed)
- Input validation on backend
- Use HTTPS in production
- Rate limiting recommended for production

## 🎯 Project Structure

```
src/
├── server.ts                    # Express API server
├── agents/emailAnalysisAgent.ts # Core analysis logic
├── services/anthropicService.ts # Claude wrapper
├── data/                        # Vendors, contracts, payments
├── types/                       # TypeScript interfaces
├── config/                      # Configuration
└── utils/                       # Helpers

public/
├── index.html                   # Web UI
├── app.js                       # Frontend logic
└── styles.css                   # Styling
```

## 🌟 Key Capabilities

### Email Analysis
- Extract invoice numbers, amounts, complaint type
- Determine vendor tone (professional, frustrated, hostile)
- Identify dispute category

### Claude AI
- Review vendor contracts
- Cross-check payment history
- Generate objective analysis
- Make recommendation (approve/reject/partial/investigate)
- Draft professional vendor response

### Case Management
- Generate unique case IDs
- Assign confidence levels (high/medium/low)
- Route to required approvers
- Maintain audit trail

### Web Interface
- Load sample emails
- Submit for analysis
- View recommendations
- Review draft responses
- Approve/reject cases

## 🚀 Next Steps

1. **Get API Key** - https://console.anthropic.com/keys
2. **Install & Run** - See Quick Start above
3. **Test** - Load sample emails and verify analysis
4. **Customize** - Add your vendors and contracts
5. **Deploy** - Follow DEPLOYMENT_GUIDE.md

## 📖 Documentation

Complete guides available:
- **FINAL_README.md** - Full feature overview
- **DEPLOYMENT_GUIDE.md** - Setup and deployment
- **ARCHITECTURE.md** - Technical design
- **EXAMPLE_OUTPUT.md** - Sample outputs
- **QUICKSTART.md** - 5-minute setup

## 🐛 Troubleshooting

### "ANTHROPIC_API_KEY is not set"
→ Run `cp .env.example .env` and add your API key

### "Port 3001 already in use"
→ Use `PORT=3002 npm run server`

### "Failed to analyze email"
→ Check API key validity, internet connection, rate limits

See DEPLOYMENT_GUIDE.md for more help.

## 💡 Customization

- Change Claude's behavior via `src/config/constants.ts`
- Add vendors in `src/data/vendors.ts`
- Add contracts in `src/data/vendors.ts`
- Customize UI in `public/styles.css`

## 🎓 Learning

This project demonstrates:
- Claude AI integration in production
- Express.js API design
- TypeScript best practices
- Modern frontend development
- Full-stack architecture

## 📄 License

MIT

---

**Ready to simplify vendor disputes?**

```bash
npm install && npm run server
# Open http://localhost:3001
```

See [FINAL_README.md](./FINAL_README.md) for the complete guide.
