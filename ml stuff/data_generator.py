"""
Synthetic Credit Data Generator
Generates realistic credit and banking data for credit risk modeling
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from faker import Faker
import random

fake = Faker()
Faker.seed(42)
np.random.seed(42)


class CreditDataGenerator:
    """Generate synthetic credit and banking data"""

    def __init__(self, n_samples=1000):
        self.n_samples = n_samples
        self.spending_categories = [
            'groceries', 'dining', 'entertainment', 'utilities',
            'transportation', 'shopping', 'healthcare', 'travel',
            'subscriptions', 'miscellaneous'
        ]

    def generate_traditional_credit_features(self):
        """Generate traditional credit bureau features"""
        data = []

        for i in range(self.n_samples):
            # Credit utilization (0-100%)
            credit_limit = np.random.uniform(1000, 50000)
            credit_used = np.random.uniform(0, credit_limit * 1.2)  # Can go over limit
            credit_utilization = min((credit_used / credit_limit) * 100, 150)

            # Age of credit (months)
            credit_age_months = np.random.gamma(shape=3, scale=20)

            # Number of hard inquiries (last 12 months)
            # Riskier profiles tend to have more inquiries
            hard_inquiries = np.random.poisson(lam=2)

            # Payment history (% on-time payments over last 24 months)
            base_payment_rate = np.random.beta(8, 2) * 100  # Skewed toward good payment
            payment_history_pct = min(100, base_payment_rate)

            # Number of late payments (30, 60, 90 days)
            late_30_days = np.random.poisson(lam=1) if payment_history_pct < 90 else 0
            late_60_days = np.random.poisson(lam=0.5) if payment_history_pct < 80 else 0
            late_90_days = np.random.poisson(lam=0.3) if payment_history_pct < 70 else 0

            # Number of credit accounts
            num_credit_accounts = np.random.poisson(lam=5) + 1

            # Total credit limit across all accounts
            total_credit_limit = credit_limit * np.random.uniform(1.5, 4)

            data.append({
                'credit_utilization': credit_utilization,
                'credit_age_months': credit_age_months,
                'hard_inquiries': hard_inquiries,
                'payment_history_pct': payment_history_pct,
                'late_30_days': late_30_days,
                'late_60_days': late_60_days,
                'late_90_days': late_90_days,
                'num_credit_accounts': num_credit_accounts,
                'total_credit_limit': total_credit_limit,
                'current_balance': credit_used
            })

        return pd.DataFrame(data)

    def generate_spending_patterns(self):
        """Generate spending category and behavioral features"""
        data = []

        for i in range(self.n_samples):
            # Monthly income (used to normalize spending)
            monthly_income = np.random.lognormal(mean=10, sigma=0.6)

            # Generate spending by category (as % of income)
            spending_by_category = {}
            total_spending = 0

            for category in self.spending_categories:
                # Different categories have different typical spending levels
                if category == 'groceries':
                    pct = np.random.uniform(5, 15)
                elif category == 'dining':
                    pct = np.random.uniform(2, 10)
                elif category == 'entertainment':
                    pct = np.random.uniform(1, 8)
                elif category == 'utilities':
                    pct = np.random.uniform(5, 12)
                elif category == 'transportation':
                    pct = np.random.uniform(3, 15)
                elif category == 'shopping':
                    pct = np.random.uniform(2, 12)
                elif category == 'healthcare':
                    pct = np.random.uniform(1, 8)
                elif category == 'travel':
                    pct = np.random.uniform(0, 10)
                elif category == 'subscriptions':
                    pct = np.random.uniform(1, 5)
                else:  # miscellaneous
                    pct = np.random.uniform(1, 6)

                spending_by_category[f'spending_{category}_pct'] = pct
                total_spending += pct

            # Total spending as % of income
            total_spending_pct = total_spending

            # Spending velocity (change in spending over time)
            # Positive = increasing spending, negative = decreasing
            spending_velocity = np.random.normal(0, 15)  # % change per month

            # Impulse spending score (0-100)
            # Based on frequency of unusual large purchases
            impulse_spending_score = np.random.beta(2, 5) * 100

            data.append({
                'monthly_income': monthly_income,
                **spending_by_category,
                'total_spending_pct': total_spending_pct,
                'spending_velocity': spending_velocity,
                'impulse_spending_score': impulse_spending_score
            })

        return pd.DataFrame(data)

    def generate_payment_patterns(self):
        """Generate time series payment behavior patterns"""
        data = []

        for i in range(self.n_samples):
            # Recurring payment ratio (0-100%)
            # Higher = more predictable/stable payment pattern
            recurring_payment_ratio = np.random.beta(4, 2) * 100

            # One-time payment ratio
            onetime_payment_ratio = 100 - recurring_payment_ratio

            # Payment consistency score (0-100)
            # Measures how consistent payment amounts are month-to-month
            payment_consistency = np.random.beta(5, 2) * 100

            # Payment timing regularity (days variance from due date)
            # Lower = more regular, pays on time
            payment_timing_variance = np.random.exponential(scale=5)

            # Minimum payment frequency (% of times only min payment made)
            min_payment_frequency = np.random.beta(2, 8) * 100

            # Average days before due date payment is made
            # Positive = early, negative = late
            avg_days_before_due = np.random.normal(2, 7)

            data.append({
                'recurring_payment_ratio': recurring_payment_ratio,
                'onetime_payment_ratio': onetime_payment_ratio,
                'payment_consistency': payment_consistency,
                'payment_timing_variance': payment_timing_variance,
                'min_payment_frequency': min_payment_frequency,
                'avg_days_before_due': avg_days_before_due
            })

        return pd.DataFrame(data)

    def generate_target_variable(self, df):
        """
        Generate credit risk target based on features
        1 = high risk (likely to default), 0 = low risk
        """
        risk_score = 0

        # Traditional credit factors
        risk_score += (df['credit_utilization'] > 80) * 15
        risk_score += (df['credit_age_months'] < 12) * 10
        risk_score += (df['hard_inquiries'] > 4) * 8
        risk_score += (100 - df['payment_history_pct']) * 0.5
        risk_score += df['late_60_days'] * 10
        risk_score += df['late_90_days'] * 15

        # Spending pattern factors
        risk_score += (df['total_spending_pct'] > 100) * 12
        risk_score += (df['spending_velocity'] > 20) * 8
        risk_score += (df['impulse_spending_score']) * 0.1

        # Payment pattern factors
        risk_score += (df['min_payment_frequency'] > 50) * 10
        risk_score += (df['payment_timing_variance'] > 10) * 5
        risk_score += (df['avg_days_before_due'] < -5) * 8

        # Add some randomness
        risk_score += np.random.normal(0, 10, size=len(df))

        # Convert to binary (threshold can be adjusted)
        threshold = np.percentile(risk_score, 70)  # Top 30% are high risk
        return (risk_score > threshold).astype(int)

    def generate_dataset(self):
        """Generate complete synthetic dataset"""
        print("Generating traditional credit features...")
        traditional_features = self.generate_traditional_credit_features()

        print("Generating spending patterns...")
        spending_features = self.generate_spending_patterns()

        print("Generating payment patterns...")
        payment_features = self.generate_payment_patterns()

        # Combine all features
        df = pd.concat([traditional_features, spending_features, payment_features], axis=1)

        print("Generating target variable (credit risk)...")
        df['is_high_risk'] = self.generate_target_variable(df)

        print(f"\nDataset generated: {len(df)} samples")
        print(f"Features: {len(df.columns) - 1}")
        print(f"High risk ratio: {df['is_high_risk'].mean():.2%}")

        return df


if __name__ == "__main__":
    # Generate sample dataset
    generator = CreditDataGenerator(n_samples=5000)
    df = generator.generate_dataset()

    # Save to CSV
    output_file = "credit_data_synthetic.csv"
    df.to_csv(output_file, index=False)
    print(f"\nData saved to {output_file}")

    # Display summary statistics
    print("\n" + "="*50)
    print("DATASET SUMMARY")
    print("="*50)
    print(df.describe())
    print("\n" + "="*50)
    print("TARGET DISTRIBUTION")
    print("="*50)
    print(df['is_high_risk'].value_counts())
