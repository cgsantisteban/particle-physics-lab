"use strict";

lab.service('initGeomService', function($http,$q) { 
	var initGeom = {};

	//position, rotation and parameterisation
	 var posrot = $http.get("dataJSON/geometry/posrot.json")
	 var parameterisation = $http.get("dataJSON/geometry/parameterisation.json");
	 
	//EM Fields	
	var	magneticField = $http.get("dataJSON/geometry/magneticField.json"),
			electricField = $http.get("dataJSON/geometry/electricField.json");
	 
	var promise = $q.all([posrot, parameterisation, magneticField, electricField]).then(function(data) {
		
		initGeom.posrot = data[0].data;
		initGeom.parameterisation = data[1].data;
		initGeom.magneticField = data[2].data;
		initGeom.electricField = data[3].data;
		
		
	});
  
    return {
      promise: promise,
      getInitGeom: function () {
          return initGeom;
      }
    };
});



