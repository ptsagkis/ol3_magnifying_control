# ol3_magnifying_control
ol3_magnifying_control

- Make map cursor act as a magnifying lense.

- Inspired from [Layer Spy example!](http://openlayers.org/en/v3.13.0/examples/layer-spy.html)          

- May be used as layer Spy Example

To do so pass `scaleOffSet:0,layers:[the layer you want to spy to]`

@Requirements
openlayers3. Tested on version 3.13.0

#Installation
    Include ol.js,  ol.css files.
    Include MagnifyingLense.js file.
#Demo
Download [zip](https://github.com/ptsagkis/ol3_magnifying_control/archive/master.zip)  
and just double click on
> example.html 
> example2.html 
OR

fiddle demo (example.html)  [here!](http://jsfiddle.net/p_tsagkis/kbLxct2L/)  
fiddle demo (example2.html) [here!](http://jsfiddle.net/p_tsagkis/54aosbsx/) 
#Usage
**zero configuration**

        var magnCntrl = new ol.control.MagnifierControl({});
**with options**

        var magnCntrl = new ol.control.MagnifierControl({

        scaleOffSet : 2,                   //@scaleOffSet {integer} (optional) default is 2. the diff between our map and magn map
        radius      : 100,                 //@radius {integer} default is 100. the circle radius of magn lense
        lineWidth   : 2,                   //@lineWidth {integer} default is 5. the width of lense outline
        strokeStyle : 'rgba(255,0,0,1)',   //@strokeStyle {stirng) default is 'rgba(255,0,0,1)'. red+green+blue+alpha chanel 
        layers      : [imagery]            //@layers {array} an array of ol.Layer. default is parent map existing layers
        });                                 



**and your usual ol3 code**

        var osmroads = new ol.layer.Tile({
          source: new ol.source.OSM()
        });
        var imagery = new ol.layer.Tile({
          source: new ol.source.BingMaps({key: key, imagerySet: 'Aerial'})
        });
        var map = new ol.Map({
         controls: ol.control.defaults({
            attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
              collapsible: false
            })
          }).extend([
            magnCntrl
          ]),
          layers: [osmroads],
          target: 'mymap',
          view: new ol.View({
            center: ol.proj.fromLonLat([-109, 46.5]),
            zoom: 2
          })
        });  
 
#api Methods
> **destroy()**
