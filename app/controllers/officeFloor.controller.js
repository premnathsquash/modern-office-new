const db = require("../models");

const Office = db.office;

exports.CreateOffice = async (req, res, next) => {
  const { slug, officeName } = req.body;
  const office = new Office({
    slug,
    officeName,
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
