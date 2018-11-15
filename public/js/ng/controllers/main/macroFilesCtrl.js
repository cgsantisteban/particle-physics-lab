"use strict"

lab.controller('MacroFilesCtrl', function ($rootScope,$scope, $uibModalInstance, buildMacro, buildGeom) {
	
	$scope.macroFile = buildMacro.buildMacroFile($rootScope.experiment);
	$scope.geomFile = buildGeom.buildGeomCommands($rootScope.experiment.geometry.volumeList);
	
	$scope.datosPrueba = "uno\n dos";
	
	$scope.editorOptions = {
			lineWrapping : true,
			lineNumbers: true,
			readOnly: 'nocursor',
			mode: 'xml',
		};
	
	$scope.okFiles = function () {
		
		$uibModalInstance.close();
	};
	
});
