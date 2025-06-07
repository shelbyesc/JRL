import requests

url = "http://127.0.0.1:5000/predict"

sample_input = {
    "shaftangle": 130.0,
    "offset": 40.0,
    "headdiameter": 50.0,
    "lateraledge": 35.0,
    "acetabdiameter": 55.0,
    "alphaangle": 60.0,
    "combinednecrotic": 100.0,
    "maxpercent": 25.0,
    "percentnecrotic": 10.0,
    "volum": 15.0,
    "labraltear": 1,
    "age": 35,
    "male": 1,
    "white": 1,
    "toxic": 0,
    "medical": 1,
    "idiopathic": 0,
    "trauma": 0
}

response = requests.post(url, json=sample_input)

print("Status Code:", response.status_code)
print("Response:", response.json())
