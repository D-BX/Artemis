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

        if spending_data:
            user_context = {
                'total_spent': spending_data.get('totalSpent', 0),
                'spending_rate': spending_data.get('spendingRate', 0),
                'cash_stability': spending_data.get('cashStability', 0),
                'budget_overage': spending_data.get('budgetOverage', 0),
            }

            if spending_data.get('categories'):
                for category, amount in spending_data['categories'].items():
                    user_context[f'spending_{category.lower()}'] = amount

            credit_analyst.set_user_data(user_context)

        response = credit_analyst.ask(message)

        return jsonify({'response': response})

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
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
