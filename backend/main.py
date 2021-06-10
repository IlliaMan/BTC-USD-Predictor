from flask import Flask, Response, jsonify
from flask_cors import CORS, cross_origin
import json


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'

data = {
        "labels": ["January", "February", "March", "April", "May", "June", "July", "ff"],
        "datasets": [
        {
            "label": "My First dataset",
            "data": [65, 59, 80, 81, 56, 55, 40, 50],
            "borderColor": "#FF0000"
        },
        {
             "label": "My dataset",
             "data": [65, 100, 80, 0, 56, 30, 40, 50],
             "borderColor": "#0000FF"
        }
    ]
}

@app.route('/')
def index():
    return "index"

@app.route('/data', methods=['GET'])
def getData():
    resp = Response(json.dumps(data))
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

if __name__ == "__main__":
    app.run(debug=True)
