const db = require("../models");
const Departments = db.departments;
const User = db.user;

exports.createDepartment = async (req, res) => {
  try {
    const { department } = req.body;
    const user = await User.findOne({ _id: req.userId });
    const departments = new Departments({
      departments: department,
    });
    departments.save((err, data) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      User.findOneAndUpdate(
        { _id: req.userId },
        { departments: [data._id, ...user.departments] },
        (err, department1) => {
          if (err) {
            return { message: err };
          }
          return res.send("Department is associated with office");
        }
      );
    });
  } catch (err) {
    return res.json({ res: "Error in Department" });
  }
};

exports.getAllDepartment = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId }).populate({path:"departments"});
    return res.json({departmentToggle: true, deptData: user.departments, count: user.departments.length});
  } catch (err) {
    return res.json({ res: "Error in Department" });
  }
};
exports.updateDepartment = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    return res.json(user);
  } catch (err) {
    return res.json({ res: "Error in Department" });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    return res.json(user);
  } catch (err) {
    return res.json({ res: "Error in Department" });
  }
};
