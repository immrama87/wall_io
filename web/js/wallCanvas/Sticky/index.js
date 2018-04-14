define("wallCanvas/Sticky", ["wallCanvas/API/PreparedText"], function(PreparedText){
  /**
   *  @class Sticky
   *  The default class for controlling a single instance of a Sticky on a Wall.
   *
   *  @arg x: (Integer) The initial x-position of the Sticky.
   *  @arg y: (Integer) The initial y-position of the Sticky.
   */
  const Sticky = (function(x,y){
    const side = 150;
    const stickyBarHeight = 20;

    var color = "#FFFA9E";
    var lines = [];
    var letters = [];
    var font = "'Rock Salt'";
    var curves = {};

    var heights = {
      top: {
        left: 0,
        right: 0
      },
      bottom: {
        left: 2,
        right: 2
      }
    };

    /**
     * @method boolean contains:
     * Returns true if the point specified is contained in the Sticky's bounds.
     *
     * @arg wallX: (Integer) The x-position of the point on the wall to check.
     * @arg wallY: (Integer) The y-position of the point on the wall to check.
     *
     * @return (boolean) True if wallX and wallY are contained in the Sticky.
     */
    const contains = function(wallX, wallY){
      return wallX >= x &&
        wallX <= x + side &&
        wallY >= y &&
        wallY <= y + side;
    };

    /**
     *  @method private void setCurves:
     *  Used internally to update the definitions of the Bezier curves used to draw the edges of the Sticky.
     */
    const setCurves = function(){
      var topDifference = heights.top.left - heights.top.right;
      curves.top = [];
      curves.top.push([x + heights.top.left, y - heights.top.left]);
      curves.top.push([x + (side / 3) + heights.top.left - (topDifference / 3), y - heights.top.left - (topDifference / 3)]);
      curves.top.push([x + (side * 2 / 3) + heights.top.left, y - heights.top.left]);
      curves.top.push([x + side + heights.top.right, y - heights.top.right]);

      var rightDifference = heights.top.right - heights.bottom.right;
      curves.right = [];
      curves.right.push([x + side + heights.top.right, y - heights.top.right]);
      curves.right.push([x + side + heights.top.right, y + (side / 3) - heights.top.right]);
      curves.right.push([x + side + heights.top.right - (rightDifference / 3), y + (side * 2 / 3) - heights.top.right - (rightDifference / 3)]);
      curves.right.push([x + side + heights.bottom.right, y + side - heights.bottom.right]);

      var bottomDifference = heights.bottom.right - heights.bottom.left;
      curves.bottom = [];
      curves.bottom.push([x + side + heights.bottom.right, y + side - heights.bottom.right]);
      curves.bottom.push([x + (side * 2 / 3) + heights.bottom.right, y + side - heights.bottom.right]);
      curves.bottom.push([x + (side / 3) + heights.bottom.right - (bottomDifference / 3), y + side - heights.bottom.left - (bottomDifference / 3)]);
      curves.bottom.push([x + heights.bottom.left, y + side - heights.bottom.left]);

      var leftDifference = heights.bottom.left - heights.top.left;
      curves.left = [];
      curves.left.push([x + heights.bottom.left, y + side - heights.bottom.left]);
      curves.left.push([x + heights.bottom.left - (leftDifference * 2 / 3), y + (side * 2 / 3) - heights.bottom.left - (leftDifference * 2 / 3)]);
      curves.left.push([x + heights.top.left, y + (side / 3) - heights.top.left]);
      curves.left.push([x + heights.top.left, y - heights.top.left]);

      setLetters();
    }

    /**
     *  @method void setCornerHeights:
     *  Used to update the heights of each of the Sticky's corners based on the proximity of the position specified.
     *
     *  @arg wallX: (Integer) The x coordinate of the position to base heights on.
     *  @arg wallY: (Integer) The y coordinate of the position to base heights on.
     */
    const setCornerHeights = function(wallX, wallY){
      var yDist = wallY - y;
      var yRatio, lRatio, rRatio;
      if(yDist > side / 2){
        if(yDist >= side){
          yRatio = 1 - ((yDist - side) / 20);
        }
        else {
          yRatio = (yDist - (side / 2)) / (side / 2);
        }

        var xDist = wallX - x;

        if(xDist <= 0){
          lRatio = 1 - (xDist / -20);
          rRatio = 0;
        }
        else if(xDist >= side){
          rRatio = 1 - ((xDist - side) / 20);
          lRatio = 0;
        }
        else {
          lRatio = 1 - (xDist / side);
          rRatio = xDist / side;
        }
      }
      else {
        yRatio = 0;
        lRatio = 0;
        rRatio = 0;
      }

      heights.bottom.left = 2 + (13 * lRatio * yRatio);
      heights.bottom.right = 2 + (13 * rRatio * yRatio);
      setCurves();
    };

    /**
     *  @method void resetCornerHeights:
     *  Used to reset the corner heights on a Sticky that was previously modified back to the "resting" position.
     */
    const resetCornerHeights = function(){
      heights = {
        top: {
          left: 0,
          right: 0
        },
        bottom: {
          left: 2,
          right: 2
        }
      };

      setCurves();
    };

    /**
     *  @method void pickUp:
     *  Used to set the corner heights of a Sticky that has been picked up, at a certain percentage of the animation.
     *
     *  @arg x: (Integer) The x-position where the animation was triggered.
     *  @arg y: (Integer) The y-position where the animation was triggered.
     *  @arg perc: (Float) The percentage of the animation that has been completed (0 - 1).
     *
     *  TODO: it would be cool if it looked like the Sticky was pulled up from the nearest corner to the x,y coordinates.
     */
    const pickUp = function(x, y, perc){
      heights.top.left = 10 * perc;
      heights.top.right = 10 * perc;
      heights.bottom.right = 2 + (8 * perc);
      heights.bottom.left = 2 + (8 * perc);

      setCurves();
    };

    /**
     *  @method void putDown:
     *  Used to set the corner heights of a Sticky that has been put back down, at a center percentage of the animation.
     *
     *  @arg x: (Integer) The x-position where the animation was triggered.
     *  @arg y: (Integer) The y-position where the animation was triggered.
     *  @arg perc: (Float) The percentage of the animation that has been completed (0 - 1).
     *
     *  TODO: it would also be cool if it looked like the Sticky was restuck from the nearest top corner.
     */
    const putDown = function(x, y, perc){
      heights.top.left = 10 - (10 * perc);
      heights.top.right = 10 - (10 * perc);
      heights.bottom.right = 10 - (8 * perc);
      heights.bottom.left = 10 - (8 * perc);

      setCurves();
    }

    /**
     *  @method private void drawSticky:
     *  Used internally to draw the actual paper portion of the Sticky.
     *
     *  @arg context: (CanvasRenderingContext2D)
     */
    const drawSticky = function(context){
      context.fillStyle = color;
      context.beginPath();
      //TOP LEFT CORNER
      context.moveTo(curves.top[0][0], curves.top[0][1]);

      //LINE TO TOP RIGHT CORNER
      if(heights.top.left == heights.top.right){
        context.lineTo(curves.right[0][0], curves.right[0][1]);
      }
      else {
        context.bezierCurveTo(
          curves.top[1][0], curves.top[1][1],
          curves.top[2][0], curves.top[2][1],
          curves.top[3][0], curves.top[3][1]
        );
      }

      //LINE TO BOTTOM RIGHT CORNER
      if(heights.top.right == heights.bottom.right){
        context.lineTo(curves.bottom[0][0], curves.bottom[0][1]);
      }
      else {
        context.bezierCurveTo(
          curves.right[1][0], curves.right[1][1],
          curves.right[2][0], curves.right[2][1],
          curves.right[3][0], curves.right[3][1]
        );
      }

      //LINE TO BOTTOM LEFT CORNER
      if(heights.bottom.right == heights.bottom.left){
        context.lineTo(curves.left[0][0], curves.left[0][1]);
      }
      else {
        context.bezierCurveTo(
          curves.bottom[1][0], curves.bottom[1][1],
          curves.bottom[2][0], curves.bottom[2][1],
          curves.bottom[3][0], curves.bottom[3][1]
        );
      }

      //LINE BACK TO TOP LEFT CORNER
      if(heights.bottom.left == heights.top.left){
        context.lineTo(curves.top[0][0], curves.top[0][1]);
      }
      else {
        context.bezierCurveTo(
          curves.left[1][0], curves.left[1][1],
          curves.left[2][0], curves.left[2][1],
          curves.left[3][0], curves.left[3][1]
        );
      }

      context.fill();
    };

    /**
     *  @method private void drawShadow:
     *  Used internally to draw the shadow cast by the Sticky.
     *
     *  @arg context: (CanvasRenderingContext2D)
     */
    const drawShadow = function(context){
      context.beginPath();
      context.fillStyle = "rgba(0,0,0,0.15)";
      //TOP LEFT CORNER
      context.moveTo(x - heights.top.left, y + heights.top.left);

      //LINE TO TOP RIGHT CORNER
      if(heights.top.left == heights.top.right){
        context.lineTo(x + side + (heights.top.right * 2), y + heights.top.right);
      }
      else {
        var difference = heights.top.left - heights.top.right;
        context.bezierCurveTo(
          x + (side / 3) - heights.top.left - (difference / 3),
          y + heights.top.left - (difference / 3),
          x + (side * 2 / 3) - heights.top.left,
          y + heights.top.left,
          x + side + (heights.top.right * 2),
          y + heights.top.right
        );
      }
      if(heights.top.right == heights.bottom.right){
        context.lineTo(x + side + (heights.bottom.right * 2), y + side + heights.bottom.right);
      }
      else {
        var difference = heights.top.right - heights.bottom.right;
        context.lineTo(x + side, y + stickyBarHeight);
        context.bezierCurveTo(
          x + side + (heights.top.right * 2),
          y + (side / 3) + heights.top.right,
          x + side + (heights.top.right * 2) - (difference / 3),
          y + (side * 2 / 3) + heights.top.right - (difference / 3),
          x + side + (heights.bottom.right * 2),
          y + side + heights.bottom.right
        );
      }

      //LINE TO BOTTOM LEFT CORNER
      if(heights.bottom.right == heights.bottom.left){
        context.lineTo(x + heights.bottom.left * 2, y + side + heights.bottom.left);
      }
      else {
        var difference = heights.bottom.right - heights.bottom.left;
        context.bezierCurveTo(
          x + (side * 2 / 3) + (heights.bottom.right * 2),
          y + side + heights.bottom.right,
          x + (side / 3) + (heights.bottom.right * 2) - (difference / 3),
          y + side + heights.bottom.left - (difference / 3),
          x + (heights.bottom.left * 2),
          y + side + heights.bottom.left
        );
      }
      if(heights.top.left != heights.bottom.left){
        var difference = heights.bottom.left - heights.top.left;
        context.bezierCurveTo(
          x + (heights.bottom.left * 2) - (difference * 2 / 3),
          y + (side * 2 / 3) + heights.bottom.left - (difference * 2 / 3),
          x + (heights.top.left * 2),
          y + (side / 3) + heights.top.left,
          x + (heights.top.left * 2),
          y + heights.top.left + stickyBarHeight
        );
      }
      context.lineTo(x + heights.top.left * 2, y + heights.top.left);
      context.fill();
    };

    /**
     *  @method private void drawText:
     *  Used internally to draw text on the paper portion of the Sticky.
     *
     *  @arg context: (CanvasRenderingContext2D)
     */
    const drawText = function(context){
      context.font = "20px " + font;
      context.strokeStyle = "#000000";
      context.fillStyle = "#000000";

      var diffs = {
        top: heights.top.right - heights.top.left,
        bottom: heights.bottom.right - heights.bottom.left,
        left: heights.bottom.left - heights.top.left,
        right: heights.bottom.right - heights.top.right
      };

      for(var i=0;i<letters.length;i++){
        for(var j=0;j<letters[i].length;j++){
          var letter = letters[i][j];
          context.save();
          context.translate(letter.x, letter.y);
          context.rotate(letter.rotation);
          context.scale(letter.scale, letter.scale);
          context.fillText(letter.letter, 0, 0);
          context.strokeText(letter.letter, 0, 0);
          context.restore();
        }
      }
    };

    /**
     *  @method void draw:
     *  Renders the Sticky at it's current X and Y coordinates on the Wall.
     *
     *  @arg context: (CanvasRenderingContext2D) The context for drawing on the Wall's canvas.
     */
    const draw = function(context){
      drawShadow(context);
      drawSticky(context);
      drawText(context);
    };

    /**
     *  @method void updatePosition:
     *  Used to modify the position of a Sticky.
     *
     *  @arg moveX: (signed Integer) The amount to move the Sticky along the X-axis.
     *  @arg moveY: (signed Integer) The amount to move the Sticky along the Y-axis.
     */
    const updatePosition = function(moveX, moveY){
      x += moveX;
      y += moveY;

      setCurves();
    };

    /**
     *  @method void setLines:
     *  Used to set the text of the Sticky.
     *
     *  @arg preparedText: (PreparedText) The PreparedText object containing the prepared lines of text for the Sticky.
     */
    const setLines = function(preparedText){
      lines = preparedText.forSticky(font, 20);
      setLetters();
    };

    /**
     *  @method private void setLetters:
     *  Internal method for mapping stored text lines to the curves of the Sticky.
     */
    const setLetters = function(){
      letters = PreparedText.mapLinesToCurves(lines, font, 20, 25, x, y, side, side, curves);
    }

    setCurves();

    return {
      contains: contains,
      draw: draw,
      setText: setLines,
      setCornerHeights: setCornerHeights,
      resetCornerHeights: resetCornerHeights,
      pickUp: pickUp,
      putDown: putDown,
      updatePosition: updatePosition,
      getX: function(){return x;},
      getY: function(){return y;}
    };
  });

  return Sticky;
});
