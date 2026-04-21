from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load the real ML model and features
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

        # Build input array in correct feature order
        input_values = []
        for feature in feature_names:
            value = data.get(feature, 0)
            input_values.append(float(value))

        input_array = np.array([input_values])
        print("🔢 Input array:", input_array)

        # Real ML prediction
        predicted_reach = model.predict(input_array)[0]
        predicted_reach = round(float(predicted_reach), 2)

        # Best time logic based on predicted reach
        followers = float(data.get('follower_count', 0))
        if followers < 5000:
            best_time = "Monday 6 PM"
        elif followers < 20000:
            best_time = "Wednesday 7 PM"
        else:
            best_time = "Sunday 8 PM"

        print("✅ Predicted reach:", predicted_reach)

        return jsonify({
            "predicted_reach": predicted_reach,
            "best_time": best_time,
            "model": "Real ML Model",
            "features_used": list(feature_names)
        })

    except Exception as e:
        print("❌ Error:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)