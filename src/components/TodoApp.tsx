"use client";

import { FormEvent, useEffect, useState } from "react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

type Filter = "all" | "active" | "completed";

const STORAGE_KEY = "nextjs-todo-items";

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTodos(JSON.parse(raw) as Todo[]);
    } catch {
      // ignore corrupt storage
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, ready]);

  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setTodos((current) => [
      { id: crypto.randomUUID(), text: trimmed, completed: false },
      ...current,
    ]);
    setText("");
  }

  function toggleTodo(id: string) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  function deleteTodo(id: string) {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  }

  function clearCompleted() {
    setTodos((current) => current.filter((todo) => !todo.completed));
  }

  const visible = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const remaining = todos.filter((todo) => !todo.completed).length;

  return (
    <div className="mx-auto w-full max-md:w-full">
      <header className="mb-8">
        <h1 className="font-display text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
          Ticksy
        </h1>
        <p className="mt-3 text-base text-slate-600">
        Every tick brings progress.
        </p>
      </header>

      <form onSubmit={addTodo} className="mb-6 flex gap-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="What needs doing?"
          aria-label="New todo"
          className="min-w-0 flex-1 border border-slate-300 bg-white/80 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-700 focus:ring-2 focus:ring-sky-700/20"
        />
        <button
          type="submit"
          className="bg-sky-800 px-5 py-3 font-medium text-white transition hover:bg-sky-900 active:translate-y-px"
        >
          Add
        </button>
      </form>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex gap-1" role="tablist" aria-label="Filter todos">
          {(["all", "active", "completed"] as Filter[]).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={filter === option}
              onClick={() => setFilter(option)}
              className={`px-3 py-1.5 capitalize transition ${
                filter === option
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <p className="text-slate-500">
          {remaining} left
          {todos.some((todo) => todo.completed) ? (
            <>
              {" · "}
              <button
                type="button"
                onClick={clearCompleted}
                className="text-slate-700 underline-offset-2 hover:underline"
              >
                Clear done
              </button>
            </>
          ) : null}
        </p>
      </div>

      <ul className="divide-y divide-slate-200 border border-slate-200 bg-white/70 backdrop-blur-sm">
        {!ready ? (
          <li className="px-4 py-8 text-center text-slate-500">Loading…</li>
        ) : visible.length === 0 ? (
          <li className="px-4 py-10 text-center text-slate-500">
            {todos.length === 0
              ? "No todos yet. Add one above."
              : "Nothing in this filter."}
          </li>
        ) : (
          visible.map((todo) => (
            <li
              key={todo.id}
              className="group flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50/80"
            >
              <button
                type="button"
                onClick={() => toggleTodo(todo.id)}
                aria-label={
                  todo.completed ? "Mark as incomplete" : "Mark as complete"
                }
                className={`flex h-5 w-5 shrink-0 items-center justify-center border transition ${
                  todo.completed
                    ? "border-sky-800 bg-sky-800 text-white"
                    : "border-slate-400 hover:border-sky-800"
                }`}
              >
                {todo.completed ? (
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden
                  >
                    <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
                  </svg>
                ) : null}
              </button>
              <span
                className={`min-w-0 flex-1 break-words ${
                  todo.completed
                    ? "text-slate-400 line-through"
                    : "text-slate-800"
                }`}
              >
                {todo.text}
              </span>
              <button
                type="button"
                onClick={() => deleteTodo(todo.id)}
                aria-label={`Delete ${todo.text}`}
                className="shrink-0 px-2 py-1 text-sm text-slate-400 opacity-0 transition group-hover:opacity-100 hover:text-rose-700 focus:opacity-100"
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
