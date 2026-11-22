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
    button.style.width = '58px';
    button.style.height = '58px';
    button.style.borderRadius = '9999px';
    button.style.border = 'none';
    button.style.background = accent;
    button.style.color = '#ffffff';
    button.style.cursor = 'pointer';
    button.style.display = 'inline-flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.24), 0 4px 10px rgba(0, 0, 0, 0.14)';
    button.style.transition = 'transform 160ms ease, box-shadow 160ms ease';
    button.style.padding = '0';
    button.style.outline = 'none';

    var botIconSvg =
      '<svg width="30" height="30" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<circle cx="13.5" cy="7.5" r="2.2" fill="currentColor"/>' +
      '<circle cx="22.5" cy="7.5" r="2.2" fill="currentColor"/>' +
      '<rect x="12.6" y="8.5" width="1.8" height="3.2" rx="0.9" fill="currentColor"/>' +
      '<rect x="21.6" y="8.5" width="1.8" height="3.2" rx="0.9" fill="currentColor"/>' +
      '<rect x="5" y="16" width="2.8" height="6.2" rx="1.4" fill="currentColor"/>' +
      '<rect x="28.2" y="16" width="2.8" height="6.2" rx="1.4" fill="currentColor"/>' +
      '<path d="M9 15C9 12.2386 11.2386 10 14 10H22C24.7614 10 27 12.2386 27 15V22C27 24.7614 24.7614 27 22 27H16L11.5 30.8C10.9 31.3 10 30.88 10 30.1V26.6C9.37 25.7 9 24.6 9 23.4V15Z" fill="currentColor"/>' +
      '<path d="M13 17.3C13.4 16.3 14.3 15.8 15.1 15.8C15.9 15.8 16.8 16.3 17.2 17.3" stroke="' + accent + '" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M18.8 17.3C19.2 16.3 20.1 15.8 20.9 15.8C21.7 15.8 22.6 16.3 23 17.3" stroke="' + accent + '" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M13.5 21.4C15.1 23 20.9 23 22.5 21.4" stroke="' + accent + '" stroke-width="2" stroke-linecap="round"/>' +
      '</svg>';

    var closeIconSvg =
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="18" y1="6" x2="6" y2="18"></line>' +
      '<line x1="6" y1="6" x2="18" y2="18"></line>' +
      '</svg>';

    button.innerHTML = botIconSvg;

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
      button.innerHTML = botIconSvg;
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
