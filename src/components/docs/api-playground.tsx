"use client";

import { useState } from "react";

interface Field {
  name: string;
  type: "string" | "number" | "select";
  placeholder?: string;
  defaultValue?: string;
  options?: string[];
  required?: boolean;
}

interface ApiPlaygroundProps {
  method: "GET" | "POST";
  endpoint: string;
  fields?: Field[];
  authRequired?: boolean;
  pathParam?: string;
  queryParams?: Field[];
}

export function ApiPlayground({
  method,
  endpoint,
  fields = [],
  authRequired = false,
  pathParam,
  queryParams = [],
}: ApiPlaygroundProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of [...fields, ...queryParams]) {
      init[f.name] = f.defaultValue || "";
    }
    if (pathParam) init[pathParam] = "";
    if (authRequired) init["__apiKey"] = "";
    return init;
  });
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setResponse(null);
    setStatus(null);

    try {
      let url = `https://buff.finance${endpoint}`;
      if (pathParam && values[pathParam]) {
        url = url.replace(`:${pathParam}`, values[pathParam]);
      }

      if (queryParams.length > 0) {
        const params = new URLSearchParams();
        for (const q of queryParams) {
          if (values[q.name]) params.set(q.name, values[q.name]);
        }
        const qs = params.toString();
        if (qs) url += `?${qs}`;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (authRequired && values["__apiKey"]) {
        headers["x-api-key"] = values["__apiKey"];
      }

      const body: Record<string, unknown> = {};
      for (const f of fields) {
        if (values[f.name]) {
          body[f.name] =
            f.type === "number" ? parseFloat(values[f.name]) : values[f.name];
        }
      }

      const res = await fetch(url, {
        method,
        headers,
        ...(method === "POST" ? { body: JSON.stringify(body) } : {}),
      });

      setStatus(res.status);
      const json = await res.json();
      setResponse(JSON.stringify(json, null, 2));
    } catch (err) {
      setResponse(
        JSON.stringify(
          { error: err instanceof Error ? err.message : "Request failed" },
          null,
          2
        )
      );
    }
    setLoading(false);
  };

  const update = (name: string, value: string) =>
    setValues((v) => ({ ...v, [name]: value }));

  return (
    <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden my-4">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 bg-secondary/20">
        <span
          className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            method === "GET"
              ? "bg-sage/10 text-sage"
              : "bg-gold/10 text-gold"
          }`}
        >
          {method}
        </span>
        <code className="text-sm font-mono text-foreground/80">{endpoint}</code>
      </div>

      {/* Fields */}
      <div className="p-4 space-y-3">
        {authRequired && (
          <div>
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-1">
              API Key
            </label>
            <input
              type="text"
              value={values["__apiKey"]}
              onChange={(e) => update("__apiKey", e.target.value)}
              placeholder="x-api-key header"
              className="w-full text-sm font-mono bg-secondary/40 border border-border/30 rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-gold/30"
            />
          </div>
        )}

        {pathParam && (
          <div>
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-1">
              {pathParam} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={values[pathParam]}
              onChange={(e) => update(pathParam, e.target.value)}
              placeholder={`Enter ${pathParam}`}
              className="w-full text-sm font-mono bg-secondary/40 border border-border/30 rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-gold/30"
            />
          </div>
        )}

        {[...fields, ...queryParams].map((f) => (
          <div key={f.name}>
            <label className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-1">
              {f.name} {f.required && <span className="text-red-400">*</span>}
            </label>
            {f.type === "select" ? (
              <select
                value={values[f.name]}
                onChange={(e) => update(f.name, e.target.value)}
                className="w-full text-sm font-mono bg-secondary/40 border border-border/30 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-gold/30"
              >
                {f.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={f.type === "number" ? "number" : "text"}
                step={f.type === "number" ? "any" : undefined}
                value={values[f.name]}
                onChange={(e) => update(f.name, e.target.value)}
                placeholder={f.placeholder || f.name}
                className="w-full text-sm font-mono bg-secondary/40 border border-border/30 rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-gold/30"
              />
            )}
          </div>
        ))}

        <button
          onClick={handleRun}
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-bold bg-gold/10 border border-gold/20 text-gold hover:bg-gold/15 transition-colors disabled:opacity-50"
        >
          {loading ? "Running..." : "Try it →"}
        </button>
      </div>

      {/* Response */}
      {response && (
        <div className="border-t border-border/30">
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary/20">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Response</span>
            {status && (
              <span
                className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                  status < 300
                    ? "bg-sage/10 text-sage"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {status}
              </span>
            )}
          </div>
          <pre className="p-4 text-[13px] font-mono text-foreground/80 overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
}
