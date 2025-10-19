# Artemis - Smart Financial Assistant Setup Guide

## Overview
Artemis is a smart financial assistant that combines ML-based credit risk analysis with LLM-powered insights. It allows users to upload credit card statements, parse transactions, and get personalized financial advice.

## Features Implemented

### 1. File Upload System
- Drag & drop PDF upload on budget page
- Click-to-upload functionality
- PDF parsing with transaction extraction

### 2. Transaction Parsing
- Automatic categorization (Restaurants, Travel, Merchandise, Gas, etc.)
- Date and amount extraction
- Merchant identification

### 3. Spending Analysis Dashboard
- Weekly spending visualization with moon phases
- Total spend breakdown (donut chart)
- Category-wise spending display
- Spending metrics:
  - Spending rate ($/week)
  - Cash stability score
  - Budget overage percentage

### 4. ML Integration
- Credit risk prediction using XGBoost
- SHAP-based feature importance
- 30+ credit features including credit_score

### 5. LLM Chat Integration
- OpenAI GPT-4o powered insights
- Context-aware responses based on spending data
- Fallback responses when backend is unavailable

## File Structure

```
Artemis/
├── backend/
│   ├── api/
│   │   ├── flask_app.py          ← Flask API server
│   │   └── credit_qa_system.py   ← Credit Q&A system
│   ├── ml/
│   │   ├── credit_risk_model.py  ← XGBoost model
│   │   ├── data_generator.py     ← Synthetic data generator
│   │   └── model_interpretability.py
│   ├── llm/
│   │   └── credit_analyst.py     ← OpenAI integration
│   ├── data/
│   │   └── prediction_manager.py ← Model prediction handler
│   ├── outputs/
│   │   ├── credit_risk_model.pkl ← Trained model
│   │   └── credit_data_synthetic.csv
│   └── requirements.txt
│
└── artemis/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx        ← Root layout with navbar
    │   │   ├── page.tsx          ← Landing page
    │   │   ├── budget/
    │   │   │   └── page.tsx      ← File upload & spending analysis
    │   │   ├── credit/
    │   │   │   └── page.tsx      ← Credit report page
    │   │   ├── gacha/
    │   │   │   └── page.tsx      ← Gacha page
    │   │   └── api/
    │   │       ├── parse-statement/
    │   │       │   └── route.ts  ← PDF parsing API
    │   │       └── chat-insights/
    │   │           └── route.ts  ← LLM chat API
    │   └── components/
    │       ├── Navbar/
    │       │   └── index.tsx     ← Bottom navigation
    │       └── SpendingAnalysis/
    │           └── index.tsx     ← Spending dashboard
    └── .env.local
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file with your OpenAI API key:
```bash
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

4. Generate synthetic data and train the model (if not already done):
```bash
cd ml
python credit_risk_model.py
```

5. Start the Flask server:
```bash
cd ..
python api/flask_app.py
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to artemis directory:
```bash
cd artemis
```

2. Install Node dependencies:
```bash
npm install
```

3. The `.env.local` file is already created with:
```
BACKEND_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Backend (Flask)

1. **POST /api/chat**
   - Sends user message and spending data to LLM
   - Returns AI-generated insights
   - Body: `{ "message": "...", "spending_data": {...} }`

2. **POST /api/analyze-credit**
   - Analyzes credit risk using ML model
   - Returns risk prediction and feature importance
   - Body: `{ "features": {...} }`

3. **POST /api/spending-insights**
   - Generates automated spending insights
   - Returns warnings, tips, and AI analysis
   - Body: `{ "spending_data": {...} }`

4. **GET /health**
   - Health check endpoint
   - Returns server status and model availability

### Frontend (Next.js)

1. **POST /api/parse-statement**
   - Parses uploaded PDF credit card statement
   - Extracts transactions and calculates metrics
   - Body: FormData with PDF file

2. **POST /api/chat-insights**
   - Proxies chat requests to backend
   - Provides fallback responses if backend unavailable
   - Body: `{ "message": "...", "spendingData": {...} }`

## Usage

1. Start both backend and frontend servers (see Setup Instructions above)

2. Navigate to `http://localhost:3000`

3. Click on the Budget icon in the bottom navbar

4. Upload a credit card statement PDF by:
   - Clicking on the "importstatement.svg" icon
   - OR dragging and dropping a PDF file

5. View the parsed spending analysis with:
   - Weekly spending bars
   - Total spend donut chart
   - Category breakdown
   - Spending metrics
   - AI chat for insights

6. Ask questions in the AI Insights chat:
   - "How can I reduce my spending?"
   - "What's my highest spending category?"
   - "Am I over budget?"
   - "How's my cash stability?"

## Dependencies

### Backend
- xgboost==2.0.3 (ML model)
- shap==0.44.1 (Model interpretability)
- openai==1.12.0 (LLM integration)
- flask==3.0.2 (API server)
- flask-cors==4.0.0 (CORS handling)
- pandas, numpy, scikit-learn (Data processing)

### Frontend
- next==15.5.6 (React framework)
- react==19.1.0
- pdfjs-dist (PDF parsing)
- tailwindcss==4 (Styling)
- typescript==5

## Design System

- **Gradient**: `from-[#36336A] via-[#5a5080] to-[#7a506a]`
- **Text Color**: `#FFE8B3` (soft yellow)
- **Font**: Geist Mono
- **Background**: stars-splay.svg

## Next Steps

1. Enhance PDF parsing to handle more statement formats
2. Add user authentication and data persistence
3. Implement budget goal setting
4. Create credit report visualization on /credit page
5. Build gacha reward system for good spending habits
6. Add data export functionality
7. Implement recurring transaction detection
8. Create spending prediction models

## Troubleshooting

### Backend Issues

- **Model loading error**: Make sure `credit_risk_model.pkl` exists in `backend/outputs/`
- **OpenAI API error**: Check your `.env` file has valid `OPENAI_API_KEY`
- **CORS error**: Ensure `flask-cors` is installed and CORS is enabled

### Frontend Issues

- **PDF parsing fails**: Check that `pdfjs-dist` is installed
- **Chat doesn't work**: Verify backend is running on port 5000
- **Images not loading**: Ensure all SVG files are in `public/images/`

## Testing

You can test the system with the included `teststatement.pdf` or any credit card statement PDF.

Example test questions for the AI chat:
- "What's my spending pattern?"
- "How can I improve my budget?"
- "Which category should I reduce?"
- "Am I spending consistently?"

---

Built with XGBoost, OpenAI GPT-4o, Next.js 15, and Flask.
