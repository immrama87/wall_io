define("wallCanvas/Wall/Animations",
  [
    "wallCanvas/Wall/Animations/pickupActive",
    "wallCanvas/Wall/Animations/dropActive"
  ],
  function(
    pickupActive,
    dropActive
  ){
    /**
     * @Object Animations
     * Returns a common interface to each of the configured (and loaded) animation step controllers.
     */
    return {
      pickupActive: pickupActive,
      dropActive: dropActive
    }
  }
);
