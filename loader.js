"use strict";
var SessionReplayLoader = (() => {
  // ../shared/dist/privacy.js
  var DEFAULT_MASKED_SELECTORS = [
    "input",
    "textarea",
    "select",
    '[contenteditable="true"]',
    "[data-private]",
    "[data-replay-mask]",
    ".rr-mask",
    ".resume-preview",
    ".resume-editor",
    ".cv-preview",
    "[data-resume-preview]",
    "[data-cv-preview]",
    "[data-editor]"
  ];
  var DEFAULT_IGNORED_SELECTORS = [
    "script",
    "noscript",
    "style",
    "[data-replay-ignore]",
    ".rr-ignore"
  ];
  function uniqueStrings(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  // ../shared/dist/site-config.js
  function normalizeSiteConfig(input) {
    return {
      siteId: input.siteId,
      allowedOrigins: input.allowedOrigins ?? [],
      allowedPathPatterns: input.allowedPathPatterns?.length ? input.allowedPathPatterns : ["/**"],
      blockedPathPatterns: input.blockedPathPatterns ?? [],
      maskedSelectors: uniqueStrings([...DEFAULT_MASKED_SELECTORS, ...input.maskedSelectors ?? []]),
      ignoredSelectors: uniqueStrings([...DEFAULT_IGNORED_SELECTORS, ...input.ignoredSelectors ?? []]),
      samplingRate: clamp(input.samplingRate ?? 1, 0, 1),
      recordingEnabled: input.recordingEnabled ?? true,
      retentionDays: input.retentionDays && input.retentionDays > 0 ? input.retentionDays : 30
    };
  }
  function isOriginAllowed(origin, config) {
    if (!config.allowedOrigins.length)
      return false;
    let parsed;
    try {
      parsed = new URL(origin);
    } catch {
      return false;
    }
    return config.allowedOrigins.some((allowed) => {
      if (allowed === "*")
        return true;
      try {
        const candidate = new URL(allowed.replace("*.", "wildcard."));
        if (allowed.includes("*.")) {
          const baseHost = candidate.hostname.replace(/^wildcard\./, "");
          const baseLabels = baseHost.split(".");
          const hostLabels = parsed.hostname.split(".");
          return parsed.protocol === candidate.protocol && parsed.port === candidate.port && parsed.hostname.endsWith(`.${baseHost}`) && hostLabels.length === baseLabels.length + 1;
        }
        const exact = new URL(allowed);
        return parsed.origin === exact.origin;
      } catch {
        return false;
      }
    });
  }
  function isPathAllowed(path, config) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    if (config.blockedPathPatterns.some((pattern) => patternMatchesPath(pattern, normalizedPath)))
      return false;
    if (!config.allowedPathPatterns.length)
      return true;
    return config.allowedPathPatterns.some((pattern) => patternMatchesPath(pattern, normalizedPath));
  }
  function patternMatchesPath(pattern, path) {
    if (pattern === "/**" || pattern === "*")
      return true;
    return new RegExp(`^${globToRegex(pattern)}$`).test(path);
  }
  function globToRegex(pattern) {
    let output = "";
    for (let index = 0; index < pattern.length; index += 1) {
      const char = pattern[index];
      const next = pattern[index + 1];
      if (char === "*" && next === "*") {
        output += ".*";
        index += 1;
        continue;
      }
      if (char === "*") {
        output += "[^/]*";
        continue;
      }
      output += char?.replace(/[.+?^${}()|[\]\\]/g, "\\$&") ?? "";
    }
    return output;
  }
  function clamp(value, min, max) {
    if (Number.isNaN(value))
      return min;
    return Math.min(max, Math.max(min, value));
  }

  // src/globals.ts
  function installStubApi() {
    const existing = window.SessionReplay;
    if (existing) return existing;
    const queue = [];
    const api = {
      grantConsent: () => queue.push({ type: "grantConsent" }),
      denyConsent: () => queue.push({ type: "denyConsent" }),
      stop: () => queue.push({ type: "stop" }),
      setUser: (userId) => queue.push({ type: "setUser", userId }),
      setTags: (tags) => queue.push({ type: "setTags", tags }),
      captureNetwork: (payload) => queue.push({ type: "captureNetwork", payload }),
      _queue: queue
    };
    window.SessionReplay = api;
    return api;
  }

  // src/loader.ts
  installStubApi();
  void startLoader();
  async function startLoader() {
    const script = findLoaderScript();
    const siteId = script?.dataset.siteId;
    if (!script || !siteId) return;
    const ingestBaseUrl = script.dataset.ingestBaseUrl ?? new URL(script.src, window.location.href).origin;
    const configUrl = new URL(`/v1/sites/${encodeURIComponent(siteId)}/config`, ingestBaseUrl);
    let remoteConfig;
    try {
      const response = await fetch(configUrl, {
        credentials: "omit",
        cache: "no-store"
      });
      if (!response.ok) return;
      remoteConfig = await response.json();
    } catch {
      return;
    }
    const config = normalizeSiteConfig({
      ...remoteConfig,
      siteId
    });
    config.ingestBaseUrl = remoteConfig.ingestBaseUrl ?? ingestBaseUrl;
    config.recorderScriptUrl = script.dataset.recorderScriptUrl ?? remoteConfig.recorderScriptUrl ?? new URL("/recorder.js", script.src).toString();
    if (!config.recordingEnabled) return;
    if (!isOriginAllowed(window.location.origin, config)) return;
    if (!isPathAllowed(window.location.pathname, config)) return;
    if (Math.random() > config.samplingRate) return;
    window.__SESSION_REPLAY_CONFIG__ = config;
    window.__SESSION_REPLAY_CONTEXT__ = window.__SESSION_REPLAY_CONTEXT__ ?? {
      userId: null,
      tags: {},
      consentDenied: false
    };
    injectRecorder(config.recorderScriptUrl);
  }
  function findLoaderScript() {
    const current = document.currentScript;
    if (current instanceof HTMLScriptElement && current.dataset.siteId) return current;
    return Array.from(document.scripts).find((script) => {
      const src = script.getAttribute("src") ?? "";
      return Boolean(script.dataset.siteId && src.includes("loader.js"));
    }) ?? null;
  }
  function injectRecorder(src) {
    const script = document.createElement("script");
    script.async = true;
    script.src = src;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }
})();
//# sourceMappingURL=loader.js.map
