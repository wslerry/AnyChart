goog.provide('anychart.elements.Base');

goog.require('acgraphexport');
goog.require('anychart.utils.Bounds');
goog.require('anychart.utils.Invalidatable');
goog.require('goog.dom');



/**
 * Base class for all elements that have common work protocol.
 * @constructor
 * @extends {anychart.utils.Invalidatable}
 */
anychart.elements.Base = function() {
  goog.base(this);

  this.suspendInvalidationDispatching();
  this.invalidate(anychart.utils.ConsistencyState.CONTAINER);
  this.invalidate(anychart.utils.ConsistencyState.Z_INDEX);
  this.resumeInvalidationDispatching(true);
};
goog.inherits(anychart.elements.Base, anychart.utils.Invalidatable);


/**
 * Container which the root element should be added to.
 * @type {acgraph.vector.ILayer}
 * @private
 */
anychart.elements.Base.prototype.container_;


/**
 * Z index of the element.
 * @type {number}
 * @private
 */
anychart.elements.Base.prototype.zIndex_ = 0;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.utils.ConsistencyState.CONTAINER |
        anychart.utils.ConsistencyState.Z_INDEX;


/**
 * Gets/Sets element container. The element should append it's root element to the container on draw.
 * The order of adding is not defined, but usually it will be the order in which elements are drawn for the first time.
 * So if you need to specify the order - use ZIndexedLayer and zIndex.
 *
 * @param {(acgraph.vector.ILayer|string|Element)=} opt_value Container value if used as setter.
 * @return {(acgraph.vector.ILayer|anychart.elements.Base)} Container or itself for chaining.
 */
anychart.elements.Base.prototype.container = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.container_ != opt_value) {
      if (goog.isString(opt_value) || goog.dom.isElement(opt_value)) {
        // Should we use registerDisposable in this case?
        // TODO(Anton Saukh): fix type cast to {Element|string} when this will be fixed in graphics.
        this.container_ = acgraph.create();
        this.container_.container(/** @type {Element} */(opt_value));
      } else {
        this.container_ = /** @type {acgraph.vector.ILayer} */(opt_value);
      }
      this.invalidate(anychart.utils.ConsistencyState.CONTAINER);
    }
    return this;
  }
  return this.container_;
};


/**
 * Z index of the element getter and setter.
 * @param {number=} opt_zIndex zIndex to set or nothing to get.
 * @return {(number|!anychart.elements.Base)} Current zIndex or itself for chaining.
 */
anychart.elements.Base.prototype.zIndex = function(opt_zIndex) {
  if (goog.isDef(opt_zIndex)) {
    this.zIndex_ = +opt_zIndex || 0;
    this.invalidate(anychart.utils.ConsistencyState.Z_INDEX);
    return this;
  }
  return this.zIndex_;
};
