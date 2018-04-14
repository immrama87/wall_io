define("wallCanvas/Wall/StickyQuadtree", [], function(){
  /**
   *  @class StickyQuadtree:
   *  Basic quadtree implementation with the exception that edge nodes store an array of Stickies available at that position.
   *
   *  @arg dims: (Object) Object containing the X and Y dimensions of the object the quadtree will represent.
   */
  var StickyQuadtree = (function(dims){
    //Precalculate the smallest base 2 number that encompasses the entire dimension grid
    var largest = Math.max(dims.x, dims.y);
    var size = 2;
    while(size < largest){
      size *= 2;
    }

    var baseNode = new QuadNode(size);

    /**
     *  @method Sticky[] retrieveAt:
     *  Used to retrieve any Stickies that exist at (or within a specified buffer of) the specified position.
     *
     *  @arg x: (Integer) The x-position to check.
     *  @arg y: (Integer) The y-position to check.
     *  @arg buffer: (Integer) The buffered number of pixels around a Sticky to additionally check for.
     *
     *  @return (Sticky[]) An array of all Stickies found to be within the buffered region.
     */
    const retrieveAt = function(x, y, buffer){
      var stickies = [];
      for(var xOff=(150 + buffer) * -1;xOff<=buffer;xOff++){
        for(var yOff=(150 + buffer) * -1;yOff<=buffer;yOff++){
          var found = baseNode.retrieveAt(x + xOff, y + yOff);
          if(found.length > 0)
            stickies = stickies.concat(found);
        }
      }

      return stickies;
    };

    /**
     *  @method void removeSticky:
     *  Removes the specified Sticky from the quadtree.
     *
     *  @arg sticky: (Sticky) The Sticky to remove.
     */
    const removeSticky = function(sticky){
      baseNode.removeAt(sticky.getX(), sticky.getY(), sticky);
    };

    return {
      /**
       *  @method void insertAt:
       *  See QuadNode#insertAt
       */
      insertAt: baseNode.insertAt,
      retrieveAt: retrieveAt,
      removeSticky: removeSticky,
      /**
       *  @method String valueOf:
       *  See QuadNode#getNodeValue
       */
      valueOf: baseNode.getNodeValue
    };
  });

  /**
   *  @class private QuadNode
   *  Represents a single node in the quadtree.
   *
   *  @arg size: (Integer) The base-2 side length of the region represented by the node.
   */
  var QuadNode = (function(size){
    var stickies = [];
    var quads = [null,null,null,null];
    var hasSticky = false;

    /**
     *  @method void insertAt:
     *  Inserts a Sticky at the specified position or, if this node is the edge node for the specified position, inserts the
     *  Sticky for retrieval later.
     *
     *  @arg x: (Integer) The x-position within the region to insert the Sticky.
     *  @arg y: (Integer) The y-position within the region to insert the Sticky.
     *  @arg sticky: (Sticky) The Sticky to insert.
     */
    const insertAt = function(x, y, sticky){
      hasSticky = true;
      if(size%2 == 0){
        var quadrant = 0;
        if(x > size/2){
          quadrant += 1;
          x -= size/2;
        }

        if(y > size/2){
          quadrant += 2;
          y -= size/2;
        }

        if(quads[quadrant] == null)
          quads[quadrant] = new QuadNode(size/2);

        quads[quadrant].insertAt(x, y, sticky);
      }
      else {
        stickies.push(sticky);
      }
    };

    /**
     *  @method Sticky[] retrieveAt:
     *  Returns an array of all Stickies stored at the specified position.
     *
     *  @arg x: (Integer) The x-position within the region to retrieve from.
     *  @arg y: (Integer) The y-position within the region to retrieve from.
     *
     *  @return (Sticky[]) All Stickies stored at the referenced location. Array type in case multiple Stickies are placed
     *                     at the same position.
     */
    const retrieveAt = function(x, y){
      if(size%2 == 0){
        var quadrant = 0;
        if(x > size/2){
          quadrant += 1;
          x -= size/2;
        }

        if(y > size/2){
          quadrant += 2;
          y -= size/2;
        }

        if(quads[quadrant] == null || !hasSticky)
          return [];

        return quads[quadrant].retrieveAt(x, y);
      }
      else {
        return stickies;
      }
    };

    /**
     *  @method boolean removeAt:
     *  Removes the specified Sticky at the specified position.
     *
     *  @arg x: (Integer) The x-position within the region to remove from.
     *  @arg y: (Integer) The y-position within the region to remove from.
     *  @arg sticky: (Sticky) The sticky to remove.
     *
     *  @return (boolean) Returns true if the node still contains a Sticky. Used to update the quadtree's state after a removal.
     */
    const removeAt = function(x, y, sticky){
      if(size%2 == 0){
        var quadrant = 0;
        if(x > size/2){
          quadrant += 1;
          x -= size/2;
        }

        if(y > size/2){
          quadrant += 2;
          y -= size/2;
        }

        if(quads[quadrant] != null){
          var stillPopulated = quads[quadrant].removeAt(x, y, sticky);
          if(!stillPopulated){
            for(var _x=0;_x<size;_x++){
              for(var _y=0;_y<size;_y++){
                if(retrieveAt(_x, _y).length > 0){
                  stillPopulated = true;
                  break;
                }
              }
            }
          }

          if(!stillPopulated)
            hasSticky = false;
        }
        else {
          return false;
        }
      }
      else {
        if(stickies.indexOf(sticky) > -1){
          stickies.splice(stickies.indexOf(sticky), 1);
        }

        return stickies.length > 0;
      }
    };

    /**
     *  @method String getNodeValue:
     *  Used to retrieve a String representation of the region specified by the QuadNode for debugging purposes.
     *
     *  @return (String) For an edge node, returns "1" if a Sticky is located at the position represented by the node,
     *                   "0" otherwise. For non-edge nodes, returns "1" plus the values of all nodes contained in the region
     *                   if any node in the region contains a Sticky, "0" otherwise.
     */
    const getNodeValue = function(){
      var response = "";
      if(hasSticky){
        response += "1";

        if(quads[0] != null){
          response += quads[0].getNodeValue();
        }
        else {
          response += "0";
        }

        if(quads[1] != null){
          response += quads[1].getNodeValue();
        }
        else {
          response += "0";
        }

        if(quads[2] != null){
          response += quads[2].getNodeValue();
        }
        else {
          response += "0";
        }

        if(quads[3] != null){
          response += quads[3].getNodeValue();
        }
        else {
          response += "0";
        }
      }
      else {
        response = "0";
      }

      return response;
    };

    return {
      insertAt: insertAt,
      retrieveAt: retrieveAt,
      removeAt: removeAt,
      getNodeValue: getNodeValue
    };
  });

  return StickyQuadtree;
});
