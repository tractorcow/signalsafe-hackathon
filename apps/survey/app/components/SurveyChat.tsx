"use client";

import { useState, useRef, useEffect } from "react";
import { getSurvey } from "@/lib/survey";
import type { Survey } from "@/lib/survey";

type Role = "agent" | "user";

type Message = {
  id: string;
  role: Role;
  content: string;
};


export default function SurveyChat() {
  const [survey] = useState<Survey>(() => getSurvey());
  const initialQuestion = survey.questions[0]?.introLine ?? "We'd like to hear your thoughts.";
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "agent",
      content: initialQuestion,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "44px";
    ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`;
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "44px";
    setIsLoading(true);

    // Simulate agent reply (replace with real survey flow later)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "agent",
          content:
            "Thanks for that. Next: on a scale of 1–5, how likely are you to recommend us to a friend?",
        },
      ]);
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="flex h-screen flex-col bg-[#0d0d0d]">
      {/* Header */}
      <header className="shrink-0 border-b border-white/10 px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M12 8v4l2 2" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-medium text-white">SignalSafe Survey</h1>
            <p className="text-xs text-white/50">Conversational survey</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.role === "agent"
                  ? "mb-6 flex gap-3"
                  : "mb-6 flex justify-end"
              }
            >
              {msg.role === "agent" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                  >
                    <path d="M12 8v4l2 2" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
              )}
              <div
                className={
                  msg.role === "agent"
                    ? "max-w-[85%] rounded-2xl rounded-tl-md bg-white/5 px-4 py-3 text-[15px] leading-relaxed text-white/90"
                    : "max-w-[85%] rounded-2xl rounded-tr-md bg-emerald-500/20 px-4 py-3 text-[15px] leading-relaxed text-white"
                }
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="mb-6 flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path d="M12 8v4l2 2" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-white/5 px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-white/60 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-white/60 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-white/60" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-white/10 bg-[#0d0d0d] p-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl gap-3 rounded-2xl border border-white/10 bg-white/5 px-2 py-2 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/30"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type your answer..."
            rows={1}
            className="min-h-[44px] max-h-32 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] text-white placeholder:text-white/40 focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white transition hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-white/40">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
