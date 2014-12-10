goog.provide('anychart.core.ui.LabelsFactory');
goog.require('acgraph');
goog.require('anychart.core.Text');
goog.require('anychart.core.ui.Background');
goog.require('anychart.enums');
goog.provide('anychart.core.ui.LabelsFactory.Label');



/**
 * Class for creation of sets of similar labels and management of such sets.
 * Any individual label can be changed after all labels are displayed.
 * @constructor
 * @extends {anychart.core.Text}
 */
anychart.core.ui.LabelsFactory = function() {
  this.suspendSignalsDispatching();
  goog.base(this);

  /**
   * Enabled state.
   * @type {?boolean}
   * @private
   */
  this.enabledState_ = null;

  /**
   * Labels width settings.
   * @type {string|number|null}
   * @private
   */
  this.width_ = null;

  /**
   * Labels height settings.
   * @type {string|number|null}
   * @private
   */
  this.height_ = null;

  /**
   * Rotation angle.
   * @type {number}
   * @private
   */
  this.rotationAngle_;

  /**
   * Labels position settings.
   * @type {string}
   * @private
   */
  this.position_;

  /**
   * Labels anchor settings.
   * @type {anychart.enums.Anchor}
   * @private
   */
  this.anchor_;

  /**
   * Labels padding settings.
   * @type {anychart.core.utils.Padding}
   * @private
   */
  this.padding_ = null;

  /**
   * Offset by X coordinate from labels position.
   * @type {number|string}
   * @private
   */
  this.offsetX_;

  /**
   * Offset by Y coordinate from labels position.
   * @type {number|string}
   * @private
   */
  this.offsetY_;

  /**
   * Label text formatting function, by default we use value field of the format provider.
   * @type {Function}
   * @private
   */
  this.textFormatter_ = anychart.utils.DEFAULT_FORMATTER;

  /**
   * Label position function, by default we use value obtained from context.
   * @type {Function}
   * @private
   */
  this.positionFormatter_ = anychart.utils.DEFAULT_FORMATTER;

  /**
   * Labels background settings.
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.background_ = null;

  /**
   * Labels layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_ = null;

  /**
   * Labels Array.
   * @type {Array.<anychart.core.ui.LabelsFactory.Label>}
   * @private
   */
  this.labels_;

  this.background(null);
  this.anchor(anychart.enums.Anchor.CENTER);
  this.padding(2, 4);
  this.rotation(0);
  this.width(null);
  this.height(null);
  this.fontSize('11');
  this.enabled(true);

  this.changedSettings = {};

  this.invalidate(anychart.ConsistencyState.ALL);
  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.core.ui.LabelsFactory, anychart.core.Text);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.LabelsFactory.prototype.SUPPORTED_SIGNALS = anychart.core.Text.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.LabelsFactory.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Text.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.BACKGROUND |
    anychart.ConsistencyState.HANDLERS;


/**
 * Enumeration to handle composite event handlers attachment on DOM create.
 * @const {Object.<number>}
 * @private
 */
anychart.core.ui.LabelsFactory.HANDLED_EVENT_TYPES_ = {
  /** Click. */
  'click': 0x01,

  /** Double click. */
  'dblclick': 0x02,

  /** Mouse down */
  'mousedown': 0x04,

  /** Mouse up */
  'mouseup': 0x08,

  /** Mouse over. */
  'mouseover': 0x10,

  /** Mouse out. */
  'mouseout': 0x20,

  /** Mouse move */
  'mousemove': 0x40,

  /** Touch start */
  'touchstart': 0x80,

  /** Touch move */
  'touchmove': 0x100,

  /** Touch end */
  'touchend': 0x200,

  /** Touch cancel.
   * @see http://www.w3.org/TR/2011/WD-touch-events-20110505/#the-touchcancel-event
   */
  'touchcancel': 0x400

  //  /** Tap (fast touchstart-touchend) */
  //  'tap': 0x800
};


/**
 * MAGIC NUMBERS!!! MAGIC NUMBERS!!!111
 * This is a lsh (<< - left shift) second argument to convert simple HANDLED_EVENT_TYPES code to a
 * CAPTURE HANDLED_EVENT_TYPES code! Tada!
 * @type {number}
 * @private
 */
anychart.core.ui.LabelsFactory.HANDLED_EVENT_TYPES_CAPTURE_SHIFT_ = 12;


/**
 * Getter for the current element state.
 *
 * True, false and null states.
 *
 * True and false are self-explanatory. null state means that element is enabled,
 * but if it depends on other entities (like, for example, labels() and hoverLabels() in series),
 * then factory works in auto mode. For example, if series normal labels are enable,
 * and hover labels are in null state, then upon hover hoverLabels become enabled because of normal.
 * But if you disable normal labels – hoverLabels are disabled too.
 * @return {?boolean} The current element state.
 *//**
 * Setter for the element enabled state.
 * @example <t>listingOnly</t>
 * if (!element.enabled())
 *    element.enabled(true);
 * @param {(null|boolean)=} opt_value Value to set.
 * @return {!anychart.LabelsFactory} An instance of {@link anychart.core.VisualBase} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {?boolean=} opt_value Value to set.
 * @return {!anychart.core.ui.LabelsFactory|boolean|null} .
 */
anychart.core.ui.LabelsFactory.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.enabledState_ = opt_value;
    if (!goog.isNull(opt_value)) {
      goog.base(this, 'enabled', /** @type {boolean} */(opt_value));
    } else {
      goog.base(this, 'enabled', true);
    }
    return this;
  }
  return this.enabledState_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Background.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets the labels background settings.
 * @param {(string|Object|null|boolean)=} opt_value Background object to set.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.ui.Background)} Returns the background or itself for chaining.
 */
anychart.core.ui.LabelsFactory.prototype.background = function(opt_value) {
  if (!this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.registerDisposable(this.background_);
    this.background_.markConsistent(anychart.ConsistencyState.ALL);
    this.background_.listenSignals(this.backgroundInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.background_.setup(opt_value);
    this.changedSettings['background'] = true;
    return this;
  }
  return this.background_;
};


/**
 * Internal background invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.LabelsFactory.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.changedSettings['background'] = true;
    this.background_.markConsistent(anychart.ConsistencyState.ALL);
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Labels padding.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.utils.Padding)} Padding or LabelsFactory for chaining.
 */
anychart.core.ui.LabelsFactory.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.registerDisposable(this.padding_);
    this.padding_.listenSignals(this.paddingInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.padding_.setup.apply(this.padding_, arguments);
    this.changedSettings['padding'] = true;
    return this;
  }
  return this.padding_;
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.ui.LabelsFactory.prototype.paddingInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.changedSettings['padding'] = true;
    this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Text formatter.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets labels text formatter function.
 * @param {Function=} opt_value Labels text formatter function.
 * @return {Function|anychart.core.ui.LabelsFactory} Labels text formatter function or Labels instance for chaining call.
 */
anychart.core.ui.LabelsFactory.prototype.textFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.textFormatter_ = opt_value;
    this.changedSettings['textFormatter'] = true;
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else {
    return this.textFormatter_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Position.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets labels position formatter function.
 * @param {Function=} opt_value Labels position formatter function.
 * @return {Function|anychart.core.ui.LabelsFactory} Labels position formatter function or Labels instance for chaining call.
 */
anychart.core.ui.LabelsFactory.prototype.positionFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.positionFormatter_ = opt_value;
    this.changedSettings['positionFormatter'] = true;
    this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else {
    return this.positionFormatter_;
  }
};


/**
 * Gets or sets labels position settings. These settings are processed by the factory handler (for example a series,
 * or an axis) and can have different meanings from handler to handler. Try using anychart.enums.Position values.
 * @param {string=} opt_value Labels position settings.
 * @return {anychart.core.ui.LabelsFactory|string} Labels position settings or itself for chaining call.
 */
anychart.core.ui.LabelsFactory.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = String(opt_value);
    if (this.position_ != opt_value) {
      this.position_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    this.changedSettings['position'] = true;
    return this;
  } else {
    return this.position_;
  }
};


/**
 * Gets or sets labels anchor settings.
 * @param {(anychart.enums.Anchor|string)=} opt_value Labels anchor settings.
 * @return {anychart.core.ui.LabelsFactory|anychart.enums.Anchor} Labels anchor settings or itself for chaining call.
 */
anychart.core.ui.LabelsFactory.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeAnchor(opt_value);
    if (this.anchor_ != opt_value) {
      this.anchor_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    this.changedSettings['anchor'] = true;
    return this;
  } else {
    return this.anchor_;
  }
};


/**
 * Gets or sets labels offsetX settings.
 * @param {(number|string)=} opt_value Labels offsetX settings to set.
 * @return {number|string|anychart.core.ui.LabelsFactory} Labels offsetX value or itself for chaining call.
 */
anychart.core.ui.LabelsFactory.prototype.offsetX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetX_ != opt_value) {
      this.offsetX_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    this.changedSettings['offsetX'] = true;
    return this;
  } else {
    return this.offsetX_;
  }
};


/**
 * Gets or sets labels offsetY settings.
 * @param {(number|string)=} opt_value Labels offsetY settings to set.
 * @return {number|string|anychart.core.ui.LabelsFactory} Labels offsetY value or itself for chaining call.
 */
anychart.core.ui.LabelsFactory.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.offsetY_ != opt_value) {
      this.offsetY_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    this.changedSettings['offsetY'] = true;
    return this;
  } else {
    return this.offsetY_;
  }
};


/**
 * Sets rotation angle around an anchor.
 * ({@link acgraph.vector.Element}).
 * @param {number=} opt_value Rotation angle in degrees.
 * @return {number|anychart.core.ui.LabelsFactory} Rotation angle in degrees or Itself for chaining call.
 */
anychart.core.ui.LabelsFactory.prototype.rotation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value;
    if (this.rotationAngle_ != opt_value) {
      this.rotationAngle_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    this.changedSettings['rotation'] = true;
    return this;
  } else {
    return this.rotationAngle_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Width/Height.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * LabelsFactory width settings.
 * @param {(number|string|null)=} opt_value Width value to set.
 * @return {!anychart.core.ui.LabelsFactory|number|string|null} LabelsFactory width or itself for chaining call.
 */
anychart.core.ui.LabelsFactory.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    this.changedSettings['width'] = true;
    return this;
  }
  return this.width_;
};


/**
 * LabelsFactory height settings.
 * @param {(number|string|null)=} opt_value Height value to set.
 * @return {!anychart.core.ui.LabelsFactory|number|string|null} LabelsFactory height or itself for chaining.
 */
anychart.core.ui.LabelsFactory.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.height_ != opt_value) {
      this.height_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    this.changedSettings['height'] = true;
    return this;
  }
  return this.height_;
};


/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['background'] = this.background().serialize();
  json['padding'] = this.padding().serialize();
  json['position'] = this.position();
  json['anchor'] = this.anchor();
  json['offsetX'] = this.offsetX();
  json['offsetY'] = this.offsetY();
  json['rotation'] = this.rotation();
  json['width'] = this.width();
  json['height'] = this.height();
  return json;
};


/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  this.background(config['background']);
  this.padding(config['padding']);
  this.position(config['position']);
  this.anchor(config['anchor']);
  this.offsetX(config['offsetX']);
  this.offsetY(config['offsetY']);
  this.rotation(config['rotation']);
  this.width(config['width']);
  this.height(config['height']);
};


/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.remove = function() {
  if (this.layer_) this.layer_.parent(null);
};


/**
 * Clears an array of labels.
 * @param {number=} opt_index If set, removes only the label that is in passed index.
 * @return {anychart.core.ui.LabelsFactory} Returns itself for chaining.
 */
anychart.core.ui.LabelsFactory.prototype.clear = function(opt_index) {
  if (!this.freeToUseLabelsPool_)
    this.freeToUseLabelsPool_ = [];

  if (this.labels_) {
    opt_index = +opt_index;
    if (!isNaN(opt_index) && opt_index in this.labels_) {
      this.labels_[opt_index].clear();
      this.freeToUseLabelsPool_.push(this.labels_[opt_index]);
      delete this.labels_[opt_index];
    } else {
      goog.array.forEach(this.labels_, function(label) {
        label.clear();
        this.freeToUseLabelsPool_.push(label);
      }, this);
      this.labels_.length = 0;
    }
    this.invalidate(anychart.ConsistencyState.HANDLERS, anychart.Signal.NEEDS_REDRAW);
  } else
    this.labels_ = [];

  return this;
};


/**
 * Returns label by index (if there is such label).
 * @param {number} index Label index.
 * @return {anychart.core.ui.LabelsFactory.Label} Already existing label.
 */
anychart.core.ui.LabelsFactory.prototype.getLabel = function(index) {
  index = +index;
  return this.labels_ && this.labels_[index] ? this.labels_[index] : null;
};


/**
 * Labels count
 * @return {number}
 */
anychart.core.ui.LabelsFactory.prototype.labelsCount = function() {
  return this.labels_ ? this.labels_.length : 0;
};


/**
 * Returns object with changed states.
 * @return {!Object.<boolean>}
 */
anychart.core.ui.LabelsFactory.prototype.getSettingsChangedStatesObj = function() {
  return this.changedSettings;
};


/**
 * Returns DOM element.
 * @return {acgraph.vector.Layer}
 */
anychart.core.ui.LabelsFactory.prototype.getDomElement = function() {
  return this.layer_;
};


/**
 * Creates new instance of anychart.core.ui.LabelsFactory.Label, saves it in the factory
 * and returns it.
 * @param {*} formatProvider Object that provides info for textFormatter function.
 * @param {*} positionProvider Object that provides info for positionFormatter function.
 * @param {number=} opt_index Label index.
 * @return {!anychart.core.ui.LabelsFactory.Label} Returns new label instance.
 */
anychart.core.ui.LabelsFactory.prototype.add = function(formatProvider, positionProvider, opt_index) {
  var label, index;
  if (!goog.isDef(this.labels_)) this.labels_ = [];

  if (goog.isDef(opt_index)) {
    index = +opt_index;
    label = this.labels_[index];
  }

  if (label) {
    label.suspendSignalsDispatching();
    label.clear();
  } else {
    label = this.freeToUseLabelsPool_ && this.freeToUseLabelsPool_.length > 0 ?
        this.freeToUseLabelsPool_.pop() :
        this.createLabel();
    label.suspendSignalsDispatching();

    if (goog.isDef(index)) {
      this.labels_[index] = label;
      label.setIndex(index);
    } else {
      this.labels_.push(label);
      label.setIndex(this.labels_.length - 1);
    }
  }

  label.formatProvider(formatProvider);
  label.positionProvider(positionProvider);
  label.parentLabelsFactory(this);
  label.resumeSignalsDispatching(false);

  return label;
};


/**
 * @protected
 * @return {anychart.core.ui.LabelsFactory.Label}
 */
anychart.core.ui.LabelsFactory.prototype.createLabel = function() {
  return new anychart.core.ui.LabelsFactory.Label();
};


/**
 * Labels drawing.
 * @return {anychart.core.ui.LabelsFactory} Returns itself for chaining.
 */
anychart.core.ui.LabelsFactory.prototype.draw = function() {
  if (!this.layer_) {
    this.layer_ = acgraph.layer();
    this.registerDisposable(this.layer_);
  }

  var stage = this.container() ? this.container().getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.labels_) {
    goog.array.forEach(this.labels_, function(label, index) {
      if (label) {
        label.container(this.layer_);
        label.draw();

        if (this.hasInvalidationState(anychart.ConsistencyState.HANDLERS)) {
          var element = label.getDomElement();
          if (element) {
            element['__tagIndex'] = index;
            for (var type in anychart.core.ui.LabelsFactory.HANDLED_EVENT_TYPES_) {
              var code = anychart.core.ui.LabelsFactory.HANDLED_EVENT_TYPES_[type];
              if (!!(this.attachedEvents_ & code))
                element.listen(type, this.handleBrowserEvent_, false, this);
              else if (!!(this.attachedOnceEvents_ & code))
                element.listenOnce(type, this.handleBrowserEvent_, false, this);
              else
                element.unlisten(type, this.handleBrowserEvent_, false, this);

              code = code << acgraph.vector.Element.HANDLED_EVENT_TYPES_CAPTURE_SHIFT;
              if (!!(this.attachedEvents_ & code))
                element.listen(type, this.handleBrowserEvent_, true, this);
              else if (!!(this.attachedOnceEvents_ & code))
                element.listenOnce(type, this.handleBrowserEvent_, true, this);
              else
                element.unlisten(type, this.handleBrowserEvent_, true, this);
            }
          }
          this.attachedOnceEvents_ = 0x00;
        }
      }
    }, this);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.layer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.layer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  this.markConsistent(anychart.ConsistencyState.ALL);

  if (manualSuspend) stage.resume();
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Measurement.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns label size.
 * @param {*|anychart.core.ui.LabelsFactory.Label} formatProviderOrLabel Object that provides info for textFormatter function.
 * @param {*=} opt_positionProvider Object that provides info for positionFormatter function.
 * @param {Object=} opt_settings .
 * @return {anychart.math.Rect} Label bounds.
 */
anychart.core.ui.LabelsFactory.prototype.getDimension = function(formatProviderOrLabel, opt_positionProvider, opt_settings) {
  var text;
  var textElementBounds;
  var textWidth;
  var textHeight;
  /** @type {anychart.math.Rect} */
  var outerBounds = new anychart.math.Rect(0, 0, 0, 0);
  var isWidthSet;
  var isHeightSet;
  var parentWidth;
  var parentHeight;
  var formatProvider;
  var positionProvider;

  if (!this.measureCustomLabel_) this.measureCustomLabel_ = new anychart.core.ui.LabelsFactory.Label();
  else this.measureCustomLabel_.clear();

  if (formatProviderOrLabel instanceof anychart.core.ui.LabelsFactory.Label) {
    var label = (/** @type {anychart.core.ui.LabelsFactory.Label} */(formatProviderOrLabel));
    this.measureCustomLabel_.setup(label.serialize());
    formatProvider = label.formatProvider();
    positionProvider = opt_positionProvider || label.positionProvider() || {'value' : {'x': 0, 'y': 0}};
  } else {
    formatProvider = formatProviderOrLabel;
    positionProvider = opt_positionProvider || {'value' : {'x': 0, 'y': 0}};
  }
  this.measureCustomLabel_.setSettings(opt_settings);

  var isHtml = goog.isDef(this.measureCustomLabel_.useHtml()) ? this.measureCustomLabel_.useHtml() : this.useHtml();

  //we should ask text element about bounds only after text format and text settings are applied

  //define parent bounds
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
  }

  var padding = opt_settings && opt_settings['padding'] ? this.measureCustomLabel_.padding() : this.padding();
  var widthSettings = this.measureCustomLabel_.width() || this.width();
  var heightSettings = this.measureCustomLabel_.height() || this.height();
  var offsetY = /** @type {number|string} */(this.measureCustomLabel_.offsetY() || this.offsetY());
  var offsetX = /** @type {number|string} */(this.measureCustomLabel_.offsetX() || this.offsetX());
  var anchor = /** @type {string} */(this.measureCustomLabel_.anchor() || this.anchor());


  if (!this.measureTextElement_) this.measureTextElement_ = acgraph.text();
  text = this.textFormatter_.call(formatProvider, formatProvider);
  this.measureTextElement_.width(null);
  this.measureTextElement_.height(null);
  if (isHtml) {
    this.measureTextElement_.htmlText(goog.isDefAndNotNull(text) ? String(text) : null);
  } else {
    this.measureTextElement_.text(goog.isDefAndNotNull(text) ? String(text) : null);
  }

  this.applyTextSettings(this.measureTextElement_, true);
  this.measureCustomLabel_.applyTextSettings(this.measureTextElement_, false);

  //define is width and height set from settings
  isWidthSet = !goog.isNull(widthSettings);
  isHeightSet = !goog.isNull(heightSettings);

  textElementBounds = this.measureTextElement_.getBounds();

  //calculate text width and outer width
  var width;
  if (isWidthSet) {
    width = Math.ceil(anychart.utils.normalizeSize(/** @type {number|string} */(widthSettings), parentWidth));
    textWidth = padding.tightenWidth(width);
    outerBounds.width = width;
  } else {
    width = textElementBounds.width;
    outerBounds.width = padding.widenWidth(width);
  }

  if (goog.isDef(textWidth)) this.measureTextElement_.width(textWidth);

  textElementBounds = this.measureTextElement_.getBounds();

  //calculate text height and outer height
  var height;
  if (isHeightSet) {
    height = Math.ceil(anychart.utils.normalizeSize(/** @type {number|string} */(heightSettings), parentHeight));
    textHeight = padding.tightenHeight(height);
    outerBounds.height = height;
  } else {
    height = textElementBounds.height;
    outerBounds.height = padding.widenHeight(height);
  }

  if (goog.isDef(textHeight)) this.measureTextElement_.height(textHeight);

  var formattedPosition = goog.object.clone(this.positionFormatter_.call(positionProvider, positionProvider));
  var position = new acgraph.math.Coordinate(formattedPosition['x'], formattedPosition['y']);
  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new acgraph.math.Rect(0, 0, outerBounds.width, outerBounds.height),
      /** @type {string} */(anchor));

  position.x -= anchorCoordinate.x;
  position.y -= anchorCoordinate.y;

  offsetX = goog.isDef(offsetX) ? anychart.utils.normalizeSize(offsetX, parentWidth) : 0;
  offsetY = goog.isDef(offsetY) ? anychart.utils.normalizeSize(offsetY, parentHeight) : 0;

  anychart.utils.applyOffsetByAnchor(position, /** @type {anychart.enums.Anchor} */(anchor), offsetX, offsetY);

  outerBounds.left = position.x;
  outerBounds.top = position.y;

  return /**@type {anychart.math.Rect} */(outerBounds);
};


/**
 * Measure labels using formatProvider, positionProvider and returns labels bounds.
 * @param {*|anychart.core.ui.LabelsFactory.Label} formatProviderOrLabel Object that provides info for textFormatter function.
 * @param {*=} opt_positionProvider Object that provides info for positionFormatter function.
 * @param {Object=} opt_settings .
 * @return {anychart.math.Rect} Labels bounds.
 */
anychart.core.ui.LabelsFactory.prototype.measure = function(formatProviderOrLabel, opt_positionProvider, opt_settings) {
  var arr = this.measureWithTransform(formatProviderOrLabel, opt_positionProvider, opt_settings);
  return anychart.math.Rect.fromCoordinateBox(arr);
};


/**
 * Measures label in its coordinate system and returns bounds as an array of points in parent coordinate system.
 * @param {*|anychart.core.ui.LabelsFactory.Label} formatProviderOrLabel Object that provides info for textFormatter function.
 * @param {*=} opt_positionProvider Object that provides info for positionFormatter function.
 * @param {Object=} opt_settings .
 * @return {Array.<number>} Label bounds.
 */
anychart.core.ui.LabelsFactory.prototype.measureWithTransform = function(formatProviderOrLabel, opt_positionProvider, opt_settings) {
  var bounds = this.getDimension(formatProviderOrLabel, opt_positionProvider, opt_settings);

  var rotation, anchor;
  if (formatProviderOrLabel instanceof anychart.core.ui.LabelsFactory.Label) {
    rotation = goog.isDef(formatProviderOrLabel.rotation()) ? formatProviderOrLabel.rotation() : this.rotation();
    anchor = formatProviderOrLabel.anchor() || this.anchor();
  } else {
    rotation = goog.isDef(opt_settings) && goog.isDef(opt_settings['rotation']) ? opt_settings['rotation'] : this.rotation();
    anchor = goog.isDef(opt_settings) && opt_settings['anchor'] || this.anchor();
  }

  var rotationAngle = /** @type {number} */(rotation);
  var point = anychart.utils.getCoordinateByAnchor(bounds, /** @type {anychart.enums.Anchor} */(anchor));
  var tx = goog.graphics.AffineTransform.getRotateInstance(goog.math.toRadians(rotationAngle), point.x, point.y);

  var arr = bounds.toCoordinateBox() || [];
  tx.transform(arr, 0, arr, 0, 4);

  return arr;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Events
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Adds an event listener. A listener can only be added once to an
 * object and if it is added again the key for the listener is
 * returned. Note that if the existing listener is a one-off listener
 * (registered via listenOnce), it will no longer be a one-off
 * listener after a call to listen().
 *
 * @param {!goog.events.EventId.<EVENTOBJ>|string} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
anychart.core.ui.LabelsFactory.prototype.listen = function(type, listener, opt_useCapture, opt_listenerScope) {
  var res = goog.base(this, 'listen', type, listener, opt_useCapture, opt_listenerScope);
  this.ensureHandler_('' + type, !!opt_useCapture, true, false);
  return res;
};


/**
 * Adds an event listener that is removed automatically after the
 * listener fired once.
 *
 * If an existing listener already exists, listenOnce will do
 * nothing. In particular, if the listener was previously registered
 * via listen(), listenOnce() will not turn the listener into a
 * one-off listener. Similarly, if there is already an existing
 * one-off listener, listenOnce does not modify the listeners (it is
 * still a once listener).
 *
 * @param {!goog.events.EventId.<EVENTOBJ>|string} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
anychart.core.ui.LabelsFactory.prototype.listenOnce = function(type, listener, opt_useCapture, opt_listenerScope) {
  var res = goog.base(this, 'listenOnce', type, listener, opt_useCapture, opt_listenerScope);
  this.ensureHandler_('' + type, !!opt_useCapture, true, true);
  return res;
};


/**
 * Removes an event listener which was added with listen() or listenOnce().
 *
 * @param {!goog.events.EventId.<EVENTOBJ>|string} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call
 *     the listener.
 * @return {boolean} Whether any listener was removed.
 * @template SCOPE,EVENTOBJ
 */
anychart.core.ui.LabelsFactory.prototype.unlisten = function(type, listener, opt_useCapture, opt_listenerScope) {
  var res = goog.base(this, 'unlisten', type, listener, opt_useCapture, opt_listenerScope);
  this.ensureHandler_('' + type, !!opt_useCapture, false, false);
  return res;
};


/**
 * Removes an event listener which was added with listen() by the key
 * returned by listen().
 *
 * @param {goog.events.ListenableKey} key The key returned by
 *     listen() or listenOnce().
 * @return {boolean} Whether any listener was removed.
 */
anychart.core.ui.LabelsFactory.prototype.unlistenByKey = function(key) {
  var res = goog.base(this, 'unlistenByKey', key);
  if (res)
    this.ensureHandler_(key.type, key.capture, false, false);
  return res;
};


/**
 * Removes all listeners from this listenable. If type is specified,
 * it will only remove listeners of the particular type. otherwise all
 * registered listeners will be removed.
 *
 * @param {string=} opt_type Type of event to remove, default is to
 *     remove all types.
 * @return {number} Number of listeners removed.
 */
anychart.core.ui.LabelsFactory.prototype.removeAllListeners = function(opt_type) {
  var res = goog.base(this, 'removeAllListeners', opt_type);
  if (res) {
    if (opt_type) {
      this.ensureHandler_(/** @type {string} */(opt_type), false, false, false);
      this.ensureHandler_(/** @type {string} */(opt_type), true, false, false);
    } else {
      this.removeAllHandlers_();
    }
  }
  return res;
};



/**
 * Encapsulates browser event for acgraph.
 * @param {goog.events.BrowserEvent=} opt_e Normalized browser event to initialize this event.
 * @param {goog.events.EventTarget=} opt_target EventTarget to be set as a target of the event.
 * @constructor
 * @extends {goog.events.BrowserEvent}
 */
anychart.core.ui.LabelsFactory.BrowserEvent = function(opt_e, opt_target) {
  goog.base(this);
  if (opt_e)
    this.copyFrom(opt_e, opt_target);
};
goog.inherits(anychart.core.ui.LabelsFactory.BrowserEvent, goog.events.BrowserEvent);


/**
 * An override of BrowserEvent.event_ field to allow compiler to treat it properly.
 * @private
 * @type {goog.events.BrowserEvent}
 */
anychart.core.ui.LabelsFactory.BrowserEvent.prototype.event_;


/**
 * Copies all info from a BrowserEvent to represent a new one, rearmed event, that can be redispatched.
 * @param {goog.events.BrowserEvent} e Normalized browser event to copy the event from.
 * @param {goog.events.EventTarget=} opt_target EventTarget to be set as a target of the event.
 */
anychart.core.ui.LabelsFactory.BrowserEvent.prototype.copyFrom = function(e, opt_target) {
  this.type = e.type;

  // TODO (Anton Saukh): this awful typecast must be removed when it is no longer needed.
  // In the BrowserEvent.init() method there is a TODO from Santos, asking to change typification
  // from Node to EventTarget, which would make more sense.
  /** @type {Node} */
  var target = /** @type {Node} */(/** @type {Object} */(opt_target));
  this.target = target || e.target;
  this.currentTarget = e.currentTarget || this.target;
  this.relatedTarget = e.relatedTarget || this.target;

  this['labelIndex'] = e.target && e.target['__tagIndex'];
  if (isNaN(this['labelIndex']))
    this['labelIndex'] = -1;

  this.offsetX = e.offsetX;
  this.offsetY = e.offsetY;

  this.clientX = e.clientX;
  this.clientY = e.clientY;

  this.screenX = e.screenX;
  this.screenY = e.screenY;

  this.button = e.button;

  this.keyCode = e.keyCode;
  this.charCode = e.charCode;
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;
  this.shiftKey = e.shiftKey;
  this.metaKey = e.metaKey;
  this.platformModifierKey = e.platformModifierKey;
  this.state = e.state;

  this.event_ = e;
  delete this.propagationStopped_;
};


/**
 * Synchronizes Element and DOM handlers. Should be called after all handler operations on the Element are finished.
 * @param {string} type Event type string.
 * @param {boolean} capture If event should be listened on capture.
 * @param {boolean} armed If this handler should be armed or not.
 * @param {boolean=} opt_once Use listenOnce.
 * @private
 */
anychart.core.ui.LabelsFactory.prototype.ensureHandler_ = function(type, capture, armed, opt_once) {
  opt_once = !!opt_once && armed;
  /** @type {number} */
  var eventTypeCode = acgraph.vector.Element.HANDLED_EVENT_TYPES[type] || 0;
  if (capture)
    eventTypeCode = eventTypeCode << acgraph.vector.Element.HANDLED_EVENT_TYPES_CAPTURE_SHIFT;
  if (eventTypeCode) {
    var changed = false;
    /** @type {boolean} */
    var eventAttached = !!(this.attachedEvents_ & eventTypeCode);
    if (opt_once) {
      eventAttached = !!(this.attachedOnceEvents_ & eventTypeCode);
      if (armed && !eventAttached) {
        this.attachedOnceEvents_ |= eventTypeCode;
        changed = true;
      }
    } else {
      if (armed && !eventAttached) {
        this.attachedEvents_ |= eventTypeCode;
        changed = true;
      } else if (!armed && eventAttached) {
        this.attachedEvents_ &= ~eventTypeCode;
        this.attachedOnceEvents_ &= ~eventTypeCode;
        changed = true;
      }
    }
    if (changed)
      this.invalidate(anychart.ConsistencyState.HANDLERS, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Synchronizes Element and DOM handlers. Should be called after all handler operations on the Element are finished.
 * @private
 */
anychart.core.ui.LabelsFactory.prototype.removeAllHandlers_ = function() {
  var changed = !!(this.attachedEvents_ | this.attachedOnceEvents_);
  this.attachedEvents_ = 0;
  this.attachedOnceEvents_ = 0;
  if (changed)
    this.invalidate(anychart.ConsistencyState.HANDLERS, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Handles most of browser events happened with underlying DOM element redirecting them to
 * Element event listeners. Event.target property value is replaced by this method.
 * @param {goog.events.BrowserEvent} e Mouse event to handle.
 * @private
 */
anychart.core.ui.LabelsFactory.prototype.handleBrowserEvent_ = function(e) {
  if (e instanceof goog.events.BrowserEvent) {
    e.stopPropagation();
    var target = this.getLabel(e.target && e.target['__tagIndex']);
    if (target)
      this.dispatchEvent(new anychart.core.ui.LabelsFactory.BrowserEvent(e, target));
  }
};



//----------------------------------------------------------------------------------------------------------------------
//
//  LabelsFactory label class.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Class for creation of sets of similar labels and management of such sets.
 * Any individual label can be changed after all labels are displayed.
 * @constructor
 * @extends {anychart.core.Text}
 */
anychart.core.ui.LabelsFactory.Label = function() {
  goog.base(this);

  /**
   * Label index.
   * @type {number}
   * @private
   */
  this.index_;

  /**
   * Label layer
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_;

  /**
   * @type {acgraph.vector.Text}
   * @private
   */
  this.textElement_;

  /**
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.backgroundElement_;

  this.resetSettings();
};
goog.inherits(anychart.core.ui.LabelsFactory.Label, anychart.core.Text);


/**
 * Supported signals.
 * @type {number}
 */
anychart.core.ui.LabelsFactory.Label.prototype.SUPPORTED_SIGNALS = anychart.core.Text.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.LabelsFactory.Label.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Text.prototype.SUPPORTED_CONSISTENCY_STATES;


/**
 * Returns DOM element.
 * @return {acgraph.vector.Layer}
 */
anychart.core.ui.LabelsFactory.Label.prototype.getDomElement = function() {
  return this.layer_;
};


/**
 * Gets/sets parent LabelsFactory.
 * @param {!anychart.core.ui.LabelsFactory=} opt_value labels factory.
 * @return {anychart.core.ui.LabelsFactory|anychart.core.ui.LabelsFactory.Label} Returns LabelsFactory or self
 * for method chainging.
 */
anychart.core.ui.LabelsFactory.Label.prototype.parentLabelsFactory = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (this.parentLabelsFactory_ != opt_value) {
      this.parentLabelsFactory_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.parentLabelsFactory_;
  }
};


/**
 * Returns label index.
 * @return {number}
 */
anychart.core.ui.LabelsFactory.Label.prototype.getIndex = function() {
  return this.index_;
};


/**
 * Sets labels index.
 * @param {number} index Index to set.
 * @return {anychart.core.ui.LabelsFactory.Label}
 */
anychart.core.ui.LabelsFactory.Label.prototype.setIndex = function(index) {
  this.index_ = +index;
  return this;
};


/**
 * Gets/sets LabelsFactory to a label.
 * @param {anychart.core.ui.LabelsFactory=} opt_value labels factory.
 * @return {anychart.core.ui.LabelsFactory|anychart.core.ui.LabelsFactory.Label} Returns LabelsFactory or self
 * for method chainging.
 */
anychart.core.ui.LabelsFactory.Label.prototype.currentLabelsFactory = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.currentLabelsFactory_ != opt_value) {
      this.currentLabelsFactory_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.currentLabelsFactory_;
  }
};


/**
 * Gets or sets the Label background settings.
 * @param {(string|Object|null|boolean)=} opt_value Background object to set.
 * @return {!(anychart.core.ui.LabelsFactory.Label|anychart.core.ui.Background)} Returns background or itself for chaining.
 */
anychart.core.ui.LabelsFactory.Label.prototype.background = function(opt_value) {
  var makeDefault = goog.isNull(opt_value);
  if (!makeDefault && !this.settingsObj.background) {
    this.settingsObj.background = new anychart.core.ui.Background();
    this.registerDisposable(this.settingsObj.background);
    this.settingsObj.background.listenSignals(this.backgroundInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (makeDefault)
      goog.dispose(this.settingsObj.background);
    else
      this.settingsObj.background.setup(opt_value);
    return this;
  }
  return this.settingsObj.background;
};


/**
 * Internal background invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.LabelsFactory.Label.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter for current label padding.<br/>
 * @param {(null|string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {anychart.core.ui.LabelsFactory.Label|anychart.core.utils.Padding} .
 */
anychart.core.ui.LabelsFactory.Label.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  var makeDefault = goog.isNull(opt_spaceOrTopOrTopAndBottom);
  if (!makeDefault && !this.settingsObj.padding) {
    this.settingsObj.padding = new anychart.core.utils.Padding();
    this.registerDisposable(this.settingsObj.padding);
    this.settingsObj.padding.listenSignals(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    if (makeDefault)
      goog.dispose(this.settingsObj.padding);
    else
      this.settingsObj.padding.setup.apply(this.settingsObj.padding, arguments);
    return this;
  }
  return this.settingsObj.padding;
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.ui.LabelsFactory.Label.prototype.boundsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * Getter for label width.
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.core.ui.LabelsFactory.Label|number|string|null} .
 */
anychart.core.ui.LabelsFactory.Label.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.settingsObj.width !== opt_value) {
      this.settingsObj.width = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.settingsObj.width;
};


/**
 * Getter for label height.
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.core.ui.LabelsFactory.Label|number|string|null} .
 */
anychart.core.ui.LabelsFactory.Label.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.settingsObj.height !== opt_value) {
      this.settingsObj.height = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.settingsObj.height;
};


/**
 * Rotates a label around an anchor.
 * ({@link acgraph.vector.Element}). Method resets transformation and applies a new one.
 * @param {number=} opt_value Rotation angle in degrees.
 * @return {number|anychart.core.ui.LabelsFactory.Label} Rotation angle in degrees or self for chaining call.
 */
anychart.core.ui.LabelsFactory.Label.prototype.rotation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value;
    if (this.settingsObj.rotationAngle !== opt_value) {
      this.settingsObj.rotationAngle = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.settingsObj.rotationAngle;
  }
};


/**
 * Getter for label anchor settings.
 * @param {(anychart.enums.Anchor|string)=} opt_value .
 * @return {!anychart.core.ui.LabelsFactory.Label|anychart.enums.Anchor} .
 */
anychart.core.ui.LabelsFactory.Label.prototype.anchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeAnchor(opt_value);
    if (this.settingsObj.anchor !== opt_value) {
      this.settingsObj.anchor = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.settingsObj.anchor;
  }
};


/**
 * Getter for current label offsetX settings.
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.core.ui.LabelsFactory.Label} .
 */
anychart.core.ui.LabelsFactory.Label.prototype.offsetX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.settingsObj.offsetX = opt_value;
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else {
    return this.settingsObj.offsetX;
  }
};


/**
 * Getter for current label offsetY settings.
 * @param {(number|string)=} opt_value .
 * @return {number|string|anychart.core.ui.LabelsFactory.Label} .
 */
anychart.core.ui.LabelsFactory.Label.prototype.offsetY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.settingsObj.offsetY = opt_value;
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
    return this;
  } else {
    return this.settingsObj.offsetY;
  }
};


/**
 * Getter for current label position settings.
 * @param {string=} opt_value .
 * @return {!anychart.core.ui.LabelsFactory.Label|string} .
 */
anychart.core.ui.LabelsFactory.Label.prototype.position = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = String(opt_value);
    if (this.settingsObj.position != opt_value) {
      this.settingsObj.position = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return /** @type {anychart.enums.Position} */(this.settingsObj.position);
  }
};


/** @inheritDoc */
anychart.core.ui.LabelsFactory.Label.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.settingsObj.enabledLabel != opt_value) {
      this.settingsObj.enabledLabel = opt_value;
      this.invalidate(anychart.ConsistencyState.ENABLED, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.settingsObj.enabledLabel;
  }
};


/**
 * Gets/Sets text formatter.
 * @param {*=} opt_value Text formatter.
 * @return {*} Text formatter or itself for chaining.
 */
anychart.core.ui.LabelsFactory.Label.prototype.textFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.settingsObj.textFormatter != opt_value) {
      this.settingsObj.textFormatter = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.settingsObj.textFormatter;
  }
};


/**
 * Gets/Sets position formatter.
 * @param {*=} opt_value Position formatter.
 * @return {*} Position formatter or self for chaining.
 */
anychart.core.ui.LabelsFactory.Label.prototype.positionFormatter = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.settingsObj.positionFormatter != opt_value) {
      this.settingsObj.positionFormatter = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.settingsObj.positionFormatter;
  }
};


/**
 * Gets/Sets format provider.
 * @param {*=} opt_value Format provider.
 * @return {*} Format provider or self for chaining.
 */
anychart.core.ui.LabelsFactory.Label.prototype.formatProvider = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.formatProvider_ != opt_value) {
      this.formatProvider_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.formatProvider_;
  }
};


/**
 * Gets/Sets position provider.
 * @param {*=} opt_value Position provider.
 * @return {*} Position provider or self for chaining.
 */
anychart.core.ui.LabelsFactory.Label.prototype.positionProvider = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.positionProvider_ != opt_value) {
      this.positionProvider_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.positionProvider_;
  }
};


/**
 * Resets label to the initial state, but leaves DOM elements intact, but without the parent.
 */
anychart.core.ui.LabelsFactory.Label.prototype.clear = function() {
  this.resetSettings();
  if (this.layer_) {
    this.layer_.parent(null);
    this.layer_.removeAllListeners();
  }
  this.invalidate(anychart.ConsistencyState.CONTAINER);
};


/**
 * Reset settings.
 */
anychart.core.ui.LabelsFactory.Label.prototype.resetSettings = function() {
  this.settingsObj = {};
  this.changedSettings = {};
  this.superSettingsObj = {};
};


/**
 * Sets settings.
 * @param {Object=} opt_settings1 Settings1.
 * @param {Object=} opt_settings2 Settings2.
 * @return {anychart.core.ui.LabelsFactory.Label} Returns self for chaining.
 */
anychart.core.ui.LabelsFactory.Label.prototype.setSettings = function(opt_settings1, opt_settings2) {
  if (goog.isDef(opt_settings1)) {
    this.setup(opt_settings1);
  }
  if (goog.isDef(opt_settings2)) this.superSettingsObj = opt_settings2;

  if (goog.isDef(opt_settings1) || goog.isDef(opt_settings2))
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ENABLED,
        anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW);
  return this;
};


/**
 * Label drawing.
 * @return {anychart.core.ui.LabelsFactory.Label} Returns self for chaining.
 */
anychart.core.ui.LabelsFactory.Label.prototype.draw = function() {
  var parentLabelsFactory = this.parentLabelsFactory();
  var currentLabelsFactory = this.currentLabelsFactory();
  var labelsFactory = currentLabelsFactory ? currentLabelsFactory : parentLabelsFactory;
  var settingsChangedStates;
  var notSelfSettings = labelsFactory != parentLabelsFactory;
  if (notSelfSettings)
    settingsChangedStates = labelsFactory.getSettingsChangedStatesObj();
  if (!this.layer_) this.layer_ = acgraph.layer();

  var enabled = notSelfSettings ?
      goog.isDef(this.superSettingsObj['enabled']) ?
          this.superSettingsObj['enabled'] :
          labelsFactory.enabled() ?
              labelsFactory.enabled() :
              goog.isDef(this.enabled()) ?
                  this.enabled() :
                  parentLabelsFactory.enabled() :
      goog.isDef(this.enabled()) ?
          this.enabled() :
          parentLabelsFactory.enabled();

  if (this.hasInvalidationState(anychart.ConsistencyState.ENABLED) ||
      labelsFactory.hasInvalidationState(anychart.ConsistencyState.ENABLED)) {
    if (!enabled) {
      if (this.layer_) this.layer_.parent(null);
      this.markConsistent(anychart.ConsistencyState.ALL);
      return this;
    } else {
      if (this.container() && !this.layer_.parent())
        this.layer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
      this.markConsistent(anychart.ConsistencyState.ENABLED);
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER) ||
      labelsFactory.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (enabled) {
      if ((!parentLabelsFactory.enabled() || (goog.isDef(this.enabled()) && !this.enabled())) && parentLabelsFactory.getDomElement()) {
        if (!this.container()) this.container(parentLabelsFactory.getDomElement());
        if (!this.container().parent()) {
          this.container().parent(/** @type {acgraph.vector.ILayer} */(parentLabelsFactory.container()));
        }
      }
      if (this.container())
        this.layer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    }
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    if (this.container()) this.container().zIndex(/** @type {number} */(parentLabelsFactory.zIndex()));
    this.layer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE) ||
      labelsFactory.hasInvalidationState(anychart.ConsistencyState.BOUNDS) ||
      labelsFactory.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var background = notSelfSettings ?
        goog.isDef(this.superSettingsObj['background']) ?
            this.superSettingsObj['background'] :
                settingsChangedStates && settingsChangedStates['background'] ?
            labelsFactory.background() :
            goog.isDef(this.settingsObj.background) ?
                this.settingsObj.background :
                parentLabelsFactory.background() :
        goog.isDef(this.settingsObj.background) ?
            this.settingsObj.background :
            parentLabelsFactory.background();

    var padding = notSelfSettings ?
        goog.isDef(this.superSettingsObj['padding']) ?
            this.superSettingsObj['padding'] :
                settingsChangedStates && settingsChangedStates['padding'] ?
            labelsFactory.padding() :
            goog.isDef(this.settingsObj.padding) ?
                this.settingsObj.padding :
                parentLabelsFactory.padding() :
        goog.isDef(this.settingsObj.padding) ?
            this.settingsObj.padding :
            parentLabelsFactory.padding();

    var widthSettings = notSelfSettings ?
        goog.isDef(this.superSettingsObj['width']) ?
            this.superSettingsObj['width'] :
                settingsChangedStates && settingsChangedStates['width'] ?
            labelsFactory.width() :
            goog.isDef(this.settingsObj.width) ?
                this.settingsObj.width :
                parentLabelsFactory.width() :
        goog.isDef(this.settingsObj.width) ?
            this.settingsObj.width :
            parentLabelsFactory.width();

    var heightSettings = notSelfSettings ?
        goog.isDef(this.superSettingsObj['height']) ?
            this.superSettingsObj['height'] :
                settingsChangedStates && settingsChangedStates['height'] ?
            labelsFactory.height() :
            goog.isDef(this.settingsObj.height) ?
                this.settingsObj.height :
                parentLabelsFactory.height() :
        goog.isDef(this.settingsObj.height) ?
            this.settingsObj.height :
            parentLabelsFactory.height();

    var offsetY = notSelfSettings ?
        goog.isDef(this.superSettingsObj['offsetY']) ?
            this.superSettingsObj['offsetY'] :
                settingsChangedStates && settingsChangedStates['offsetY'] ?
            labelsFactory.offsetY() :
            goog.isDef(this.settingsObj.offsetY) ?
                this.settingsObj.offsetY :
                parentLabelsFactory.offsetY() :
        goog.isDef(this.settingsObj.offsetY) ?
            this.settingsObj.offsetY :
            parentLabelsFactory.offsetY();

    var offsetX = notSelfSettings ?
        goog.isDef(this.superSettingsObj['offsetX']) ?
            this.superSettingsObj['offsetX'] :
                settingsChangedStates && settingsChangedStates['offsetX'] ?
            labelsFactory.offsetX() :
            goog.isDef(this.settingsObj.offsetX) ?
                this.settingsObj.offsetX :
                parentLabelsFactory.offsetX() :
        goog.isDef(this.settingsObj.offsetX) ?
            this.settingsObj.offsetX :
            parentLabelsFactory.offsetX();

    var anchor = /** @type {anychart.enums.Anchor} */(notSelfSettings ?
        goog.isDef(this.superSettingsObj['anchor']) ?
            this.superSettingsObj['anchor'] :
                settingsChangedStates && settingsChangedStates['anchor'] ?
            labelsFactory.anchor() :
            goog.isDef(this.settingsObj.anchor) ?
                this.settingsObj.anchor :
                parentLabelsFactory.anchor() :
        goog.isDef(this.settingsObj.anchor) ?
            this.settingsObj.anchor :
            parentLabelsFactory.anchor());

    var rotationAngle = notSelfSettings ?
        goog.isDef(this.superSettingsObj['rotation']) ?
            this.superSettingsObj['rotation'] :
                settingsChangedStates && settingsChangedStates['rotation'] ?
            labelsFactory.rotation() :
            goog.isDef(this.settingsObj.rotationAngle) ?
                this.settingsObj.rotationAngle :
                parentLabelsFactory.rotation() :
        goog.isDef(this.settingsObj.rotationAngle) ?
            this.settingsObj.rotationAngle :
            parentLabelsFactory.rotation();

    var textFormatter = notSelfSettings ?
        goog.isDef(this.superSettingsObj['textFormatter']) ?
            this.superSettingsObj['textFormatter'] :
                settingsChangedStates && settingsChangedStates['textFormatter'] ?
            labelsFactory.textFormatter() :
            goog.isDef(this.settingsObj.textFormatter) ?
                this.settingsObj.textFormatter :
                parentLabelsFactory.textFormatter() :
        goog.isDef(this.settingsObj.textFormatter) ?
            this.settingsObj.textFormatter :
            parentLabelsFactory.textFormatter();

    var positionFormatter = notSelfSettings ?
        goog.isDef(this.superSettingsObj['positionFormatter']) ?
            this.superSettingsObj['positionFormatter'] :
                settingsChangedStates && settingsChangedStates['positionFormatter'] ?
            labelsFactory.positionFormatter() :
            goog.isDef(this.settingsObj.positionFormatter) ?
                this.settingsObj.positionFormatter :
                parentLabelsFactory.positionFormatter() :
        goog.isDef(this.settingsObj.positionFormatter) ?
            this.settingsObj.positionFormatter :
            parentLabelsFactory.positionFormatter();

    var formatProvider = this.formatProvider();
    var text = textFormatter.call(formatProvider, formatProvider);

    this.layer_.setTransformationMatrix(1, 0, 0, 1, 0, 0);

    if (!this.backgroundElement_) {
      this.backgroundElement_ = new anychart.core.ui.Background();
      this.backgroundElement_.zIndex(0);
      this.backgroundElement_.container(this.layer_);
    }
    this.backgroundElement_.setup(background.serialize());
    this.backgroundElement_.draw();


    if (!this.textElement_) {
      this.textElement_ = acgraph.text();
      this.textElement_.zIndex(1);
      this.textElement_.parent(this.layer_);
      this.textElement_.disablePointerEvents(true);
    }
    //define parent bounds
    var parentWidth, parentHeight;
    var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
    if (parentBounds) {
      parentWidth = parentBounds.width;
      parentHeight = parentBounds.height;
    }

    var isHtml = parentLabelsFactory.useHtml() || labelsFactory.useHtml() || this.useHtml();

    this.textElement_.width(null);
    this.textElement_.height(null);

    if (isHtml) this.textElement_.htmlText(goog.isDef(text) ? String(text) : '');
    else this.textElement_.text(goog.isDef(text) ? String(text) : '');

    parentLabelsFactory.applyTextSettings(this.textElement_, true);
    if (notSelfSettings) labelsFactory.applyTextSettings(this.textElement_, false);
    this.applyTextSettings(this.textElement_, false);
    if (notSelfSettings) {
      this.textSettings(this.superSettingsObj);
      this.applyTextSettings(this.textElement_, false);
    }

    //define is width and height set from settings
    var isWidthSet = !goog.isNull(widthSettings);
    var isHeightSet = !goog.isNull(heightSettings);

    //we should ask text element about bounds only after text format and text settings are applied
    var textElementBounds = this.textElement_.getBounds();

    /** @type  {anychart.math.Rect} */
    var outerBounds = new anychart.math.Rect(0, 0, 0, 0);
    //calculate text width and outer width
    var width, textX, textWidth;
    if (isWidthSet) {
      width = Math.ceil(anychart.utils.normalizeSize(/** @type {number|string} */(widthSettings), parentWidth));
      if (padding) {
        textWidth = padding.tightenWidth(width);
        textX = anychart.utils.normalizeSize(padding.left(), width);
      } else {
        textX = 0;
        textWidth = width;
      }
      outerBounds.width = width;
    } else {
      width = textElementBounds.width;
      if (padding) {
        outerBounds.width = padding.widenWidth(width);
        textX = anychart.utils.normalizeSize(padding.left(), outerBounds.width);
      } else {
        textX = 0;
        outerBounds.width = width;
      }
    }
    if (goog.isDef(textWidth)) this.textElement_.width(textWidth);

    //we should ask text element about bounds only after text format and text settings are applied
    textElementBounds = this.textElement_.getBounds();

    //calculate text height and outer height
    var height, textY, textHeight;
    if (isHeightSet) {
      height = Math.ceil(anychart.utils.normalizeSize(/** @type {number|string} */(heightSettings), parentHeight));
      if (padding) {
        textHeight = padding.tightenHeight(height);
        textY = anychart.utils.normalizeSize(padding.top(), height);
      } else {
        textY = 0;
        textHeight = height;
      }
      outerBounds.height = height;
    } else {
      height = textElementBounds.height;
      if (padding) {
        outerBounds.height = padding.widenHeight(height);
        textY = anychart.utils.normalizeSize(padding.top(), outerBounds.height);
      } else {
        textY = 0;
        outerBounds.height = height;
      }
    }

    if (goog.isDef(textHeight)) this.textElement_.height(textHeight);
    var positionProvider = this.positionProvider();
    var formattedPosition = goog.object.clone(positionFormatter.call(positionProvider, positionProvider));
    var position = new acgraph.math.Coordinate(formattedPosition['x'], formattedPosition['y']);
    var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
        new acgraph.math.Rect(0, 0, outerBounds.width, outerBounds.height), anchor);

    position.x -= anchorCoordinate.x;
    position.y -= anchorCoordinate.y;

    offsetX = goog.isDef(offsetX) ? anychart.utils.normalizeSize(/** @type {number|string} */(offsetX), parentWidth) : 0;
    offsetY = goog.isDef(offsetY) ? anychart.utils.normalizeSize(/** @type {number|string} */(offsetY), parentHeight) : 0;

    anychart.utils.applyOffsetByAnchor(position, anchor, offsetX, offsetY);

    textX += position.x;
    textY += position.y;
    outerBounds.left = position.x;
    outerBounds.top = position.y;

    this.textElement_.x(/** @type {number} */(textX)).y(/** @type {number} */(textY));

    this.backgroundElement_.parentBounds(outerBounds);
    this.backgroundElement_.draw();

    this.layer_.setRotationByAnchor(/** @type {number} */(rotationAngle), anchor);

    this.markConsistent(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS);
  }
  return this;
};


/** @inheritDoc */
anychart.core.ui.LabelsFactory.Label.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['background'] = this.settingsObj.background ? this.background().serialize() : null;
  json['padding'] = this.settingsObj.padding ? this.padding().serialize() : null;
  json['position'] = this.position();
  json['anchor'] = this.anchor();
  json['offsetX'] = this.offsetX();
  json['offsetY'] = this.offsetY();
  json['rotation'] = this.rotation();
  json['width'] = this.width();
  json['height'] = this.height();
  json['rotation'] = this.rotation();
  return json;
};


/** @inheritDoc */
anychart.core.ui.LabelsFactory.Label.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);
  if (goog.isDef(config['background'])) this.background(config['background']);
  if (goog.isDef(config['padding'])) this.padding(config['padding']);
  this.position(config['position']);
  this.anchor(config['anchor']);
  this.offsetX(config['offsetX']);
  this.offsetY(config['offsetY']);
  this.rotation(config['rotation']);
  this.width(config['width']);
  this.height(config['height']);
  this.rotation(config['rotation']);
};


//exports
anychart.core.ui.LabelsFactory.prototype['background'] = anychart.core.ui.LabelsFactory.prototype.background;
anychart.core.ui.LabelsFactory.prototype['padding'] = anychart.core.ui.LabelsFactory.prototype.padding;
anychart.core.ui.LabelsFactory.prototype['textFormatter'] = anychart.core.ui.LabelsFactory.prototype.textFormatter;
anychart.core.ui.LabelsFactory.prototype['positionFormatter'] = anychart.core.ui.LabelsFactory.prototype.positionFormatter;
anychart.core.ui.LabelsFactory.prototype['position'] = anychart.core.ui.LabelsFactory.prototype.position;
anychart.core.ui.LabelsFactory.prototype['anchor'] = anychart.core.ui.LabelsFactory.prototype.anchor;
anychart.core.ui.LabelsFactory.prototype['offsetX'] = anychart.core.ui.LabelsFactory.prototype.offsetX;
anychart.core.ui.LabelsFactory.prototype['offsetY'] = anychart.core.ui.LabelsFactory.prototype.offsetY;
anychart.core.ui.LabelsFactory.prototype['rotation'] = anychart.core.ui.LabelsFactory.prototype.rotation;
anychart.core.ui.LabelsFactory.prototype['width'] = anychart.core.ui.LabelsFactory.prototype.width;
anychart.core.ui.LabelsFactory.prototype['height'] = anychart.core.ui.LabelsFactory.prototype.height;
anychart.core.ui.LabelsFactory.prototype['enabled'] = anychart.core.ui.LabelsFactory.prototype.enabled;
anychart.core.ui.LabelsFactory.Label.prototype['padding'] = anychart.core.ui.LabelsFactory.Label.prototype.padding;
anychart.core.ui.LabelsFactory.Label.prototype['rotation'] = anychart.core.ui.LabelsFactory.Label.prototype.rotation;
anychart.core.ui.LabelsFactory.Label.prototype['getIndex'] = anychart.core.ui.LabelsFactory.Label.prototype.getIndex;