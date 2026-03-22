(function () {
  var mounted = false;
  var unSub = null;
  var schemaCache = null;
  var schemaLoading = false;
  var schemaError = '';
  var dataSourceModalWidgetId = null;
  var selectedDataSource = null;
  var availableTables = [];
  var tablesLoading = false;
  var selectedTable = null;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showToastSafe(msg, type) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, type || 'info');
    } else {
      console.log(msg);
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getStore() {
    return window.FeatureBuilderStore;
  }

  function getRegistry() {
    return window.ComponentRegistry;
  }

  function getRoot() {
    return document.getElementById('feature-builder-root');
  }

  function getFeatureSectionId(featureId) {
    return 'custom-feature-' + featureId;
  }

  function getFeaturePreviewMountId(featureId) {
    return 'feature-runtime-' + featureId;
  }

  function ensureSchemaLoaded() {
    if (schemaCache || schemaLoading || !window.FeatureDataClient) return;
    schemaLoading = true;
    schemaError = '';
    window.FeatureDataClient.getSchema().then(function (schema) {
      schemaCache = schema;
      schemaLoading = false;
      mountBuilder();
    }).catch(function (err) {
      schemaLoading = false;
      schemaError = err && err.message ? err.message : 'Failed to load schema';
      mountBuilder();
    });
  }

  function schemaTables() {
    return schemaCache && Array.isArray(schemaCache.tables) ? schemaCache.tables : [];
  }

  function tableColumns(table) {
    var item = schemaTables().find(function (t) { return t.name === table; });
    return item && Array.isArray(item.columns) ? item.columns.map(function (c) { return c.name; }) : [];
  }

  function ensureBinding(widget) {
    var cfg = widget.config || {};
    var binding = cfg.dataBinding || {};
    if (!binding.sourceType) binding.sourceType = 'database';
    if (!Array.isArray(binding.filters)) binding.filters = [];
    if (!binding.aggregation) binding.aggregation = 'sum';
    return binding;
  }

  function navigateToModule(moduleId) {
    var btn = document.querySelector('.nav-item[data-module="' + moduleId + '"]');
    if (btn) btn.click();
  }

  function setDashboardRoute(moduleId) {
    var route = '#/dashboard/' + moduleId;
    if (location.hash !== route) {
      history.replaceState({}, '', route);
    }
  }

  function renderRegistrySummary() {
    var registry = getRegistry();
    if (!registry) return '';
    var grouped = registry.byCategory();
    var categoryHtml = Object.keys(grouped).map(function (cat) {
      return '<div class="builder-registry-group">'
        + '<div class="builder-registry-group-title">' + esc(cat) + '</div>'
        + '<div class="builder-registry-items">'
        + grouped[cat].map(function (item) {
          return '<span class="builder-registry-pill">' + esc(item.label) + '</span>';
        }).join('')
        + '</div></div>';
    }).join('');

    return '<div class="builder-registry-panel">'
      + '<h4>Component Registry</h4>'
      + '<p>Centralized inventory from dashboard audit.</p>'
      + categoryHtml
      + '<div class="builder-registry-modules"><div class="builder-registry-group-title">Existing Custom Modules</div><p>' + esc(registry.existingCustomModules.join(', ')) + '</p></div>'
      + '</div>';
  }

  function renderPalette() {
    var registry = getRegistry();
    if (!registry) return '<div class="panel">Component registry unavailable.</div>';
    var grouped = registry.byCategory();
    return Object.keys(grouped).map(function (cat) {
      return '<div class="builder-palette-group">'
        + '<div class="builder-palette-title">' + esc(cat.toUpperCase()) + '</div>'
        + grouped[cat].map(function (item) {
          return '<div class="builder-palette-item" draggable="true" data-palette-type="' + esc(item.type) + '">'
            + '<div class="builder-palette-icon">' + esc(item.icon || '+') + '</div>'
            + '<div><div class="builder-palette-name">' + esc(item.label) + '</div>'
            + '<div class="builder-palette-sub">' + esc(item.supports.join(', ')) + '</div></div>'
            + '<button class="btn btn-sm" data-add-type="' + esc(item.type) + '">Add</button>'
            + '</div>';
        }).join('')
        + '</div>';
    }).join('');
  }

  function renderWidgetCard(widget, selected) {
    var span = Math.min(12, Math.max(1, Number(widget.layout && widget.layout.colSpan || 4)));
    var rowSpan = Math.min(6, Math.max(1, Number(widget.layout && widget.layout.rowSpan || 1)));
    var sourceType = widget.config && widget.config.dataBinding ? widget.config.dataBinding.sourceType : '';
    return '<div class="builder-widget ' + (selected ? 'selected' : '') + '"'
      + ' data-widget-id="' + esc(widget.id) + '" draggable="true"'
      + ' style="grid-column:span ' + span + ';grid-row:span ' + rowSpan + '">'
      + '<div class="builder-widget-toolbar">'
      + '<button class="builder-drag-handle" title="Drag to reorder">::</button>'
      + '<span class="builder-widget-title">' + esc(widget.type) + '</span>'
      + '<span class="badge badge-blue">' + esc(sourceType || 'No Source') + '</span>'
      + '<div style="display:flex;gap:6px">'
      + '<button class="btn btn-sm" data-select-widget="' + esc(widget.id) + '">Edit</button>'
      + '<button class="btn btn-sm btn-danger" data-remove-widget="' + esc(widget.id) + '">Delete</button>'
      + '</div></div>'
      + '<div class="builder-widget-body" data-select-widget="' + esc(widget.id) + '"></div>'
      + '<div class="builder-resize-handle" data-resize-widget="' + esc(widget.id) + '" title="Resize"></div>'
      + '</div>';
  }

  function renderCanvas(feature, selectedId) {
    if (!feature.widgets.length) {
      return '<div class="builder-empty-state" id="builder-canvas-drop">'
        + '<h3>What data do you want to visualize?</h3>'
        + '<p>Add a component to start the guided data flow.</p>'
        + '</div>';
    }

    return '<div class="builder-canvas-grid" id="builder-canvas-drop">'
      + feature.widgets.map(function (w) { return renderWidgetCard(w, w.id === selectedId); }).join('')
      + '</div>';
  }

  function renderSelectOptions(list, selected, placeholder) {
    var options = (list || []).map(function (item) {
      return '<option value="' + esc(item) + '" ' + (item === selected ? 'selected' : '') + '>' + esc(item) + '</option>';
    }).join('');
    return '<option value="">' + esc(placeholder || 'Select') + '</option>' + options;
  }

  function renderFilterBuilder(widget, columns) {
    var binding = ensureBinding(widget);
    var operators = (schemaCache && schemaCache.operators) || ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'in', 'between'];
    var chips = (binding.filters || []).map(function (filter, index) {
      return '<span class="builder-filter-chip">' + esc(filter.field) + ' ' + esc(filter.operator) + ' ' + esc(filter.value)
        + '<button class="btn btn-sm" data-remove-filter="' + esc(widget.id) + '" data-filter-index="' + index + '">x</button></span>';
    }).join('');
    return '<div class="builder-step"><div class="builder-step-title">5. Filters (Optional)</div>'
      + '<div class="builder-filter-list">' + (chips || '<span class="builder-filter-empty">No filters</span>') + '</div>'
      + '<div class="builder-filter-builder">'
      + '<select class="form-select" data-new-filter-field="' + esc(widget.id) + '">' + renderSelectOptions(columns, '', 'Field') + '</select>'
      + '<select class="form-select" data-new-filter-operator="' + esc(widget.id) + '">' + renderSelectOptions(operators, 'eq', 'Operator') + '</select>'
      + '<input class="form-input" data-new-filter-value="' + esc(widget.id) + '" placeholder="Value" />'
      + '<button class="btn btn-sm" data-add-filter="' + esc(widget.id) + '">Add</button>'
      + '</div></div>';
  }

  function renderDataFlow(widget) {
    var binding = ensureBinding(widget);
    var tables = schemaTables().map(function (t) { return t.name; });
    var endpoints = (schemaCache && schemaCache.apiEndpoints ? schemaCache.apiEndpoints : []).map(function (ep) { return ep.id; });
    var cols = tableColumns(binding.table);
    var aggs = (schemaCache && schemaCache.aggregations) || ['sum', 'avg', 'count'];
    var html = '<div class="builder-step"><div class="builder-step-title">1. Select Data Source</div>'
      + '<select class="form-select" data-binding-key="sourceType">' + renderSelectOptions(['database', 'api_endpoint', 'custom_query'], binding.sourceType, 'Source') + '</select>';

    if (binding.sourceType === 'database' || binding.sourceType === 'custom_query') {
      html += '<select class="form-select" data-binding-key="table">' + renderSelectOptions(tables, binding.table || '', 'Table') + '</select>';
    } else if (binding.sourceType === 'api_endpoint') {
      html += '<select class="form-select" data-binding-key="endpoint">' + renderSelectOptions(endpoints, binding.endpoint || '', 'API endpoint') + '</select>';
    }
    html += '</div>';

    if (['bar_chart', 'line_chart', 'area_chart', 'pie_chart'].indexOf(widget.type) > -1) {
      html += '<div class="builder-step"><div class="builder-step-title">2. Select X-axis</div>'
        + '<select class="form-select" data-binding-key="xField">' + renderSelectOptions(cols, binding.xField || '', 'X-axis') + '</select></div>'
        + '<div class="builder-step"><div class="builder-step-title">3. Select Y-axis</div>'
        + '<select class="form-select" data-binding-key="yField">' + renderSelectOptions(cols, binding.yField || '', 'Y-axis') + '</select></div>'
        + '<div class="builder-step"><div class="builder-step-title">4. Aggregation</div>'
        + '<select class="form-select" data-binding-key="aggregation">' + renderSelectOptions(aggs, binding.aggregation || 'sum', 'Aggregation') + '</select></div>'
        + renderFilterBuilder(widget, cols);
    } else if (['kpi_card', 'counter', 'summary_card'].indexOf(widget.type) > -1) {
      html += '<div class="builder-step"><div class="builder-step-title">2. Metric Field</div>'
        + '<select class="form-select" data-binding-key="metricField">' + renderSelectOptions(cols, binding.metricField || '', 'Metric') + '</select></div>'
        + '<div class="builder-step"><div class="builder-step-title">3. Aggregation</div>'
        + '<select class="form-select" data-binding-key="aggregation">' + renderSelectOptions(aggs, binding.aggregation || 'sum', 'Aggregation') + '</select></div>'
        + renderFilterBuilder(widget, cols);
    } else if (widget.type === 'table') {
      var columnChoices = cols.map(function (col) {
        var checked = (binding.columns || []).indexOf(col) > -1;
        return '<label class="builder-column-check"><input type="checkbox" data-binding-column="' + esc(col) + '" ' + (checked ? 'checked' : '') + '> ' + esc(col) + '</label>';
      }).join('');
      html += '<div class="builder-step"><div class="builder-step-title">2. Select Columns</div><div class="builder-column-grid">'
        + (columnChoices || '<span class="builder-filter-empty">Pick a table first.</span>') + '</div></div>'
        + renderFilterBuilder(widget, cols);
    } else if (['form_input', 'form_select', 'form_checkbox', 'form_date', 'form_textarea'].indexOf(widget.type) > -1) {
      var key = widget.type === 'form_select' ? 'optionField' : 'field';
      html += '<div class="builder-step"><div class="builder-step-title">2. Bind Field</div>'
        + '<select class="form-select" data-binding-key="' + key + '">' + renderSelectOptions(cols, binding[key] || '', 'Field') + '</select></div>'
        + '<div class="builder-step"><div class="builder-step-title">3. Submit Target</div>'
        + '<select class="form-select" data-binding-key="submitTable">' + renderSelectOptions(tables, binding.submitTable || '', 'Submit table') + '</select></div>';
      if (widget.type === 'form_select') html += renderFilterBuilder(widget, cols);
    }

    return html;
  }

  function renderDisplayControls(widget) {
    var keys = ['title', 'label', 'placeholder', 'prefix', 'suffix', 'color'];
    var cfg = widget.config || {};
    return keys.filter(function (k) { return typeof cfg[k] !== 'undefined'; }).map(function (k) {
      return '<label class="builder-config-field"><span>' + esc(k) + '</span><input class="form-input" data-config-key="' + esc(k) + '" value="' + esc(cfg[k]) + '"></label>';
    }).join('');
  }

  function renderConfigPanel(feature, selectedWidgetId) {
    var widget = feature.widgets.find(function (w) { return w.id === selectedWidgetId; });
    if (!widget) {
      return '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:8px">Configuration</h3><p style="color:var(--text2);font-size:13px">Select a component in canvas to edit data binding.</p></div>';
    }

    return '<div class="panel">'
      + '<h3 style="font-family:var(--font-head);margin-bottom:8px">Configure: ' + esc(widget.type) + '</h3>'
      + '<div class="builder-config-field"><span>colSpan</span><input class="form-input" type="number" min="1" max="12" data-layout-key="colSpan" value="' + esc(widget.layout && widget.layout.colSpan || 4) + '"></div>'
      + '<div class="builder-config-field"><span>rowSpan</span><input class="form-input" type="number" min="1" max="6" data-layout-key="rowSpan" value="' + esc(widget.layout && widget.layout.rowSpan || 1) + '"></div>'
      + renderDisplayControls(widget)
      + renderDataFlow(widget)
      + '</div>';
  }

  function renderBuilderShell() {
    var store = getStore();
    var state = store.getState();
    var feature = state.currentFeature;

    var options = state.features.map(function (f) {
      return '<option value="' + esc(f.id) + '" ' + (f.id === feature.id ? 'selected' : '') + '>' + esc(f.name) + '</option>';
    }).join('');

    var attached = state.attachedFeatureIds.indexOf(feature.id) > -1;

    var schemaNote = schemaLoading ? 'Loading schema...' : (schemaError ? 'Schema error' : 'Schema connected');

    return '<div class="builder-shell">'
      + '<div class="builder-header panel">'
      + '<div class="builder-header-row">'
      + '<div class="builder-title-stack">'
      + '<input id="builder-feature-name" class="form-input" value="' + esc(feature.name) + '" placeholder="Feature name" />'
      + '<input id="builder-feature-desc" class="form-input" value="' + esc(feature.description || '') + '" placeholder="Feature description" />'
      + '</div>'
      + '<div class="builder-header-actions">'
      + '<button class="btn" id="builder-new">New</button>'
      + '<button class="btn btn-primary" id="builder-save">Save</button>'
      + '<button class="btn" id="builder-save-as">Save As New</button>'
      + '<button class="btn ' + (attached ? 'btn-danger' : 'btn-success') + '" id="builder-attach">' + (attached ? 'Detach from Sidebar' : 'Attach to Sidebar') + '</button>'
      + '</div></div>'
      + '<div class="builder-load-row">'
      + '<label class="form-label" style="margin:0">Load Existing</label>'
      + '<select id="builder-feature-load" class="form-select"><option value="">Select saved feature</option>' + options + '</select>'
      + '<button class="btn" id="builder-load-btn">Load</button>'
      + '<span class="badge badge-blue">' + esc(schemaNote) + '</span>'
      + '</div>'
      + '</div>'

      + '<div class="builder-layout">'
      + '<aside class="builder-palette panel"><h3>Component Palette</h3>' + renderPalette() + '</aside>'
      + '<main class="builder-canvas-wrap panel">'
      + '<div class="builder-canvas-head"><h3>Canvas Workspace</h3><span class="badge badge-blue">Choose data first, then visualize</span></div>'
      + renderCanvas(feature, state.selectedWidgetId)
      + '<div class="builder-preview"><h3>Live Preview</h3><div id="builder-live-preview"></div></div>'
      + '</main>'
      + '<aside class="builder-config panel">'
      + renderConfigPanel(feature, state.selectedWidgetId)
      + renderRegistrySummary()
      + '</aside>'
      + '</div>'
      + renderDataSourceModal()
      + '</div>';
  }

  function renderDataSourceModal() {
    if (!dataSourceModalWidgetId) return '';
    
    /* If showing table selection */
    if (selectedDataSource === 'database') {
      var tableList = '';
      if (tablesLoading) {
        tableList = '<div class="builder-modal-loading">Loading tables...</div>';
      } else if (!availableTables || availableTables.length === 0) {
        tableList = '<div class="builder-modal-error">No tables available</div>';
      } else {
        tableList = '<div class="builder-table-selector">';
        availableTables.forEach(function(table) {
          var isSelected = selectedTable === table.name;
          tableList += '<div class="builder-table-option ' + (isSelected ? 'selected' : '') + '" data-table="' + esc(table.name) + '">'
            + '<input type="radio" name="table" value="' + esc(table.name) + '" ' + (isSelected ? 'checked' : '') + ' />'
            + '<label>' + esc(table.name) + '</label>'
            + '</div>';
        });
        tableList += '</div>';
      }
      
      return '<div class="builder-modal-overlay"><div class="builder-modal">'
        + '<h3>Which data do you want to use?</h3>'
        + '<p>Select a table from your database</p>'
        + tableList
        + '<div class="builder-modal-actions">'
        + '<button class="btn btn-secondary" data-modal-back="1">Back</button>'
        + (selectedTable ? '<button class="btn btn-primary" data-modal-confirm="1">Confirm</button>' : '<button class="btn btn-primary" disabled>Select a Table</button>')
        + '</div>'
        + '</div></div>';
    }
    
    /* Initial data source selection */
    return '<div class="builder-modal-overlay"><div class="builder-modal">'
      + '<h3>Which data do you want to use?</h3>'
      + '<p>Choose where this component should fetch data from.</p>'
      + '<div class="builder-modal-options">'
      + '<button class="btn ' + (selectedDataSource === 'database' ? 'btn-primary' : '') + '" data-modal-source="database">Database Tables</button>'
      + '<button class="btn ' + (selectedDataSource === 'api_endpoint' ? 'btn-primary' : '') + '" data-modal-source="api_endpoint">API Endpoints</button>'
      + '<button class="btn ' + (selectedDataSource === 'custom_query' ? 'btn-primary' : '') + '" data-modal-source="custom_query">Custom Query</button>'
      + '</div>'
      + '<div class="builder-modal-actions">'
      + '<button class="btn btn-secondary" data-modal-close="1">Skip</button>'
      + '</div>'
      + '</div></div>';
  }

  function renderWidgetPreviews(root) {
    var store = getStore();
    var state = store.getState();

    state.currentFeature.widgets.forEach(function (widget) {
      var body = root.querySelector('.builder-widget-body[data-select-widget="' + widget.id + '"]');
      if (!body || !window.FeatureRenderer) return;
      window.FeatureRenderer.renderFeature({ id: 'tmp', name: 'tmp', widgets: [widget] }, body, { mode: 'builder' });
    });

    var preview = root.querySelector('#builder-live-preview');
    if (preview && window.FeatureRenderer) {
      window.FeatureRenderer.renderFeature(state.currentFeature, preview, { mode: 'builder-preview' });
    }
  }

  function attachFeatureSections() {
    var store = getStore();
    var attachedFeatures = store.getAttachedFeatures();
    var moduleNav = document.getElementById('module-nav');
    var moduleWrap = document.querySelector('.module-wrap');
    var addFeatureBtn = moduleNav ? moduleNav.querySelector('.nav-item[data-module="add-feature"]') : null;

    if (!moduleNav || !moduleWrap || !addFeatureBtn) return;

    moduleNav.querySelectorAll('.attached-feature-item, .attached-feature-label').forEach(function (el) { el.remove(); });

    if (attachedFeatures.length) {
      var label = document.createElement('span');
      label.className = 'sidebar-section-label attached-feature-label';
      label.textContent = 'Custom Features';
      moduleNav.insertBefore(label, addFeatureBtn);
    }

    attachedFeatures.forEach(function (feature) {
      var moduleId = getFeatureSectionId(feature.id);
      var navBtn = document.createElement('button');
      navBtn.className = 'nav-item attached-feature-item';
      navBtn.setAttribute('data-module', moduleId);
      navBtn.innerHTML = '<span class="nav-icon">* </span>' + esc(feature.name);
      moduleNav.insertBefore(navBtn, addFeatureBtn);

      var section = document.getElementById(moduleId);
      if (!section) {
        section = document.createElement('section');
        section.className = 'module-section attached-feature-section';
        section.id = moduleId;
        moduleWrap.appendChild(section);
      }
      section.innerHTML = '<div class="module-header"><div class="module-title">' + esc(feature.name) + '</div><div class="module-sub">' + esc(feature.description || 'Custom feature module') + '</div></div>'
        + '<div id="' + getFeaturePreviewMountId(feature.id) + '"></div>';

      if (window.FeatureRenderer) {
        window.FeatureRenderer.renderFeature(feature, document.getElementById(getFeaturePreviewMountId(feature.id)), { mode: 'runtime' });
      }
    });

    var validIds = attachedFeatures.map(function (f) { return getFeatureSectionId(f.id); });
    moduleWrap.querySelectorAll('.attached-feature-section').forEach(function (section) {
      if (validIds.indexOf(section.id) === -1) section.remove();
    });
  }

  function bindPaletteDnD(root) {
    var store = getStore();
    var registry = getRegistry();

    function addWidgetAndSelectSource(type) {
      var def = registry.get(type);
      if (!def) return;
      var widget = store.addWidget(def);
      dataSourceModalWidgetId = widget.id;
      mountBuilder();
    }

    root.querySelectorAll('.builder-palette-item').forEach(function (item) {
      item.addEventListener('dragstart', function (e) {
        item.classList.add('dragging');
        e.dataTransfer.setData('application/x-builder-palette', item.getAttribute('data-palette-type'));
      });
      item.addEventListener('dragend', function () {
        item.classList.remove('dragging');
      });
    });

    root.querySelectorAll('[data-add-type]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var type = btn.getAttribute('data-add-type');
        addWidgetAndSelectSource(type);
      });
    });

    var canvas = root.querySelector('#builder-canvas-drop');
    if (!canvas) return;
    canvas.addEventListener('dragover', function (e) {
      e.preventDefault();
      canvas.classList.add('drag-over');
    });
    canvas.addEventListener('dragleave', function () {
      canvas.classList.remove('drag-over');
    });
    canvas.addEventListener('drop', function (e) {
      e.preventDefault();
      canvas.classList.remove('drag-over');
      var type = e.dataTransfer.getData('application/x-builder-palette');
      if (type) {
        addWidgetAndSelectSource(type);
      }
      var widgetId = e.dataTransfer.getData('application/x-builder-widget');
      var over = e.target.closest('.builder-widget');
      if (widgetId && over) {
        store.reorderWidgets(widgetId, over.getAttribute('data-widget-id'));
      }
    });
  }

  function bindWidgetActions(root) {
    var store = getStore();

    root.querySelectorAll('[data-select-widget]').forEach(function (el) {
      el.addEventListener('click', function () {
        store.selectWidget(el.getAttribute('data-select-widget'));
      });
    });

    root.querySelectorAll('[data-remove-widget]').forEach(function (el) {
      el.addEventListener('click', function () {
        store.removeWidget(el.getAttribute('data-remove-widget'));
      });
    });

    root.querySelectorAll('.builder-widget').forEach(function (widgetEl) {
      widgetEl.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('application/x-builder-widget', widgetEl.getAttribute('data-widget-id'));
      });
      widgetEl.addEventListener('dragover', function (e) {
        e.preventDefault();
      });
      widgetEl.addEventListener('drop', function (e) {
        e.preventDefault();
        var activeId = e.dataTransfer.getData('application/x-builder-widget');
        var overId = widgetEl.getAttribute('data-widget-id');
        if (activeId && overId) store.reorderWidgets(activeId, overId);
      });
    });
  }

  function bindResizeHandles(root) {
    var store = getStore();

    root.querySelectorAll('[data-resize-widget]').forEach(function (handle) {
      handle.addEventListener('mousedown', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var widgetId = handle.getAttribute('data-resize-widget');
        var state = store.getState();
        var widget = state.currentFeature.widgets.find(function (w) { return w.id === widgetId; });
        if (!widget) return;

        var startX = e.clientX;
        var startY = e.clientY;
        var startCol = Number(widget.layout.colSpan || 4);
        var startRow = Number(widget.layout.rowSpan || 1);

        function onMove(ev) {
          var dx = ev.clientX - startX;
          var dy = ev.clientY - startY;
          var colDelta = Math.round(dx / 34);
          var rowDelta = Math.round(dy / 28);
          store.updateWidget(widgetId, {
            layout: {
              colSpan: Math.min(12, Math.max(1, startCol + colDelta)),
              rowSpan: Math.min(6, Math.max(1, startRow + rowDelta))
            }
          });
        }

        function onUp() {
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('mouseup', onUp);
        }

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
      });
    });
  }

  function bindConfig(root) {
    var store = getStore();
    var selectedId = store.getState().selectedWidgetId;
    if (!selectedId) return;
    var widget = store.getState().currentFeature.widgets.find(function (w) { return w.id === selectedId; });
    if (!widget) return;

    function updateBinding(key, value) {
      var nextBinding = clone(ensureBinding(widget));
      nextBinding[key] = value;
      store.updateWidget(selectedId, { config: { dataBinding: nextBinding } });
    }

    root.querySelectorAll('[data-binding-key]').forEach(function (input) {
      input.addEventListener('change', function () {
        updateBinding(input.getAttribute('data-binding-key'), input.value);
      });
    });

    root.querySelectorAll('[data-binding-column]').forEach(function (input) {
      input.addEventListener('change', function () {
        var nextBinding = clone(ensureBinding(widget));
        var set = new Set(nextBinding.columns || []);
        var col = input.getAttribute('data-binding-column');
        if (input.checked) set.add(col);
        else set.delete(col);
        nextBinding.columns = Array.from(set);
        store.updateWidget(selectedId, { config: { dataBinding: nextBinding } });
      });
    });

    root.querySelectorAll('[data-add-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var fieldEl = root.querySelector('[data-new-filter-field="' + selectedId + '"]');
        var opEl = root.querySelector('[data-new-filter-operator="' + selectedId + '"]');
        var valueEl = root.querySelector('[data-new-filter-value="' + selectedId + '"]');
        if (!fieldEl || !fieldEl.value || !opEl || !valueEl) return;
        var nextBinding = clone(ensureBinding(widget));
        nextBinding.filters = clone(nextBinding.filters || []);
        nextBinding.filters.push({ field: fieldEl.value, operator: opEl.value, value: valueEl.value });
        store.updateWidget(selectedId, { config: { dataBinding: nextBinding } });
      });
    });

    root.querySelectorAll('[data-remove-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = Number(btn.getAttribute('data-filter-index'));
        var nextBinding = clone(ensureBinding(widget));
        nextBinding.filters = clone(nextBinding.filters || []).filter(function (_, i) { return i !== idx; });
        store.updateWidget(selectedId, { config: { dataBinding: nextBinding } });
      });
    });

    root.querySelectorAll('[data-config-key]').forEach(function (input) {
      input.addEventListener('input', function () {
        var key = input.getAttribute('data-config-key');
        var patch = {};
        patch[key] = input.value;
        store.updateWidget(selectedId, { config: patch });
      });
    });

    root.querySelectorAll('[data-layout-key]').forEach(function (input) {
      input.addEventListener('change', function () {
        var layoutPatch = {};
        layoutPatch[input.getAttribute('data-layout-key')] = Number(input.value);
        store.updateWidget(selectedId, { layout: layoutPatch });
      });
    });
  }

  function bindHeader(root) {
    var store = getStore();

    var nameInput = root.querySelector('#builder-feature-name');
    var descInput = root.querySelector('#builder-feature-desc');
    var saveBtn = root.querySelector('#builder-save');
    var saveAsBtn = root.querySelector('#builder-save-as');
    var newBtn = root.querySelector('#builder-new');
    var loadBtn = root.querySelector('#builder-load-btn');
    var attachBtn = root.querySelector('#builder-attach');

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        store.renameCurrentFeature(nameInput ? nameInput.value : undefined, descInput ? descInput.value : undefined);
        store.saveCurrentFeature();
        showToastSafe('Feature saved', 'success');
      });
    }

    if (saveAsBtn) {
      saveAsBtn.addEventListener('click', function () {
        var baseName = (nameInput && nameInput.value) ? nameInput.value : 'Untitled Feature';
        store.renameCurrentFeature(nameInput ? nameInput.value : undefined, descInput ? descInput.value : undefined);
        store.saveAsNew(baseName + ' Copy');
        showToastSafe('Saved as new feature', 'success');
      });
    }

    if (newBtn) {
      newBtn.addEventListener('click', function () {
        store.createBlankFeature();
      });
    }

    if (loadBtn) {
      loadBtn.addEventListener('click', function () {
        var sel = root.querySelector('#builder-feature-load');
        if (!sel || !sel.value) {
          showToastSafe('Pick a saved feature first', 'warning');
          return;
        }
        store.loadFeature(sel.value);
        showToastSafe('Feature loaded', 'success');
      });
    }

    if (attachBtn) {
      attachBtn.addEventListener('click', function () {
        var state = store.getState();
        var id = state.currentFeature.id;
        if (state.attachedFeatureIds.indexOf(id) > -1) {
          store.detachFeature(id);
          showToastSafe('Feature detached from sidebar', 'info');
        } else {
          store.renameCurrentFeature(nameInput ? nameInput.value : undefined, descInput ? descInput.value : undefined);
          store.saveCurrentFeature();
          store.attachFeature(id);
          showToastSafe('Feature attached to sidebar', 'success');
        }
      });
    }

    if (nameInput) {
      nameInput.addEventListener('change', function () {
        store.renameCurrentFeature(nameInput.value, descInput ? descInput.value : undefined);
      });
    }
    if (descInput) {
      descInput.addEventListener('change', function () {
        store.renameCurrentFeature(nameInput ? nameInput.value : undefined, descInput.value);
      });
    }
  }

  function bindDataSourceModal(root) {
    var store = getStore();
    
    /* Handle source selection (load tables if database selected) */
    root.querySelectorAll('[data-modal-source]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var source = btn.getAttribute('data-modal-source');
        selectedDataSource = source;
        selectedTable = null;
        
        /* Load tables if database is selected */
        if (source === 'database') {
          tablesLoading = true;
          if (window.FeatureDataClient && typeof window.FeatureDataClient.getSchema === 'function') {
            window.FeatureDataClient.getSchema()
              .then(function(schema) {
                availableTables = (schema && schema.tables) ? schema.tables : [];
                tablesLoading = false;
                mountBuilder();
              })
              .catch(function(err) {
                console.error('Failed to load tables:', err);
                tablesLoading = false;
                availableTables = [];
                mountBuilder();
              });
          } else {
            console.error('FeatureDataClient not available');
            tablesLoading = false;
            availableTables = [];
            mountBuilder();
          }
        }
        
        mountBuilder();
      });
    });
    
    /* Handle table selection */
    root.querySelectorAll('[data-table]').forEach(function (option) {
      option.addEventListener('click', function () {
        selectedTable = option.getAttribute('data-table');
        mountBuilder();
      });
    });
    
    /* Handle back button (go back to source selection) */
    var backBtn = root.querySelector('[data-modal-back]');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        selectedDataSource = null;
        selectedTable = null;
        availableTables = [];
        mountBuilder();
      });
    }
    
    /* Handle confirm button */
    var confirmBtn = root.querySelector('[data-modal-confirm]');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', function () {
        if (!selectedTable) return;
        var widgetId = dataSourceModalWidgetId;
        if (!widgetId) return;
        var widget = store.getState().currentFeature.widgets.find(function (w) { return w.id === widgetId; });
        if (!widget) return;
        var nextBinding = clone(ensureBinding(widget));
        nextBinding.sourceType = 'database';
        nextBinding.table = selectedTable;
        store.updateWidget(widgetId, { config: { dataBinding: nextBinding } });
        store.selectWidget(widgetId);
        dataSourceModalWidgetId = null;
        selectedDataSource = null;
        selectedTable = null;
        availableTables = [];
        mountBuilder();
      });
    }
    
    /* Handle close/skip button */
    var closeBtn = root.querySelector('[data-modal-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        dataSourceModalWidgetId = null;
        selectedDataSource = null;
        selectedTable = null;
        availableTables = [];
        mountBuilder();
      });
    }
  }

  function bindRouteSync() {
    var nav = document.getElementById('module-nav');
    if (!nav || nav.__builderRouteBound) return;
    nav.__builderRouteBound = true;

    nav.addEventListener('click', function (e) {
      var btn = e.target.closest('.nav-item[data-module]');
      if (!btn) return;
      setDashboardRoute(btn.getAttribute('data-module'));
    });

    window.addEventListener('hashchange', function () {
      var hash = location.hash || '';
      if (hash.indexOf('#/dashboard/') !== 0) return;
      var mod = hash.replace('#/dashboard/', '');
      navigateToModule(mod);
    });

    var initialHash = location.hash || '';
    if (initialHash.indexOf('#/dashboard/') === 0) {
      navigateToModule(initialHash.replace('#/dashboard/', ''));
    }
  }

  function mountBuilder() {
    var root = getRoot();
    var store = getStore();
    if (!root || !store || !getRegistry() || !window.FeatureRenderer) return;
    ensureSchemaLoaded();

    root.innerHTML = renderBuilderShell();

    bindHeader(root);
    bindPaletteDnD(root);
    bindWidgetActions(root);
    bindResizeHandles(root);
    bindConfig(root);
    bindDataSourceModal(root);

    renderWidgetPreviews(root);
    attachFeatureSections();
    bindRouteSync();
  }

  function init() {
    if (mounted) return;
    mounted = true;

    if (!getRoot()) return;
    mountBuilder();

    var store = getStore();
    if (!store) return;

    unSub = store.subscribe(function () {
      mountBuilder();
    });
  }

  window.FeatureBuilder = {
    init: init,
    remount: mountBuilder,
    destroy: function () {
      if (typeof unSub === 'function') unSub();
      unSub = null;
      mounted = false;
    }
  };
})();
