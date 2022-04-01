const db = require("../models");

const Office = db.office;
const Floor = db.floor;

const updateFloorToOffice = async (id, officeId) => {
  const office = await Office.findOne({ _id: officeId })
  Office.findOneAndUpdate({ _id: officeId }, { floors: [id, ...office.floors] }, (err, floor1) => {
    if (err) {
      return { message: err };
    }
    return "floor is associated with office";
  });
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
    updated_at: Date.now()
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
    const offices = await Office.find({ slug: slug }).sort([["updated_at", -1]]).populate({path: 'floors', options: { sort: { 'created_at': -1 } } });
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
