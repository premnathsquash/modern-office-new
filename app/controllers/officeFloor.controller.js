const db = require("../models");

const Office = db.office;
const Floor = db.floor;
const mongoose = db.mongoose;
const updateFloorToOffice = async (id, officeId) => {
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
};

exports.CreateOffice = async (req, res, next) => {
  const { slug, officeName, address, zipcode, city, state, country } = req.body;
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
};

exports.ListOffices = async (req, res, next) => {
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
};

exports.CreateFloor = async (req, res, next) => {
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
};
exports.updateOffice = async (req, res, next) => {
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
};
exports.deleteFloor = async (req, res, next) => {
  const { id } = req.params;
  const office = await Office.find({
    floors: { $in: [mongoose.Types.ObjectId(id)] },
  });
  Floor.findOneAndRemove({ _id: id }, function (err) {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (office){
      const officeTemp = {
        ...office._doc,
        floors: office[0]?.floors?.filter(i=> i != id),
      };
      Office.findOneAndUpdate({ _id: office[0]._id }, officeTemp, (err, data) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
      });
    } 
  });
  return res.end("floor deleted");
};
exports.updateFloor = async (req, res, next) => {};
