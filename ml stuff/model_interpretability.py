import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import shap
from credit_risk_model import CreditRiskModel

class ModelInterpreter:
    #this is where the XAI comes in - explaining decisions

    def __init__(self, model, X_train, X_test):
        # initializing the interpreter

        self.model = model.model
        self.X_train = X_train
        self.X_test = X_test
        self.feature_names = X_train.columns.tolist()
        self.explainer = None
        self.shap_values = None

    def create_explainer(self, background_samples=100):
        #this is creating our SHAP explainer
        print(f"\nCreating SHAP TreeExplainer with {background_samples} background samples...")

        #tree explainer for XGBoost - best for tress
        self.explainer = shap.TreeExplainer(self.model)
        print("SHAP explainer created")

    def compute_shap_values(self, X=None):
        #computing shap values for dataset
        # X is our dataset that we need to explain

        if self.explainer is None:
            self.create_explainer()
        if X is None:
            X = self.X_test
        
        self.shap_values = self.explainer.shap_values(X)

        return self.shap_values
    
    def plot_summary(self, max_display=20, save_path=None):
        if self.shap_values is None:
            self.compute_shap_values()

        print("\nGenerating SHAP summary plot...")
        plt.figure(figsize=(10, 8))
        shap.summary_plot(
            self.shap_values,
            self.X_test,
            max_display=max_display,
            show=False
        )

        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"SHAP summary plot saved to {save_path}")

        plt.show()
    
    def plot_bar_importance(self, max_display=20, save_path=None):
        if self.shap_values is None:
            self.compute_shap_values()

        print("\nGenerating SHAP bar plot...")
        plt.figure(figsize=(10, 8))
        shap.summary_plot(
            self.shap_values,
            self.X_test,
            plot_type="bar",
            max_display=max_display,
            show=False
        )

        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"SHAP bar plot saved to {save_path}")

        plt.show()

    def plot_waterfall(self, sample_idx=0, save_path=None):
        if self.shap_values is None:
            self.compute_shap_values()

        print(f"\nGenerating waterfall plot for sample {sample_idx}...")

        # Create explanation object
        explanation = shap.Explanation(
            values=self.shap_values[sample_idx],
            base_values=self.explainer.expected_value,
            data=self.X_test.iloc[sample_idx].values,
            feature_names=self.feature_names
        )

        plt.figure(figsize=(10, 8))
        shap.waterfall_plot(explanation, show=False)

        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"Waterfall plot saved to {save_path}")

        plt.show()

    def plot_force(self, sample_idx=0, save_path=None):

        if self.shap_values is None:
            self.compute_shap_values()

        print(f"\nGenerating force plot for sample {sample_idx}...")

        force_plot = shap.force_plot(
            self.explainer.expected_value,
            self.shap_values[sample_idx],
            self.X_test.iloc[sample_idx],
            feature_names=self.feature_names,
            matplotlib=False
        )

        if save_path:
            shap.save_html(save_path, force_plot)
            print(f"Force plot saved to {save_path}")

        return force_plot

    def plot_dependence(self, feature_name, interaction_feature=None, save_path=None):

        if self.shap_values is None:
            self.compute_shap_values()

        print(f"\nGenerating dependence plot for {feature_name}...")
        plt.figure(figsize=(10, 6))
        shap.dependence_plot(
            feature_name,
            self.shap_values,
            self.X_test,
            interaction_index=interaction_feature,
            show=False
        )

        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"Dependence plot saved to {save_path}")

        plt.show()

    def explain_prediction(self, sample_idx=0, top_n=10):

        if self.shap_values is None:
            self.compute_shap_values()

        sample_shap = self.shap_values[sample_idx]
        sample_features = self.X_test.iloc[sample_idx]

        explanation_df = pd.DataFrame({
            'feature': self.feature_names,
            'value': sample_features.values,
            'shap_value': sample_shap,
            'abs_shap': np.abs(sample_shap)
        }).sort_values('abs_shap', ascending=False)

        prediction_proba = self.model.predict_proba(sample_features.values.reshape(1, -1))[0, 1]
        prediction = "HIGH RISK" if prediction_proba > 0.5 else "LOW RISK"

        print("\n" + "="*70)
        print(f"PREDICTION EXPLANATION - Sample {sample_idx}")
        print("="*70)
        print(f"Predicted Risk: {prediction} (Probability: {prediction_proba:.2%})")
        print(f"Base Value (Average): {self.explainer.expected_value:.4f}")
        print(f"\nTop {top_n} Contributing Features:")
        print("-"*70)

        for idx, row in explanation_df.head(top_n).iterrows():
            direction = "increases" if row['shap_value'] > 0 else "decreases"
            print(f"{row['feature']:30s} = {row['value']:10.2f}  "
                  f"SHAP: {row['shap_value']:+.4f} ({direction} risk)")

        return explanation_df

    def analyze_feature_interactions(self, feature1, feature2, save_path=None):
        """
        Analyze interaction between two features

        Args:
            feature1: First feature name
            feature2: Second feature name
            save_path: Path to save plot
        """
        if self.shap_values is None:
            self.compute_shap_values()

        print(f"\nAnalyzing interaction between {feature1} and {feature2}...")

        # Compute interaction values
        shap_interaction_values = self.explainer.shap_interaction_values(self.X_test)

        # Get indices
        idx1 = self.feature_names.index(feature1)
        idx2 = self.feature_names.index(feature2)

        # Plot interaction
        plt.figure(figsize=(10, 6))
        shap.dependence_plot(
            (idx1, idx2),
            shap_interaction_values,
            self.X_test,
            show=False
        )

        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"Interaction plot saved to {save_path}")

        plt.show()

    def generate_cohort_analysis(self, risk_threshold=0.5):

        if self.shap_values is None:
            self.compute_shap_values()

        predictions = self.model.predict_proba(self.X_test)[:, 1]
        high_risk_mask = predictions >= risk_threshold

        shap_df = pd.DataFrame(self.shap_values, columns=self.feature_names)

        print("\n" + "="*70)
        print("COHORT ANALYSIS - MEAN ABSOLUTE SHAP VALUES")
        print("="*70)

        high_risk_shap = shap_df[high_risk_mask].abs().mean().sort_values(ascending=False)
        low_risk_shap = shap_df[~high_risk_mask].abs().mean().sort_values(ascending=False)

        cohort_comparison = pd.DataFrame({
            'high_risk_shap': high_risk_shap,
            'low_risk_shap': low_risk_shap,
            'difference': high_risk_shap - low_risk_shap
        }).sort_values('difference', ascending=False)

        print(f"\nTop 10 features distinguishing high-risk from low-risk:")
        print(cohort_comparison.head(10))

        return cohort_comparison


if __name__ == "__main__":
    print("Loading synthetic credit data...")
    df = pd.read_csv("credit_data_synthetic.csv")

    print("Loading trained model...")
    model = CreditRiskModel.load_model('credit_risk_model.pkl')

    X_train, X_test, y_train, y_test = model.prepare_data(df)

    print("\n" + "="*70)
    print("INITIALIZING MODEL INTERPRETER")
    print("="*70)
    interpreter = ModelInterpreter(model, X_train, X_test)

    interpreter.compute_shap_values()

    print("\n" + "="*70)
    print("GENERATING SHAP VISUALIZATIONS")
    print("="*70)

    interpreter.plot_summary(max_display=20, save_path='shap_summary.png')
    interpreter.plot_bar_importance(max_display=20, save_path='shap_bar.png')

    print("\nExplaining individual predictions...")
    for sample_idx in [0, 10, 50]:
        interpreter.explain_prediction(sample_idx, top_n=10)
        interpreter.plot_waterfall(sample_idx, save_path=f'waterfall_sample_{sample_idx}.png')

    interpreter.plot_force(sample_idx=0, save_path='force_plot_sample_0.html')

    key_features = ['credit_utilization', 'payment_history_pct', 'total_spending_pct']
    for feature in key_features:
        interpreter.plot_dependence(feature, save_path=f'dependence_{feature}.png')

    cohort_comparison = interpreter.generate_cohort_analysis()

    print("\n" + "="*70)
    print("INTERPRETABILITY ANALYSIS COMPLETE")
    print("="*70)
    print("\nGenerated files:")
    print("- shap_summary.png: Feature importance and impact")
    print("- shap_bar.png: Mean absolute SHAP values")
    print("- waterfall_sample_*.png: Individual prediction breakdowns")
    print("- force_plot_sample_0.html: Interactive force plot")
    print("- dependence_*.png: Feature effect plots")

