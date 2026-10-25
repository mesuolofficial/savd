// prisma/seed-real-data.ts
// Imports all real SAVD 2026 data from the legacy MySQL dump.
// Safe to re-run: uses upsert / find-first-create for every record.

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { slugify } from "../src/lib/slug"; // 👈 YEH IMPORT ADD KAREIN


const prisma = new PrismaClient();

/* ──────────────────────────────────────────────
   0. Constants
   ────────────────────────────────────────────── */
const COMP_SLUG = "autonomous-submersible-vehicle-design-2026";

// Old SAVD university short name → new Prisma University.name (from your 257-list)
const UNI_MAP: Record<string, string> = {
  "NUST": "National University of Sciences and Technology",
  "Institute of Space Technology": "Institute of Space Technology",
  "Institute of Space Technology (IST)": "Institute of Space Technology",
  "IST": "Institute of Space Technology",
  "University of Lahore": "The University of Lahore",
  "PUCIT": "Punjab University College of Information Technology (PUCIT)",
  "UET Taxila": "University of Engineering and Technology, Taxila",
};

/* ──────────────────────────────────────────────
   1. PEOPLE (101 rows — SAVD-0001 … SAVD-0101)
   Fields: [oldId, name, email, phone, studentId, department, university, society, bio, memberSince]
   ────────────────────────────────────────────── */
type PersonRow = [number, string, string | null, string, string, string, string, string | null, string | null, number];
const PEOPLE: PersonRow[] = [
  [304, "Rear Admiral Sohail Ahmad Azmie, SI(M)", null, "", "", "Pakistan Navy", "", "Pakistan Navy", "Rear Admiral Sohail Ahmad Azmie SI(M) was commissioned in the Operations branch of the Pakistan Navy on 1 January 1996 and is a recipient of the Sword of Honour. He is a graduate of Britannia Royal Naval College, Dartmouth; Military College of Signals, Rawalpindi; Pakistan Navy War College, Lahore; and National Defence University, Islamabad. His Command and Staff appointments include Directing Staff at Pakistan Navy War College, Commanding Officer PNS NASR, Commander 9th Auxiliary and Mine Warfare Squadron, Commandant Pakistan Naval Academy, Assistant Chief of Naval Staff (Operational Plans), Commander Combined Task Force 151 at Combined Maritime Forces Bahrain, and Deputy Commandant & Chief Instructor at Pakistan Navy War College. He has been awarded the Sitara-e-Imtiaz (Military).", 2026],
  [305, "Cdr Mubashar Hassan Shahid", null, "", "", "Pakistan Navy War College", "", "Pakistan Navy", "Cdr Mubashar Hassan Shahid from Pakistan Navy is a submariner by specialization and has served onboard various ships and submarines. He has been part of the faculty at PAF Air War College Institute and is currently part of the faculty at Pakistan Navy War College, Lahore. He is currently pursuing his PhD in International Relations from the University of Karachi.", 2026],
  [306, "Dr Abubakr Muhammad", null, "", "", "LUMS", "", "LUMS", "Dr Abubakr Muhammad is the Founding Director of the Centre for Water Informatics & Technology (WIT) and the CYPHYNETS Laboratory at LUMS, where he leads pioneering research in robotics, cyber-physical systems, and intelligent water technologies. He also heads the NCRA National Agricultural Robotics Lab, advancing AI, automation, and autonomous systems for water, agriculture, and environmental applications. With a PhD from the Georgia Institute of Technology and international research experience at the University of Pennsylvania, McGill, Stanford, ETH Zurich, and KAUST, he is among Pakistan's leading experts in applying robotics to solve national water and infrastructure challenges.", 2026],
  [307, "Mr Nauman Ahmad Zaffar", null, "", "", "LUMS", "", "LUMS", "Mr Nauman Ahmad Zaffar is the Project Director of the National Incubation Center (NIC) Lahore at LUMS and a technology leader with a distinguished background in electrical engineering from the University of Pennsylvania, USA. He has successfully bridged academia and industry by transforming research into market-ready technologies and supporting the growth of deep-tech startups across robotics, automation, and intelligent systems. He has previously served at UET Lahore and Techlogix, and is currently affiliated with LUMS.", 2026],
  [308, "Dr Aazir Anwar Khan", null, "", "", "IECE / Aliera", "", "IECE / Aliera", "Dr Aazir Anwar Khan is an engineering and technology leader with over 20 years of international experience spanning engineering, management, research, product development, and technology commercialization across the UK, USA, Europe, and Asia. His areas of expertise include AI, autonomous and robotic vehicle systems, UAS/UUV technologies, automotive EV technology, space systems, and green technologies. Through his leadership at IECE and Aliera AI UK Ltd., he has worked at the intersection of research, innovation, and real-world engineering applications, making him particularly relevant to Pakistan's emerging ecosystem of autonomous and intelligent technologies.", 2026],
  [309, "Engr Sadiqa Khalid", null, "", "", "PTA", "", "PTA", "Engr Sadiqa Khalid is the Zonal Director at the Pakistan Telecommunication Authority (PTA), Zonal Office Lahore, a position she has held since 2022. She holds a Bachelor's degree in Computer Systems Engineering from NED University of Engineering and Technology, Karachi, and has extensive experience in telecommunications regulation, regulatory enforcement, and digital communications governance. She oversees telecom regulatory compliance, quality of service monitoring, consumer protection and enforcement operations across the Lahore Zone, and her expertise spans telecom policy, cybersecurity, and digital connectivity.", 2026],
  [310, "Mr Sohaib Raziq Khan Khitran", null, "", "", "Punjab Irrigation Department", "", "Punjab Irrigation Department", "Mr Sohaib Raziq Khan Khitran currently serves as Director, SCADA & Electro Mechanical Works, Punjab Irrigation Department, where he leads the modernization of critical water infrastructure through automation, supervisory control systems, and advanced engineering solutions. With over 19 years of experience spanning technology leadership, digital transformation, and public-sector innovation, he has played a key role in bridging engineering expertise with real-world government implementation.", 2026],
  [311, "Dr Azmat Naz", null, "", "", "EPA Punjab", "", "EPA Punjab", "Dr Azmat Naz serves as Deputy Director (Technical) at the Environment Protection Agency (EPA), Punjab, where she contributes to environmental regulation, environmental impact assessment, and sustainable development initiatives. She has represented Punjab EPA in national technical committees on climate change and environmental policy and plays an active role in integrating environmental considerations into public-sector planning. Her expertise offers valuable insights into environmental sustainability, ecological monitoring, and the regulatory aspects of emerging technologies.", 2026],
  [312, "Dr Ayesha Kosar", null, "", "", "SUPARCO", "", "SUPARCO", "Dr Ayesha Kosar received her B.Sc. and M.Sc. in Electrical Engineering from UET Lahore in 2007 and 2010 respectively, and her Ph.D. in Space Technology Applications from Beihang University, Beijing, China, in 2020, and was honoured with the Outstanding International Student of China award by the Chinese Government that year. She currently serves as General Manager in the communications domain at a public sector government organization in Lahore, having held progressively senior technical roles including RF Design Engineer, RF Systems Engineer, Project Manager and Project Director. She is also a member of the team behind Pakistan's first manned space mission.", 2026],
  [313, "Dr Adeel Abbas", null, "", "", "Pakistan Meteorological Department", "", "Pakistan Meteorological Department", "Dr. Syed Adeel Abbas is a Meteorologist with the Pakistan Meteorological Department, with approximately 25 years of professional experience in meteorology and weather-related services. He is currently associated with the Flood Forecasting Division (FFD), Lahore, where his expertise contributes to weather and flood forecasting and monitoring.", 2026],
  [314, "Mr Taha Yasin Bhatti", null, "", "", "Aliera", "", "Aliera", "Taha leads Aliera's AI and GenAI engineering, including multi-agent platforms, retrieval systems, edge AI on NVIDIA Jetson, and the algorithms behind Aliera's EV retrofit and charging-optimisation programmes, work selected for the Asian Development Bank's Asia Clean Energy Forum 2025. His research spans grant-funded healthcare robotics with the University of California, Irvine and the University of Notre Dame, developing LLM-driven dementia-care companions that fuse dialogue, vision, and camera-based vitals, with protocols published in JMIR Research Protocols. He also built the live air-quality analytics dashboard behind LAACA, Lahore's academic clean-air alliance.", 2026],
  [315, "Mr Fazal Rehman Kashif", null, "", "", "NESPAK", "", "NESPAK", "Mr Fazal Rehman Kashif, Chief Engineer, is a senior water-resources professional at NESPAK with extensive experience in irrigation, drainage, water-resource development, and major infrastructure projects. He has served as Project Manager on significant irrigation and drainage initiatives, including projects involving the Punjab Irrigation Department and international development partners, and leads the hydraulics, hydropower and dam section as an expert in drainage and hydraulic design.", 2026],
  [316, "Dr Khurram Hameed", "khurram.hameed@me.uol.edu.pk", "", "", "Mechanical engineering", "UOL", "", "", 2026],
  [317, "Dr Aamir Shahzad", null, "", "", "UOL", "", "University of Lahore", "", 2026],
  [318, "Mr Waqar Anwar", null, "", "", "UOL", "", "University of Lahore", "", 2026],
  [319, "Mr Umer Draz", null, "", "", "UOL", "", "University of Lahore", "", 2026],
  [320, "Dr Aamir Khan", "mohammad.aamir@me.uol.edu.pk", "", "", "Mechanical engineering", "UOL", "MES", "", 2026],
  [321, "Dr Salman Abubakar Bugvi", "salman.bugvi@me.uol.edu.pk", "0321 2554978", "", "Mechanical Engineering", "University of Lahore", "MES", "", 2026],
  [322, "Mr Muhammad Usman", null, "", "", "UOL", "", "University of Lahore", "", 2026],
  [323, "Mr Muhammad Ayub", null, "", "", "UOL", "", "University of Lahore", "", 2026],
  [324, "Mr Hamid Iftikhar", null, "", "", "UOL", "", "University of Lahore", "", 2026],
  [325, "Mr Syed Muhammad Arafaat", null, "", "", "UOL", "", "University of Lahore", "", 2026],
  [326, "Mr Naveed Mustafa", null, "", "", "UOL", "", "University of Lahore", "", 2026],
  [327, "Ms Arooj Mobasher", null, "", "", "UOL", "", "University of Lahore", "", 2026],
  [328, "Mr Sajid Bilal", null, "", "", "UOL", "", "University of Lahore", "", 2026],
  [329, "Mr Awais Nawaz", null, "", "", "UOL", "", "University of Lahore", "", 2026],
  [330, "Mr Muhammad Abdullah", "abdullah.engr00@gmail.com", "", "", "Mechanical engineering", "University Of Lahore", "MES", "", 2026],
  [331, "Mr Badar Ahmad", "70154287@student.uol.edu.pk", "03006943576", "70154287", "Computer Science", "University of Lahore", "MES", "", 2026],
  [332, "Mr Haris Anees", "70190768@student.uol.edu.pk", "03033724419", "70190768", "Mechanical Engineering Technology", "University of Lahore", "MES", "", 2026],
  [333, "Mr Hamza Asif", null, "", "", "UOL", "", "University of Lahore", "", 2026],
  [334, "Ms Maymoona", "70145975@student.uol.edu.pk", "", "70145975", "UOL", "", "University of Lahore", "", 2026],
  [335, "Ms Sadia Younas", null, "", "", "", "University of Lahore", "MES", "", 2026],
  [336, "Abdul Rafay", "arafay.ug24smme@student.nust.edu.pk", "03325224015", "507094", "Aerospace Engineering", "NUST", "", "", 2026],
  [337, "Muhammad Bilal Munir", "mbmalik.ug24smme@student.nust.edu.pk", "+92 336 6703399", "504926", "Aerospace Engineering", "NUST", "", "", 2026],
  [338, "Khushbakht Saghir", "ksaghir.ug24smme@student.nust.edu.pk", "+92 370 9148505", "508002", "Aerospace Engineering", "NUST", "", "", 2026],
  [339, "Muhammad Haroon", "mkhalid.ug24smme@nust.edu.pk", "+92 370 4943149", "501106", "Aerospace Engineering", "NUST", "", "", 2026],
  [340, "Abdul Ahad", "saahmad.ug24@smme.nust.edu.pk", "+92 348 8035953", "511003", "", "NUST", "", "", 2026],
  [341, "Muhammad Sanan Azeem", "mazeem.ug24smme@student.nust.edu.pk", "03251519191", "501350", "Mechanical Engineering", "NUST", "", "", 2026],
  [342, "Syed Fakhar Abbas", "sabbas.ug23smme@student.nust.edu.pk", "+92 342 5077357", "466960", "Mechanical Engineering", "NUST", "", "", 2026],
  [343, "Zohaib Mubashir", "zmubashir.ug24smme@student.nust.edu.pk", "+92 329 9915007", "511748", "Mechanical Engineering", "NUST", "", "", 2026],
  [344, "Omar Abdullah", "oabdullah.ug24smme@student.nust.edu.pk", "+92 346 5528322", "501966", "Mechanical Engineering", "NUST", "", "", 2026],
  [345, "Muhammad Akshaf Mehboob", "mmehboob.ug24smme@student.nust.edu.pk", "+92 316 1156112", "516314", "Mechanical Engineering", "NUST", "", "", 2026],
  [346, "Ebad Hassan", "ebadhassangggg@gmail.com", "+923021009402", "230401028", "Electrical", "Institute of Space Technology (IST)", "IEEE IST", "", 2026],
  [347, "Muhammad Ijlal Raza", "ijlalraza001@gmail.com", "+923143110655", "240401020", "Electrical", "Institute of Space Technology (IST)", "IEEE IST", "", 2026],
  [348, "Sameer", "sameerali6917@gmail.com", "+923246879790", "240401024", "Electrical", "Institute of Space Technology (IST)", "IEEE IST", "", 2026],
  [349, "Abdul Wahab", "iabdulwahhabk@gmail.com", "+923257524495", "240401033", "Electrical", "Institute of Space Technology (IST)", "IEEE IST", "", 2026],
  [350, "Muhammad Abubakar", "abubakar01901@gmail.com", "+923275759275", "240401006", "Electrical", "Institute of Space Technology (IST)", "IEEE IST", "", 2026],
  [351, "Maham Khalid", "70180718@student.uol.edu.pk", "03203800762", "70180718", "Intelligent System", "University of Lahore", "MES", "", 2026],
  [352, "Huda Talat", "70175689@student.uol.edu.pk", "", "7017512", "", "University of Lahore", "MES", "", 2026],
  [353, "Hiba Shahid", "70149822@student.uol.edu.pk", "", "70175807", "", "University of Lahore", "MES", "", 2026],
  [354, "Ali Abid", "7017512@student.uol.edu.pk", "", "70175689", "", "University of Lahore", "MES", "", 2026],
  [355, "Zaim Abid", "70175807@student.uol.edu.pk", "", "70149822", "", "University of Lahore", "MES", "", 2026],
  [356, "Ayesha Shaheen", "ayeshashaheen1669@gmail.com", "03320939349", "250701005", "Avionics", "Institute of Space Technology (IST)", "", "", 2026],
  [357, "Hamad Javed", "hamadjaved8134@gmail.com", "+92 347 7714959", "250701017", "", "Institute of Space Technology (IST)", "", "", 2026],
  [358, "Sameen Anjum", "latifsameen5@gmail.com", "+92 303 7055597", "250701015", "", "Institute of Space Technology (IST)", "", "", 2026],
  [359, "Naurish Rana", "naurishfatima512@gmail.com", "+92 311 6049554", "250701053", "", "Institute of Space Technology (IST)", "", "", 2026],
  [360, "Shershah Khan", "shershahk200@gmail.com", "+92 346 0754815", "250701043", "", "Institute of Space Technology (IST)", "", "", 2026],
  [361, "Abdullah Khalid", "bcsf24m528@pucit.edu.pk", "03360203354", "BCSF24M528", "Computer Science", "PUCIT", "", "", 2026],
  [362, "Aila Kanwal", "bcsf24m519@pucit.edu.pk", "03274699668", "BCSF24M519", "Computer Science", "PUCIT", "", "", 2026],
  [363, "Aqib Javed Khokhar", "bcsf24m501@pucit.edu.pk", "03324261136", "BCSF24M501", "Computer Science", "PUCIT", "", "", 2026],
  [364, "Rayyan Abdullah", "bcsf24m553@pucit.edu.pk", "03314149638", "BCSF24M553", "Computer Science", "PUCIT", "", "", 2026],
  [365, "Muhammad Abdur Rehman", "bsdsf24m023@pucit.edu.pk", "03321800068", "BSDSF24M023", "Computer Science", "PUCIT", "", "", 2026],
  [366, "Abdul Hai", "muhammadabdulhai05@gmail.com", "+92 333 3939041", "240101004", "ANY", "IST", "", "", 2026],
  [367, "Aurangzaib", "nomail@gmail.com", "", "240101011", "", "IST", "", "", 2026],
  [368, "Muhammad Faris", null, "", "250101051", "", "IST", "", "", 2026],
  [369, "Mahad Irfan", null, "", "240601024", "", "IST", "", "", 2026],
  [370, "Jaweria Amjad", null, "", "240101008", "", "IST", "", "", 2026],
  [371, "Bilal Chaudhry", "70185929@student.uol.edu.pk", "03293534990", "70185929", "Mechanical Engineering", "University of Lahore", "", "", 2026],
  [372, "Mushal Ahmed", null, "03280539234", "", "Outside", "University of Lahore", "", "", 2026],
  [373, "Sadia Aftab", null, "03280835931", "", "CS", "University of Lahore", "", "", 2026],
  [374, "Ali Bakhtiar", "70185946@student.uol.edu.pk", "03079968909", "70185946", "...", "University of Lahore", "", "", 2026],
  [375, "Abiha Munawar", "70180885@student.uol.edu.pk", "03214543810", "70180885", "IS", "University of Lahore", "MES", "", 2026],
  [376, "Muhammad bin Akrma", "25-me-59@students.uettaxila.edu.pk", "03238557127", "25-ME-59", "Mechanical Engineering", "UET Taxila", "", "", 2026],
  [377, "Muneeb Azhar", "25-me-27@students.uettaxila.edu.pk", "03208588317", "25-ME-27", "Mechanical Engineering", "UET Taxila", "", "", 2026],
  [378, "Tanveer Hassan Khan", "25-me-111@students.uettaxila.edu.pk", "0320 0975077", "25-ME-111", "Mechanical Engineering", "UET Taxila", "", "", 2026],
  [379, "Ahmed Ali", "25-me-115@students.uettaxila.edu.pk", "0311 5335858", "25-ME-115", "Mechanical Engineering", "UET Taxila", "", "", 2026],
  [380, "Muhammad Subhan Babar", "25-me-195@students.uettaxila.edu.pk", "0333 3482225", "25-ME-195", "Mechanical Engineering", "UET Taxila", "", "", 2026],
  [381, "Muhammad Haroon Masood", "70185935@student.uol.edu.pk", "03244221139", "70185935", "Mechanical Engineering", "University of Lahore", "", "", 2026],
  [382, "Muhammad Zain ul Abideen", "70182295@student.uol.edu.pk", "03270210477", "70182295", "Economics", "University of Lahore", "", "", 2026],
  [383, "Fakhir Ali Khan", "70185933@student.uol.edu.pk", "03710161334", "70185933", "Mechanical Engineering", "University of Lahore", "", "", 2026],
  [384, "Muhammad Fawad Ahmed", "70185392@student.uol.edu.pk", "03709991066", "70185392", "Mechanical Engineering", "University of Lahore", "", "", 2026],
  [385, "Ismail Iqbal", "70192350@student.uol.edu.pk", "03040111575", "70192350", "Mechanical Engineering", "University of Lahore", "", "", 2026],
  [386, "Yashfa Iqbal", "70192816@student.uol.edu.pk", "03290089089", "70192816", "Intelligence System", "University of Lahore", "", "", 2026],
  [387, "Zainab Rashid", "zainab.r1214@gmail.com", "03112375379", "", "", "University of Lahore", "", "", 2026],
  [388, "Muhammad", "l246161@lhr.nu.edu.pk", "03214773771", "L246161", "BSEE(CE)", "University of Lahore", "", "", 2026],
  [389, "Hussnain Tahir", "hussnaint735@gmail.com", "03116938357", "", "Electrical Engineering", "University of Lahore", "", "", 2026],
  [390, "Awais Sajid", "l246095@lhr.nu.edu.pk", "03204675019", "L246095", "Electrical Engineering", "University of Lahore", "", "", 2026],
  [391, "Qazi Muhammad Sheharyar Raheel", "70178426@student.uol.edu.pk", "03298009022", "70178426", "Mechanical Engineering Department", "University of Lahore", "", "", 2026],
  [392, "Muhammad Haris", "70174552@student.uol.edu.pk", "+96596684815", "70174552", "Mechanical Engineering Department", "University of Lahore", "", "", 2026],
  [393, "Amanah Shaikh", "70185956@student.uol.edu.pk", "+966552512783", "70185956", "Mechanical Engineering Department", "University of Lahore", "", "", 2026],
  [394, "Umar Akram", "70172980@student.uol.edu.pk", "03064757680", "70172980", "Mechanical Engineering Department", "University of Lahore", "", "", 2026],
  [395, "Saad Mahmood", "70177322@student.uol.edu.pk", "03134568585", "70177322", "Mechanical Engineering Department", "University of Lahore", "", "", 2026],
  [396, "Atif Sarfraz", "bcsf24m523@pucit.edu.pk", "+92 321 4733170", "BCSF24M523", "Computer Science", "PUCIT", "", "", 2026],
  [397, "Nimra Khalid Butt", "bcsf24m546@pucit.edu.pk", "+92 325 5505541", "BSCF25A546", "Computer Science", "PUCIT", "", "", 2026],
  [398, "Abdullah Rashid", "bcsf24m524@pucit.edu.pk", "+92 344 6214204", "BCSF24M546", "", "PUCIT", "", "", 2026],
  [399, "Musfirah Abdullah", "bsef25m553@pucit.edu.pk", "+92 336 1736454", "BCSF24M524", "Software Engineering", "PUCIT", "", "", 2026],
  [400, "Muhammad Moosa Ul Karam", "moosa842007@gmail.com", "+92 3379848102", "BSEF25M553", "Computer Science", "PUCIT", "", "", 2026],
  [401, "Bassam Siraj", "bassamin5@gmail.com", "+923477370373", "409451", "Mechatronics Engineering", "NUST", "", "", 2026],
  [402, "Habibullah Khan", null, "", "404378", "", "NUST", "", "", 2026],
  [403, "Mubasher Ahmed", null, "", "409902", "", "NUST", "", "", 2026],
  [404, "Museb Bin Asad", null, "", "412022", "", "NUST", "", "", 2026],
];

/* ──────────────────────────────────────────────
   2. TEAMS (14)
   Fields: [teamName, university (old short name), description]
   ────────────────────────────────────────────── */
const TEAMS: [string, string, string][] = [
  ["Aeoron", "NUST", "**Team Aeoron** built an 8-thruster, 6-DOF vehicle around a Pixhawk 2.4.8 and Raspberry Pi 3B, with OpenCV-driven vision for gate and line navigation. The design was trained through 1,942 simulated Gazebo episodes before pool trials confirmed a leak-proof hull and full manual and vision-guided control."],
  ["Salam", "NUST", "**Team Salam** paired a Pixhawk 2.4.8 flight controller with a Raspberry Pi 5 running a quantized YOLOv8n model for real-time gate detection. Six BLDC thrusters give the vehicle full 6-DOF control, with a surface buoy handling telemetry through the water."],
  ["Vortex", "Institute of Space Technology (IST)", "**Vortex** is Institute of Space Technology's tethered submersible, verified to a 10 m depth with a 2-knot top speed and 60-minute mission endurance in pool testing. Control runs through extended wires to a floating surface receiver — no antenna needed — with dedicated thrusters for lift, forward drive, and yaw."],
  ["Scuba Dooby", "University of Lahore", "**Scuba Dooby**'s vehicle, *Submarine*, uses a low-drag cylindrical hull with a syringe-based hydraulic ballast system for smooth depth control, a single rear propeller, and trim fins for pitch, yaw, and roll. The hull is rated to 2.6 m — well past the 2 m requirement — with a predicted 0.35 m/s cruise speed."],
  ["The Sebastians", "Institute of Space Technology (IST)", "**The Sebastians** built a bio-inspired AUV for IST's Avionics Engineering department, using an Arduino Mega 2560 to drive four vector-configured thrusters for full 6-DOF motion. Their ultrasonic, IMU, and IR sensor suite scored 94-96% across obstacle detection, stability, and mission-success trials."],
  ["Team AK", "PUCIT", "**Team AK**'s vehicle, *Kalashnikov*, runs a dual-mode system combining manual RF teleoperation with autonomous line-following, driven by an Arduino Pro Micro through dual motor drivers. A surface-tethered floatation box houses the RF receiver to beat water's signal attenuation — the design that earned Team AK **1st place, Champions of SAVD 2026**."],
  ["AeroMarines", "Institute of Space Technology (IST)", "**AeroMarines** built a 400 mm torpedo-hulled AUV using electric ducted fan propulsion and four shark-inspired control fins, run by a Raspberry Pi 4 and Pixhawk pair. All five of the team's verification tests — waterproofing, leak detection, line tracking, telemetry, and integration — passed, and the poster itself won **Best Poster** at SAVD 2026."],
  ["Silent predators", "University of Lahore", "**Silent Predators** designed a cost-effective, RC-controlled submersible with a two-piece body-and-cap hull and full six-degree-of-freedom thruster control. The team cleared its qualifying, gate-navigation, and path-following pool trials, focusing this year on solid manual control ahead of adding autonomy."],
  ["Mistry Phantoms", "UET Taxila", "**Mistry Phantoms**' vehicle, *AL-RASOOB* — inspired by the Titan submarine — is a 5-thruster ROV built around an ESP32-S3 CAM board with a transparent, pressure-resistant body for visibility. It passed water, circuit, motor, and water-level testing on its way to a **3rd place** finish at SAVD 2026."],
  ["Qalandars", "University of Lahore", "**Qalandars** built a manually-piloted ROV on a PVC-pipe chassis, controlled by an ESP32 with an MPU6050 IMU and seven motors for thrust and depth. Tank testing scored 88-91% on buoyancy, thrust, and control accuracy, and the design won **Best Design** at SAVD 2026."],
  ["Robosapians", "University of Lahore", "**Robosapians**' vehicle, *AeroSub Mark I*, is a hybrid-architecture AUV built in just 22 days around a Pixhawk 2.4.8 and Raspberry Pi 5. It passed all five verification tests and qualified for the full 55-point Level 2 autonomy bonus with OpenCV-based gate and line following."],
  ["Obsidian", "University of Lahore", "**Obsidian** is an ESP32-controlled RC underwater vehicle built mainly from recycled and reused materials, driven by dual L298N and IBT-2 motor drivers. The team targeted full 6-DOF control and a 5 ft operating depth in an untethered design."],
  ["Aloo walay parathay", "PUCIT", "**Aloo Walay Parathay**'s vehicle, *Poseidon X-1*, combines wireless-tethered teleoperation with autonomous optical line-tracking on an Arduino Mega 2560. A surface float unit houses the RF receiver, and the design passed its waterproofing, signal-continuity, buoyancy, and 45-minute endurance tests."],
  ["Hydronaut", "NUST", "**Hydronaut** uses trained AI/ML models to autonomously detect and track underwater objects, with a modular design that lets thrusters, sensors, and the payload bay be swapped out quickly. Built for under $1000 with a zero-penetration magnetic switch, it finished in **2nd place** at SAVD 2026."],
];

/* ──────────────────────────────────────────────
   3. TEAM MEMBERS — map old team index → person IDs (first = leader)
   ────────────────────────────────────────────── */
const TEAM_MEMBERS: number[][] = [
  [336, 337, 338, 339, 340],
  [341, 342, 343, 344, 345],
  [346, 347, 348, 349, 350],
  [351, 352, 353, 354, 355],
  [356, 357, 358, 359, 360],
  [361, 362, 363, 364, 365],
  [366, 367, 368, 369, 370],
  [371, 372, 373, 374, 375],
  [376, 377, 378, 379, 380],
  [381, 382, 383, 384, 385],
  [386, 387, 388, 389, 390],
  [391, 392, 393, 394, 395],
  [396, 397, 398, 399, 400],
  [401, 402, 403, 404],
];

/* ──────────────────────────────────────────────
   4. REGISTRATIONS (14 approved) — from SAVD dump
   Fields: [teamIdx, leaderName, leaderEmail, leaderWhatsapp, leaderSapId, leaderDepartment, leaderUniversity, leaderSociety, submittedAt]
   ────────────────────────────────────────────── */
type RegRow = [number, string, string, string, string, string, string, string | null, string];
const REGISTRATIONS: RegRow[] = [
  [0, "Abdul Rafay", "arafay.ug24smme@student.nust.edu.pk", "03325224015", "", "Aerospace Engineering", "NUST", null, "2026-03-29T18:48:05"],
  [1, "Muhammad Sanan Azeem", "mazeem.ug24smme@student.nust.edu.pk", "03251519191", "501350", "Mechanical Engineering", "NUST", null, "2026-03-31T15:51:06"],
  [2, "Ebad Hassan", "ebadhassangggg@gmail.com", "+923021009402", "", "Electrical", "Institute of Space Technology", "IEEE IST", "2026-07-16T19:08:30"],
  [3, "Maham Khalid", "70180718@student.uol.edu.pk", "03203800762", "70180718", "Intelligent System", "University of Lahore", "MES", "2026-07-10T17:29:56"],
  [4, "Ayesha Shaheen", "ayeshashaheen1669@gmail.com", "03320939349", "", "Avionics", "Institute of Space Technology", null, "2026-04-15T13:21:08"],
  [5, "Abdullah Khalid", "bcsf24m528@pucit.edu.pk", "03360203354", "BCSF24M528", "Computer Science", "PUCIT", null, "2026-04-04T20:15:22"],
  [6, "Abdul Hai", "muhammadabdulhai05@gmail.com", "+92 333 3939041", "", "ANY", "IST", null, "2026-08-02T15:48:47"],
  [7, "Bilal Chaudhry", "70185929@student.uol.edu.pk", "03293534990", "70185929", "Mechanical Engineering", "University of Lahore", null, "2026-03-14T15:17:34"],
  [8, "Muhammad bin Akrma", "25-ME-59@students.uettaxila.edu.pk", "03238557127", "25-ME-59", "Mechanical Engineering", "UET Taxila", null, "2026-03-09T16:49:44"],
  [9, "Muhammad Haroon Masood", "70185935@student.uol.edu.pk", "03244221139", "70185935", "Mechanical Engineering", "University of Lahore", null, "2026-03-08T16:19:39"],
  [10, "Yashfa Iqbal", "70192816@student.uol.edu.pk", "03290089089", "78192816", "Intelligence System", "University of Lahore", "MES", "2026-03-07T19:12:45"],
  [11, "Qazi Muhammad Sheharyar Raheel", "70178426@student.uol.edu.pk", "03298009022", "70178426", "Mechanical Engineering Department", "University of Lahore", null, "2026-03-06T00:01:22"],
  [12, "Atif Sarfraz", "BCSF24M523@pucit.edu.pk", "+92 321 4733170", "BCSF24M523", "Computer Science", "PUCIT", "FCIT Robotics Society", "2026-08-04T19:16:35"],
  [13, "Bassam Siraj", "bassamin5@gmail.com", "+923477370373", "", "Mechatronics Engineering", "NUST", null, "2026-08-04T12:20:16"],
];

// 3 withdrawn registrations from MES dump — preserved but no team/members created
type WithdrawnRow = [string, string, string, string, string, string, string, string];
const WITHDRAWN: WithdrawnRow[] = [
  ["Autonomous engineers", "Aqib Moeen", "70177902@student.uol.edu.pk", "03178319449", "70177902", "Intelligent systems", "University of Lahore", "2026-03-05T15:40:23"],
  ["Roboflux 2.0", "Muhammad Bilal", "24-me-99@students.uettaxila.edu.pk", "03085098289", "24-ME-99", "Mechanical", "UET Taxila", "2026-04-23T03:58:53"],
  ["Aaly-AquaX", "Sohaib Ali", "l1f23bscs1291@ucp.edu.pk", "03096881790", "", "IT (cs)", "University of Central Punjab", "2026-05-09T10:32:14"],
];

/* ──────────────────────────────────────────────
   5. RESULT POSITIONS (5) + WINNERS (5)
   ────────────────────────────────────────────── */
const RESULT_POSITIONS: [string, "GOLD" | "SILVER" | "BRONZE" | "NONE", number][] = [
  ["1st Position", "GOLD", 1],
  ["2nd Position", "SILVER", 2],
  ["3rd Position", "BRONZE", 3],
  ["Best Poster", "NONE", 4],
  ["Best Design", "NONE", 5],
];

// [positionLabel, teamName, awardNote]
const WINNERS: [string, string, string][] = [
  ["1st Position", "Team AK", "Champion – First Place"],
  ["2nd Position", "Hydronaut", "Second Place"],
  ["3rd Position", "Mistry Phantoms", "Third Place"],
  ["Best Poster", "AeroMarines", "Best Poster Award"],
  ["Best Design", "Qalandars", "Best Design Efforts Award"],
];

/* ──────────────────────────────────────────────
   6. PROGRESS REQUIREMENTS — all 14 teams completed all 4
   ────────────────────────────────────────────── */
const PROGRESS_REQUIREMENTS = ["Signed Documents", "Final Report", "Journey Video", "Poster"];

/* ──────────────────────────────────────────────
   7. CERTIFICATES — 72 rows: [personOldId, serial]
   ────────────────────────────────────────────── */
const CERTIFICATES: [number, string][] = [
  [336, "MES-2608-0001"], [338, "MES-2608-0002"], [337, "MES-2608-0003"], [339, "MES-2608-0004"], [340, "MES-2608-0005"],
  [376, "MES-2608-0006"], [377, "MES-2608-0007"], [378, "MES-2608-0008"], [379, "MES-2608-0009"], [380, "MES-2608-0010"],
  [386, "MES-2608-0011"], [388, "MES-2608-0012"], [387, "MES-2608-0013"], [389, "MES-2608-0014"], [390, "MES-2608-0015"],
  [391, "MES-2608-0016"], [392, "MES-2608-0017"], [393, "MES-2608-0018"], [394, "MES-2608-0019"], [395, "MES-2608-0020"],
  [381, "MES-2608-0021"], [382, "MES-2608-0022"], [383, "MES-2608-0023"], [384, "MES-2608-0024"], [385, "MES-2608-0025"],
  [341, "MES-2608-0026"], [342, "MES-2608-0027"], [343, "MES-2608-0028"], [344, "MES-2608-0029"], [345, "MES-2608-0030"],
  [361, "MES-2608-0031"], [362, "MES-2608-0032"], [363, "MES-2608-0033"], [364, "MES-2608-0034"], [365, "MES-2608-0035"],
  [356, "MES-2608-0036"], [357, "MES-2608-0037"], [358, "MES-2608-0038"], [359, "MES-2608-0039"], [360, "MES-2608-0040"],
  [351, "MES-2608-0041"], [352, "MES-2608-0042"], [353, "MES-2608-0043"], [354, "MES-2608-0044"], [355, "MES-2608-0045"],
  [346, "MES-2608-0046"], [347, "MES-2608-0047"], [348, "MES-2608-0048"], [349, "MES-2608-0049"], [350, "MES-2608-0050"],
  [366, "MES-2608-0051"], [367, "MES-2608-0052"], [368, "MES-2608-0053"], [369, "MES-2608-0054"], [370, "MES-2608-0055"],
  [371, "MES-2608-0056"], [373, "MES-2608-0057"], [375, "MES-2608-0058"], [374, "MES-2608-0059"], [372, "MES-2608-0060"],
  [401, "MES-2608-0061"], [402, "MES-2608-0062"], [403, "MES-2608-0063"], [404, "MES-2608-0064"],
  [396, "MES-2608-0065"], [400, "MES-2608-0066"], [397, "MES-2608-0067"], [398, "MES-2608-0068"], [399, "MES-2608-0069"],
  [331, "MES-2608-0070"], [332, "MES-2608-0071"], [334, "MES-2608-0072"],
];

/* ──────────────────────────────────────────────
   8. REVIEWS (8) + REPLIES (8) — 1:1
   ────────────────────────────────────────────── */
type ReviewRow = [number, "PARTICIPANT" | "ORGANIZER" | "JUDGE" | "GUEST", string, string | null];
const REVIEWS: ReviewRow[] = [
  [377, "PARTICIPANT", "An excellent experience.\r\nEvent was very well managed.\r\nJust one thing that want to say that there must be some good arrangements for residency for boys.\r\nMashallah all the other arrangements were well managed, timely managed.\r\nFaculty was so good.\r\n100% fair decision regarding competition.", "Thank You Muneeb for your kind apprection words. Glad you enjoyed it and we hope you will continue to be part of future competitions. With regard to hostel accomodations we were on a budget and the priority was affordable, nearby and whole stay of 30 students from outside Lahore. We tried our best to provide stay of students for two days free of cost. We will try and improve this aspect in future events."],
  [336, "PARTICIPANT", "Overall, the platform provides a really good opportunity for students to showcase their ideas in ROVs. The MES members are very cooperative and a special thanks to Dr. Salman Bhugvi & Badar Ahmad who was very kind and motivated me throughout.\r\nThe only thing I want to mention is about the design competition evaluation. Our design went through a very rigorous process of 3 months with 4 revisions. We optimized it for better hydrodynamics, designed it for injection molding, worked on Class A surfaces with G3 continuity, and also did isophote analysis and other FEA. But the award went to a team of UOL that made their ROV with local PVC pipes there was no design, no simulation, no CAD, just a random cube assembly. I’m not discrediting them at all, hats off to them for their effort.\r\nI just feel the judges should have some background in design. Comments like “you copied this design” or “how you can made this you probably made it from a readymade kit” from a young team member in the jury show that there’s a gap in the evaluation. Other than that, it’s a really good platform and I’m thankful for it.", "Dear Rafay the judgement has been made for best design effort other than position holders. The top spot went to Team AK from Punjab University, second to Team Hydronaut from NUST and third to Team Mistry Phantoms from UET Taxila. \r\nThe results have been made on merit by the judges. Don't worry about comments and words. Nobody was personally rude or dilebarately putting you down. Dealing with words, opinions and emotions is a skill which students should learn and develop."],
  [331, "ORGANIZER", "Being part of SAVD 2026 as an organizer was an incredible experience. Contributing to the seamless execution of the event – from planning to on‑ground coordination – every moment was a learning opportunity. Watching participants bring their autonomous submersible vehicles to life was truly inspiring. The dedication, late nights, and problem‑solving spirit of every participant reminded me why events like SAVD matter – they bridge the gap between classroom theory and real‑world engineering. A huge thank you to Dr. Salman Abubakar Bugvi for his guidance and to the entire organizing team for their hard work. This was Pakistan’s first national underwater robotics competition, and I’m proud to have been part of it. Can’t wait for SAVD 2027 – we’re going to make it even bigger! 🚀", "Thank you so much for these kind words and for everything you put into making SAVD 2026 happen! Proud to have had you on the organizing team — here's to an even bigger SAVD 2027."],
  [390, "PARTICIPANT", "The experience was great, one of the best competitions all over Pakistan.", "Thank you so much for your kind words! We’re delighted to hear that you had a great experience and consider it one of the best competitions in Pakistan. Your appreciation motivates us to keep improving and delivering an even better experience in the future. We look forward to welcoming you again! 😊"],
  [374, "PARTICIPANT", "Participating in the University Submersible event was an incredible Engineering challenge. Building and testing our own submarine pushed our teamwork and problem-solving skills to the limit. An unforgettable experience from start to finish!", "Thank you for sharing your experience! We’re thrilled to hear that the 1st Autonomous Submersible Vehicle Design 2026 was such a rewarding engineering challenge for you. It’s wonderful to know that the experience strengthened your teamwork and problem-solving skills. We truly appreciate your participation and enthusiasm, and we hope to see your team take on even more exciting challenges in the future! 🚀"],
  [371, "PARTICIPANT", "That was unforgettable experience.we learn a lot from it and we are expecting better in coming years.", "Thank you for your wonderful feedback! We’re delighted to know that the experience was memorable and that you learned a lot throughout the event. We truly appreciate your support and look forward to making the event even better in the coming years. We hope to see you again! 😊"],
  [385, "PARTICIPANT", "Unfortunately wasn't able to attend of first day, when the testing was conducted so, have nothing to say about that.\r\nAs for the second day, the event was well organized. Got to meet a school fellow and a class fellow from college, team AK and team Vortex respectively.\r\nOverall it was a good learning experience, personally and also by looking at projects other teams made.\r\nReally helpful in learning as well as concepts for future problems.", "Thank you for sharing your feedback! We’re glad to hear that you had a positive and valuable experience on the second day of the event. It’s great that you got the opportunity to reconnect with your school and college fellows, as well as learn from the projects presented by other teams.\r\n\r\nWe truly appreciate your feedback and are happy that the event helped you gain new insights and ideas for tackling future problems. We hope to see you again in our upcoming events! 😊"],
  [400, "PARTICIPANT", "It was a great experince.", "Thank you so much for the kind words — we're really glad you had a great experience with SAVD! It means a lot to hear that from our participants, and we hope to see you at future editions too. 🌊"],
];

/* ──────────────────────────────────────────────
   9. ARCHIVE ROLES (37) — [personOldId, role, isPrimary, displayOrder]
   ────────────────────────────────────────────── */
type RoleRow = [number, "ORGANIZER" | "JUDGE" | "CHIEF_GUEST" | "PANEL_MEMBER", boolean, number];
const ARCHIVE_ROLES: RoleRow[] = [
  [304, "CHIEF_GUEST", true, 1],
  [305, "PANEL_MEMBER", false, 2], [306, "PANEL_MEMBER", false, 3], [307, "PANEL_MEMBER", false, 4],
  [308, "PANEL_MEMBER", false, 5], [309, "PANEL_MEMBER", false, 6], [310, "PANEL_MEMBER", false, 7],
  [311, "PANEL_MEMBER", false, 8], [312, "PANEL_MEMBER", false, 9], [313, "PANEL_MEMBER", false, 10],
  [314, "PANEL_MEMBER", false, 11], [315, "PANEL_MEMBER", false, 12],
  [316, "JUDGE", false, 11], [317, "JUDGE", false, 12], [318, "JUDGE", false, 13], [319, "JUDGE", false, 14], [335, "JUDGE", false, 15],
  [316, "ORGANIZER", false, 21], [318, "ORGANIZER", false, 22], [319, "ORGANIZER", false, 23],
  [320, "ORGANIZER", false, 24], [321, "ORGANIZER", false, 25], [322, "ORGANIZER", false, 26],
  [323, "ORGANIZER", false, 27], [324, "ORGANIZER", false, 28], [325, "ORGANIZER", false, 29],
  [326, "ORGANIZER", false, 30], [327, "ORGANIZER", false, 31], [328, "ORGANIZER", false, 32],
  [329, "ORGANIZER", false, 33], [330, "ORGANIZER", false, 34], [331, "ORGANIZER", false, 35],
  [332, "ORGANIZER", false, 36], [333, "ORGANIZER", false, 37], [334, "ORGANIZER", false, 38],
  [335, "ORGANIZER", false, 39],
];

/* ──────────────────────────────────────────────
   10. SPONSORS (5) — all PARTNER tier
   ────────────────────────────────────────────── */
const SPONSORS: { name: string; websiteUrl: string | null; sortOrder: number }[] = [
  { name: "Mechanical Engineering Society - UOL", websiteUrl: "https://mesuol.xo.je/?i=1", sortOrder: 0 },
  { name: "Mechanical Engineering Department - UOL", websiteUrl: "https://me.uol.edu.pk/", sortOrder: 1 },
  { name: "Integrated Engineering Centre of Excellence - UOL", websiteUrl: null, sortOrder: 2 },
  { name: "PakEVO", websiteUrl: "https://pakevo.com/", sortOrder: 3 },
  { name: "ALIERA", websiteUrl: null, sortOrder: 4 },
];

/* ══════════════════════════════════════════════
   IMPORT LOGIC
   ══════════════════════════════════════════════ */

const savdIdOf = (oldId: number) => `SAVD-${String(oldId - 303).padStart(4, "0")}`;

async function main() {
  console.log("🚀 SAVD real-data import starting...\n");

  // ── 1. Site settings (upsert, don't overwrite existing)
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteTitle: "SAVD — Submersible Autonomous Vehicle Design",
      adminEmail: "mesuolofficial@gmail.com",
      contactAddress: "University of Lahore, 1-Km Raiwind Road, Lahore, Pakistan",
    },
  });
  console.log("✓ Site settings");

  // ── 2. Verify admin exists (created by base seed.ts)
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.toLowerCase() || "70154287@student.uol.edu.pk";
  const admin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.log(`⚠️  No admin with ${adminEmail}. Creating default super_admin...`);
    await prisma.admin.create({
      data: {
        name: "Badar Ahmad",
        email: adminEmail,
        passwordHash: await hash(process.env.SEED_ADMIN_PASSWORD || "ChangeMeNow!", 12),
        role: "SUPER_ADMIN",
      },
    });
  }
  console.log("✓ Admin verified\n");

  // ── 3. Competition
  const comp = await prisma.competition.upsert({
    where: { slug: COMP_SLUG },
    update: {},
    create: {
      slug: COMP_SLUG,
      title: "Autonomous Submersible Vehicle Design 2026",
      description: "The 1st National SAVD Competition — Pakistan's first autonomous underwater vehicle competition, hosted at the University of Lahore Swimming Pool. Fourteen teams from five institutions built and tested their AUVs across qualifying, RC-controlled and autonomous rounds.",
      type: "TEAM",
      minTeamSize: 5, maxTeamSize: 5,
      startDate: new Date("2026-08-10T09:00:00+05:00"),
      endDate: new Date("2026-08-11T17:00:00+05:00"),
      registrationDeadline: new Date("2026-08-04T23:59:00+05:00"),
      venue: "University of Lahore Swimming Pool, Defence Road Campus",
      isPublished: true,
      registrationOpen: false,
    },
  });
  console.log(`✓ Competition "${comp.title}"`);

  // ── 4. Archive
  const archive = await prisma.archive.upsert({
    where: { competitionId: comp.id },
    update: { isPublished: true },
    create: { competitionId: comp.id, isPublished: true },
  });
  console.log("✓ Archive (published)\n");

  // ── 5. Universities (upsert by full name; PUCIT if missing)
  const uniIdMap = new Map<string, string>(); // old short name → Prisma id
  for (const [, oldUni] of TEAMS.map(t => [t[0], t[1]] as [string, string])) {
    if (uniIdMap.has(oldUni)) continue;
    const fullName = UNI_MAP[oldUni] ?? oldUni;
    const uni = await prisma.university.upsert({
      where: { name: fullName },
      update: {},
      create: { name: fullName },
    });
    uniIdMap.set(oldUni, uni.id);
  }
  console.log(`✓ Universities mapped: ${[...uniIdMap.keys()].join(", ")}\n`);

  // ── 6. People (upsert by savdId)
  const personIdMap = new Map<number, string>(); // old int id → Prisma id
  let peopleCount = 0;
  for (const [oldId, name, email, phone, studentId, department, university, society, bio, memberSince] of PEOPLE) {
    const savdId = savdIdOf(oldId);
    const p = await prisma.person.upsert({
      where: { savdId },
      update: {},
      create: {
        savdId,
        name,
        email: email || null,
        phone: phone || null,
        studentId: studentId || null,
        department: department || null,
        university: university || null,
        society: society || null,
        bio: bio || null,
        photo: null,
        memberSince,
      },
    });
    personIdMap.set(oldId, p.id);
    peopleCount++;
  }
  console.log(`✓ People: ${peopleCount}\n`);

  // ── 7. Registrations (14 approved + 3 withdrawn) + Teams + TeamMembers
  const teamIdMap = new Map<string, string>(); // team name → Prisma id
  const regIdMap = new Map<number, string>();   // team index → registration Prisma id

  for (let i = 0; i < REGISTRATIONS.length; i++) {
    const [teamIdx, leaderName, leaderEmail, leaderWhatsapp, leaderSapId, leaderDept, leaderUni, leaderSoc, submittedAt] = REGISTRATIONS[i];
    const teamName = TEAMS[teamIdx][0];
    const uniFull = UNI_MAP[leaderUni] ?? leaderUni;

    const existing = await prisma.registration.findUnique({
      where: { competitionId_leaderEmail: { competitionId: comp.id, leaderEmail } },
    });
    const reg = existing ?? await prisma.registration.create({
      data: {
        competitionId: comp.id,
        teamName,
        leaderName,
        leaderEmail,
        leaderWhatsapp,
        leaderSapId: leaderSapId || "-",
        leaderDepartment: leaderDept,
        leaderUniversity: leaderUni,
        leaderUniversityId: uniIdMap.get(leaderUni) ?? null,
        leaderSociety: leaderSoc,
        consentTransactionalSms: true,
        consentMarketingSms: true,
        consentTerms: true,
        status: "APPROVED",
        createdAt: new Date(submittedAt + "+05:00"),
      },
    });
    regIdMap.set(i, reg.id);

    // Synthesize RegistrationMember from team_members (excluding leader)
    const memberOldIds = TEAM_MEMBERS[i].slice(1);
    for (const oldId of memberOldIds) {
      const person = await prisma.person.findUnique({ where: { savdId: savdIdOf(oldId) } });
      if (!person) continue;
      const exists = await prisma.registrationMember.findFirst({
        where: { registrationId: reg.id, name: person.name },
      });
      if (!exists) {
        await prisma.registrationMember.create({
          data: {
            registrationId: reg.id,
            name: person.name,
            email: person.email || `noemail-${person.savdId.toLowerCase()}@placeholder.local`,
            phone: person.phone || "-",
            sapId: person.studentId || "-",
            department: person.department || "-",
          },
        });
      }
    }

    // Team
    const team = await prisma.team.upsert({
      where: { registrationId: reg.id },
      update: {},
      create: {
        slug: slugify(teamName), // 👈 YEH LINE ADD KAREIN (teamName variable pehle se mojood hai)
        competitionId: comp.id,
        registrationId: reg.id,
        name: teamName,
        universityId: uniIdMap.get(TEAMS[teamIdx][1]) ?? null,
        universityText: leaderUni,
        prototypeDescription: TEAMS[teamIdx][2],
        logo: null,
        reportFile: null,
        posterFile: null,
      },
    });
    teamIdMap.set(teamName, team.id);

    // TeamMembers
    const memberIds = TEAM_MEMBERS[i];
    for (let m = 0; m < memberIds.length; m++) {
      const oldId = memberIds[m];
      const personDbId = personIdMap.get(oldId);
      if (!personDbId) continue;
      await prisma.teamMember.upsert({
        where: { competitionId_personId: { competitionId: comp.id, personId: personDbId } },
        update: {},
        create: {
          teamId: team.id,
          competitionId: comp.id,
          personId: personDbId,
          role: m === 0 ? "LEADER" : "MEMBER",
        },
      });
    }
  }
  // Withdrawn registrations (no team, no members)
  for (const [teamName, leaderName, leaderEmail, leaderWhatsapp, leaderSapId, leaderDept, leaderUni, submittedAt] of WITHDRAWN) {
    const existing = await prisma.registration.findUnique({
      where: { competitionId_leaderEmail: { competitionId: comp.id, leaderEmail } },
    });
    if (!existing) {
      await prisma.registration.create({
        data: {
          competitionId: comp.id,
          teamName,
          leaderName,
          leaderEmail,
          leaderWhatsapp,
          leaderSapId: leaderSapId || "-",
          leaderDepartment: leaderDept,
          leaderUniversity: leaderUni,
          consentTransactionalSms: true,
          consentMarketingSms: true,
          consentTerms: true,
          status: "WITHDRAWN",
          createdAt: new Date(submittedAt + "+05:00"),
        },
      });
    }
  }
  console.log(`✓ Registrations: 14 approved + 3 withdrawn`);
  console.log(`✓ Teams: ${teamIdMap.size}\n`);

  // ── 8. Result positions + Winners
  const positionIdMap = new Map<string, string>();
  for (const [label, medal, sortOrder] of RESULT_POSITIONS) {
    const pos = await prisma.result.upsert({
      where: { competitionId_label: { competitionId: comp.id, label } },
      update: {},
      create: { competitionId: comp.id, label, medal, sortOrder },
    });
    positionIdMap.set(label, pos.id);
  }
  for (const [posLabel, teamName, note] of WINNERS) {
    await prisma.result.update({
      where: { id: positionIdMap.get(posLabel)! },
      data: { teamId: teamIdMap.get(teamName) ?? null, awardNote: note },
    });
  }
  console.log("✓ Results (5 positions with winners)\n");

  // ── 9. Progress requirements + statuses (all complete)
  const reqIdMap = new Map<string, string>();
  for (let i = 0; i < PROGRESS_REQUIREMENTS.length; i++) {
    const name = PROGRESS_REQUIREMENTS[i];
    const r = await prisma.progressRequirement.upsert({
      where: { competitionId_name: { competitionId: comp.id, name } },
      update: {},
      create: { competitionId: comp.id, name, sortOrder: i },
    });
    reqIdMap.set(name, r.id);
  }
  let progressCount = 0;
  for (const teamName of teamIdMap.keys()) {
    const teamId = teamIdMap.get(teamName)!;
    for (const reqName of PROGRESS_REQUIREMENTS) {
      await prisma.progressStatus.upsert({
        where: { teamId_requirementId: { teamId, requirementId: reqIdMap.get(reqName)! } },
        update: { done: true },
        create: { teamId, requirementId: reqIdMap.get(reqName)!, done: true },
      });
      progressCount++;
    }
  }
  console.log(`✓ Progress: ${progressCount} entries (14 teams × 4 reqs, all complete)\n`);

  // ── 10. Certificates (72) — serials + person link, files null
  let certCount = 0;
  for (const [oldPersonId, serial] of CERTIFICATES) {
    const personDbId = personIdMap.get(oldPersonId);
    if (!personDbId) continue;
    await prisma.certificate.upsert({
      where: { serial },
      update: {},
      create: {
        personId: personDbId,
        competitionId: comp.id,
        serial,
        title: "SAVD 2026 Certificate",
        issueDate: null,
        file: null,
        thumb: null,
      },
    });
    certCount++;
  }
  console.log(`✓ Certificates: ${certCount}\n`);

  // ── 11. Reviews + Replies (1:1)
  let reviewCount = 0;
  for (const [oldPersonId, role, text, reply] of REVIEWS) {
    const personDbId = personIdMap.get(oldPersonId);
    if (!personDbId) continue;
    const existing = await prisma.review.findFirst({
      where: { competitionId: comp.id, personId: personDbId },
    });
    const r = existing ?? await prisma.review.create({
      data: {
        competitionId: comp.id,
        personId: personDbId,
        role,
        text,
        status: "PUBLISHED",
        publishedAt: new Date("2026-09-10T00:00:00+05:00"),
      },
    });
    if (reply && admin) {
      const existingReply = await prisma.reviewReply.findFirst({ where: { reviewId: r.id } });
      if (!existingReply) {
        await prisma.reviewReply.create({
          data: { reviewId: r.id, adminId: admin.id, message: reply },
        });
      }
    }
    reviewCount++;
  }
  console.log(`✓ Reviews: ${reviewCount} (with admin replies)\n`);

  // ── 12. Archive roles (37)
  let roleCount = 0;
  for (const [oldPersonId, role, isPrimary, order] of ARCHIVE_ROLES) {
    const personDbId = personIdMap.get(oldPersonId);
    if (!personDbId) continue;
    await prisma.archiveRole.upsert({
      where: { archiveId_personId_role: { archiveId: archive.id, personId: personDbId, role } },
      update: { isPrimary, displayOrder: order },
      create: { archiveId: archive.id, personId: personDbId, role, isPrimary, displayOrder: order },
    });
    roleCount++;
  }
  console.log(`✓ Archive roles: ${roleCount}\n`);

  // ── 13. Sponsors (5) — all PARTNER tier
  for (const s of SPONSORS) {
    const existing = await prisma.sponsor.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.sponsor.create({
        data: { name: s.name, tier: "PARTNER", websiteUrl: s.websiteUrl, sortOrder: s.sortOrder, logo: null },
      });
    }
  }
  console.log(`✓ Sponsors: ${SPONSORS.length}\n`);

  // ── 14. Gallery album (no media — user will upload)
  const existingAlbum = await prisma.galleryAlbum.findFirst({ where: { competitionId: comp.id } });
  if (!existingAlbum) {
    await prisma.galleryAlbum.create({
      data: {
        slug: "savd-2026-pakistans-1st-national-submersible-autonomous-vehicle-design-competition",
        title: "SAVD 2026 — Pakistan's 1st National Submersible Autonomous Vehicle Design Competition",
        description: "Date: 11 August 2026\nVenue: Swimming Pool & FAHS Auditorium, University of Lahore (Defence Road Campus)\nOrganized by: MES Society (Mechanical Engineering Society, UOL) in collaboration with IECE\n\nThe SAVD 2026 competition brought together 14 student teams from 5 leading institutions to design, build and test their own compact AUVs. This gallery captures the event highlights.",
        competitionId: comp.id,
        isPublished: true,
        coverImage: null,
        externalUrl: null,
      },
    });
  }
  console.log("✓ Gallery album created (empty — upload media later)\n");

  // ── 15. Counter — SAVD IDs already at 101
  await prisma.counter.upsert({
    where: { key: "savd_person" },
    update: { value: 101 },
    create: { key: "savd_person", value: 101 },
  });
  console.log("✓ Counter set to 101 (next new person → SAVD-0102)\n");

  console.log("══════════════════════════════════════════════════════════════");
  console.log("🎉 IMPORT COMPLETE");
  console.log("══════════════════════════════════════════════════════════════");
  console.log(`Competition     : ${comp.title}`);
  console.log(`People          : ${peopleCount}`);
  console.log(`Teams           : ${teamIdMap.size}`);
  console.log(`Team members    : 69`);
  console.log(`Certificates    : ${certCount}`);
  console.log(`Reviews         : ${reviewCount}`);
  console.log(`Archive roles   : ${roleCount}`);
  console.log(`Sponsors        : ${SPONSORS.length}`);
  console.log("══════════════════════════════════════════════════════════════");
  console.log("\n➡️  Next: log in as admin → upload banners, logos, certificate files, gallery media, people photos.\n");
}

main()
  .catch((e) => { console.error("\n❌ IMPORT FAILED:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());