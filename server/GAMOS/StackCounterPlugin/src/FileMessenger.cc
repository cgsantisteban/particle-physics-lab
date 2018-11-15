//
// ********************************************************************
// * License and Disclaimer                                           *
// *                                                                  *
// * The  Geant4 software  is  copyright of the Copyright Holders  of *
// * the Geant4 Collaboration.  It is provided  under  the terms  and *
// * conditions of the Geant4 Software License,  included in the file *
// * LICENSE and available at  http://cern.ch/geant4/license .  These *
// * include a list of copyright holders.                             *
// *                                                                  *
// * Neither the authors of this software system, nor their employing *
// * institutes,nor the agencies providing financial support for this *
// * work  make  any representation or  warranty, express or implied, *
// * regarding  this  software system or assume any liability for its *
// * use.  Please see the license in the file  LICENSE  and URL above *
// * for the full disclaimer and the limitation of liability.         *
// *                                                                  *
// * This  code  implementation is the result of  the  scientific and *
// * technical work of the GEANT4 collaboration.                      *
// * By using,  copying,  modifying or  distributing the software (or *
// * any work based  on the software)  you  agree  to acknowledge its *
// * use  in  resulting  scientific  publications,  and indicate your *
// * acceptance of all terms of the Geant4 Software license.          *
// ********************************************************************
//
//
// $Id$
//
// Modifications: Alejandro Fernández. (guadalinfo.santistebandelpuerto@guadalindo.es)

//....oooOO0OOooo........oooOO0OOooo........oooOO0OOooo........oooOO0OOooo......
//....oooOO0OOooo........oooOO0OOooo........oooOO0OOooo........oooOO0OOooo......

#include "FileMessenger.hh"
#include "CounterStackingAction.hh"

#include "G4UIdirectory.hh"
#include "G4UIcmdWithAString.hh"
#include "G4UIcmdWithAnInteger.hh"
#include "G4UIcmdWithADoubleAndUnit.hh"
#include "G4UIcmdWithoutParameter.hh"

//....oooOO0OOooo........oooOO0OOooo........oooOO0OOooo........oooOO0OOooo......

FileMessenger::FileMessenger(CounterStackingAction* Stack)
:StackAction(Stack)
{ 
  GCDir = new G4UIdirectory("/GC/");
  GCDir->SetGuidance("UI commands of this example");
  
  fileDir = new G4UIdirectory("/GC/file/");
  fileDir->SetGuidance("file result");

  particleDir = new G4UIdirectory("/GC/particle/");
  particleDir->SetGuidance("select particle");

  histogramDir = new G4UIdirectory("/GC/histogram/");
  histogramDir->SetGuidance("histogram paremeters");


  fileCmd = new G4UIcmdWithAString("/GC/file/setOutFile",this);
  fileCmd->SetGuidance("Out file select.");
  fileCmd->SetParameterName("outFile",false);
  fileCmd->AvailableForStates(G4State_PreInit,G4State_Idle);

  particleCmd = new G4UIcmdWithAString("/GC/particle/setParticle",this);
  particleCmd->SetGuidance("selected particle");
  particleCmd->SetParameterName("selectedParticle",false);
  particleCmd->AvailableForStates(G4State_PreInit,G4State_Idle);
  
  nBinCmd = new G4UIcmdWithAString("/GC/histogram/setNBin",this);
  nBinCmd->SetGuidance("number channels");
  nBinCmd->SetParameterName("nBin",false);
  nBinCmd->AvailableForStates(G4State_PreInit,G4State_Idle);

  initBinCmd = new G4UIcmdWithAString("/GC/histogram/setInitBin",this);
  initBinCmd->SetGuidance("Initial bin");
  initBinCmd->SetParameterName("initBin",false);
  initBinCmd->AvailableForStates(G4State_PreInit,G4State_Idle);

  endBinCmd = new G4UIcmdWithAString("/GC/histogram/setEndBin",this);
  endBinCmd->SetGuidance("End bin");
  endBinCmd->SetParameterName("endBin",false);
  endBinCmd->AvailableForStates(G4State_PreInit,G4State_Idle);
  
}

//....oooOO0OOooo........oooOO0OOooo........oooOO0OOooo........oooOO0OOooo......

FileMessenger::~FileMessenger()
{
  delete nBinCmd;
  delete initBinCmd;
  delete endBinCmd;
  delete particleCmd;
  delete particleDir;
  delete fileCmd;
  delete fileDir;
  delete GCDir;  
}

//....oooOO0OOooo........oooOO0OOooo........oooOO0OOooo........oooOO0OOooo......

void FileMessenger::SetNewValue(G4UIcommand* command,G4String newValue)
{ 
  if( command == fileCmd )
   { StackAction->SetOutFile(newValue);}
   
  if( command == particleCmd )
   {
	  StackAction->SetParticle(newValue);
   }

  if( command == nBinCmd )
     {

	  StackAction->SetNBin(newValue);

     }

  if( command == initBinCmd )
    {
  	  StackAction->SetInitBin(newValue);

    }


  if( command == endBinCmd )
    {
  	  StackAction->SetEndBin(newValue);

    }

}

//....oooOO0OOooo........oooOO0OOooo........oooOO0OOooo........oooOO0OOooo......
