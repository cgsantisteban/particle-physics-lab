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
// $Id$
// Modifications: Alejandro Fernández. (guadalinfo.santistebandelpuerto@guadalindo.es)
//....oooOO0OOooo........oooOO0OOooo........oooOO0OOooo........oooOO0OOooo......
//....oooOO0OOooo........oooOO0OOooo........oooOO0OOooo........oooOO0OOooo......

#include "G4Run.hh"
#include "G4Event.hh"
#include "CounterStackingAction.hh"
#include "FileMessenger.hh"

#include "G4ParticleDefinition.hh"
#include "G4ParticleTypes.hh"
#include "G4Track.hh"
#include "GamosCore/GamosUserActionMgr/include/GmUserStackingAction.hh"
#include "GamosCore/GamosSD/include/GmHitsEventMgr.hh"
#include "GamosCore/GamosBase/Base/include/GmParameterMgr.hh"
#include "GamosCore/GamosBase/Base/include/GmAnalysisMgr.hh"

#include <iostream>
#include <string>
#include <sstream>
#include <algorithm>
#include <iterator>

using namespace std;

//....oooOO0OOooo........oooOO0OOooo........oooOO0OOooo........oooOO0OOooo......


CounterStackingAction::CounterStackingAction(): GmUserStackingAction(), GmUserRunAction(), GmUserEventAction()
{

    SetOutFile("outFile");
    SetParticle("noParticle");
    
    fileMessenger = new FileMessenger(this);
}

//....oooOO0OOooo........oooOO0OOooo........oooOO0OOooo........oooOO0OOooo......

CounterStackingAction::~CounterStackingAction()
{}

//....oooOO0OOooo........oooOO0OOooo........oooOO0OOooo........oooOO0OOooo......
void CounterStackingAction::BeginOfRunAction( const G4Run* aRun)
{

   SetOutFile(outFile);
   SetParticle(selectedParticle);
   SetNBin(nBinList);
   SetInitBin(initBinList);
   SetEndBin(endBinList);

   //G4cout<<"total event "<<aRun->GetNumberOfEventToBeProcessed()<<G4endl;
   G4String outFileCSV = outFile + ".csv";
	
	if (ifstream(outFileCSV.c_str()))
	{
	     cout << outFileCSV + " already exists." << endl;
	     if( remove( outFileCSV.c_str() ) != 0 ){
	    	 string error = "Error deleting " + outFileCSV;
	    	 perror(error.c_str());
	     }
	}
	
	mFile.open(outFileCSV.c_str(),ios::app);
   
	istringstream issParticles(selectedParticle);
	copy(istream_iterator<string>(issParticles),istream_iterator<string>(),back_inserter(particles));
	nParticles = particles.size();

	istringstream issNBin(nBinList);
	copy(istream_iterator<string>(issNBin),istream_iterator<string>(),back_inserter(nBins));
	G4int nBinSize = nBins.size();
	
	istringstream issInitBin(initBinList);
	copy(istream_iterator<string>(issInitBin),istream_iterator<string>(),back_inserter(initBins));
	G4int initBinSize = initBins.size();
	
	istringstream issEndBin(endBinList);
	copy(istream_iterator<string>(issEndBin),istream_iterator<string>(),back_inserter(endBins));
	G4int endBinSize = endBins.size();

    //Initial values
	if(nParticles>0 && nParticles == nBinSize && nParticles == initBinSize && nParticles == endBinSize){
	   hROOTList.reserve(nParticles);
	   nBins.reserve(nParticles);
	   initBins.reserve(nParticles);
	   endBins.reserve(nParticles);

	   for (G4int c=0; c<nParticles; c++) {
		   counter.push_back(0);
	   	   mFile<<particles[c];
	   	   if(c<nParticles-1) mFile<<",";
	   	   else mFile<<G4endl;
			
		   G4String title = particles[c];
		   G4int nBin = atoi(nBins[c].c_str());
		   G4int iBin = atoi(initBins[c].c_str());
		   G4int eBin = atoi(endBins[c].c_str());
		   
	       TH1F* histo = new TH1F(title.c_str(),title.c_str(),nBin,iBin,eBin);
   		   hROOTList.push_back(histo);

	   	}

   }
   else{
	G4Exception("StackCounter",
			  "Wrong number of parameters",
			  FatalErrorInArgument,
			  "The number of particles and the number of parameters of the histogram (nBin, init, endBin) must match");
   }


}

void CounterStackingAction::EndOfRunAction( const G4Run* )
{
	G4String outFileROOT = outFile + ".root";
	TFile rootFile(outFileROOT.c_str(),"RECREATE");
	for(G4int c = 0;c<nParticles;c++){
		hROOTList[c]->Write();
	}
	
    mFile.close();

}

void CounterStackingAction::BeginOfEventAction( const G4Event* )
{

}


G4ClassificationOfNewTrack CounterStackingAction::ClassifyNewTrack(const G4Track * aTrack)
{
	if(selectedParticle != "noParticle") {
		G4String particle = aTrack->GetDefinition()->GetParticleName();
		for(G4int np=0;np<nParticles;np++){
			if(particle == particles[np]){
				if(aTrack->GetParentID()>0){
					   // particle is secondary
						counter[np]++;
				}
			}

		}//for nParticles
   }

  return fUrgent;
}

//....oooOO0OOooo........oooOO0OOooo........oooOO0OOooo........oooOO0OOooo......

void CounterStackingAction::NewStage()
{
  if(nParticles>0){
  	
	  G4String line = "";
	  vector<G4bool> zero(nParticles);
	  for (G4int c=0; c<nParticles; c++) {

		if(counter[c] > 0 ) hROOTList[c]->Fill(counter[c]);
		else zero[c] = true;
		
		line +=to_string(counter[c]);
	  	
		if(c<nParticles-1) line+=",";

	  }

	 G4bool noZero = false;
	 for(G4int i=0;i<nParticles;i++) noZero = noZero || !zero[i];
	 if(noZero) { //delete line with zeros
		
		mFile<<line<<G4endl;
	 }
  }
}

//....oooOO0OOooo........oooOO0OOooo........oooOO0OOooo........oooOO0OOooo......

void CounterStackingAction::PrepareNewEvent()
{
	if(nParticles>0){
		for (G4int c=0; c<nParticles; c++) {
			counter[c] = 0;
		}
	}
}

void CounterStackingAction::SetOutFile(G4String file)
{
	outFile = file;
}

void CounterStackingAction::SetParticle(G4String particle)
{

  selectedParticle = particle;
}

void CounterStackingAction::SetNBin(G4String bins)
{

  nBinList = bins;
}

void CounterStackingAction::SetInitBin(G4String iBins)
{

  initBinList = iBins;
}

void CounterStackingAction::SetEndBin(G4String eBin)
{

  endBinList = eBin;
}


//....oooOO0OOooo........oooOO0OOooo........oooOO0OOooo........oooOO0OOooo......
