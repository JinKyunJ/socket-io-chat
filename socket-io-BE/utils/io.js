const chatController = require("../Controllers/chat.controller");
const userController = require("../Controllers/user.controller");

module.exports = function (io) {
    // io ~~~~
    io.on("connection", async (socket) => {
        // 연결 됬을 때
        console.log("client is connected", socket.id);

        socket.on("login", async (userName, cb) => {
            // 유저 정보를 저장
            try {
                const user = await userController.saveUser(userName, socket.id);
                const welcomeMessage = {
                    _id: user._id,
                    chat: `${user.name}님이 입장했습니다.`,
                    user: { id: user._id, name: "system" },
                };
                io.emit("message", welcomeMessage);
                cb({ ok: true, data: user });
            } catch (error) {
                cb({ ok: false, error: error.message });
            }
        });

        socket.on("sendMessage", async (message, cb) => {
            try {
                // 유저 찾기 socket id로 찾기
                const user = await userController.checkUser(socket.id);
                // 메세지 저장(유저)
                const newMessage = await chatController.saveChat(message, user);
                io.emit("message", newMessage);
                cb({ ok: true });
            } catch (error) {
                cb({ ok: false, error: error.message });
            }
        });

        // 연결 안 됬을 때
        socket.on("disconnect", async () => {
            try {
                // 유저 정보 찾기
                const user = await userController.checkUser(socket.id);

                if (user) {
                    // 퇴장 메시지 생성
                    const exitMessage = {
                        _id: `exit-${user._id}`, // 퇴장 메시지에도 고유한 _id
                        chat: `${user.name}님이 퇴장했습니다.`,
                        user: { id: "system", name: "system" }, // 시스템 메시지
                    };

                    // 모든 클라이언트에게 브로드캐스트
                    io.emit("message", exitMessage);
                }
            } catch (error) {
                console.log("Error on disconnect", error.message);
            }
            console.log("user is disconnected");
        });
    });
};
