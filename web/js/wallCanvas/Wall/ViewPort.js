define("wallCanvas/Wall/ViewPort",
      [
        "wallCanvas/Wall/StickyQuadtree",
        "wallCanvas/Sticky",
        "wallCanvas/Wall/Animations"
      ],
      function(
        StickyQuadtree,
        Sticky,
        Animations
      ){
  /**
   *  @class ViewPort:
   *  Class designed to track the relationship between what the user is viewing (at the zoom factor they are viewing it at)
   *  to the actual positions represented on the Wall.
   *
   *  @arg canvas: (HTMLCanvasElement) The canvas element responsible for rendering the Wall.
   */
  var ViewPort = (function(canvas){
    var viewPortDims = {
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
      zoomFactor: 1
    };

    var vp = {};

    var stickies = [];
    var activeSticky;
    var animation;

    const quadTree = new StickyQuadtree({
      x: canvas.width,
      y: canvas.height
    });

    /**
     *  @method Sticky addSticky:
     *  Used to add a new Sticky object to the wall.
     *
     *  @arg x: (Integer) The x-position of the new Sticky.
     *  @arg y: (Integer) The y-position of the new Sticky.
     *
     *  @return (Sticky) The sticky that was added.
     */
    vp.addSticky = function(x, y){
      var sticky = new Sticky(x, y);

      quadTree.insertAt(x, y, sticky);

      stickies.push(sticky);
      return sticky;
    }

    /**
     *  @method Sticky[] getStickies:
     *  Used to retrieve all Stickies currently contained in the Wall.
     */
    vp.getStickies = function(){
      var result = stickies.slice();
      if(activeSticky)
        result.push(activeSticky); //This will ensure that the active sticky is the last rendered/manipulated.

      return result;
    };

    /**
     *  @method Sticky[] getStickiesAt:
     *  Used to retrieve all Stickies at a specified position.
     *
     *  @arg x: (Integer) The x-position (in Wall coordinates) to find Stickies.
     *  @arg y: (Integer) The y-position (in Wall coordinates) to find Stickies.
     */
    vp.getStickiesAt = function(x, y){
      var buffer = 20 / viewPortDims.zoomFactor;
      return quadTree.retrieveAt(x, y, buffer);
    };

    /**
     *  @method boolean pullActiveSticky:
     *  Pulls the top-most Sticky at a specified position out of the base render layer and sets it to the active Sticky
     *  for the wall.
     *
     *  @arg x: (Integer) The x-position (in Wall coordinates) to pull the Sticky from.
     *  @arg y: (Integer) The y-position (in Wall coordinates) to pull the Sticky from.
     *
     *  @return (boolean) True if a Sticky was pulled.
     */
    vp.pullActiveSticky = function(x, y){
      var buffer = 20 / viewPortDims.zoomFactor;
      var posStickies = quadTree.retrieveAt(x, y, buffer);

      if(posStickies.length > 0){
        var activeIndex = 0;
        for(var i=0;i<posStickies.length;i++){
          if(stickies.indexOf(posStickies[i], activeIndex) > -1 && posStickies[i].contains(x, y)){
            activeIndex = stickies.indexOf(posStickies[i], activeIndex);
          }
        }

        activeSticky = stickies.splice(activeIndex, 1)[0];
        quadTree.removeSticky(activeSticky);
        return true;
      }
      else {
        return false;
      }
    };

    /**
     *  @method Sticky getActiveSticky:
     *  Returns the current active Sticky, or undefined
     */
    vp.getActiveSticky = function(){
      return activeSticky;
    }

    /**
     *  @method boolean hasActiveSticky:
     *  Returns true if there is an active Sticky.
     */
    vp.hasActiveSticky = function(){
      return activeSticky != undefined;
    }

    /**
     *  @method void releaseActiveSticky:
     *  Returns the active Sticky to the default render layer and "deactivates" it.
     */
    vp.releaseActiveSticky = function(){
      quadTree.insertAt(activeSticky.getX(), activeSticky.getY(), activeSticky);
      stickies.push(activeSticky);
      activeSticky = undefined;
    }

    /**
     *  @method void queueAnimation:
     *  Queues an animation for playback, storing the position of the event that triggered it and a completion callback function.
     *
     *  @arg name: (String) The name of the animation (must match the Wall/Animations interface)
     *  @arg x: (Integer) The x-position of the triggering event.
     *  @arg y: (Integer) The y-position of the triggering event.
     *  @arg callback: (function) A function to call after the animation is complete. Default, undefined
     */
    vp.queueAnimation = function(name, x, y, callback){
      animation = {
        name: name,
        x: x,
        y: y,
        callback: callback
      };
    };

    /**
     *  @method void updateAnimationEntities:
     *  Updates all entities that have been marked for animation using the specified step controller and the specified
     *  percentage.
     *
     *  @arg percComplete: (Float) The percentage of the animation that has elapsed represented as a range of (0, 1).
     */
    vp.updateAnimatingEntities = function(percComplete){
      var entities = {};
      entities.activeSticky = activeSticky;

      if(Animations.hasOwnProperty(animation.name)){
        Animations[animation.name](entities, animation.x, animation.y, percComplete);
      }
    };

    /**
     *  @method void stopAnimating:
     *  Called to ensure that the animation is completed and the callback, if specified, is called.
     */
    vp.stopAnimating = function(){
      vp.updateAnimatingEntities(1); //Ensure that the 100% "key frame" is queued for render.

      if(animation.callback)
        animation.callback();

      animation = undefined;
    }

    /**
     *  @method boolean isAnimating:
     *  Returns true if an animation is still in queue.
     */
    vp.isAnimating = function(){
      return animation != undefined;
    }

    /**
     *  @method Object toWallLocation:
     *  Returns a position on the Wall derived from the position an event occurs within the ViewPort.
     *
     *  @arg evt: (MouseEvent) The mouse event that occurred in the ViewPort.
     *
     *  @return (Object) An object containing the derived x- and y-coordinates for the event on the Wall.
     */
    vp.toWallLocation = function(evt){
      var x = viewPortDims.x + Math.floor(evt.pageX / viewPortDims.zoomFactor);
      var y = viewPortDims.y + Math.floor(evt.pageY / viewPortDims.zoomFactor);

      return {
        x: x,
        y: y
      };
    };

    /**
     *  @method Float getFactoredBuffer:
     *  Returns the default buffer size modified to match the current zoom factor.
     */
    vp.getFactoredBuffer = function(){
      return Math.round(20 / viewPortDims.zoomFactor);
    };

    return vp;
  });

  return ViewPort;
});
