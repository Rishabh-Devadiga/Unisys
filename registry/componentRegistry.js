(function () {
  var COMPONENT_REGISTRY = {
    version: '2026-03-20',
    generatedFrom: 'erp-dashboard-audit',
    categories: {
      layout: 'Sections, containers, and spacing primitives.',
      data: 'Tables, KPIs, counters, searchable data widgets.',
      visualization: 'Bar, line, pie, and area style chart blocks.',
      forms: 'Input controls and grouped forms.',
      actions: 'Buttons, notifications, and action triggers.',
      io: 'Upload and export utilities.',
      discovery: 'Search and filters for records.'
    },
    components: [
      { type: 'section', label: 'Section Container', category: 'layout', icon: '[]', supports: ['title', 'description', 'padding', 'background'], defaults: { title: 'New Section', description: 'Section description', colSpan: 12, rowSpan: 1 } },
      { type: 'split_container', label: 'Split Container', category: 'layout', icon: '||', supports: ['title', 'columns', 'gap'], defaults: { title: 'Two Column Layout', columns: 2, colSpan: 12, rowSpan: 2 } },

      { type: 'kpi_card', label: 'KPI Card', category: 'data', icon: 'KPI', supports: ['title', 'value', 'subtitle', 'trend'], defaults: { title: 'Metric', value: '128', subtitle: 'This month', trend: 'up', colSpan: 3, rowSpan: 1 } },
      { type: 'summary_card', label: 'Summary Card', category: 'data', icon: 'SUM', supports: ['title', 'content'], defaults: { title: 'Summary', content: 'Short summary text', colSpan: 4, rowSpan: 1 } },
      { type: 'counter', label: 'Counter Widget', category: 'data', icon: '#', supports: ['label', 'value', 'prefix', 'suffix'], defaults: { label: 'Counter', value: 0, prefix: '', suffix: '', colSpan: 2, rowSpan: 1 } },
      { type: 'table', label: 'Data Table', category: 'data', icon: 'TBL', supports: ['columns', 'rows', 'sortable', 'filterable', 'sourceType'], defaults: { title: 'Data Table', columns: ['Name', 'Status', 'Score'], rows: [['Riya', 'Active', '82'], ['Aman', 'Pending', '75']], sortable: true, filterable: true, colSpan: 8, rowSpan: 2 } },

      { type: 'bar_chart', label: 'Bar Chart', category: 'visualization', icon: 'BAR', supports: ['labels', 'series', 'colors', 'sourceType'], defaults: { title: 'Bar Chart', labels: ['Jan', 'Feb', 'Mar'], series: [32, 44, 61], color: '#6d8bff', colSpan: 6, rowSpan: 2 } },
      { type: 'line_chart', label: 'Line Chart', category: 'visualization', icon: 'LINE', supports: ['labels', 'series', 'sourceType'], defaults: { title: 'Line Chart', labels: ['W1', 'W2', 'W3', 'W4'], series: [12, 30, 22, 41], color: '#34d399', colSpan: 6, rowSpan: 2 } },
      { type: 'pie_chart', label: 'Pie Chart', category: 'visualization', icon: 'PIE', supports: ['segments', 'sourceType'], defaults: { title: 'Pie Chart', segments: [{ label: 'A', value: 45, color: '#6d8bff' }, { label: 'B', value: 30, color: '#34d399' }, { label: 'C', value: 25, color: '#f59e0b' }], colSpan: 4, rowSpan: 2 } },
      { type: 'area_chart', label: 'Area Chart', category: 'visualization', icon: 'AREA', supports: ['labels', 'series'], defaults: { title: 'Area Chart', labels: ['Q1', 'Q2', 'Q3', 'Q4'], series: [22, 34, 29, 46], color: '#9b7bff', colSpan: 6, rowSpan: 2 } },

      { type: 'form_input', label: 'Text Input', category: 'forms', icon: 'IN', supports: ['label', 'placeholder', 'required'], defaults: { label: 'Input Label', placeholder: 'Enter value', required: false, colSpan: 4, rowSpan: 1 } },
      { type: 'form_select', label: 'Select', category: 'forms', icon: 'SEL', supports: ['label', 'options', 'required'], defaults: { label: 'Select Option', options: ['Option 1', 'Option 2'], required: false, colSpan: 4, rowSpan: 1 } },
      { type: 'form_checkbox', label: 'Checkbox', category: 'forms', icon: 'CHK', supports: ['label', 'checked'], defaults: { label: 'Accept terms', checked: false, colSpan: 3, rowSpan: 1 } },
      { type: 'form_date', label: 'Date Picker', category: 'forms', icon: 'DATE', supports: ['label', 'required'], defaults: { label: 'Date', required: false, colSpan: 3, rowSpan: 1 } },
      { type: 'form_textarea', label: 'Text Area', category: 'forms', icon: 'TXT', supports: ['label', 'placeholder'], defaults: { label: 'Notes', placeholder: 'Enter notes', colSpan: 6, rowSpan: 2 } },

      { type: 'action_button', label: 'Action Button', category: 'actions', icon: 'BTN', supports: ['label', 'variant', 'actionType', 'actionPayload'], defaults: { label: 'Run Action', variant: 'primary', actionType: 'toast', actionPayload: 'Action executed', colSpan: 3, rowSpan: 1 } },
      { type: 'alert', label: 'Alert', category: 'actions', icon: 'ALT', supports: ['message', 'severity'], defaults: { message: 'This is an informational alert', severity: 'info', colSpan: 6, rowSpan: 1 } },
      { type: 'notification_feed', label: 'Notification Feed', category: 'actions', icon: 'NTF', supports: ['items'], defaults: { title: 'Notifications', items: ['2 approvals pending', 'New admission submitted'], colSpan: 4, rowSpan: 2 } },

      { type: 'file_upload', label: 'File Upload', category: 'io', icon: 'UP', supports: ['label', 'accept'], defaults: { label: 'Upload file', accept: '.csv,.xlsx,.pdf', colSpan: 4, rowSpan: 1 } },
      { type: 'export_buttons', label: 'Export Controls', category: 'io', icon: 'EXP', supports: ['fileName', 'exportCsv', 'exportJson', 'exportPdf'], defaults: { title: 'Export Data', fileName: 'report', exportCsv: true, exportJson: true, exportPdf: true, colSpan: 4, rowSpan: 1 } },

      { type: 'search_bar', label: 'Search Bar', category: 'discovery', icon: 'SRCH', supports: ['placeholder'], defaults: { placeholder: 'Search records...', colSpan: 6, rowSpan: 1 } },
      { type: 'filters', label: 'Filter Group', category: 'discovery', icon: 'FLT', supports: ['options'], defaults: { title: 'Filters', options: ['Active', 'Pending', 'Closed'], colSpan: 6, rowSpan: 1 } }
    ],
    existingCustomModules: [
      'Admissions CRM', 'Student Registry', 'Academic Planning', 'Attendance Management', 'Examinations',
      'Faculty Management', 'Finance & Fees', 'HR & Payroll', 'Library', 'Hostel Management', 'Transport Management',
      'Placements & Career', 'Research', 'Facilities', 'Inventory', 'Procurement', 'Service Desk',
      'Communications', 'Compliance & Accreditation', 'Integration Hub', 'Analytics & KPIs',
      'Attainment Calculator', 'ERP Coverage', 'Role-based Admin/Principal/HOD/Faculty custom sections'
    ]
  };

  COMPONENT_REGISTRY.byCategory = function byCategory() {
    var grouped = {};
    COMPONENT_REGISTRY.components.forEach(function (item) {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });
    return grouped;
  };

  COMPONENT_REGISTRY.get = function get(type) {
    return COMPONENT_REGISTRY.components.find(function (c) { return c.type === type; }) || null;
  };

  window.ComponentRegistry = COMPONENT_REGISTRY;
})();