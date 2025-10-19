from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
from io import BytesIO

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from llm.credit_analyst import CreditAnalyst
from ml.credit_risk_model import CreditRiskModel
from data.prediction_manager import PredictionManager
from api.pdf_parser import StatementParser

app = Flask(__name__)
CORS(app)

model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'outputs', 'credit_risk_model.pkl')
prediction_manager = PredictionManager()

try:
    prediction_manager.load_model(model_path)
    print(f"Model loaded successfully from {model_path}")
except Exception as e:
    print(f"Warning: Could not load model: {e}")

credit_analyst = CreditAnalyst()
statement_parser = StatementParser()

@app.route('/api/parse-statement', methods=['POST'])
def parse_statement():
    try:
        print("Received parse-statement request")

        if 'file' not in request.files:
            print("No file in request")
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        print(f"File received: {file.filename}")

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not file.filename.endswith('.pdf'):
            return jsonify({'error': 'File must be a PDF'}), 400

        print("Reading PDF bytes...")
        pdf_bytes = BytesIO(file.read())

        print("Parsing statement...")
        parsed_data = statement_parser.parse_statement(pdf_bytes)

        print(f"Parsed {len(parsed_data.get('transactions', []))} transactions")
        print(f"Total spent: ${parsed_data.get('totalSpent', 0)}")
        print(f"Categories: {list(parsed_data.get('categories', {}).keys())}")

        return jsonify(parsed_data)

    except Exception as e:
        print(f"Error parsing statement: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message')
        spending_data = data.get('spending_data')

        if not message:
            return jsonify({'error': 'Message is required'}), 400

        # Create rich context from spending data if provided
        if spending_data:
            # Build user features dict for credit analyst
            total_spent = spending_data.get('totalSpent', 0)
            budget = spending_data.get('monthlyBudget', 2000)

            user_features = {
                'total_spending': total_spent,
                'monthly_budget': budget,
                'total_spending_pct': min(200, (total_spent / budget) * 100),
                'spending_velocity': spending_data.get('spendingRate', 0),
                'payment_consistency': spending_data.get('cashStability', 0),
                'impulse_spending_score': max(0, 100 - spending_data.get('cashStability', 0)),
                'budget_adherence': 100 - min(100, abs(spending_data.get('budgetOverage', 0) / budget * 100)),
                'budget_overage_amount': spending_data.get('budgetOverage', 0),
                'days_in_period': spending_data.get('daysInPeriod', 30),
                'num_transactions': len(spending_data.get('transactions', [])),
            }

            # Add category spending details
            categories = spending_data.get('categories', {})
            for category, amount in categories.items():
                clean_category = category.lower().replace(' & ', '_').replace(' ', '_')
                user_features[f'spending_{clean_category}'] = amount
                user_features[f'spending_{clean_category}_pct'] = (amount / total_spent * 100) if total_spent > 0 else 0

            # Add transaction details summary
            transactions = spending_data.get('transactions', [])
            if transactions:
                user_features['avg_transaction_amount'] = total_spent / len(transactions) if len(transactions) > 0 else 0
                user_features['num_categories'] = len(categories)

                # Get top merchants
                merchant_totals = {}
                for txn in transactions:
                    merchant = txn.get('merchant', 'Unknown')
                    merchant_totals[merchant] = merchant_totals.get(merchant, 0) + txn.get('amount', 0)

                top_merchants = sorted(merchant_totals.items(), key=lambda x: x[1], reverse=True)[:5]
                user_features['top_merchants'] = ', '.join([f"{m[0]} (${m[1]:.2f})" for m in top_merchants])

            # Build top features list for SHAP-style explanation
            top_features = [
                {
                    'feature': 'Spending Consistency',
                    'value': spending_data.get('cashStability', 0),
                    'shap_value': 0.15 if spending_data.get('cashStability', 0) >= 70 else -0.15,
                },
                {
                    'feature': 'Budget Adherence',
                    'value': user_features['budget_adherence'],
                    'shap_value': 0.12 if spending_data.get('budgetOverage', 0) <= 0 else -0.18,
                },
                {
                    'feature': 'Spending Velocity',
                    'value': spending_data.get('spendingRate', 0),
                    'shap_value': -0.10 if spending_data.get('spendingRate', 0) > 100 else 0.08,
                },
            ]

            # Set context for credit analyst
            prediction_context = {
                'prediction_proba': 0.5,  # Neutral starting point
                'prediction_label': 'MODERATE RISK',
                'user_features': user_features,
                'top_features': top_features,
                'spending_summary': {
                    'total_spent': total_spent,
                    'categories': categories,
                    'transactions': transactions[:10],  # Include first 10 transactions as examples
                    'budget_status': 'over budget' if spending_data.get('budgetOverage', 0) > 0 else 'under budget',
                }
            }

            credit_analyst.set_context(prediction_context)

        # Ask the question to the LLM
        response = credit_analyst.ask_question(message)

        return jsonify({'response': response})

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/analyze-credit', methods=['POST'])
def analyze_credit():
    try:
        data = request.json
        user_features = data.get('features')

        if not user_features:
            return jsonify({'error': 'User features are required'}), 400

        prediction = prediction_manager.predict(user_features)

        return jsonify({
            'risk_prediction': prediction['risk_prediction'],
            'probability': prediction['probability'],
            'feature_importance': prediction.get('feature_importance', {}),
        })

    except Exception as e:
        print(f"Error in analyze-credit endpoint: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/spending-insights', methods=['POST'])
def spending_insights():
    try:
        data = request.json
        spending_data = data.get('spending_data')

        if not spending_data:
            return jsonify({'error': 'Spending data is required'}), 400

        total_spent = spending_data.get('totalSpent', 0)
        categories = spending_data.get('categories', {})
        spending_rate = spending_data.get('spendingRate', 0)
        cash_stability = spending_data.get('cashStability', 0)
        budget_overage = spending_data.get('budgetOverage', 0)

        insights = []

        if budget_overage > 20:
            insights.append({
                'type': 'warning',
                'message': f'You are {budget_overage}% over budget. Consider reducing spending in high categories.',
            })
        elif budget_overage < -10:
            insights.append({
                'type': 'success',
                'message': f'Great job! You are {abs(budget_overage)}% under budget.',
            })

        if cash_stability < 60:
            insights.append({
                'type': 'warning',
                'message': 'Your spending patterns are inconsistent. Try to maintain more regular spending habits.',
            })

        if categories:
            top_category = max(categories.items(), key=lambda x: x[1])
            if (top_category[1] / total_spent) > 0.4:
                insights.append({
                    'type': 'info',
                    'message': f'{top_category[0]} represents {(top_category[1] / total_spent * 100):.1f}% of your spending. Consider if this aligns with your priorities.',
                })

        user_context = {
            'total_spending_pct': min(100, (total_spent / 2000) * 100),
            'payment_consistency': cash_stability,
            'impulse_spending_score': max(0, 100 - cash_stability),
        }

        credit_analyst.set_user_data(user_context)
        llm_insights = credit_analyst.ask(
            "Based on my spending patterns, what advice do you have for improving my financial health?"
        )

        insights.append({
            'type': 'ai',
            'message': llm_insights,
        })

        return jsonify({'insights': insights})

    except Exception as e:
        print(f"Error in spending-insights endpoint: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'model_loaded': prediction_manager.model is not None})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
