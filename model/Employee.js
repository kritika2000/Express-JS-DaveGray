const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employeesSchema = new Schema({
  // we will have an id autmontically created for us.
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
});
/**
 * Models are higher-order constructors that take a schema and create an
 * instance of a document equivalent to records in a relational database.
 */
// "Employee" will be converted to "employees" collection in the databse.
module.exports = mongoose.model("Employee", employeesSchema);
