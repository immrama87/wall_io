define("wallCanvas/Wall/Animations/pickupActive", [], function(){
  /**
   *  @function pickupActive
   *  Animation step controller for picking up the active Sticky on a Wall.
   */
  return function(entities, x, y, perc){
    if(entities.activeSticky){
      entities.activeSticky.pickUp(x, y, perc);
    }
  }
});
