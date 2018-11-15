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
/// \file eventgenerator/HepMC/HepMCEx01/include/ExN04PrimaryGeneratorAction.hh
/// \brief Definition of the ExN04PrimaryGeneratorAction class
//
// ====================================================================
//
//   ExN04PrimaryGeneratorAction.hh
//   $Id$
//
// ====================================================================
#ifndef HEPMC_GENERATOR_ACTION_H
#define HEPMC_GENERATOR_ACTION_H

#include <map>
#include "globals.hh"
#include "G4VUserPrimaryGeneratorAction.hh"

#include "GamosCore/GamosGenerator/include/GmGenerator.hh"

class G4Event;
class G4VPrimaryGenerator;


class HepMCGeneratorAction : public G4VUserPrimaryGeneratorAction {
private:
  G4VPrimaryGenerator* hepmcAscii;

public:
  HepMCGeneratorAction();
  ~HepMCGeneratorAction();

  virtual void GeneratePrimaries(G4Event* anEvent);

};


#endif
