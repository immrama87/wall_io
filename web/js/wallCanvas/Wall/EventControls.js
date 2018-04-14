define("wallCanvas/Wall/EventControls", [], function(){
  /**
   *  @class EventControls
   *  Single point of entry for initializing all event listeners required for operating a Wall.
   */
  var EventControls = (function(){
    /**
     *  @method private setupMouseMove:
     *  Sets up the mouse move event listener for the Wall.
     *
     *  @arg canvas: (HTMLCanvasElement)
     *  @arg viewPort: (ViewPort)
     *  @arg wall: (Wall)
     */
    const setupMouseMove = function(canvas, viewPort, wall){
      var previousLocation;
      var previousStickies = [];
      canvas.addEventListener("mousemove", function(evt){
        var wallLocation = viewPort.toWallLocation(evt);
        var stickies = viewPort.getStickiesAt(wallLocation.x, wallLocation.y);

        var foundStickies = [];
        for(var i=0;i<stickies.length;i++){
          stickies[i].setCornerHeights(wallLocation.x, wallLocation.y);
          if(previousStickies.indexOf(stickies[i]) > -1){
            foundStickies.push(previousStickies.indexOf(stickies[i]));
          }
        }

        for(var j=0;j<previousStickies.length;j++){
          if(foundStickies.indexOf(j) > -1)
            continue;

          previousStickies[j].resetCornerHeights();
        }

        previousStickies = stickies;

        if(viewPort.getActiveSticky()){
          var moveX = wallLocation.x - previousLocation.x;
          var moveY = wallLocation.y - previousLocation.y;
          viewPort.getActiveSticky().updatePosition(moveX, moveY);
        }

        wall.draw();

        previousLocation = wallLocation;
      });
    };

    /**
     *  @method private setupMouseDown:
     *  Sets up the mouse down event listener for the Wall.
     *
     *  @arg canvas: (HTMLCanvasElement)
     *  @arg viewPort: (ViewPort)
     *  @arg wall: (Wall)
     */
    const setupMouseDown = function(canvas, viewPort, wall){
      canvas.addEventListener("mousedown", function(evt){
        var wallLocation = viewPort.toWallLocation(evt);
        if(viewPort.pullActiveSticky(wallLocation.x, wallLocation.y)){
          viewPort.queueAnimation("pickupActive", wallLocation.x, wallLocation.y);
          wall.beginAnimation(40);

          var originalLocation = wallLocation;

          var mouseUp = function(evt){
            var dropLocation = viewPort.toWallLocation(evt);
            viewPort.queueAnimation("dropActive", dropLocation.x, dropLocation.y, viewPort.releaseActiveSticky);
            wall.beginAnimation(40);
            canvas.removeEventListener("mouseup", mouseUp);
          };

          canvas.addEventListener("mouseup", mouseUp);
        }
      });
    };

    return {
      /**
       *  @method void initEvents:
       *  Initializes all event listeners on the Canvas used to render the specified Wall.
       *
       *  @arg canvas: (HTMLCanvasElement) The Canvas responsible for rendering the Wall.
       *  @arg viewPort: (ViewPort) The ViewPort object attached to the Wall.
       *  @arg wall: (Wall) The Wall itself.
       */
      initEvents: function(canvas, viewPort, wall){
        setupMouseMove(canvas, viewPort, wall);
        setupMouseDown(canvas, viewPort, wall);
      }
    }
  })();

  return EventControls;
});
