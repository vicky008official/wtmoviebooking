import Chip from "@mui/material/Chip";
import FaceIcon from "@mui/icons-material/Face";
import Paper from "@mui/material/Paper";
import LockIcon from "@mui/icons-material/Lock";
import { useEffect, useState } from "react";
import { Apicalls } from './Apicalls';
import Switch from "@mui/material/Switch";
// import SeatPicker from "react-seat-picker";
import "./SeatPicker.css";
import {
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  IconButton,
  Button,
  Input,
  Checkbox,
  Alert,
  Stack,
} from "@mui/material";
import Loginmain from "./Loginmain";
import Signup from "./Signup";
import { WidthFull } from "@mui/icons-material";
import { ReactSession } from 'react-client-session';
import { useNavigate } from "react-router-dom";

function Theatrepage() {
  const navigate = useNavigate();

  var tname = ReactSession.get("theatrename");
  var user = ReactSession.get("username");
  var ids = ReactSession.get("id");
  var password = ReactSession.get("password");
  var tid = ReactSession.get("tid");
  var email = ReactSession.get("email");
  var movienam = ReactSession.get("moviename");
  var moviefromWeb = ReactSession.get("moviefromWeb");
  var discountedValue = ReactSession.get("discountedValue");

  var [movId, setMovieid] = useState("");
  var [seat, setSeat] = useState("");
  var [unavailableSeats, setUnavailableSeats] = useState([]);
  var [selectedSeats, setSelectedSeats] = useState([]);
  var [showDate, setShowDate] = useState("");
  var [showTime, setShowTime] = useState("");
  var [price, setPrice] = useState("");
  var [extraCharge, setExtraCharge] = useState(0); // Add state for extra charge
  const [updateSuccess, setUpdateSuccess] = useState(false); // State variable for update success
  const [redirectToPayment, setRedirectToPayment] = useState(false); // State variable for redirection

  const todayDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const mdetail2 = {
      movieName: ReactSession.get("moviename"),
    };

    Apicalls.GetMid(mdetail2)
      .then(response => {
        console.log(response);
        setMovieid(response.data.id);
        ReactSession.set("movieId", response.data.id);
        console.log(movId);
        console.log(moviefromWeb);
      })
      .catch(error => {
        console.error(error);
      });

    const udetail = {
      id: ReactSession.get("id"),
      movieId: moviefromWeb,
      theatreId: ReactSession.get("tid"),
    };

    Apicalls.GetSeat(udetail).then(
      response => {
        const responseData = response.data;
        const seatArray = responseData.map((item) => item.body.seat.replace(/[\[\]]+/g, ''));
        const combinedSeats = "[" + seatArray.join(',') + "]";
        console.log(combinedSeats);
        setSeat(combinedSeats);
        console.log(udetail.movieId);
      })
  }, []);

  useEffect(() => {
    getUnavailableSeats(showDate);
  }, [showDate]);

  useEffect(() => {
    if (updateSuccess) {
      const ldetail2 = {
        id: ids,
      }
      Apicalls.UpdateCoins(ldetail2)
        .then((response) => {
          console.log(response.data)
          ReactSession.set("coins", response.data);
        })
        .catch(error => {
          console.error(error);
        })
      const timer = setTimeout(() => {
        navigate("/movies"); // Redirect to '/movies' after 2 seconds
      }, 2000);

      return () => clearTimeout(timer); // Clear the timer on component unmount
    }
  }, [updateSuccess, navigate]);

  useEffect(() => {
    if (redirectToPayment) {
      navigate("/payment"); // Redirect to '/payment'
    }
  }, [redirectToPayment, navigate]);

  const handleSeatClick = (seat) => {
    if (selectedSeats.includes(seat)) {
      // Deselect the seat
      setSelectedSeats((prevSeats) =>
        prevSeats.filter((selectedSeat) => selectedSeat !== seat)
      );
    } else {
      // Select the seat
      setSelectedSeats((prevSeats) => [...prevSeats, seat]);
    }
  };

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    setShowDate(newDate);
    getUnavailableSeats(newDate);

    // Add extra charge if the selected date is today
    if (newDate === todayDate) {
      setExtraCharge(50);
    } else {
      setExtraCharge(0);
    }
  };

  const handleTimeChange = (event) => {
    setShowTime(event.target.value);
  };

  const getUnavailableSeats = (date) => {
    const udetail = {
      id: ReactSession.get("id"),
      movieId: ReactSession.get("moviefromWeb"),
      theatreId: ReactSession.get("tid"),
      datetime: date
    };

    Apicalls.GetSeat(udetail)
      .then(response => {
        const responseData = response.data;
        const seatArray = responseData.map((item) => item.body.seat.replace(/[\[\]]+/g, ''));
        const combinedSeats = "[" + seatArray.join(',') + "]";
        setUnavailableSeats(combinedSeats);
        console.log(combinedSeats);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const numRows = 10; // Number of rows
  const numColumns = 10; // Number of columns
  const seatPrice = 100; // Price per seat

  const renderSeats = () => {
    const seats = [];

    for (let row = 0; row < numRows; row++) {
      const rowSeats = [];

      for (let column = 0; column < numColumns; column++) {
        const seat = `${String.fromCharCode(65 + row)}${column + 1}`;
        const isAvailable = !unavailableSeats.includes(seat);

        rowSeats.push(
          <button
            key={seat}
            className={`seat ${selectedSeats.includes(seat) ? "selected" : ""} ${isAvailable ? "available" : "unavailable"}`}
            onClick={() => handleSeatClick(seat)}
            disabled={!isAvailable}
          >
            {seat}
          </button>
        );
      }

      seats.push(
        <div key={row} className="row">
          <span className="row-name">{String.fromCharCode(65 + row)}</span>
          {rowSeats}
        </div>
      );
    }

    return seats;
  };

  const calculateSeatPrice = () => {
    return selectedSeats.length * seatPrice;
  };

  const calculateTotalPrice = () => {
    var dummy = calculateSeatPrice() - discountedValue + extraCharge;
    if (dummy < 0) {
      return 0;
    }
    else {
      return dummy;
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Perform actions on form submission
    console.log("Date:", showDate);
    console.log("Time:", showTime);
    console.log("Selected Seats:", selectedSeats);
    var p = calculateTotalPrice();
    setPrice(p);
    console.log(price);
    console.log("Seat Price:", calculateSeatPrice());
    console.log("Total Price", calculateTotalPrice());
    const seatt = `[${selectedSeats.join(", ")}]`; // Convert selectedSeats array to a string enclosed in square brackets
    console.log("Seats:", seatt);
    performPut(seatt, p, false);
  };

  const handlePaymentRedirect = (event) => {
    event.preventDefault();
    // Perform any necessary actions before redirection
    const seatt = `[${selectedSeats.join(", ")}]`; // Convert selectedSeats array to a string enclosed in square brackets
    var p = calculateTotalPrice();
    performPut(seatt, p, true);
  };

  function performPut(seatt, p, redirectToPaymentFlag) {
    var sta = "true";
    const udetail = {
      id: ids,
      name: user,
      password: password,
      email: email,
      seat: seatt,
      datetime: showDate,
      price: p,
      theatreId: tid,
      movieId: movId,
      restatus: sta
    }
    Apicalls.PutUser(udetail)
      .then(() => {
        console.log("updated successfully")
        if (redirectToPaymentFlag) {
          setRedirectToPayment(true);
        } else {
          setUpdateSuccess(true);
        }
      })
      .catch(error => {
        console.error(error);
      })
  }

  return (
    <div className="seat-picker">
      <div className="screen">SCREEN</div>
      <div className="seating-plan">{renderSeats()}</div>
      <div className="selected-seats">
        <h4>Selected Seats:</h4>
        <ul>
          {selectedSeats.map((seat) => (
            <li key={seat}>{seat}</li>
          ))}
        </ul>
        <h4>Seat Price(+): Rs.{calculateSeatPrice()}</h4>
        <h4>Discounted Price(-): Rs.{discountedValue}</h4>
        {extraCharge > 0 && <h4>Extra Charge(+): Rs.{extraCharge}</h4>}
        <h4>Total Price: Rs.{calculateTotalPrice()}</h4>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Date:</label>
          <input type="date" value={showDate} onChange={handleDateChange} min={todayDate} required />
        </div>
        <div className="form-row">
          <label>Time:</label>
          <select value={showTime} onChange={handleTimeChange}>
            <option value="">hh:mm AM</option>
            <option value="09:00 AM">09:00 AM</option>
            <option value="12:00 PM">12:00 PM</option>
            <option value="03:00 PM">03:00 PM</option>
            <option value="06:00 PM">06:00 PM</option>
          </select>
        </div>
        <button type="submit">Submit</button>
        <button type="button" onClick={handlePaymentRedirect}>Make payment now!</button>
        {updateSuccess &&
          <Alert severity="success" size="small">
            Booking success! Redirecting to movies..
          </Alert>
        }
      </form>
    </div>
  );
}

export default Theatrepage;
