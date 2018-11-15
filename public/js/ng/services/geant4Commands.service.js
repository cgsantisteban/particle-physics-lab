"use strict";

lab.service('geantCommandsService', function($http,$q) {
	
    var commandList = [];
    var gamosList = [];
    var visList = [];
     
    var controlCommands = $http.get("dataJSON/geant4Commands/ControlCommands.json"),
		analysisCommands = $http.get("dataJSON/geant4Commands/AnalysisCommands.json"),
		unitCommands = $http.get("dataJSON/geant4Commands/UnitCommands.json"),
		processCommands = $http.get("dataJSON/geant4Commands/ProcessCommands.json"),
		particleCommands = $http.get("dataJSON/geant4Commands/ParticleCommands.json"),
		geometryCommands = $http.get("dataJSON/geant4Commands/GeometryCommands.json"),
		trackingCommands = $http.get("dataJSON/geant4Commands/TrackingCommands.json"),
		eventCommands = $http.get("dataJSON/geant4Commands/EventCommands.json"),
		cutsCommands = $http.get("dataJSON/geant4Commands/CutsCommands.json"),
		runCommands = $http.get("dataJSON/geant4Commands/RunCommands.json"),
		randomCommands = $http.get("dataJSON/geant4Commands/RandomCommands.json"),
		materialCommands = $http.get("dataJSON/geant4Commands/MaterialCommands.json"),
		hitsCommands = $http.get("dataJSON/geant4Commands/HitsCommands.json");
    
    //GAMOS
	var gamosCommands = $http.get("dataJSON/geant4Commands/GAMOS/GAMOSCommands.json"),
		gamosAnalysis = $http.get("dataJSON/geant4Commands/GAMOS/analysis.json"),
		gamosBase = $http.get("dataJSON/geant4Commands/GAMOS/base.json"),
		gamosClassifier = $http.get("dataJSON/geant4Commands/GAMOS/classifier.json"),
		gamosField = $http.get("dataJSON/geant4Commands/GAMOS/field.json"),
		gamosGeometry = $http.get("dataJSON/geant4Commands/GAMOS/geometry.json"),
		gamosGmPhysics = $http.get("dataJSON/geant4Commands/GAMOS/GmPhysics.json"),
		gamosGenerator = $http.get("dataJSON/geant4Commands/GAMOS/generator.json"),
		gamosLog = $http.get("dataJSON/geant4Commands/GAMOS/log.json"),
		gamosPhysics = $http.get("dataJSON/geant4Commands/GAMOS/physics.json"),
		gamosRandom = $http.get("dataJSON/geant4Commands/GAMOS/random.json"),
		gamosSD = $http.get("dataJSON/geant4Commands/GAMOS/SD.json"),
		gamosScoring = $http.get("dataJSON/geant4Commands/GAMOS/scoring.json"),
		gamosUserAction = $http.get("dataJSON/geant4Commands/GAMOS/userAction.json");
		
	//Vis
	var visCommands = $http.get("dataJSON/geant4Commands/Vis/VisCommands.json"),
		asciitreeCommands = $http.get("dataJSON/geant4Commands/Vis/ASCIITreeCommands.json"),
		filteringCommands = $http.get("dataJSON/geant4Commands/Vis/FilteringCommands.json"),
		geometryCommands = $http.get("dataJSON/geant4Commands/Vis/GeometryCommands.json"),
		gMocrenCommands = $http.get("dataJSON/geant4Commands/Vis/gMocrenCommands.json"),
		heprepCommands = $http.get("dataJSON/geant4Commands/Vis/HepRepCommands.json"),
		modelingCommands = $http.get("dataJSON/geant4Commands/Vis/ModelingCommands.json"),
		oglCommands = $http.get("dataJSON/geant4Commands/Vis/OGLCommands.json"),
		raytracerCommands = $http.get("dataJSON/geant4Commands/Vis/RayTracerCommands.json"),
		sceneCommands = $http.get("dataJSON/geant4Commands/Vis/SceneCommands.json"),
		scenehandlerCommands = $http.get("dataJSON/geant4Commands/Vis/SceneHandlerCommands.json"),
		setCommands = $http.get("dataJSON/geant4Commands/Vis/SetCommands.json"),
		touchableCommands = $http.get("dataJSON/geant4Commands/Vis/TouchableCommands.json"),
		viewerCommands = $http.get("dataJSON/geant4Commands/Vis/ViewerCommands.json");
	
	
	var promise = $q.all([controlCommands, analysisCommands, unitCommands, processCommands, 
				gamosCommands, gamosAnalysis,gamosBase,	gamosClassifier, gamosField,
				gamosGeometry, gamosGmPhysics, gamosGenerator, gamosLog, gamosPhysics,
				gamosRandom, gamosSD,gamosScoring,gamosUserAction,
				particleCommands, geometryCommands, trackingCommands, eventCommands,
				cutsCommands, runCommands, randomCommands,
				visCommands,asciitreeCommands,filteringCommands,
				geometryCommands,gMocrenCommands,heprepCommands,modelingCommands,
				oglCommands,raytracerCommands,sceneCommands,scenehandlerCommands,
				setCommands,touchableCommands,viewerCommands,
				materialCommands, hitsCommands]).then(function(data) {
		
					
		//GAMOS
		gamosList = data[4].data;
		gamosList.children = gamosList.children.concat(data[5].data,data[6].data,data[7].data,
							  data[8].data, data[9].data, data[10].data,data[11].data,
							  data[12].data,data[13].data,data[14].data,data[15].data,
							  data[16].data,data[17].data);
		
		//Vis
		visList = data[25].data;
		visList.children = visList.children.concat(data[26].data,data[27].data,data[28].data,data[29].data,
					data[30].data,data[31].data,data[32].data,data[33].data,data[34].data,
					data[35].data,data[36].data,data[37].data,data[38].data);
		
		
		commandList = commandList.concat(data[0].data,data[1].data, data[2].data,data[3].data, 
							gamosList, 
							data[18].data, data[19].data, data[20].data, data[21].data, 
							data[22].data, data[23].data, data[24].data,
							visList,
							data[39].data, data[40].data);
		
	});
  
    return {
      promise: promise,
      getCommandList: function () {
          return commandList;
      }
    };
});
