from flask import Flask, Response, jsonify, json, request
from flask_cors import CORS, cross_origin
from read_data import readData
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

if __name__ == "__main__":
    app.run(debug=True)
