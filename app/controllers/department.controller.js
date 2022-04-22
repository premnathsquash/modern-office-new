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
    const user = await User.findOne({ _id: req.userId }).populate({
      path: "departments",
    });
    return res.json({
      departmentToggle: true,
      deptData: user.departments,
      count: user.departments.length,
    });
  } catch (err) {
    return res.json({ res: "Error in Department" });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    const { id, department, status } = req.body;
    const indexed = user?.departments.find((element) => element == id);
    if (indexed) {
      await Departments.findOneAndUpdate(
        { _id: id },
        { departments: department, status: status },
        (err, department1) => {
          if (err) {
            return { message: err };
          }
          return res.json({ res: "update in Department" });
        }
      );
    } else {
      return res.json({
        res: "can't update Department since it's not associated ",
      });
    }
  } catch (err) {
    return res.json({ res: "Error in Department" });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.find({
      _id: req.userId,
      departments: { $in: id },
    });
    if (user) {
      await Departments.findOneAndRemove({ _id: id }, function (err) {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        const departs = user[0].departments?.filter((i) => i != id);
        User.findOneAndUpdate(
          { _id: req.userId },
          { departments: departs },
          (err, data) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
          }
        );
      });
    }
    return res.json({ res: "deleted in Department" });
  } catch (err) {
    return res.json({ res: "Error in Department" });
  }
};
