import { CivicIssue, MunicipalAssembly, AgencyBranch, AppointmentTicket, SecurityAuditLog, CivicNotification } from '../types';

export const INITIAL_ASSEMBLIES: MunicipalAssembly[] = [
  {
    id: 'asm-ama-01',
    name: 'Accra Metropolitan Assembly (AMA)',
    code: 'AMA',
    region: 'Greater Accra',
    headquarters: 'Kinbu Road, Accra Central',
    dceName: 'Hon. Elizabeth Kwatsoe Sackey',
    adminEmail: 'engineer.ama@civiclink.gov.gh',
    coordinates: { lat: 5.55602, lng: -0.20124 },
    radiusKm: 12,
    activeIssuesCount: 14,
    resolvedIssuesCount: 48,
    allowedBssids: ['AMA-HQ-WIFI-01', 'AMA-DISPATCH-AP-99'],
    allowedIpSubnet: '197.251.134.0/24',
    servicePricing: {
      DVLA: 'GH₵ 185.00',
      Passport: 'GH₵ 500.00',
      Police: 'GH₵ 120.00',
      Health: 'GH₵ 30.00'
    }
  },
  {
    id: 'asm-kokma-02',
    name: 'Korle Klottey Municipal Assembly (KoKMA)',
    code: 'KoKMA',
    region: 'Greater Accra',
    headquarters: 'Osu Ring Road, Accra',
    dceName: 'Hon. Nii Adjei Tawiah',
    adminEmail: 'works.kokma@civiclink.gov.gh',
    coordinates: { lat: 5.56011, lng: -0.17842 },
    radiusKm: 8,
    activeIssuesCount: 9,
    resolvedIssuesCount: 31,
    allowedBssids: ['KOKMA-OFFICE-SECURE', 'KOKMA-OPS-AP'],
    allowedIpSubnet: '197.251.140.0/24',
    servicePricing: {
      DVLA: 'GH₵ 185.00',
      Passport: 'GH₵ 500.00',
      Police: 'GH₵ 120.00',
      Health: 'Free / Official'
    }
  },
  {
    id: 'asm-awma-03',
    name: 'Ayawaso West Municipal Assembly (AWMA)',
    code: 'AWMA',
    region: 'Greater Accra',
    headquarters: 'Dzorwulu / Roman Ridge, Accra',
    dceName: 'Hon. Sandra Owusu Ahinkorah',
    adminEmail: 'works.awma@civiclink.gov.gh',
    coordinates: { lat: 5.61421, lng: -0.19835 },
    radiusKm: 10,
    activeIssuesCount: 11,
    resolvedIssuesCount: 39,
    allowedBssids: ['AWMA-HQ-INTERNAL', 'AWMA-FIELD-WIFI'],
    allowedIpSubnet: '197.251.155.0/24',
    servicePricing: {
      DVLA: 'GH₵ 190.00',
      Passport: 'GH₵ 520.00',
      Police: 'GH₵ 100.00',
      Health: 'GH₵ 25.00'
    }
  },
  {
    id: 'asm-kma-04',
    name: 'Kumasi Metropolitan Assembly (KMA)',
    code: 'KMA',
    region: 'Ashanti Region',
    headquarters: 'Adum Road, Kumasi',
    dceName: 'Hon. Samuel Pyne',
    adminEmail: 'admin.kma@civiclink.gov.gh',
    coordinates: { lat: 6.68848, lng: -1.62443 },
    radiusKm: 18,
    activeIssuesCount: 22,
    resolvedIssuesCount: 65,
    allowedBssids: ['KMA-ADUM-SECURE-AP', 'KMA-METRO-LAN'],
    allowedIpSubnet: '197.255.88.0/24',
    servicePricing: {
      DVLA: 'GH₵ 175.00',
      Passport: 'GH₵ 480.00',
      Police: 'GH₵ 110.00',
      Health: 'Free (NHIS)'
    }
  },
  {
    id: 'asm-tma-05',
    name: 'Tema Metropolitan Assembly (TMA)',
    code: 'TMA',
    region: 'Greater Accra',
    headquarters: 'Community 1, Harbour Road',
    dceName: 'Hon. Yohane Amarh Ashitey',
    adminEmail: 'works.tma@civiclink.gov.gh',
    coordinates: { lat: 5.66982, lng: -0.01657 },
    radiusKm: 15,
    activeIssuesCount: 8,
    resolvedIssuesCount: 42,
    allowedBssids: ['TMA-CITY-WIFI', 'TMA-HARBOUR-AP'],
    allowedIpSubnet: '197.251.162.0/24',
    servicePricing: {
      DVLA: 'GH₵ 180.00',
      Passport: 'GH₵ 500.00',
      Police: 'GH₵ 120.00',
      Health: 'GH₵ 30.00'
    }
  }
];

export const INITIAL_BRANCHES: AgencyBranch[] = [
  // Accra Metropolitan Assembly (AMA)
  {
    id: 'br-dvla-37',
    agency: 'DVLA',
    name: 'DVLA 37 Operational Centre',
    district: 'Accra Metropolitan Assembly (AMA)',
    coordinates: { lat: 5.58622, lng: -0.18241 },
    address: 'Liberation Road, Opposite 37 Military Hospital, Accra',
    openHours: '08:00 AM - 04:30 PM (Mon - Fri)',
    countersCount: 6
  },
  {
    id: 'br-pass-ama',
    agency: 'Passport',
    name: 'Accra Central Passport Application Centre',
    district: 'Accra Metropolitan Assembly (AMA)',
    coordinates: { lat: 5.54882, lng: -0.20452 },
    address: 'High Street, Near Old Parliament House, Accra',
    openHours: '08:00 AM - 04:00 PM (Mon - Fri)',
    countersCount: 8
  },
  {
    id: 'br-pol-hq',
    agency: 'Police',
    name: 'Ghana Police Headquarters CID / Cantonments',
    district: 'Accra Metropolitan Assembly (AMA)',
    coordinates: { lat: 5.57849, lng: -0.17412 },
    address: 'Police Headquarters, Ring Road East, Cantonments, Accra',
    openHours: '24 Hours Emergency & 08:00 AM - 05:00 PM Admin',
    countersCount: 4
  },
  {
    id: 'br-ghs-ama',
    agency: 'Health',
    name: 'Adabraka Polyclinic Metro Health Centre',
    district: 'Accra Metropolitan Assembly (AMA)',
    coordinates: { lat: 5.56345, lng: -0.20891 },
    address: 'Brewery Road, Adabraka, Accra',
    openHours: '24 Hours OPD & 08:30 AM - 04:00 PM Clinics',
    countersCount: 5
  },

  // Korle Klottey Municipal Assembly (KoKMA)
  {
    id: 'br-dvla-kokma',
    agency: 'DVLA',
    name: 'DVLA Osu Operational Unit',
    district: 'Korle Klottey Municipal Assembly (KoKMA)',
    coordinates: { lat: 5.55628, lng: -0.18215 },
    address: 'Cantonments Road / Oxford Street, Osu, Accra',
    openHours: '08:00 AM - 04:30 PM (Mon - Fri)',
    countersCount: 4
  },
  {
    id: 'br-pass-ridge',
    agency: 'Passport',
    name: 'Ridge Passport Application Centre (PAC)',
    district: 'Korle Klottey Municipal Assembly (KoKMA)',
    coordinates: { lat: 5.56711, lng: -0.19852 },
    address: 'Gamel Abdul Nasser Avenue, Ridge, Accra',
    openHours: '08:00 AM - 04:00 PM (Mon - Fri)',
    countersCount: 8
  },
  {
    id: 'br-pol-osu',
    agency: 'Police',
    name: 'Ghana Police Osu District Station',
    district: 'Korle Klottey Municipal Assembly (KoKMA)',
    coordinates: { lat: 5.55392, lng: -0.18124 },
    address: 'Oxford Street, Osu, Accra',
    openHours: '24 Hours Emergency & 08:00 AM - 05:00 PM Admin',
    countersCount: 4
  },
  {
    id: 'br-ghs-ridge',
    agency: 'Health',
    name: 'Greater Accra Regional Hospital (Ridge Hospital)',
    district: 'Korle Klottey Municipal Assembly (KoKMA)',
    coordinates: { lat: 5.56238, lng: -0.19984 },
    address: 'Castle Road, Ridge, Accra',
    openHours: '24 Hours OPD & 08:30 AM - 04:00 PM Clinics',
    countersCount: 6
  },

  // Ayawaso West Municipal Assembly (AWMA)
  {
    id: 'br-dvla-awma',
    agency: 'DVLA',
    name: 'DVLA Legon / Dzorwulu Operational Centre',
    district: 'Ayawaso West Municipal Assembly (AWMA)',
    coordinates: { lat: 5.61421, lng: -0.19835 },
    address: 'Blohum Street, Dzorwulu, Accra',
    openHours: '08:00 AM - 04:30 PM (Mon - Fri)',
    countersCount: 5
  },
  {
    id: 'br-pass-awma',
    agency: 'Passport',
    name: 'Airport Residential PAC Enrollment Unit',
    district: 'Ayawaso West Municipal Assembly (AWMA)',
    coordinates: { lat: 5.60212, lng: -0.17891 },
    address: 'Airport Bypass, Airport Residential, Accra',
    openHours: '08:00 AM - 04:00 PM (Mon - Fri)',
    countersCount: 6
  },
  {
    id: 'br-pol-awma',
    agency: 'Police',
    name: 'Ghana Police Legon / Airport District Station',
    district: 'Ayawaso West Municipal Assembly (AWMA)',
    coordinates: { lat: 5.64210, lng: -0.18950 },
    address: 'Legon Bypass, Near University of Ghana Gate, Accra',
    openHours: '24 Hours Emergency & 08:00 AM - 05:00 PM Admin',
    countersCount: 4
  },
  {
    id: 'br-ghs-awma',
    agency: 'Health',
    name: 'University of Ghana Hospital & Outpatient Wing',
    district: 'Ayawaso West Municipal Assembly (AWMA)',
    coordinates: { lat: 5.65102, lng: -0.18742 },
    address: 'Legon Campus Hospital Road, Accra',
    openHours: '24 Hours OPD & 08:30 AM - 04:00 PM Clinics',
    countersCount: 5
  },

  // Kumasi Metropolitan Assembly (KMA)
  {
    id: 'br-dvla-kma',
    agency: 'DVLA',
    name: 'DVLA Kumasi Adum Regional Centre',
    district: 'Kumasi Metropolitan Assembly (KMA)',
    coordinates: { lat: 6.68848, lng: -1.62443 },
    address: 'Adum Main Commercial Street, Kumasi',
    openHours: '08:00 AM - 04:30 PM (Mon - Fri)',
    countersCount: 6
  },
  {
    id: 'br-pass-kma',
    agency: 'Passport',
    name: 'Kumasi Passport Application Centre (PAC Adum)',
    district: 'Kumasi Metropolitan Assembly (KMA)',
    coordinates: { lat: 6.69120, lng: -1.62150 },
    address: 'Prempeh II Street, Adum, Kumasi',
    openHours: '08:00 AM - 04:00 PM (Mon - Fri)',
    countersCount: 8
  },
  {
    id: 'br-pol-kma',
    agency: 'Police',
    name: 'Ghana Police Ashanti Central Regional Command',
    district: 'Kumasi Metropolitan Assembly (KMA)',
    coordinates: { lat: 6.69412, lng: -1.62310 },
    address: 'Central Police Station Road, Adum, Kumasi',
    openHours: '24 Hours Emergency & 08:00 AM - 05:00 PM Admin',
    countersCount: 4
  },
  {
    id: 'br-ghs-kma',
    agency: 'Health',
    name: 'Komfo Anokye Teaching Hospital (KATH OPD Centre)',
    district: 'Kumasi Metropolitan Assembly (KMA)',
    coordinates: { lat: 6.69874, lng: -1.62890 },
    address: 'Bantama High Street, Kumasi',
    openHours: '24 Hours Emergency & 08:00 AM - 04:00 PM Clinics',
    countersCount: 7
  },

  // Tema Metropolitan Assembly (TMA)
  {
    id: 'br-dvla-tma',
    agency: 'DVLA',
    name: 'DVLA Tema Community 1 Centre',
    district: 'Tema Metropolitan Assembly (TMA)',
    coordinates: { lat: 5.66982, lng: -0.01657 },
    address: 'Harbour Road, Community 1, Tema',
    openHours: '08:00 AM - 04:30 PM (Mon - Fri)',
    countersCount: 5
  },
  {
    id: 'br-pass-tma',
    agency: 'Passport',
    name: 'Tema Passport Biometric Centre',
    district: 'Tema Metropolitan Assembly (TMA)',
    coordinates: { lat: 5.67420, lng: -0.01240 },
    address: 'Community 2 Main Street, Tema',
    openHours: '08:00 AM - 04:00 PM (Mon - Fri)',
    countersCount: 6
  },
  {
    id: 'br-pol-tma',
    agency: 'Police',
    name: 'Ghana Police Tema Regional Headquarters',
    district: 'Tema Metropolitan Assembly (TMA)',
    coordinates: { lat: 5.66810, lng: -0.01520 },
    address: 'Community 1 Police Barracks, Tema',
    openHours: '24 Hours Emergency & 08:00 AM - 05:00 PM Admin',
    countersCount: 4
  },
  {
    id: 'br-ghs-tma',
    agency: 'Health',
    name: 'Tema General Hospital OPD Complex',
    district: 'Tema Metropolitan Assembly (TMA)',
    coordinates: { lat: 5.68110, lng: -0.00890 },
    address: 'Hospital Road, Community 9, Tema',
    openHours: '24 Hours OPD & 08:30 AM - 04:00 PM Clinics',
    countersCount: 6
  }
];

export const INITIAL_ISSUES: CivicIssue[] = [
  {
    id: 'ISS-AMA-2026-001',
    title: 'Severe Storm Drain Blockage & Stagnant Water at Circle Interchange',
    description: 'The primary stormwater culvert along the Kwame Nkrumah Avenue turnoff towards Kaneshie is severely obstructed with plastic silt and debris, causing recurrent flash flooding and foul stench for commuters.',
    category: 'environmental',
    subcategory: 'Choked Gutter & Drainage',
    districtId: 'asm-ama-01',
    districtName: 'Accra Metropolitan Assembly (AMA)',
    coordinates: { lat: 5.56012, lng: -0.21045 },
    address: 'Kwame Nkrumah Interchange, near Neoplan Station',
    landmark: 'Behind VIP Bus Terminal',
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=900&q=80',
    isAnonymous: false,
    authorName: 'Kwame Mensah',
    authorGhanaCardMasked: 'GHA-728190***-1',
    upvotes: 28,
    upvoterIds: ['citizen-sample-01', 'citizen-sample-02', 'citizen-sample-03'],
    priority: 'urgent',
    status: 'in_progress',
    createdAt: '2026-08-16T09:30:00Z',
    updatedAt: '2026-08-18T10:15:00Z',
    assignedDepartment: 'AMA Waste & Environmental Health Directorate'
  },
  {
    id: 'ISS-AMA-2026-002',
    title: 'Deep Hazardous Potholes along Oxford Street Intersection',
    description: 'A 2-meter wide asphalt crater has developed near the traffic light, causing vehicles to swerve abruptly into oncoming lanes during peak traffic hours.',
    category: 'infrastructural',
    subcategory: 'Road Damage & Pothole',
    districtId: 'asm-kokma-02',
    districtName: 'Korle Klottey Municipal Assembly (KoKMA)',
    coordinates: { lat: 5.55628, lng: -0.18215 },
    address: 'Oxford Street / Cantonments Road intersection, Osu',
    landmark: 'Opposite Papaye Fast Foods',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=900&q=80',
    isAnonymous: true,
    authorName: 'Anonymous Citizen',
    authorGhanaCardMasked: 'GHA-***-PROTECTED',
    upvotes: 21,
    upvoterIds: ['citizen-sample-04', 'citizen-sample-05'],
    priority: 'urgent',
    status: 'open',
    createdAt: '2026-08-17T11:45:00Z',
    updatedAt: '2026-08-18T08:00:00Z',
    assignedDepartment: 'Urban Roads Department - KoKMA'
  },
  {
    id: 'ISS-AMA-2026-003',
    title: 'Damaged Solar Streetlights along Dzorwulu Railway Stretch',
    description: 'Over 6 consecutive street light poles have been non-functional for over 2 weeks, leading to safety concerns and minor mugging incidents at night.',
    category: 'infrastructural',
    subcategory: 'Street Lighting Fault',
    districtId: 'asm-awma-03',
    districtName: 'Ayawaso West Municipal Assembly (AWMA)',
    coordinates: { lat: 5.61891, lng: -0.19455 },
    address: 'Blohum Street, Dzorwulu',
    landmark: 'Adjacent to Dzorwulu Special School',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80',
    isAnonymous: false,
    authorName: 'Abena Serwaa',
    authorGhanaCardMasked: 'GHA-849102***-9',
    upvotes: 14,
    upvoterIds: ['citizen-sample-06'],
    priority: 'high',
    status: 'open',
    createdAt: '2026-08-18T06:20:00Z',
    updatedAt: '2026-08-18T06:20:00Z',
    assignedDepartment: 'Electrical & Works Directorate'
  },
  {
    id: 'ISS-AMA-2026-004',
    title: 'Adabraka Polyclinic Triage Waiting Area Sanitation & Bench Shortage',
    description: 'The outdoor OPD waiting shed has broken canopy roofing leaking during downpours, leaving patients in wheelchairs exposed.',
    category: 'medical',
    subcategory: 'Public Hospital Facility Issue',
    districtId: 'asm-ama-01',
    districtName: 'Accra Metropolitan Assembly (AMA)',
    coordinates: { lat: 5.56345, lng: -0.20891 },
    address: 'Brewery Road, Adabraka, Accra',
    landmark: 'Adabraka Polyclinic Outpatient Wing',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80',
    isAnonymous: false,
    authorName: 'Dr. Kofi Asante',
    authorGhanaCardMasked: 'GHA-910283***-4',
    upvotes: 18,
    upvoterIds: ['citizen-sample-07'],
    priority: 'high',
    status: 'resolved',
    createdAt: '2026-08-10T14:10:00Z',
    updatedAt: '2026-08-15T16:40:00Z',
    assignedDepartment: 'Metro Health Services & Public Works',
    resolutionProof: {
      resolvedAt: '2026-08-15T16:30:00Z',
      afterImageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80',
      engineerName: 'Ing. Emmanuel Tetteh',
      engineerTitle: 'Lead Municipal Works Engineer, AMA',
      workDetails: 'Re-roofed patient awning with heavy-duty corrugated aluminum sheeting and installed 12 weather-resistant stainless steel modular seats.',
      materialsCostGHS: 14500,
      officialStampId: 'AMA-WORKS-ENG-STAMP-7819'
    }
  },
  {
    id: 'ISS-KMA-2026-005',
    title: 'Illegal Waste Dumping at Kejetia Central Market Ring',
    description: 'Compactor trucks missed trash collection for 4 days, resulting in massive rubbish piles overflowing onto the pedestrian walkway near the main market entrance.',
    category: 'environmental',
    subcategory: 'Illegal Waste Dump',
    districtId: 'asm-kma-04',
    districtName: 'Kumasi Metropolitan Assembly (KMA)',
    coordinates: { lat: 6.69742, lng: -1.62184 },
    address: 'Kejetia Market North Gate, Kumasi',
    landmark: 'Near Kejetia Overhead Footbridge',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=900&q=80',
    isAnonymous: false,
    authorName: 'Yaw Boateng',
    authorGhanaCardMasked: 'GHA-519284***-8',
    upvotes: 35,
    upvoterIds: ['citizen-sample-08', 'citizen-sample-09'],
    priority: 'urgent',
    status: 'resolved',
    createdAt: '2026-08-12T07:15:00Z',
    updatedAt: '2026-08-14T19:00:00Z',
    assignedDepartment: 'KMA Waste Management Department',
    resolutionProof: {
      resolvedAt: '2026-08-14T18:45:00Z',
      afterImageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=900&q=80',
      engineerName: 'Ing. Akosua Frimpong',
      engineerTitle: 'Head of Sanitation & Environmental Engineering, KMA',
      workDetails: 'Evacuated 48 tonnes of refuse with backhoes, sanitized market perimeter with lime disinfectant, and instituted 24/7 solar-monitored bin station.',
      materialsCostGHS: 28900,
      officialStampId: 'KMA-SAN-DIRECTOR-STAMP-4402'
    }
  }
];

export const INITIAL_TICKETS: AppointmentTicket[] = [
  {
    id: 'tkt-dvla-045',
    ticketNumber: 'DVLA-045',
    serviceAgency: 'DVLA',
    serviceType: 'Driver License Renewal (Class B & C)',
    branchId: 'br-dvla-37',
    branchName: 'DVLA 37 Operational Centre',
    citizenId: 'gh-citizen-01',
    citizenName: 'Kwame Mensah',
    citizenPhone: '+233 24 412 8901',
    ghanaCardNumber: 'GHA-728190342-1',
    appointmentDate: '2026-08-19',
    timeSlot: '10:30 AM - 11:15 AM',
    requiredChecklist: [
      { id: 'chk-1', label: 'Original Physical Ghana Card', checked: true, requiredNote: 'Digital photocopy on phone is strictly not permitted by DVLA.' },
      { id: 'chk-2', label: 'Expired / Current Driver License Card', checked: true, requiredNote: 'Must present previous card or Police Loss Report if stolen.' },
      { id: 'chk-3', label: 'Completed DVLA Form F-1', checked: true, requiredNote: 'Download or verify online prior to counter arrival.' },
      { id: 'chk-4', label: 'Eye Examination Certificate (or in-house test token)', checked: true, requiredNote: 'DVLA accredited optometrist stamp required.' }
    ],
    status: 'called',
    isGeofenceActivated: true,
    simulatedDistanceKm: 0.35,
    currentServingTicket: 'DVLA-045',
    assignedCounter: 'Counter 4 (Biometric Capture)',
    etaMinutes: 0,
    notes: 'Citizen verified at main turnstile. Please proceed to Counter 4.',
    createdAt: '2026-08-18T08:00:00Z'
  },
  {
    id: 'tkt-pass-112',
    ticketNumber: 'PASS-112',
    serviceAgency: 'Passport',
    serviceType: '32-Page Standard Biometric Passport Enrollment',
    branchId: 'br-pass-ridge',
    branchName: 'Ridge Passport Application Centre (PAC)',
    citizenId: 'gh-citizen-02',
    citizenName: 'Efua Sutherland',
    citizenPhone: '+233 50 123 4567',
    ghanaCardNumber: 'GHA-849102934-9',
    appointmentDate: '2026-08-19',
    timeSlot: '11:45 AM - 12:30 PM',
    requiredChecklist: [
      { id: 'chk-p1', label: 'Original Ghana Card & Verified NIA Record', checked: true, requiredNote: 'Mandatory identification under National Passport Regulations.' },
      { id: 'chk-p2', label: 'Original Birth Certificate (Certified by Births & Deaths Registry)', checked: true, requiredNote: 'Verification against national population register.' },
      { id: 'chk-p3', label: '2 Passport-size Color Photos (White Background)', checked: true, requiredNote: 'Size 35mm x 45mm, neutral expression.' },
      { id: 'chk-p4', label: 'Online Payment Receipt Slip (ghana.gov.gh)', checked: true, requiredNote: 'Must show stamped invoice reference.' }
    ],
    status: 'checked_in',
    isGeofenceActivated: true,
    simulatedDistanceKm: 0.8,
    currentServingTicket: 'PASS-109',
    assignedCounter: 'Counter 2 (Fingerprint Capture)',
    etaMinutes: 9,
    notes: '3 applicants ahead in queue. Awaiting announcement.',
    createdAt: '2026-08-18T09:15:00Z'
  },
  {
    id: 'tkt-pol-089',
    ticketNumber: 'POL-089',
    serviceAgency: 'Police',
    serviceType: 'Police Criminal Record Clearance Certificate',
    branchId: 'br-pol-hq',
    branchName: 'Ghana Police Headquarters CID / Cantonments',
    citizenId: 'gh-citizen-03',
    citizenName: 'Kojo Darko',
    citizenPhone: '+233 20 987 6543',
    ghanaCardNumber: 'GHA-910283741-4',
    appointmentDate: '2026-08-19',
    timeSlot: '02:00 PM - 02:45 PM',
    requiredChecklist: [
      { id: 'chk-pol1', label: 'Original Ghana Card (Physical)', checked: true, requiredNote: 'Identity verification for CID biometric records.' },
      { id: 'chk-pol2', label: '2 Passport Sized Photos', checked: true, requiredNote: 'Standard CID identification record requirements.' },
      { id: 'chk-pol3', label: 'Proof of Address (GhanaPost GPS digital code)', checked: true, requiredNote: 'Verified residence validation code.' }
    ],
    status: 'booked',
    isGeofenceActivated: false,
    simulatedDistanceKm: 3.4,
    currentServingTicket: 'POL-082',
    assignedCounter: 'Counter 1 (CID Records)',
    etaMinutes: 28,
    createdAt: '2026-08-18T10:00:00Z'
  },
  {
    id: 'tkt-ghs-034',
    ticketNumber: 'GHS-034',
    serviceAgency: 'Health',
    serviceType: 'NHIS Biometric Card Link & Renewal',
    branchId: 'br-ghs-ridge',
    branchName: 'Greater Accra Regional Hospital (Ridge Hospital)',
    citizenId: 'gh-citizen-04',
    citizenName: 'Abena Serwaa',
    citizenPhone: '+233 24 555 8899',
    ghanaCardNumber: 'GHA-849102934-9',
    appointmentDate: '2026-08-20',
    timeSlot: '08:30 AM - 09:15 AM',
    requiredChecklist: [
      { id: 'chk-ghs1', label: 'Original Ghana Card / NHIS Membership Card', checked: true, requiredNote: 'Universal health coverage biometric identifier.' },
      { id: 'chk-ghs2', label: 'Previous Medical Folder / Hospital Case Book', checked: true, requiredNote: 'Patient historical records.' }
    ],
    status: 'checked_in',
    isGeofenceActivated: true,
    simulatedDistanceKm: 0.45,
    currentServingTicket: 'GHS-031',
    assignedCounter: 'Counter 3 (NHIS Desk)',
    etaMinutes: 6,
    notes: 'Citizen checked in at Ridge Hospital Outpatient Reception.',
    createdAt: '2026-08-18T11:00:00Z'
  },
  {
    id: 'tkt-pol-104',
    ticketNumber: 'POL-104',
    serviceAgency: 'Police',
    serviceType: 'Stolen Vehicle / Property Affidavit Verification',
    branchId: 'br-pol-osu',
    branchName: 'Ghana Police Osu District Station',
    citizenId: 'gh-citizen-05',
    citizenName: 'Kwesi Appiah',
    citizenPhone: '+233 27 123 9988',
    ghanaCardNumber: 'GHA-629182301-3',
    appointmentDate: '2026-08-20',
    timeSlot: '11:45 AM - 12:30 PM',
    requiredChecklist: [
      { id: 'chk-pol4', label: 'Original Ghana Card (Physical)', checked: true, requiredNote: 'Complainant identity verification.' },
      { id: 'chk-pol5', label: 'Sworn Affidavit from High Court', checked: true, requiredNote: 'Official stamped document.' }
    ],
    status: 'booked',
    isGeofenceActivated: false,
    simulatedDistanceKm: 2.1,
    currentServingTicket: 'POL-099',
    assignedCounter: 'Counter 2 (Investigations)',
    etaMinutes: 19,
    createdAt: '2026-08-18T12:30:00Z'
  },
  {
    id: 'tkt-ghs-058',
    ticketNumber: 'GHS-058',
    serviceAgency: 'Health',
    serviceType: 'Outpatient (OPD) Consultation & Triage',
    branchId: 'br-ghs-ama',
    branchName: 'Adabraka Polyclinic Metro Health Centre',
    citizenId: 'gh-citizen-06',
    citizenName: 'Dr. Kofi Asante',
    citizenPhone: '+233 20 444 1122',
    ghanaCardNumber: 'GHA-910283741-4',
    appointmentDate: '2026-08-20',
    timeSlot: '10:30 AM - 11:15 AM',
    requiredChecklist: [
      { id: 'chk-ghs3', label: 'Original Ghana Card / NHIS Membership Card', checked: true, requiredNote: 'Biometric verification at triage station.' },
      { id: 'chk-ghs4', label: 'Referral Letter', checked: true, requiredNote: 'From local clinic if applicable.' }
    ],
    status: 'booked',
    isGeofenceActivated: false,
    simulatedDistanceKm: 1.8,
    currentServingTicket: 'GHS-052',
    assignedCounter: 'Counter 1 (OPD Triage)',
    etaMinutes: 15,
    createdAt: '2026-08-18T13:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: SecurityAuditLog[] = [
  {
    id: 'AUD-9021',
    timestamp: '2026-08-18T17:45:12Z',
    eventType: 'AUTH_SUCCESS',
    userId: 'admin.ama@civiclink.gov.gh',
    userRole: 'municipal_admin',
    ipAddress: '197.251.134.42',
    locationVerified: true,
    bssid: 'AMA-HQ-WIFI-01',
    details: 'Dual-geofence & BSSID verified. Admin session granted for AMA Dispatch.',
    severity: 'info'
  },
  {
    id: 'AUD-9020',
    timestamp: '2026-08-18T16:32:05Z',
    eventType: 'AUTH_FAILURE_GEOFENCE',
    userId: 'works.awma@civiclink.gov.gh',
    userRole: 'municipal_admin',
    ipAddress: '41.215.160.91',
    locationVerified: false,
    bssid: 'UNVERIFIED-CELLULAR-HOTSPOT',
    details: 'Access blocked: IP and GPS coordinates (lat 5.792, lng -0.420) outside Ayawaso West Assembly perimeter.',
    severity: 'critical'
  },
  {
    id: 'AUD-9019',
    timestamp: '2026-08-18T15:10:44Z',
    eventType: 'RATE_LIMIT_EXCEEDED',
    userId: 'citizen-ip-blocked-99',
    userRole: 'anonymous',
    ipAddress: '102.176.65.12',
    locationVerified: false,
    bssid: 'N/A',
    details: 'Civiconnect report submission rate-limit triggered (14 POST requests / 60s). Throttled for 5 minutes.',
    severity: 'warn'
  },
  {
    id: 'AUD-9018',
    timestamp: '2026-08-18T14:02:18Z',
    eventType: 'RESOLUTION_SIGNED',
    userId: 'admin.ama@civiclink.gov.gh',
    userRole: 'municipal_admin',
    ipAddress: '197.251.134.18',
    locationVerified: true,
    bssid: 'AMA-DISPATCH-AP-99',
    details: 'Resolution proof and GHS 14,500 budget audited and stamped for Issue #ISS-AMA-2026-004.',
    severity: 'info'
  },
  {
    id: 'AUD-9017',
    timestamp: '2026-08-18T12:00:00Z',
    eventType: 'ASSEMBLY_PROVISIONED',
    userId: 'root.superadmin@gov.gh',
    userRole: 'super_admin',
    ipAddress: '197.251.100.1',
    locationVerified: true,
    bssid: 'CASTLE-SECURE-LAN',
    details: 'Provisioned new municipal tenant: Tema Metropolitan Assembly (TMA). Cryptographic keys initialized.',
    severity: 'info'
  }
];

export const INITIAL_NOTIFICATIONS: CivicNotification[] = [
  {
    id: 'notif-01',
    title: '🔔 Your Ticket DVLA-045 is being called!',
    message: 'Please proceed immediately to Counter 4 (Biometric Capture) at DVLA 37 Operational Centre.',
    type: 'ticket_called',
    timestamp: 'Just now',
    read: false,
    ticketId: 'tkt-dvla-045'
  },
  {
    id: 'notif-03',
    title: '✅ Issue Resolved with Proof of Work',
    message: 'Adabraka Polyclinic Triage Awning has been repaired by Municipal Works. Before & after proof is now live.',
    type: 'issue_resolved',
    timestamp: '1 day ago',
    read: true,
    issueId: 'ISS-AMA-2026-004'
  }
];
