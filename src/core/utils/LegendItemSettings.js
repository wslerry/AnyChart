goog.provide('anychart.core.utils.LegendItemSettings');
goog.require('anychart.core.Text');
goog.require('anychart.enums');



/**
 * Helper class for maintaining legend item settings for series legend icon
 * @constructor
 * @extends {anychart.core.Text}
 */
anychart.core.utils.LegendItemSettings = function() {
  goog.base(this);

  // Remove all default text settings that was set by anychart.core.Text
  this.settingsObj = {};
};
goog.inherits(anychart.core.utils.LegendItemSettings, anychart.core.Text);


/**
 * Mark all state as consistent.
 */
anychart.core.utils.LegendItemSettings.prototype.markAllConsistent = function() {
  this.markConsistent(this.SUPPORTED_CONSISTENCY_STATES);
};


/**
 * Getter/setter for iconTextSpacing setting.
 * @param {number=} opt_value Value of spacing between icon and text.
 * @return {(anychart.core.utils.LegendItemSettings|number)} Spacing between icon and text or self for method chaining.
 */
anychart.core.utils.LegendItemSettings.prototype.iconTextSpacing = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !anychart.utils.isNaN(opt_value) ? +opt_value : 5;
    if (this.iconTextSpacing_ != opt_value) {
      this.iconTextSpacing_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.iconTextSpacing_;
};


/**
 * Getter/setter for iconEnabled setting
 * @param {boolean=} opt_value Whether to show item icon or not.
 * @return {(boolean|anychart.core.utils.LegendItemSettings)} iconEnabled setting or self for method chaining.
 */
anychart.core.utils.LegendItemSettings.prototype.iconEnabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.iconEnabled_ != opt_value) {
      this.iconEnabled_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.iconEnabled_;
};


/**
 * Getter/setter for icon type.
 * @param {(anychart.enums.LegendItemIconType|string|function(acgraph.vector.Path, number))=} opt_value Icon type or custom drawer function.
 * @return {(anychart.enums.LegendItemIconType|function(acgraph.vector.Path, number)|anychart.core.utils.LegendItemSettings)} icon type or drawer function or self for method chaining.
 */
anychart.core.utils.LegendItemSettings.prototype.iconType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(opt_value))
      opt_value = anychart.enums.normalizeLegendItemIconType(opt_value);
    if (this.iconType_ != opt_value) {
      this.iconType_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.iconType_;
};


/**
 * Getter/setter for legend item icon fill setting.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.utils.LegendItemSettings|Function} .
 */
anychart.core.utils.LegendItemSettings.prototype.iconFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        acgraph.vector.normalizeFill.apply(null, arguments);
    if (fill != this.iconFill_) {
      this.iconFill_ = fill;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.iconFill_;
};


/**
 * Getter/setter for legend item icon stroke setting.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line joint style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.utils.LegendItemSettings|acgraph.vector.Stroke|Function} .
 */
anychart.core.utils.LegendItemSettings.prototype.iconStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        acgraph.vector.normalizeStroke.apply(null, arguments);
    if (stroke != this.iconStroke_) {
      this.iconStroke_ = stroke;
      this.dispatchSignal(anychart.Signal.NEED_UPDATE_LEGEND);
    }
    return this;
  }
  return this.iconStroke_;
};


/**
 * Getter/setter for iconHatchFill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string)=} opt_patternFillOrTypeOrState PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.core.utils.LegendItemSettings|Function} Hatch fill.
 */
anychart.core.utils.LegendItemSettings.prototype.iconHatchFill = function(opt_patternFillOrTypeOrState, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrTypeOrState)) {
    var hatchFill = goog.isFunction(opt_patternFillOrTypeOrState) ?
        opt_patternFillOrTypeOrState :
        acgraph.vector.normalizeHatchFill.apply(null, arguments);
    if (hatchFill != this.iconHatchFill_) {
      this.iconHatchFill_ = hatchFill;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return /** @type {acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function} */ (this.iconHatchFill_);
};


/**
 * Getter/setter for marker type.
 * Usable with line, spline, step line icon types.
 * @param {?(anychart.enums.MarkerType|function(acgraph.vector.Path, number, number, number):acgraph.vector.Path)=} opt_value Marker type.
 * @return {(anychart.enums.MarkerType|anychart.core.utils.LegendItemSettings|Function)} iconMarkerType or self for method chaining.
 */
anychart.core.utils.LegendItemSettings.prototype.iconMarkerType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!goog.isFunction(opt_value))
      opt_value = anychart.enums.normalizeMarkerType(opt_value);
    if (this.iconMarkerType_ != opt_value) {
      this.iconMarkerType_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.iconMarkerType_;
};


/**
 * Getter/setter for icon marker fill setting.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!anychart.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!anychart.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|string|anychart.core.utils.LegendItemSettings} .
 */
anychart.core.utils.LegendItemSettings.prototype.iconMarkerFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var color = acgraph.vector.normalizeFill.apply(null, arguments);
    if (this.iconMarkerFill_ != color) {
      this.iconMarkerFill_ = color;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.iconMarkerFill_;
  }
};


/**
 * Getter/setter for icon marker stroke setting.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Stroke settings,
 *    if used as a setter.
 * @param {number=} opt_thickness Line thickness. If empty - set to 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: 5,3,2 is equivalent to dashpattern: 5,3,2,5,3,2.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {acgraph.vector.Stroke|string|anychart.core.utils.LegendItemSettings} .
 */
anychart.core.utils.LegendItemSettings.prototype.iconMarkerStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var color = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (this.iconMarkerStroke_ != color) {
      this.iconMarkerStroke_ = color;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.iconMarkerStroke_;
  }
};


/**
 * Getter/setter for icon size of legend item.
 * @param {(number|string)=} opt_value Icon size setting.
 * @return {(number|anychart.core.utils.LegendItemSettings)} Icon size or self for method chaining.
 */
anychart.core.utils.LegendItemSettings.prototype.iconSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (this.iconSize_ != opt_value) {
      this.iconSize_ = /** @type {number} */ (opt_value);
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.iconSize_;
};


/**
 * Getter/setter for legend item text.
 * @param {string=} opt_value Legend item text.
 * @return {(string|anychart.core.utils.LegendItemSettings)} Legend item text or self for method chaining.
 */
anychart.core.utils.LegendItemSettings.prototype.text = function(opt_value) {
  return /** @type {!anychart.core.utils.LegendItemSettings|string} */(this.textSettings('text', opt_value));
};


/**
 * Getter/setter for disabled setting.
 * @param {boolean=} opt_value Is this item disabled.
 * @return {(boolean|anychart.core.utils.LegendItemSettings)} Disabled setting or self for chaining.
 */
anychart.core.utils.LegendItemSettings.prototype.disabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.disabled_ != opt_value) {
      this.disabled_ = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.disabled_;
};


/**
 * Gets JSON object for creating a legend item.
 * @return {Object}
 */
anychart.core.utils.LegendItemSettings.prototype.getJSON = function() {
  // retrieve anychart.core.Text settings
  var json = anychart.core.utils.LegendItemSettings.superClass_.serialize.call(this);
  if (goog.isDef(this.iconTextSpacing()))
    json['iconTextSpacing'] = this.iconTextSpacing();
  if (goog.isDef(this.text()))
    json['text'] = this.text();
  if (goog.isDef(this.iconEnabled()))
    json['iconEnabled'] = this.iconEnabled();
  if (goog.isDef(this.iconType()))
    json['iconType'] = this.iconType();
  if (goog.isDef(this.iconFill()))
    json['iconFill'] = this.iconFill();
  if (goog.isDef(this.iconStroke()))
    json['iconStroke'] = this.iconStroke();
  if (goog.isDef(this.iconHatchFill()))
    json['iconHatchFill'] = this.iconHatchFill();
  if (goog.isDef(this.iconMarkerType()))
    json['iconMarkerType'] = this.iconMarkerType();
  if (goog.isDef(this.iconMarkerFill()))
    json['iconMarkerFill'] = this.iconMarkerFill();
  if (goog.isDef(this.iconMarkerStroke()))
    json['iconMarkerStroke'] = this.iconMarkerStroke();
  if (goog.isDef(this.disabled()))
    json['disabled'] = this.disabled();
  return json;
};


/** @inheritDoc */
anychart.core.utils.LegendItemSettings.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  if (goog.isDef(this.iconTextSpacing()))
    json['iconTextSpacing'] = this.iconTextSpacing();
  if (goog.isDefAndNotNull(this.text()))
    json['text'] = this.text();
  if (goog.isDef(this.iconEnabled()))
    json['iconEnabled'] = this.iconEnabled();
  if (goog.isDef(this.iconSize()))
    json['iconSize'] = this.iconSize();

  //if (goog.isFunction(this.iconType())) {
  //  anychart.utils.warning(
  //      anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
  //      null,
  //      ['LegendItemSetting iconType']
  //  );
  //} else {
  if (goog.isDef(this.iconType()))
    json['iconType'] = this.iconType();
  //}

  //if (goog.isFunction(this.iconMarkerType())) {
  //  anychart.utils.warning(
  //      anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
  //      null,
  //      ['LegendItemSetting iconMarkerType']
  //  );
  //} else {
  if (goog.isDef(this.iconMarkerType()))
    json['iconMarkerType'] = this.iconMarkerType();
  //}

  if (goog.isDef(this.disabled()))
    json['disabled'] = this.disabled();

  //if (goog.isFunction(this.iconFill())) {
  //  anychart.utils.warning(
  //      anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
  //      null,
  //      ['LegendItemSetting iconFill']
  //  );
  //} else {
  if (goog.isDef(this.iconFill()))
    json['iconFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.iconFill()));
  //}

  //if (goog.isFunction(this.iconStroke())) {
  //  anychart.utils.warning(
  //      anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
  //      null,
  //      ['LegendItemSetting iconStroke']
  //  );
  //} else {
  if (goog.isDef(this.iconStroke()))
    json['iconStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.iconStroke()));
  //}

  //if (goog.isFunction(this.iconHatchFill())) {
  //  anychart.utils.warning(
  //      anychart.enums.WarningCode.CANT_SERIALIZE_FUNCTION,
  //      null,
  //      ['LegendItemSetting iconHatchFill']
  //  );
  //} else {
  if (goog.isDef(this.iconHatchFill()))
    json['iconHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.iconHatchFill()));
  //}

  if (goog.isDef(this.iconMarkerFill()))
    json['iconMarkerFill'] = this.iconMarkerFill();
  if (goog.isDef(this.iconMarkerStroke()))
    json['iconMarkerStroke'] = this.iconMarkerStroke();

  return json;
};


/** @inheritDoc */
anychart.core.utils.LegendItemSettings.prototype.setupByJSON = function(config) {
  this.suspendSignalsDispatching();
  goog.base(this, 'setupByJSON', config);
  this.iconTextSpacing(config['iconTextSpacing']);
  this.iconEnabled(config['iconEnabled']);
  this.iconType(config['iconType']);
  this.iconStroke(config['iconStroke']);
  this.iconFill(config['iconFill']);
  this.iconHatchFill(config['iconHatchFill']);
  this.iconMarkerType(config['iconMarkerType']);
  this.iconMarkerFill(config['iconMarkerFill']);
  this.iconMarkerStroke(config['iconMarkerStroke']);
  this.iconSize(config['iconSize']);
  this.text(config['text']);
  this.disabled(config['disabled']);
  this.resumeSignalsDispatching(true);
};

//exports
anychart.core.utils.LegendItemSettings.prototype['iconTextSpacing'] = anychart.core.utils.LegendItemSettings.prototype.iconTextSpacing;
anychart.core.utils.LegendItemSettings.prototype['iconEnabled'] = anychart.core.utils.LegendItemSettings.prototype.iconEnabled;
anychart.core.utils.LegendItemSettings.prototype['iconType'] = anychart.core.utils.LegendItemSettings.prototype.iconType;
anychart.core.utils.LegendItemSettings.prototype['iconFill'] = anychart.core.utils.LegendItemSettings.prototype.iconFill;
anychart.core.utils.LegendItemSettings.prototype['iconStroke'] = anychart.core.utils.LegendItemSettings.prototype.iconStroke;
anychart.core.utils.LegendItemSettings.prototype['iconHatchFill'] = anychart.core.utils.LegendItemSettings.prototype.iconHatchFill;
anychart.core.utils.LegendItemSettings.prototype['iconMarkerType'] = anychart.core.utils.LegendItemSettings.prototype.iconMarkerType;
anychart.core.utils.LegendItemSettings.prototype['iconMarkerFill'] = anychart.core.utils.LegendItemSettings.prototype.iconMarkerFill;
anychart.core.utils.LegendItemSettings.prototype['iconMarkerStroke'] = anychart.core.utils.LegendItemSettings.prototype.iconMarkerStroke;
anychart.core.utils.LegendItemSettings.prototype['iconSize'] = anychart.core.utils.LegendItemSettings.prototype.iconSize;
anychart.core.utils.LegendItemSettings.prototype['text'] = anychart.core.utils.LegendItemSettings.prototype.text;
anychart.core.utils.LegendItemSettings.prototype['disabled'] = anychart.core.utils.LegendItemSettings.prototype.disabled;