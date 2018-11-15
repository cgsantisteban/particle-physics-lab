"use strict";

lab.service('modelSourceService', function($http,$q) { 
    
	//particles
	var leptons = $http.get("dataJSON/sources/particles/leptons.json"),
		mesons = $http.get("dataJSON/sources/particles/mesons.json"),
		baryons = $http.get("dataJSON/sources/particles/baryons.json"),
		others = $http.get("dataJSON/sources/particles/others.json"),
		ions = $http.get("dataJSON/sources/particles/ions.json"),
		elements = $http.get("dataJSON/sources/particles/elements.json"),
		gamosIso = $http.get("dataJSON/sources/particles/isotopes.json");
	
	var	particleList = {},
		distributionList = [],
		pythia = {};
    
	//distributions
    var energyDistribution = $http.get("dataJSON/sources/distributions/energyDistribution.json"),
    	positionDistribution = $http.get("dataJSON/sources/distributions/positionDistribution.json"),
    	directionDistribution = $http.get("dataJSON/sources/distributions/directionDistribution.json"),
    	timeDistribution = $http.get("dataJSON/sources/distributions/timeDistribution.json");
    
    //Pythia
    var pythiaData = $http.get("dataJSON/sources/pythiaData.json");
    
	var promise = $q.all([others, leptons, mesons, baryons, ions, elements, gamosIso,
	                      energyDistribution,  positionDistribution, directionDistribution, timeDistribution,
	                      pythiaData
	                      ]).then(function(data) {
				
		
		
    	var particles = {};
	  	particles.others = data[0].data;
	  	particles.leptons = data[1].data;
	  	particles.mesons = data[2].data;
	  	particles.baryons = data[3].data;
	  	particles.ions = data[4].data;
	  		 	  
		var isotopes = data[5].data;
		var gamosIsotopes = data[6].data;
		
		particleList.particles = particles;
		particleList.isotopes = isotopes;
		particleList['GAMOS isotopes'] = gamosIsotopes;
		
		distributionList = [data[7].data, data[8].data, data[9].data, data[10].data]; 
		
		pythia = data[11];	
		
	});
  
    return {
      promise: promise,
      getParticleList: function () {
          return particleList;
      },
      getDistributionList: function () {
          return distributionList;
      },
      getPythiaData: function () {
          return pythia;
      }
    };
});
