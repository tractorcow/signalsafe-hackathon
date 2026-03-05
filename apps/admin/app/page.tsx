export default function AdminHome() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            SignalSafe Admin
          </h1>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-slate-600 dark:text-slate-400">
          Admin dashboard — manage surveys and responses here.
        </p>
      </main>
    </div>
  );
}
