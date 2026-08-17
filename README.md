# Instagram Reach Analytics & AI Optimization Platform 🚀

A full-stack Machine Learning & AI-powered web application that predicts Instagram post reach, evaluates engagement drivers, and calculates optimal posting times using trained predictive models and algorithmic insights.

![Instagram Reach Analytics](https://img.shields.shields.io/badge/Status-Active-brightgreen)
![ML Model](https://img.shields.shields.io/badge/ML%20Engine-Random%20Forest%20Regressor-blue)
![Backend](https://img.shields.shields.io/badge/Backend-Python%20Flask-orange)
![Frontend](https://img.shields.shields.io/badge/Frontend-HTML5%2FJS%2FChart.js-purple)

---

## ✨ Features

- **🤖 Machine Learning Reach Predictor**: Trained `RandomForestRegressor` model predicting post reach based on followers, content type, hashtags, caption length, and expected engagement signals (likes, comments, shares, saves).
- **⏰ AI Best Time to Post Engine**: Hourly and weekly engagement heatmap analysis recommending peak posting windows tailored to post types (Reels, Carousels, Posts).
- **🔒 JWT Authentication**: Secure login & user registration system powered by Flask & PyJWT with hashed passwords (`werkzeug.security`).
- **📊 Interactive Visualizations**:
  - Reach Source Distribution Chart (Explore, Organic, Hashtags, Shares).
  - Algorithmic Driver Weights Chart (Shares/Saves vs Likes impact).
  - Hourly Engagement Heatmap.
- **💡 Smart Optimization Advice**: Real-time AI recommendations for caption length, hashtag count, and virality triggers.
- **🎨 Glassmorphic Dark UI**: Premium modern dark-mode aesthetic with custom sliders, responsive grids, and micro-animations.

---

## 🛠️ Project Structure

```
instagram-reach-analytics/
├── backend/
│   ├── app.py               # Flask REST API & JWT Authentication
│   ├── ai_advisor.py        # AI recommendation & peak posting time engine
│   ├── train_model.py       # Dataset generator & ML model training script
│   ├── requirements.txt     # Python dependencies
│   ├── dataset.csv          # Generated engagement dataset
│   ├── model.pkl            # Serialized Random Forest model
│   ├── scaler.pkl           # Feature StandardScaler
│   ├── time_model.pkl       # Time-engagement model
│   └── features.json        # Feature importance metadata
└── frontend/
    ├── index.html           # Dashboard single-page HTML
    ├── styles.css           # Glassmorphism dark mode CSS
    └── app.js               # Dashboard controller & Chart.js logic
```

---

## ⚡ Quick Start & Running Locally

### 1. Backend Setup

Navigate to the `backend` directory, install dependencies, and train the ML models:

```bash
cd backend
pip install -r requirements.txt
python train_model.py
python app.py
```
The API server will run at: `http://127.0.0.1:5000`

### 2. Frontend Setup

Simply open [`frontend/index.html`](file:///C:/Users/Acharya/.gemini/antigravity/scratch/instagram-reach-analytics/frontend/index.html) in your browser or run any local HTTP server (e.g. `npx serve frontend` or VS Code Live Server).

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | User registration |
| `/api/auth/login` | `POST` | User login & JWT token retrieval |
| `/api/auth/profile` | `GET` | User profile verification (Requires JWT) |
| `/api/predict` | `POST` | Predict reach, breakdown, and AI content tips |
| `/api/best-time` | `POST/GET` | Calculate top 3 posting windows and engagement heatmap |
| `/api/feature-importance`| `GET` | Get ML feature importance weights |

---

## 🧠 Machine Learning Details

- **Model Type**: Random Forest Regressor ($120$ trees, max depth $14$).
- **Features Used**: `followers`, `post_type`, `hashtags_count`, `caption_length`, `likes`, `comments`, `shares`, `saves`, `posting_day`, `posting_hour`.
- **Target Variable**: `predicted_reach` (Reach / Total Impressions).
- **Performance**: Train $R^2 \approx 0.97$, Test $R^2 \approx 0.85$.
