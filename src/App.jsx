import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://chat-app-backend-6v9e.onrender.com");

function Chat() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const messagesEndRef = useRef(null);

  const sendMessage = () => {
    if (!message.trim()) return;

    const msgData = {
      username,
      message,
    };

    socket.emit("send_message", msgData);
    setMessage("");
  };

  socket.emit("typing", { sender: username, receiver: "all" });

  useEffect(() => {
    const handleMessage = (data) => {
      setMessageList((list) => [...list, data]);
    };

    socket.on("receive_message", handleMessage);

    return () => socket.off("receive_message", handleMessage);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  // 🟢 Username screen
  if (!joined) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#111b21]">
        <div className="bg-[#202c33] p-6 rounded-lg w-80 text-white">
          <h2 className="text-lg mb-4 text-center">Enter your name</h2>
          <input
            className="w-full p-2 rounded bg-[#2a3942] outline-none"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            onClick={() => username && setJoined(true)}
            className="w-full mt-4 bg-[#00a884] p-2 rounded hover:bg-[#019874]"
          >
            Start Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#111b21]">
      {/* Header */}
      <div className="bg-[#202c33] text-white p-4 font-semibold shadow">
        WhatsApp Clone
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messageList.map((msg, index) => {
          const isMe = msg.username === username;

          return (
            <div
              key={index}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 max-w-xs rounded-lg text-sm ${
                  isMe
                    ? "bg-[#005c4b] text-white rounded-br-none"
                    : "bg-[#202c33] text-white rounded-bl-none"
                }`}
              >
                {!isMe && (
                  <p className="text-xs text-gray-400">{msg.username}</p>
                )}
                <p>{msg.message}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-[#202c33] p-3 flex gap-2">
        <input
          className="flex-1 p-2 rounded-full bg-[#2a3942] text-white outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="bg-[#00a884] px-4 rounded-full text-white hover:bg-[#019874]"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;