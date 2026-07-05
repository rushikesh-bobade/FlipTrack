"use client";

import { useState } from "react";
import styles from "./ChatWidget.module.css";
import { starterPrompts } from "./StarterPrompts";
import { chatbotData } from "./chatbotData";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔁 LOCAL FAQ MATCH FUNCTION
  const findLocalAnswer = (text: string) => {
    const msg = text.toLowerCase().trim();

    const match = chatbotData.find((item) =>
      msg.includes(item.question)
    );

    return match?.answer || null;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // 🔥 STEP 1: LOCAL LOOP CHECK (FAST RESPONSE)
    const localAnswer = findLocalAnswer(text);

    if (localAnswer) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: localAnswer },
      ]);
      setLoading(false);
      return;
    }

    // 🌐 STEP 2: BACKEND FALLBACK (/api/chat)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      setMessages([
        ...newMessages,
        { role: "assistant", content: data.reply || "No response" },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Error connecting to server." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className={styles.chatWrapper}>
      {/* Floating button */}
      {!open && (
        <button className={styles.fab} onClick={() => setOpen(true)}>
          💬
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className={styles.chatBox}>
          <div className={styles.header}>
            <span>FlipTrack Assistant</span>
            <button onClick={() => setOpen(false)}>✖</button>
          </div>

          {/* Messages */}
          <div className={styles.body}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? styles.user : styles.bot}
              >
                {m.content}
              </div>
            ))}

            {loading && <div className={styles.bot}>Typing...</div>}
          </div>

          {/* Suggested questions */}
          <div className={styles.suggestions}>
  {chatbotData.map((p) => (
    <button
      key={p.question}
      onClick={() => sendMessage(p.question)}
      className={styles.suggestionBtn}
    >
      {p.question}
    </button>
  ))}
</div>

          {/* Input box */}
          <div className={styles.inputBox}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about FlipTrack..."
            />
            <button onClick={() => sendMessage(input)}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}