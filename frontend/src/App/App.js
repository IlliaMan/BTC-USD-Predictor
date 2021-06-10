import "./App.css";
import React from "react";
import { Line } from "react-chartjs-2";
import { useState, useEffect } from "react";
import { AppBar, Button, TextField } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, KeyboardTimePicker, KeyboardDatePicker } from "@material-ui/pickers";

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

function App() {
  const [width, setWidth] = useState(() => {
    if (window.innerWidth > 1100) {
      return 900;
    } else {
      return window.innerWidth / 1.35;
    }
  });
  const [height, setHeight] = useState(window.innerHeight / 1.8);
  const [selectedDate, setSelectedDate] = React.useState(new Date("2014-08-18T21:11:54"));

  const handleDateChange = (date) => {
    setSelectedDate(date);
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

  const data = {
    labels: ["January", "February", "March", "April", "May", "June", "July", "ff"],
    datasets: [
      {
        label: "My First dataset",
        data: [65, 59, 80, 81, 56, 55, 40, 50],
        borderColor: "#FF0000",
      },
      {
        label: "My dataset",
        data: [65, 100, 80, 0, 56, 30, 40, 50],
        borderColor: "#0000FF",
      },
    ],
  };

  useEffect(() => {
    /*fetch("http://localhost:5000/data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((a) => a.json())
      .then((a) => setData(a))
      .catch((e) => {
        console.log(e.status);
      });*/
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
                <Paper className={classes.paper}>Current Value: $ {width.toString().split(".")[0]}</Paper>
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
                      id="date-picker-inline"
                      label="From"
                      value={selectedDate}
                      onChange={handleDateChange}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                      }}
                    />
                    <KeyboardDatePicker
                      disableToolbar
                      variant="inline"
                      format="MM/dd/yyyy"
                      margin="normal"
                      id="date-picker-inline"
                      label="To"
                      value={selectedDate}
                      onChange={handleDateChange}
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
