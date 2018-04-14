define("wallCanvas/API", ["wallCanvas/Wall", "wallCanvas/API/PreparedText"], function(Wall, PreparedText){
  /**
   * @class API
   * Provides access to low-level functions of the WallCanvas.
   * Should only be instantiated by the wallCanvas app and will be exposed at window.wallCanvas.api.
   */
  const API = (function(){
    var canvas;
    const fonts = ["'Rock Salt'"];

    /**
     *  @method Wall createInstance:
     *  Creates a new instance of a Wall in the specified canvas, using an optional parent to scale the canvas to size.
     *  Additionally, preloads all letter widths for all fonts specified.
     *
     *  @arg canvas_id: (String) The id of the canvas to use when rendering the Wall.
     *  @arg parent: (HTMLElement) The parent container to scale the canvas to, defaults to document.body.
     *
     *  @return (Wall) The new instance of the wall.
     */
    const createInstance = function(canvas_id, parent){
      parent = parent || document.body;

      canvas = document.getElementById(canvas_id);
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
      PreparedText.initializeLetterWidths(canvas, fonts);

      return new Wall(canvas);
    };

    /**
     *  @method PreparedText prepareText:
     *  Creates a new PreparedText object which can be formatted by Wall objects (such as Stickies).
     *
     *  @arg text: (String) The text to prepare.
     *
     *  @return (PreparedText)
     */
    const prepareText = function(text){
      if(!canvas){

      }
      else {
        return new PreparedText(canvas, text);
      }
    }

    return {
      createInstance: createInstance,
      prepareText: prepareText
    };
  });

  return API;
});
