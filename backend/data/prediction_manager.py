"""
Prediction Manager
Handles ML predictions and prepares context for LLM interpretation
"""

import sys
import os
import pandas as pd
import numpy as np
import pickle

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.credit_risk_model import CreditRiskModel
from ml.model_interpretability import ModelInterpreter


class PredictionManager:
    """Manages credit risk predictions and prepares context for LLM analysis"""

    def __init__(self, model_path=None):
        """
        Initialize Prediction Manager

        Args:
            model_path: Path to trained model file (.pkl)
        """
        self.model = None
        self.interpreter = None
        self.model_path = model_path

        if model_path and os.path.exists(model_path):
            self.load_model(model_path)

    def load_model(self, model_path):
        """Load trained credit risk model"""
        try:
            self.model = CreditRiskModel.load_model(model_path)
            self.model_path = model_path
            print(f"Model loaded successfully from {model_path}")
        except Exception as e:
            print(f"Error loading model: {e}")
            raise

    def prepare_user_data(self, user_input):
        """
        Prepare user input data for prediction

        Args:
            user_input: Dictionary with user's credit features

        Returns:
            pd.DataFrame: Formatted feature dataframe
        """
        # Ensure all required features are present
        required_features = self.model.feature_names

        # Create DataFrame with user data
        user_df = pd.DataFrame([user_input])

        # Check for missing features
        missing_features = set(required_features) - set(user_df.columns)
        if missing_features:
            raise ValueError(f"Missing required features: {missing_features}")

        # Reorder columns to match training data
        user_df = user_df[required_features]

        return user_df

    def predict(self, user_input, explain=True):
        """
        Make credit risk prediction and generate explanation

        Args:
            user_input: Dictionary with user's credit features
            explain: Whether to generate SHAP explanations

        Returns:
            Dictionary with prediction results and explanations
        """
        if not self.model:
            raise ValueError("Model not loaded. Call load_model() first.")

        # Prepare data
        user_df = self.prepare_user_data(user_input)

        # Make prediction
        prediction_proba = self.model.model.predict_proba(user_df)[0, 1]
        prediction_label = "HIGH RISK" if prediction_proba > 0.5 else "LOW RISK"

        result = {
            'prediction_proba': float(prediction_proba),
            'prediction_label': prediction_label,
            'user_features': user_input
        }

        # Generate SHAP explanation if requested
        if explain:
            explanation = self._generate_explanation(user_df, user_input)
            result.update(explanation)

        return result

    def _generate_explanation(self, user_df, user_input):
        """
        Generate SHAP explanation for prediction

        Args:
            user_df: User data as DataFrame
            user_input: Original user input dict

        Returns:
            Dictionary with SHAP values and feature contributions
        """
        # Create interpreter if not exists
        if not self.interpreter:
            # Use a small sample for background (for efficiency)
            # In production, you'd load training data
            self.interpreter = ModelInterpreter(
                self.model,
                user_df,  # Temporary - should use actual training data
                user_df
            )
            self.interpreter.create_explainer()

        # Compute SHAP values
        shap_values = self.interpreter.explainer.shap_values(user_df)

        # Get feature contributions
        feature_contributions = []
        for i, feature_name in enumerate(self.model.feature_names):
            feature_contributions.append({
                'feature': feature_name,
                'value': float(user_input[feature_name]),
                'shap_value': float(shap_values[0][i]),
                'abs_shap': float(abs(shap_values[0][i]))
            })

        # Sort by absolute SHAP value
        feature_contributions.sort(key=lambda x: x['abs_shap'], reverse=True)

        # Get feature importance from model
        feature_importance = self.model.get_feature_importance()

        return {
            'shap_values': shap_values[0].tolist(),
            'top_features': feature_contributions[:10],  # Top 10 contributors
            'feature_importance': feature_importance.to_dict('records'),
            'base_value': float(self.interpreter.explainer.expected_value)
        }

    def batch_predict(self, user_inputs_list):
        """
        Make predictions for multiple users

        Args:
            user_inputs_list: List of user input dictionaries

        Returns:
            List of prediction results
        """
        results = []
        for user_input in user_inputs_list:
            try:
                result = self.predict(user_input, explain=False)
                results.append(result)
            except Exception as e:
                results.append({
                    'error': str(e),
                    'user_input': user_input
                })

        return results

    def get_feature_statistics(self, features_list=None):
        """
        Get statistics about important features

        Args:
            features_list: List of feature names (None = all features)

        Returns:
            Dictionary with feature statistics
        """
        if not self.model:
            raise ValueError("Model not loaded")

        if features_list is None:
            features_list = self.model.feature_names

        feature_importance = self.model.get_feature_importance()

        stats = {}
        for feature in features_list:
            if feature in feature_importance['feature'].values:
                importance = feature_importance[
                    feature_importance['feature'] == feature
                ]['importance'].values[0]

                stats[feature] = {
                    'importance': float(importance),
                    'rank': int(feature_importance[
                        feature_importance['feature'] == feature
                    ].index[0]) + 1
                }

        return stats

    def validate_input(self, user_input):
        """
        Validate user input data

        Args:
            user_input: Dictionary with user features

        Returns:
            Tuple of (is_valid: bool, error_message: str or None)
        """
        try:
            # Check for required features
            required_features = set(self.model.feature_names)
            provided_features = set(user_input.keys())

            missing = required_features - provided_features
            if missing:
                return False, f"Missing features: {missing}"

            extra = provided_features - required_features
            if extra:
                return False, f"Unknown features: {extra}"

            # Validate data types and ranges
            for feature, value in user_input.items():
                # Check if numeric
                if not isinstance(value, (int, float)):
                    return False, f"Feature '{feature}' must be numeric, got {type(value)}"

                # Check for NaN or inf
                if np.isnan(value) or np.isinf(value):
                    return False, f"Feature '{feature}' has invalid value: {value}"

            return True, None

        except Exception as e:
            return False, f"Validation error: {str(e)}"


class DataContextManager:
    """Manages data context for LLM queries"""

    def __init__(self, data_path=None):
        """
        Initialize Data Context Manager

        Args:
            data_path: Path to credit data CSV file
        """
        self.data = None
        self.data_stats = None

        if data_path and os.path.exists(data_path):
            self.load_data(data_path)

    def load_data(self, data_path):
        """Load credit data for context"""
        self.data = pd.read_csv(data_path)
        self._compute_statistics()
        print(f"Loaded {len(self.data)} records from {data_path}")

    def _compute_statistics(self):
        """Compute statistics on the dataset"""
        if self.data is None:
            return

        # Separate high risk and low risk
        high_risk = self.data[self.data['is_high_risk'] == 1]
        low_risk = self.data[self.data['is_high_risk'] == 0]

        self.data_stats = {
            'total_records': len(self.data),
            'high_risk_count': len(high_risk),
            'low_risk_count': len(low_risk),
            'high_risk_percentage': len(high_risk) / len(self.data) * 100,
            'feature_means_high_risk': high_risk.mean().to_dict(),
            'feature_means_low_risk': low_risk.mean().to_dict(),
            'feature_medians': self.data.median().to_dict(),
            'feature_std': self.data.std().to_dict()
        }

    def compare_to_population(self, user_input):
        """
        Compare user's features to population statistics

        Args:
            user_input: Dictionary with user features

        Returns:
            Dictionary with comparison results
        """
        if self.data is None:
            return None

        comparisons = {}
        for feature, value in user_input.items():
            if feature in self.data.columns:
                mean = self.data[feature].mean()
                median = self.data[feature].median()
                percentile = (self.data[feature] < value).sum() / len(self.data) * 100

                comparisons[feature] = {
                    'user_value': value,
                    'population_mean': float(mean),
                    'population_median': float(median),
                    'percentile': float(percentile),
                    'above_average': value > mean
                }

        return comparisons

    def get_similar_profiles(self, user_input, n=5):
        """
        Find similar credit profiles in the dataset

        Args:
            user_input: User's credit features
            n: Number of similar profiles to return

        Returns:
            DataFrame with similar profiles
        """
        if self.data is None:
            return None

        # Calculate distance to each record (simplified - Euclidean distance)
        features = [f for f in user_input.keys() if f in self.data.columns and f != 'is_high_risk']

        user_vector = np.array([user_input[f] for f in features])
        data_vectors = self.data[features].values

        # Normalize
        from sklearn.preprocessing import StandardScaler
        scaler = StandardScaler()
        user_normalized = scaler.fit_transform([user_vector])[0]
        data_normalized = scaler.transform(data_vectors)

        # Calculate distances
        distances = np.linalg.norm(data_normalized - user_normalized, axis=1)

        # Get top n similar
        similar_indices = np.argsort(distances)[:n]

        return self.data.iloc[similar_indices]


if __name__ == "__main__":
    # Example usage
    print("Testing Prediction Manager...")

    # Mock user data
    user_data = {
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

    # Note: You would need to train a model first
    # manager = PredictionManager(model_path='path/to/model.pkl')
    # result = manager.predict(user_data)
    # print(result)

    print("Prediction Manager ready for integration!")
