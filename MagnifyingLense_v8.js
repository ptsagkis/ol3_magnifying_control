ol.control.MagnifierControl = function(opt_options) {

var options = opt_options || {};
options.scaleOffSet = typeof(options.scaleOffSet) !== 'undefined' ? options.scaleOffSet : 2
options.radius = typeof(options.radius) !== 'undefined' ? options.radius : 100;
//attach options to the control
this.options = options;
//vars with global scope
this.initialised = false;
this.magmap;
this.mousePosition = null;
this.targetMapDivId;

var button = document.createElement('button');
button.innerHTML = 'M';
var this_ = this;
this_.toggleMagCntrl = function(e) {
   if (this_.isVisble===true ){
   $( "#magmap" ).hide();
   //remove all the listeners 
   this_.magmap.unByKey(this_.precomposeListener);
   this_.magmap.unByKey(this_.postcomposeListener);
   this_.magmap.unByKey(this_.mousemoveListener);
   //$('#'+this_.targetMapDivId).unbind("mousemove");
   $('#'+this_.targetMapDivId).unbind("mouseout");
   $(window).off("resize", this_.resizeFn);
   this_.isVisble = false;
   }
   else {
     if (this_.initialised === false){ 
       this_.initMagCntrl()
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
    $('#'+this_.targetMapDivId).bind('mouseout', function(event) {
    this_.mouseOutFn(event);
    });
    $(window).resize(this_.resizeFn);
    
    
    $( "#magmap" ).show();
    this_.resizeFn();
    this_.isVisble = true;
   }
  };
button.addEventListener('click', this_.toggleMagCntrl, false);
button.addEventListener('touchstart', this_.toggleMagCntrl, false);
var element = document.createElement('div');
  element.className = 'ol-unselectable ol-control';
  element.style.zIndex = "9999";//set one level above the magnifier so been visible 
  element.style.top = '65px';
  element.style.left =  '.5em';
  element.appendChild(button);
  
  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });  
};
ol.inherits(ol.control.MagnifierControl, ol.control.Control);

ol.control.MagnifierControl.prototype.initMagCntrl = function(){
  if (this.initialised===false){
  this.targetMapDivId = this.getMap().getTarget();
  this.magnifyingMap = 
  $('<div id="magmap" style="position: absolute;z-index:9998;display: inline-block;pointer-events: none;" ></div>');
  
  $('#'+this.targetMapDivId).append(this.magnifyingMap);
  var magnControls = ol.control.defaults();
	magnControls.forEach(function(ctrl) { 
	magnControls.remove(ctrl); 
	});
  this.magmap = new ol.Map({
  layers: this.getMap().getLayers(),
  target: 'magmap',
  controls:magnControls,
  interactions:ol.interaction.defaults({
      shiftDragZoom       : false,
      dragPan             : false,
      altShiftDragRotate  : false,
      doubleClickZoom     : false,
      mouseWheelZoom		  : false
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
  $('#magmap').css({
  width      : $('#'+this_.targetMapDivId).width(), 
  height     : $('#'+this_.targetMapDivId).height(),
  left       : $('#'+this_.targetMapDivId).offset().left,
  top        : $('#'+this_.targetMapDivId).offset().top
  });
this_.getMap().updateSize();
this_.magmap.updateSize();
}

this.precomposeFn = function(event){
console.log("precompose fired")
  var ctx = event.context;
 // console.log("event pre",event.context)
  var pixelRatio = event.frameState.pixelRatio;
  ctx.save();
  ctx.beginPath();
  if (this_.mousePosition) {
    // only show a circle around the mouse
    ctx.arc(this_.mousePosition[0] * pixelRatio, this_.mousePosition[1] * pixelRatio,
        this_.options.radius * pixelRatio, 0, 2 * Math.PI);
    ctx.lineWidth = 5 * pixelRatio;
    ctx.strokeStyle = 'rgba(255,0,0,1)';
    ctx.stroke();
  }
  ctx.clip();
}
//event listener functions
this.postcomposeFn = function(event){
console.log("postcompose fired")
  var ctx = event.context;
  ctx.restore();
}

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
}


this.mouseOutFn = function(event){
  this_.mousePosition = null;
  this_.magmap.render();
}

this.resizeFn();
this.initialised = true;
}
}

