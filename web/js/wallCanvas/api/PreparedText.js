define("wallCanvas/API/PreparedText", [], function(){
  //This is populated by initializeLetterWidths and will be filled with the width of all letters (upper and lower case),
  //plus a single whitespace character, at 16px font size, for all registered fonts.
  var letterMap = {};

  /**
   * @class PreparedText
   * Used for preparing text for display in any format required on a Wall.
   *
   * @arg canvas: (HTMLCanvasElement) The canvas element used for rendering the Wall.
   * @arg text: (String) The text to prepare.
   */

  const PreparedText = (function(canvas, text){
    const context = canvas.getContext('2d');
    var words = text.split(" ");

    /**
     * String[] forSticky:
     * Prepares the text for display on a sticky.
     *
     * @arg font: (String) The font the text will be rendered in.
     * @arg fontSize: (Integer) The font size the text will be rendered in.
     */
    const forSticky = function(font, fontSize){
      const lineWidth = 130; //Default rendering of a sticky has a side length of 150, so 10px padding on the sides
      const lines = [];

      var completed = false;
      var line;
      var wordsOriginal = words;

      context.font = fontSize + "px " + font;
      var toTest = words.splice(0,1)[0];
      while(lines.length < 5 && !completed){ //Since the line height is 25 when rendering text on a sticky, we can only fit 5 lines without getting too close to the bottom line
        line = "";
        toTest = toTest.substring(toTest.lastIndexOf(" ") + 1);
        var test = context.measureText(toTest);
        while(test.width <= lineWidth && !completed){
          line = toTest;
          if(words.length > 0){
            toTest += " " + words.splice(0,1)[0];
            test = context.measureText(toTest);
          }
          else {
            completed = true;
          }
        }

        //TODO: Add some sort of hyphenator for long words.
        lines.push(line);
      }

      if(!completed){
        var toSlice = 1;
        var toTest = lines[4] + "...";
        var test = context.measureText(toTest);

        while(test.width > lineWidth){
          toTest = lines[4].substring(0, lines[4].length - toSlice) + "...";
          test = context.measureText(toTest);
          toSlice++;
        }

        lines[4] = toTest;
      }

      words = wordsOriginal; //Reset the words so that the PreparedText object is reusable.
      return lines;
    }

    return {
      forSticky: forSticky
    };
  });

  /**
   * @method static void initializeLetterWidths:
   * Called on initialization of a Wall to preload the widths of all 26 letters (lower- and upper-case) and single whitespace
   * character for all fonts specified.
   *
   * @arg canvas: (HTMLCanvasElement) The canvas element user for rendering the Wall.
   * @arg fonts: (String[]) The fonts to preload widths for.
   */
  const initializeLetterWidths = function(canvas, fonts){
    var context = canvas.getContext('2d');
    for(var i=0;i<fonts.length;i++){
      letterMap[fonts[i]] = {};
      context.font = "16px " + fonts[i];
      for(var j=0;j<26;j++){
        var lower = String.fromCharCode(97 + j);
        var upper = String.fromCharCode(65 + j);

        letterMap[fonts[i]][lower] = context.measureText(lower).width;
        letterMap[fonts[i]][upper] = context.measureText(upper).width;
      }

      letterMap[fonts[i]][" "] = context.measureText(" ").width;
    }
  };

  /**
   * @method static Integer getLetterWidth:
   * Returns a letter width for a given letter in a given font, at a given font size.
   *
   * @arg letter: (char) The letter to retrieve the width for.
   * @arg font: (String) The font to render the letter in.
   * @arg fontSize: (Integer) The font size to render the letter in.
   *
   * @return (Integer) The width of the letter in the given font, at the given font size.
   */
  const getLetterWidth = function(letter, font, fontSize){
    var ratio = fontSize / 16;
    if(letterMap.hasOwnProperty(font)){
      if(letterMap[font].hasOwnProperty(letter)){
        return letterMap[font][letter] * ratio;
      }
    }

    return letterMap[font][" "] * ratio;
  };

  /**
   * @method private Float B
   * Returns the derived coordinate (either X or Y) at a given position along a bezier curve.
   *
   * @arg t: (Float) The position along the curve, specified as a percentage (0 - 1).
   * @arg pos: (Integer) The position to derive (0 for X, 1 for Y)
   * @arg curve: (Float[][]) An array containing the anchor and control points of the curve.
   *
   * @return (Float) The coordinate (specified by pos) derived at the position along the curve.
   */
  const B = function(t, pos, curve){
    //Taken from https://en.wikipedia.org/wiki/B%C3%A9zier_curve
    return ((1 - t) * (1 - t) * (1 - t)) * curve[0][pos] +
      3 * ((1 - t) * (1 - t)) * t * curve[1][pos] +
      3 * (1 - t) * (t * t) * curve[2][pos] +
      (t * t * t) * curve[3][pos];
  }

  /**
   * @method static responseLetter[][] mapLinesToCurves:
   * Used to map lines (returned from one of the PreparedText formatting methods) to the curves of a rendered object.
   *
   * @arg lines: (String[]) The lines to map.
   * @arg font: (String) The font to render the lines in.
   * @arg fontSize: (Integer) The font size to render the lines in.
   * @arg lineHeight: (Integer) The height between lines to be rendered.
   * @arg height: (Integer) The height of the rendered object.
   * @arg width: (Integer) The width of the rendered object.
   * @arg curves: (Object) An object containing keys for 'top', 'right', 'bottom', and 'left', each containing a Float[][]
   *              describing the curve on that edge of the rendered object. ('top', 'bottom' and 'right' are required at
   *              minimum).
   *
   * @return (responseLetter[][]) An 2-d array where the first dimension represents a line, the second dimension represents a
   *                              a single letter and each responseLetter object contains:
   *                                * letter: (char) The letter to render
   *                                * x: (Float) The x-position of render at.
   *                                * y: (Float) The y-position of render at.
   *                                * scale: (Float) The scaling percentage to apply to the letter when rendering.
   *                                * rotation: (Float) The degree of rotation to apply to the letter when rendering, expressed
   *                                                    in radians (what CanvasRenderingContext2D#rotate requires).
   */
  const mapLinesToCurves = function(lines, font, fontSize, lineHeight, height, width, curves){
    var letterY, letterX;
    var previousLine = curves.top[0][1];
    var response = [];
    for(var i=0;i<lines.length;i++){
      var responseLine = [];
      var lineY = curves.top[0][1] + lineHeight * (i + 1);
      var ratio = (lineY - curves.top[0][1]) / height;
      letterX = B(ratio, 0, curves.left.slice().reverse());

      var lineCurve = [];
      //Precalculate the curve at the desired y-position as a blend between the top and bottom ratios.
      lineCurve.push([
        curves.top[0][0] + ((curves.bottom[3][0] - curves.top[0][0]) * ratio),
        curves.top[0][1] + ((curves.bottom[3][1] - curves.top[0][1]) * ratio)
      ]);
      lineCurve.push([
        curves.top[1][0] + ((curves.bottom[2][0] - curves.top[1][0]) * ratio),
        curves.top[1][1] + ((curves.bottom[2][1] - curves.top[1][1]) * ratio)
      ]);
      lineCurve.push([
        curves.top[2][0] + ((curves.bottom[1][0] - curves.top[2][0]) * ratio),
        curves.top[2][1] + ((curves.bottom[1][1] - curves.top[2][1]) * ratio)
      ]);
      lineCurve.push([
        curves.top[3][0] + ((curves.bottom[0][0] - curves.top[3][0]) * ratio),
        curves.top[3][1] + ((curves.bottom[0][1] - curves.top[3][1]) * ratio)
      ]);

      lineY = B(0, 1, lineCurve);

      var offset = 10;
      var nextX = undefined;
      var nextY = undefined;
      for(var j=0;j<lines[i].length;j++){
        letterX = nextX || B((offset / width), 0, lineCurve);
        letterY = nextY || B((offset / width), 1, lineCurve);

        var responseLetter = {};
        responseLetter.letter = lines[i][j];
        responseLetter.x = letterX;
        responseLetter.y = letterY;

        var yRatio = (letterY - previousLine) / lineHeight;
        responseLetter.scale = yRatio

        offset += getLetterWidth(lines[i][j], font, fontSize);
        var nextX = B((offset / width), 0, lineCurve);
        var nextY = B((offset / width), 1, lineCurve);

        responseLetter.rotation = Math.atan2((nextY - letterY), (nextX - letterX));
        responseLine.push(responseLetter);
      }

      response.push(responseLine);
      previousLine = lineY;
    }

    return response;
  };

  PreparedText.initializeLetterWidths = initializeLetterWidths;
  PreparedText.getLetterWidth = getLetterWidth;
  PreparedText.mapLinesToCurves = mapLinesToCurves;

  return PreparedText;
});
