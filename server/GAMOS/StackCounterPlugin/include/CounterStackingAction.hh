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
//
//....oooOO0OOooo........oooOO0OOooo........oooOO0OOooo........oooOO0OOooo......
//....oooOO0OOooo........oooOO0OOooo........oooOO0OOooo........oooOO0OOooo......

#ifndef CounterStackingAction_H
#define CounterStackingAction_H 1

#include "globals.hh"
#include "G4UserStackingAction.hh"
#include "FileMessenger.hh"
#include "GamosCore/GamosUserActionMgr/include/GmUserStackingAction.hh"
#include "GamosCore/GamosUserActionMgr/include/GmUserRunAction.hh"
#include "GamosCore/GamosUserActionMgr/include/GmUserEventAction.hh"
#include "GamosCore/GamosBase/Base/include/GmAnalysisMgr.hh"

#include <vector>
#include <string>

using namespace std;
//....oooOO0OOooo........oooOO0OOooo........oooOO0OOooo........oooOO0OOooo......

class CounterStackingAction : public GmUserStackingAction, public GmUserRunAction, public GmUserEventAction
{
  public:
    CounterStackingAction();
   ~CounterStackingAction();

  public:
    G4ClassificationOfNewTrack ClassifyNewTrack(const G4Track* aTrack);
    virtual void BeginOfRunAction( const G4Run* );
    virtual void EndOfRunAction(const G4Run*);
    virtual void BeginOfEventAction( const G4Event* );
    void NewStage();
    void PrepareNewEvent();
    void SetOutFile(G4String);
    void SetParticle(G4String);
    void SetNBin(G4String);
    void SetInitBin(G4String);
    void SetEndBin(G4String);
    G4String GetOutFile(){return outFile;};
    G4String GetParticle(){return selectedParticle;};
    G4String GetNBin(){return nBinList;};
    G4String GetInitBin(){return initBinList;};
    G4String GetEndBin(){return endBinList;};

  private:
    G4int nEvent;
    G4String outFile;
    ofstream mFile;
    G4String selectedParticle;
    FileMessenger* fileMessenger;
    vector<TH1F*> hROOTList;
    vector<G4String> nBins;
    G4String nBinList;
    G4String initBinList;
    vector<G4String> initBins;
    G4int endBin;
    G4String endBinList;
    vector<G4String> endBins;
    vector<G4String> particles;
    G4int nParticles;
    vector<G4int> counter;

};

//....oooOO0OOooo........oooOO0OOooo........oooOO0OOooo........oooOO0OOooo......

#endif

