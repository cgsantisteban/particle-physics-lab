"use strict";

lab.service('errorListService', function($http,$q) { 
    var errorList;
	
	var errors = $http.get("dataJSON/errorList.json");
	
	var promise = $q.all([errors]).then(function(data) {
		
    	errorList = data[0].data;
	  	
	});
  
    return {
      promise: promise,
      getErrorList: function () {
          return errorList;
      }
    };
});
