//region Provide and require
goog.provide('anychart.graphModule.Chart');

goog.require('anychart.core.Chart');
goog.require('anychart.core.ui.LabelsSettings');
goog.require('anychart.graphModule.elements.Edge');
goog.require('anychart.graphModule.elements.Group');
goog.require('anychart.graphModule.elements.Interactivity');
goog.require('anychart.graphModule.elements.Layout');
goog.require('anychart.graphModule.elements.Node');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.fx.Dragger');
goog.require('goog.structs.Set');


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
    null,
    this.handleMouseDown);

  /**
   * @type {Object.<string, anychart.graphModule.Chart.Node>}
   * @private
   * */
  this.nodes_ = {}; //todo should use Map here

  /**
   * @type {Object.<string, ?anychart.graphModule.elements.Group>}
   * @private
   * */
  this.groups_ = {};


  /**
   * @type {Object.<number, Array.<string>>}
   * @private
   * */
  this.subGraphGroups_ = {};


  /**
   * @type {?Array.<anychart.graphModule.Chart.Node>}
   * @private
   * */
  this.nodesArray_ = null;

  /**
   * @type {?Array.<anychart.graphModule.Chart.Node>}
   * @private
   * */
  this.edgesArray_ = null;

  /**
   * @type {Object.<string, anychart.graphModule.Chart.Edge>}
   * @private
   * */
  this.edges_ = {};

  /**
   * Interactivity settings object.
   * @type {?anychart.graphModule.elements.Interactivity}
   * @private
   * */
  this.interactivity_ = null;


  /**
   * Layer for edge's labels
   * */
  this.edgesLabelsLayer = this.edges().getLabelsLayer();

  /**
   * @type {?Object.<string, anychart.SettingsState>}
   * @private
   * */
  this.selectedElement_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, []);
  this.data(opt_data);

  /**
   * Mouse wheel handler.
   * @type {?goog.events.MouseWheelHandler}
   * @private
   * */
  this.mouseWheelHandler_ = null;
};
goog.inherits(anychart.graphModule.Chart, anychart.core.Chart);


/**
 * Names for states.
 * @enum {string}
 */
anychart.graphModule.Chart.States = {
  LABELS_STYLE: 'labelsStyle',
  LABELS_ENABLED: 'labelsEnabled',
  LABELS_BOUNDS: 'labelsBounds',
  LAYOUT: 'layout'
};


anychart.consistency.supportStates(anychart.graphModule.Chart, anychart.enums.Store.GRAPH, [
  anychart.enums.State.APPEARANCE,
  anychart.enums.State.DATA,
  anychart.graphModule.Chart.States.LABELS_BOUNDS,
  anychart.graphModule.Chart.States.LABELS_ENABLED,
  anychart.graphModule.Chart.States.LABELS_STYLE,
  anychart.graphModule.Chart.States.LAYOUT]);

//todo
/**
 * @typedef {{
 *  nodeId: string,
 *  groupId: (string|undefined),
 *  dataRow: number,
 *  position: {
 *    x:number,
 *    y:number
 *  },
 *  currentState: anychart.SettingsState,
 *  domElement: (acgraph.vector.Path|undefined),
 *  textElement: (anychart.core.ui.OptimizedText|undefined),
 *  connectedEdges: Array.<string>,
 *  coulumbX: (number|undefined),
 *  coulumbY: (number|undefined),
 *  harmonicX: (number|undefined),
 *  harmonicY: (number|undefined),
 *  velocityY: (number|undefined),
 *  velocityX: (number|undefined),
 *  coloumGroup: number,
 *  siblings: Array
 * }}
 * */
anychart.graphModule.Chart.Node;


/**
 * @typedef {{
 *  id: string,
 *  dataRow: number,
 *  from: string,
 *  to: string,
 *  currentState: anychart.SettingsState,
 *  domElement: (acgraph.vector.Path|undefined),
 *  textElement: (anychart.core.ui.OptimizedText|undefined)
 * }}
 * */
anychart.graphModule.Chart.Edge;


/**
 * @typedef {{
 *  id: string,
 *  type: anychart.graphModule.Chart.Element,
 *  currentState: anychart.SettingsState
 * }}
 * */
anychart.graphModule.Chart.Tag;


//endregion
//region Properties
/**
 * Supported signals.
 * @type {number}
 */
anychart.graphModule.Chart.prototype.SUPPORTED_SIGNALS = anychart.core.Chart.prototype.SUPPORTED_SIGNALS |
  anychart.Signal.NEEDS_REDRAW_APPEARANCE;


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
 * @param {anychart.graphModule.Chart.Tag} tag
 * @return {anychart.format.Context}
 */
anychart.graphModule.Chart.prototype.createContextProvider = function(tag) {
  if (tag.type == anychart.graphModule.Chart.Element.NODE) {
    var node = this.getNodeById(tag.id);
    return this.nodes().createFormatProvider(node);
  } else {
    var edge = this.getEdgeById(tag.id); //todo
    return this.edges().createFormatProvider(edge);
  }
};


//endregion
//region Event handlers and interactivity


/**
 * Mouse click internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 */
anychart.graphModule.Chart.prototype.handleMouseClick = function(event) {
  // console.log(event);
  if (event['button'] != acgraph.events.BrowserEvent.MouseButton.LEFT) return;
  if (this.selectedElement_) { //deselect previous selected element
    switch (this.selectedElement_.type) {
      case anychart.graphModule.Chart.Element.EDGE:
        this.updateEdgeById(this.selectedElement_.id, anychart.SettingsState.NORMAL);
        break;
      case anychart.graphModule.Chart.Element.NODE:
        this.updateNodeById(this.selectedElement_.id, anychart.SettingsState.NORMAL);
        break;
    }
    this.selectedElement_ = null;
  }
  var tag = /**@type {anychart.graphModule.Chart.Tag}*/(event['domTarget'].tag);
  if (tag) {
    if (tag.type == anychart.graphModule.Chart.Element.NODE) {
      this.updateNodeById(tag.id, anychart.SettingsState.SELECTED);
      this.selectedElement_ = {
        type: anychart.graphModule.Chart.Element.NODE,
        id: tag.id
      };
    } else if (tag.type == anychart.graphModule.Chart.Element.EDGE) {
      this.updateEdgeById(tag.id, anychart.SettingsState.SELECTED);
      this.selectedElement_ = {
        type: anychart.graphModule.Chart.Element.EDGE,
        id: tag.id
      };
    }
  }
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.handleMouseOverAndMove = function(event) {
  var domTarget = event['domTarget'];
  var tag = /**@type {anychart.graphModule.Chart.Tag}*/(domTarget.tag);
  var tooltip;
  // if (!this.interactivityLockerdByDrag) {
  if (tag) {
    this.tooltip().hide();
    // debugger
    if (tag.type == anychart.graphModule.Chart.Element.NODE) {
      if (tag.currentState != anychart.SettingsState.SELECTED) {
        this.updateNodeById(tag.id, anychart.SettingsState.HOVERED);
      }
      tooltip = this.nodes().tooltip();
    } else if (tag.type == anychart.graphModule.Chart.Element.EDGE) {
      if (tag.currentState != anychart.SettingsState.SELECTED) {
        this.updateEdgeById(tag.id, anychart.SettingsState.HOVERED);
      }
      tooltip = this.edges().tooltip();
    }
    tooltip.showFloat(event['clientX'], event['clientY'], this.createContextProvider(/** @type {anychart.graphModule.Chart.Tag} */ (tag)));
  }
  else {
    this.tooltip().hide();
  }
  // }
};


/**
 * Mouse wheel handler.
 * @param {goog.events.MouseWheelEvent} event
 * @private
 * */
anychart.graphModule.Chart.prototype.handleMouseWheel_ = function(event) {
  var scale = 1;
  
  var dy = goog.clamp(event.deltaY, -5, 5);

  if (this.interactivity().getOption('zoomOnMouseWheel')) {
    var step = .3 / Math.abs(dy);
    if (dy > 0) {
      scale = 1 - step;
    } else if (dy < 0) {
      scale = 1 + step;
    }
  this.rootLayer.scale(scale, scale, event.clientX, event.clientY);
  }

  if (this.interactivity().getOption('scrollOnMouseWheel')) {
    this.rootLayer.translate(0, dy);
  }
  event.preventDefault();
};


/**
 * Update edges appearance
 * */
anychart.graphModule.Chart.prototype.updateEdgesAppearance = function() {
  for (var edge in this.getEdgesMap()) {
    var edgeObj = this.getEdgeById(edge);
    this.edges().updateAppearance(edgeObj);
  }
};


/**
 * Update path data of each edge connected to node.
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.Chart.prototype.updateEdgesConnectedToNode = function(node) {
  for (var i = 0, length = node.connectedEdges.length; i < length; i++) {
    var edge = this.getEdgesMap()[node.connectedEdges[i]];

    this.edges().updateLabelStyle(edge);

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
  var width = this.nodes().getWidth(node);
  var height = this.nodes().getHeight(node);

  x -= (width / 2);
  y -= (height / 2);

  node.domElement.setPosition(x, y);
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.handleMouseDown = function(event) {
  var domTarget = event['domTarget'];
  var tag = domTarget.tag;
  // console.log(event);
  if (this.interactivity().getOption('enabled')) {
    if (tag && tag.type == anychart.graphModule.Chart.Element.NODE && this.interactivity().getOption('node')) {
      var node = this.getNodeById(tag.id);
      this.nodeDragInteractivity(node, domTarget, event);
    } else if (!tag) {
      this.layerDragInteractivity(domTarget, event);
    }
  }
};


/**
 * Fit graph into bounds.
 * Calculate most values and offset graph depend  on it.
 * */
anychart.graphModule.Chart.prototype.setOffset = function() {
  var nodes = this.getNodesArray();

  var mostTop = Infinity;
  var mostLeft = Infinity;
  var mostRight = -Infinity;
  var mostBottom = -Infinity;

  var length = nodes.length;

  var i;


  for (i = 0; i < length; i++) {
    var x = nodes[i].position.x;
    var y = nodes[i].position.y;
    if (x < mostLeft) {
      mostLeft = x;
    }
    if (x > mostRight) {
      mostRight = x;
    }
    if (y > mostBottom) {
      mostBottom = y;
    }
    if (y < mostTop) {
      mostTop = y;
    }
  }

  mostBottom += -mostTop;
  for (i = 0; i < length; i++) {
    y = nodes[i].position.y;
    y += -mostTop;
    nodes[i].position.y = y;
  }

  mostRight += -mostLeft;
  for (i = 0; i < length; i++) {
    nodes[i].position.x += -mostLeft;
  }

  var mlt = Math.max(mostRight, mostBottom);

  var maxSide = this.contentBounds.width < this.contentBounds.height ? this.contentBounds.width : this.contentBounds.height;
  var gap = maxSide * 0.1;
  mlt = (maxSide - gap) / (mlt ? mlt : 1);//zero division

  var centerX = this.contentBounds.getCenter().getX();
  var centerY = this.contentBounds.getCenter().getY();

  var offstX = 0;
  var offstY = 0;
  for (i = 0; i < length; i++) {
    nodes[i].position.x *= mlt;
    nodes[i].position.y *= mlt;
    nodes[i].position.x += this.contentBounds.left;
    nodes[i].position.y += this.contentBounds.top;

    if (nodes[i].position.x < centerX) {
      offstX += centerX - nodes[i].position.x;
    } else {
      offstX -= nodes[i].position.x - centerX;
    }

    if (nodes[i].position.y < centerY) {
      offstY += centerY - nodes[i].position.y;
    } else {
      offstY -= nodes[i].position.y - centerY;
    }
  }

  offstX /= nodes.length;
  offstY /= nodes.length;

  for (i = 0; i < length; i++) {
    nodes[i].position.x += offstX;
    nodes[i].position.y += offstY;
  }
};


/**
 * Update current x y position for node.
 * @param {anychart.graphModule.Chart.Node} node
 * @param {number} dx
 * @param {number} dy
 * */
anychart.graphModule.Chart.prototype.setNodePosition = function(node, dx, dy) {
  node.position.x += dx;
  node.position.y += dy;
};


/**
 * Return absolute x value
 * @param {number} x
 * @return {number}
 * */
anychart.graphModule.Chart.prototype.getXWithTranslate = function(x) {
  var matrix = this.rootLayer.getTransformationMatrix();
  var scale = matrix[0];
  var offsetX = matrix[4];
  return (-offsetX * scale + x / scale);
};


/**
 * Return absolute y value
 * @param {number} y
 * @return {number}
 * */
anychart.graphModule.Chart.prototype.getYWithTranslate = function(y) {
  var matrix = this.rootLayer.getTransformationMatrix();
  var scale = matrix[0];
  var offsetY = matrix[5];
  return (-offsetY * scale + y / scale);
};


/**
 * Change position of dragged node.
 * @param {anychart.graphModule.Chart.Node} node Current dragged node.
 * @param {acgraph.vector.Path} domTarget
 * @param {anychart.core.MouseEvent} event
 * */
anychart.graphModule.Chart.prototype.nodeDragInteractivity = function(node, domTarget, event) {
  var dragger = new goog.fx.Dragger(domTarget['domElement']());
  var startX, startY;
  var iterator = this.nodes().getIterator();

  dragger.listen(goog.fx.Dragger.EventType.START, /** @this {anychart.graphModule.Chart}*/ function(e) {

    startX = this.getXWithTranslate(event.clientX);
    startY = this.getYWithTranslate(event.clientY);
  }, false, this);

  dragger.listen(goog.fx.Dragger.EventType.DRAG, /** @this {anychart.graphModule.Chart}*/ function(e) {
    this.interactivityLockerdByDrag = true;
    this.edges().getLabelsLayer().parent(null);
    var x = this.getXWithTranslate(e.clientX);
    var y = this.getYWithTranslate(e.clientY);

    var dx = x - startX;
    var dy = y - startY;
    startX = x;
    startY = y;

    // console.log(dx,dy);
    this.setNodePosition(node, dx, dy);
    this.updateNodeDOMElementPosition(node);
    this.updateEdgesConnectedToNode(node);
    this.updateNode(node, anychart.SettingsState.HOVERED);
  }, false, this);

  dragger.listen(goog.fx.Dragger.EventType.END, /** @this {anychart.graphModule.Chart}*/ function(e) {
    if (this.interactivity().getOption('magnetize')) {
      this.nodes().stickNode(node);
      this.updateNodeDOMElementPosition(node);
      this.updateEdgesConnectedToNode(node);
    }

    iterator.select(node.dataRow);
    iterator.meta('x', node.position.x);
    iterator.meta('y', node.position.y);
    this.edges().getLabelsLayer().parent(this.rootLayer);
    dragger.dispose();
  }, false, this);

  dragger.startDrag(event['getOriginalEvent']());
};


/**
 * @param {acgraph.vector.Path} domTarget
 * @param {anychart.core.MouseEvent} event
 * */
anychart.graphModule.Chart.prototype.layerDragInteractivity = function(domTarget, event) {
  var domElement = new goog.fx.Dragger(domTarget['domElement']());
  var startX = 0, startY = 0;
  var scale = this.rootLayer.getTransformationMatrix()[0];
  domElement.listen(goog.fx.Dragger.EventType.START, function(e) {
    startX = event.clientX;
    startY = event.clientY;
  }, false, this);
  domElement.listen(goog.fx.Dragger.EventType.DRAG, function(e) {
    var x = e.clientX;
    var y = e.clientY;
    var dx = (x - startX) / scale; //slowdown drag when zoom are used
    var dy = (y - startY) / scale;
    startX = x;
    startY = y;

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
  var tag = /**@type {anychart.graphModule.Chart.Tag}*/(domTarget.tag);
  // if (!this.interactivityLockerdByDrag) {
  if (tag) {
    if (tag.type == anychart.graphModule.Chart.Element.NODE) {
      if (tag.currentState != anychart.SettingsState.SELECTED) {
        this.updateNodeById(tag.id, anychart.SettingsState.NORMAL);
      }
    } else if (tag.type == anychart.graphModule.Chart.Element.EDGE) {
      if (tag.currentState != anychart.SettingsState.SELECTED) {
        this.updateEdgeById(tag.id, anychart.SettingsState.NORMAL);
      }
    }
  }
  // this.tooltip().hide();
  // }
};


/**
 * Update style of node.
 * @param {anychart.graphModule.Chart.Node} node
 * @param {anychart.SettingsState} state New State for node.
 * */
anychart.graphModule.Chart.prototype.updateNode = function(node, state) {
  this.nodes().state(node, state);
  this.nodes().updateAppearance(node);
  this.nodes().updateLabelStyle(node);
};


/**
 * Update style of node.
 * @param {string} nodeId
 * @param {anychart.SettingsState} state New State for node.
 * */
anychart.graphModule.Chart.prototype.updateNodeById = function(nodeId, state) {
  // debugger
  var node = this.getNodeById(nodeId);
  node.domElement.tag.currentState = state;
  this.updateNode(node, state);
};


/**
 * Update style of edge.
 * @param {anychart.graphModule.Chart.Edge} edge
 * @param {anychart.SettingsState} state New state for edge.
 * */
anychart.graphModule.Chart.prototype.updateEdge = function(edge, state) {
  this.edges().state(edge, state);
  this.edges().updateAppearance(edge);
  this.edges().updateLabelStyle(edge);
};


/**
 * Update style of edge.
 * @param {string} edgeId
 * @param {anychart.SettingsState} state New state for edge.
 * */
anychart.graphModule.Chart.prototype.updateEdgeById = function(edgeId, state) {
  var edge = this.getEdgeById(edgeId);
  edge.domElement.tag.currentState = state;
  this.updateEdge(edge, state);
};

//endregion
//region Data manipulation


/**
 * @param {Object} dataRow
 * @param {number} i Row number.
 * @private
 * */
anychart.graphModule.Chart.prototype.proceedNode_ = function(dataRow, i) {
  var nodeId = dataRow['id'];
  if (goog.isDef(nodeId)) {
    nodeId = nodeId.toString();
  } else {
    nodeId = 'node_' + i;
    dataRow['id'] = nodeId;
  }
  if (!this.getNodeById(nodeId)) {
    /**
     * @type {anychart.graphModule.Chart.Node}
     * */
    var nodeObj;
    nodeObj = this.nodes_[nodeId] = {};
    nodeObj.nodeId = nodeId;
    nodeObj.dataRow = i;
    nodeObj.connectedEdges = [];
    nodeObj.siblings = [];
    nodeObj.coloumGroup = -1;
    nodeObj.currentState = anychart.SettingsState.NORMAL;
    nodeObj.position = {
      x: dataRow['x'],
      y: dataRow['y']
    };
  }

  // debugger
  var groupId = dataRow['group'];
  if (goog.isDefAndNotNull(groupId)) {
    if (!this.groups_[groupId]) {
      this.groups_[groupId] = null;
    }
    nodeObj.groupId = groupId;
  }
};


/**
 * @param {Object} edgeRow
 * @param {number} i Row number.
 * @private
 * */
anychart.graphModule.Chart.prototype.proceedEdge_ = function(edgeRow, i) {
  var from = this.getNodeById(edgeRow['from']);
  var to = this.getNodeById(edgeRow['to']);
  if (from && to) {
    var edgeId = edgeRow['id'];
    if (goog.isDefAndNotNull(edgeId)) {
      edgeId = edgeId.toString();
    } else {
      edgeId = anychart.graphModule.Chart.Element.EDGE + '_' + i;
    }

    var edge = {};

    edge.id = edgeId;
    edge.from = from.nodeId;
    edge.to = to.nodeId;
    edge.dataRow = i;
    edge.currentState = anychart.SettingsState.NORMAL;

    from.connectedEdges.push(edge.id);
    to.connectedEdges.push(edge.id);
    from.siblings.push(to.nodeId);
    to.siblings.push(from.nodeId);

    this.edges_[edgeId] = edge;
  }
};


/**
 * Setup group number for nodes.
 * If graph contains two or more unconnected nodes.
 * @suppress {deprecated}
 * */
anychart.graphModule.Chart.prototype.setupGroupsForChart = function() {
  var nodes = this.getNodesArray();

  function getSet (node) {//todo name!?
    return [node.nodeId].concat(node.siblings);
  }

  /**
   * @type {Array.<goog.structs.Set>}

   * */
  var allNodes = [new goog.structs.Set(getSet(nodes[0]))];

  for (var i = 1, length = nodes.length; i < length; i++) {
    var currentNode = nodes[i];
    var siblings = getSet(currentNode);
    var isSubSet = false;
    var set = 0;
    for (var setLength = allNodes.length; set < setLength; set++) {
      for (var element = 0, siblingsLength = siblings.length; element < siblingsLength; element++) {
        if (allNodes[set].contains(siblings[element])) {
          isSubSet = true;
          break;
        }
      }
      if (isSubSet) {
        break;
      }
    }
    if (isSubSet) {
      allNodes[set].addAll(siblings);
    } else {
      allNodes.push((new goog.structs.Set(siblings)));
    }

  }
  for (var groupNumber = 0; groupNumber < allNodes.length; groupNumber++) {
    var groupElements = allNodes[groupNumber].getValues();
    for (var groupElement = 0; groupElement < groupElements.length; groupElement++) {
      var nodeId = groupElements[groupElement];
      var node = this.getNodeById(nodeId);
      var group = groupElements.length != 1 ? groupNumber : -1;
      node.coloumGroup = group;

      if (!(group in this.subGraphGroups_)) {
        this.subGraphGroups_[group] = [];
      }
      this.subGraphGroups_[group].push(node.nodeId);
    }
  }

};


/**
 * @private
 * */
anychart.graphModule.Chart.prototype.proceedNewDataBeforeSetup_ = function() {
  var edges = this.data_['edges'],
    nodes = this.data_['nodes'],
    length,
    i,
    dataRow;

  for (i = 0, length = nodes.getRowsCount(); i < length; i++) {
    dataRow = /**@type {Object}*/(nodes.getRow(i));
    if (dataRow) {
      this.proceedNode_(dataRow, i);
    }
  }

  for (i = 0, length = edges.getRowsCount(); i < length; i++) {
    dataRow = /**@type {Object}*/(edges.getRow(i));
    if (dataRow) {
      this.proceedEdge_(dataRow, i);
    }
  }
};


/**
 * Reset DOM of all drawn elements.
 * @private
 * */
anychart.graphModule.Chart.prototype.proceedCurrentDataBeforeRemove_ = function() {
  if (this.nodes_) {
    for (var nodeId in this.nodes_) {
      var node = this.getNodeById(nodeId);
      this.nodes().clear(node);
    }
  }

  if (this.edges_) {
    for (var edgeId in this.edges_) {
      var edge = this.getEdgeById(edgeId);
      this.edges().clear(edge);
    }
  }
  this.nodes_ = {};
  this.edges_ = {};
  this.nodesArray_ = null;
};


/**
 * Node signal handler
 * @param {anychart.SignalEvent} event
 * @private
 * */
anychart.graphModule.Chart.prototype.onNodeSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED |
    anychart.Signal.NEEDS_REAPPLICATION |
    anychart.Signal.ENABLED_STATE_CHANGED)
  ) {
    this.labelsSettingsInvalidated_(event);
  }

  var states = [];
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE)) {
    states.push(anychart.enums.State.APPEARANCE);
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    states.push(anychart.graphModule.Chart.States.LABELS_ENABLED);
  }
  this.invalidateMultiState(anychart.enums.Store.GRAPH, states, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Edge signal handler
 * @param {anychart.SignalEvent} event
 * @private
 * */
anychart.graphModule.Chart.prototype.onEdgeSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED |
    anychart.Signal.NEEDS_REAPPLICATION |
    anychart.Signal.ENABLED_STATE_CHANGED)
  ) {
    this.labelsSettingsInvalidated_(event);
  }
};


/**
 * Edge signal handler
 * @param {anychart.SignalEvent} event
 * @private
 * */
anychart.graphModule.Chart.prototype.onGroupSignal_ = function(event) {
  console.log('signal');
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED |
    anychart.Signal.NEEDS_REAPPLICATION |
    anychart.Signal.ENABLED_STATE_CHANGED)
  ) {
    this.labelsSettingsInvalidated_(event);
  }
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE)) {
    this.invalidateState(anychart.enums.Store.GRAPH, anychart.enums.State.APPEARANCE, anychart.Signal.NEEDS_REDRAW_APPEARANCE);
  }
};


/**
 * Layout signal handler
 * @param {anychart.SignalEvent} event
 * @private
 * */
anychart.graphModule.Chart.prototype.onLayoutSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    var states = [
      anychart.enums.State.APPEARANCE,
      anychart.graphModule.Chart.States.LABELS_STYLE,
      anychart.graphModule.Chart.States.LABELS_BOUNDS,
      anychart.graphModule.Chart.States.LABELS_ENABLED,
      anychart.graphModule.Chart.States.LAYOUT
    ];
    this.invalidate(anychart.ConsistencyState.BOUNDS);
    this.invalidateMultiState(anychart.enums.Store.GRAPH, states, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * @param {anychart.SignalEvent} event
 * @private
 * */
anychart.graphModule.Chart.prototype.dataInvalidated_ = function(event) {
  var statesForInvalidate = [
    anychart.enums.State.DATA,
    anychart.enums.State.APPEARANCE,
    anychart.graphModule.Chart.States.LABELS_STYLE,
    anychart.graphModule.Chart.States.LABELS_BOUNDS,
    anychart.graphModule.Chart.States.LABELS_ENABLED,
    anychart.graphModule.Chart.States.LAYOUT
  ];
  this.proceedCurrentDataBeforeRemove_();
  this.proceedNewDataBeforeSetup_();
  this.setupGroupsForChart();
  this.invalidateMultiState(anychart.enums.Store.GRAPH, statesForInvalidate, anychart.Signal.NEEDS_REDRAW);
};


//endregion


//todo jsdoc

//region Elements
/**
 * @param {Object=} opt_value
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Node)}
 * */
anychart.graphModule.Chart.prototype.nodes = function(opt_value) {
  if (!this.nds_) {//todo rename
    this.nds_ = new anychart.graphModule.elements.Node(this);
    this.setupCreated('nodes', this.nds_);
    this.nds_.setupElements();
    this.nds_.listenSignals(this.onNodeSignal_, this);
  }
  if (opt_value) {
    this.nds_.setup(opt_value);
    return this;
  }
  return this.nds_;
};


/**
 * @param {Object=} opt_value Object with interactivity settings
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Interactivity)}
 * @suppress {checkTypes}
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
 *
 * @param {string} id Id of group
 * @param {Object=} opt_value Config object
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Group)}
 * */
anychart.graphModule.Chart.prototype.groups = function(id, opt_value) {
  if (goog.isDefAndNotNull(id)) {
    if (goog.isNull(this.groups_[id])) {
      var group = new anychart.graphModule.elements.Group(this);
      // group.setupElements();
      group.listenSignals(this.onNodeSignal_, this);
      this.groups_[id] = group;
    } else {
      //todo warn no group
      return this;
    }
    if (opt_value) {
      this.groups_[id].setup(opt_value);
      return this;
    }
    return this.groups_[id];
  }
  return this;
};


/**
 * @param {Object=} opt_value
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Layout)}
 * */
anychart.graphModule.Chart.prototype.layout = function(opt_value) {
  if (!this.layout_) {
    this.layout_ = new anychart.graphModule.elements.Layout(this);
    this.setupCreated('layout', this.layout_);
    this.layout_.listenSignals(this.onLayoutSignal_, this);
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
    this.edge_.listenSignals(this.onEdgeSignal_, this);
  }
  if (opt_value) {
    return this;
  }
  return this.edge_;
};


/**
 * Labels handler
 * @param {anychart.SignalEvent} event
 * @private
 * */
anychart.graphModule.Chart.prototype.labelsSettingsInvalidated_ = function(event) {
  var state = [];
  var signal = anychart.Signal.NEEDS_REDRAW;
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    state.push(anychart.graphModule.Chart.States.LABELS_STYLE);
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    state.push(anychart.graphModule.Chart.States.LABELS_BOUNDS, anychart.graphModule.Chart.States.LABELS_STYLE);
  }

  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    // console.log('n');todo
  }

  if (event.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED)) {
    state.push(anychart.graphModule.Chart.States.LABELS_ENABLED, anychart.graphModule.Chart.States.LABELS_STYLE);
  }
  this.invalidateMultiState(anychart.enums.Store.GRAPH, state, signal);
};


/**
 * @param {Object=} opt_value - Settings object.
 * @return {(anychart.graphModule.Chart|anychart.core.ui.LabelsSettings)} - Current value or itself for method chaining.
 */
anychart.graphModule.Chart.prototype.labels = function(opt_value) {
  if (!this.labelsSettings_) {
    this.labelsSettings_ = new anychart.core.ui.LabelsSettings();
    this.setupCreated('labels', this.labelsSettings_);
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
 * @return {Object.<string, anychart.graphModule.elements.Group>}
 * */
anychart.graphModule.Chart.prototype.getGroupsMap = function() {
  return this.groups_;
};


/**
 * @return {Object.<number, Array.<string>>}
 * */
anychart.graphModule.Chart.prototype.getSubGraphsMap = function() {
  return this.subGraphGroups_;
};


/**
 * Return array with all nodes.
 * @return {Array.<anychart.graphModule.Chart.Node>}
 * */
anychart.graphModule.Chart.prototype.getNodesArray = function() {
  if (!this.nodesArray_) {
    this.nodesArray_ = [];
    for (var nodeId in this.getNodesMap()) {
      var nodes = this.getNodeById(nodeId);
      this.nodesArray_.push(nodes);
    }
  }
  return this.nodesArray_;
};


/**
 * Return array with all edges.
 * @return {Array.<anychart.graphModule.Chart.Node>}
 * */
anychart.graphModule.Chart.prototype.getEdgesArray = function() {
  if (!this.edgesArray_) {
    this.edgesArray_ = [];
    for (var edgeId in this.getEdgesMap()) {
      var edge = this.getEdgeById(edgeId);
      this.edgesArray_.push(edge);
    }
  }
  return this.edgesArray_;
};


/**
 * @param {string} id
 * @return {anychart.graphModule.Chart.Node}
 * */
anychart.graphModule.Chart.prototype.getNodeById = function(id) {
  return this.getNodesMap()[id];
};


/**
 * @param {string} id
 * @return {anychart.graphModule.Chart.Edge}
 * */
anychart.graphModule.Chart.prototype.getEdgeById = function(id) {
  return this.getEdgesMap()[id];
};
//ednregion


/**
 * Update all appearance of all nodes.
 * */
anychart.graphModule.Chart.prototype.updateNodesAppearance = function() {
  var nodes = this.getNodesArray();
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    this.nodes().updateAppearance(node);
  }
};


/**
 * Draw passed node.
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.Chart.prototype.drawNode = function(node) {
  var domElement = this.nodes().createDOM(node);
  domElement.parent(this.rootLayer);
};


/**
 * Draw all nodes of graph.
 * */
anychart.graphModule.Chart.prototype.drawNodes = function() {
  for (var node in this.getNodesMap()) {
    node = this.getNodeById(node);
    this.drawNode(node);
  }
  this.nodes().dispatchSignal(anychart.Signal.MEASURE_COLLECT);
};


/**
 * Move all nodes of graph.
 * */
anychart.graphModule.Chart.prototype.moveNodes = function() {
  var nodes = this.getNodesArray();
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    this.updateNode(node, /**@type {anychart.SettingsState}*/(this.nodes().state(node)));
    this.updateEdgesConnectedToNode(node);
  }
};


/**
 * Draw passed edge.
 * @param {anychart.graphModule.Chart.Edge} edge
 * */
anychart.graphModule.Chart.prototype.drawEdge = function(edge) {
  var domElement = this.edges().createDOM(edge);
  var from = this.getNodeById(edge.from);
  var to = this.getNodeById(edge.to);

  domElement.moveTo(from.position.x, from.position.y);
  domElement.lineTo(to.position.x, to.position.y);

  domElement.parent(this.rootLayer);
};


/**
 * Draw all edges of chart.
 * */
anychart.graphModule.Chart.prototype.drawEdges = function() {
  for (var i in this.edges_) {
    var edge = this.getEdgeById(i);
    this.drawEdge(edge);
  }
  this.edges().dispatchSignal(anychart.Signal.MEASURE_COLLECT);
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.drawContent = function(bounds) {
  if (this.isConsistent())
    return;

  if (!this.rootLayer) {
    this.rootLayer = this.rootElement.layer();
    this.rootLayer.zIndex(anychart.graphModule.Chart.Z_INDEX);
    this.edges().getLabelsLayer().parent(this.rootLayer);
    this.nodes().getLabelsLayer().parent(this.rootLayer);
  }

  if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.LAYOUT)) {
    console.log('here');
    this.layout().getCoordinatesForCurrentLayout();
    this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.LAYOUT);
  }

  if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.DATA)) {
    this.drawEdges();
    this.drawNodes();
    this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.enums.State.DATA);
  }

  if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.APPEARANCE)) {
    this.updateEdgesAppearance();
    this.updateNodesAppearance();
    this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.enums.State.APPEARANCE);
  }

  if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.LABELS_ENABLED)) {
    this.edges().drawLabels();
    this.nodes().drawLabels();
    this.nodes().resetComplexityForTexts();
    this.edges().resetComplexityForTexts();
    this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.LABELS_ENABLED);
  }

  if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.LABELS_BOUNDS)) {
    anychart.measuriator.measure();
    this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.LABELS_BOUNDS);
  }

  if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.LABELS_STYLE)) {
    this.edges().updateLabelsStyle();
    this.nodes().updateLabelsStyle();
    this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.LABELS_STYLE);
  }
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    if (this.layout().type() == anychart.graphModule.elements.LayoutType.FORCE) {
      this.setOffset();
    }
    this.moveNodes();
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }
  if (!this.mouseWheelHandler_) {
    this.mouseWheelHandler_ = new goog.events.MouseWheelHandler(this.container().getStage().getDomWrapper(), false);
    this.mouseWheelHandler_.listen('mousewheel', this.handleMouseWheel_, false, this);
  }
};


/**
 * @param {number} value Zoom factor.
 * @param {number=} opt_cx scaling point x.
 * @param {number=} opt_cy scaling point y.
 * @return {Array.<number> | anychart.graphModule.Chart}
 * */
anychart.graphModule.Chart.prototype.zoom = function(value, opt_cx, opt_cy) {
  if (goog.isDefAndNotNull(value)) {
    this.rootLayer.scale(value, value, opt_cx, opt_cy); //todo signal here
    return this;
  }
  var matrix = this.rootLayer.getTransformationMatrix();
  return [matrix[0], matrix[3]];
};


/**
 * @param {number} dx movement x.
 * @param {number} dy movement y.
 * @return {Array.<number> | anychart.graphModule.Chart}
 * */
anychart.graphModule.Chart.prototype.move = function(dx, dy) {
  if (goog.isDefAndNotNull(dx) && goog.isDefAndNotNull(dy)) {
    this.rootLayer.translate(dx, dy);
    return this;
  }
  var matrix = this.rootLayer.getTransformationMatrix();
  return [matrix[4], matrix[5]];
};


/**
 * Return chart back to initial state.
 * */
anychart.graphModule.Chart.prototype.fit = function() {
  this.rootLayer.setTransformationMatrix(1, 0, 0, 1, 0, 0);
};


/**
 * Rotate root layer.
 * @param {number} degree
 * */
anychart.graphModule.Chart.prototype.rotate = function(degree) {
  var coordinate = (/**@type {goog.math.Rect}*/(this.contentBounds)).getCenter();
  this.rootLayer.rotate(degree, coordinate.getX(), coordinate.getY());
};


//endregion
//region Serialize, setup, dispose

/**
 * Get/set data for chart.
 * @param {Object=} opt_value
 * @return {(Object | anychart.graphModule.Chart)}
 * */
anychart.graphModule.Chart.prototype.data = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var data = {
      'nodes': opt_value['nodes'],
      'edges': opt_value['edges']
    };
    var dataElement = data['nodes'];
    if (this.rawDataForNodes != dataElement) {
      this.rawDataForNodes = dataElement;
      if (this.data_ && this.data_['nodes']) {
        this.data_['nodes'].unlistenSignals(this.dataInvalidated_);
        goog.dispose(this.data_['nodes']);
      }
      if (anychart.utils.instanceOf(dataElement, anychart.data.Set)) {
        data['nodes'] = dataElement.mapAs();
      } else if (anychart.utils.instanceOf(dataElement, anychart.data.View)) {
        data['nodes'] = dataElement.derive();
      } else {
        data['nodes'] = anychart.data.set(dataElement).mapAs();
      }
      data['nodes'].listenSignals(this.dataInvalidated_, this);
    }

    dataElement = data['edges'];
    if (this.rawDataForEdges != dataElement) {
      this.rawDataForEdges = dataElement;
      if (this.data_ && this.data_['edges']) {
        this.data_['edges'].unlistenSignals(this.dataInvalidated_);
        goog.dispose(this.data_['edges']);
      }
      if (anychart.utils.instanceOf(dataElement, anychart.data.Set)) {
        data['edges'] = dataElement.mapAs();
      } else if (anychart.utils.instanceOf(dataElement, anychart.data.View)) {
        data['edges'] = dataElement.derive();
      } else {
        data['edges'] = anychart.data.set(dataElement).mapAs();
      }
      data['edges'].listenSignals(this.dataInvalidated_, this);
    }

    this.proceedCurrentDataBeforeRemove_();
    this.data_ = data;
    this.proceedNewDataBeforeSetup_();
    this.setupGroupsForChart();

    var statesForInvalidate = [
      anychart.enums.State.DATA,
      anychart.enums.State.APPEARANCE,
      anychart.graphModule.Chart.States.LABELS_STYLE,
      anychart.graphModule.Chart.States.LABELS_BOUNDS,
      anychart.graphModule.Chart.States.LABELS_ENABLED,
      anychart.graphModule.Chart.States.LAYOUT
    ];
    this.invalidateMultiState(anychart.enums.Store.GRAPH, statesForInvalidate, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.data_;
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.serialize = function() {
  var json = anychart.graphModule.Chart.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.graphModule.Chart.OWN_DESCRIPTORS, json);

  json['data'] = {
    'nodes': this.data()['nodes'].serialize(),
    'edges': this.data()['edges'].serialize()
  };
  var iterator = this.nodes().getIterator();
  iterator.reset();
  var i = 0;
  var value;
  while (iterator.advance()) {
    value = iterator.meta('x');
    if (value)
      json['data']['nodes'][i]['x'] = value;
    value = iterator.meta('y');
    if (value)
      json['data']['nodes'][i]['y'] = value;
    i++;
  }

  json['nodes'] = this.nodes().serialize();
  json['edges'] = this.edges().serialize();
  // json['groups'] = this.groups().serialize();
  json['interactivity'] = this.interactivity().serialize();
  //config['zoom'] = this.interactivity().serialize();
  return {'chart': json};
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.graphModule.Chart.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.graphModule.Chart.OWN_DESCRIPTORS, config, opt_default);

  if ('data' in config)
    this.data(config['data']);
  if ('edges' in config)
    this.edges().setupInternal(config['edges']);
  if ('nodes' in config)
    this.nodes().setupInternal(config['nodes']);
  // if ('groups' in config)
  //   this.nodes().setupInternal(config['groups']);
  if ('interactivity' in config)
    this.nodes().setupInternal(config['interactivity']);
  //zoom
  //translate
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.disposeInternal = function() {
  this.edges().disposeInternal();
  this.nodes().disposeInternal();
  this.nodesArray_ = null;
  this.edgesArray_ = null;

  this.edges_ = {};
  this.nodes_ = {};

  anychart.graphModule.Chart.base(this, 'disposeInternal');
};


//endregion
//region Exports
(function() {
  var proto = anychart.graphModule.Chart.prototype;
  proto['data'] = proto.data;
  proto['edges'] = proto.edges;
  proto['fit'] = proto.fit;
  proto['zoom'] = proto.zoom;
  proto['move'] = proto.move;
  proto['groups'] = proto.groups;
  proto['nodes'] = proto.nodes;
  proto['layout'] = proto.layout;
  proto['interactivity'] = proto.interactivity;
})();


//endregion
