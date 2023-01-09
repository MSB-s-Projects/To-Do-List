// a local module to get dates.

exports.getDate = () => {
  /**
   * Function to get todays date.
   * @return {String} today's date in "Weekday, day(XX), month(long)" format.
   */

  // create a new date object
  const today = new Date();
  // setting it's options
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };

  // return the Date in required format.
  return today.toLocaleDateString("en-us", options);
};

exports.getDay = () => {
  /**
   * Function to get today's day of the week.
   * @return {String} today's day of the week.
   */

  //create a new date Object.
  const today = new Date();

  // setting date's options.
  const options = {
    weekday: "long",
  };

  // return day of week in the required format.
  return today.toLocaleDateString("en-us", options);
};
