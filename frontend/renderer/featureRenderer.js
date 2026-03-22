(function () {
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function asArray(value, fallback) {
    return Array.isArray(value) ? value : (fallback || []);
  }

  function toNumber(value, fallback) {
    var n = Number(value);
    return Number.isFinite(n) ? n : (fallback || 0);
  }

  function hasDataBinding(widget) {
    return !!(widget && widget.config && widget.config.dataBinding && widget.config.dataBinding.sourceType);
  }

  function loadingState(label) {
    return '<div class="panel"><div class="builder-data-state">' + esc(label || 'Loading live data...') + '</div></div>';
  }

  function disconnectedState(message) {
    return '<div class="panel"><div class="builder-data-state builder-data-state-warning">' + esc(message || 'Connect this component to a data source.') + '</div></div>';
  }

  function renderKpi(widget) {
    var c = widget.config || {};
    return '<div class="kpi-card">'
      + '<div class="kpi-label">' + esc(c.title || c.label || 'Metric') + '</div>'
      + '<div class="kpi-value">' + esc(c.value == null ? '0' : c.value) + '</div>'
      + '<span class="kpi-sub kpi-' + (c.trend === 'down' ? 'down' : c.trend === 'up' ? 'up' : 'neutral') + '">' + esc(c.subtitle || '') + '</span>'
      + '</div>';
  }

  function renderSummary(widget) {
    var c = widget.config || {};
    return '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:10px">' + esc(c.title || 'Summary') + '</h3><p style="color:var(--text2);font-size:13px">' + esc(c.content || c.subtitle || '') + '</p></div>';
  }

  function renderCounter(widget) {
    var c = widget.config || {};
    return '<div class="panel"><div style="font-size:12px;color:var(--text3);margin-bottom:6px">' + esc(c.label || 'Counter') + '</div><div style="font-size:28px;font-weight:700">'
      + esc(c.prefix || '') + esc(c.value == null ? 0 : c.value) + esc(c.suffix || '') + '</div></div>';
  }

  function renderTable(widget) {
    var c = widget.config || {};
    var columns = asArray(c.columns, []);
    var rows = asArray(c.rows, []);
    var searchId = 'tbl-search-' + widget.id;

    var head = columns.map(function (col, idx) {
      var sortable = c.sortable ? ' data-sort-index="' + idx + '" class="builder-table-sort"' : '';
      return '<th' + sortable + '>' + esc(col) + '</th>';
    }).join('');

    var body = rows.map(function (row) {
      return '<tr>' + row.map(function (cell) { return '<td>' + esc(cell) + '</td>'; }).join('') + '</tr>';
    }).join('');

    return '<div class="panel">'
      + '<div style="display:flex;gap:10px;align-items:center;justify-content:space-between;margin-bottom:10px">'
      + '<h3 style="font-family:var(--font-head)">' + esc(c.title || 'Data Table') + '</h3>'
      + (c.filterable ? '<input id="' + searchId + '" class="form-input" placeholder="Filter rows" style="max-width:180px;height:34px" />' : '')
      + '</div>'
      + '<div class="table-wrap"><table class="table"><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>'
      + '</div>';
  }

  function renderBar(widget) {
    var c = widget.config || {};
    var labels = asArray(c.labels, []);
    var series = asArray(c.series, []);
    var max = Math.max.apply(null, series.concat([1]));
    var bars = labels.map(function (label, idx) {
      var val = toNumber(series[idx], 0);
      var pct = Math.round((val / max) * 100);
      return '<div class="bar-row"><span class="bar-label">' + esc(label) + '</span><div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + esc(c.color || '#6d8bff') + '">' + val + '</div></div></div>';
    }).join('');
    return '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:12px">' + esc(c.title || 'Bar Chart') + '</h3><div class="bar-chart-wrap">' + bars + '</div></div>';
  }

  function renderLine(widget) {
    var c = widget.config || {};
    var series = asArray(c.series, []);
    var max = Math.max.apply(null, series.concat([1]));
    var min = Math.min.apply(null, series.concat([0]));
    var points = series.map(function (v, idx) {
      var x = series.length === 1 ? 0 : (idx / (series.length - 1)) * 100;
      var norm = (toNumber(v, 0) - min) / (max - min || 1);
      var y = 100 - norm * 100;
      return x.toFixed(2) + ',' + y.toFixed(2);
    }).join(' ');
    return '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:12px">' + esc(c.title || 'Line Chart') + '</h3>'
      + '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:160px;background:rgba(109,139,255,0.06);border-radius:10px">'
      + '<polyline fill="none" stroke="' + esc(c.color || '#34d399') + '" stroke-width="2" points="' + points + '" />'
      + '</svg></div>';
  }

  function renderArea(widget) {
    var c = widget.config || {};
    var series = asArray(c.series, []);
    var max = Math.max.apply(null, series.concat([1]));
    var min = Math.min.apply(null, series.concat([0]));
    var points = series.map(function (v, idx) {
      var x = series.length === 1 ? 0 : (idx / (series.length - 1)) * 100;
      var norm = (toNumber(v, 0) - min) / (max - min || 1);
      var y = 100 - norm * 100;
      return x.toFixed(2) + ',' + y.toFixed(2);
    });
    var poly = points.join(' ');
    var area = '0,100 ' + poly + ' 100,100';
    return '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:12px">' + esc(c.title || 'Area Chart') + '</h3>'
      + '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:160px;background:rgba(14,165,233,0.06);border-radius:10px">'
      + '<polygon fill="' + esc(c.color || '#0ea5e9') + '33" points="' + area + '"></polygon>'
      + '<polyline fill="none" stroke="' + esc(c.color || '#0ea5e9') + '" stroke-width="2" points="' + poly + '"></polyline>'
      + '</svg></div>';
  }

  function renderPie(widget) {
    var c = widget.config || {};
    var segments = asArray(c.segments, []);
    var total = segments.reduce(function (sum, item) { return sum + Math.max(0, toNumber(item.value, 0)); }, 0) || 1;
    var angle = 0;
    var slices = segments.map(function (item) {
      var portion = Math.max(0, toNumber(item.value, 0)) / total;
      var next = angle + (portion * 360);
      var color = item.color || '#6d8bff';
      var part = color + ' ' + angle.toFixed(1) + 'deg ' + next.toFixed(1) + 'deg';
      angle = next;
      return part;
    }).join(',');

    var legend = segments.map(function (item) {
      return '<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text2)"><span style="display:inline-block;width:10px;height:10px;border-radius:999px;background:' + esc(item.color || '#6d8bff') + '"></span>' + esc(item.label || 'Segment') + ' (' + esc(item.value || 0) + ')</div>';
    }).join('');

    return '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:12px">' + esc(c.title || 'Pie Chart') + '</h3><div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">'
      + '<div style="width:140px;height:140px;border-radius:999px;background:conic-gradient(' + slices + ')"></div>'
      + '<div style="display:grid;gap:6px">' + legend + '</div>'
      + '</div></div>';
  }

  function renderInput(widget) {
    var c = widget.config || {};
    return '<div class="panel"><label class="form-label">' + esc(c.label || 'Input') + '</label><input class="form-input" data-form-field="' + esc(widget.id) + '" placeholder="' + esc(c.placeholder || '') + '" ' + (c.required ? 'required' : '') + ' /></div>';
  }

  function renderSelect(widget) {
    var c = widget.config || {};
    var options = asArray(c.options, []).map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('');
    return '<div class="panel"><label class="form-label">' + esc(c.label || 'Select') + '</label><select class="form-select" data-form-field="' + esc(widget.id) + '">' + options + '</select></div>';
  }

  function renderCheckbox(widget) {
    var c = widget.config || {};
    return '<div class="panel"><label style="display:flex;gap:8px;align-items:center;font-size:13px"><input type="checkbox" data-form-field="' + esc(widget.id) + '" ' + (c.checked ? 'checked' : '') + '> ' + esc(c.label || 'Checkbox') + '</label></div>';
  }

  function renderDate(widget) {
    var c = widget.config || {};
    return '<div class="panel"><label class="form-label">' + esc(c.label || 'Date') + '</label><input class="form-input" data-form-field="' + esc(widget.id) + '" type="date" ' + (c.required ? 'required' : '') + ' /></div>';
  }

  function renderTextarea(widget) {
    var c = widget.config || {};
    return '<div class="panel"><label class="form-label">' + esc(c.label || 'Notes') + '</label><textarea class="form-textarea" data-form-field="' + esc(widget.id) + '" rows="3" placeholder="' + esc(c.placeholder || '') + '"></textarea></div>';
  }

  function renderFallback(widget) {
    return '<div class="panel"><div style="font-size:12px;color:var(--text3)">Unsupported widget: ' + esc(widget.type) + '</div></div>';
  }

  function renderWidget(widget) {
    switch (widget.type) {
      case 'kpi_card': return renderKpi(widget);
      case 'summary_card': return renderSummary(widget);
      case 'counter': return renderCounter(widget);
      case 'table': return renderTable(widget);
      case 'bar_chart': return renderBar(widget);
      case 'line_chart': return renderLine(widget);
      case 'pie_chart': return renderPie(widget);
      case 'area_chart': return renderArea(widget);
      case 'form_input': return renderInput(widget);
      case 'form_select': return renderSelect(widget);
      case 'form_checkbox': return renderCheckbox(widget);
      case 'form_date': return renderDate(widget);
      case 'form_textarea': return renderTextarea(widget);
      default: return renderFallback(widget);
    }
  }

  function applyQueryData(widget, result) {
    var next = JSON.parse(JSON.stringify(widget));
    var data = result && result.data ? result.data : {};
    next.config = next.config || {};

    if (widget.type === 'bar_chart' || widget.type === 'line_chart' || widget.type === 'area_chart') {
      next.config.labels = asArray(data.labels, []);
      next.config.series = asArray(data.series, []);
    } else if (widget.type === 'pie_chart') {
      next.config.segments = asArray(data.segments, []);
    } else if (widget.type === 'kpi_card' || widget.type === 'counter' || widget.type === 'summary_card') {
      next.config.value = data.value;
      next.config.subtitle = data.subtitle || next.config.subtitle;
      if (widget.type === 'summary_card') next.config.content = 'Live value: ' + data.value;
    } else if (widget.type === 'table') {
      next.config.columns = asArray(data.columns, []);
      next.config.rows = asArray(data.rows, []);
    } else if (widget.type === 'form_select') {
      next.config.options = asArray(data.options, []);
    }
    return next;
  }

  function bindFormSubmit(root, feature) {
    var formWidgets = feature.widgets.filter(function (w) {
      return ['form_input', 'form_select', 'form_checkbox', 'form_date', 'form_textarea'].indexOf(w.type) > -1;
    });
    if (!formWidgets.length || !window.FeatureDataClient) return;

    var submitTable = '';
    formWidgets.forEach(function (widget) {
      var binding = widget.config && widget.config.dataBinding;
      if (binding && binding.submitTable && !submitTable) submitTable = binding.submitTable;
    });
    if (!submitTable) return;

    var submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-primary';
    submitBtn.style.marginTop = '8px';
    submitBtn.textContent = 'Submit Form Data';
    submitBtn.addEventListener('click', function () {
      var payload = {};
      formWidgets.forEach(function (widget) {
        var binding = widget.config && widget.config.dataBinding;
        if (!binding || !binding.field) return;
        var input = root.querySelector('[data-form-field="' + widget.id + '"]');
        if (!input) return;
        var value = input.type === 'checkbox' ? input.checked : input.value;
        payload[binding.field] = value;
      });
      window.FeatureDataClient.submitRecord(submitTable, payload).then(function () {
        if (window.showToast) window.showToast('Form submitted to ' + submitTable, 'success');
      }).catch(function (err) {
        if (window.showToast) window.showToast(err.message || 'Form submit failed', 'error');
      });
    });
    root.appendChild(submitBtn);
  }

  function hydrateWidget(slot, widget, options) {
    if (!hasDataBinding(widget)) {
      slot.innerHTML = disconnectedState('Choose data source and fields to render live data.');
      return;
    }
    if (!window.FeatureDataClient) {
      slot.innerHTML = disconnectedState('Data client not loaded.');
      return;
    }

    slot.innerHTML = loadingState('Loading live data...');
    var key = (options && options.mode ? options.mode : 'runtime') + ':' + widget.id + ':' + JSON.stringify(widget.config.dataBinding || {});

    window.FeatureDataClient.executeQueryDebounced(key, widget.type, widget.config.dataBinding, 300)
      .then(function (result) {
        var bound = applyQueryData(widget, result);
        slot.innerHTML = renderWidget(bound);
      })
      .catch(function (err) {
        slot.innerHTML = disconnectedState(err.message || 'Failed to load live data');
      });
  }

  function wireTableInteractions(root) {
    root.querySelectorAll('.builder-table-sort').forEach(function (th) {
      th.addEventListener('click', function () {
        var idx = Number(th.getAttribute('data-sort-index'));
        var tableEl = th.closest('table');
        if (!tableEl) return;
        var body = tableEl.querySelector('tbody');
        if (!body) return;
        var rows = Array.from(body.querySelectorAll('tr'));
        var asc = th.getAttribute('data-sort-order') !== 'asc';
        rows.sort(function (a, b) {
          var av = (a.children[idx] && a.children[idx].textContent) || '';
          var bv = (b.children[idx] && b.children[idx].textContent) || '';
          return asc ? av.localeCompare(bv, undefined, { numeric: true }) : bv.localeCompare(av, undefined, { numeric: true });
        });
        th.setAttribute('data-sort-order', asc ? 'asc' : 'desc');
        rows.forEach(function (r) { body.appendChild(r); });
      });
    });

    root.querySelectorAll('[id^="tbl-search-"]').forEach(function (input) {
      input.addEventListener('input', function () {
        var table = input.closest('.panel').querySelector('table');
        if (!table) return;
        var rows = table.querySelectorAll('tbody tr');
        var q = input.value.toLowerCase();
        rows.forEach(function (row) {
          row.style.display = row.textContent.toLowerCase().indexOf(q) > -1 ? '' : 'none';
        });
      });
    });
  }

  function renderFeature(feature, mountEl, options) {
    if (!mountEl) return;
    options = options || {};
    if (!feature || !feature.widgets) {
      mountEl.innerHTML = '<div class="panel" style="padding:18px;color:var(--text2)">No feature config available.</div>';
      return;
    }

    var html = '<div class="builder-runtime-grid">'
      + feature.widgets.map(function (widget) {
        var span = widget.layout && widget.layout.colSpan ? widget.layout.colSpan : 4;
        var rowSpan = widget.layout && widget.layout.rowSpan ? widget.layout.rowSpan : 1;
        return '<div class="builder-runtime-item" data-widget-slot="' + esc(widget.id) + '" style="grid-column:span ' + span + ';grid-row:span ' + rowSpan + '">'
          + loadingState('Preparing component...')
          + '</div>';
      }).join('')
      + '</div>';

    mountEl.innerHTML = html;
    feature.widgets.forEach(function (widget) {
      var slot = mountEl.querySelector('[data-widget-slot="' + widget.id + '"]');
      if (!slot) return;
      hydrateWidget(slot, widget, options);
    });
    wireTableInteractions(mountEl);
    if (options.mode === 'runtime') bindFormSubmit(mountEl, feature);
  }

  window.FeatureRenderer = {
    renderFeature: renderFeature
  };
})();
