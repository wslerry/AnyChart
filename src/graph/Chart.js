//region Provide and require
goog.provide('anychart.graphModule.Chart');

goog.require('anychart.core.Chart');
goog.require('anychart.graphModule.elements.Edge');
goog.require('anychart.graphModule.elements.Group');
goog.require('anychart.graphModule.elements.Interactivity');
goog.require('anychart.graphModule.elements.Layout');
goog.require('anychart.graphModule.elements.Node');


//endregion


//region Constructor
//TODO jsdoc
/**
 * @constructor
 * @param {Object=} opt_data
 * @extends {anychart.core.Chart}
 * */
anychart.graphModule.Chart = function(opt_data) {
  anychart.graphModule.Chart.base(this, 'constructor');

  this.addThemes('graph');

  this.bindHandlersToComponent(this,
    this.handleMouseOverAndMove,
    this.handleMouseOut,
    this.handleMouseClick,
    null,
    function(mouseEvent) {
      // console.log(mouseEvent);
    },
    this.handleMouseDown);


  /**
   * @type {Array.<acgraph.vector.Path>}
   * @private
   * @const
   * */
  this.pathes_ = [];

  /**
   * @type {Object.<string, anychart.graphModule.Chart.Node>}
   * @private
   * */
  this.nodes_ = {}; //todo should use Map here
  this.groups_ = {};

  /**
   * @type {Object.<string, anychart.graphModule.Chart.Edge>}
   * @private
   * */
  this.edges_ = {};

  this.shapes = {};


  this.xDifference = 0;
  this.yDifference = 0;
  /**
   * @type {anychart.graphModule.elements.Interactivity}
   * @private
   * */
  this.interactivity_;


  /**
   * Layer for edge's labels
   * */
  this.edgesLabelsLayer = this.edges().getLabelsLayer();
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, []);
  this.data(opt_data);

  this.mouseWheelHandler_;
};
goog.inherits(anychart.graphModule.Chart, anychart.core.Chart);


//todo
/**
 * @typedef {{
 *  nodeId: (string|number),
 *  groupId: (string|number),
 *  settings: Object,
 *  dataRow: number,
 *  position: {
 *    x:number,
 *    y:number
 *  },
 *  currentState: anychart.SettingsState,
 *  domElement: anychart.vector.Path,
 *  textElement: anychart.core.ui.OptimizedText,
 *  labelsSettings: {
 *    position: {
 *      x: number,
 *      y: number
 *    }
 *  },
 *  states: {
 *    normal: Object,
 *    hovered: Object,
 *    selected: Object
 *  }
 *  connectedEdges: Array.<string>,
 *  value: string
 * }}
 * */
anychart.graphModule.Chart.Node;


/**
 * @typedef {{
 *  id: (string|number),
 *  dataRow: number,
 *  from: string,
 *  to: string,
 *  text: string,
 *  labelsSettings: {
 *    position: {
 *      x: number,
 *      y: number
 *    },
 *    rotation: number
 *  },
 *  states: {
 *    normal: Object,
 *    hovered: Object,
 *    selected: Object
 *  }
 *  currentState: anychart.SettingsState
 *  domElement: anychart.vector.Path,
 *  textElement: anychart.core.ui.OptimizedText
 * }}
 * */
anychart.graphModule.Chart.Edge;


//endregion
//region Properties
/**
 * Supported signals.
 * @type {number}
 */
anychart.graphModule.Chart.prototype.SUPPORTED_SIGNALS = anychart.core.Chart.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.graphModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
  anychart.ConsistencyState.APPEARANCE;


/**
 * Z-index for graph chart.
 * @type {number}
 * */
anychart.graphModule.Chart.Z_INDEX = 30;


/**
 * Properties that should be defined in class prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.graphModule.Chart.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, []);

  return map;
})();
anychart.core.settings.populate(anychart.graphModule.Chart, anychart.graphModule.Chart.OWN_DESCRIPTORS);


/**
 * Enum for elements
 * @enum {string}
 * */
anychart.graphModule.Chart.Element = {
  NODE: 'node',
  GROUP: 'group',
  EDGE: 'edge'
};


/**
 * @param {Object} coordinates
 * */
anychart.graphModule.Chart.prototype.setCoordinatesForNodes = function(coordinates) {
  for (var i = 0, length = coordinates.length; i < length; i++) {
    var coord = coordinates[i];
    this.nodes_[coord.nodeId].position = coord.position;
  }
};


//endregion
//region Infrastructure
/** @inheritDoc */
anychart.graphModule.Chart.prototype.getType = function() {
  return anychart.enums.ChartTypes.GRAPH;
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.isNoData = function() {
  return !this.data_ || !this.data_['nodes'] || (!this.data_['nodes'].getRowsCount());
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.getAllSeries = function() {
  return [];
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.getDataHolders = function() {
  return [this];
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.toCsv = function(opt_chartDataExportMode, opt_csvSettings) {

};
//endregion


//region Tooltip data
/**
 * Creates context provider for tooltip.
 * @param {anychart.treeDataModule.Tree.DataItem} element Object with data for tooltip.
 * @return {anychart.format.Context}
 */
anychart.graphModule.Chart.prototype.createContextProvider = function(element) {
  // if (!this.contextProvider_)
  //   this.contextProvider_ = new anychart.format.Context();
  //
  // var values = {};
  //
  // if (element) {
  //   values['value'] = {value: element.get('value'), type: anychart.enums.TokenType.STRING};
  //   values['weight'] = {value: element.meta('weight'), type: anychart.enums.TokenType.NUMBER};
  // }
  // this.contextProvider_.dataSource(element);
  // return /** @type {anychart.format.Context} */ (this.contextProvider_.propagate(values));
};


//endregion
//region Event handlers and interactivity


/**
 * Mouse click internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 */
anychart.graphModule.Chart.prototype.handleMouseClick = function(event) {
  if (event['button'] != acgraph.events.BrowserEvent.MouseButton.LEFT) return;
  var tag = /**@type {anychart.graphModule.Chart.DOMdata}*/(event['domTarget'].tag);
  if (tag && tag.type == anychart.graphModule.Chart.Element.NODE) {
    // console.log('clc', event);
  }
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.handleMouseOverAndMove = function(event) {
  var domTarget = event['domTarget'];
  var tag = domTarget.tag;
  if (tag) {
    if (tag.type == anychart.graphModule.Chart.Element.NODE) {
      var node = this.getNodesMap()[tag.nodeId];
      node.currentState = anychart.SettingsState.HOVERED;
      this.updatePathShape(node, anychart.SettingsState.HOVERED);
      this.updateNodeColors(node, anychart.SettingsState.HOVERED);
      this.nodes().applyLabelStyle(node);
      this.nodes().updateNodeLabelPosition(node);
    } else if (tag.type == anychart.graphModule.Chart.Element.EDGE) {
    }
  }
};


/**
 * Update path data of each edge connected to node.
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.Chart.prototype.updateEdgesConnectedToNode = function(node) {
  for (var i = 0, length = node.connectedEdges.length; i < length; i++) {
    var edge = this.getEdgesMap()[node.connectedEdges[i]];

    this.edges().calculateLabelPositionForEdge(edge);
    var from = this.getNodesMap()[edge.from].position;
    var to = this.getNodesMap()[edge.to].position;
    var path = edge.domElement;
    path.clear();
    path.moveTo(from.x, from.y)
      .lineTo(to.x, to.y);
  }
};


/**
 * Set position for dom element depend on node size.
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.Chart.prototype.updateNodeDOMElementPosition = function(node) {
  var x = node.position.x;
  var y = node.position.y;
  var size = this.resolveSettingsForNode(node, 'size');
  x -= size / 2;
  y -= size / 2;
  node.domElement.setPosition(x, y);
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.handleMouseDown = function(event) {
  var domTarget = event['domTarget'];
  var tag = domTarget.tag;

  if (this.interactivity().getOption('enabled')) {
    if (tag && tag.type == anychart.graphModule.Chart.Element.NODE && this.interactivity().getOption('node')) {
      var node = this.nodes_[tag.nodeId];
      this.nodeDragInteractivity(node, domTarget, event);
    } else if (!tag) {
      this.layerDragInteractivity(domTarget, event);
    }
  }
};


/**
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.Chart.prototype.setNodePosition = function(node, dx, dy) {
  node.position.x += dx; //Coordinates -> data?
  node.position.y += dy;

  node.labelsSettings.position.x += dx;
  node.labelsSettings.position.y += dy;
};

anychart.graphModule.Chart.prototype.getXWithTranslate = function(x) {
  return -this.xDifference + x;
};

anychart.graphModule.Chart.prototype.getYWithTranslate = function(y) {
  return -this.yDifference + y;
};


/**
 *
 * */
anychart.graphModule.Chart.prototype.nodeDragInteractivity = function(node, domTarget, event) {
  var dragger = new goog.fx.Dragger(domTarget['domElement']());
  var startX, startY;

  dragger.listen(goog.fx.Dragger.EventType.START, /** @this {anychart.graphModule.Chart}*/ function(e) {
    startX = this.getXWithTranslate(event.clientX);
    startY = this.getYWithTranslate(event.clientY);
  }, false, this);

  dragger.listen(goog.fx.Dragger.EventType.DRAG, /** @this {anychart.graphModule.Chart}*/ function(e) {
    this.edges().getLabelsLayer().parent(null);
    var x = this.getXWithTranslate(e.clientX);
    var y = this.getYWithTranslate(e.clientY);

    var dx = x - startX;
    var dy = y - startY;
    startX = x;
    startY = y;

    this.setNodePosition(node, dx, dy);
    this.updateNodeDOMElementPosition(node);
    this.updateEdgesConnectedToNode(node);
    this.nodes().updateNodeLabelPosition(node);

  }, false, this);

  dragger.listen(goog.fx.Dragger.EventType.END, /** @this {anychart.graphModule.Chart}*/ function(e) {
    if (this.interactivity().getOption('magnetize')) {
      this.nodes().stickNode(node);
      this.updateNodeDOMElementPosition(node);
      this.updateEdgesConnectedToNode(node);
    }
    this.nodes().updateNodeLabelPosition(node);
    this.edges().getLabelsLayer().parent(this.rootLayer);
    dragger.dispose();
  }, false, this);

  dragger.startDrag(event['getOriginalEvent']());
};


/**
 *
 * */
anychart.graphModule.Chart.prototype.layerDragInteractivity = function(domTarget, event) {
  var domElement = new goog.fx.Dragger(domTarget['domElement']());
  var startX = 0, startY = 0;
  domElement.listen(goog.fx.Dragger.EventType.START, function(e) {
    startX = event.clientX;
    startY = event.clientY;
  }, false, this);
  domElement.listen(goog.fx.Dragger.EventType.DRAG, function(e) {
    var x = e.clientX;
    var y = e.clientY;
    var dx = x - startX;
    var dy = y - startY;
    startX = x;
    startY = y;
    this.xDifference += dx;
    this.yDifference += dy;

    this.rootLayer.translate(dx, dy);
  }, false, this);
  domElement.listen(goog.fx.Dragger.EventType.END, /** @this {anychart.graphModule.Chart}*/ function(e) {
    domElement.dispose();
  }, false, this);
  domElement.startDrag(event['getOriginalEvent']());
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.handleMouseOut = function(event) {
  var domTarget = event['domTarget'];
  var tag = domTarget.tag;
  if (tag) {
    if (tag.type == anychart.graphModule.Chart.Element.NODE) {
      var node = this.getNodesMap()[tag.nodeId];
      node.currentState = anychart.SettingsState.NORMAL;
      this.updatePathShape(node, anychart.SettingsState.NORMAL);
      this.updateNodeColors(node, anychart.SettingsState.NORMAL);
      this.nodes().applyLabelStyle(node);
      this.nodes().updateNodeLabelPosition(node);
    } else if (tag.type == anychart.graphModule.Chart.Element.EDGE) {
      console.log('in edge');
    }
  }
  // this.tooltip().hide();
};


//endregion
//region Data manipulation
anychart.graphModule.Chart.prototype.proceedRawData = function(data) {
  var connectors = data['connectors'],
    nodes = data['nodes'];

  var connectorsDataSet = anychart.data.set(connectors);
  var nodesDataSet = anychart.data.set(nodes);
  return {'nodes': nodesDataSet, 'connectors': connectorsDataSet};
};

/**
 * @param {Object} node
 * */
anychart.graphModule.Chart.prototype.proceedNode_ = function(node, i) {
  var nodeId = node['id'];
  if (goog.isDef(nodeId)) {
    nodeId = nodeId.toString();
  } else {
    nodeId = 'node_' + i;
    node['id'] = nodeId;
  }
  if (!this.nodes_[nodeId]) {
    /**
     * @type {anychart.graphModule.Chart.Node}
     * */
    var nodeObj;
    nodeObj = this.nodes_[nodeId] = {};
    nodeObj.nodeId = nodeId;
    nodeObj.dataRow = i;
    nodeObj.settings = {};
    nodeObj.connectedEdges = [];
    nodeObj.labelsSettings = {};
    nodeObj.labelsSettings.position = {x: 0, y: 0};
    nodeObj.position = {
      x: node['x'],
      y: node['y']
    };
    nodeObj.states = {};
    if (node['normal']) {
      nodeObj.states.normal = node['normal'];
    }
    if (node['hovered']) {
      nodeObj.states.hovered = node['hovered'];
    }
    if (node['selected']) {
      nodeObj.states.selected = node['selected'];
    }
  }

  var groupId = node['group'];
  if (goog.isDefAndNotNull(groupId)) {
    if (!this.groups_[groupId]) {
      this.groups_[groupId] = {};
    }
    this.groups_[groupId][nodeId] = node;
    this.nodes_[nodeId].groupId = this.groups_[groupId];
  }
};


/**
 *
 * */
anychart.graphModule.Chart.prototype.proceedEdge_ = function(edgeRow, i) {
  var from = edgeRow['from'];
  var to = edgeRow['to'];
  var edgeId = edgeRow['id'];
  var text = edgeRow['text'] || edgeId;

  if (goog.isDef(edgeId)) {
    edgeId = edgeId.toString();
  } else {
    edgeId = anychart.graphModule.Chart.Element.EDGE + '_' + i;
  }

  this.edges_[edgeId] = {};
  this.edges_[edgeId].id = edgeId;
  this.edges_[edgeId].text = text;
  this.edges_[edgeId].from = from;
  this.edges_[edgeId].to = to;
  this.edges_[edgeId].states = {};
  this.edges_[edgeId].labelsSettings = {
    position: {x: 0, y: 0},
    rotation: 0
  };

  if (edgeRow['normal']) {
    this.edges_[edgeId].states.normal = edgeRow['normal'];
  }
  if (edgeRow['hovered']) {
    this.edges_[edgeId].states.hovered = edgeRow['hovered'];
  }
  if (edgeRow['selected']) {
    this.edges_[edgeId].states.selected = edgeRow['selected'];
  }

  if (!this.nodes_[from]) {
    this.nodes_[from] = {};
  }
  if (!this.nodes_[to]) {
    this.nodes_[to] = {};
  }
};


anychart.graphModule.Chart.prototype.proceedData = function(data) {
  var edges = /** @type {anychart.data.Set} */(data['edges']),
    nodes = /** @type {anychart.data.Set} */(data['nodes']),
    length,
    i;

  for (i = 0, length = nodes.getRowsCount(); i < length; i++) {
    this.proceedNode_(nodes.getRow(i), i);
  }

  for (i = 0, length = edges.getRowsCount(); i < length; i++) {
    this.proceedEdge_(edges.getRow(i), i);
  }
};


anychart.graphModule.Chart.prototype.nodesDataInvalidated_ = function(e) {
  console.log('nodes', e);
};

anychart.graphModule.Chart.prototype.edgesDataInvalidated_ = function(e) {
  // console.log('edges', e);
};

/**
 * Get/set data for chart.
 * @param {Object=} opt_value
 * @return {(Object | anychart.graphModule.Chart)}
 * */
anychart.graphModule.Chart.prototype.data = function(opt_value) {

  if (goog.isDef(opt_value)) {
    var data = opt_value;
    var dataElement = data['nodes'];
    if (this.rawDataForNodes != dataElement) {
      this.rawDataForNodes = dataElement;
      if (this.data_ && this.data_['nodes']) {
        this.data_['nodes'].unlistenSignals(this.nodesDataInvalidated_);
        goog.dispose(this.data_['nodes']);
      }
      if (anychart.utils.instanceOf(dataElement, anychart.data.Set)) {
        data['nodes'] = dataElement.mapAs();
      } else if (anychart.utils.instanceOf(dataElement, anychart.data.View)) {
        data['nodes'] = dataElement.derive();
      } else {
        data['nodes'] = anychart.data.set(dataElement).mapAs();
      }
      data['nodes'].listenSignals(this.nodesDataInvalidated_);
    }

    dataElement = data['edges'];
    if (this.rawDataForEdges != dataElement) {
      this.rawDataForEdges = dataElement;
      if (this.data_ && this.data_['edges']) {
        this.data_['edges'].unlistenSignals(this.edgesDataInvalidated_);
        goog.dispose(this.data_['edges']);
      }
      if (anychart.utils.instanceOf(dataElement, anychart.data.Set)) {
        data['edges'] = dataElement.mapAs();
      } else if (anychart.utils.instanceOf(dataElement, anychart.data.View)) {
        data['edges'] = dataElement.derive();
      } else {
        data['edges'] = anychart.data.set(dataElement).mapAs();
      }
      data['edges'].listenSignals(this.edgesDataInvalidated_, this);
    }

    this.proceedData(data);
    this.data_ = data;
    return this;
  }
  return this.data_;
};

//endregion


//todo jsdoc

//region Elements
/**
 * @param {Object=} opt_value
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Node)}
 * */
anychart.graphModule.Chart.prototype.nodes = function(opt_value) {
  if (!this.nds_) {
    this.nds_ = new anychart.graphModule.elements.Node(this);
    this.setupCreated('nodes', this.nds_);
    this.nds_.setupElements();
  }
  if (opt_value) {
    this.nds_.setup(opt_value);
    return this;
  }
  return this.nds_;
};


/**
 * @param {Object=} opt_value
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Group)}
 * */
anychart.graphModule.Chart.prototype.groups = function(opt_value) {
  if (!this.grps_) {
    this.grps_ = new anychart.graphModule.elements.Group(this);
  }
  if (opt_value) {

    return this;
  }
  return this.grps_;
};


/**
 * @param {Object=} opt_value
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Layout)}
 * */
anychart.graphModule.Chart.prototype.layout = function(opt_value) {
  if (!this.layout_) {
    this.layout_ = new anychart.graphModule.elements.Layout(this);
    this.setupCreated('layout', this.layout_);
  }
  if (opt_value) {
    return this;
  }
  return this.layout_;
};


/**
 * @param {Object=} opt_value
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Edge)}
 * */
anychart.graphModule.Chart.prototype.edges = function(opt_value) {
  if (!this.edge_) {
    this.edge_ = new anychart.graphModule.elements.Edge(this);
    this.setupCreated('edges', this.edge_);
    this.edge_.setupElements();
  }
  if (opt_value) {
    return this;
  }
  return this.edge_;
};


/**
 * @param {Object=} opt_value - Settings object.
 * @return {(anychart.graphModule.Chart|anychart.core.ui.LabelsSettings)} - Current value or itself for method chaining.
 */
anychart.graphModule.Chart.prototype.labels = function(opt_value) {
  if (!this.labelsSettings_) {
    this.labelsSettings_ = new anychart.core.ui.LabelsSettings();
    this.setupCreated('labels', this.labelsSettings_);

    //todo
    // this.labelsSettings_.listenSignals(this.labelsSettingsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.labelsSettings_.setup(opt_value);
    // this.invalidate();
    return this;
  }

  return this.labelsSettings_;
};


/**
 * @return {Object.<string, anychart.graphModule.Chart.Edge>}
 * */
anychart.graphModule.Chart.prototype.getEdgesMap = function() {
  return this.edges_;
};


/**
 * @return {Object.<string, anychart.graphModule.Chart.Node>}
 * */
anychart.graphModule.Chart.prototype.getNodesMap = function() {
  return this.nodes_;
};


/**
 * @param {anychart.graphModule.Chart.Edge} edge
 * @param {number} state
 * */
anychart.graphModule.Chart.prototype.updateEdgeColor = function(edge, state) {

};


//ednregion

/**
 * @param {Object=} opt_value
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Interactivity)}
 * */
anychart.graphModule.Chart.prototype.interactivity = function(opt_value) {
  if (!this.interactivity_) {
    this.interactivity_ = new anychart.graphModule.elements.Interactivity();
    this.setupCreated('interactivity', this.interactivity_);
  }
  if (opt_value) {
    return this;
  }
  return this.interactivity_;
};


/**
 * @param {anychart.graphModule.Chart.Element} type
 * @param {string} id
 * @return {boolean}
 * */
anychart.graphModule.Chart.prototype.hasInstance = function(type, id) {
  var result = false;

  switch (type) {
    case anychart.graphModule.Chart.Element.NODE:
      result = id in this.nodesInstances;
      break;
    case anychart.graphModule.Chart.Element.GROUP:
      result = id in this.groupsInstances;
      break;
  }
  return result;
};


/**
 * Create node instance.
 * @param {anychart.graphModule.Chart.Element} type
 * @param {string} elementId
 * @return {anychart.graphModule.elements.Node} instance element.
 * @private
 * */
anychart.graphModule.Chart.prototype.createElementInstance_ = function(type, elementId) {
  var element;
  switch (type) {
    case anychart.graphModule.Chart.Element.NODE:
      element = new anychart.graphModule.elements.Node(this, elementId);
      this.nodesInstances[elementId] = element;
      this.nodes_[elementId].instance = element;
      break;
    case anychart.graphModule.Chart.Element.GROUP:
      element = new anychart.graphModule.elements.Group(this);
      this.groupsInstances[elementId] = element;
      this.groups_[elementId].instance = element;
      break;
  }

  //todo setup element here

  return element;
};


/**
 * Create node instance.
 * @param {anychart.graphModule.Chart.Element} type
 * @param {string} elementId
 * @return {?(anychart.graphModule.elements.Node|anychart.graphModule.elements.Group)} instance of element.
 * */
anychart.graphModule.Chart.prototype.getElementInstance = function(type, elementId) {
  var rawElementsContainer,
    containerWithInstances;

  switch (type) {
    case anychart.graphModule.Chart.Element.NODE:
      rawElementsContainer = this.nodes_;
      containerWithInstances = this.nodesInstances;
      break;
    case anychart.graphModule.Chart.Element.GROUP:
      rawElementsContainer = this.groups_;
      containerWithInstances = this.groupsInstances;
      break;
  }

  if (elementId in rawElementsContainer) {
    var element;
    if (elementId in containerWithInstances) {
      element = containerWithInstances[elementId];
    } else {
      element = this.createElementInstance_(type, elementId);
    }
    return element;
  }
  return null;
};


/**
 *
 * */
anychart.graphModule.Chart.prototype.resolveSettingsForNode = function(node, setting) {
  var state = anychart.utils.pointStateToName(node.currentState);

  var defaultNodeSetting = this.nodes()[state]()[setting]();//
  var defaultGroupSetting = this.groups()[state]()[setting]();
  var settingForSpecificNode,
    settingForSpecificGroup;
  // if (this.hasInstance(anychart.graphModule.Chart.Element.NODE, node.id)) {
  //   settingForSpecificNode = this.getElementInstance(anychart.graphModule.Chart.Element.NODE, node.id)[state]()[setting]();
  // }
  // if (this.hasInstance(anychart.graphModule.Chart.Element.GROUP, node.groupId)) {
  //   ingForSpecificGroup = this.getElementInstance(anychart.graphModule.Chart.Element.GROUP, node.group)[state]()[setting]();
  // }    sett
  var result = defaultNodeSetting;
  result = goog.isDef(defaultGroupSetting) ? defaultGroupSetting : result;
  result = goog.isDef(settingForSpecificGroup) ? settingForSpecificGroup : result;
  result = goog.isDef(settingForSpecificNode) ? settingForSpecificNode : result;
  return result;
};


//Todo custom shape
/**
 * @param {anychart.graphModule.Chart.Node} node
 * @return {function(!acgraph.vector.Path, number, number, number, number=):!acgraph.vector.Path} Marker drawer.
 * */
anychart.graphModule.Chart.prototype.getShape = function(node, state) {
  var type = this.nodes().getShapeType(node, state);
  return anychart.utils.getMarkerDrawer(type);
};

anychart.graphModule.Chart.prototype.getDataOption = function(objectType, row, option) {
  var nodes = this.data()[objectType];
  var dataRow = nodes.getRow(row);
  var option = dataRow[option];
  return option;
};

/**
 * Label position provider
 * */
anychart.graphModule.Chart.prototype.labelPositionProvider = function(node) {

};


/**
 * Update path data for new state.
 * @param {anychart.graphModule.Chart.Node} node
 * @param {anychart.SettingsState} nodeState
 * */
anychart.graphModule.Chart.prototype.updatePathShape = function(node, nodeState) {

  var size = this.resolveSettingsForNode(node, 'size', nodeState);
  var path = node.domElement;
  path.clear();
  if (path.domElement()) {
    path.domElement().removeAttribute('transform');
  }
  var x = node.position.x;
  var y = node.position.y;
  var radius = size / 2;

  var drawer = this.getShape(node, nodeState);
  drawer(path, x, y, radius);
};


/**
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.Chart.prototype.updateNodeColors = function(node, nodeState) {
  var fill = this.resolveSettingsForNode(node, 'fill', nodeState);//enum here
  var stroke = this.resolveSettingsForNode(node, 'stroke', nodeState);//enum here

  node.domElement.fill(fill);
  node.domElement.stroke(stroke);

};


/**
 * @type {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.Chart.prototype.drawNode = function(node) {
  var domElement = this.rootLayer.path();

  domElement.tag = {};
  domElement.tag.type = anychart.graphModule.Chart.Element.NODE;
  domElement.tag.nodeId = node.nodeId;

  node.domElement = domElement;
  // console.log(domElement);
  // this.rootLayer.circle(node.x, node.y, 5);
};


/**
 * */
anychart.graphModule.Chart.prototype.drawNodes = function() {
  for (var node in this.nodes_) {
    var node = this.nodes_[node];
    this.drawNode(node);
    this.updatePathShape(node, anychart.SettingsState.NORMAL);
    this.updateNodeColors(node, anychart.SettingsState.NORMAL);
    node.currentState = 0;
  }
};


//todo jsdoc. Edge for self connected node. Labels.


anychart.graphModule.Chart.prototype.drawEdge = function(edge) {
  var path = this.rootLayer.path();
  var from = this.nodes_[edge.from];
  var to = this.nodes_[edge.to];

  from.connectedEdges.push(edge.id);
  to.connectedEdges.push(edge.id);
  edge.domElement = path;
  edge.domElement.tag = {};
  edge.domElement.tag.type = anychart.graphModule.Chart.Element.EDGE;


  path.moveTo(from.position.x, from.position.y)
    .lineTo(to.position.x, to.position.y);
};


//
/**
 * Draw all edges.
 * */
anychart.graphModule.Chart.prototype.drawEdges = function() {
  for (var i in this.edges_) {
    var edge = this.edges_[i];
    this.drawEdge(edge);
    edge.currentState = 0; //todo state here
  }
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.drawContent = function(bounds) {
  if (this.isConsistent())
    return;

  if (!this.rootLayer) {
    this.rootLayer = this.rootElement.layer();
    // console.log(this.rootLayer);
    this.rootLayer.zIndex(anychart.graphModule.Chart.Z_INDEX);
  }
  // if(!this.mouseWheelHandler_){
  //   // console.log(this.container().getStage());
  //   this.mouseWheelHandler_ = new acgraph.events.MouseWheelHandler(window.document.querySelector('#id_1'));
  //   // console.log(goog.events.WheelEvent.EventType.WHEEL);
  //   this.mouseWheelHandler_.listen(goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, function(e) {
  //     // console.log('wheel');
  //   });
  // }
  this.rootLayer.removeChildren();
  var coords = this.layout().getCoordinatesForCurrentLayout();
  this.setCoordinatesForNodes(coords);
  this.drawEdges();
  this.drawNodes();
  for (var edge in this.edges_) {
    edge = this.edges_[edge];
    this.edges().calculateLabelPositionForEdge(edge);
    this.updateEdgeColor(edge, 0);//todo
    // this.rootLayer.circle(this.edges_[edge].labelsSettings.position.x, this.edges_[edge].labelsSettings.position.y, 1);
  }


  this.edges().provideMeasurements();
  this.edges().applyLabelsStyle();
  this.edges().drawLabels();
  this.edges().getLabelsLayer().parent(this.rootLayer);

  this.nodes().provideMeasurements();
  this.nodes().applyLabelsStyle();
  this.nodes().drawLabels();
  this.nodes().getLabelsLayer().parent(this.rootLayer);


  this.nodes().setInitialLabelsPosition();
  this.nodes().updateNodeLabelsPosition();

  // anychart.measuriator.measure();
};


//endregion
//region Serialize, setup, dispose
/** @inheritDoc */
anychart.graphModule.Chart.prototype.serialize = function() {
  var json = anychart.graphModule.Chart.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.graphModule.Chart.OWN_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.graphModule.Chart.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.graphModule.Chart.OWN_DESCRIPTORS, config, opt_default);
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.disposeInternal = function() {
  anychart.graphModule.Chart.base(this, 'disposeInternal');
  //TODO dispose
  goog.disposeAll();
};


//endregion
//region Exports
(function() {
  var proto = anychart.graphModule.Chart.prototype;
  proto['nodes'] = proto.nodes;
  proto['edges'] = proto.edges;
  proto['layout'] = proto.layout;
  proto['groups'] = proto.groups;
  proto['interactivity'] = proto.interactivity;
})();


//endregion
