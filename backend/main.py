from flask import Flask, Response, jsonify, json, request
from flask_cors import CORS, cross_origin
from read_data import readData
from predict import predict
import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'

data = {
        "labels": [],
        "datasets": [
        {
            "label": "Real Price",
            "data": [],
            "borderColor": "#FF0000"
        },
        {
             "label": "Predicted Price",
             "data": [],
            "borderColor": "#0000FF"
        }
    ]
}

@app.route('/')
def index():
    return "index"

@app.route('/data', methods=['GET'])
def getData():
    startDate = request.args.get('startDate')
    endDate = request.args.get('endDate')
    if(startDate != None and endDate != None):
         startdateList = startDate.split('-')
         startdate = datetime.datetime(int(startdateList[0]), 
                                       int(startdateList[1]),
                                       int(startdateList[2])).date()
         
         enddateList = endDate.split('-')
         enddate = datetime.datetime(int(enddateList[0]),
                                     int(enddateList[1]),
                                     int(enddateList[2])).date() 
         data1 = readData(startdate, enddate)
    else:
        data1 = readData()
    
    data["labels"] = data1["labels"]
    data["datasets"][0]["data"] = data1["prices"]
    resp = Response(json.dumps(data))
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route('/prediction', methods=['GET'])
def makePrediction():
    num_prediction = int(request.args.get('predictionDays'))
    look_back = int(request.args.get('lookBack'))
    epochs = int(request.args.get('epochs'))
    
    data1 = predict(num_prediction, look_back, epochs)
    for i in data1["labels"]:
        if(i not in data["labels"]):
            data["labels"].append(i)
    
    data["datasets"][1]["data"] = data1["prices"]

    data["datasets"][1]["data"].insert(0, data["datasets"][0]["data"][-1])
    for _ in range(len(data["datasets"][0]["data"]) - 1):
        data["datasets"][1]["data"].insert(0, "null")

    resp = Response(json.dumps(data))
    resp.headers['Access-Control-Allow-Origin'] = '*'
    data["datasets"][1]["data"] = []
    return resp


if __name__ == "__main__":
    app.run(debug=True, host="10.11.2.203")
