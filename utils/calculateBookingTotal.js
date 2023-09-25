const { format } = require("date-fns");

const calculateTotal = async (
  startDate,
  endDate,
  startTime,
  endTime,
  price,
  insurance
) => {
  let total = 0;

  const journeyStartDateTime = new Date(
    `${format(new Date(startDate), "MMMM dd, yyyy")}, ${startTime}`
  );
  const journeyEndDateTime = new Date(
    `${format(new Date(endDate), "MMMM dd, yyyy")}, ${endTime}`
  );

  if (journeyStartDateTime.getDate() === journeyEndDateTime.getDate()) {
    if (insurance) {
      total = price + 35;
    } else {
      total = price;
    }
    return total;
  } else {
    const timeDifferenceMilliseconds =
      journeyStartDateTime - journeyEndDateTime;

    const days = Math.round(
      Math.abs(timeDifferenceMilliseconds / (1000 * 60 * 60 * 24))
    );

    let additionalPay = 0;

    if (insurance) {
      additionalPay = 35 + (days - 1) * 10;
    } else {
      additionalPay = 0;
    }

    if (insurance) {
      total = days * price + additionalPay;

      total = total + total * (15 / 100);
    } else {
      total = days * price;

      total = total + total * (15 / 100);
    }

    return total;
  }
};

module.exports = { calculateTotal };
