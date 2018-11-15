"use strict"; 

lab.factory('validateExpJSON',function(validate,genericService, initGeomService,  initDataService, modelSolidService,modelSourceService, initExperiment, errorListService){
	
	
	function validateExperiment(exp){
		var errorList = errorListService.getErrorList();
		
		var isValidExperiment = {
				elementList:{},
				errorList: []
		};
		isValidExperiment.elementList.isValidJSONFormat = true;
		var expJSON = null;
	    try {
	    	expJSON = JSON.parse(exp);
	    } catch (e) {
	    	isValidExperiment.elementList.isValidJSONFormat = false;
	    	isValidExperiment.errorList.push(errorList["errorJSONFormat"]);
	    }
	    
	    if(isValidExperiment.elementList.isValidJSONFormat){
	    	 isValidExperiment = validateExpJSON(expJSON,errorList);
	    }
	    
	    return isValidExperiment;
	}
	
	function validateExpJSON(expJSON,errorList) {
	
	
		var errorMessageList = [];
		var isValidAll = {
				elementList: {},
				errorList: []
		};
			 
		//name
    	 var isValidName = validate.validateName([],expJSON.name,null, null, 'experimentName');
    	 isValidAll.elementList.isValidName = isValidName.isValid;
    	 
    	 if(!isValidAll.elementList.isValidName){
    		 errorMessageList.push(errorList["experimentName"]);
    	 }
    	 
    	 //visualization
    	 if(typeof(expJSON.isVisualization) !== "boolean"){
    		 isValidAll.elementList.isValidVisualization = false;
    		errorMessageList.push(errorList["visualizationError"]);
    	 }
    	 
    	 //macroFile
    	 if(typeof expJSON.macroFile !== 'string' || expJSON.macroFile.length<=0) {
    		 isValidAll.elementList.isValidMacroFile = false;
    		 errorMessageList.push(errorList["macroFileError"]);
    	 }
    	 
    	 //geomFile
    	 if(typeof expJSON.geomFile !== 'string' || expJSON.geomFile.length<=0) {
    		 isValidAll.elementList.isValidGeomFile = false;
    		 errorMessageList.push(errorList["geomFileError"]);
    	 } 
    	 
    	 //physicsLib
    	 isValidAll.elementList.isValidPhysicsLib = true;
    	 var myDataList = genericService.getInitPhysicsList();
    	 var myPhysicsList = myDataList.physicsList;
    	 var physics = _.map(myPhysicsList, 'lib');
    	 if(typeof expJSON.physicsLib !== 'string'){
    		 isValidAll.elementList.isValidPhycicsLib = false;
    	 }else{
    		 if(physics.indexOf(expJSON.physicsLib)<0) {
    			 isValidAll.elementList.isValidPhysicsLib = false;
    		 }
    	 }
    	 
    	 if(!isValidAll.elementList.isValidPhysicsLib){
    		 errorMessageList.push(errorList["physicsListError"]);
    	 }
    	 
    	 
    	 //process remove
    	 isValidAll.elementList.isValidProcessRemove = true;
    	 if(Array.isArray(expJSON.processRemove) &&   isValidAll.elementList.isValidPhysicsLib){
    		
    			 var isValidProcess = true;
    			 var myphysics = _.find(myPhysicsList, function(physics) { return physics.lib === expJSON.physicsLib; });
    			 
    			 expJSON.processRemove.forEach((process)=> {
    				 if(myphysics.processList.indexOf(process)<0) {
    					 isValidAll.elementList.isValidProcessRemove = false;
    					 return;
    				 }
    			 });
    		
    	 }else{
    		 isValidAll.elementList.isValidProcessRemove = false;
    	 }
    	 
    	 
    	 if(!isValidAll.elementList.isValidProcessRemove){
    		 errorMessageList.push(errorList["processListError"]);
    	 }
    	 
    	 //emField
    	 var emField = expJSON.emField;
    	 var initGeomData = initGeomService.getInitGeom();
    	 var modelElectricField =  angular.copy(initGeomData.electricField);
    	 var modelMagneticField =  angular.copy(initGeomData.magneticField);
    	 if(typeof emField === 'object'){
    		 var electric = expJSON.emField.electric;
	    	 var 	magnetic = expJSON.emField.magnetic;
	    	 var isValidElectricField =  validateElement(expJSON.emField.electric,modelElectricField);
	    	 var isValidMagneticField = validateElement(expJSON.emField.magnetic,modelMagneticField);
	    	 isValidAll.elementList.isValidEMField = (isValidElectricField && isValidMagneticField);
    	 }
    	 else{
    		 isValidAll.elementList.isValidEMField = false;
    		 errorMessageList.push(errorList["emFieldError"]);
    	 }
    	 //end EM Field
    	
    	 //localField
    	 var localField = expJSON.localField;
    	 if(typeof localField === 'object'){
    		 var magnetic = localField.magnetic;
    		 isValidAll.elementList.isValidLocalField = validateElement(magnetic,modelMagneticField);
    		
    	 }else{
    		 isValidAll.elementList.isValidLocalField = false;
    		 errorMessageList.push(errorList["Magnetic"]);
    	 }
    	 // end localField
    	 
    	 //volume list
    	var solidList = angular.copy(modelSolidService.getModelSolid());
    	var posrot = angular.copy(initGeomData.posrot);
    	var solidTypeList = _.map(solidList,'solidType');
    	var materialModelList = angular.copy(modelSolidService.getMaterialList());
    	
    	 isValidAll.elementList.isValidVolumeList = true;
    	 if(typeof expJSON.geometry !== 'object'){
    		 isValidAll.elementList.isValidVolumeList = false;
    		 errorMessageList.push(errorList["errorVolumeList"]);
    		 errorMessageList.push(errorList["sourceListError"]);
    	 }
    	 else{
    		 var volumeList = expJSON.geometry.volumeList;
	    	 if(!Array.isArray(volumeList) || volumeList.length<=0){
	    		 isValidAll.elementList.isValidVolumeList = false;
	    	 }
	    	 else{
	    		
	    		 for(var i=0;i<volumeList.length;i++){
	    			
	    		 	if(typeof volumeList[i] === 'object'){
	    				 isValidAll.elementList.isValidVolumeList = validateVolumeObject(solidList,posrot,materialModelList, volumeList[i]);
		    		 }
		    		 else{
		    			 isValidAll.elementList.isValidVolumeList = false;
		    			 break;
		    		 }
	    		 }
	    		 var world = _.find(volumeList,(v)=>{
	    			 return v.isWorld === true;
	    		 });
	    		 if(typeof world === 'undefined'){
	    			 isValidAll.elementList.isValidVolumeList = false;
	    		 }
	    		 
	    	 }//else isArray volumeList	 
	    	 
	    	 if(!isValidAll.elementList.isValidVolumeList){
	    		 errorMessageList.push(errorList["errorVolumeList"]);
	    	 }
	    	 //end volume list
	    	 
	    	//source list
	    	 if(!expJSON.isPythia){
	    		 
	    		var particleModelList = angular.copy(modelSourceService.getParticleList());
	    		var typeList = Object.keys(particleModelList);
	    		isValidAll.elementList.isValidSourceList = true;
	    		 
	    		 var sourceList = expJSON.geometry.sourceList;
		    	 if(!Array.isArray(sourceList) || sourceList.length<=0){
		    		 isValidAll.elementList.isValidSourceList = false;
		    	 }else{
		    		 for(var i=0; i<sourceList.length;i++){
		    			 var source = sourceList[i];
		    			 var isValidName = validate.validateName(sourceList,source.name,i, 20, 'source');
		    			 			    			
		    			//name
		    			 if(!isValidName.isValid){
		    				 isValidAll.elementList.isValidSourceList = false;
		    				 break;
		    			 }
		    			 
		    			//type
		    			 if(typeList.indexOf(source.type)<0){
		    				 isValidAll.elementList.isValidSourceList = false;
		    				 break;
		    			 }
		    			 else{
		    				 var particleTypeList;
		    				 if(source.type === 'particles'){
		    					 particleTypeList = Object.keys(particleModelList[source.type]);
		    					 if(particleTypeList.indexOf(source.particleType)<0){ //particleType
			    					 isValidAll.elementList.isValidSourceList = false;
			    					 break;
			    				 }
		    				 }
		    				 
		    			 }
		    			 //particle
		    			 var particleModel = null;
		    			 if(typeof source.particle === 'object' && typeof source.particle.gamosName !== 'undefined'){
		    				 if(source.type !== 'particles'){
	    						 particleModel = _.find(particleModelList[source.type],(p)=>{
			    					 return p.gamosName === source.particle.gamosName;
			    				 });
	    					 }
	    					 else{
	    						 particleModel = _.find(particleModelList[source.type][source.particleType],(p)=>{
	    							 return p.gamosName === source.particle.gamosName;
	    						 });
	    					 }
		    			 }else{
		    				 isValidAll.elementList.isValidSourceList = false;
		    				 break;
		    			 }
		    				
		    			 if(source.type === 'particle'){
		    					 if(typeof particleModel !== 'undefined'){
			    					 for(var k in particleModel){
			    						 if(particleModel[k] !== source.particle[k]) {
			    							 isValidAll.elementList.isValidSourceList = false;
			    							 break;
			    						 }
			    					 }
			    				}
			    				 else{
			    					 isValidAll.elementList.isValidSourceList = false;
			    					 break;
			    				 }
			    			 
		    			 }else{ 
		    				 
		    				 if(particleModel.particleName === source.particle.particleName && 
		    						 		particleModel.gamosName === source.particle.particleName){
		    					 if(typeof source.particle.parameters === 'object'){
		    						 for(var k in source.particle.parameters){
		    							 if(source.particle.parameters[k].units !== particleModel.parameters[k].units){
		    								 isValidAll.elementList.isValidSourceList = false;
		    								 break;
		    							 }
		    						 }
		    					 }
		    				 }
		    				 
		    			 }
		    			 //distributions
		    			 var isValidD = validate.validateSource(source);
		    			 
		    			 for(var d in isValidD.isValidDistribution.errorDist){
		    				 var distribution =  isValidD.isValidDistribution.errorDist[d];
		    				 
		    				 for(var v in distribution){
		    					 if(!distribution[v]){
		    						isValidAll.elementList.isValidSourceList = false;
		    						break; 
		    					 } 
		    				 }
		    			 }
		    		 }
		    	 }
	    	 }
	    	 
	    	 if(!isValidAll.elementList.isValidSourceList){
	    		 errorMessageList.push(errorList["sourceListError"]);
	    	 }
	    	 
	    	 //end source list
	    	 
	    	 
    	 }//geometry is object
    	
    	 
		 //data
		isValidAll.elementList.isValidData = false;
		if(typeof expJSON.data === 'object'){
			 isValidAll.elementList.isValidData = true;
			 //Actions
			
			 var actionList = expJSON.data.actionList;
			 isValidAll.elementList.isValidActions = false;
			 if(Array.isArray(actionList)){
				 var isValidAction = true;
				 for(var i=0;i<actionList.length;i++){
					 var action = actionList[i];
					 isValidAction = false;
					 if(typeof action.name != 'undefined'){
						 if(action.name !== null){
							 if(typeof action.actionType != 'undefined'  && action.actionType != null){
								 var initDataList = initDataService.getInitActionScorer(),
									initActionList = initDataList.actionList;
								 	var find = false;
									for(var ii=0;ii<initActionList.length;ii++){
										if(action.actionType === initActionList[ii].type){
											find = true;
											break;
										} 
									}
									if(find){
										if(Array.isArray(action.dataList)){
											isValidAction = true;
											//implementar resto validaciones
										}
									}
							 	}//actionType
						 }
						 
						 
					 	}//action.name undefined
					 	if(!isValidAction) break;
					 }//for actionList
				 	isValidAll.elementList.isValidActions = isValidAction;
				 }//is Array
			 	
			 //end actions
			 
			 //scorers
			 isValidAll.elementList.isValidScorers = false;
			 var scorerList = expJSON.data.scorerList;
			 if(Array.isArray(scorerList)){
				 var isValidScorer = true;
				 for(var i=0;i<scorerList.length;i++){
					 isValidScorer = false;
					 var scorer = scorerList[i];
					 if(typeof scorer.name != 'undefined'){
						 if(scorer.name != null){
							 if(typeof scorer.volume != 'undefined'){
								 if(scorer.volume != null){
									 if(typeof scorer.data === 'object'){
										 isValidScorer = true;
									 }
								 }
							 }
						 }
					 }
					if(!isValidScorer) break; 
				 }
				 isValidAll.elementList.isValidScorers = isValidScorer;
			 }
			 //end scorers
			 //filters
			 isValidAll.elementList.isValidFilters = false;
			 var filterList = expJSON.data.filterList;
			 if(Array.isArray(filterList)){
				 var isValidFilter = true;
				 for(var i=0;i<filterList.length;i++){
					 var filter = filterList[i];
					 isValidFilter = false;
					 if(typeof filter === 'object'){
						 if(typeof filter.name != 'undefined'){
							 if(filter.name !== null){
								 isValidFilter = true;
							 }
						 }
					 }
					 if(!isValidFilter) break;
				 }
				 isValidAll.elementList.isValidFilters = isValidFilter;
			 }
		}//data is object
		 
	    if(!isValidAll.elementList.isValidData){
	    	errorMessageList.push(errorList["dataError"]);
	    }
	    else{
	    	if(!isValidAll.elementList.isValidActions){
		    	errorMessageList.push(errorList["actionListError"]);
		    }
		    
		    if(!isValidAll.elementList.isValidScorers){
		    	errorMessageList.push(errorList["scorerListError"]);
		    }
		    
		    if(!isValidAll.elementList.isValidFilters){
		    	errorMessageList.push(errorList["filterListError"]);
		    }
	    }
	    
	    if(errorMessageList.length>0){
	    	isValidAll.errorList = errorMessageList;
	    }
	    
	    return isValidAll;
	}
	
	function validateElement(element, model){
		var isValid = false;
		
		if(typeof element === 'object'){
			
			for(var k in model){
				isValid = (typeof element[k]) === (typeof model[k]);
				if(!isValid){
					break;
				}
			}
		}
		
		return isValid;
	}
	
	
	function validateVolumeObject(solidList,posrot,materialModelList,volume){
		var isValid = true;
		//dimensions
		 if(typeof volume.solid === 'object'){
			 
			 var solidModel = _.find(solidList,(s)=>{
					return s.solidType === volume.solid.solidType;
				});
			if(typeof solidModel !== 'undefined'){
				var isValidObject = validateElement(volume.solid.dimensions,solidModel.dimensions);
				isValid = isValidObject;
				if(isValidObject){
					var isValidDimensions = validate.validateDimensions(volume);
					for(var d in isValidDimensions.dimensions){
						if(!isValidDimensions.dimensions[d]){
							isValid = false;
							break;
						}
					}
				}
			}else{
				isValid = false;
			}
		 }
		 else{
			 isValid = false;
		 }
		 //end dimensions
		 
		 //position
		 var isValidPosition = validateElement(volume.position,posrot.position);
		 
		//rotation
		 var isValidRotation = validateElement(volume.rotation,posrot.rotation);
		 
		 isValid = isValid && isValidPosition && isValidRotation;
		 
		 //materials
		 var material = volume.material;
		 var isValidMaterial = false;
		 var materialTypeList  = _.map(materialModelList, 'materialType');
		 
		 if(typeof material === 'object'){
			 if(materialTypeList.indexOf(volume.materialType)>=0){
				 var materials = _.find(materialModelList,(mL)=>{
					 return mL.materialType === volume.materialType;
				 });
				 if(typeof materials !== 'undefined' && typeof volume.material === 'object'){
					
					 var mv = _.find(materials.materialList,(m)=>{
						 return (m.gamosName === volume.material.gamosName) && (m.name === volume.material.name);
					 });
					 
					 if(typeof mv !== 'undefined') isValidMaterial = true;
				 }
			 }
		 } 
		
		 isValid = isValid && isValidMaterial;
		 //end materials
		 
		 return isValid;
		 
	}//validate VolumeObject
	

	return {
		'validateExperiment': validateExperiment
	}
	
});
