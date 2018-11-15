"use strict";

//initial experiment configuration
lab.factory('initExperiment',function($rootScope,modelExperimentService, genericService, 
				 initGeomService, modelSolidService, modelSourceService){
	
	function getExperiment(){
		let experiment = angular.copy(modelExperimentService.getExperiment());
		
		let initDataList = genericService.getInitPhysicsList();
		experiment.physicsLib = initDataList.physicsList[0].lib;
		let initGeomData = initGeomService.getInitGeom(),
			electricField = angular.copy(initGeomData.electricField),
			magneticField = angular.copy(initGeomData.magneticField),
			localMagnetic = angular.copy(initGeomData.magneticField);
		
		//EM fields
		experiment.emField.electric = electricField;
		experiment.emField.magnetic = magneticField;
		experiment.localField.magnetic = localMagnetic;
		
		//lab room definition -----
		let materials = angular.copy(modelSolidService.getMaterialList()),
		solidList = angular.copy(modelSolidService.getModelSolid());
	
		let posrot = angular.copy(initGeomData.posrot);
		
		let labMaterialType = materials[2].materialType,
			labMaterial = materials[2].materialList[4]; //Vacuum 
		
		let labSolid = solidList[0]; //BOX
		
		for(let d in labSolid.dimensions){
			labSolid.dimensions[d].value = 100; //init dimensions
		}
		
		let labRoom = {
				"name": "LabRoom",
				"solid": labSolid,
				"materialType": labMaterialType,
				"material": labMaterial,
				"isWorld": true,
				"isParam": false,
				"position": posrot.position,
			  	"rotation": posrot.rotation
		};
		
		experiment.geometry.volumeList.push(labRoom);
	
		//init source geantino --------
		let particleList = modelSourceService.getParticleList();
		let type = 'particles',
			particleType = 'others';
		let others = particleList[type][particleType];
		let geantino = _.find(others,function(p){
			return p.particleName === 'Geantino';
		})
		let name = 'particleExample';
		let source = {
			'name': name,
			'type': type,
			'particleType': particleType,
			'particle': geantino,
			'distributions': {}
		}
		
		let distributionList = modelSourceService. getDistributionList();
		
		let enerDist = _.find(distributionList,function(d){
			return d.distributionType === 'Energy';
		}); 
		let posDist = _.find(distributionList,function(d){
			return d.distributionType === 'Position';
		});
		
		let dirDist = _.find(distributionList,function(d){
			return d.distributionType === 'Direction';
		});
		
		let timeDist = _.find(distributionList,function(d){
			return d.distributionType === 'Time';
		});
		
		source.distributions['Energy'] = enerDist.distributions[0];
		source.distributions['Position'] = posDist.distributions[0];
		source.distributions['Direction'] = dirDist.distributions[0];
		source .distributions['Time'] = timeDist.distributions[0];
		
		experiment.sourceList.push(source);
		
		return experiment;
		
	}
	
	let initGlobal = function(){
		let initValues = {
				isValidAll: true,
				isValidExperiment: {
						isValidFolder: true,
						isValidEMField: true,
						isValidLocalField: true,
						isValidVolumes: true,
						isValidSources: true,
						isValidActions: true,
						isValidScorers: true,
						isValidFilters: true,
						isValidBeams: true,
						isValidPythiaProcess: true,
						isValidPythiaBeam: true
				},
				isSaved: false, //<---init modifications saved
				showSummary: false,
				isMongo: false,
				okRunExperiment: false,
				maxBeams: null,
				maxLength: 20, //volume,source, etc. names
				termData: {
						pid: null,
						term: null,
						//isActive: false,
						initTerm: true,
						isActive: false
				}
		}
		
		
		return initValues; 
	}
	
	
	//init histograms
	let getHistograms = function(){
		let histograms = {
				"summary":  {
			        "partCount": [],
			        "procCount": [],
			        "procCreator": []
					}, 
				"actionHistograms": [],
				"scorerHistograms": [],
				"pythiaTree": null,
				"pythiaHistograms": []
			};
		
		return histograms;
	}
	
	
	return {
		'getExperiment': getExperiment,
		'getHistograms': getHistograms,
		'initGlobal': initGlobal
	}
	
});
