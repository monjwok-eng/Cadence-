import { NextRequest, NextResponse } from 'next/server';

const WIDGET_SCRIPT = String.raw`(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  function findWidgetScripts() {
    var list = [];
    if (document.currentScript && document.currentScript.getAttribute('data-chatbot-id')) {
      list.push(document.currentScript);
      return list;
    }
    var scripts = document.querySelectorAll('script[data-chatbot-id]');
    for (var i = 0; i < scripts.length; i++) {
      if ((scripts[i].getAttribute('src') || '').indexOf('/widget.js') !== -1) {
        list.push(scripts[i]);
      }
    }
    return list;
  }

  function sanitizeHexColor(raw) {
    if (typeof raw === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(raw.trim())) {
      return raw.trim();
    }
    return '#2563eb';
  }

  function mountWidget(scriptEl) {
    var agentId = (scriptEl.getAttribute('data-chatbot-id') || '').trim();
    if (!agentId || !/^[a-zA-Z0-9_-]{1,128}$/.test(agentId)) return;

    window.__cadenceWidgetsLoaded = window.__cadenceWidgetsLoaded || {};
    if (window.__cadenceWidgetsLoaded[agentId]) return;
    window.__cadenceWidgetsLoaded[agentId] = true;

    var baseOrigin = '';
    var overrideOrigin = (scriptEl.getAttribute('data-cadence-origin') || '').trim();
    if (overrideOrigin) {
      baseOrigin = overrideOrigin.replace(/\/$/, '');
    } else {
      try {
        var parsedSrc = new URL(scriptEl.src, window.location.href);
        baseOrigin = parsedSrc.origin;
      } catch (e) {
        baseOrigin = window.location.origin;
      }
    }

    var hostName = window.location.hostname || '';
    var pageUrl = window.location.href || '';
    var configUrl =
      baseOrigin +
      '/api/widget/' +
      encodeURIComponent(agentId) +
      '/config?host=' +
      encodeURIComponent(hostName);

    fetch(configUrl, { method: 'GET', mode: 'cors' })
      .then(function (res) {
        if (!res.ok) return null;
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.widget) return;
        renderFloatingWidget(data.widget, baseOrigin, hostName, pageUrl);
      })
      .catch(function () {
        // Ignore network errors cleanly so host site never breaks
      });
  }

  function renderFloatingWidget(cfg, baseOrigin, hostName, pageUrl) {
    var agentId = cfg.id;
    var accent = sanitizeHexColor(cfg.accentColor);
    var isLeft = cfg.widgetPosition === 'bottom-left';
    var sideProp = isLeft ? 'left' : 'right';

    var root = document.createElement('div');
    root.id = 'cadence-widget-root-' + agentId;
    root.setAttribute('data-cadence-widget', agentId);
    root.style.position = 'fixed';
    root.style.bottom = '20px';
    root.style[sideProp] = '20px';
    root.style.zIndex = '2147483000';
    root.style.fontFamily =
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    var panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.bottom = '90px';
    panel.style[sideProp] = '20px';
    panel.style.width = '392px';
    panel.style.maxWidth = 'calc(100vw - 24px)';
    panel.style.height = '596px';
    panel.style.maxHeight = 'calc(100vh - 112px)';
    panel.style.borderRadius = '20px';
    panel.style.overflow = 'hidden';
    panel.style.boxShadow = '0 24px 64px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(15, 23, 42, 0.08)';
    panel.style.background = cfg.widgetTheme === 'dark' ? '#0a0a0a' : '#ffffff';
    panel.style.display = 'none';
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(12px) scale(0.97)';
    panel.style.transformOrigin = isLeft ? 'bottom left' : 'bottom right';
    panel.style.transition = 'opacity 180ms ease, transform 200ms cubic-bezier(0.22, 1, 0.36, 1)';
    panel.style.zIndex = '2147483001';

    var iframeEl = null;

    var btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.alignItems = 'center';
    btnRow.style.flexDirection = isLeft ? 'row-reverse' : 'row';
    btnRow.style.gap = '10px';

    var tooltip = document.createElement('div');
    tooltip.textContent = cfg.launcherLabel || 'Talk with us';
    tooltip.style.background = cfg.widgetTheme === 'dark' ? '#171717' : '#ffffff';
    tooltip.style.color = cfg.widgetTheme === 'dark' ? '#f5f5f5' : '#171717';
    tooltip.style.fontSize = '13px';
    tooltip.style.fontWeight = '600';
    tooltip.style.padding = '7px 12px';
    tooltip.style.borderRadius = '9999px';
    tooltip.style.boxShadow = '0 8px 24px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.opacity = '0';
    tooltip.style.transition = 'opacity 160ms ease';
    tooltip.style.whiteSpace = 'nowrap';

    var button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Open ' + (cfg.name || 'voice chatbot'));
    button.setAttribute('aria-expanded', 'false');
    button.style.width = '62px';
    button.style.height = '62px';
    button.style.borderRadius = '9999px';
    button.style.border = 'none';
    button.style.background = 'radial-gradient(circle at 35% 25%, #d9f99d 0%, #a7f3d0 20%, #38bdf8 45%, #0284c7 78%, #0369a1 100%)';
    button.style.color = '#ffffff';
    button.style.cursor = 'pointer';
    button.style.display = 'inline-flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.boxShadow = 'inset -3px -4px 8px rgba(2, 44, 95, 0.45), inset 3px 3px 6px rgba(255, 255, 255, 0.65), 0 12px 30px rgba(14, 165, 233, 0.42)';
    button.style.transition = 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease';
    button.style.padding = '0';
    button.style.outline = 'none';

    var orbIconSvg =
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    var closeIconSvg =
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="18" y1="6" x2="6" y2="18"></line>' +
      '<line x1="6" y1="6" x2="18" y2="18"></line>' +
      '</svg>';

    button.innerHTML = '';

    var isOpen = false;

    function openPanel() {
      if (!iframeEl) {
        iframeEl = document.createElement('iframe');
        iframeEl.src =
          baseOrigin +
          '/embed/widget/' +
          encodeURIComponent(agentId) +
          '?host=' +
          encodeURIComponent(hostName) +
          '&page=' +
          encodeURIComponent(pageUrl);
        iframeEl.title = (cfg.name || 'Voice Chatbot') + ' - Powered by Cadence';
        iframeEl.setAttribute('allow', 'microphone; autoplay; clipboard-write');
        iframeEl.style.width = '100%';
        iframeEl.style.height = '100%';
        iframeEl.style.border = 'none';
        iframeEl.style.display = 'block';
        panel.appendChild(iframeEl);
      }
      isOpen = true;
      tooltip.style.opacity = '0';
      panel.style.display = 'block';
      button.innerHTML = closeIconSvg;
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', 'Close ' + (cfg.name || 'voice chatbot'));
      window.requestAnimationFrame(function () {
        panel.style.opacity = '1';
        panel.style.transform = 'translateY(0) scale(1)';
      });
    }

    function closePanel() {
      isOpen = false;
      button.innerHTML = '';
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Open ' + (cfg.name || 'voice chatbot'));
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(12px) scale(0.97)';
      window.setTimeout(function () {
        if (!isOpen) panel.style.display = 'none';
      }, 190);
    }

    button.addEventListener('click', function () {
      if (isOpen) {
        closePanel();
      } else {
        openPanel();
      }
    });

    button.addEventListener('mouseenter', function () {
      button.style.transform = 'scale(1.06)';
      if (!isOpen && window.innerWidth >= 640) {
        tooltip.style.opacity = '1';
      }
    });

    button.addEventListener('mouseleave', function () {
      button.style.transform = 'scale(1)';
      tooltip.style.opacity = '0';
    });

    window.addEventListener('message', function (ev) {
      if (
        ev &&
        ev.origin === baseOrigin &&
        ev.data &&
        ev.data.type === 'cadence-widget-close' &&
        ev.data.agentId === agentId
      ) {
        closePanel();
      }
    });

    btnRow.appendChild(tooltip);
    btnRow.appendChild(button);
    root.appendChild(panel);
    root.appendChild(btnRow);
    document.body.appendChild(root);
  }

  function init() {
    var scripts = findWidgetScripts();
    for (var i = 0; i < scripts.length; i++) {
      mountWidget(scripts[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();`;

export async function GET(_req: NextRequest) {
  return new NextResponse(WIDGET_SCRIPT, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=60',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
