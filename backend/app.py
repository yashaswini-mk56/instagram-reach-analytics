from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, '..', 'ml_model', 'model.pkl')
FEATURES_PATH = os.path.join(BASE_DIR, '..', 'ml_model', 'features.pkl')

with open(MODEL_PATH, 'rb') as f:
    model = pickle.load(f)

with open(FEATURES_PATH, 'rb') as f:
    feature_names = pickle.load(f)

print("✅ ML Model loaded successfully!")
print("📋 Expected features:", feature_names)

@app.route('/')
def home():
    return "Backend is running with Real ML Model!"

@app.route('/features', methods=['GET'])
def get_features():
    return jsonify({"features": list(feature_names)})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        print("📥 Received data:", data)

        input_values = []
        for feature in feature_names:
            value = data.get(feature, 0)
            input_values.append(float(value))

        input_array = np.array([input_values])
        predicted_reach = model.predict(input_array)[0]
        predicted_reach = round(float(predicted_reach), 2)

        # Improved best time logic
        followers = float(data.get('follower_count', 0))
        likes = float(data.get('likes', 0))
        engagement = likes / followers if followers > 0 else 0

        if engagement > 0.1:
            best_time = "Friday 6 PM"
        elif engagement > 0.05:
            best_time = "Wednesday 7 PM"
        elif followers > 50000:
            best_time = "Sunday 8 PM"
        elif followers > 10000:
            best_time = "Thursday 9 PM"
        else:
            best_time = "Monday 6 PM"

        print("✅ Predicted reach:", predicted_reach)

        return jsonify({
            "predicted_reach": predicted_reach,
            "best_time": best_time,
            "model": "Random Forest",
            "engagement_rate": round(engagement * 100, 2)
        })

    except Exception as e:
        print("❌ Error:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)