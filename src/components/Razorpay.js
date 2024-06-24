import React, { useState } from "react";
import axios from "axios";
import swal from "sweetalert";


const Razorpay = () => {
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const savePaymentToDb = async (razorpayRes, amount, orderId, status) => {
    const payment = {
      orderId: orderId,
      amount: amount,
      razorpayPaymentId: razorpayRes ? razorpayRes.razorpay_payment_id : null,
      razorpayOrderId: razorpayRes ? razorpayRes.razorpay_order_id : null,
      razorpaySignature: razorpayRes ? razorpayRes.razorpay_signature : null,
      paymentDateTime: "",
      status: status,
      mobileNumber: mobileNumber,
      emailId: email,
    };

    await axios.post("http://localhost:8085/api/payment", payment);
  };

  const getOptionsObject = (order) => {
    const options = {
      key: "rzp_test_f8pTpX80dY4o57",
      amount: order.data.amount,
      currency: order.data.currency,
      name: "Vigneshe",
      image: "https://www.svgrepo.com/show/261072/rupee.svg",
      description: "For Testing purpose",
      order_id: order.data.id,
      handler: async (res) => {
        swal(
          "Payment Successful!",
          `Your Payment Id is : ${res.razorpay_payment_id}`,
          "success"
        );
        savePaymentToDb(res, amount, order.data.id, "Paid");
        setName("");
        setEmail("");
        setMobileNumber("");
        setAmount("");
      },
      prefill: {
        name: name,
        email: email,
        contact: mobileNumber,
      },
      notes: {
        address: "This is test note",
      },
      theme: {
        color: "#3399cc",
      },
    };
    return options;
  };

  const paymentHandler = async (e) => {
    e.preventDefault();
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const order = await axios.post("http://localhost:8085/api/create_order", {
      amount: amount,
    });

    if (order.data.status === "created") {
      const options = getOptionsObject(order);
      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        savePaymentToDb(null, amount, order.data.id, "Failed");
        swal(
          "Oops Payment Failed!",
          `Error Description : ${response.error.description}`,
          "error"
        );
        setName("");
        setEmail("");
        setMobileNumber("");
        setAmount("");
      });

      rzp.open();
    } else {
      swal("Oops Order Creation Failed!", "Check backend code", "error");
    }
  };

  return (
    <div className="App">
      <form onSubmit={paymentHandler}>
        <label htmlFor="fname">Name: </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br />

        <label htmlFor="email">Email: </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />

        <label htmlFor="mobnum">Mobile Number: </label>
        <input
          type="number"
          id="mobnum"
          name="mobnum"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
        />
        <br />

        <label htmlFor="amount">Amount: </label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <br />

        <input type="submit" value="Pay" />
      </form>
    </div>
  );
};

export default Razorpay;
