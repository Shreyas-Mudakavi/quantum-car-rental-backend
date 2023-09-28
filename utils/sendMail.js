const nodemailer = require("nodemailer");

const sendMail = async (transactionId, total, carName) => {
  try {
    let transporter = await nodemailer.createTransport({
      // service: "gmail",
      // host: "ses-smtp-user.20230926-232508",
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        // user: "AKIAQMWC6RTIKBPYY2PT",
        // pass: "BIUVlVuwK6r1LRBUd/iFFKnNViHe/bGctbZeoubfV7Qu",
        user: "katelin.lang94@ethereal.email",
        pass: "BGCmxcgN1J7MX7m84X",
      },
    });

    const mailOptions = {
      // from: "admin@carrentalpalmerstonnorth.co.nz",
      from: "<katelin.lang94@ethereal.email>",
      to: `Carrentalpalmeraronnorth@gmail.com`,
      subject: "Palmerston North Car Rentals - <b>New Booking</b>",
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
      Transaction ${transactionId}
      </p>
      <p>
      Total ${total}
      </p>
      </div>
      <p style='margin-top: 1rem'>
      Car booked - ${carName}
      </p>
      <div style='margin-top: 2rem'>
      <p>Palmerston North Car Rentals</p>
      </div>
      </body>
      </html>`,
    };

    let info = await transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.log("err ", err);
      } else {
        console.log("mail sent");
      }
    });

    console.log("Message sent ", info);
  } catch (error) {
    console.log("err ", err);
  }
};

module.exports = sendMail;
