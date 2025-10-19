# Credit Risk Analysis with XGBoost and SHAP

A comprehensive credit risk modeling system using XGBoost for prediction and SHAP for explainability. This project analyzes both traditional credit bureau data and modern banking behavioral patterns.

## Features

### Data Generation
- **Traditional Credit Features**:
  - Credit utilization (%)
  - Age of credit history (months)
  - Number of hard inquiries
  - Payment history (% on-time)
  - Late payment counts (30/60/90 days)
  - Number of credit accounts
  - Total credit limits

- **Smart Banking Features**:
  - **Spending Categories**: Analysis across 10 categories (groceries, dining, entertainment, utilities, transportation, shopping, healthcare, travel, subscriptions, misc)
  - **Spending Velocity**: Rate of change in spending patterns
  - **Impulse Spending Score**: Frequency of unusual large purchases

- **Payment Pattern Analysis**:
  - Recurring vs. one-time payment ratios
  - Payment consistency scores
  - Payment timing regularity
  - Minimum payment frequency
  - Average days before due date

### Machine Learning
- XGBoost classifier for credit risk prediction
- Comprehensive model evaluation metrics
- Feature importance analysis
- Cross-validation support

### Explainability (XAI)
- **SHAP (SHapley Additive exPlanations)**:
  - Global feature importance
  - Individual prediction explanations
  - Feature interaction analysis
  - Cohort analysis (high-risk vs low-risk)
  - Multiple visualization types

## Project Structure

```
ml stuff/
├── requirements.txt              # Python dependencies
├── data_generator.py             # Synthetic data generation
├── credit_risk_model.py          # XGBoost model training and evaluation
├── model_interpretability.py     # SHAP and XAI analysis
├── run_analysis.py               # Complete pipeline script
└── README.md                     # This file
```

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Quick Start - Run Complete Pipeline

```bash
python run_analysis.py
```

This will:
1. Generate 5,000 synthetic credit samples
2. Train an XGBoost model
3. Evaluate model performance
4. Generate SHAP interpretability analysis
5. Save all outputs to `outputs/` directory

### Step-by-Step Usage

#### 1. Generate Synthetic Data

```python
from data_generator import CreditDataGenerator

# Generate 5000 samples
generator = CreditDataGenerator(n_samples=5000)
df = generator.generate_dataset()
df.to_csv("credit_data_synthetic.csv", index=False)
```

#### 2. Train Model

```python
from credit_risk_model import CreditRiskModel

# Load data
df = pd.read_csv("credit_data_synthetic.csv")

# Initialize and train model
model = CreditRiskModel()
X_train, X_test, y_train, y_test = model.prepare_data(df)
model.train(X_train, y_train, X_test, y_test)

# Evaluate
metrics = model.evaluate(X_test, y_test)

# Save model
model.save_model('credit_risk_model.pkl')
```

#### 3. SHAP Analysis

```python
from model_interpretability import ModelInterpreter

# Initialize interpreter
interpreter = ModelInterpreter(model, X_train, X_test)
interpreter.compute_shap_values()

# Generate visualizations
interpreter.plot_summary(max_display=20, save_path='shap_summary.png')
interpreter.plot_bar_importance(max_display=20, save_path='shap_bar.png')

# Explain individual prediction
interpreter.explain_prediction(sample_idx=0, top_n=10)
interpreter.plot_waterfall(sample_idx=0, save_path='waterfall.png')

# Feature dependence
interpreter.plot_dependence('credit_utilization', save_path='dependence.png')

# Cohort analysis
cohort_comparison = interpreter.generate_cohort_analysis()
```

## Output Files

After running the pipeline, you'll find these files in the `outputs/` directory:

### Model Performance
- `roc_curve.png` - ROC curve showing model discrimination
- `pr_curve.png` - Precision-Recall curve
- `confusion_matrix.png` - Classification confusion matrix
- `feature_importance.png` - XGBoost feature importance
- `credit_risk_model.pkl` - Trained model (can be loaded for predictions)

### SHAP Interpretability
- `shap_summary.png` - Global feature impact summary (beeswarm plot)
- `shap_bar.png` - Mean absolute SHAP values (bar chart)
- `waterfall_sample_*.png` - Individual prediction breakdowns
- `force_plot.html` - Interactive visualization of prediction forces
- `dependence_*.png` - Feature effect and interaction plots
- `cohort_analysis.csv` - Comparison between high-risk and low-risk cohorts

### Data
- `credit_data_synthetic.csv` - Generated synthetic dataset

## Understanding the Results

### Feature Importance
The model identifies which features are most predictive of credit risk. Traditional features like payment history and credit utilization typically rank high, but behavioral features (spending velocity, impulse spending) provide additional predictive power.

### SHAP Values
- **Positive SHAP value**: Feature pushes prediction toward high risk
- **Negative SHAP value**: Feature pushes prediction toward low risk
- **Magnitude**: Shows strength of effect

### Interpreting Predictions

For any individual prediction, the waterfall plot shows:
1. Base value (average prediction)
2. How each feature pushes the prediction up or down
3. Final predicted probability

## Customization

### Adjust Model Parameters

```python
params = {
    'max_depth': 8,
    'learning_rate': 0.05,
    'n_estimators': 200,
    'subsample': 0.8,
    'colsample_bytree': 0.8
}
model = CreditRiskModel(params=params)
```

### Generate More/Less Data

```python
generator = CreditDataGenerator(n_samples=10000)
```

### Analyze Specific Features

```python
# Analyze interaction between two features
interpreter.analyze_feature_interactions('credit_utilization', 'payment_history_pct')
```

## Key Insights

This system demonstrates how modern credit risk modeling can benefit from:

1. **Traditional credit data** - Still highly predictive
2. **Behavioral patterns** - Spending velocity and categories add context
3. **Time series analysis** - Payment patterns reveal financial stability
4. **Explainability** - SHAP helps understand and trust model decisions

## License

This is a demonstration project for educational and research purposes.

## Next Steps

Potential enhancements:
- [ ] Add time series forecasting for payment behavior
- [ ] Incorporate external data sources (economic indicators)
- [ ] Implement fairness analysis across demographic groups
- [ ] Add model monitoring and drift detection
- [ ] Create REST API for real-time predictions
- [ ] Build interactive dashboard for exploration
