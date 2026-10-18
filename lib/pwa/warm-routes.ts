export const APP_ROUTES = ["/cows", "/milking", "/dispatch", "/dashboard"];

interface WarmRoutesOptions {
  isOnline: boolean;
  hasController: boolean;
  fetch: (input: string, init?: RequestInit) => Promise<unknown>;
}

export async function warmRoutes({
  isOnline,
  hasController,
  fetch: fetchRoute,
}: WarmRoutesOptions): Promise<void> {
  if (!isOnline || !hasController) {
    return;
  }

  await Promise.allSettled(
    APP_ROUTES.map((route) =>
      fetchRoute(route, { credentials: "same-origin" }),
    ),
  );
}

function waitForController(timeoutMs: number): Promise<boolean> {
  if (navigator.serviceWorker.controller) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleChange,
      );
      resolve(Boolean(navigator.serviceWorker.controller));
    }, timeoutMs);

    function handleChange() {
      window.clearTimeout(timer);
      resolve(true);
    }

    navigator.serviceWorker.addEventListener("controllerchange", handleChange, {
      once: true,
    });
  });
}

export async function warmAppRoutes(): Promise<void> {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return;
  }

  if (!("serviceWorker" in navigator) || !navigator.onLine) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    if (!registration.active) {
      return;
    }

    const hasController = await waitForController(3000);

    await warmRoutes({
      isOnline: navigator.onLine,
      hasController,
      fetch: (input, init) => fetch(input, init),
    });
  } catch {
    return;
  }
}
