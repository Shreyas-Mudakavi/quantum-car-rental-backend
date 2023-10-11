const nodemailer = require("nodemailer");

const sendMail = async (transactionId, total, carName) => {
  try {
    let transporter = await nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      auth: {
        user: "admin@carrentalpalmerstonnorth.co.nz",
        pass: "Carrental2023",
      },
    });

    const mailOptions = {
      from: "admin@carrentalpalmerstonnorth.co.nz",
      to: `carrentalpalmeraronnorth@gmail.com`,
      subject: "Palmerston North Car Rentals - New Booking",
      text: `New Booking Alert!`,
      html: `<html>
      <body>
      <p>
      Dear Admin, 
      </p>
      <p style='margin-top: 1rem'>
      You got a new paid and confirmed car booking.
      </p>
      <div style='margin-top: 1rem'>
      <p>
      Transaction ID <strong>${transactionId}</strong>
      </p>
      <p>
      Total amount paid - <strong>${total}</strong>
      </p>
      </div>
      <p style='margin-top: 1rem'>
      Car booked - <strong>${carName}</strong>
      </p>
      <div style='margin-top: 2rem'>
      <p>Palmerston North Car Rentals</p>
      </div>
      </body>
      </html>`,
    };

    let info = await transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("err ", err);
        return;
      }
      console.log("Message sent ", info);
    });
  } catch (error) {
    console.log("err sendMail ", error);
  }
};

module.exports = sendMail;
