const moment = require("moment");

const create_date = new Date();

const create_date_formatted = moment(create_date).format("HH:mm DD/MM/YYYY");
