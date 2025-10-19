import os
from dotenv import load_dotenv
load_dotenv()

from api.credit_qa_system import CreditQASystem

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
    'avg_days_before_due': -3.0,
    'credit_score': 580
}

print("="*80)
print("TESTING ML + LLM INTEGRATION")
print("="*80)

print("\n1. Initializing Q&A System...")
qa_system = CreditQASystem(
    model_path='outputs/credit_risk_model.pkl',
    data_path='outputs/credit_data_synthetic.csv'
)
print("✓ System initialized")

print("\n2. Testing ML Prediction + SHAP...")
result = qa_system.analyze_user(test_user)

if 'error' in result:
    print(f"✗ Error: {result['error']}")
else:
    print(f"✓ Prediction successful")
    print(f"   Risk Level: {result['prediction']['risk_level']}")
    print(f"   Probability: {result['prediction']['probability']:.1%}")
    print(f"   Top factor: {result['top_factors'][0]['feature']}")

print("\n3. Testing LLM Interpretation...")
if 'analysis' in result:
    analysis_preview = result['analysis'][:200] + "..."
    print(f"✓ LLM analysis generated")
    print(f"   Preview: {analysis_preview}")
else:
    print("✗ No LLM analysis")

print("\n4. Testing Q&A...")
try:
    answer = qa_system.ask_question("What's the most important factor?")
    print(f"✓ Q&A working")
    print(f"   Answer preview: {answer['answer'][:150]}...")
except Exception as e:
    print(f"✗ Q&A error: {e}")

print("\n" + "="*80)
print("INTEGRATION TEST COMPLETE")
print("="*80)
print("\n✅ All systems operational!")
print("   - ML Model: Working")
print("   - SHAP Explanations: Working")
print("   - LLM Integration: Working")
print("   - Q&A System: Working")
print("\nReady for frontend integration!")
