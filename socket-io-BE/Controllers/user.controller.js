const User = require("../Models/users.js");
const userController = {};

userController.saveUser = async (userName, sid) => {
    // 이미 있는 유저인지 확인
    let user = await User.findOne({ name: userName });
    // 없다면 새로 유저정보 만들기
    if (!user) {
        user = new User({
            name: userName,
            token: sid,
            online: true,
        });
    }
    // 이미 있는 유저라면 연결정보 token 값만 변경
    user.token = sid;
    user.online = true;

    await user.save();
    console.log("server user", user);
    return user;
};

userController.checkUser = async (sid) => {
    const user = await User.findOne({ token: sid });
    if (!user) throw new Error("user not found");
    return user;
};

module.exports = userController;
