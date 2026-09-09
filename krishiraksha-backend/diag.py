import joblib
import sklearn
print("sklearn version:", sklearn.__version__)
try:
    with open('app/ml/model.joblib', 'rb') as f:
        header = f.read(100)
        print("Header:", header[:20])
    m = joblib.load('app/ml/model.joblib')
    print("Loaded!", type(m))
except Exception as e:
    print("Error:", e)
