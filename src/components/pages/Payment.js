import React from 'react';
import '../../App.css';
import Footer from '../Footer';
import Navbar from '../Navbar';
import Razorpay from '../Razorpay';

function Payment() {
  return (
    <div>
      <Navbar />
        <Razorpay />
      <Footer />
    </div>
  );
}

export default Payment;
