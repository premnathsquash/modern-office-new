const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890abcdefghijklmnABCDEFGHIJKLMN", 10);
const { createPdf, importer } = require("../../config/exportImportDocs");

exports.exportPdfFile = async (req, res) => {
    try {
        const name = nanoid()
        const s3 = await createPdf("check", name)
        return res.status(200).send({ location: s3 });
    } catch (error) {
        return res.status(500).send({ message: error });
    }

}