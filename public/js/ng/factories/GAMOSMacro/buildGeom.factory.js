"use strict"; 

lab.factory('buildGeom',function(){
	
	var buildGeomCommands = function(geomJSON){
		
		var commandList = [];
		var command;
		var scinList = [];
		
		var worldVolume = _.find(geomJSON,function(v){
			return v.isWorld;
		});
		
		if(typeof worldVolume != 'undefined'){
			var material = worldVolume.material.gamosName;
			var dim = makeDimensions(worldVolume.solid.solidType,worldVolume.solid.dimensions);
			command = ':VOLU ' + worldVolume.name + ' ' + worldVolume.solid.solidType +  ' ' + dim + ' ' + material;
			var volumeTitle = '// '+  worldVolume.name;
			commandList.push(volumeTitle);
			commandList.push(command);
			
			for(var i=0;i<geomJSON.length;i++){
				var volume = geomJSON[i];
				
				if(volume.materialType === 'scintillator'){
					if(scinList.indexOf(volume.material.name)<0) {
						scinList.push(volume.material.name);
						var scinString = buildScintillator(volume.material);
						commandList = commandList.concat(scinString);
					}
				}
				
				if(!volume.isWorld){
					
					var material = volume.material.gamosName;
					
					//:VOLU target_container BOX 150 150 8 G4_Pb
					var dim = makeDimensions(volume.solid.solidType, volume.solid.dimensions);
					command = ':VOLU '+volume.name+' '+ volume.solid.solidType + ' ' + dim + ' ' + material;
					volumeTitle = '// '+ volume.name;
					commandList.push(volumeTitle);
					commandList.push(command);
					
					//:ROTM RM0 0 0 0 		
					var Rx = volume.rotation['Rx'].value,
						Ry = volume.rotation['Ry'].value,
						Rz = volume.rotation['Rz'].value,
						uRx = volume.rotation['Rx'].units,
						uRy = volume.rotation['Ry'].units,
						uRz = volume.rotation['Rz'].units;
						
					var rot = ':ROTM '+'R_' + volume.name + ' '+ Rx + '*' + uRx  + ' ' + Ry + '*' + uRy + ' ' + Rz + '*' + uRz;
					commandList.push(rot);
		
					var x = volume.position["X"].value,
						y = volume.position["Y"].value,
						z = volume.position["Z"].value,
						uX = volume.position["X"].units,
						uY = volume.position["Y"].units,
						uZ = volume.position["Z"].units;
					   
					var position =  x + '*' + uX + ' ' + y + '*' + uY + ' ' + z + '*' + uZ;  
							
					//:PLACE target_container 1 world RM0 0. 0. 0.
					if(!volume.isParam || volume.parameterisation.type === 'PHANTOM'){
						var pos = ':PLACE ' + volume.name + ' 1 ' + volume.parentVolume + ' R_' + volume.name + ' ' + position; //se debe introducir parente volume en vez de worldVolume
						commandList.push(pos);
					}
					
					//hexadecimal color to RGB
					var color = volume.color,
						redString = color[1]+color[2],
						greenString = color[3]+color[4],
						blueString = color[5]+color[6],
						hexa = '0x',
						red = parseInt(hexa+redString),
						green = parseInt(hexa+greenString),
						blue = parseInt(hexa+blueString),
						redRGB = (red / 255).toFixed(2),
						greenRGB = (green / 255).toFixed(2),
						blueRGB = (blue / 255).toFixed(2),
						colour = [redRGB,greenRGB,blueRGB];
					
					//:COLOUR crystal 0 0 1 0.4
					var col = ':COLOUR ' + volume.name + ' ';
					for(var c=0;c<colour.length;c++){
						col += colour[c] + ' ';
					}
					col += ' ' + volume.opacity;
					commandList.push(col);
					
					//Parameterisation
					if(volume.isParam){
						var paramType = volume.parameterisation.type;
						var isLinearParam = (paramType === 'LINEAR_X' || paramType === 'LINEAR_Y' || paramType === 'LINEAR_Z'),
							isCircleParam = (paramType === 'CIRCLE_XY' || paramType === 'CIRCLE_XZ' || paramType === 'CIRCLE_YZ'),
							isPhantomParam = (paramType === 'PHANTOM')
							
						if(isPhantomParam){
							//:PLACE_PARAM cell 1 target_container PHANTOM 1 1 1 300. 300. 16.
							var ncopiesX = volume.parameterisation.parameters["N copies X"].value,
								ncopiesY = volume.parameterisation.parameters["N copies Y"].value,
								ncopiesZ = volume.parameterisation.parameters["N copies Z"].value,
								lengthX = volume.solid.dimensions["Length X"].value,
								lengthY = volume.solid.dimensions["Length Y"].value,
								lengthZ = volume.solid.dimensions["Length Z"].value;
								
							if(typeof ncopiesX == 'undefined' || ncopiesX === null || ncopiesX === 0 ) ncopiesX = 1;
							if(typeof ncopiesY == 'undefined' || ncopiesY === null || ncopiesY === 0) ncopiesY = 1;
							if(typeof ncopiesZ == 'undefined' || ncopiesZ === null || ncopiesZ === 0) ncopiesZ = 1;
							
							var stepX = (lengthX)/ncopiesX,
								stepY = (lengthY)/ncopiesY,
								stepZ = (lengthZ)/ncopiesZ,
								lengthCellX = lengthX/(2*ncopiesX),
								lengthCellY = lengthY/(2*ncopiesY),
								lengthCellZ = lengthZ/(2*ncopiesZ),
								uX = volume.solid.dimensions["Length X"].units,
								uY = volume.solid.dimensions["Length Y"].units,
								uZ = volume.solid.dimensions["Length Z"].units;
							
							var cell = 'cell-'+volume.name;
							var dimCell = lengthCellX + '*' + uX + ' ' + lengthCellY + '*' + uY + ' ' + lengthCellZ + '*' + uZ;
							command = ':VOLU '+ cell+' '+ volume.solid.solidType + ' ' + dimCell + ' '+ material;
							commandList.push(command)
							
							command = ':PLACE_PARAM '+cell+' 1 '+volume.name+' '+paramType+' '+
								      ncopiesX+' '+ncopiesY+' '+ncopiesZ+' '+
								      stepX + '*' + uX +' ' + stepY + '*' + uY + ' ' + stepZ + '*' + uZ;
						}
						else{
							
							var nCopies = volume.parameterisation.parameters["N copies"].value,
								step = volume.parameterisation.parameters["Step"].value,
								offset = volume.parameterisation.parameters["Offset"].value,
								uStep = volume.parameterisation.parameters["Step"].units,
								uOffset = volume.parameterisation.parameters["Offset"].units;
							
							if(isLinearParam){
								command = ':PLACE_PARAM ' + volume.name+' 1 ' + volume.parentVolume + ' ' + paramType + ' '+
													'R_' + volume.name + ' ' + nCopies + ' ' + step + '*' + uStep + ' ' + offset + '*' + uOffset;
							}
							
							if(isCircleParam){
								var uRadius = volume.parameterisation.parameters["Radius"].units;
								var radius = volume.parameterisation.parameters["Radius"].value;
								command = ':PLACE_PARAM ' + volume.name + ' 1 ' + volume.parentVolume + ' ' + paramType + ' ' +
											'R_' + volume.name + ' '+ nCopies + ' ' + step + '*' + uStep + ' ' + offset + '*' + uOffset + ' ' + radius + '*' + uRadius;
							}
						}
						
						commandList.push(command);
					}
					
				}
			}//for geomJSON
			
		}
		else{
			console.log('World is undefined');
		}
		
		function buildScintillator(material){
			var commandScin = [];
			
			commandScin.push('// Scintillator material definition');
			// :MIXT NaI 3.67 2
			//  G4_Na 0.15337
			//  G4_I  0.84663
			var nComponents = material.properties.components.length;
			var commandMIXT = ':MIXT '+ material.gamosName + ' ' + material.properties.density.value + ' ' + nComponents;
			commandScin.push(commandMIXT);
			
			material.properties.components.forEach(function(c) {
			    var cString = c.gamosName + ' ' + c.proportion;
			    commandScin.push(cString);
			});
			
			//:MATE_PROPERTIES_TABLE PropertiesNaI
			var propertiesTable = 'Properties_' + material.gamosName;
			var commandMATE = ':MATE_PROPERTIES_TABLE' + ' ' + propertiesTable;
			commandScin.push(commandMATE);
			
			//:MATEPT_ADD_CONST_PROPERTY 	PropertiesNaI SCINTILLATIONYIELD 3800./MeV
			if(typeof material.properties.scintillationYield != 'undefined'){
				var commandSY = ':MATEPT_ADD_CONST_PROPERTY' + ' ' + propertiesTable + ' ' + 'SCINTILLATIONYIELD' + ' ' +
										material.properties.scintillationYield.value + material.properties.scintillationYield.units;
				commandScin.push(commandSY);
			}
			
			
			//:MATEPT_ADD_CONST_PROPERTY PropertiesNaI RESOLUTIONSCALE 1.0
			if(typeof material.properties.resolutionScale != 'undefined'){
				var commandRS = ':MATEPT_ADD_CONST_PROPERTY'+ ' '+ propertiesTable + ' ' + 
											'RESOLUTIONSCALE'+ ' ' + material.properties.resolutionScale.value;
				commandScin.push(commandRS);
			}
			
			//:MATEPT_ADD_CONST_PROPERTY PropertiesNaI FASTTIMECONSTANT 1.*ns
			if(typeof material.properties.fastTimeConstant != 'undefined'){
				var commandFTC = ':MATEPT_ADD_CONST_PROPERTY' + ' ' + propertiesTable + ' ' + 
											'FASTTIMECONSTANT' + ' ' + material.properties.fastTimeConstant.value + '*' + material.properties.fastTimeConstant.units;
				commandScin.push(commandFTC);
			}
			
			//:MATEPT_ADD_CONST_PROPERTY PropertiesNaI SLOWTIMECONSTANT 10.*ns
			if(typeof material.properties.slowTimeConstant != 'undefined'){
				var commandSLC = ':MATEPT_ADD_CONST_PROPERTY' + ' ' + propertiesTable + ' ' + 
							 'SLOWTIMECONSTANT' + ' ' + material.properties.slowTimeConstant.value + '*' + material.properties.slowTimeConstant.units;
				commandScin.push(commandSLC);
			}
			
			//:MATEPT_ADD_CONST_PROPERTY PropertiesNaI YIELDRATIO 0.9
			if(typeof material.properties.yieldRatio != 'undefined'){
				var commandYR = ':MATEPT_ADD_CONST_PROPERTY' + ' ' + propertiesTable + ' '+ 
							'YIELDRATIO' + ' ' + material.properties.yieldRatio.value;
				commandScin.push(commandYR);
			}
			
			//:MATEPT_ADD_CONST_PROPERTY PropertiesNaI-Tl FASTSCINTILLATIONRISETIME 30.*ps
			if(typeof material.properties.fastScintillationRiseTime != 'undefined'){
				var commandFSR = ':MATEPT_ADD_CONST_PROPERTY' + ' ' + propertiesTable + ' '+ 
							'FASTSCINTILLATIONRISETIME' + ' ' + material.properties.fastScintillationRiseTime.value + 
							'*' + material.properties.fastScintillationRiseTime.units;
				commandScin.push(commandFSR);
			}
			
			//:MATEPT_ADD_CONST_PROPERTY PropertiesNaI-Tl SLOWSCINTILLATIONRISETIME 3000.*ps
			if(typeof material.properties.slowScintillationRiseTime != 'undefined'){
				var commandSSR = ':MATEPT_ADD_CONST_PROPERTY' + ' ' + propertiesTable + ' '+ 
							'SLOWSCINTILLATIONRISETIME' + ' ' + material.properties.slowScintillationRiseTime.value + 
							'*' + material.properties.slowScintillationRiseTime.units;
				commandScin.push(commandSSR);
			}
			
			//:MATEPT_ADD_ENERGIES PropertiesNaI 2.034*eV 2.068*eV 2.103*eV ...
			var commandE = ':MATEPT_ADD_ENERGIES' + ' ' + propertiesTable;
			var uE = material.properties.energies.units;
			material.properties.energies.value.forEach(function(e){
				commandE += ' ' + e + '*' + uE; 
			});
			commandScin.push(commandE);
			
			//:MATEPT_ADD_PROPERTY PropertiesNaI RINDEX 1.766488159 1.7679973633 1.769572262 ...
			if(typeof material.properties.rIndex != 'undefined'){
				var commandRI = ':MATEPT_ADD_PROPERTY' + ' ' + propertiesTable + ' ' + 'RINDEX';
				material.properties.rIndex.value.forEach(function(ri){
					commandRI += ' ' + ri; 
				});
				commandScin.push(commandRI);
			}
					
			//:MATEPT_ADD_PROPERTY PropertiesNaI ABSLENGTH 3.448*m 4.082*m 6.329*m ...
			if(typeof material.properties.absLength != 'undefined'){
				var commandABS = ':MATEPT_ADD_PROPERTY' + ' '+ propertiesTable + ' ' + 'ABSLENGTH';
				var uABS = material.properties.absLength.units; 
				material.properties.absLength.value.forEach(function(a){
					commandABS += ' ' + a + '*' + uABS; 
				});
				commandScin.push(commandABS);
			}
					
			//:MATEPT_ADD_PROPERTY PropertiesNaI FASTCOMPONENT 0.000134	0.004432 0.053991 ...
			if(typeof material.properties.fastComponent != 'undefined'){
				var commandFC = ':MATEPT_ADD_PROPERTY' + ' '+ propertiesTable + ' ' + 'FASTCOMPONENT';
				var uFast = material.properties.fastComponent.units;
				material.properties.fastComponent.value.forEach(function(f){
					commandFC += ' ' + f + '*'+uFast; 
				});
				commandScin.push(commandFC);
			}
					
			//:MATEPT_ADD_PROPERTY PropertiesNaI SLOWCOMPONENT 0.000010	0.000020 0.000030		
			if(typeof material.properties.slowComponent != 'undefined'){
				var commandSC = ':MATEPT_ADD_PROPERTY' + ' '+ propertiesTable + ' ' + 'SLOWCOMPONENT';
				var uSlow = material.properties.slowComponent.units;
				material.properties.slowComponent.value.forEach(function(s){
					commandSC += ' ' + s + '*' + uSlow; 
				});
				commandScin.push(commandSC);
			}
			
			//:MATEPT_ADD_PROPERTY PropertiesNaI Birks Component 
			//	var commandBirk = ':MATEPT_ADD_PROPERTY' + ' '+ propertiesTable + ' ' + 'BIRKSCONSTANT' + ' ' + '0.126*mm/MeV';
			//	commandScin.push(commandBirk);
			
			//:MATEPT_ATTACH_TO_MATERIAL PropertiesNaI NaI
			var attachString = ':MATEPT_ATTACH_TO_MATERIAL' + ' '+ propertiesTable + ' ' + material.gamosName;
			commandScin.push(attachString);
			
			commandScin.push('// end scintillator definition');
			
			return commandScin;
		}
		
		
		
		function makeDimensions(solidType, dimensions){
			var dim;
			
			if(solidType === 'TUBE'){
				var innerRadius = dimensions['Inner radius'].value,
					outerRadius = dimensions['Outer radius'].value,
					length = dimensions['Length'].value,
					uInnerRadius = dimensions['Inner radius'].units,
					uOuterRadius = dimensions['Outer radius'].units,
					uLength = dimensions['Length'].units;
				
				dim = innerRadius+'*' + uInnerRadius + ' ' + outerRadius+'*' + uOuterRadius + ' ' +
					  length/2+'*' + uLength;
			}
			else if(solidType === 'TUBS'){
				var innerRadius = dimensions['Inner radius'].value,
					outerRadius = dimensions['Outer radius'].value,
					length = dimensions['Length'].value,
					startPhi = dimensions['Starting phi'].value,
					deltaPhi = dimensions['Delta phi'].value,
					uInnerRadius = dimensions['Inner radius'].units,
					uOuterRadius = dimensions['Outer radius'].units,
					uLength = dimensions['Length'].units,
					uStartPhi = dimensions['Starting phi'].units,
					uDeltaPhi = dimensions['Delta phi'].units;
				
				dim = innerRadius+'*' + uInnerRadius + ' ' + outerRadius+'*' + uOuterRadius + ' ' +
					  length/2+'*' + uLength + ' ' + startPhi + '*' + uStartPhi + ' ' + 
					  deltaPhi + '*'  + uDeltaPhi;
			}
			else if(solidType === 'CONS'){
				
				var innerRadiusDown = dimensions['Inner radius down'].value,
					innerRadiusUp = dimensions['Inner radius up'].value,
					outerRadiusDown = dimensions['Outer radius down'].value,
					outerRadiusUp = dimensions['Outer radius up'].value,
					length = dimensions['Length'].value,
					startPhi = dimensions['Starting phi'].value,
					deltaPhi = dimensions['Delta phi'].value,
					uInnerRadiusDown = dimensions['Inner radius down'].units,
					uIinnerRadiusUp = dimensions['Inner radius up'].units,
					uOuterRadiusDown = dimensions['Outer radius down'].units,
					uOuterRadiusUp = dimensions['Outer radius up'].units,
					uLength = dimensions['Length'].units,
					uStartPhi = dimensions['Starting phi'].units,
					uDeltaPhi = dimensions['Delta phi'].units,
				
				dim = innerRadiusDown+'*' + uInnerRadiusDown + ' ' + innerRadiusUp+'*' + uIinnerRadiusUp + ' ' +
					  outerRadiusDown+'*' + uOuterRadiusDown + ' ' + outerRadiusUp+'*' + uOuterRadiusUp + ' ' +
					  length/2+'*' + uLength + ' ' + startPhi + '*' + uStartPhi + ' ' + deltaPhi + '*' + uDeltaPhi;
			}
			else if(solidType === 'SPHERE'){
				
				var innerRadius = dimensions['Inner radius'].value,
					outerRadius = dimensions['Outer radius'].value,
					startPhi = dimensions['Starting phi'].value,
					deltaPhi = dimensions['Delta phi'].value,
					startTheta = dimensions['Starting theta'].value,
					deltaTheta = dimensions['Delta theta'].value,
					uIinnerRadius = dimensions['Inner radius'].units,
					uOuterRadius = dimensions['Outer radius'].units,
					uStartPhi = dimensions['Starting phi'].units,
					uDeltaPhi = dimensions['Delta phi'].units,
					uStartTheta = dimensions['Starting theta'].units,
					uDeltaTheta = dimensions['Delta theta'].units;
				
				dim = innerRadius + '*' + uIinnerRadius + ' ' + outerRadius+'*' + uOuterRadius + ' ' + 
					  startPhi + '*' + uStartPhi + ' ' + deltaPhi + '*' + uDeltaPhi + ' ' +
					  startTheta + '*' + uStartTheta + ' ' + deltaTheta + '*' + uDeltaTheta;
			}
			else if(solidType === 'BOX'){
				var lengthX = dimensions['Length X'].value,
					lengthY = dimensions['Length Y'].value,
					lengthZ = dimensions['Length Z'].value,
					uLengthX = dimensions['Length X'].units,
					uLengthY = dimensions['Length Y'].units,
					uLengthZ = dimensions['Length Z'].units;
				dim = lengthX/2+'*' + uLengthX + ' ' + lengthY/2 + '*' + uLengthY + ' ' + lengthZ/2 + '*' + uLengthZ;
			}
			else{
				dim = null;
			}
			
			return dim;
		}
		
		return commandList;

	}
	
	return {
		'buildGeomCommands': buildGeomCommands
	}
	
});
