(function () {
  var DEFAULT_LOCAL_API = 'http://localhost:3001';
  var debounceTimers = {};

  function getApiBase() {
    if (window.__ERP_DISABLE_BACKEND || window.DEMO_MODE) {
      return window.location && window.location.origin ? window.location.origin : '';
    }
    if (window.__ERP_API_BASE) return window.__ERP_API_BASE;
    var host = (window.location && window.location.hostname) ? window.location.hostname : '';
    if (!host || host === 'localhost' || host === '127.0.0.1' || host === '::1') {
      return DEFAULT_LOCAL_API;
    }
    return window.location.origin;
  }

  function buildUrl(path) {
    if (!path) return getApiBase();
    if (/^https?:\/\//i.test(path)) return path;
    return getApiBase().replace(/\/$/, '') + path;
  }

  function jsonFetch(path, options) {
    if (window.__ERP_DISABLE_BACKEND || window.DEMO_MODE) {
      var payload = { ok: true };
      if (path === '/api/schema') payload = { ok: true, tables: [], views: [], columns: [] };
      if (path === '/api/query/execute') payload = { ok: true, rows: [] };
      if (path.indexOf('/api/records/') === 0) payload = { ok: true, record: {} };
      return Promise.resolve(payload);
    }
    return fetch(buildUrl(path), options).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var msg = (data && data.error) ? data.error : ('Request failed with ' + res.status);
          throw new Error(msg);
        }
        return data;
      });
    });
  }

  function getSchema() {
    return jsonFetch('/api/schema');
  }

  function executeQuery(componentType, binding) {
    return jsonFetch('/api/query/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        componentType: componentType,
        binding: binding || {}
      })
    });
  }

  function executeQueryDebounced(key, componentType, binding, delay) {
    delay = typeof delay === 'number' ? delay : 250;
    return new Promise(function (resolve, reject) {
      if (debounceTimers[key]) {
        clearTimeout(debounceTimers[key].timer);
      }
      debounceTimers[key] = {
        timer: setTimeout(function () {
          executeQuery(componentType, binding).then(resolve).catch(reject);
        }, delay)
      };
    });
  }

  function submitRecord(table, payload) {
    return jsonFetch('/api/records/' + encodeURIComponent(table), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {})
    });
  }

  window.FeatureDataClient = {
    getApiBase: getApiBase,
    getSchema: getSchema,
    executeQuery: executeQuery,
    executeQueryDebounced: executeQueryDebounced,
    submitRecord: submitRecord
  };
})();
