import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    classification_report, confusion_matrix, roc_auc_score, roc_curve, precision_recall_curve, average_precision_score
)
import matplotlib.pyplot as plt
import seaborn as sns
import pickle

class CreditRiskModel:
    #using xgboost for a credit risk prediction model

    def __init__(self, params=None):
        #initializing the model with xgboost params -> need to get probability
        # as well as area under the curve for financial risk

        self.default_params = {
            'objective': 'binary:logistic',
            'eval_metric': 'auc',
            'max_depth': 6,
            'learning_rate': 0.1,
            'n_estimators': 100,
            'min_child_weight': 1,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'gamma': 0,
            'reg_alpha': 0,
            'reg_lambda': 1,
            'random_state': 42
        }

        if params:
            self.default_params.update(params)

        self.model = xgb.XGBClassifier(**self.default_params)
        self.feature_names = None
        self.is_fitted = False
        
    def prepare_data(self, df, target_col='is_high_risk', test_size=0.2):
        # we need to split the data into train and testing sets

        # taking in data frame with features and target, our targetr, and test size

        X = df.drop(columns=[target_col])
        y = df[target_col]

        self.feature_names = X.columns.tolist()

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )

        print(f"Training set: {len(X_train)} samples")
        print(f"Test set: {len(X_test)} samples")
        print(f"High risk in train: {y_train.mean():.2%}")
        print(f"High risk in test: {y_test.mean():.2%}")

        return X_train, X_test, y_train, y_test
    
    def train(self, X_train, y_train, X_val=None, y_val=None, verbose=True):
        # training the xgboost model

        print("\ntraining xgboost")

        eval_set = [(X_train, y_train)]
        if X_val is not None and y_val is not None:
            eval_set.append((X_val, y_val))

        self.model.fit(
            X_train, y_train,
            eval_set=eval_set,
            verbose=verbose
        )

        self.is_fitted = True
        print("model training finito")

    def evaluate(self, X_test, y_test):
        #evalutating the model performance pls dont be chopped 😭
        # returning a dict of metrics

        if not self.is_fitted:
            raise ValueError("model hasnt been trained")

        print("\n" + "="*60)
        print("model eval")
        print("="*60)

        # predictions
        y_pred = self.model.predict(X_test)
        y_pred_prob = self.model.predict_proba(X_test)[:, 1]

        # classification metrics
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred, target_names=['Low Risk', 'High Risk']))

        # confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        print(f"\nConfusion matrix: \n{cm}")

        # roc-auc
        roc_auc = roc_auc_score(y_test, y_pred_prob)
        print(f"\n ROC-AUC Score: {roc_auc:.4f}")

        #avg precision
        avg_precision = average_precision_score(y_test, y_pred_prob)
        print(f"Average Prediction Score: {avg_precision:.4f}")

        metrics = {
            'roc_auc': roc_auc,
            'avg_precision': avg_precision,
            'confusion_matrix': cm,
            'y_pred': y_pred,
            'y_pred_prob': y_pred_prob
        }

        return metrics
    
    def get_feature_importance(self):
        """Get feature importance as a DataFrame (no plotting)"""
        if not self.is_fitted:
            raise ValueError("Model must be trained before getting feature importance")

        importance = self.model.feature_importances_
        feature_importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': importance
        }).sort_values('importance', ascending=False)

        return feature_importance

    def save_model(self, filepath='credit_risk_model.pkl'):
        if not self.is_fitted:
            raise ValueError("Model must be trained before saving")

        with open(filepath, 'wb') as f:
            pickle.dump(self, f)
        print(f"Model saved to {filepath}")

    @staticmethod
    def load_model(filepath='credit_risk_model.pkl'):
        with open(filepath, 'rb') as f:
            model = pickle.load(f)
        print(f"Model loaded from {filepath}")
        return model


if __name__ == "__main__":
    print("Loading synthetic credit data...")
    df = pd.read_csv("credit_data_synthetic.csv")

    model = CreditRiskModel()

    X_train, X_test, y_train, y_test = model.prepare_data(df)

    model.train(X_train, y_train, X_test, y_test)

    metrics = model.evaluate(X_test, y_test)

    print("\nAnalyzing feature importance...")
    feature_importance = model.get_feature_importance()
    print("\nTop 10 Most Important Features:")
    print(feature_importance.head(10))

    model.save_model('credit_risk_model.pkl')
