import React from "react";
import { useNavigate } from "react-router-dom";

const ChatAndGroupComponent = ({ item, currentUserId }) => {
  const isGroupChat = !!item.id && !item.chatId;
  const navigate = useNavigate();
  console.log("clicked item:", item);

  const handleOnClick = () => {
    const id = isGroupChat ? item.id : item.otherUserId;
    const path = isGroupChat ? `groupId=${id}` : `chatId=${id}`;
    navigate(`/chat?${path}`);
  };
  console.log(
    (item?.name || item?.displayName || "Err") +
      "===" +
      (item?.id || item?.chatId)
  );

  return (
    <div
      onClick={handleOnClick}
      className="flex rounded-lg w-full p-2 flex-col gap-2 bg-white dark:bg-[#1e1e1e] border border-black/20 dark:border-white/20 cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <img src={item.avatar} alt="" className="w-7" />
        <div>{item?.name || item?.displayName || "Err"}</div>
      </div>
      <div className="text-sm">
        <strong>
          {item.lastMessage?.from === currentUserId ||
          item.lastMessage?.senderId === currentUserId
            ? "You"
            : item.lastMessage?.senderName || item.displayName}
          :{" "}
        </strong>
        {item.lastMessage?.text || "No messages yet."}
      </div>
    </div>
  );
};

export default ChatAndGroupComponent;
