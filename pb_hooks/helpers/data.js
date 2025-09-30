module.exports = {
  holidays: () => [
    // 2025
    new Date("2025-01-01"),
    new Date("2025-04-21"), // Lundi de Pâques
    new Date("2025-05-01"),
    new Date("2025-05-08"),
    new Date("2025-05-29"), // Ascension
    new Date("2025-06-09"), // Lundi de Pentecôte
    new Date("2025-07-14"),
    new Date("2025-08-15"),
    new Date("2025-11-01"),
    new Date("2025-11-11"),
    new Date("2025-12-25"),

    // 2026
    new Date("2026-01-01"),
    new Date("2026-04-06"), // Lundi de Pâques
    new Date("2026-05-01"),
    new Date("2026-05-08"),
    new Date("2026-05-14"),
    new Date("2026-05-25"), // Lundi de Pentecôte
    new Date("2026-07-14"),
    new Date("2026-08-15"),
    new Date("2026-11-01"),
    new Date("2026-11-11"),
    new Date("2026-12-25"),

    // 2027
    new Date("2027-01-01"),
    new Date("2027-03-29"), // Lundi de Pâques
    new Date("2027-05-01"),
    new Date("2027-05-08"),
    new Date("2027-05-06"), // Ascension
    new Date("2027-05-17"), // Lundi de Pentecôte
    new Date("2027-07-14"),
    new Date("2027-08-15"),
    new Date("2027-11-01"),
    new Date("2027-11-11"),
    new Date("2027-12-25"),

    // 2028
    new Date("2028-01-01"),
    new Date("2028-04-17"), // Lundi de Pâques
    new Date("2028-05-01"),
    new Date("2028-05-08"),
    new Date("2028-05-25"), // Ascension
    new Date("2028-06-05"), // Lundi de Pentecôte
    new Date("2028-07-14"),
    new Date("2028-08-15"),
    new Date("2028-11-01"),
    new Date("2028-11-11"),
    new Date("2028-12-25"),
  ],
  blockedPeriods: () => ({
    MM1: [
      [new Date("2025-11-23"), new Date("2025-11-26")],
      [new Date("2026-04-06"), new Date("2026-04-10")],
      [new Date("2026-03-02"), new Date("2026-03-05")],
    ],
    MM2: [
      [new Date("2025-11-23"), new Date("2025-11-26")],
      [new Date("2026-01-25"), new Date("2026-01-29")],
      [new Date("2026-03-02"), new Date("2026-03-05")],
    ],
    MM3: [
      [new Date("2025-10-01"), new Date("2025-10-27")],
      [new Date("2026-01-12"), new Date("2026-01-16")],
      [new Date("2026-03-16"), new Date("2026-03-18")],
    ],
  }),
  sectorsByHospital: () => ({
    'Trousseau': [
      ['Chirurgie', '*'],
      ['Psychiatrie', '*'],
      ['Urgence secteur 1 - 2', '*'],
      ['Urgence secteur 1 - 2', '*'],
      ['Urgence secteur 3', '*'],
      ['Urgence secteur 3', '*'],
      ['Urgence secteur 3', '*'],
      ['USCI Cardiologie', '*'],
      ['URTC', 'MM2;MM3'],
      ['UHCD', '*'],
    ],
    'Bretonneau': [
      ['Étage', '*'],
      ['Gynécologie', '*'],
      ['Obstétrique', '*'],
      ['Réanimation 1 - 2', '*'],
      ['Réanimation 3 - 4', '*'],
    ],
    'Clocheville': [
      ['Pédiatrie', '*'],
      ['Pédiatrie', '*'],
    ],
  }),
};