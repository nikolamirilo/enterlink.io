"use client";
import { MarkdownLoader } from "@/components/MarkdownLoader";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ChatPage() {
  const [input, setInput] = useState("");

  const { messages, status, error, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ask",
    }),
  });
  console.log(messages)

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === "streaming") return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {messages.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="bg-[#1e2d4b]/30 p-8 rounded-2xl shadow-xl border border-white/5 max-w-lg mx-auto backdrop-blur-sm">
              <Sparkles className="w-12 h-12 text-[#169FD6] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                How can I help you?
              </h2>
              <p className="text-gray-300">
                I can access your uploaded documents to answer questions and
                provide information.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-4 ${m.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`flex max-w-[80%] gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user"
                      ? "bg-[#169FD6] text-white"
                      : "bg-[#044685] text-white"
                      }`}
                  >
                    {m.role === "user" ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <Bot className="w-5 h-5" />
                    )}
                  </div>

                  <div
                    className={`p-4 rounded-2xl shadow-sm ${m.role === "user"
                      ? "bg-[#169FD6] text-white rounded-tr-none"
                      : "bg-[#1e2d4b] border border-white/5 text-gray-100 rounded-tl-none"
                      }`}
                  >
                    {/* AI SDK 5.0: Messages use parts array instead of content string */}
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {m.parts.map((part, i) => {
                        if (part.type === "text") {
                          return (
                            <MarkdownLoader
                              key={i}
                              className={` ${m.role === "user" ? "text-white!" : "text-gray-100"
                                }`}
                            >
                              {part.text}
                            </MarkdownLoader>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {(status === "submitted" || status === "streaming") && (
              <div className="flex justify-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-8 h-8 rounded-full bg-[#044685] text-white flex items-center justify-center shrink-0 shadow-lg">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-[#1e2d4b] p-4 rounded-2xl rounded-tl-none border border-white/5 shadow-xl flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#169FD6] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-[#169FD6] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-[#169FD6] rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-sm font-medium text-gray-300 animate-pulse">
                    {status === "submitted" ? "Thinking..." : "Generating response..."}
                  </span>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-center my-4">
                <div className="bg-red-900/20 text-red-200 px-4 py-3 rounded-lg border border-red-800 flex items-center gap-2">
                  <p className="text-sm font-medium">
                    An error occurred. Please try again.
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="bg-[#101C34] border-t border-white/5 pt-8 p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center gap-2"
          >
            <input
              className="flex-1 p-4 pr-12 rounded-xl border border-white/10 focus:border-[#169FD6] focus:outline-none focus:ring-1 focus:ring-[#169FD6] shadow-sm transition-all bg-[#0d1629] text-white placeholder-gray-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={status === "streaming" || status === "submitted"}
            />
            <button
              type="submit"
              disabled={status === "streaming" || status === "submitted" || !input.trim()}
              className="absolute right-2 p-2 bg-[#169FD6] text-white rounded-lg hover:bg-[#0A68A8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors z-10"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-xs text-center text-gray-500 mt-2">
            AI can make mistakes. Please verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
