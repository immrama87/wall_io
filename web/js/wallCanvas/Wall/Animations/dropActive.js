define("wallCanvas/Wall/Animations/dropActive", [], function(){
  /**
   * @function dropActive
   * Animation step controller for putting down the active Sticky on a Wall.
   */
  return function(entities, x, y, perc){
    if(entities.activeSticky){
      entities.activeSticky.putDown(x, y, perc);
    }
  };
});
