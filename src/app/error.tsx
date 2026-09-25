"use client";

export default function ErrorBoundary({ reset }: { reset: () => void }) {
  return <main><h1>Something went wrong</h1><button onClick={reset}>Try again</button></main>;
}
