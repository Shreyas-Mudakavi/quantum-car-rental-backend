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

    const days = Math.abs(timeDifferenceMilliseconds / (1000 * 60 * 60 * 24));

    if (insurance) {
      total = days * price + 35;
    } else {
      total = days * price;
    }

    return total;
  }
};

module.exports = { calculateTotal };
