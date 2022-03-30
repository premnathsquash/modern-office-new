const db = require("../models");

const Office = db.office;

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
    office.save((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      return res.end("office created");
    });
  });
};

exports.ListOffices= async (req, res, next) => {
  const { slug } = req.query;
  try{
    const offices = await Office.find({slug: slug})
    return res.json([...offices]);
  }catch(err){
    res.status(500).send({ message: err });
    return;
  }

}
