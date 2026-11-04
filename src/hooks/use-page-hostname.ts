"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getHostname() {
  return window.location.hostname;
}

function getServerHostname() {
  return "";
}

/** Hostname after hydration. The server snapshot is empty so the first client render matches SSR. */
export function usePageHostname(): string | undefined {
  const hostname = useSyncExternalStore(subscribe, getHostname, getServerHostname);
  return hostname === "" ? undefined : hostname;
}
