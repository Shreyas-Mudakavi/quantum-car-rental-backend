const nodemailer = require("nodemailer");

const sendMailQuery = async (username, email) => {
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
      subject: "Palmerston North Car Rentals - New Query",
      text: `New Query Alert!`,
      html: `<html>
            <body>
              <p>Dear Admin,</p>
              <p style="margin-top: 1rem">You got a new query. <br /><br /><strong>User - </strong>${username} <br /><strong>Email - </strong> ${email}.</p>
              <div style="margin-top: 1rem">
                <p>
                  Please login to Admin Panel to see the message.
                </p>
              </div>
              <div style="margin-top: 2rem">
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
      console.log("Message sent for query ", info);
    });
  } catch (error) {
    console.log("err sendMail ", error);
  }
};

module.exports = sendMailQuery;
