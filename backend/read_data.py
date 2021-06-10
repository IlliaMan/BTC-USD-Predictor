import pandas as pd
import datetime

def readData(start = datetime.datetime(2014, 10, 1).date(), end = datetime.datetime.now().date()):
    df = pd.read_table("../data/BTC-USD-monthly.csv")
    data = df.to_numpy()
    dates = []
    prices = []
   
    for arr in data:
        dateList = arr[0].split(',')[0].split('-')
        date = datetime.datetime(int(dateList[0]), int(dateList[1]), int(dateList[2])).date()   
        if start <= date and end >= date:
            dates.append(arr[0].split(',')[0])
            prices.append(arr[0].split(',')[1])  

    names = ["labels", "prices"]
    arrays = [dates, prices]
    dictOut = dict(zip(names, arrays))
    return dictOut
