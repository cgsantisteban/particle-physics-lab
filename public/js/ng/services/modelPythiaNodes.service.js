"use strict";

lab.service('modelPythiaService', function($http,$q) { 
    var pythiaStatus = [];

    var pythiaStatusNodes = $http.get("dataJSON/data/pythiaStatusNodes.json");
	
	var promise = $q.all([pythiaStatusNodes]).then(function(data) {
		
		pythiaStatus = data[0].data;
		
	});
  
    return {
      promise: promise,
      getStatus: function () {
          return pythiaStatus;
      }
    };
});
