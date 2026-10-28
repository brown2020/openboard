import { lookup } from "node:dns/promises";
import { isAllowedWebhookUrl } from "@/lib/form-webhook-url";
import { isBlockedIp, normalizeHostname } from "@/lib/public-host";

const MAX_REDIRECTS = 2;

export type AddressLookup = (hostname: string) => Promise<string[]>;

async function defaultLookup(hostname: string): Promise<string[]> {
  const results = await lookup(hostname, { all: true, verbatim: true });
  return results.map((entry) => entry.address);
}

function isIpLiteral(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  return host.includes(":") || /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
}

export async function isAllowedWebhookDestination(
  rawUrl: string,
  resolveAddresses: AddressLookup = defaultLookup
): Promise<boolean> {
  if (!isAllowedWebhookUrl(rawUrl)) return false;

  const hostname = normalizeHostname(new URL(rawUrl).hostname);
  if (isIpLiteral(hostname)) return !isBlockedIp(hostname);

  try {
    const addresses = await resolveAddresses(hostname);
    if (addresses.length === 0) return false;
    return addresses.every((address) => !isBlockedIp(address));
  } catch {
    return false;
  }
}

export type WebhookDelivery =
  | { ok: true }
  | { ok: false; status: number; error: string };

/**
 * POST a form payload without following redirects automatically.
 * Each hop must still resolve to a public HTTP(S) address.
 */
export async function deliverFormWebhook(input: {
  url: string;
  body: string;
  lookup?: AddressLookup;
  fetchImpl?: typeof fetch;
}): Promise<WebhookDelivery> {
  const fetchImpl = input.fetchImpl ?? fetch;
  let currentUrl = input.url;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const allowed = await isAllowedWebhookDestination(currentUrl, input.lookup);
    if (!allowed) {
      return {
        ok: false,
        status: 400,
        error: "Form webhook URL is not allowed.",
      };
    }

    let response: Response;
    try {
      response = await fetchImpl(currentUrl, {
        method: "POST",
        redirect: "manual",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "OpenBoard-Form-Relay/1.0",
        },
        body: input.body,
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        return {
          ok: false,
          status: 504,
          error: "Form submission timed out. Please try again later.",
        };
      }
      return {
        ok: false,
        status: 502,
        error: "Unable to deliver form submission. Please try again later.",
      };
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || hop === MAX_REDIRECTS) {
        return {
          ok: false,
          status: 502,
          error: "Unable to deliver form submission. Please try again later.",
        };
      }
      try {
        currentUrl = new URL(location, currentUrl).toString();
      } catch {
        return {
          ok: false,
          status: 400,
          error: "Form webhook URL is not allowed.",
        };
      }
      continue;
    }

    if (!response.ok) {
      return {
        ok: false,
        status: 502,
        error: "Unable to deliver form submission. Please try again later.",
      };
    }

    return { ok: true };
  }

  return {
    ok: false,
    status: 502,
    error: "Unable to deliver form submission. Please try again later.",
  };
}
