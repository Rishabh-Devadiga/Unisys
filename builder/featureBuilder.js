(function () {
  var mounted = false;
  var unSub = null;

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
    return '<div class="builder-widget ' + (selected ? 'selected' : '') + '"'
      + ' data-widget-id="' + esc(widget.id) + '" draggable="true"'
      + ' style="grid-column:span ' + span + ';grid-row:span ' + rowSpan + '">'
      + '<div class="builder-widget-toolbar">'
      + '<button class="builder-drag-handle" title="Drag to reorder">::</button>'
      + '<span class="builder-widget-title">' + esc(widget.type) + '</span>'
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
        + '<h3>Drop components here</h3>'
        + '<p>Drag from the left palette or use Add buttons. Components snap to a 12-column grid.</p>'
        + '</div>';
    }

    return '<div class="builder-canvas-grid" id="builder-canvas-drop">'
      + feature.widgets.map(function (w) { return renderWidgetCard(w, w.id === selectedId); }).join('')
      + '</div>';
  }

  function toInputControl(key, value, widgetId) {
    var inputId = 'cfg-' + widgetId + '-' + key;
    if (typeof value === 'boolean') {
      return '<label class="builder-config-field"><span>' + esc(key) + '</span><input type="checkbox" id="' + esc(inputId) + '" data-config-key="' + esc(key) + '" ' + (value ? 'checked' : '') + '></label>';
    }
    if (typeof value === 'number') {
      return '<label class="builder-config-field"><span>' + esc(key) + '</span><input class="form-input" type="number" id="' + esc(inputId) + '" data-config-key="' + esc(key) + '" value="' + esc(value) + '"></label>';
    }
    if (Array.isArray(value) || (value && typeof value === 'object')) {
      return '<label class="builder-config-field"><span>' + esc(key) + ' (JSON)</span><textarea class="form-textarea" rows="4" id="' + esc(inputId) + '" data-config-key="' + esc(key) + '">' + esc(JSON.stringify(value, null, 2)) + '</textarea></label>';
    }
    return '<label class="builder-config-field"><span>' + esc(key) + '</span><input class="form-input" id="' + esc(inputId) + '" data-config-key="' + esc(key) + '" value="' + esc(value == null ? '' : value) + '"></label>';
  }

  function renderConfigPanel(feature, selectedWidgetId) {
    var widget = feature.widgets.find(function (w) { return w.id === selectedWidgetId; });
    if (!widget) {
      return '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:8px">Configuration</h3><p style="color:var(--text2);font-size:13px">Select a component in canvas to edit labels, data binding, styling, and behavior.</p></div>';
    }

    var controls = Object.keys(widget.config || {}).map(function (key) {
      return toInputControl(key, widget.config[key], widget.id);
    }).join('');

    return '<div class="panel">'
      + '<h3 style="font-family:var(--font-head);margin-bottom:8px">Configure: ' + esc(widget.type) + '</h3>'
      + '<div class="builder-config-field"><span>colSpan</span><input class="form-input" type="number" min="1" max="12" data-layout-key="colSpan" value="' + esc(widget.layout && widget.layout.colSpan || 4) + '"></div>'
      + '<div class="builder-config-field"><span>rowSpan</span><input class="form-input" type="number" min="1" max="6" data-layout-key="rowSpan" value="' + esc(widget.layout && widget.layout.rowSpan || 1) + '"></div>'
      + '<div class="builder-config-field"><span>sourceType</span><select class="form-select" data-config-key="sourceType"><option value="static" ' + ((widget.config && widget.config.sourceType === 'static') ? 'selected' : '') + '>static</option><option value="api" ' + ((widget.config && widget.config.sourceType === 'api') ? 'selected' : '') + '>api</option></select></div>'
      + controls
      + '<button class="btn btn-primary" data-save-widget="' + esc(widget.id) + '">Apply Changes</button>'
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
      + '</div>'
      + '</div>'

      + '<div class="builder-layout">'
      + '<aside class="builder-palette panel"><h3>Component Palette</h3>' + renderPalette() + '</aside>'
      + '<main class="builder-canvas-wrap panel">'
      + '<div class="builder-canvas-head"><h3>Canvas Workspace</h3><span class="badge badge-blue">Grid snap 12 cols</span></div>'
      + renderCanvas(feature, state.selectedWidgetId)
      + '<div class="builder-preview"><h3>Live Preview</h3><div id="builder-live-preview"></div></div>'
      + '</main>'
      + '<aside class="builder-config panel">'
      + renderConfigPanel(feature, state.selectedWidgetId)
      + renderRegistrySummary()
      + '</aside>'
      + '</div>'
      + '</div>';
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
        var def = registry.get(type);
        if (!def) return;
        store.addWidget(def);
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
        var def = registry.get(type);
        if (def) store.addWidget(def);
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

    var saveBtn = root.querySelector('[data-save-widget]');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', function () {
      var widgetId = saveBtn.getAttribute('data-save-widget');
      var nextConfig = {};

      root.querySelectorAll('[data-config-key]').forEach(function (input) {
        var key = input.getAttribute('data-config-key');
        var value;
        if (input.type === 'checkbox') {
          value = input.checked;
        } else if (input.tagName === 'TEXTAREA') {
          var raw = input.value;
          try {
            value = JSON.parse(raw);
          } catch (e) {
            value = raw;
          }
        } else if (input.type === 'number') {
          value = Number(input.value);
        } else {
          value = input.value;
        }
        nextConfig[key] = value;
      });

      var nextLayout = {};
      root.querySelectorAll('[data-layout-key]').forEach(function (input) {
        var key = input.getAttribute('data-layout-key');
        nextLayout[key] = Number(input.value);
      });

      store.updateWidget(widgetId, { config: nextConfig, layout: nextLayout });
      showToastSafe('Widget configuration updated', 'success');
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

    root.innerHTML = renderBuilderShell();

    bindHeader(root);
    bindPaletteDnD(root);
    bindWidgetActions(root);
    bindResizeHandles(root);
    bindConfig(root);

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