import "./App.css";
import React from "react";
import { Line } from "react-chartjs-2";
import { useState, useEffect } from "react";
import { AppBar, Button } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";

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
  greenPaper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
    fontSize: "25px",
    background: "#00CC00",
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
  const [selectedDateFrom, setSelectedDateFrom] = React.useState(new Date("2014-08-18T21:11:54"));
  const [selectedDateTo, setSelectedDateTo] = React.useState(new Date());

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
    fetch("http://localhost:5000/data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
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
              <Grid item xs={6}>
                <Paper className={classes.greenPaper}>Prediction: Up</Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper className={classes.redPaper}>Last Prediction: Wrong</Paper>
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
              <Grid item xs={12} style={{ textAlign: "center" }}>
                <Button className={classes.button} variant="contained" color="secondary">
                  Make Predictions
                </Button>
              </Grid>
            </Grid>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
