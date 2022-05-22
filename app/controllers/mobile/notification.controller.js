const db = require("../../models");
const Profile = db.profile;
const Activity = db.activity

exports.list = async (req, res) => {
    try {
        const user = await Profile.findOne({ _id: req.userId });
        const activity = await Activity.findOne({userId: req.userId, companyId: user.userGroup})
        return res.send(activity.notifications.slice(0, 15));
    } catch (error) {
        return res.status(500).send({ message: error });
    }
}