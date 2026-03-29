export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex lg:flex-col">
        <h1 className="text-4xl font-bold mb-4">Welcome to Product</h1>
        <p className="text-muted-foreground mb-8">
          Your MVP is ready for development.
        </p>
        <div className="flex gap-4">
          <a
            href="/api"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            API Docs
          </a>
          <a
            href="https://github.com"
            className="px-4 py-2 border rounded-md hover:bg-secondary transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </main>
  );
}
