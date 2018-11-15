"use strict";

lab.service('pageListService', function($http,$q) { 
    var pageList;
	
	var pages = $http.get("dataJSON/pageList.json");
	
	var promise = $q.all([pages]).then(function(data) {
		
    	pageList = data[0].data;
	  	
	});
  
    return {
      promise: promise,
      getPageList: function () {
          return pageList;
      }
    };
});
