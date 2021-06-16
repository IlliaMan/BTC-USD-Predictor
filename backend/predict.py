import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import TimeseriesGenerator
import os
import matplotlib.pyplot as plt
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Bidirectional
import plotly.graph_objects as go
import datetime

def predict(num_prediction, look_back, epochs):
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    PATHTOFILE = '../data/BTC-USD-daily.csv'
    
    df = pd.read_table(PATHTOFILE, delimiter=',')
    
    df['Date'] = pd.to_datetime(df['Date'])
    df.set_axis(df['Date'], inplace=True)
    df.drop(columns=['Open', 'High', 'Low', 'Volume'], inplace=True)
    
    close_data = df['Close'].values
    close_data = close_data.reshape((-1,1))
    
    # 80% for training, 20% for testing
    split_percent = 0.80
    split = int(split_percent*len(close_data))
    
    close_train = close_data[:split]
    close_test = close_data[split:]
    
    date_train = df['Date'][:split]
    date_test = df['Date'][split:]
            
    train_generator = TimeseriesGenerator(close_train, close_train, length=look_back, batch_size=20)     
    test_generator = TimeseriesGenerator(close_test, close_test, length=look_back, batch_size=1)
    
    model = Sequential()
    model.add(LSTM(units=60, activation='relu', input_shape=(look_back, 1), return_sequences=True))
    model.add(Dropout(0.2))
    
    model.add(LSTM(units=60, activation='relu', return_sequences=True))
    model.add(Dropout(0.2))
    
    model.add(LSTM(units=80, activation='relu', return_sequences=True))
    model.add(Dropout(0.2))
    
    model.add(LSTM(units=120, activation='relu'))
    
    model.add(Dense(units=1))
    model.compile(optimizer='adam', loss='mse')
    model.fit(train_generator, epochs=epochs, verbose=1, batch_size=64)
    
    prediction = model.predict(test_generator)
    
    close_train = close_train.reshape((-1))
    close_test = close_test.reshape((-1))
    prediction = prediction.reshape((-1))
    
    trace1 = go.Scatter(
        x = date_train,
        y = close_train,
        mode = 'lines',
        name = 'Training Data'
    )
    trace2 = go.Scatter(
        x = date_test,
        y = prediction,
        mode = 'lines',
        name = 'Prediction'
    )
    trace3 = go.Scatter(
        x = date_test,
        y = close_test,
        mode='lines',
        name = 'Testing Data'
    )
    layout = go.Layout(
        title = "BTC Price",
        xaxis = {'title' : "Date"},
        yaxis = {'title' : "Close"}
    )
    fig = go.Figure(data=[trace1, trace2, trace3], layout=layout)
    fig.show()


    close_data = close_data.reshape((-1))
    
    def predict(num_prediction, model):
        prediction_list = close_data[-look_back:]
    
        for _ in range(num_prediction):
            x = prediction_list[-look_back:]
            x = x.reshape((1, look_back, 1))
            out = model.predict(x)[0][0]
            prediction_list = np.append(prediction_list, out)
        prediction_list = prediction_list[look_back-1:]
        
        predictions = []
        for i in prediction_list:
            predictions.append(str(i))

        return predictions
    
    def predict_dates(num_prediction):
        last_date = df['Date'].values[-1]
        prediction_dates = pd.date_range(last_date, periods=num_prediction+1).tolist()
        dates = []
        for i in prediction_dates:
            dates.append(str(i).split(' ')[0])
        return dates
    
    forecast = predict(num_prediction, model)
    forecast_dates = predict_dates(num_prediction)
    names = ["labels", "prices"]
    arrays = [forecast_dates, forecast]
    dictOut = dict(zip(names, arrays))
    print(dictOut)
    return dictOut