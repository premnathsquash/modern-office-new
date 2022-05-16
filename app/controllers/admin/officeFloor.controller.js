const db = require("../../models");

const Office = db.office;
const Floor = db.floor;
const Seats = db.seats;
const User = db.user;
const mongoose = db.mongoose;
const updateFloorToOffice = async (id, officeId) => {
  try {
    const office = await Office.findOne({ _id: officeId });

    Office.findOneAndUpdate(
      { _id: officeId },
      { floors: [id, ...office.floors] },
      (err, floor1) => {
        if (err) {
          return { message: err };
        }
        return "floor is associated with office";
      }
    );
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
exports.CreateOffice = async (req, res, next) => {
  try {
    const {
      slug,
      officeName,
      address,
      zipcode,
      city,
      state,
      country,
    } = req.body;
    const office = new Office({
      slug,
      officeName,
      address,
      zipcode,
      city,
      state,
      country,
    });
    Office.findOne({ slug: slug, officeName: officeName }, function (
      err,
      office1
    ) {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (office1) return res.end("office already present");
      office.save((err, data) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        return res.json({ ...data });
      });
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
exports.ListOffices = async (req, res, next) => {
  try {
    const { slug } = req.query;
    try {
      const offices = await Office.find({ slug: slug })
        .sort([["updatedAt", -1]])
        .populate({ path: "floors" });

      return res.json([...offices]);
    } catch (err) {
      res.status(500).send({ message: err });
      return;
    }
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
exports.CreateFloor = async (req, res, next) => {
  try {
    const { name, officeId } = req.body;
    const floor = new Floor({
      name,
    });
    floor.save((err, data) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      updateFloorToOffice(data._id, officeId);
      return res.end("floor created");
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
exports.updateOffice = async (req, res, next) => {
  try {
    const { id, officeName, address, city, state, country, zipcode } = req.body;
    const office = await Office.findOne({ _id: id });
    const officeTemp = {
      ...office._doc,
      officeName: officeName,
      address: address,
      city: city,
      state: state,
      country: country,
      zipcode: zipcode,
    };
    Office.findOneAndUpdate({ _id: id }, officeTemp, (err, office1) => {
      if (err) {
        return { message: err };
      }
      return res.end("office is updated successfully");
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
exports.deleteFloor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const office = await Office.find({
      floors: { $in: [mongoose.Types.ObjectId(id)] },
    });
    Floor.findOneAndRemove({ _id: id }, function (err) {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (office) {
        const officeTemp = {
          ...office._doc,
          floors: office[0]?.floors?.filter((i) => i != id),
        };
        Office.findOneAndUpdate(
          { _id: office[0]._id },
          officeTemp,
          (err, data) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
          }
        );
      }
    });
    return res.end("floor deleted");
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
exports.updateFloor = async (req, res, next) => {
  try {
    const floor_seat = await Floor.find({ _id: req.params.id });
    if (floor_seat[0].Seats) {
      const seat = await Seats.find({ _id: floor_seat[0].Seats });
      Seats.findOneAndUpdate(
        { _id: seat[0]._id },
        {
          seats: seat[0].seats,
          officeInfo: seat[0].officeInfo,
          ...req.body,
          floorName: req.body.floorName ?? floor_seat[0].name,
        },
        { new: true },
        (err, data) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          Floor.findOneAndUpdate(
            { _id: req.params.id },
            { name: req.body.floorName ?? floor_seat[0].name },
            (err, data1) => {
              if (err) {
                res.status(500).send({ message: err });
                return;
              }
              //console.log("\n ", data1);
            }
          );
        }
      );
      return res.end("floor updated");
    } else {
      const seats = new Seats({ ...req.body });
      seats.save((err, data) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        Floor.findOneAndUpdate(
          { _id: req.params.id },
          { name: req.body.floorName ?? floor_seat[0].name, Seats: data._id },
          { new: true },
          (err, data1) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            //console.log("\n ", data1);
          }
        );

        return res.end("floor updated");
      });
    }
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
exports.getFloor = async (req, res, next) => {
  try {
    const floor = await Floor.find({ _id: req.params.id }).populate({
      path: "Seats",
    });
    const temp = floor;
    return res.send({ res: temp[0] });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

exports.unreservedSeats = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.userId }).populate({
      path: "profile",
    });
    return res.send({ res: "works" });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
