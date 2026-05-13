"use client";

import { useEffect, useRef, useState } from "react";

interface PollOptions {
  /** Interval in milliseconds between successful polls. */
  intervalMs: number;
  /** Stop polling when the tab is hidden (Page Visibility API). Default: true. */
  pauseWhenHidden?: boolean;
  /** Run an immediate fetch when the hook mounts. Default: true. */
  immediate?: boolean;
}

interface PollState<T> {
  data: T;
  lastUpdatedAt: number | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Lightweight client-side polling hook.
 *
 * - Calls `fetcher` every `intervalMs`, starting `initialData` from SSR.
 * - Skips ticks while the document is hidden (browser still throttles
 *   `setInterval` to ~1m on background tabs anyway).
 * - Resumes immediately when the tab becomes visible again.
 * - Aborts in-flight requests across re-renders / unmount so we don't race.
 */
export function usePoll<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  initialData: T,
  { intervalMs, pauseWhenHidden = true, immediate = true }: PollOptions,
): PollState<T> {
  const [state, setState] = useState<PollState<T>>({
    data: initialData,
    lastUpdatedAt: null,
    isLoading: false,
    error: null,
  });

  // Keep the latest fetcher in a ref so we can reference it inside the
  // interval callback without re-creating the timer on every render.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;
    let controller: AbortController | null = null;

    async function tick() {
      if (cancelled) return;
      if (pauseWhenHidden && typeof document !== "undefined" && document.hidden) return;
      controller?.abort();
      controller = new AbortController();
      setState((s) => ({ ...s, isLoading: true }));
      try {
        const data = await fetcherRef.current(controller.signal);
        if (cancelled) return;
        setState({ data, lastUpdatedAt: Date.now(), isLoading: false, error: null });
      } catch (err) {
        if (cancelled || (err as Error).name === "AbortError") return;
        setState((s) => ({ ...s, isLoading: false, error: err as Error }));
      }
    }

    function start() {
      stop();
      timer = setInterval(tick, intervalMs);
    }
    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function onVisibility() {
      if (document.hidden) {
        stop();
      } else {
        tick();
        start();
      }
    }

    if (immediate) void tick();
    start();
    if (pauseWhenHidden && typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      cancelled = true;
      stop();
      controller?.abort();
      if (pauseWhenHidden && typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
    };
  }, [intervalMs, pauseWhenHidden, immediate]);

  return state;
}
