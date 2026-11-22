import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ agentId: string }> }
) {
  const { agentId: rawAgentId } = await context.params;
  const agentId = rawAgentId.replace(/\.js$/, '');
  const reqHost = req.headers.get('host') || '';
  const isDevOrRunApp = reqHost.includes('run.app') || reqHost.includes('localhost');
  const origin = isDevOrRunApp
    ? 'https://cadence-teal-eight.vercel.app'
    : (req.nextUrl.origin || 'https://cadence-teal-eight.vercel.app');

  const script = String.raw`(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var agentId = ${JSON.stringify(agentId)};
  var baseOrigin = ${JSON.stringify(origin)};

  window.__cadenceWidgetsLoaded = window.__cadenceWidgetsLoaded || {};
  if (window.__cadenceWidgetsLoaded[agentId]) return;
  window.__cadenceWidgetsLoaded[agentId] = true;

  var hostName = window.location.hostname || '';
  var pageUrl = window.location.href || '';
  var configUrl = baseOrigin + '/api/widget/' + encodeURIComponent(agentId) + '/config?host=' + encodeURIComponent(hostName);

  fetch(configUrl, { method: 'GET', mode: 'cors' })
    .then(function (res) {
      if (!res.ok) return null;
      return res.json();
    })
    .then(function (data) {
      if (!data || !data.widget) return;
      renderFloatingWidget(data.widget, baseOrigin, hostName, pageUrl);
    })
    .catch(function () {});

  function sanitizeHexColor(raw) {
    if (typeof raw === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(raw.trim())) {
      return raw.trim();
    }
    return '#2563eb';
  }

  function renderFloatingWidget(cfg, baseOrigin, hostName, pageUrl) {
    var accent = sanitizeHexColor(cfg.accentColor);
    var isLeft = cfg.widgetPosition === 'bottom-left';
    var sideProp = isLeft ? 'left' : 'right';

    var isDark = cfg.widgetTheme === 'dark';
    var launcherText = (cfg.launcherLabel || 'Voice chat').trim();

    // Inject responsive CSS for centered launcher and fluid panel on mobile
    var styleId = 'cadence-widget-styles-' + agentId;
    if (!document.getElementById(styleId)) {
      var st = document.createElement('style');
      st.id = styleId;
      st.textContent = 
        '@media (max-width: 640px) {' +
        '  #cadence-widget-root-' + agentId + ' {' +
        '    left: 50% !important;' +
        '    right: auto !important;' +
        '    transform: translateX(-50%) !important;' +
        '    bottom: 20px !important;' +
        '  }' +
        '  #cadence-widget-panel-' + agentId + ' {' +
        '    left: 12px !important;' +
        '    right: 12px !important;' +
        '    width: calc(100vw - 24px) !important;' +
        '    bottom: 78px !important;' +
        '    max-height: calc(100vh - 96px) !important;' +
        '  }' +
        '}';
      document.head.appendChild(st);
    }

    var root = document.createElement('div');
    root.id = 'cadence-widget-root-' + agentId;
    root.style.position = 'fixed';
    root.style.bottom = '20px';
    root.style[sideProp] = '20px';
    root.style.zIndex = '2147483000';
    root.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    var panel = document.createElement('div');
    panel.id = 'cadence-widget-panel-' + agentId;
    panel.style.position = 'fixed';
    panel.style.bottom = '84px';
    panel.style[sideProp] = '20px';
    panel.style.width = '392px';
    panel.style.maxWidth = 'calc(100vw - 24px)';
    panel.style.height = '610px';
    panel.style.maxHeight = 'calc(100vh - 104px)';
    panel.style.borderRadius = '28px';
    panel.style.overflow = 'hidden';
    panel.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.06)';
    panel.style.background = isDark ? '#0a0a0a' : '#ffffff';
    panel.style.display = 'none';
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(12px) scale(0.97)';
    panel.style.transformOrigin = isLeft ? 'bottom left' : 'bottom right';
    panel.style.transition = 'opacity 180ms ease, transform 200ms cubic-bezier(0.22, 1, 0.36, 1)';
    panel.style.zIndex = '2147483001';

    var iframeEl = null;

    // Horizontal Pill Launcher Button (Matches user screenshot 1)
    var button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Open ' + launcherText);
    button.setAttribute('aria-expanded', 'false');
    button.style.background = isDark ? '#171717' : '#ffffff';
    button.style.color = isDark ? '#f5f5f5' : '#171717';
    button.style.border = isDark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(0, 0, 0, 0.08)';
    button.style.borderRadius = '9999px';
    button.style.padding = '5px 16px 5px 6px';
    button.style.display = 'inline-flex';
    button.style.alignItems = 'center';
    button.style.gap = '8px';
    button.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(0, 0, 0, 0.04)';
    button.style.cursor = 'pointer';
    button.style.transition = 'transform 180ms ease, box-shadow 180ms ease';
    button.style.outline = 'none';
    button.style.webkitTapHighlightColor = 'transparent';

    var miniOrbHtml = '<span style="display:inline-block;width:28px;height:28px;border-radius:9999px;background:radial-gradient(circle at 35% 25%, #d9f99d 0%, #a7f3d0 20%, #38bdf8 45%, #0284c7 78%, #0369a1 100%);box-shadow:inset -1px -2px 4px rgba(2, 44, 95, 0.45), inset 1px 1px 3px rgba(255, 255, 255, 0.65), 0 2px 8px rgba(14, 165, 233, 0.35);flex-shrink:0;"></span>';
    var textLabelHtml = '<span style="font-size:14px;font-weight:500;color:' + (isDark ? '#f5f5f5' : '#171717') + ';letter-spacing:-0.01em;white-space:nowrap;">' + launcherText + '</span>';
    var closeContentHtml = '<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:' + (isDark ? '#262626' : '#f3f4f6') + ';color:' + (isDark ? '#e5e5e5' : '#374151') + ';font-size:13px;font-weight:600;flex-shrink:0;">✕</span><span style="font-size:14px;font-weight:500;color:' + (isDark ? '#f5f5f5' : '#171717') + ';white-space:nowrap;">Close</span>';

    button.innerHTML = miniOrbHtml + textLabelHtml;
    var isOpen = false;

    function openPanel() {
      if (!iframeEl) {
        iframeEl = document.createElement('iframe');
        iframeEl.src = baseOrigin + '/embed/widget/' + encodeURIComponent(agentId) + '?host=' + encodeURIComponent(hostName) + '&page=' + encodeURIComponent(pageUrl);
        iframeEl.title = (cfg.name || 'Voice Chatbot') + ' - Powered by Cadence';
        iframeEl.setAttribute('allow', 'microphone; autoplay; clipboard-write');
        iframeEl.style.width = '100%';
        iframeEl.style.height = '100%';
        iframeEl.style.border = 'none';
        iframeEl.style.display = 'block';
        panel.appendChild(iframeEl);
      }
      isOpen = true;
      panel.style.display = 'block';
      button.innerHTML = closeContentHtml;
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', 'Close ' + (cfg.name || 'voice chatbot'));
      window.requestAnimationFrame(function () {
        panel.style.opacity = '1';
        panel.style.transform = 'translateY(0) scale(1)';
      });
    }

    function closePanel() {
      isOpen = false;
      button.innerHTML = miniOrbHtml + textLabelHtml;
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Open ' + (cfg.name || 'voice chatbot'));
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(12px) scale(0.97)';
      window.setTimeout(function () {
        if (!isOpen) panel.style.display = 'none';
      }, 190);
    }

    button.addEventListener('click', function () {
      if (isOpen) { closePanel(); } else { openPanel(); }
    });

    button.addEventListener('mouseenter', function () {
      button.style.transform = 'scale(1.03)';
      button.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(0, 0, 0, 0.05)';
    });

    button.addEventListener('mouseleave', function () {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(0, 0, 0, 0.04)';
    });

    window.addEventListener('message', function (ev) {
      if (ev && ev.origin === baseOrigin && ev.data && ev.data.type === 'cadence-widget-close' && ev.data.agentId === agentId) {
        closePanel();
      }
    });

    root.appendChild(panel);
    root.appendChild(button);
    document.body.appendChild(root);
  }
})();`;

  return new NextResponse(script, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=60',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
