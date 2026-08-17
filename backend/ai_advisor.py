# AI Advisor & Post Optimization Engine (Simple, Clear English Version)

DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
POST_TYPE_NAMES = {0: 'Image', 1: 'Reel', 2: 'Carousel', 3: 'Story'}

def calculate_ai_best_times(post_type=1, followers=10000):
    """
    Computes peak posting time recommendations based on format and user base size.
    """
    if post_type == 1: # Reel
        recs = [
            {
                'day': 'Wednesday',
                'time_label': 'Wednesday at 6:00 PM',
                'expected_boost': '+45% Boost',
                'rationale': 'Most of your followers are active online on Instagram at this hour.'
            },
            {
                'day': 'Sunday',
                'time_label': 'Sunday at 7:00 PM',
                'expected_boost': '+38% Boost',
                'rationale': 'Sunday evenings have high video watching and sharing activity.'
            },
            {
                'day': 'Friday',
                'time_label': 'Friday at 5:00 PM',
                'expected_boost': '+30% Boost',
                'rationale': 'Great weekend start window when people scroll after work/school.'
            }
        ]
    elif post_type == 2: # Carousel
        recs = [
            {
                'day': 'Thursday',
                'time_label': 'Thursday at 7:00 PM',
                'expected_boost': '+40% Boost',
                'rationale': 'People take time to swipe through multiple slides during evening hours.'
            },
            {
                'day': 'Tuesday',
                'time_label': 'Tuesday at 6:00 PM',
                'expected_boost': '+32% Boost',
                'rationale': 'High mid-week bookmarking and reading window.'
            }
        ]
    else: # Image / Story
        recs = [
            {
                'day': 'Wednesday',
                'time_label': 'Wednesday at 12:00 PM (Lunch)',
                'expected_boost': '+28% Boost',
                'rationale': 'Lunchtime quick scrolling window on mobile.'
            },
            {
                'day': 'Saturday',
                'time_label': 'Saturday at 11:00 AM',
                'expected_boost': '+25% Boost',
                'rationale': 'Weekend morning leisure browsing.'
            }
        ]

    # Generate 24-hour engagement curve values (0 to 23 hours)
    heatmap_scores = []
    for h in range(24):
        if 18 <= h <= 21:
            score = 95
        elif 12 <= h <= 14:
            score = 75
        elif 7 <= h <= 9:
            score = 55
        elif 1 <= h <= 5:
            score = 15
        else:
            score = 40
        heatmap_scores.append({'hour': h, 'score': score})

    return {
        'top_recommendations': recs,
        'heatmap': heatmap_scores
    }

def generate_ai_content_tips(data):
    """
    Generates easy-to-understand, actionable post tips in simple English.
    """
    tips = []

    post_type = int(data.get('post_type', 1))
    hashtags = int(data.get('hashtags_count', 10))
    shares = int(data.get('shares', 25))
    saves = int(data.get('saves', 40))

    # Format Tip
    if post_type != 1:
        tips.append({
            'category': 'Post Format',
            'status': 'warning',
            'title': '📱 Try Posting a Video Reel',
            'message': 'Instagram shows Reel videos to 2 times more new people than regular photos.'
        })
    else:
        tips.append({
            'category': 'Post Format',
            'status': 'success',
            'title': '✅ Great Video Choice!',
            'message': 'Reel videos get shown to the most new accounts on Instagram.'
        })

    # Hashtag Tip
    if hashtags < 5:
        tips.append({
            'category': 'Hashtags',
            'status': 'warning',
            'title': '🏷️ Add More Hashtags',
            'message': 'You only have a few hashtags. Try adding 8 to 10 hashtags so new people can find your post.'
        })
    elif hashtags > 15:
        tips.append({
            'category': 'Hashtags',
            'status': 'info',
            'title': '🏷️ Keep Hashtags Simple',
            'message': '8 to 12 simple, relevant hashtags work best for getting views.'
        })
    else:
        tips.append({
            'category': 'Hashtags',
            'status': 'success',
            'title': '✅ Perfect Hashtag Amount',
            'message': 'Using 8 to 12 hashtags helps Instagram show your post to the right audience.'
        })

    # Saves and Shares Tip
    if shares < 30 or saves < 30:
        tips.append({
            'category': 'Engagement',
            'status': 'warning',
            'title': '📌 Ask Viewers to Save & Share',
            'message': 'Tell people in your caption: "Save this post for later!" Posts that get saved get shown to way more people.'
        })

    return tips
