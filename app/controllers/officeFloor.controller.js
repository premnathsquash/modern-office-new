const db = require("../models");

const Office = db.office;
const Floor = db.floor

const updateFloorToOffice = async(id, slug, officeName)=>{
  Office.findOneAndUpdate({ slug: slug, officeName: officeName }, {floors: id}, (
    err,
    floor1
  )=>{
    if (err) {
      return ({ "message": err });
      
    }
    return "floor is associated with office";
  })
}

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

exports.CreateFloor = async (req, res, next) => {
  const { slug, officeName } = req.body;
  const floor = new Floor({
    slug,
    officeName,
  });
  Floor.findOne({ slug: slug, officeName: officeName }, function (
    err,
    floor1
  ) {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (floor1) return res.end("floor already present");
    
    floor.save((err, data) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      updateFloorToOffice(data._id, slug, officeName)
      return res.end("floor created");
    });
  });
};

