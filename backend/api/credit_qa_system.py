import sys
import os
import pandas as pd

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from llm.credit_analyst import CreditAnalyst
from data.prediction_manager import PredictionManager, DataContextManager


class CreditQASystem:
    

    def __init__(self, model_path, data_path=None, llm_model="gpt-4o"):
        self.prediction_manager = PredictionManager(model_path)
        self.analyst = CreditAnalyst(model_name=llm_model)
        self.data_context = DataContextManager(data_path) if data_path else None

        print("Credit Q&A System initialized successfully!")

    def analyze_user(self, user_data):
        is_valid, error = self.prediction_manager.validate_input(user_data)
        if not is_valid:
            return {'error': error}

        prediction_result = self.prediction_manager.predict(user_data, explain=True)

        if self.data_context:
            comparison = self.data_context.compare_to_population(user_data)
            prediction_result['population_comparison'] = comparison

        self.analyst.set_context(prediction_result)

        llm_analysis = self.analyst.analyze_prediction()

        return {
            'prediction': {
                'risk_level': prediction_result['prediction_label'],
                'probability': prediction_result['prediction_proba'],
                'interpretation': self._interpret_probability(
                    prediction_result['prediction_proba']
                )
            },
            'top_factors': prediction_result['top_features'][:5],
            'analysis': llm_analysis,
            'raw_prediction': prediction_result
        }

    def ask_question(self, question):
        answer = self.analyst.ask_question(question)

        return {
            'question': question,
            'answer': answer,
            'context': {
                'risk_level': self.analyst.current_prediction['label'] if self.analyst.current_prediction else None,
                'probability': self.analyst.current_prediction['probability'] if self.analyst.current_prediction else None
            }
        }

    def explain_feature(self, feature_name):
        explanation = self.analyst.explain_feature(feature_name)

        feature_stats = self.prediction_manager.get_feature_statistics([feature_name])

        return {
            'feature': feature_name,
            'explanation': explanation,
            'statistics': feature_stats.get(feature_name, {})
        }

    def simulate_improvements(self, scenario_changes):
        if not self.analyst.current_user_data:
            return {'error': 'No current user data. Analyze a user first.'}

        new_user_data = self.analyst.current_user_data.copy()
        new_user_data.update(scenario_changes)

        new_prediction = self.prediction_manager.predict(new_user_data, explain=True)

        llm_comparison = self.analyst.compare_scenarios(scenario_changes)

        old_prob = self.analyst.current_prediction['probability']
        new_prob = new_prediction['prediction_proba']
        change = new_prob - old_prob
        change_pct = (change / old_prob) * 100 if old_prob > 0 else 0

        return {
            'scenario': scenario_changes,
            'current_risk': {
                'level': self.analyst.current_prediction['label'],
                'probability': old_prob
            },
            'projected_risk': {
                'level': new_prediction['prediction_label'],
                'probability': new_prob
            },
            'impact': {
                'absolute_change': change,
                'percent_change': change_pct,
                'direction': 'improvement' if change < 0 else 'deterioration'
            },
            'analysis': llm_comparison
        }

    def get_recommendations(self):
        if not self.analyst.current_user_data:
            return {'error': 'No current user data. Analyze a user first.'}

        top_risks = [
            f for f in self.analyst.top_contributing_features[:5]
            if f.get('shap_value', 0) > 0  # Only factors increasing risk
        ]

        recommendation_prompt = """Based on this user's credit profile, provide a prioritized action plan:

1. Immediate Actions (can be done in 0-30 days)
2. Short-term Goals (1-3 months)
3. Long-term Strategy (3-12 months)

For each recommendation, be specific about:
- What to do
- Why it matters
- Expected impact on credit risk
- How to track progress

Focus on the most impactful changes first."""

        recommendations = self.analyst.ask_question(recommendation_prompt)

        return {
            'top_risk_factors': [f['feature'] for f in top_risks],
            'recommendations': recommendations,
            'current_risk_level': self.analyst.current_prediction['label']
        }

    def batch_analyze(self, users_data_list):
        return self.prediction_manager.batch_predict(users_data_list)

    def get_conversation_history(self):
        return self.analyst.get_conversation_history()

    def reset_session(self):
        self.analyst.reset_conversation()
        self.analyst.current_prediction = None
        self.analyst.current_user_data = None

    def _interpret_probability(self, probability):
        if probability < 0.3:
            return "Very Low Risk"
        elif probability < 0.5:
            return "Low Risk"
        elif probability < 0.7:
            return "Moderate Risk"
        elif probability < 0.85:
            return "High Risk"
        else:
            return "Very High Risk"

    def export_session_report(self):
        if not self.analyst.current_prediction:
            return {'error': 'No active session'}

        return {
            'user_data': self.analyst.current_user_data,
            'prediction': self.analyst.current_prediction,
            'top_features': self.analyst.top_contributing_features[:10],
            'conversation_history': self.analyst.get_conversation_history(),
            'timestamp': pd.Timestamp.now().isoformat()
        }


# Example usage and testing
if __name__ == "__main__":
    import json

    print("="*80)
    print("CREDIT RISK Q&A SYSTEM - DEMO")
    print("="*80)

    # Mock user data for testing
    test_user = {
        'credit_utilization': 85.5,
        'credit_age_months': 18.5,
        'hard_inquiries': 6,
        'payment_history_pct': 75.0,
        'late_30_days': 2,
        'late_60_days': 1,
        'late_90_days': 0,
        'num_credit_accounts': 4,
        'total_credit_limit': 15000.0,
        'current_balance': 12825.0,
        'monthly_income': 45000.0,
        'spending_groceries_pct': 8.0,
        'spending_dining_pct': 6.0,
        'spending_entertainment_pct': 5.0,
        'spending_utilities_pct': 7.0,
        'spending_transportation_pct': 10.0,
        'spending_shopping_pct': 8.0,
        'spending_healthcare_pct': 3.0,
        'spending_travel_pct': 4.0,
        'spending_subscriptions_pct': 3.0,
        'spending_miscellaneous_pct': 4.0,
        'total_spending_pct': 110.0,
        'spending_velocity': 25.0,
        'impulse_spending_score': 65.0,
        'recurring_payment_ratio': 40.0,
        'onetime_payment_ratio': 60.0,
        'payment_consistency': 55.0,
        'payment_timing_variance': 8.5,
        'min_payment_frequency': 45.0,
        'avg_days_before_due': -3.0
    }

    print("\nTest user data loaded")
    print("\nTo use this system:")
    print("1. Train a model first: cd backend/ml && python data_generator.py && python credit_risk_model.py")
    print("2. Initialize: qa_system = CreditQASystem(model_path='path/to/model.pkl')")
    print("3. Analyze: result = qa_system.analyze_user(user_data)")
    print("4. Ask questions: answer = qa_system.ask_question('Why is my score low?')")
    print("5. Get recommendations: recs = qa_system.get_recommendations()")

    print("\n" + "="*80)
