"""
HTML and structured error page generator for FastAPI backend.
Renders responsive, dark-themed terminal error pages when requested by browser clients,
and detailed JSON error payloads when requested by API consumers.
"""

def render_error_html(status_code: int, detail: str, path: str, method: str = "GET") -> str:
    """
    Renders a custom HTML error page for the backend.
    """
    if status_code == 404:
        badge_label = "HTTP 404 · ROUTE NOT FOUND"
        title = "Endpoint Not Found"
        headline = "Resource Not Found on Backend"
        description = (
            "The requested API route does not exist in the routing table. "
            "Please check the URL path, HTTP method, or refer to the interactive API documentation."
        )
        badge_color = "#f87171"
        badge_bg = "rgba(248, 113, 113, 0.1)"
        badge_border = "rgba(248, 113, 113, 0.25)"
    elif status_code == 429:
        badge_label = "HTTP 429 · QUOTA EXCEEDED"
        title = "Rate Limit Reached"
        headline = "Free-Tier Limit Exceeded"
        description = (
            "You have reached the free-tier quota for today. "
            "Requests will reset automatically at midnight UTC, or use the dev reset endpoint."
        )
        badge_color = "#fbbf24"
        badge_bg = "rgba(251, 191, 36, 0.1)"
        badge_border = "rgba(251, 191, 36, 0.25)"
    elif status_code >= 500:
        badge_label = f"HTTP {status_code} · SERVER ERROR"
        title = "Backend Internal Error"
        headline = "Unexpected Server Exception"
        description = (
            "The backend engine encountered an unhandled exception while executing your request. "
            "Our automated error-isolation guard has logged this event."
        )
        badge_color = "#f87171"
        badge_bg = "rgba(248, 113, 113, 0.1)"
        badge_border = "rgba(248, 113, 113, 0.25)"
    else:
        badge_label = f"HTTP {status_code} · ERROR"
        title = f"Error {status_code}"
        headline = f"Backend Returned Status {status_code}"
        description = "An error occurred while processing this backend request."
        badge_color = "#8facff"
        badge_bg = "rgba(143, 172, 255, 0.1)"
        badge_border = "rgba(143, 172, 255, 0.25)"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{status_code} {title} — Explain My Code API</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {{
      --bg: #06060c;
      --card-bg: rgba(13, 15, 24, 0.88);
      --border: rgba(255, 255, 255, 0.08);
      --text-primary: #e8eaf0;
      --text-secondary: #8b8fa4;
      --text-muted: #555870;
      --accent: #6b8aff;
      --green: #34d399;
      --badge-color: {badge_color};
      --badge-bg: {badge_bg};
      --badge-border: {badge_border};
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background: var(--bg);
      color: var(--text-primary);
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow-x: hidden;
      position: relative;
    }}
    body::before {{
      content: "";
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 70% 50% at 50% 20%, rgba(248, 113, 113, 0.07) 0%, transparent 70%),
        radial-gradient(ellipse 60% 40% at 50% 80%, rgba(107, 138, 255, 0.06) 0%, transparent 70%);
      pointer-events: none;
    }}
    .container {{
      width: 100%;
      max-width: 620px;
      position: relative;
      z-index: 10;
    }}
    .card {{
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 18px;
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(248, 113, 113, 0.08);
      overflow: hidden;
    }}
    .card-header {{
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid var(--border);
      padding: 12px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}
    .dots {{ display: flex; gap: 7px; }}
    .dot {{ width: 11px; height: 11px; border-radius: 50%; }}
    .dot-red {{ background: #ff5f57; }}
    .dot-yellow {{ background: #febc2e; }}
    .dot-green {{ background: #28c840; }}
    .terminal-tag {{
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--text-muted);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }}
    .card-body {{
      padding: 34px 28px 28px 28px;
    }}
    .status-badge {{
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 4px 12px;
      border-radius: 99px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      background: var(--badge-bg);
      color: var(--badge-color);
      border: 1px solid var(--badge-border);
      margin-bottom: 18px;
    }}
    .pulse-dot {{
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--badge-color);
      animation: pulse 1.6s infinite;
    }}
    @keyframes pulse {{
      0%, 100% {{ opacity: 1; transform: scale(1); }}
      50% {{ opacity: 0.35; transform: scale(1.3); }}
    }}
    h1 {{
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #ffffff;
      margin-bottom: 10px;
    }}
    p.desc {{
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 22px;
    }}
    .cli-box {{
      background: #080a12;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 14px 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12.5px;
      margin-bottom: 24px;
      line-height: 1.65;
    }}
    .cli-line-1 {{ color: var(--text-muted); }}
    .cli-method {{ color: #8facff; font-weight: 600; }}
    .cli-path {{ color: #ffd6fa; }}
    .cli-status {{ color: var(--badge-color); font-weight: 600; }}
    .cli-detail {{ color: var(--text-secondary); }}
    .destinations-title {{
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      margin-bottom: 12px;
    }}
    .btn-group {{
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }}
    .btn {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 11px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }}
    .btn-white {{
      background: #ffffff;
      color: #09090b;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }}
    .btn-white:hover {{
      background: #f4f4f5;
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(255, 255, 255, 0.25);
    }}
    .btn-subtle {{
      background: rgba(255, 255, 255, 0.04);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }}
    .btn-subtle:hover {{
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.18);
      transform: translateY(-1px);
    }}
    .footer {{
      margin-top: 22px;
      text-align: center;
      font-size: 12px;
      color: var(--text-muted);
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="card-header">
        <div class="dots">
          <div class="dot dot-red"></div>
          <div class="dot dot-yellow"></div>
          <div class="dot dot-green"></div>
        </div>
        <div class="terminal-tag">FASTAPI BACKEND // ERROR {status_code}</div>
        <div style="width: 45px;"></div>
      </div>
      <div class="card-body">
        <div class="status-badge">
          <span class="pulse-dot"></span>
          <span>{badge_label}</span>
        </div>

        <h1>{headline}</h1>
        <p class="desc">{description}</p>

        <div class="cli-box">
          <div class="cli-line-1">&gt; <span class="cli-method">{method}</span> <span class="cli-path">{path}</span></div>
          <div style="margin-top: 6px;"><span class="cli-status">&lt; HTTP/1.1 {status_code} {title}</span></div>
          <div><span class="cli-detail">&lt; detail: "{detail}"</span></div>
        </div>

        <div class="destinations-title">Available Endpoints &amp; Navigation</div>
        <div class="btn-group">
          <a href="http://localhost:3000" class="btn btn-white">
            <span>← Return to Web App</span>
          </a>
          <a href="/docs" class="btn btn-subtle">
            <span>OpenAPI Docs ↗</span>
          </a>
          <a href="/health" class="btn btn-subtle">
            <span>Health Check ↗</span>
          </a>
          <a href="/v1/usage" class="btn btn-subtle">
            <span>Usage Stats ↗</span>
          </a>
        </div>
      </div>
    </div>
    <div class="footer">
      Explain My Code Backend Engine · FastAPI v2.0
    </div>
  </div>
</body>
</html>
"""
