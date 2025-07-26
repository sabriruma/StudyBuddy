import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function useFetchChatsByUserId(currentUserId) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) return;

    const chatQuery = query(
      collection(db, "chats"),
      where("members", "array-contains", currentUserId)
    );

    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const fetchedChats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setChats(fetchedChats);
      setLoading(false);
    });
  }, [currentUserId]);

  return { chats, loading };
}
