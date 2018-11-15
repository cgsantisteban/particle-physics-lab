"use strict";

lab.service('modelExperimentService', function($http,$q) { 
    var experiment = {};
    var pythiaData = {};
    var expModel = $http.get("dataJSON/experimentModel.json");
	var pythiaDataModel = $http.get("dataJSON/pythiaDataModel.json");
	var promise = $q.all([expModel,pythiaDataModel]).then(function(data) {
		
			experiment = data[0].data;
			pythiaData = data[1].data;
	});
  
    return {
      promise: promise,
      getExperiment: function () {
          return experiment;
      },
      getPythiaData: function () {
          return pythiaData;
      }
    };
});
