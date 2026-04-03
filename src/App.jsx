import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://chat-app-backend-6v9e.onrender.com", {
  transports: ["websocket"],
  });


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


    if (!username) {
  alert("Enter username");
  return;
}
    socket.emit("send_message", msgData);
    setMessage("");
  };


  useEffect(() => {
  socket.on("receive_message", (data) => {
    console.log("📩 Received:", data); // ADD THIS
    setMessageList((list) => [...list, data]);
  });

  return () => {
    socket.off("receive_message");
  };
}, []);
  useEffect(() => {
  if (username) {
    socket.emit("typing", { sender: username, receiver: "all" });
  }
}, [username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  useEffect(() => {
  socket.on("connect", () => {
    console.log("✅ Connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected");
  });

  socket.on("connect_error", (err) => {
    console.log("❌ Connection Error:", err.message);
  });
}, []);

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
<div className="min-h-screen flex flex-col bg-[#111b21]">      {/* Header */}
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
<div
  className="bg-[#202c33] p-3 flex gap-2"
  style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
>        <input
          className="flex-1 p-2 mb-3.5 rounded-full bg-[#2a3942] text-white outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="bg-[#00a884] mb-3.5 px-4 rounded-full text-white hover:bg-[#019874]"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;