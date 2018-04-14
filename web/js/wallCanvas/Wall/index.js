define("wallCanvas/Wall", ["wallCanvas/Wall/ViewPort", "wallCanvas/Wall/EventControls"], function(ViewPort, EventControls){
  /**
   *  @class Wall
   *  The primary class for creating and interacting with a Wall.
   *
   *  @arg canvas: (HTMLCanvasElement) The canvas responsible for rendering the wall.
   */
  const Wall = (function(canvas){
    var w = {};
    const context = canvas.getContext('2d');
    const viewPort = new ViewPort(canvas);

    /**
     *  @method Sticky addSticky:
     *  See ViewPort#addSticky
     */
    w.addSticky = viewPort.addSticky;

    /**
     *  @method void draw:
     *  Used to draw the contents of the wall.
     */
    w.draw = function(){
      context.clearRect(0, 0, canvas.width, canvas.height);
      var stickies = viewPort.getStickies();
      for(var i=0;i<stickies.length;i++){
        stickies[i].draw(context);
      }
    }

    /**
     *  @method void beginAnimation:
     *  Used to start the animation queued in the Wall's ViewPort.
     *
     *  @arg maxTime: (Integer) The duration of the animation in milliseconds.
     */
    w.beginAnimation = function(maxTime){
      var start;

      function step(time){
        if(!start)
          start = time;

        if(time - start < maxTime){
          var percComplete = (time - start) / maxTime;
          viewPort.updateAnimatingEntities(percComplete);
          w.draw();
          window.requestAnimationFrame(step);
        }
        else {
          viewPort.stopAnimating();
          w.draw();
        }
      }

      window.requestAnimationFrame(step);
    }

    EventControls.initEvents(canvas, viewPort, w);

    return w;
  });

  return Wall;
});
