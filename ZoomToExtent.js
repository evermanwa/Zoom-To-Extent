define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/form/Button',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom', 
    'dojo/domReady!',
    'dojo/aspect',
    'dojo/on',
    'dojo/text!./ZoomToExtent/templates/ZoomToExtent.html',
    'dojo/topic',
    'xstyle/css!./ZoomToExtent/css/ZoomToExtent.css',
    'dojo/dom-construct',
    'dojo/_base/Color',
    'esri/geometry/webMercatorUtils',
    'esri/toolbars/draw',
    'esri/graphic',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/Color'
], function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Button, lang, arrayUtils, dom, ready, aspect, on, template, topic, css, domConstruct, Color1, webMercatorUtils, Draw, Graphic, SimpleFillSymbol, SimpleLineSymbol, Color) {
    var map;
    var clickmode;
    var drawToolbar;
    var theGeometry;

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        name: 'ZoomToExtent',
        map: true,
        widgetsInTemplate: true,
        templateString: template,
        mapClickMode: null,

        postCreate: function(){
            this.inherited(arguments);
            map = this.map;
            drawToolbar= new Draw(this.map);
            drawToolbar.on("draw-end", lang.hitch(this, 'addToMap'));
            this.own(topic.subscribe("mapClickMode/currentSet", lang.hitch(this, "setMapClickMode")));

            if (this.parentWidget) {
                if (this.parentWidget.toggleable) {
                    this.own(aspect.after(this.parentWidget, 'toggle', lang.hitch(this, function () {
                        this.onLayoutChange(this.parentWidget.open);
                    })));
                }
            }
        },
		
        onLayoutChange: function (open) {
          if (open) {
            //this.onOpen();
          } else {
            this.onClear();
          }

         open || "draw" === this.mapClickMode && topic.publish("mapClickMode/setDefault")

        },

        disconnectMapClick: function() {
            topic.publish("mapClickMode/setCurrent", "draw");
        },

        connectMapClick: function() {
            topic.publish("mapClickMode/setDefault");
        },

        addToMap: function (evt) {
            var symbol = new SimpleFillSymbol(
                SimpleFillSymbol.STYLE_SOLID, 
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 0, 0]), 2), 
                new Color([255, 255, 0, 0.2])
                );

            var graphic = new Graphic(evt.geometry, symbol);
            map.graphics.add(graphic);
            theGeometry = evt.geometry;
			map.setExtent(theGeometry.getExtent());
            this.connectMapClick();
            drawToolbar.deactivate();
            map.setMapCursor("default");
			this.map.graphics.clear();
        },

        onDrawExtent: function()
        {
            this.disconnectMapClick();
            this.onClear();

            drawToolbar.activate(Draw.EXTENT);
            this.map.setMapCursor('crosshair');
        },

        onClear: function()
        {
            this.map.graphics.clear();
            this.connectMapClick();
            drawToolbar.deactivate();
            map.setMapCursor("default");
            theGeometry = null;
        },

        setMapClickMode: function (mode) {
            this.mapClickMode = mode;
        }
    });
});
