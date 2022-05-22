const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890abcdefghijklmnABCDEFGHIJKLMN", 10);
const { createPdf, importer } = require("../../config/exportImportDocs");

exports.exportPdfFile = async (req, res) => {
    const name = nanoid()
    const file = await createPdf("check", name)
    console.log(file);
   
}