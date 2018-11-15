"use strict";

lab.service('modelSolidService', function($http,$q) { 
    var modelSolidList = [],
    	materialList = [];
    
    //solids
    var box = $http.get("dataJSON/geometry/solids/box.json"),
		cons = $http.get("dataJSON/geometry/solids/cons.json"),
		sphere = $http.get("dataJSON/geometry/solids/sphere.json"),
		tube = $http.get("dataJSON/geometry/solids/tube.json"),
		tubs = $http.get("dataJSON/geometry/solids/tubs.json");
		
	//materials
    var simple = $http.get("dataJSON/geometry/materials/simple.json"),
		compound = $http.get("dataJSON/geometry/materials/compound.json"),
		nuclearMaterials = $http.get("dataJSON/geometry/materials/hepMaterials.json"),
		scintillator = $http.get("dataJSON/geometry/materials/scintillator.json");
    
    
	var promise = $q.all([box, cons, sphere, tube, tubs,
						  simple, compound, nuclearMaterials, scintillator	
	                      ]).then(function(data) {
				
		modelSolidList = modelSolidList.concat(data[0].data,data[1].data,data[2].data,data[3].data,data[4].data);
		var simpleM = {
				"materialType": "simple",
				"materialList": data[5].data
			},
			compoundM = {
				"materialType": "compound",
				"materialList": data[6].data
			},
			nuclearM = {
				"materialType": "HEP materials",
				"materialList": data[7].data
			},
			scintillatorM = {
				"materialType": "scintillator",
				"materialList": data[8].data
			};
			
		materialList = materialList.concat(simpleM,compoundM,nuclearM,scintillatorM);
		
	});
  
    return {
      promise: promise,
      getModelSolid: function () {
          return modelSolidList;
      },
      getMaterialList: function () {
          return materialList;
      }
    };
});
