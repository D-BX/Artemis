
import os
import json
from openai import OpenAI
from dotenv import load_dotenv, find_dotenv
import pandas as pd
import numpy as np

load_dotenv(find_dotenv())


class CreditAnalyst:

    def __init__(self, model_name="gpt-4o", temperature=0.3):

        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model_name = model_name
        self.temperature = temperature
        self.conversation_history = []

        self.current_prediction = None
        self.current_shap_explanation = None
        self.current_user_data = None
        self.feature_importance = None
        self.model_metrics = None

    def set_context(self, prediction_data):
        self.current_prediction = {
            'probability': prediction_data.get('prediction_proba'),
            'label': prediction_data.get('prediction_label')
        }
        self.current_shap_explanation = prediction_data.get('shap_values')
        self.current_user_data = prediction_data.get('user_features')
        self.feature_importance = prediction_data.get('feature_importance')
        self.model_metrics = prediction_data.get('model_metrics')

        if 'top_features' in prediction_data:
            self.top_contributing_features = prediction_data['top_features']
        else:
            self.top_contributing_features = None

    def _build_system_prompt(self):

        system_prompt = """You are Artemis, an advanced AI credit risk analyst designed to help users understand their credit risk assessments.

Your role is to:
1. Interpret credit risk predictions from an XGBoost machine learning model
2. Explain SHAP (SHapley Additive exPlanations) values in plain, understandable language
3. Answer questions about specific credit features and their impact on risk
4. Provide actionable advice on how users can improve their credit profile
5. Explain complex financial metrics in simple terms

Guidelines:
- Be empathetic and supportive - credit issues can be stressful
- Always explain technical terms in plain language
- Focus on actionable insights, not just numbers
- Be honest about risks but constructive about solutions
- When discussing SHAP values, explain them as "factors that increase/decrease risk"
- Reference specific numbers from the user's data when relevant
- Prioritize the most impactful features in your explanations

Remember: You're analyzing results from a machine learning model. The model considers:
- Traditional credit factors (utilization, payment history, credit age, inquiries)
- Smart banking features (spending patterns, categories, velocity)
- Payment behavior (recurring payments, consistency, timing)
"""

        if self.current_prediction:
            context_info = f"""

CURRENT ANALYSIS CONTEXT:
========================
Prediction: {self.current_prediction['label']}
Risk Probability: {self.current_prediction['probability']:.1%}
"""

            if self.current_user_data:
                context_info += "\n\nUSER'S KEY CREDIT METRICS:\n"
                key_metrics = [
                    'credit_utilization', 'payment_history_pct', 'credit_age_months',
                    'hard_inquiries', 'total_spending_pct', 'spending_velocity',
                    'impulse_spending_score', 'recurring_payment_ratio'
                ]
                for metric in key_metrics:
                    if metric in self.current_user_data:
                        value = self.current_user_data[metric]
                        context_info += f"- {metric}: {value:.2f}\n"

            if self.top_contributing_features:
                context_info += "\n\nTOP FACTORS AFFECTING THIS PREDICTION:\n"
                for i, feature in enumerate(self.top_contributing_features[:5], 1):
                    feature_name = feature.get('feature', 'Unknown')
                    shap_value = feature.get('shap_value', 0)
                    feature_value = feature.get('value', 0)
                    direction = "increases risk" if shap_value > 0 else "decreases risk"

                    context_info += f"{i}. {feature_name} = {feature_value:.2f} ({direction}, impact: {abs(shap_value):.4f})\n"

            system_prompt += context_info

        return system_prompt

    def analyze_prediction(self):
        if not self.current_prediction:
            return "No prediction data available. Please set context first."

        analysis_prompt = f"""Based on the credit risk assessment, provide a comprehensive analysis that includes:

1. Overall Assessment: Explain the {self.current_prediction['label']} prediction and {self.current_prediction['probability']:.1%} risk probability in plain language

2. Key Factors: Explain the top 3-5 factors that most influenced this prediction, using the SHAP values provided

3. Strengths: What positive aspects of the user's credit profile are helping them?

4. Areas of Concern: What factors are increasing their risk?

5. Actionable Recommendations: Provide 3-5 specific, actionable steps the user can take to improve their credit risk profile

Make this analysis clear, empathetic, and actionable. Avoid jargon where possible."""

        messages = [
            {"role": "system", "content": self._build_system_prompt()},
            {"role": "user", "content": analysis_prompt}
        ]

        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=messages,
            temperature=self.temperature,
            max_tokens=1000
        )

        analysis = response.choices[0].message.content

        self.conversation_history.append({
            "role": "assistant",
            "content": analysis,
            "type": "analysis"
        })

        return analysis

    def ask_question(self, user_question):

        if not self.current_prediction:
            return "I don't have any credit assessment data to reference. Please provide a credit report first."

        messages = [
            {"role": "system", "content": self._build_system_prompt()}
        ]

        recent_history = self.conversation_history[-10:]
        messages.extend([
            {"role": msg["role"], "content": msg["content"]}
            for msg in recent_history
        ])

        messages.append({"role": "user", "content": user_question})

        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=messages,
            temperature=self.temperature,
            max_tokens=800
        )

        answer = response.choices[0].message.content

        self.conversation_history.append({"role": "user", "content": user_question})
        self.conversation_history.append({"role": "assistant", "content": answer})

        return answer

    def explain_feature(self, feature_name):
        if not self.current_user_data or feature_name not in self.current_user_data:
            return f"I don't have information about '{feature_name}' in the current assessment."

        feature_value = self.current_user_data[feature_name]

        shap_impact = "unknown"
        if self.top_contributing_features:
            for feature in self.top_contributing_features:
                if feature.get('feature') == feature_name:
                    shap_value = feature.get('shap_value', 0)
                    direction = "increasing" if shap_value > 0 else "decreasing"
                    shap_impact = f"{direction} risk by {abs(shap_value):.4f}"
                    break

        explanation_prompt = f"""Explain the credit feature '{feature_name}' to the user:

Current Value: {feature_value:.2f}
Impact on Risk: {shap_impact}

Please explain:
1. What this feature means in plain language
2. How the current value compares to typical/healthy ranges
3. How it's affecting their credit risk (if SHAP data available)
4. Specific actions they can take to improve this metric

Be clear, practical, and encouraging."""

        messages = [
            {"role": "system", "content": self._build_system_prompt()},
            {"role": "user", "content": explanation_prompt}
        ]

        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=messages,
            temperature=self.temperature,
            max_tokens=600
        )

        return response.choices[0].message.content

    def compare_scenarios(self, scenario_changes):
        scenario_prompt = f"""The user wants to understand how their credit risk would change if they made these improvements:

"""
        for feature, new_value in scenario_changes.items():
            current_value = self.current_user_data.get(feature, "N/A")
            scenario_prompt += f"- {feature}: {current_value} → {new_value}\n"

        scenario_prompt += """

Based on the model's feature importance and SHAP values, explain:
1. How each change would likely impact their overall risk score
2. Which changes would have the most significant impact
3. A realistic timeline for implementing these changes
4. Any potential challenges they might face

Be specific and practical in your advice."""

        messages = [
            {"role": "system", "content": self._build_system_prompt()},
            {"role": "user", "content": scenario_prompt}
        ]

        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=messages,
            temperature=self.temperature,
            max_tokens=800
        )

        return response.choices[0].message.content

    def reset_conversation(self):
        self.conversation_history = []

    def get_conversation_history(self):
        return self.conversation_history


if __name__ == "__main__":
    analyst = CreditAnalyst()

    mock_prediction = {
        'prediction_proba': 0.73,
        'prediction_label': 'HIGH RISK',
        'user_features': {
            'credit_utilization': 85.5,
            'payment_history_pct': 75.0,
            'credit_age_months': 18.5,
            'hard_inquiries': 6,
            'total_spending_pct': 110.0,
            'spending_velocity': 25.0,
            'impulse_spending_score': 65.0,
            'recurring_payment_ratio': 40.0
        },
        'top_features': [
            {'feature': 'credit_utilization', 'value': 85.5, 'shap_value': 0.125},
            {'feature': 'hard_inquiries', 'value': 6, 'shap_value': 0.089},
            {'feature': 'total_spending_pct', 'value': 110.0, 'shap_value': 0.076},
            {'feature': 'payment_history_pct', 'value': 75.0, 'shap_value': 0.065},
            {'feature': 'impulse_spending_score', 'value': 65.0, 'shap_value': 0.052}
        ]
    }

    analyst.set_context(mock_prediction)

    print("=== CREDIT RISK ANALYSIS ===\n")
    analysis = analyst.analyze_prediction()
    print(analysis)

    print("\n\n=== Q&A EXAMPLE ===\n")
    question = "Why is my credit utilization hurting my score?"
    answer = analyst.ask_question(question)
    print(f"Q: {question}")
    print(f"A: {answer}")
