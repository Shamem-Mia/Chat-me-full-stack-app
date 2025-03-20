import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { MessageInput } from "./MessageInput";
import { ChatHeader } from "./ChatHeader";
import { MessageSkeleton } from "./skeleton/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import formatMessageTime from "../lib/utils.js";

export const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const { socket } = useAuthStore.getState();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);

    // socket.off("receiveNotification");
    subscribeToMessages();

    return () => {
      socket.off("receiveNotification");

      unsubscribeFromMessages();
    };
  }, [
    selectedUser._id,
    getMessages,
    socket,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messagesEndRef.current && messages) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading)
    return (
      <div className=" flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className=" flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? " chat-end" : "chat-start"
            }`}
            ref={messagesEndRef}
          >
            <div className=" chat-image avatar">
              <div className=" size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.jpeg"
                      : selectedUser.profilePic || "/avatar.jpeg"
                  }
                  alt="Profile"
                />
              </div>
            </div>
            <div className=" chat-header mb-1">
              <time className=" text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className=" chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className=" sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
        {/* auto scrolled div */}
        {/* <div ref={messagesEndRef}></div> */}
      </div>
      <MessageInput />
    </div>
  );
};
