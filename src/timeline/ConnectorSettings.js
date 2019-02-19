goog.provide('anychart.timelineModule.ConnectorSettings');

goog.require('anychart.core.Base');
goog.require('anychart.core.settings');

/**
 *
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.timelineModule.ConnectorSettings = function() {
  anychart.timelineModule.ConnectorSettings.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['length', 0, anychart.Signal.NEEDS_REDRAW],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.timelineModule.ConnectorSettings, anychart.core.Base);


anychart.timelineModule.ConnectorSettings.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var d = anychart.core.settings.descriptors;
  anychart.core.settings.createDescriptors(map, [
    d.STROKE,
    d.LENGTH
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.timelineModule.ConnectorSettings, anychart.timelineModule.ConnectorSettings.PROPERTY_DESCRIPTORS);