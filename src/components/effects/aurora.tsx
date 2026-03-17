"use client";

export function Aurora() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 animate-aurora-1 opacity-60">
        <div
          className="absolute w-[800px] h-[600px] top-[-200px] left-1/2 -translate-x-1/2 rounded-full blur-[120px]"
          style={{
            background:
              "radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.03) 40%, transparent 70%)",
          }}
        />
      </div>
      <div className="absolute inset-0 animate-aurora-2 opacity-40">
        <div
          className="absolute w-[600px] h-[400px] top-[-100px] right-[-100px] rounded-full blur-[100px]"
          style={{
            background:
              "radial-gradient(ellipse, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.02) 40%, transparent 70%)",
          }}
        />
      </div>
      <div className="absolute inset-0 animate-aurora-3 opacity-30">
        <div
          className="absolute w-[500px] h-[500px] bottom-[-200px] left-[10%] rounded-full blur-[100px]"
          style={{
            background:
              "radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 60%)",
          }}
        />
      </div>
    </div>
  );
}
