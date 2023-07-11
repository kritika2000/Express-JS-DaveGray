// const data = {};
// data.employees = require("../model/data.json");
const Employee = require("../model/Employee");

const getAllEmployees = async (req, res) => {
  // res.json(data.employees);
  const employees = await Employee.find();
  if (!employees)
    return res.status(204).json({ message: "No employees found!" });
  res.json(employees);
};

const createEmployee = async (req, res) => {
  // res.json({
  //   firstname: req.body.firstname,
  //   lastname: req.body.lastname,
  // });
  if (!req.body?.firstname || !req?.body?.lastname) {
    return res
      .status(400)
      .json({ message: "First and Last name are required" });
  }
  try {
    const result = await Employee.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
    });
    res.status(201).json(result);
  } catch (err) {
    console.log(err);
  }
};

const updateEmployee = async (req, res) => {
  if (!req?.body?.id) {
    return res.status(400).json({ message: "ID is required" });
  }
  // find the employee with the id passed.
  const employee = await Employee.findOne({ _id: req.body.id }).exec();
  if (!employee) {
    return res
      .status(400)
      .json({ message: `No employee matches with ID ${req.body.id}` });
  }
  // update the user with id.
  if (req.body?.firstname) employee.firstname = req.body.firstname;
  if (req.body?.lastname) employee.firstname = req.body.lastname;
  const result = await employee.save();
  res.json(result);
};

const deleteEmployee = async (req, res) => {
  if (!req?.body?.id) {
    return res.status(400).json({ message: "ID is required" });
  }
  // find the employee with the id passed.
  const employee = await Employee.findOne({ _id: req.body.id }).exec();
  if (!employee) {
    return res
      .status(400)
      .json({ message: `No employee matches with ID ${req.body.id}` });
  }
  // delete the user with id.
  const result = await employee.deleteOne({ _id: req.body.id });
  res.json(result);
};

const getEmployee = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "ID is required" });
  }
  // find the employee with the id passed.
  const employee = await Employee.findOne({ _id: req.params.id }).exec();
  if (!employee) {
    return res
      .status(400)
      .json({ message: `No employee matches with ID ${req.params.id}` });
  }
  // get the user with id passed.
  res.json(employee);
};

module.exports = {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployee,
};
