const db = require("../../models");

const Vendor = db.vendor;
const Promotion = db.promotion;

exports.createVendor = async (req, res) => {
  const {
    companyName,
    companyDescription,
    companyCategories,
    contactName,
    contactNumber,
    contactEmail,
  } = req.body;
  const [image, image2] = req.files;
  const vendor1 = new Vendor({
    companyName,
    companyDescription,
    companyCategories,
    contactName,
    contactNumber,
    contactEmail,
    companyImage: image?.location ?? "",
    contactImage: image2?.location ?? "",
  });
  vendor1.save((err, data) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
  });
  return res.status(200).send({ message: "Vendor created successfuly" });
};

exports.createPromotion = async (req, res) => {
  const {
    description,
    productName,
    pointsNeeded,
    company,
    coupon,
    offer,
    categories,
    validTill,
    link,
    vendorId,
  } = req.body;
  let fileLocation;
  if (req.file) {
    const { location } = req.file;
    fileLocation = location;
  }
  const vendor = await Vendor.findOne({ _id: vendorId });
  const promotion1 = new Promotion({
    image: fileLocation ?? "",
    description,
    company,
    coupon,
    productName,
    pointsNeeded,
    offer,
    categories,
    validTill,
    link,
  });

  promotion1.save(async (err, data) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    await Vendor.findOneAndUpdate(
      { _id: vendor._id },
      { promotionIds: [...vendor.promotionIds, data._id] },
      (err, data) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
      }
    );
  });

  return res.status(200).send({ message: "promotion created successfuly" });
};

exports.listVendor = async (req, res) => {
  const vendor = await Vendor.find({}).populate({
    path: "promotionIds",
  });
  if (vendor) {
    return res.status(200).send({ data: vendor });
  } else {
    return res.status(200).send({ data: "nothing is available" });
  }
};

exports.listPromotion = async (req, res) => {
  const vendorId = req.query.id;
  const promotions = await Vendor.find({ _id: vendorId }).populate({
    path: "promotionIds",
  });
  if (promotions) {
    return res.status(200).send({ data: promotions[0].promotionIds });
  } else {
    return res.status(200).send({ data: "nothing is available" });
  }
};

exports.updateVendor = async (req, res) => {
  const {
    companyName,
    companyDescription,
    companyCategories,
    contactName,
    contactNumber,
    contactEmail,
    companyImage,
    contactImage,
    vendorId,
  } = req.body;
  const [image, image2] = req.files;
  const vendor = await Vendor.find({ _id: vendorId });
  await Vendor.findOneAndUpdate(
    { _id: vendorId },
    {
      companyName: companyName ?? vendor.companyName,
      companyDescription: companyDescription ?? vendor.companyDescription,
      companyCategories: companyCategories ?? vendor.companyCategories,
      contactName: contactName ?? vendor.contactName,
      contactNumber: contactNumber ?? vendor.contactNumber,
      contactEmail: contactEmail ?? vendor.contactEmail,
      companyImage: companyImage
        ? companyImage
        : image?.location ?? vendor.companyImage,
      contactImage: contactImage
        ? contactImage
        : image2?.location ?? vendor.contactImage,
    },
    (err, data) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      return res.status(200).send({ data: "Updated successfully" });
    }
  );
};
exports.updatePromotion = async (req, res) => {
  const {
    description,
    company,
    coupon,
    productName,
    pointsNeeded,
    offer,
    categories,
    validTill,
    link,
    promotionId,
  } = req.body;
  let fileLocation;
  if (req.file) {
    const { location } = req.file;
    fileLocation = location;
  }

  const promotion = await Promotion.find({ _id: promotionId });
  await Promotion.findOneAndUpdate(
    { _id: promotionId },
    {
      image: fileLocation ?? promotion.image,
      description: description ?? promotion.description,
      company: company ?? promotion.company,
      coupon: coupon ?? promotion.coupon,
      offer: offer ?? promotion.offer,
      productName: productName ?? promotion.productName,
      pointsNeeded: pointsNeeded ?? promotion.pointsNeeded,
      categories: categories ?? promotion.categories,
      validTill: validTill ?? promotion.validTill,
      link: link ?? promotion.link,
    },
    (err, data) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      return res.status(200).send({ data: "Updated successfully" });
    }
  );
};
exports.deleteVendor = async (req, res) => {
  const { vendorId } = req.body;
  const vendor = await Vendor.find({ _id: vendorId }).populate({
    path: "promotionIds",
  });
  if (vendor[0].promotionIds && vendor[0].promotionIds.length > 0) {
    vendor[0].promotionIds.map(async (ele) => {
      await Promotion.findOneAndDelete(
        { _id: ele.id },
        async (err, deleted) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
        }
      );
    });
  }
  await Vendor.findOneAndDelete({ _id: vendor[0].id }, async (err, deleted) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
  });
  return res.status(200).send({ data: "Deleted successfully" });
};
exports.deletePromotion = async (req, res) => {
  const { promotionId, vendorId } = req.body;
  const vendor = await Vendor.find({ _id: vendorId });
  const newIds = vendor[0].promotionIds.filter((ele) => ele != promotionId);
  await Vendor.findOneAndUpdate(
    { _id: vendorId },
    { promotionIds: newIds },
    async (err, data) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      await Promotion.findOneAndDelete({ _id: promotionId }, (err1) => {
        if (err1) {
          res.status(500).send({ message: err1 });
          return;
        }
      });
    }
  );

  return res.status(200).send({ data: "Deleted successfully" });
};
