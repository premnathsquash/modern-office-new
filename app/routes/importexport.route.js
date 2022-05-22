const multer = require("multer");
const { fileImportStorage } = require("../config/s3");
const uploadcsv = multer({ fileImportStorage }).single("csv");
const { errors } = require("celebrate");
const {  authJwt } = require("../middlewares");
const controller = require("../controllers/admin/importexportfile.controller");


module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/upload-pdf", controller.exportPdfFile)

  app.use(errors());
};