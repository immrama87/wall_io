wall_io.directive("wallCanvas", function(){
  const linkFn = function(scope, element, attrs){
    console.log(attrs);
    scope.id = attrs.id;
  };

  return {
    restrict: "E",
    link: linkFn,
    template: "<canvas id={{id}}></canvas>"
  };
});
