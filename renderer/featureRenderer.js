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

  function toCsv(columns, rows) {
    var head = columns.join(',');
    var body = rows.map(function (row) {
      return row.map(function (cell) {
        var text = String(cell == null ? '' : cell).replace(/"/g, '""');
        return '"' + text + '"';
      }).join(',');
    }).join('\n');
    return head + '\n' + body;
  }

  function downloadBlob(fileName, text, mime) {
    var blob = new Blob([text], { type: mime });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  function renderKpi(widget) {
    var c = widget.config || {};
    return '<div class="kpi-card">'
      + '<div class="kpi-label">' + esc(c.title || 'Metric') + '</div>'
      + '<div class="kpi-value">' + esc(c.value || '0') + '</div>'
      + '<span class="kpi-sub kpi-' + (c.trend === 'down' ? 'down' : c.trend === 'up' ? 'up' : 'neutral') + '">' + esc(c.subtitle || '') + '</span>'
      + '</div>';
  }

  function renderSummary(widget) {
    var c = widget.config || {};
    return '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:10px">' + esc(c.title || 'Summary') + '</h3><p style="color:var(--text2);font-size:13px">' + esc(c.content || '') + '</p></div>';
  }

  function renderCounter(widget) {
    var c = widget.config || {};
    return '<div class="panel"><div style="font-size:12px;color:var(--text3);margin-bottom:6px">' + esc(c.label || 'Counter') + '</div><div style="font-size:28px;font-weight:700">'
      + esc(c.prefix || '') + esc(c.value || 0) + esc(c.suffix || '') + '</div></div>';
  }

  function renderTable(widget, root) {
    var c = widget.config || {};
    var columns = asArray(c.columns, []);
    var rows = asArray(c.rows, []);
    var searchId = 'tbl-search-' + widget.id;
    var bodyId = 'tbl-body-' + widget.id;

    root.__tableData = root.__tableData || {};
    root.__tableData[widget.id] = { columns: columns.slice(), rows: rows.slice(), sortIndex: -1, asc: true };

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
      + '<div class="table-wrap"><table class="table"><thead><tr>' + head + '</tr></thead><tbody id="' + bodyId + '">' + body + '</tbody></table></div>'
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
      + '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:160px;background:rgba(110,231,255,0.06);border-radius:10px">'
      + '<polygon fill="' + esc(c.color || '#9b7bff') + '33" points="' + area + '"></polygon>'
      + '<polyline fill="none" stroke="' + esc(c.color || '#9b7bff') + '" stroke-width="2" points="' + poly + '"></polyline>'
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
    return '<div class="panel"><label class="form-label">' + esc(c.label || 'Input') + '</label><input class="form-input" placeholder="' + esc(c.placeholder || '') + '" ' + (c.required ? 'required' : '') + ' /></div>';
  }

  function renderSelect(widget) {
    var c = widget.config || {};
    var options = asArray(c.options, []).map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('');
    return '<div class="panel"><label class="form-label">' + esc(c.label || 'Select') + '</label><select class="form-select">' + options + '</select></div>';
  }

  function renderCheckbox(widget) {
    var c = widget.config || {};
    return '<div class="panel"><label style="display:flex;gap:8px;align-items:center;font-size:13px"><input type="checkbox" ' + (c.checked ? 'checked' : '') + '> ' + esc(c.label || 'Checkbox') + '</label></div>';
  }

  function renderDate(widget) {
    var c = widget.config || {};
    return '<div class="panel"><label class="form-label">' + esc(c.label || 'Date') + '</label><input class="form-input" type="date" ' + (c.required ? 'required' : '') + ' /></div>';
  }

  function renderTextarea(widget) {
    var c = widget.config || {};
    return '<div class="panel"><label class="form-label">' + esc(c.label || 'Notes') + '</label><textarea class="form-textarea" rows="3" placeholder="' + esc(c.placeholder || '') + '"></textarea></div>';
  }

  function renderActionButton(widget) {
    var c = widget.config || {};
    var variant = c.variant === 'danger' ? 'btn-danger' : c.variant === 'success' ? 'btn-success' : 'btn-primary';
    return '<div class="panel"><button class="btn ' + variant + '" data-builder-action="' + esc(widget.id) + '">' + esc(c.label || 'Run Action') + '</button></div>';
  }

  function renderAlert(widget) {
    var c = widget.config || {};
    var sev = c.severity || 'info';
    var color = sev === 'error' ? 'var(--red)' : sev === 'warning' ? 'var(--yellow)' : sev === 'success' ? 'var(--green)' : 'var(--accent2)';
    return '<div class="panel" style="border-left:4px solid ' + color + '"><div style="font-size:13px;color:var(--text1)">' + esc(c.message || 'Alert') + '</div></div>';
  }

  function renderNotif(widget) {
    var c = widget.config || {};
    var items = asArray(c.items, []).map(function (text) { return '<div style="padding:8px 0;border-bottom:1px solid var(--border);font-size:12px">' + esc(text) + '</div>'; }).join('');
    return '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:8px">' + esc(c.title || 'Notifications') + '</h3>' + items + '</div>';
  }

  function renderUpload(widget) {
    var c = widget.config || {};
    return '<div class="panel"><label class="form-label">' + esc(c.label || 'Upload file') + '</label><input type="file" data-builder-upload="' + esc(widget.id) + '" accept="' + esc(c.accept || '*') + '" class="form-input" style="padding:6px" /><div id="upload-list-' + esc(widget.id) + '" style="margin-top:8px;font-size:12px;color:var(--text2)"></div></div>';
  }

  function renderExport(widget) {
    var c = widget.config || {};
    return '<div class="panel"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">' + esc(c.title || 'Export') + '</div>'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap">'
      + (c.exportCsv ? '<button class="btn btn-sm" data-builder-export="csv" data-widget-id="' + esc(widget.id) + '">Export CSV</button>' : '')
      + (c.exportJson ? '<button class="btn btn-sm" data-builder-export="json" data-widget-id="' + esc(widget.id) + '">Export JSON</button>' : '')
      + (c.exportPdf ? '<button class="btn btn-sm" data-builder-export="pdf" data-widget-id="' + esc(widget.id) + '">Export PDF</button>' : '')
      + '</div></div>';
  }

  function renderSearch(widget) {
    var c = widget.config || {};
    return '<div class="panel"><input class="form-input" placeholder="' + esc(c.placeholder || 'Search...') + '" data-builder-search="' + esc(widget.id) + '" /></div>';
  }

  function renderFilters(widget) {
    var c = widget.config || {};
    var options = asArray(c.options, []).map(function (o) {
      return '<label style="font-size:12px;display:flex;align-items:center;gap:6px"><input type="checkbox" data-builder-filter="' + esc(widget.id) + '"> ' + esc(o) + '</label>';
    }).join('');
    return '<div class="panel"><div style="font-size:12px;color:var(--text3);margin-bottom:8px">' + esc(c.title || 'Filters') + '</div><div style="display:flex;gap:12px;flex-wrap:wrap">' + options + '</div></div>';
  }

  function renderSection(widget) {
    var c = widget.config || {};
    return '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:6px">' + esc(c.title || 'Section') + '</h3><p style="color:var(--text2);font-size:12px">' + esc(c.description || '') + '</p></div>';
  }

  function renderSplit(widget) {
    var c = widget.config || {};
    var cols = Math.max(2, toNumber(c.columns, 2));
    return '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:8px">' + esc(c.title || 'Split Container') + '</h3><div style="display:grid;grid-template-columns:repeat(' + cols + ',minmax(0,1fr));gap:8px">'
      + Array.from({ length: cols }).map(function (_, idx) { return '<div style="height:72px;border:1px dashed var(--border);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--text3)">Drop Zone ' + (idx + 1) + '</div>'; }).join('')
      + '</div></div>';
  }

  function renderWidget(widget, root) {
    switch (widget.type) {
      case 'kpi_card': return renderKpi(widget);
      case 'summary_card': return renderSummary(widget);
      case 'counter': return renderCounter(widget);
      case 'table': return renderTable(widget, root);
      case 'bar_chart': return renderBar(widget);
      case 'line_chart': return renderLine(widget);
      case 'pie_chart': return renderPie(widget);
      case 'area_chart': return renderArea(widget);
      case 'form_input': return renderInput(widget);
      case 'form_select': return renderSelect(widget);
      case 'form_checkbox': return renderCheckbox(widget);
      case 'form_date': return renderDate(widget);
      case 'form_textarea': return renderTextarea(widget);
      case 'action_button': return renderActionButton(widget);
      case 'alert': return renderAlert(widget);
      case 'notification_feed': return renderNotif(widget);
      case 'file_upload': return renderUpload(widget);
      case 'export_buttons': return renderExport(widget);
      case 'search_bar': return renderSearch(widget);
      case 'filters': return renderFilters(widget);
      case 'section': return renderSection(widget);
      case 'split_container': return renderSplit(widget);
      default:
        return '<div class="panel"><div style="font-size:12px;color:var(--text3)">Unknown widget type: ' + esc(widget.type) + '</div></div>';
    }
  }

  function wireRuntime(root, feature, options) {
    var showToast = (window.showToast || function (msg) { console.log(msg); });

    root.querySelectorAll('[data-builder-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var wid = btn.getAttribute('data-builder-action');
        var widget = feature.widgets.find(function (w) { return w.id === wid; });
        if (!widget) return;
        var c = widget.config || {};
        if (c.actionType === 'navigate' && c.actionPayload) {
          location.hash = c.actionPayload;
          showToast('Navigated to ' + c.actionPayload, 'info');
          return;
        }
        if (c.actionType === 'api' && c.actionPayload) {
          fetch(c.actionPayload).then(function () {
            showToast('API request completed', 'success');
          }).catch(function () {
            showToast('API request failed', 'error');
          });
          return;
        }
        showToast(c.actionPayload || 'Action executed', 'info');
      });
    });

    root.querySelectorAll('[data-builder-upload]').forEach(function (input) {
      input.addEventListener('change', function (e) {
        var wid = input.getAttribute('data-builder-upload');
        var list = root.querySelector('#upload-list-' + wid);
        var files = Array.from((e.target.files || []));
        if (!list) return;
        if (!files.length) {
          list.textContent = 'No file selected';
          return;
        }
        list.innerHTML = files.map(function (f) { return '<div>Uploaded: ' + esc(f.name) + '</div>'; }).join('');
      });
    });

    root.querySelectorAll('[data-builder-export]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var kind = btn.getAttribute('data-builder-export');
        var wid = btn.getAttribute('data-widget-id');
        var widget = feature.widgets.find(function (w) { return w.id === wid; });
        if (!widget) return;
        var c = widget.config || {};
        var fileName = (c.fileName || feature.name || 'feature').replace(/\s+/g, '-').toLowerCase();
        var tableWidget = feature.widgets.find(function (w) { return w.type === 'table'; });
        var tableColumns = tableWidget ? asArray(tableWidget.config.columns, ['Col1']) : ['Field', 'Value'];
        var tableRows = tableWidget ? asArray(tableWidget.config.rows, [['Example', '1']]) : [['Feature', feature.name], ['Widgets', feature.widgets.length]];

        if (kind === 'csv') {
          downloadBlob(fileName + '.csv', toCsv(tableColumns, tableRows), 'text/csv;charset=utf-8');
          showToast('CSV exported', 'success');
          return;
        }
        if (kind === 'json') {
          downloadBlob(fileName + '.json', JSON.stringify(feature, null, 2), 'application/json;charset=utf-8');
          showToast('JSON exported', 'success');
          return;
        }
        if (kind === 'pdf') {
          window.print();
          showToast('Print dialog opened for PDF export', 'info');
        }
      });
    });

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
        return '<div class="builder-runtime-item" style="grid-column:span ' + span + ';grid-row:span ' + rowSpan + '">' + renderWidget(widget, mountEl) + '</div>';
      }).join('')
      + '</div>';

    mountEl.innerHTML = html;
    wireRuntime(mountEl, feature, options);
  }

  window.FeatureRenderer = {
    renderFeature: renderFeature
  };
})();