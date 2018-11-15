"use strict"

lab.controller('VolumeCtrl',function($rootScope,$scope, initGeomService, modelSolidService,  validate, utilities, volumeId, $uibModalInstance){

	let initGeomData = initGeomService.getInitGeom();
	let parameterisationList = angular.copy(initGeomData.parameterisation);
	$scope.magneticField = angular.copy(initGeomData.magneticField);
	$scope.materials = angular.copy(modelSolidService.getMaterialList());
		
	//solids
	$scope.solidList = angular.copy(modelSolidService.getModelSolid());
	$scope.solidTypeList = _.map($scope.solidList,'solidType');
	$scope.materialTypeList  = _.map($scope.materials, 'materialType');
	
	let world = _.find($rootScope.experiment.geometry.volumeList,(v)=>{
		return v.isWorld;
	});
	
	if(volumeId<0) { //new volume
		$scope.windowTitle = 'New volume';
		$scope.paramTypeList = [];
		let solid = $scope.solidTypeList[0],
			materialType = $scope.materials[0].materialType,
			material = $scope.materials[0].materialList[0];
			
		let position = angular.copy(initGeomData.posrot.position),
			rotation = angular.copy(initGeomData.posrot.rotation);
		
		$scope.volume = {
				'name': utilities.generateName($scope.experiment.geometry.volumeList,'volume'),
				'solid': $scope.solidList[0],
				'materialType': materialType,
				'material': material,
				'color': '#ff0000',
				'isWorld': false,
				'isParam': false,
				'position': position,
				'rotation': rotation,
				'opacity': 1
		}
		
		if(typeof world != 'undefined'){ //se pone por defecto el parente volume como labworld
			$scope.volume.parentVolume = world.name;
		}
	}
	else{ //edit volume
		$scope.windowTitle = 'Edit volume';
		$scope.volume = angular.copy($scope.experiment.geometry.volumeList[volumeId]);
		if($scope.volume.isParam) {
			$scope.paramTypeList = getParametersitation($scope.volume.solid.solidType);
		}
	}
	
	$scope.setMaterial = function(materialType,materials){
		let pos = _.findKey($scope.materials, { 'materialType': materialType});
		$scope.volume.material = materials[pos].materialList[0];
	}
	
	$scope.getMaterial = function(materialType,materials){
		let pos = _.findKey($scope.materials, { 'materialType': materialType});
		return materials[pos].materialList;
	}
	
  	
	
	$scope.parentList = getParentList($scope.volume,$rootScope.experiment.geometry.volumeList);
	
	function initParam(v){
		
		if(v.isParam){
			$scope.paramTypeList =  getParametersitation(v.solid.solidType);
			v.parentVolume = $scope.parentList[0];
			
			let isInParam = {
  					isValid: true
  			}
  			$rootScope.isIn[v.name] = isInParam;
  			v.parameterisation = getParametersitation(v.solid.solidType)[0];

  		}
  		else{
  			v.parentVolume = world.name;
  			delete $rootScope.isIn[v.name];
  			delete v.parameterisation;
  		}
  	
  	}
	
	
	$scope.setIsParam = function(v){
		initParam(v);
	}
	
	function getParametersitation(solidType){
		let parameterisation = angular.copy(initGeomData.parameterisation);
		if(solidType !== 'BOX')
			parameterisation = _.filter(parameterisation, function(p) { 
				return (p.type !== 'PHANTOM'); 
			});
		
		return parameterisation;
	}
	
	$scope.setParentList = function(volume,volumeList){
		$scope.parentList = getParentList(volume,volumeList);
	}
	
	function getParentList(volume,volumeList){
		
		let initialParentList = [];
		for(let i=0;i<volumeList.length;i++){
			let v = volumeList[i];
			if(volume.name !== v.name){
				if(!v.isWorld && !v.isParam){
					initialParentList.push(v.name);
				}
			}
		}
		
		let selectedParentList = [];
		for(let i=0;i<volumeList.length;i++){
			if(volumeList[i].name != volume.name){
				if(volumeList[i].isParam){
					selectedParentList.push(volumeList[i].parentVolume);	
				}
			}
			
		}
		let parentList = _.difference(initialParentList, selectedParentList);
	
		return parentList;
	}
	
  	// end  parameterisation
	
	//validations ---------
  	$scope.isValidDimensions = validate.validateDimensions($scope.volume);
	$scope.$watch('volume',function(newVolume,oldVolume){
		
		
		$scope.isValidAll = true;
		$scope.isValidName = validate.validateName($scope.experiment.geometry.volumeList, 
				newVolume.name,volumeId, $rootScope.maxLength);
		$scope.isValidDimensions = validate.validateDimensions(newVolume);
		for(let d in $scope.isValidDimensions.dimensions){
			$scope.isValidAll = $scope.isValidAll && $scope.isValidDimensions.dimensions[d] && $scope.isValidName.isValid;
		}
		
		if(newVolume.isParam){
			$scope.isValidParam = validate.validateParameterisation(newVolume.parameterisation.parameters);
			for(let p in $scope.isValidParam){
				$scope.isValidAll = $scope.isValidAll && $scope.isValidParam[p].isValid;
			}
		}
		
		
	},true);
	//end validations -----------
	
	$scope.addVolume = function() {
		
		if($scope.volume.isParam){
			if($scope.volume.parameterisation.type === 'PHANTOM' && $scope.volume.solid.solidType !== 'BOX'){
				$scope.volume.isParam = false;
				delete $scope.volume.parameterisation;
			} 
		}
		
		if($scope.volume.isWorld){ //update parentVolume
			for(let i=0;i<$rootScope.experiment.geometry.volumeList.length;i++){
				if(!$rootScope.experiment.geometry.volumeList[i].isWorld){
					$rootScope.experiment.geometry.volumeList[i].parentVolume = $scope.volume.name;
				}
			}
		}
		
	    $uibModalInstance.close($scope.volume);
	};
	
	$scope.cancel = function(){
		$uibModalInstance.dismiss('cancel');
	};
});
