"use client";

import { useState, useRef, useEffect } from "react";

type Role = "agent" | "user";

type Message = {
  id: string;
  role: Role;
  content: string;
};

type AgentReply = { content: string; surveyComplete?: boolean };

async function getAgentReply(
  messages: { role: Role; content: string }[]
): Promise<AgentReply> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText || "Failed to get reply");
  }
  const data = (await res.json()) as { content: string; surveyComplete?: boolean };
  return {
    content: data.content ?? "",
    surveyComplete: data.surveyComplete,
  };
}

const COMPLETION_MESSAGE =
  "Thank you for completing the survey. We appreciate your feedback.";

export default function SurveyChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Fetch initial question from AI on mount
  useEffect(() => {
    getAgentReply([])
      .then(({ content }) => {
        setMessages([{ id: crypto.randomUUID(), role: "agent", content }]);
        setError(null);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Something went wrong")
      )
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "44px";
    ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`;
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "44px";
    setIsLoading(true);
    setError(null);

    try {
      const { content, surveyComplete } = await getAgentReply(
        nextMessages.map((m) => ({ role: m.role, content: m.content }))
      );
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "agent", content },
      ]);
      if (surveyComplete) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "agent",
            content: COMPLETION_MESSAGE,
          },
        ]);
        setIsComplete(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get reply");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0f]">
      {/* Subtle gradient orbs in background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-amber-500/10 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-500/5 blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative shrink-0 border-b border-white/[0.06] bg-black/20 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/20">
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
            <h1 className="text-sm font-semibold tracking-tight text-white">
              SignalSafe Survey
            </h1>
            <p className="text-xs text-white/45">Share your feedback in a short conversation</p>
          </div>
        </div>
      </header>

      {error && (
        <div className="relative mx-auto max-w-3xl px-4 py-2">
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
            {error}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="relative min-h-0 flex-1 overflow-y-auto">
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/25 to-amber-600/25 text-amber-400 ring-1 ring-amber-400/20">
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
                    ? "max-w-[85%] rounded-2xl rounded-tl-md border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-[15px] leading-relaxed text-white/95 shadow-lg shadow-black/10"
                    : "max-w-[85%] rounded-2xl rounded-tr-md border border-amber-500/20 bg-gradient-to-br from-amber-500/25 via-slate-800/90 to-slate-900/95 px-4 py-3 text-[15px] leading-relaxed text-white shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                }
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="mb-6 flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/25 to-amber-600/25 text-amber-400 ring-1 ring-amber-400/20">
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
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-white/[0.06] bg-white/[0.04] px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400/80 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400/80 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-amber-400/80" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="relative shrink-0 border-t border-white/[0.06] bg-black/30 p-4 backdrop-blur-md">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 shadow-xl shadow-black/20 transition focus-within:border-amber-500/40 focus-within:ring-2 focus-within:ring-amber-500/20"
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
            className="min-h-[44px] max-h-32 flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] text-white placeholder:text-white/35 focus:outline-none"
            disabled={isLoading || isComplete}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isComplete}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-[0_4px_14px_rgba(245,158,11,0.4)] transition hover:from-amber-300 hover:to-amber-500 hover:shadow-[0_4px_20px_rgba(245,158,11,0.5)] disabled:opacity-40 disabled:shadow-none"
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
        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-white/35">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
