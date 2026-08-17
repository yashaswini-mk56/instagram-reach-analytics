import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib

def generate_instagram_dataset(num_samples=2500):
    np.random.seed(42)

    # 1. Followers
    followers = np.random.exponential(scale=15000, size=num_samples).astype(int) + 500
    followers = np.clip(followers, 500, 500000)

    # 2. Post Types: 0: Image, 1: Reel, 2: Carousel, 3: Story
    post_types = np.random.choice([0, 1, 2, 3], size=num_samples, p=[0.25, 0.45, 0.25, 0.05])
    post_type_multipliers = {0: 1.0, 1: 2.2, 2: 1.5, 3: 0.6}
    type_mult = np.array([post_type_multipliers[pt] for pt in post_types])

    # 3. Hashtag Count (0 to 30) - optimal 7-15
    hashtags = np.random.randint(0, 31, size=num_samples)
    hashtag_eff = np.where(hashtags <= 5, hashtags * 0.05,
                  np.where(hashtags <= 15, 0.25 + (hashtags - 5) * 0.04,
                  np.where(hashtags <= 25, 0.65 - (hashtags - 15) * 0.02, 0.45)))

    # 4. Caption Length (chars 10 to 1000)
    caption_length = np.random.randint(10, 1000, size=num_samples)
    caption_eff = np.where(caption_length < 50, 0.7,
                  np.where(caption_length <= 300, 1.1,
                  np.where(caption_length <= 600, 0.95, 0.8)))

    # 5. Engagement Metrics (correlated with followers & post type)
    base_engagement_rate = np.random.uniform(0.02, 0.08, size=num_samples) * type_mult
    likes = (followers * base_engagement_rate * np.random.uniform(0.6, 1.2, size=num_samples)).astype(int)
    comments = (likes * np.random.uniform(0.03, 0.12, size=num_samples)).astype(int)
    shares = (likes * np.random.uniform(0.05, 0.25, size=num_samples) * (1.5 if post_types[1] else 1.0)).astype(int)
    saves = (likes * np.random.uniform(0.08, 0.35, size=num_samples) * (1.8 if post_types[2] else 1.0)).astype(int)

    # 6. Posting Day (0: Mon ... 6: Sun) & Hour (0 ... 23)
    posting_day = np.random.randint(0, 7, size=num_samples)
    posting_hour = np.random.randint(0, 24, size=num_samples)

    # Hour multiplier curve (peak at 12-14 and 18-21)
    hour_mult = np.where((posting_hour >= 18) & (posting_hour <= 21), 1.35,
                np.where((posting_hour >= 12) & (posting_hour <= 14), 1.20,
                np.where((posting_hour >= 7) & (posting_hour <= 9), 1.05,
                np.where((posting_hour >= 1) & (posting_hour <= 5), 0.55, 0.85))))

    # Day multiplier curve (peak Wed, Thu, Fri, Sun)
    day_mult = np.where(np.isin(posting_day, [2, 3, 4, 6]), 1.15, 0.90)

    # Target variable: Reach / Impressions calculation logic
    # Organic reach baseline
    organic_reach = followers * np.random.uniform(0.15, 0.40, size=num_samples)

    # Virality & Explore reach driven by shares (5.0 weight), saves (4.5 weight), comments (3.0 weight), likes (1.0 weight)
    engagement_signal = (likes * 1.0) + (comments * 3.0) + (shares * 5.0) + (saves * 4.5)
    viral_reach = engagement_signal * np.random.uniform(0.8, 1.4, size=num_samples) * type_mult

    # Hashtag & Timing boosts
    total_reach = (organic_reach + viral_reach) * (1.0 + hashtag_eff) * caption_eff * hour_mult * day_mult
    total_reach = np.maximum(total_reach, followers * 0.1).astype(int)

    df = pd.DataFrame({
        'followers': followers,
        'post_type': post_types,
        'hashtags_count': hashtags,
        'caption_length': caption_length,
        'likes': likes,
        'comments': comments,
        'shares': shares,
        'saves': saves,
        'posting_day': posting_day,
        'posting_hour': posting_hour,
        'predicted_reach': total_reach
    })

    return df

def train_and_save_models():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(backend_dir, 'dataset.csv')

    print("Generating synthetic Instagram engagement dataset...")
    df = generate_instagram_dataset()
    df.to_csv(data_path, index=False)
    print(f"Dataset saved to {data_path}")

    # Features for main reach prediction model
    feature_cols = [
        'followers', 'post_type', 'hashtags_count', 'caption_length',
        'likes', 'comments', 'shares', 'saves', 'posting_day', 'posting_hour'
    ]

    X = df[feature_cols]
    y = df['predicted_reach']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train Random Forest Regressor
    print("Training Random Forest Reach Prediction Model...")
    rf_model = RandomForestRegressor(n_estimators=120, max_depth=14, random_state=42, n_jobs=-1)
    rf_model.fit(X_train_scaled, y_train)

    train_score = rf_model.score(X_train_scaled, y_train)
    test_score = rf_model.score(X_test_scaled, y_test)
    print(f"Model Trained! Train R^2: {train_score:.4f}, Test R^2: {test_score:.4f}")

    # Train Time-Engagement Heatmap Model
    # Features: post_type, posting_day, posting_hour -> engagement multiplier
    df['reach_per_follower'] = df['predicted_reach'] / (df['followers'] + 1)
    time_features = ['post_type', 'posting_day', 'posting_hour']
    X_time = df[time_features]
    y_time = df['reach_per_follower']

    time_model = RandomForestRegressor(n_estimators=60, max_depth=10, random_state=42)
    time_model.fit(X_time, y_time)

    # Save artifacts
    joblib.dump(rf_model, os.path.join(backend_dir, 'model.pkl'))
    joblib.dump(scaler, os.path.join(backend_dir, 'scaler.pkl'))
    joblib.dump(time_model, os.path.join(backend_dir, 'time_model.pkl'))

    # Save Feature Importance metadata
    feature_importances = dict(zip(feature_cols, rf_model.feature_importances_))
    with open(os.path.join(backend_dir, 'features.json'), 'w') as f:
        json.dump({
            'feature_names': feature_cols,
            'importances': feature_importances,
            'train_r2': round(train_score, 4),
            'test_r2': round(test_score, 4)
        }, f, indent=2)

    print("All ML artifacts successfully created and saved!")

if __name__ == '__main__':
    train_and_save_models()
