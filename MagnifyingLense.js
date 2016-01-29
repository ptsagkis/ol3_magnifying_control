/**
 * @classdesc
 * Make map cursor act as a magnify lense
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {olx.control.Otpions=} opt_options MagnifierControl options.
 */
ol.control.MagnifierControl = function(opt_options) {
/**
 * get and set config options
 * @scaleOffSet {integer} (optional) default is 2. 
 * @radius {integer} (optional) default is 100.
 * @lineWidth {integer} (optional) default is 5.
 * @strokeStyle {stirng) (optional) red+green+blue+alpha chanel
 * @layers {ol.layer[]} (optional) an Array of layers. Default is parent's map exisitng layers
 * @synchMaps Whether the layers exist on map should be synched with magn map. 
 *     - if layers supplied and this setted to true shall be setted to false       
 */
var options = opt_options || {};
//console.log("this.getMap()",this.getMap())
options.scaleOffSet  = typeof(options.scaleOffSet) !== 'undefined' ? options.scaleOffSet  : 2;
options.radius       = typeof(options.radius)      !== 'undefined' ? options.radius       : 100;
options.lineWidth    = typeof(options.lineWidth)   !== 'undefined' ? options.lineWidth    : 5;
options.strokeStyle  = typeof(options.strokeStyle) !== 'undefined' ? options.strokeStyle  : 'rgba(255,0,0,1)';
options.layers       = typeof(options.layers)      !== 'undefined' ? options.layers       : [];
options.synchMaps    = typeof(options.synchMaps)   !== 'undefined' ? options.synchMaps    : false;

//attach options to the control
this.options = options;
//vars with global scope
this.initialised = false;
this.magmap;//ol.map
this.mousePosition = null;
this.targetMapDivId; 

//control toggle button
var button = document.createElement('button');
button.innerHTML = 'M';
var this_ = this;
/**
 * toggling the magnifing lense
 * intialise if first time
 * else show/hide the lense 
 */
this.toggleMagCntrl = function() {
   if (this_.isVisble===true ){//need to hide lense and detach all listners
   document.getElementById('magmap').style.display = 'none';
   //remove all the listeners 
   this_.magmap.unByKey(this_.precomposeListener);
   this_.magmap.unByKey(this_.postcomposeListener);
   this_.getMap().unByKey(this_.mousemoveListener);
   //this_.getMap().unByKey(this_.moveendListener);
   document.getElementById(this_.targetMapDivId).removeEventListener("mouseout", this_.mouseOutFn);
   window.removeEventListener('resize', this_.resizeFn);
   this_.isVisble = false;
   }
   else {//initialise if not visible and show. Attach  the listeners
     if (this_.initialised === false){ 
       this_.initMagCntrl();
     }
   //asign all the listeners
    this_.precomposeListener = this_.magmap.on('precompose', 
    	function(event) {
    this_.precomposeFn(event);
    });
    this_.postcomposeListener = this_.magmap.on('postcompose', 
    	function(event) {
    this_.postcomposeFn(event);
    });
    this_.mousemoveListener = this_.getMap().on('pointermove', 
    	function(event) {
    this_.mouseMoveFn(event);
    });
    document.getElementById(this_.targetMapDivId).addEventListener("mouseout", this_.mouseOutFn);
    window.addEventListener ("resize", this_.resizeFn, false);
    document.getElementById('magmap').style.display = 'block';
    this_.resizeFn();
    this_.isVisble = true;
   }
  };
  
button.addEventListener('click', this_.toggleMagCntrl, false);
button.addEventListener('touchstart', this_.toggleMagCntrl, false);
var element = document.createElement('div');
  element.className    = 'ol-unselectable ol-control';
  element.style.zIndex = '9999';//set one level above the magnifier so been visible 
  element.style.top    = '65px';
  element.style.left   = '.5em';
  element.appendChild(button);
  
  ol.control.Control.call(this, {
    element : element,
    target  : options.target
  });    
};
ol.inherits(ol.control.MagnifierControl, ol.control.Control);
/**
* initialising the magnifying lense
*
* @returns {undefined} 
*/
ol.control.MagnifierControl.prototype.initMagCntrl = function(){
  if (this.initialised===false){
  this.targetMapDivId = this.getMap().getTarget();
  var magelement = document.createElement('div');
  magelement.id                      = 'magmap';
  magelement.style.zIndex            = "9998";    //set one level below the magnify button so button is visible 
  magelement.style.display           = 'inline-block';
  magelement.style.position          = 'absolute';
  magelement.style['pointer-events'] = 'none';   //this allowing interaction above magmap element. Love it!!!!! 
  document.getElementById(this.targetMapDivId).appendChild(magelement);
  //disable the deafult controls
  var magnControls = ol.control.defaults({
      rotate      : true, //keep it true
      zoom        : false,
      attribution : false
  });

  if (this.options.layers.length===0){
    if (this.options.synchMaps === false){
    this.options.layers = this.getMap().getLayers().getArray(); //get as array so remove any synch
    } else { 
    //in this case (default) magnmap layers should stay in sunc with map layers. 
    //great attitude of ol.Collection. in it?
    //if not means have been passed as an array. So no sync.
    this.options.layers = this.getMap().getLayers();//returns ol.Collection     
    }  
  } else {
  this.options.synchMaps = false; //set it false as not suppling layers means no synch may exist
  }
  //create the map for the magnify
  this.magmap = new ol.Map({
  layers        : this.options.layers,
  target        : 'magmap',
  controls      : magnControls,
  interactions  :ol.interaction.defaults({
      shiftDragZoom       : false,
      dragPan             : false,
      altShiftDragRotate  : false,
      doubleClickZoom     : false,
      mouseWheelZoom	    : false
  }),
  view:new ol.View({
      center   : this.getMap().getView().getCenter(),
      zoom     : this.getMap().getView().getZoom(),
      rotation : this.getMap().getView().getRotation()
    })
});
this.magmap.setSize(this.getMap().getSize());
this.initListeners();
this.resizeFn();
this.initialised = true;
}
}; 
/**
 * setting the listeners related
 */
ol.control.MagnifierControl.prototype.initListeners = function(){
var this_ = this;
this.resizeFn = function(event){
  var magMapEl = document.getElementById('magmap');
  var oriMapEl = document.getElementById(this_.targetMapDivId);
  magMapEl.style.width  = oriMapEl.getBoundingClientRect().width + 'px';
  magMapEl.style.height = oriMapEl.getBoundingClientRect().height + 'px';
  magMapEl.style.left   = oriMapEl.getBoundingClientRect().left + 'px';
  magMapEl.style.top    = oriMapEl.getBoundingClientRect().top + 'px';
  this_.getMap().updateSize();
  this_.magmap.updateSize();
};

/**
* the precompose liistener function
* create a circle around the mouse
* using the canvas
*/
this.precomposeFn = function(event){
  var ctx = event.context;
  var pixelRatio = event.frameState.pixelRatio;
  ctx.save();
  ctx.beginPath();
  if (this_.mousePosition) {
    // only show a circle around the mouse
    ctx.arc(
        this_.mousePosition[0] * pixelRatio, this_.mousePosition[1] * pixelRatio,
        this_.options.radius * pixelRatio, 0, 2 * Math.PI
    );
    ctx.lineWidth = this_.options.lineWidth * pixelRatio;
    ctx.strokeStyle = this_.options.strokeStyle;
    ctx.stroke();
  }
  ctx.clip();
};

/**
*
*/
this.postcomposeFn = function(event){
  var ctx = event.context;
  ctx.restore();
};  


/**
*
*/
this.mouseMoveFn = function(event){
var coords = event.coordinate;
this_.mousePosition = event.pixel;
var magcenter = this_.magmap.getView().getCenter();
var mapcenter = this_.getMap().getView().getCenter();
var xdif= magcenter[0] -  mapcenter[0];
var ydif= magcenter[1] -  mapcenter[1];
//seems to need some correction
var coords1 = [coords[0]-(xdif/(this_.options.scaleOffSet+1)),coords[1]-(ydif/(this_.options.scaleOffSet+1))]; 
console.log("this_.options.scaleOffSet+1-----",this_.options.scaleOffSet+1);
if (this_.options.scaleOffSet===0){
this_.magmap.getView().setCenter(this_.getMap().getView().getCenter());
} else {
this_.magmap.getView().setCenter(coords1);
}
this_.magmap.getView().setZoom(
  this_.getMap().getView().getZoom()+this_.options.scaleOffSet
);
this_.magmap.getView().setRotation(
  this_.getMap().getView().getRotation()
);
this_.magmap.render();
};


this.mouseOutFn = function(){
  this_.mousePosition = null;
  this_.magmap.render();
};
}

/**
 * destroy the control
 * 
 */
ol.control.MagnifierControl.prototype.destroy = function(){
if (this.initialised===true){
//destory all the listeners
this.magmap.unByKey(this.precomposeListener);
this.magmap.unByKey(this.postcomposeListener);
this.getMap().unByKey(this.mousemoveListener);
document.getElementById(this.targetMapDivId).removeEventListener("mouseout", this.mouseOutFn);
window.removeEventListener('resize', this.resizeFn);
//remove the control
if (this.getMap()){
this.getMap().removeControl(this);
}
//remove the element holding the magn map
var element = document.getElementById(this.magmap.getTarget());
element.parentNode.removeChild(element);
//set init vars to false and magnmap to null

} else {
if (this.getMap()){
this.getMap().removeControl(this);
}
}
this.isVisble=false;
this.initialised=false;
};   

/**
 * very dirty way to reset the layers
 * need to recreate the map itself. No matter the goodness of ol.collection
 * sometimes is a pain in the a**
 */
ol.control.MagnifierControl.prototype.setLayers = function(lyrs) {
if (this.initialised===true){
  var existingLyrs = new ol.Collection(this.magmap.getLayers().getArray()).getArray();
  this.options.synchMaps = false;
  this.magmap.setTarget(null);
  this.magmap = null; 
  this.getMap().unByKey(this.mousemoveListener);
  var magnControls = ol.control.defaults({
      rotate      : true, //keep it true
      zoom        : false,
      attribution : false
  });
  this.magmap = new ol.Map({
  layers        : lyrs,
  target        : 'magmap',
  controls      : magnControls,
  interactions  :ol.interaction.defaults({
      shiftDragZoom       : false,
      dragPan             : false,
      altShiftDragRotate  : false,
      doubleClickZoom     : false,
      mouseWheelZoom	    : false
  }),
  view:new ol.View({
      center   : this.getMap().getView().getCenter(),
      zoom     : this.getMap().getView().getZoom(),
      rotation : this.getMap().getView().getRotation()
    })
});
this.magmap.setSize(this.getMap().getSize());
var this_ = this;
console.log("this",this)
    if (this_.isVisble===true ){
    this.precomposeListener = this.magmap.on('precompose', 
    	function(event) {
    this_.precomposeFn(event);
    });
    this.postcomposeListener = this.magmap.on('postcompose', 
    	function(event) {
    this_.postcomposeFn(event);
    });
    this.mousemoveListener = this.getMap().on('pointermove', 
    	function(event) {
    this_.mouseMoveFn(event);
    });
    document.getElementById(this.targetMapDivId).addEventListener("mouseout", this_.mouseOutFn);
    window.addEventListener ("resize", this_.resizeFn, false);
    document.getElementById('magmap').style.display = 'block';
    
    } else {
   //remove all the listeners 
   this_.magmap.unByKey(this_.precomposeListener);
   this_.magmap.unByKey(this_.postcomposeListener);
   this_.getMap().unByKey(this_.mousemoveListener);
   document.getElementById(this_.targetMapDivId).removeEventListener("mouseout", this_.mouseOutFn);
   window.removeEventListener('resize', this_.resizeFn);
   this_.isVisble = false;
    }   
   this.resizeFn();
   this.initialised = true; 
   this.options.synchMaps = false;     
} else {
//this.options.layers = lyrs;
console.log("action when not initialised")
}
};  
