from flask import Flask, request, jsonify

app = Flask(__name__)
@app.route('/')
def home():
    return "Backend is running!"

# Temporary prediction logic (we will replace with ML later)
def dummy_predict(data):
    followers = int(data.get('follower_count', 0))
    hashtags = int(data.get('hashtags_count', 0))

    # simple formula
    predicted_reach = followers * 2 + hashtags * 10

    return predicted_reach


@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    result = dummy_predict(data)

    return jsonify({
        "predicted_reach": result,
        "best_time": "Monday 6 PM"
    })


if __name__ == '__main__':
    app.run(debug=True)