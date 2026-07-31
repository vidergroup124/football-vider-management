// Coordinates based on viewBox="0 0 400 600"
// Team attacks upwards (Y=0), so GK is at the bottom (Y=550)

export const footballFormations = {
  '4-4-2': [
    { id: 'GK', x: 200, y: 550, label: 'GK' },
    { id: 'LB', x: 60, y: 450, label: 'LB' },
    { id: 'LCB', x: 140, y: 470, label: 'CB' },
    { id: 'RCB', x: 260, y: 470, label: 'CB' },
    { id: 'RB', x: 340, y: 450, label: 'RB' },
    { id: 'LM', x: 60, y: 300, label: 'LM' },
    { id: 'LCM', x: 150, y: 300, label: 'CM' },
    { id: 'RCM', x: 250, y: 300, label: 'CM' },
    { id: 'RM', x: 340, y: 300, label: 'RM' },
    { id: 'LST', x: 150, y: 150, label: 'ST' },
    { id: 'RST', x: 250, y: 150, label: 'ST' }
  ],
  '4-3-3': [
    { id: 'GK', x: 200, y: 550, label: 'GK' },
    { id: 'LB', x: 60, y: 450, label: 'LB' },
    { id: 'LCB', x: 140, y: 470, label: 'CB' },
    { id: 'RCB', x: 260, y: 470, label: 'CB' },
    { id: 'RB', x: 340, y: 450, label: 'RB' },
    { id: 'CDM', x: 200, y: 380, label: 'CDM' },
    { id: 'LCM', x: 120, y: 300, label: 'CM' },
    { id: 'RCM', x: 280, y: 300, label: 'CM' },
    { id: 'LW', x: 80, y: 150, label: 'LW' },
    { id: 'ST', x: 200, y: 120, label: 'ST' },
    { id: 'RW', x: 320, y: 150, label: 'RW' }
  ],
  '4-2-3-1': [
    { id: 'GK', x: 200, y: 550, label: 'GK' },
    { id: 'LB', x: 60, y: 450, label: 'LB' },
    { id: 'LCB', x: 140, y: 470, label: 'CB' },
    { id: 'RCB', x: 260, y: 470, label: 'CB' },
    { id: 'RB', x: 340, y: 450, label: 'RB' },
    { id: 'LDM', x: 150, y: 380, label: 'CDM' },
    { id: 'RDM', x: 250, y: 380, label: 'CDM' },
    { id: 'LAM', x: 80, y: 240, label: 'LAM' },
    { id: 'CAM', x: 200, y: 220, label: 'CAM' },
    { id: 'RAM', x: 320, y: 240, label: 'RAM' },
    { id: 'ST', x: 200, y: 120, label: 'ST' }
  ],
  '3-5-2': [
    { id: 'GK', x: 200, y: 550, label: 'GK' },
    { id: 'LCB', x: 100, y: 470, label: 'CB' },
    { id: 'CB', x: 200, y: 470, label: 'CB' },
    { id: 'RCB', x: 300, y: 470, label: 'CB' },
    { id: 'LWB', x: 40, y: 320, label: 'LWB' },
    { id: 'LDM', x: 150, y: 360, label: 'CDM' },
    { id: 'RDM', x: 250, y: 360, label: 'CDM' },
    { id: 'CAM', x: 200, y: 260, label: 'CAM' },
    { id: 'RWB', x: 360, y: 320, label: 'RWB' },
    { id: 'LST', x: 150, y: 140, label: 'ST' },
    { id: 'RST', x: 250, y: 140, label: 'ST' }
  ]
};

export const futsalFormations = {
  '2-2': [
    { id: 'GK', x: 200, y: 550, label: 'GK' },
    { id: 'LD', x: 120, y: 400, label: 'DEF' },
    { id: 'RD', x: 280, y: 400, label: 'DEF' },
    { id: 'LA', x: 120, y: 200, label: 'ATT' },
    { id: 'RA', x: 280, y: 200, label: 'ATT' }
  ],
  '1-2-1 (Diamond)': [
    { id: 'GK', x: 200, y: 550, label: 'GK' },
    { id: 'FIXO', x: 200, y: 420, label: 'FIXO' },
    { id: 'LALA', x: 80, y: 300, label: 'ALA' },
    { id: 'RALA', x: 320, y: 300, label: 'ALA' },
    { id: 'PIVO', x: 200, y: 150, label: 'PIVO' }
  ],
  '3-1': [
    { id: 'GK', x: 200, y: 550, label: 'GK' },
    { id: 'LD', x: 80, y: 400, label: 'ALA' },
    { id: 'FIXO', x: 200, y: 420, label: 'FIXO' },
    { id: 'RD', x: 320, y: 400, label: 'ALA' },
    { id: 'PIVO', x: 200, y: 150, label: 'PIVO' }
  ],
  '1-3': [
    { id: 'GK', x: 200, y: 550, label: 'GK' },
    { id: 'FIXO', x: 200, y: 420, label: 'FIXO' },
    { id: 'LA', x: 80, y: 200, label: 'ALA' },
    { id: 'RA', x: 320, y: 200, label: 'ALA' },
    { id: 'PIVO', x: 200, y: 150, label: 'PIVO' }
  ]
};

export const getFormationsForSport = (sportType) => {
  return sportType === 'Futsal' ? futsalFormations : footballFormations;
};
