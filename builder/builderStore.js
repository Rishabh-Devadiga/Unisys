(function () {
  var KEY = 'edusys_feature_builder_state_v1';

  function uid(prefix) {
    return (prefix || 'id') + '-' + Math.random().toString(36).slice(2, 8) + '-' + Date.now().toString(36);
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function loadPersisted() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function persist(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        currentFeature: state.currentFeature,
        features: state.features,
        attachedFeatureIds: state.attachedFeatureIds
      }));
    } catch (e) {
      // ignore
    }
  }

  var initial = {
    currentFeature: {
      id: uid('feature'),
      name: 'Untitled Feature',
      description: 'Custom dashboard feature',
      widgets: []
    },
    selectedWidgetId: null,
    features: [],
    attachedFeatureIds: []
  };

  var restored = loadPersisted();
  if (restored) {
    initial.currentFeature = restored.currentFeature || initial.currentFeature;
    initial.features = restored.features || [];
    initial.attachedFeatureIds = restored.attachedFeatureIds || [];
  }

  var state = initial;
  var listeners = [];

  function notify() {
    persist(state);
    listeners.forEach(function (fn) { fn(state); });
  }

  function getState() {
    return state;
  }

  function setState(next) {
    state = next;
    notify();
  }

  function updateCurrentFeature(mutator) {
    var next = clone(state);
    mutator(next.currentFeature);
    state = next;
    notify();
  }

  function addWidget(componentDef) {
    var widget = {
      id: uid('widget'),
      type: componentDef.type,
      config: clone(componentDef.defaults || {}),
      layout: {
        colSpan: (componentDef.defaults && componentDef.defaults.colSpan) || 4,
        rowSpan: (componentDef.defaults && componentDef.defaults.rowSpan) || 1
      }
    };
    updateCurrentFeature(function (feature) {
      feature.widgets.push(widget);
    });
    selectWidget(widget.id);
    return widget;
  }

  function removeWidget(widgetId) {
    updateCurrentFeature(function (feature) {
      feature.widgets = feature.widgets.filter(function (w) { return w.id !== widgetId; });
    });
    if (state.selectedWidgetId === widgetId) selectWidget(null);
  }

  function selectWidget(widgetId) {
    state = clone(state);
    state.selectedWidgetId = widgetId;
    notify();
  }

  function reorderWidgets(activeId, overId) {
    if (!activeId || !overId || activeId === overId) return;
    updateCurrentFeature(function (feature) {
      var from = feature.widgets.findIndex(function (w) { return w.id === activeId; });
      var to = feature.widgets.findIndex(function (w) { return w.id === overId; });
      if (from === -1 || to === -1) return;
      var moved = feature.widgets.splice(from, 1)[0];
      feature.widgets.splice(to, 0, moved);
    });
  }

  function updateWidget(widgetId, patch) {
    updateCurrentFeature(function (feature) {
      feature.widgets = feature.widgets.map(function (w) {
        if (w.id !== widgetId) return w;
        return {
          id: w.id,
          type: w.type,
          config: Object.assign({}, w.config, patch.config || {}),
          layout: Object.assign({}, w.layout, patch.layout || {})
        };
      });
    });
  }

  function renameCurrentFeature(name, description) {
    updateCurrentFeature(function (feature) {
      if (typeof name === 'string') feature.name = name;
      if (typeof description === 'string') feature.description = description;
    });
  }

  function saveCurrentFeature() {
    var next = clone(state);
    var current = clone(next.currentFeature);
    var idx = next.features.findIndex(function (f) { return f.id === current.id; });
    if (idx === -1) {
      next.features.unshift(current);
    } else {
      next.features[idx] = current;
    }
    setState(next);
  }

  function saveAsNew(name) {
    var next = clone(state);
    var feature = clone(next.currentFeature);
    feature.id = uid('feature');
    feature.name = name || (feature.name + ' Copy');
    next.currentFeature = feature;
    next.features.unshift(clone(feature));
    setState(next);
  }

  function loadFeature(featureId) {
    var match = state.features.find(function (f) { return f.id === featureId; });
    if (!match) return;
    var next = clone(state);
    next.currentFeature = clone(match);
    next.selectedWidgetId = null;
    setState(next);
  }

  function createBlankFeature() {
    var next = clone(state);
    next.currentFeature = {
      id: uid('feature'),
      name: 'Untitled Feature',
      description: 'Custom dashboard feature',
      widgets: []
    };
    next.selectedWidgetId = null;
    setState(next);
  }

  function attachFeature(featureId) {
    var next = clone(state);
    if (next.attachedFeatureIds.indexOf(featureId) === -1) {
      next.attachedFeatureIds.push(featureId);
    }
    setState(next);
  }

  function detachFeature(featureId) {
    var next = clone(state);
    next.attachedFeatureIds = next.attachedFeatureIds.filter(function (id) { return id !== featureId; });
    setState(next);
  }

  function getAttachedFeatures() {
    return state.features.filter(function (f) {
      return state.attachedFeatureIds.indexOf(f.id) > -1;
    });
  }

  function subscribe(listener) {
    listeners.push(listener);
    return function () {
      listeners = listeners.filter(function (fn) { return fn !== listener; });
    };
  }

  window.FeatureBuilderStore = {
    getState: getState,
    setState: setState,
    subscribe: subscribe,
    addWidget: addWidget,
    removeWidget: removeWidget,
    selectWidget: selectWidget,
    reorderWidgets: reorderWidgets,
    updateWidget: updateWidget,
    renameCurrentFeature: renameCurrentFeature,
    saveCurrentFeature: saveCurrentFeature,
    saveAsNew: saveAsNew,
    loadFeature: loadFeature,
    createBlankFeature: createBlankFeature,
    attachFeature: attachFeature,
    detachFeature: detachFeature,
    getAttachedFeatures: getAttachedFeatures
  };
})();