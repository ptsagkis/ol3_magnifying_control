# ol3_magnifying_control
ol3_magnifying_control

Make map cursor act as a magnifying lense

@Requirements
openlayers3 verison 3.13.0

#Installation
    Include ol.js file.
    Include MagnifyingLense.js file.

#Usage
**zero configuration**

        var magnCntrl = new ol.control.MagnifierControl({});
**with options**

        var magnCntrl = new ol.control.MagnifierControl({
        scaleOffSet : 2,    //@scaleOffSet {integer} (optional) default is 2. the diff between our map and magn map
        radius      : 100,  //@radius {integer} default is 100. the circle radius of magn lense
        lineWidth   : 2,    //@lineWidth {integer} default is 5. the width of lense outline
        strokeStyle : 100   //@strokeStyle {stirng) default is 'rgba(255,0,0,1)'. red+green+blue+alpha chanel 
        });

**and your usual ol3 code**

        var roads = new ol.layer.Tile({
          source: new ol.source.OSM()
        });
        
        var map = new ol.Map({
         controls: ol.control.defaults({
            attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
              collapsible: false
            })
          }).extend([
            magnCntrl
          ]),
          layers: [imagery],
          target: 'mymap',
          view: new ol.View({
            center: ol.proj.fromLonLat([-109, 46.5]),
            zoom: 2
          })
        });
