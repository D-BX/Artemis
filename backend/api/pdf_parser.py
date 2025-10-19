import PyPDF2
import re
from datetime import datetime
from typing import List, Dict, Any

class StatementParser:
    def __init__(self):
        self.categories = {
            'Travel & Entertainment': [
                'airline', 'hotel', 'travel', 'uber', 'lyft', 'taxi', 'airbnb', 'flight', 'airways',
                'amtrak', 'bus', 'transit', 'entertainment', 'flix', 'expedia', 'united', 'peter pan',
                'mbta', 'trip'
            ],
            'Restaurants': [
                'restaurant', 'cafe', 'food', 'dining', 'pizza', 'burger', 'sushi', 'bar', 'grill',
                'kitchen', 'coffee', 'bakery', 'chick-fil-a', 'panda', 'fogo', 'ichiban', 'whataburger',
                'eats', 'tst*', 'moms kitchen'
            ],
            'Merchandise': [
                'amazon', 'walmart', 'target', 'store', 'shop', 'retail', 'mall', 'ebay', 'stockx',
                'bloomingdales', 'ulta', 'face shop', 'clairo', 'meta store'
            ],
            'Gas Stations': ['gas', 'fuel', 'shell', 'chevron', 'exxon', 'mobil', 'bp', 'petrol'],
            'Supermarkets': [
                'grocery', 'market', 'supermarket', 'whole foods', 'trader', 'safeway', 'kroger',
                'star market'
            ],
            'Services': ['ups', 'shipping', 'service', 'delivery'],
            'Department Store': ['department', 'bloomingdale', 'macys', 'nordstrom'],
        }

    def categorize_transaction(self, merchant: str) -> str:
        merchant_lower = merchant.lower()

        for category, keywords in self.categories.items():
            if any(keyword in merchant_lower for keyword in keywords):
                return category

        return 'Other'

    def extract_text_from_pdf(self, pdf_file) -> str:
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            full_text = ""

            for page in pdf_reader.pages:
                full_text += page.extract_text() + "\n"

            return full_text
        except Exception as e:
            raise Exception(f"Error extracting PDF text: {str(e)}")

    def parse_transactions(self, text: str) -> List[Dict[str, Any]]:
        transactions = []
        lines = text.split('\n')

        # Updated patterns to match more formats
        date_patterns = [
            r'(\d{2}/\d{2}/\d{4})',  # MM/DD/YYYY
            r'(\d{2}/\d{2})',         # MM/DD
            r'(\d{1,2}-\d{1,2}-\d{4})', # M-D-YYYY
        ]

        amount_pattern = r'\$?([\d,]+\.\d{2})'

        for line in lines:
            line = line.strip()
            if not line or len(line) < 10:
                continue

            # Try each date pattern
            date_match = None
            for pattern in date_patterns:
                date_match = re.search(pattern, line)
                if date_match:
                    break

            if not date_match:
                continue

            # Find all amounts in the line
            amount_matches = list(re.finditer(amount_pattern, line))

            if not amount_matches:
                continue

            # Usually the last amount is the transaction amount
            amount_match = amount_matches[-1]
            amount = float(amount_match.group(1).replace(',', ''))

            if amount <= 0:
                continue

            date = date_match.group(1)

            # Extract merchant (text between date and amount)
            merchant_start = date_match.end()
            merchant_end = amount_match.start()
            merchant = line[merchant_start:merchant_end].strip()

            # Clean up merchant name
            merchant = re.sub(r'\s+', ' ', merchant)
            merchant = merchant[:100]  # Limit length

            if len(merchant) < 3:
                continue

            category = self.categorize_transaction(merchant)

            transactions.append({
                'date': date,
                'merchant': merchant,
                'category': category,
                'amount': amount
            })

        return transactions

    def calculate_metrics(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not transactions:
            return {
                'totalSpent': 0,
                'categories': {},
                'weeklySpending': [],
                'dailySpending': [],
                'spendingRate': 0,
                'cashStability': 0,
                'budgetOverage': 0,
                'daysInPeriod': 0
            }

        # Calculate totals by category
        categories = {}
        total_spent = 0

        for transaction in transactions:
            category = transaction['category']
            amount = transaction['amount']
            categories[category] = categories.get(category, 0) + amount
            total_spent += amount

        # Calculate daily spending
        daily_map = {}
        for transaction in transactions:
            date = transaction['date']
            daily_map[date] = daily_map.get(date, 0) + transaction['amount']

        daily_spending = [
            {'date': date, 'amount': round(amount, 2)}
            for date, amount in sorted(daily_map.items())
        ]

        # Calculate weekly spending for the chart
        weekly_map = {}
        for transaction in transactions:
            date_parts = transaction['date'].split('/')
            if len(date_parts) >= 2:
                day = int(date_parts[1] if date_parts[1].isdigit() else date_parts[0])

                if day <= 7:
                    week = 'Week 1'
                elif day <= 14:
                    week = 'Week 2'
                elif day <= 21:
                    week = 'Week 3'
                else:
                    week = 'Week 4'

                weekly_map[week] = weekly_map.get(week, 0) + transaction['amount']

        weekly_spending = [
            {'week': week, 'amount': round(amount, 2)}
            for week, amount in weekly_map.items()
        ]

        # Calculate metrics based on days, not weeks
        num_days = len(daily_map)
        if num_days > 0:
            spending_rate = round(total_spent / num_days, 2)

            # Calculate stability based on daily variance (coefficient of variation)
            avg_daily = total_spent / num_days
            variance = sum((amount - avg_daily) ** 2 for amount in daily_map.values()) / num_days
            std_dev = variance ** 0.5

            if avg_daily > 0:
                # Coefficient of variation (CV) - lower is more stable
                cv = (std_dev / avg_daily) * 100
                # Convert to stability score (0-100, where 100 is most stable)
                # A CV of 0% = 100 stability, CV of 100%+ = 0 stability
                cash_stability = max(0, min(100, round(100 - cv)))
            else:
                cash_stability = 100
        else:
            spending_rate = 0
            cash_stability = 0

        monthly_budget = 2000
        budget_overage = round(total_spent - monthly_budget, 2)

        return {
            'totalSpent': round(total_spent, 2),
            'categories': {k: round(v, 2) for k, v in categories.items()},
            'weeklySpending': weekly_spending,
            'dailySpending': daily_spending,
            'spendingRate': spending_rate,
            'cashStability': cash_stability,
            'budgetOverage': budget_overage,
            'daysInPeriod': num_days,
            'monthlyBudget': monthly_budget
        }

    def parse_statement(self, pdf_file) -> Dict[str, Any]:
        try:
            text = self.extract_text_from_pdf(pdf_file)
            transactions = self.parse_transactions(text)
            metrics = self.calculate_metrics(transactions)

            return {
                'transactions': transactions,
                **metrics
            }
        except Exception as e:
            raise Exception(f"Error parsing statement: {str(e)}")
