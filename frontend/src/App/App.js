import "./App.css";
import React from "react";
import { Line } from "react-chartjs-2";
import { useState, useEffect } from "react";
import { AppBar, Button, TextField } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import { set } from "date-fns";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  button: {
    textAlign: "center",
    fontSize: "25px",
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
    fontSize: "25px",
  },
  redPaper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
    fontSize: "25px",
    background: "#FF3333",
  },
  greyPaper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
    fontSize: "25px",
    background: "grey",
  },
  greenPaper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
    fontSize: "25px",
    background: "#00CC00",
  },
  margin: {
    margin: theme.spacing(1),
  },
}));

const formatDate = (date) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

function App() {
  const [width, setWidth] = useState(() => {
    if (window.innerWidth > 1100) {
      return 900;
    } else {
      return window.innerWidth / 1.35;
    }
  });
  const [data, setData] = useState({});
  const [btcPrice, setBtcPrice] = useState(0);
  const [height, setHeight] = useState(window.innerHeight / 1.8);
  const [selectedDateFrom, setSelectedDateFrom] = React.useState(new Date("2021-04-18T21:11:54"));
  const [selectedDateTo, setSelectedDateTo] = React.useState(new Date());
  const [epochs, setEpochs] = useState(3);
  const [predictDays, setPredictDays] = useState(7);
  const [loopback, setLoopback] = useState(5);
  const [predictionBool, setPredictionBool] = useState(true);
  const [buttonIsDisabled, setButtonIsDisabled] = useState(false);

  const fetchNewDates = (startDate, endDate) => {
    fetch(
      "http://localhost:5000/data?" +
        new URLSearchParams({
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        })
    )
      .then((a) => a.json())
      .then((a) => setData(a))
      .catch((e) => {
        console.log(e.status);
      });
  };

  const makePredictions = () => {
    setButtonIsDisabled(true);
    fetch(
      "http://localhost:5000/prediction?" +
        new URLSearchParams({
          epochs: epochs,
          predictionDays: predictDays,
          loopBack: loopback,
        })
    )
      .then((a) => a.json())
      .then((a) => {
        let index1 = a["datasets"][0]["data"].length;
        let index2 = a["datasets"][1]["data"].length;
        if (parseInt(a["datasets"][0]["data"][index1 - 1], 10) >= parseInt(a["datasets"][1]["data"][index2 - 1], 10)) {
          setPredictionBool(false);
        } else {
          setPredictionBool(true);
        }
        setButtonIsDisabled(false);
        setData(a);
      })
      .catch((e) => {
        console.log(e.status);
      });
  };

  const handleDateChangeFrom = (date) => {
    if (isNaN(new Date(date))) return;
    fetchNewDates(date, selectedDateTo);
    setSelectedDateFrom(date);
  };

  const handleDateChangeTo = (date) => {
    if (isNaN(new Date(date))) return;
    fetchNewDates(selectedDateFrom, date);
    setSelectedDateTo(date);
  };

  window.addEventListener("resize", () =>
    setWidth(() => {
      if (window.innerWidth > 1100) {
        return 900;
      } else {
        return window.innerWidth / 1.35;
      }
    })
  );
  window.addEventListener("resize", () => setHeight(window.innerHeight / 1.8));
  const classes = useStyles();

  useEffect(() => {
    fetch(
      "http://localhost:5000/data?" +
        new URLSearchParams({
          startDate: formatDate(selectedDateFrom),
          endDate: formatDate(selectedDateTo),
        }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((a) => a.json())
      .then((a) => setData(a))
      .catch((e) => {
        console.log(e.status);
      });

    fetch("https://api.coinbase.com/v2/prices/spot?currency=USD")
      .then((a) => a.json())
      .then((a) => {
        console.log("new BTC price is " + a["data"]["amount"]);
        setBtcPrice(a["data"]["amount"]);
      })
      .catch((e) => {
        console.log(e.status);
      });

    const intervalId = setInterval(
      async () =>
        await fetch("https://api.coinbase.com/v2/prices/spot?currency=USD")
          .then((a) => a.json())
          .then((a) => {
            console.log("new BTC price is " + a["data"]["amount"]);
            setBtcPrice(a["data"]["amount"]);
          })
          .catch((e) => {
            console.log(e.status);
          }),
      30000
    );

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ minHeight: height }}>
      <AppBar position="static" color="secondary">
        BTC/USD Predictor
      </AppBar>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: height }}>
        <div
          style={{
            marginTop: "3%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            minWidth: width,
          }}
        >
          <Line style={{ maxWidth: width, marginBottom: "5%" }} data={data} />
          <div style={{ maxWidth: width }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper className={classes.paper}>Current Value: $ {btcPrice}</Paper>
              </Grid>
              <Grid item xs={12}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <Grid container justify="space-around">
                    <KeyboardDatePicker
                      disableToolbar
                      variant="inline"
                      format="MM/dd/yyyy"
                      margin="normal"
                      id="date-picker-from"
                      label="From"
                      value={selectedDateFrom}
                      onChange={handleDateChangeFrom}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                      }}
                    />
                    <KeyboardDatePicker
                      disableToolbar
                      variant="inline"
                      format="MM/dd/yyyy"
                      margin="normal"
                      id="date-picker-to"
                      label="To"
                      value={selectedDateTo}
                      onChange={handleDateChangeTo}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                      }}
                    />
                  </Grid>
                </MuiPickersUtilsProvider>
              </Grid>
              <Grid item xs={6}>
                <Paper className={predictionBool == true ? classes.greenPaper : classes.redPaper}>
                  Prediction: {predictionBool == true ? "Up" : "Down"}{" "}
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper className={classes.greyPaper}>Last Prediction: NA</Paper>
              </Grid>
              <Grid item xs={4}>
                {}
                <TextField
                  type="number"
                  onChange={(e) => setPredictDays(e.target.value)}
                  label="Days to Predict"
                  value={predictDays}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField type="number" onChange={(e) => setEpochs(e.target.value)} label="Epochs" value={epochs} />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  type="number"
                  onChange={(e) => setLoopback(e.target.value)}
                  label="Loopback"
                  value={loopback}
                />
              </Grid>
              <Grid item xs={12} style={{ textAlign: "center" }}>
                <Button
                  id="button_make_prediction"
                  className={classes.button}
                  variant="contained"
                  color="secondary"
                  onClick={() => makePredictions()}
                  disabled={buttonIsDisabled}
                >
                  Make Predictions
                </Button>
              </Grid>
              <Grid item xs={12} style={{ textAlign: "center" }}>
                <CircularProgress color="secondary" variant="indeterminate" size={buttonIsDisabled == false ? 0 : 40} />
              </Grid>
            </Grid>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
