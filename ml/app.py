"""Educational proxy model only. Predictions are not proof of product spoilage."""
from fastapi import FastAPI
from pydantic import BaseModel, Field
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import numpy as np
app=FastAPI(title="Supply Chain Deterioration Risk API",version="1.0.0")
# Synthetic proxy dataset: labels are generated from a transparent exposure heuristic,
# not from laboratory spoilage measurements. Replace with validated labelled data.
rng=np.random.default_rng(42); n=2400
temp=rng.normal(6,8,n); hum=rng.uniform(20,100,n); hours=rng.uniform(0,72,n)
cats=rng.integers(0,4,n)
excess=np.maximum(temp-8,0)+np.maximum(2-temp,0)+np.maximum(hum-80,0)/8+np.maximum(35-hum,0)/8
risk=excess*hours/100 + cats*0.08
labels=np.where(risk>5,2,np.where(risk>1.5,1,0))
X=np.column_stack([temp,hum,hours,cats]);Xtr,Xte,ytr,yte=train_test_split(X,labels,test_size=.2,random_state=42,stratify=labels)
model=RandomForestClassifier(n_estimators=160,random_state=42,class_weight="balanced");model.fit(Xtr,ytr)
metrics={"proxy_test_accuracy":round(accuracy_score(yte,model.predict(Xte)),3),"report":classification_report(yte,model.predict(Xte),output_dict=True,zero_division=0),"validation":"synthetic proxy labels; not validated against actual deterioration"}
class Prediction(BaseModel):
 temperature:float
 humidity:float=Field(ge=0,le=100)
 exposure_hours:float=Field(ge=0)
 category_code:int=Field(ge=0,le=3,description="0 general, 1 fruit, 2 dairy, 3 pharmaceutical")
@app.get("/health")
def health(): return {"ok":True,"model":"RandomForestClassifier","validation":metrics["validation"]}
@app.get("/evaluation")
def evaluation(): return metrics
@app.post("/predict")
def predict(p:Prediction):
 proba=model.predict_proba([[p.temperature,p.humidity,p.exposure_hours,p.category_code]])[0]
 score=float(proba[1]*50+proba[2]*100); level="High" if score>=65 else "Medium" if score>=30 else "Low"
 return {"risk":level,"risk_score":round(score,1),"class_probabilities":{"low":round(float(proba[0]),3),"medium":round(float(proba[1]),3),"high":round(float(proba[2]),3)},"model_type":"demonstration_random_forest","validated_for_real_spoilage":False,"note":"Educational estimate from synthetic proxy labels; not proof of spoilage."}
