"use client";

import axios from "axios";
import { Bot, Loader2, MessageCircle, Send, User, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "model";
  text: string;
}

interface ChatHistory {
  role: "user" | "model";
  parts: { text: string }[];
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Hey! I'm GymBot 💪 How can I help you find the perfect gym equipment today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getHistory = (): ChatHistory[] => {
    return messages.slice(1).map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const res = await axios.post("/api/chat", {
        message: userMessage,
        history: getHistory(),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: res.data.response,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Sorry, I'm having trouble responding right now. Please try again!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat window */}
      {isOpen && (
        <div
          className="mb-4 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div className="bg-orange-500 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">GymBot</p>
                <p className="text-orange-100 text-xs">
                  Your fitness assistant
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-orange-500" : "bg-slate-700"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-orange-400" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-orange-500 text-white rounded-tr-sm"
                      : "bg-slate-800 text-slate-200 rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-orange-400" />
                </div>
                <div className="bg-slate-800 px-3 py-2 rounded-2xl rounded-tl-sm">
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-slate-800 shrink-0">
            <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="text-orange-400 hover:text-orange-300 disabled:opacity-30 transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-600 text-xs text-center mt-1.5">
              Powered by Gemini AI
            </p>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        title="AI Assisnent"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-orange-500 hover:bg-orange-400 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
