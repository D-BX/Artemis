import os
import sys
from data_generator import CreditDataGenerator
from credit_risk_model import CreditRiskModel
from model_interpretability import ModelInterpreter


def main():

    print("="*80)
    print("CREDIT RISK ANALYSIS PIPELINE")
    print("="*80)

    print("\n[STEP 1/4] Generating synthetic credit data...")
    print("-"*80)
    generator = CreditDataGenerator(n_samples=5000)
    df = generator.generate_dataset()
    df.to_csv("credit_data_synthetic.csv", index=False)
    print(f"✓ Synthetic data saved: credit_data_synthetic.csv")

    print("\n[STEP 2/4] Training XGBoost credit risk model...")
    print("-"*80)
    model = CreditRiskModel()
    X_train, X_test, y_train, y_test = model.prepare_data(df)
    model.train(X_train, y_train, X_test, y_test, verbose=False)
    print("✓ Model training complete")

    print("\n[STEP 3/4] Evaluating model performance...")
    print("-"*80)
    metrics = model.evaluate(X_test, y_test)

    os.makedirs("outputs", exist_ok=True)

    # Get feature importance (no plotting)
    feature_importance = model.get_feature_importance()
    print("\nTop 10 Most Important Features:")
    print(feature_importance.head(10))

    model.save_model('outputs/credit_risk_model.pkl')
    print("✓ Model evaluation complete")

    print("\n[STEP 4/4] Running SHAP/XAI interpretability analysis...")
    print("-"*80)
    interpreter = ModelInterpreter(model, X_train, X_test)
    interpreter.compute_shap_values()

    # Generate SHAP visualizations for frontend
    interpreter.plot_summary(max_display=20, save_path='outputs/shap_summary.png')
    interpreter.plot_bar_importance(max_display=20, save_path='outputs/shap_bar.png')

    print("\nGenerating individual prediction explanations...")
    for idx in [0, 10, 50]:
        explanation = interpreter.explain_prediction(idx, top_n=10)
        interpreter.plot_waterfall(idx, save_path=f'outputs/waterfall_sample_{idx}.png')

    interpreter.plot_force(sample_idx=0, save_path='outputs/force_plot.html')

    # Generate dependence plots for top features
    top_features = feature_importance.head(5)['feature'].tolist()
    print(f"\nGenerating dependence plots for top 5 features: {top_features}")
    for feature in top_features:
        interpreter.plot_dependence(feature, save_path=f'outputs/dependence_{feature}.png')

    cohort_comparison = interpreter.generate_cohort_analysis()
    cohort_comparison.to_csv('outputs/cohort_analysis.csv')

    print("\n✓ SHAP/XAI analysis complete")

    print("\n" + "="*80)
    print("ANALYSIS PIPELINE COMPLETE")
    print("="*80)
    print("\nGenerated outputs in 'outputs/' directory:")
    print("\nModel:")
    print("  - credit_risk_model.pkl: Trained model")
    print("\nSHAP/XAI Visualizations (for frontend):")
    print("  - shap_summary.png: Feature impact summary")
    print("  - shap_bar.png: Mean absolute SHAP values")
    print("  - waterfall_sample_*.png: Individual prediction breakdowns")
    print("  - force_plot.html: Interactive force plot")
    print("  - dependence_*.png: Feature effect plots")
    print("  - cohort_analysis.csv: Risk cohort comparison")
    print("\nData:")
    print("  - credit_data_synthetic.csv: Generated dataset")
    print("="*80)

    return model, interpreter


if __name__ == "__main__":
    model, interpreter = main()
