"use strict";

lab.factory('validate',function(errorListService){
	var errorMessageList = errorListService.getErrorList();
	
	//validate GAMOS data, scorers, volumes, sources and experiment name
	var validateName = function(list,name,id, maxLength, nameType){
		var isValidName = {};
		var isRepeated = false;
		var isValidChar = true;
  		var validChar =  /^[a-zA-Z\d]*$/; 
		if(typeof name != 'undefined' && name !== null){
			//name = name.toLowerCase();
			var pos = 0;
  			while(!isRepeated && pos < list.length){
  				var vName = list[pos].name; //.toLowerCase();
  				if(id !== pos && vName === name){
  					isRepeated = true;
  				} 
  				else pos++;
  				
  			}
  			var isValidLen = (name.length > 0);
  			if(nameType !== 'experimentName'){
  				isValidChar = isValidLen && validChar.test(name) && (name.length<= maxLength);
  			} 
  			else {
  				isValidChar = isValidLen;
  			}
		} 
		else{
			isValidChar = false;
		}
		
  		isValidName.isValid = !isRepeated && isValidChar;
		
		if(isRepeated) isValidName.errorMessages = errorMessageList["RepeatedName"];
		if(!isValidChar) isValidName.errorMessages = errorMessageList["ValidCharName"];

		return isValidName;
	}
	
	//validate experiment description
	var validateText = function(text,maxLength){
		var isValidText = {};
		var isValidLength = true;
		if(typeof text != 'undefined' && text !== null){
			isValidLength =  (text.length <= maxLength) ;
		}
		
		isValidText.isValid = isValidLength;
		if(!isValidLength) isValidText.errorMessages = errorMessageList["ValidText"];
		
		return isValidText;
	}
	
	function validateValue(type,value){ //validate values 
		var isValid = true;
		
		if(!Number.isNaN(value) && Number.isFinite(value)){	
			
			//if(type === 'position' || type === 'step') isValid = true; 
			
			if(type === 'Length' || type === 'Delta' || type === 'Life time'){
				if (value<=0 ) isValid = false;
			}
			
			if(type === 'Pseudorapidity' || type === 'Radius' || 
				type === 'Energy'  || type === 'Time' || type === 'Activity' || 
				type === 'Excitation energy' || type === 'Momentum'){
	
				if (value<0 ) isValid = false;
			}
			
			if(type === 'Ncopies' || type === 'Mass number' || type === 'nBeams' || type === 'Counter' || type === 'Grade'){
				isValid = Number.isInteger(value); 
				
				if(type === 'Counter' || type === 'Grade') {
					isValid = isValid && value >=0;
				}
				else {
					isValid = isValid && value > 0;
				}
				
				if(type === 'nBeams' && value > Number.MAX_SAFE_INTEGER){
					isValid = false;
				}
			}
			
			if(type === 'Opacity'){
				isValid = (value>=0) && (value<=1);
			}
				
		}
		else isValid = false;
		
		return isValid;
	}
	
	//solid dimensions
	var validateDimensions = function(volume){
		
		var isValidSolid = {};
		isValidSolid.dimensions = {};
		isValidSolid.errorMessages = []; 
		var errorList = [];
		var valueType;
		
		for(var key in volume.solid.dimensions) isValidSolid.dimensions[key] = true; //init values;
		
		if(volume.solid.solidType === 'BOX'){
			var valueType = volume.solid.dimensions[key].type;
			for(var key in volume.solid.dimensions){
				isValidSolid.dimensions[key] = validateValue(valueType,volume.solid.dimensions[key].value);
				
				if(!isValidSolid.dimensions[key] && errorList.indexOf(valueType)<0){
					errorList.push(valueType);
				}
				
			}
		}
		
		if(volume.solid.solidType === 'SPHERE'){
			for(var key in volume.solid.dimensions){
				
				var isValidValue = true;
				var valueType = volume.solid.dimensions[key].type;
				isValidValue = validateValue(valueType,volume.solid.dimensions[key].value);
				
				if(isValidValue){
					var errorType = null;
					var innerKey = 'Inner radius',
						outerKey = 'Outer radius';
					if(volume.solid.dimensions[innerKey].value >= volume.solid.dimensions[outerKey].value){
						isValidSolid.dimensions[innerKey] = isValidSolid[outerKey] = false;
						errorType = 'innerouter';
						if(errorList.indexOf(errorType)<0) errorList.push(errorType);
					}
					
					var deltaPhiKey = 'Delta phi'
					if(volume.solid.dimensions[deltaPhiKey].value > 360){
						isValidSolid.dimensions[deltaPhiKey] = false;
						errorType = 'phiLength';
						
					}
					
					var startThetaKey = 'Starting theta'; 
					if(volume.solid.dimensions[startThetaKey].value >= 180){
						isValidSolid.dimensions[startThetaKey] = false;
						errorType = 'startLength';
					}
					
					var deltaThetaKey = 'Delta theta'
						if(volume.solid.dimensions[deltaThetaKey].value > 180){
							isValidSolid.dimensions[deltaThetaKey] = false;
							errorType = 'thetaLength';
					}
					
					if(errorType !== null && errorList.indexOf(errorType)<0) errorList.push(errorType);
				}
				else {
					isValidSolid.dimensions[key] = false;
					if(errorList.indexOf(valueType)<0) errorList.push(valueType); 
					
				}
			}
			
		}//sphere
		
		if(volume.solid.solidType === 'TUBE'){
			
			for(var key in volume.solid.dimensions){
				
				var isValidValue = true;
				var valueType = volume.solid.dimensions[key].type;
				isValidValue = validateValue(valueType,volume.solid.dimensions[key].value);
				
				if(isValidValue){
					var errorType = null;
					var innerKey = 'Inner radius',
						outerKey = 'Outer radius';
					if(volume.solid.dimensions[innerKey].value >= volume.solid.dimensions[outerKey].value){
						isValidSolid.dimensions[innerKey] = isValidSolid[outerKey] = false;
						errorType = 'innerouter';
					}
					
					if(errorType !== null && errorList.indexOf(errorType)<0) errorList.push(errorType);
				}
				else {
					isValidSolid.dimensions[key] = false;
					if(errorList.indexOf(valueType)<0) errorList.push(valueType);
				}
			}
			
		}//TUBS
		
		
		if(volume.solid.solidType === 'TUBS'){
			
			for(var key in volume.solid.dimensions){
				
				var isValidValue = true;
				var valueType = volume.solid.dimensions[key].type;
				isValidValue = validateValue(valueType,volume.solid.dimensions[key].value);
				
				if(isValidValue){
					var errorType = null;
					var innerKey = 'Inner radius',
						outerKey = 'Outer radius';
					if(volume.solid.dimensions[innerKey].value >= volume.solid.dimensions[outerKey].value){
						isValidSolid.dimensions[innerKey] = isValidSolid[outerKey] = false;
						errorType = 'innerouter';
					}
				
					var deltaKey = 'Delta phi';
					if(volume.solid.dimensions[deltaKey].value > 360){
						isValidSolid.dimensions[deltaKey] = false;
						errorType = 'phiLength';
					}
					
					if(errorType !== null && errorList.indexOf(errorType)<0) errorList.push(errorType);
				}
				else {
					isValidSolid.dimensions[key] = false;
					if(errorList.indexOf(valueType)<0) errorList.push(valueType);
				}
			}
			
		}//TUBS
		
		if(volume.solid.solidType === 'CONS'){
			for(var key in volume.solid.dimensions){
				
				var isValidValue = true;
				var valueType = volume.solid.dimensions[key].type;
				isValidValue = validateValue(valueType,volume.solid.dimensions[key].value);
				
				if(isValidValue){
					var errorType = null;
					var innerUpKey = 'Inner radius up',
						outerUpKey = 'Outer radius up';
					if(volume.solid.dimensions[innerUpKey].value >= volume.solid.dimensions[outerUpKey].value){
						isValidSolid.dimensions[innerUpKey] = isValidSolid.dimensions[outerUpKey] = false;
						errorType = 'innerouter';
					}
				
					var innerDownKey = 'Inner radius down',
						outerDownKey = 'Outer radius down';
					if(volume.solid.dimensions[innerDownKey].value > volume.solid.dimensions[outerDownKey].value){
						isValidSolid.dimensions[innerDownKey] = isValidSolid.dimensions[outerDownKey] = false;
						errorType = 'innerouter';
					}
					
					var deltaKey = 'Delta phi';
					if(volume.solid.dimensions[deltaKey].value > 360){
						isValidSolid.dimensions[deltaKey] = false;
						errorType = 'phiLength';
					}
					
					if(errorType !== null && errorList.indexOf(errorType)<0) errorList.push(errorType);
					
				}
				else {
					isValidSolid.dimensions[key] = false;
					if(errorList.indexOf(valueType)<0) errorList.push(valueType);
				}
			}
		}//Cons
		
		var errorMessages = [];
		for(var i=0;i<errorList.length;i++){
			errorMessages.push(errorMessageList[errorList[i]]);
		}

		isValidSolid.errorMessages = errorMessages;
		
		return isValidSolid;
	}
	
	//position, rotation an opacity
	function validateVolume(volume){
		var isValidPosition = {},
			isValidRotation = {};
		  
		for(var coord in volume.position){
			var isValid = validateValue(volume.position[coord].type,volume.position[coord].value);
			isValidPosition[coord] = isValid;
		}
		
		for(var coord in volume.rotation){
			var isValid = validateValue(volume.rotation[coord].type,volume.rotation[coord].value);
			isValidRotation[coord] = isValid;
		}
		
		var isValidOpacity = validateValue('Opacity',volume.opacity);
		
		
		var isValidVolume = {
			"isValidPosition": isValidPosition,
			"isValidRotation": isValidRotation,
			"isValidOpacity": isValidOpacity
		}
		
		return isValidVolume;
	}
	
	//source
	function validateSource(source){
		var isValidSource = {};
		var isValidDistribution = {};
		isValidDistribution.errorDist = {};
		var errorList = [],
			errorType = null;
		var minEnergy = null, 
			maxEnergy = null;
		
		for(var d in source.distributions){
		
			isValidDistribution.errorDist[d] = {};
			if(source.distributions[d] !== null){
				for(var p in source.distributions[d].parameters){
					var parameter = source.distributions[d].parameters[p];
					var valueType = parameter.type;
					
				
					var isValid = true;
					if(p !== 'volume' ){
						isValid = isValid && validateValue(valueType,parameter.value);
						isValidDistribution.errorDist[d][p] = isValid;
					}
					else{
						isValid = isValid && parameter.value !== null && parameter.value.length > 0;
						isValidDistribution.errorDist[d][p] = isValid;
						valueType = 'Volume';
					}
					
					errorType = valueType;
					if(!isValid && errorList.indexOf(errorType)<0){
						
						errorList.push(errorType);
					} 
					if(source.distributions[d].type === 'Random flat energy'){
						if(isValid ){
							minEnergy = source.distributions[d].parameters['min. energy'].value;
							maxEnergy = source.distributions[d].parameters['max. energy'].value;
						}
					}
				}
			}//if dist != null
				
			
		}//for distributions
		
		if(minEnergy !==null && maxEnergy !== null){
			errorType = 'energyRange';
			if(minEnergy >= maxEnergy && errorList.indexOf(errorType)<0){
				isValidDistribution.errorDist['Energy'] = {
							"min. energy": false,
							"max. energy": false};
				
				errorList.push(errorType);
			}
		}
		
		var errorMessages = [];
		for(var i=0;i<errorList.length;i++){
			errorMessages.push(errorMessageList[errorList[i]]);
		}
		isValidDistribution.errorMessages = errorMessages;
		
		isValidSource.isValidDistribution = isValidDistribution;
		
		if(source.type === 'isotopes'){ //validation mass number and excitation energy
			var isValidIsotope = {}
			isValidIsotope.errorIsotope = {};
			var errorList = [];
			
			for(var parameter in source.particle.parameters){
				var isValid = true;
				if(parameter != 'Atomic number'){
					
					valueType = parameter;
					isValid = isValid && validateValue(valueType,source.particle.parameters[parameter].value);
					isValidIsotope.errorIsotope[valueType] = isValid;
					errorType = valueType;
					if(!isValid && errorList.indexOf(errorType)<0){
						
						errorList.push(errorType);
					}
				}
			}
			
			var massNumber = source.particle.parameters['Mass number'].value,
				atomicNumber = source.particle.parameters['Atomic number'].value;
			if(massNumber<atomicNumber) {
				isValid = false;
				isValidIsotope.errorIsotope['Mass number'] = isValid;
				var errorType = 'Atomic number';
				if(!isValid && errorList.indexOf(errorType)<0) errorList.push(errorType);
			}
			
			var errorMessages = [];
			for(var i=0;i<errorList.length;i++){
				errorMessages.push(errorMessageList[errorList[i]]);
			}
			isValidIsotope.errorMessages = errorMessages;
			
			isValidSource.isValidIsotope = isValidIsotope;
			
			
		}
		else delete isValidSource.isValidIsotope;
		
		if(source.type === 'GAMOS isotopes'){
			var isValidGamosIsotope = {}
			isValidGamosIsotope.errorGamosIsotope = {};
			var errorList = [];
			
			for(var parameter in source.particle.parameters){
				var isValid = true;
				valueType = parameter;
				isValid = isValid && validateValue(valueType,source.particle.parameters[parameter].value);
				isValidGamosIsotope.errorGamosIsotope[valueType] = isValid;
				errorType = valueType;
				if(!isValid && errorList.indexOf(errorType)<0){
					
					errorList.push(errorType);
				}
				
			}
			
			var errorMessages = [];
			for(var i=0;i<errorList.length;i++){
				errorMessages.push(errorMessageList[errorList[i]]);
			}
			isValidGamosIsotope.errorMessages = errorMessages;
			
			isValidSource.isValidGamosIsotope = isValidGamosIsotope;
			
		}
		else delete isValidSource.isValidGamosIsotope;
		
		return isValidSource;
		
	}
	
	//filters
	function validateParamFilter(parameters){
		var isValidParameters = [];
		for(var i=0;i<parameters.length;i++){
			var param = parameters[i],
				isValidParam = {},
				isValid = true;
			
			if(param.paramType === 'selectParticle' || param.paramType === 'selectProcess' || param.paramType === 'selectFlux'){
				if(param.value === null) isValid = false;
				isValidParam.isValid = isValid;
			}else{
				isValid = validateValue(param.paramType,param.value);
				isValidParam.isValid = isValid;
			}
			
			isValidParam.errorMessages = [];
			if(!isValid){
				var error = errorMessageList[param.paramType]
				isValidParam.errorMessages.push(error);
			}
			isValidParameters.push(isValidParam);
		}
		
		return isValidParameters;
	}
	
	//action histograms
	function validateHistogram(data){
		
		var limits = data.limits,
			nBins = data.nbins,
			dataType = data.type;
		
		var isValidLimit = []

		for(var i=0;i<limits.length;i++){
			
			var isValid = {};
			var errorMessages = [];
			isValid.isValid = validateValue(dataType,limits[i]);
			if(!isValid.isValid) {
				errorMessages.push(errorMessageList[dataType]);
				isValid.errorMessages = errorMessages;
			}
			isValidLimit.push(isValid);
		}
		if(isValidLimit[0].isValid && isValidLimit[1].isValid){
			
			if(limits[0]>=limits[1]) {
				isValidLimit = [];
				isValid.isValid =  false,
				isValid.errorMessages = [];
				isValidLimit = [isValid, isValid];
				
				var errorType = 'minmax';
				isValidLimit[0].errorMessages.push(errorMessageList[errorType]);
			}
			
		}
		var isValidNbins = {},
			errorMessages = [];
		var isValid =  !Number.isNaN(nBins) && (Number.isFinite(nBins)) &&
							(nBins === parseInt(nBins, 10)) && (nBins > 0);

		isValidNbins.isValid = isValid;
		if(!isValidNbins.isValid){
			errorMessages.push(errorMessageList['nbins']);
			isValidNbins.errorMessages = errorMessages;
		}
		
		var isValidData= {
			'isValidNbins': isValidNbins,
			'isValidLimit': isValidLimit
		}
		
		return isValidData;
		
	}
	
	//phantom parameterisation
	function validateLayerScorer(layer,maxLayer){
		
		var isValidLayer = {},
			errorMessages = [];
		var isValid =  !Number.isNaN(layer) && (Number.isFinite(layer)) &&
							(layer === parseInt(layer, 10)) && (layer > 0) && (layer <= maxLayer);

		isValidLayer.isValid = isValid;
		if(!isValidLayer.isValid){
			errorMessages.push(errorMessageList['layer']);
			isValidLayer.errorMessages = errorMessages;
		}
		
		return isValidLayer;
	}
	
	var validateRangeFit = function(xMin,xMax,min,max,histogramType){
		
	
		var isvalidMin = !Number.isNaN(xMin) && Number.isFinite(xMin) && (xMin <= xMax) && (xMin <= max);
		var isvalidMax = !Number.isNaN(xMax) && Number.isFinite(xMax) && (xMax >= xMin) && (xMax >= min);
		
		//var isvalidMin = validateValue(null,xMin);
		//var isvalidMin = validateValue(null,)
		
		isvalidMin = isvalidMin && (xMin >= min);
		isvalidMax = isvalidMax && (xMax <= max);
		
		var validRange = {
				'min': isvalidMin,
				'max': isvalidMax
		}
		return validRange;
	
	}
	
	var validateGrade = function(grade){
		var type = 'Grade'
		var isValid = validateValue(type,grade);
		var isValidGrade = {
				isValid: isValid,
				errorList: []
		}
		if(!isValid) {
			isValidGrade.errorList.push(errorMessageList[type]);
		}
		
		return isValidGrade;
	}
	
	//number of beams
	function validateBeams(nBeams,maxBeams){
		var isValidBeams = {},
			type = 'nBeams';
		
		isValidBeams.isValid = true;
		
		isValidBeams.isValid = validateValue(type,nBeams);
		
		if(!isValidBeams.isValid) {
			isValidBeams.errorMessages = errorMessageList[type];
		}
		else{
			if(nBeams > maxBeams){
				isValidBeams.isValid = false;
				isValidBeams.errorMessages = errorMessageList[type];
			}
		}
		
		return isValidBeams;
	}
	
	//pythia beam
	function validatePythia(energy){
		var isValidEnergy= {
				isValidCM: true,
				isValidEA: true,
				isValidEB: true,
				errorMessages: []
		};
		
		var	type = 'Energy';
		
		if(energy.frame.option === 2){
			isValidEnergy.isValidEA = validateValue(type,energy.eA);
			isValidEnergy.isValidEB = validateValue(type,energy.eB);
		} 
		else {
			isValidEnergy.isValidCM = validateValue(type,energy.eCM) && energy.eCM >= 10;
		}
		
		if(!isValidEnergy.isValidEA || !isValidEnergy.isValidEB || !isValidEnergy.isValidCM){
			var errorMessages = errorMessageList['errorPythiaEnergy'];
			isValidEnergy.errorMessages.push(errorMessages);
		}
		
		return isValidEnergy; 
	}
	
	//parameterisation
	function validateParameterisation(parameters){
		var isValidParameterisation = {};
		
		for(var param in parameters){
			var isValidParameter = {};
			
			isValidParameter.isValid = validateValue(parameters[param].type,parameters[param].value);
			
			//if(param === 'Step')  isValidParameter.isValid = validateValue('step',parameters[param].value);
			//else if(param === 'Offset') isValidParameter.isValid = validateValue('position',parameters[param].value);
			//else if(param === 'Radius') isValidParameter.isValid = validateValue('length',parameters[param].value);
			//else isValidParameter.isValid = validateValue('ncopies',parameters[param].value);
						
			if(!isValidParameter.isValid){
				var errorMessages = errorMessageList[param];
				isValidParameter.errorMessages = errorMessages;
			}
			
			isValidParameterisation[param] = isValidParameter;
			
		}//for
		
		return isValidParameterisation;
	}
	
	//EM Fields
	function validateField(fieldType,field){
		var isValidField = {};
		if(typeof field == 'undefined'){
			isValidField = {
					'isValid': false,
					'errorMessages': errorMessageList[fieldType]
			}
		}
		else{
			for(var c in field){
				var isValid = validateValue(field[c].type,field[c].value),
				isValidComponent = {
					"isValid": isValid
				};
				if(!isValid) isValidComponent.errorMessages = errorMessageList[fieldType];
					 
				isValidField[c] = isValidComponent;
			}
		}	
		
		
		return isValidField;
	}
	
	return {
		'validateValue': validateValue,
		'validateName': validateName,
		'validateText': validateText,
		'validateDimensions': validateDimensions,
		'validateParameterisation': validateParameterisation,
		'validateField': validateField,
		'validateSource': validateSource,
		'validateVolume': validateVolume,
		'validateHistogram': validateHistogram,
		'validateBeams': validateBeams,
		'validateParamFilter': validateParamFilter,
		'validateRangeFit': validateRangeFit,
		'validateGrade': validateGrade,
		'validateLayerScorer': validateLayerScorer,
		'validatePythia': validatePythia
	}
	
});
