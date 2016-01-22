/**
 * @classdesc
 * Make map cursor act as a magnify lense
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {olx.control.RotateOptions=} opt_options Rotate options.
 */
ol.control.MagnifierControl = function(opt_options) {
/**
 * get and set config options
 * @scaleOffSet {integer} (optional) default is 2. 
 * @radius {integer} default is 100.
 * @lineWidth {integer} default is 5.
 * @strokeStyle {stirng) red+green+blue+alpha chanel 
 */
var options = opt_options || {};
//console.log("this.getMap()",this.getMap())
options.scaleOffSet  = typeof(options.scaleOffSet) !== 'undefined' ? options.scaleOffSet  : 2;
options.radius       = typeof(options.radius)      !== 'undefined' ? options.radius       : 100;
options.lineWidth    = typeof(options.lineWidth)   !== 'undefined' ? options.lineWidth    : 5;
options.strokeStyle  = typeof(options.strokeStyle) !== 'undefined' ? options.strokeStyle  : 'rgba(255,0,0,1)';
options.layers       = typeof(options.layers)      !== 'undefined' ? options.layers       : [];

//attach options to the control
this.options = options;
//vars with global scope
this.initialised = false;
this.magmap;
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
  //create the map for the magnify
  if (this.options.layers.length===0){
  this.options.layers = this.getMap().getLayers();
  }
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
//listener functions here
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
this_.magmap.getView().setCenter(coords);
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

this.resizeFn();
this.initialised = true;
}
};
