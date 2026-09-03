// Sample / dummy data — migrated from routemitra-demo/data.js. Same shape a
// real aggregator backend returns. Adapters in lib/adapters/* read from here
// until real APIs are wired up (Phase 4+).

import type { RouteOption } from "@/types/route";
import { densify } from "@/lib/densify";

interface SampleRoute {
  from: string;
  to: string;
  options: RouteOption[];
}

export const ROUTES: Record<string, SampleRoute> = {
  "pune|bengaluru": {
    from: "Pune",
    to: "Bengaluru",
    options: [
      { mode: "bus", operator: "VRL Travels (AC Sleeper)", price: 950, duration_min: 660, departure: "20:30", arrival: "07:30", link: "https://www.redbus.in/" },
      { mode: "bus", operator: "Orange Tours & Travels", price: 1100, duration_min: 600, departure: "21:00", arrival: "07:00", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Udyan Express (11301)", price: 610, duration_min: 1140, departure: "08:10", arrival: "04:10", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Hampi Express (16591)", price: 590, duration_min: 1200, departure: "20:20", arrival: "17:20", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-2341", price: 2899, duration_min: 80, departure: "14:20", arrival: "15:40", link: "https://www.cleartrip.com/" },
      { mode: "flight", operator: "Air India AI-505", price: 3450, duration_min: 85, departure: "09:00", arrival: "10:25", link: "https://www.goibibo.com/" },
    ],
  },
  "mumbai|goa": {
    from: "Mumbai",
    to: "Goa",
    options: [
      { mode: "bus", operator: "Neeta Tours (AC Seater)", price: 800, duration_min: 540, departure: "22:00", arrival: "07:00", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Konkan Kanya Express (10111)", price: 425, duration_min: 660, departure: "23:00", arrival: "10:00", link: "https://www.irctc.co.in/" },
      { mode: "flight", operator: "SpiceJet SG-146", price: 2450, duration_min: 70, departure: "11:10", arrival: "12:20", link: "https://www.goibibo.com/" },
      { mode: "flight", operator: "IndiGo 6E-6177", price: 2199, duration_min: 65, departure: "17:45", arrival: "18:50", link: "https://www.cleartrip.com/" },
    ],
  },
  "delhi|jaipur": {
    from: "Delhi",
    to: "Jaipur",
    options: [
      { mode: "bus", operator: "RSRTC Volvo AC", price: 550, duration_min: 300, departure: "07:00", arrival: "12:00", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Ajmer Shatabdi (12015)", price: 445, duration_min: 270, departure: "06:05", arrival: "10:35", link: "https://www.irctc.co.in/" },
      { mode: "flight", operator: "Air India AI-9821", price: 3299, duration_min: 55, departure: "19:15", arrival: "20:10", link: "https://www.cleartrip.com/" },
    ],
  },
  "chennai|hyderabad": {
    from: "Chennai",
    to: "Hyderabad",
    options: [
      { mode: "bus", operator: "KPN Travels (AC Sleeper)", price: 1050, duration_min: 540, departure: "21:30", arrival: "06:30", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Charminar Express (12760)", price: 480, duration_min: 780, departure: "18:40", arrival: "07:40", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-6301", price: 2199, duration_min: 75, departure: "12:30", arrival: "13:45", link: "https://www.goibibo.com/" },
    ],
  },
  "mumbai|delhi": {
    from: "Mumbai",
    to: "Delhi",
    options: [
      { mode: "train", operator: "Rajdhani Express (12951)", price: 1965, duration_min: 960, departure: "16:35", arrival: "08:35", link: "https://www.irctc.co.in/" },
      { mode: "flight", operator: "Vistara UK-995", price: 4899, duration_min: 130, departure: "08:00", arrival: "10:10", link: "https://www.cleartrip.com/" },
      { mode: "flight", operator: "IndiGo 6E-2312", price: 3999, duration_min: 135, departure: "15:20", arrival: "17:35", link: "https://www.goibibo.com/" },
    ],
  },
  "delhi|varanasi": {
    from: "Delhi",
    to: "Varanasi",
    options: [
      { mode: "bus", operator: "UPSRTC AC Sleeper", price: 1250, duration_min: 780, departure: "18:30", arrival: "07:30", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Vande Bharat Express (22436)", price: 1720, duration_min: 480, departure: "06:00", arrival: "14:00", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Shiv Ganga Express (12560)", price: 640, duration_min: 690, departure: "20:10", arrival: "07:40", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-2053", price: 3650, duration_min: 85, departure: "09:35", arrival: "11:00", link: "https://www.cleartrip.com/" },
      { mode: "flight", operator: "Air India AI-405", price: 4120, duration_min: 90, departure: "17:10", arrival: "18:40", link: "https://www.goibibo.com/" },
    ],
  },
  "bengaluru|chennai": {
    from: "Bengaluru",
    to: "Chennai",
    options: [
      { mode: "bus", operator: "KPN Travels (AC Sleeper)", price: 700, duration_min: 390, departure: "23:00", arrival: "05:30", link: "https://www.redbus.in/" },
      { mode: "bus", operator: "SRS Travels (Volvo)", price: 850, duration_min: 360, departure: "22:30", arrival: "04:30", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Shatabdi Express (12028)", price: 780, duration_min: 300, departure: "06:00", arrival: "11:00", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Brindavan Express (12640)", price: 190, duration_min: 390, departure: "07:50", arrival: "14:20", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-345", price: 2450, duration_min: 60, departure: "10:15", arrival: "11:15", link: "https://www.cleartrip.com/" },
    ],
  },
  "delhi|chandigarh": {
    from: "Delhi",
    to: "Chandigarh",
    options: [
      { mode: "bus", operator: "Volvo AC (HRTC)", price: 620, duration_min: 270, departure: "07:00", arrival: "11:30", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Shatabdi Express (12005)", price: 780, duration_min: 205, departure: "07:40", arrival: "11:05", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Kalka Shatabdi (12011)", price: 760, duration_min: 210, departure: "17:25", arrival: "20:55", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-2135", price: 3100, duration_min: 55, departure: "12:40", arrival: "13:35", link: "https://www.goibibo.com/" },
    ],
  },
  "hyderabad|bengaluru": {
    from: "Hyderabad",
    to: "Bengaluru",
    options: [
      { mode: "bus", operator: "Orange Travels (AC Sleeper)", price: 900, duration_min: 540, departure: "21:30", arrival: "06:30", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Kacheguda Express (17603)", price: 520, duration_min: 720, departure: "18:45", arrival: "06:45", link: "https://www.irctc.co.in/" },
      { mode: "flight", operator: "IndiGo 6E-537", price: 2299, duration_min: 70, departure: "09:20", arrival: "10:30", link: "https://www.cleartrip.com/" },
      { mode: "flight", operator: "Akasa Air QP-1104", price: 2650, duration_min: 75, departure: "16:10", arrival: "17:25", link: "https://www.goibibo.com/" },
    ],
  },
  "mumbai|ahmedabad": {
    from: "Mumbai",
    to: "Ahmedabad",
    options: [
      { mode: "bus", operator: "Gujarat Travels (AC Sleeper)", price: 950, duration_min: 480, departure: "22:00", arrival: "06:00", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Shatabdi Express (12009)", price: 895, duration_min: 405, departure: "06:25", arrival: "13:10", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Gujarat Mail (12901)", price: 420, duration_min: 510, departure: "21:55", arrival: "06:25", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-6501", price: 2799, duration_min: 75, departure: "11:00", arrival: "12:15", link: "https://www.cleartrip.com/" },
    ],
  },
  "kolkata|delhi": {
    from: "Kolkata",
    to: "Delhi",
    options: [
      { mode: "train", operator: "Rajdhani Express (12301)", price: 2100, duration_min: 1020, departure: "16:50", arrival: "09:55", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Poorva Express (12303)", price: 780, duration_min: 1370, departure: "08:05", arrival: "07:00", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-2117", price: 4250, duration_min: 130, departure: "07:30", arrival: "09:40", link: "https://www.cleartrip.com/" },
      { mode: "flight", operator: "Vistara UK-708", price: 5100, duration_min: 135, departure: "18:20", arrival: "20:35", link: "https://www.goibibo.com/" },
    ],
  },
  "jaipur|udaipur": {
    from: "Jaipur",
    to: "Udaipur",
    options: [
      { mode: "bus", operator: "RSRTC Volvo AC", price: 650, duration_min: 420, departure: "08:00", arrival: "15:00", link: "https://www.redbus.in/" },
      { mode: "bus", operator: "Jain Travels (Sleeper)", price: 550, duration_min: 450, departure: "23:30", arrival: "07:00", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Chetak Express (12981)", price: 340, duration_min: 435, departure: "22:05", arrival: "05:20", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-7431", price: 3900, duration_min: 60, departure: "13:15", arrival: "14:15", link: "https://www.goibibo.com/" },
    ],
  },
  "pune|mumbai": {
    from: "Pune",
    to: "Mumbai",
    options: [
      { mode: "bus", operator: "Shivneri Volvo AC", price: 480, duration_min: 210, departure: "09:00", arrival: "12:30", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Deccan Express (11008)", price: 115, duration_min: 210, departure: "07:00", arrival: "10:30", link: "https://www.confirmtkt.com/" },
      { mode: "train", operator: "Intercity Express (12127)", price: 340, duration_min: 195, departure: "14:15", arrival: "17:30", link: "https://www.irctc.co.in/" },
    ],
  },
  "delhi|lucknow": {
    from: "Delhi",
    to: "Lucknow",
    options: [
      { mode: "bus", operator: "UPSRTC Janrath AC", price: 780, duration_min: 480, departure: "21:00", arrival: "05:00", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Tejas Express (82501)", price: 1280, duration_min: 390, departure: "15:35", arrival: "22:05", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Lucknow Mail (12230)", price: 610, duration_min: 445, departure: "22:00", arrival: "05:25", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-895", price: 3350, duration_min: 75, departure: "10:40", arrival: "11:55", link: "https://www.cleartrip.com/" },
    ],
  },
  "bengaluru|goa": {
    from: "Bengaluru",
    to: "Goa",
    options: [
      { mode: "bus", operator: "VRL Travels (AC Sleeper)", price: 1100, duration_min: 660, departure: "21:00", arrival: "08:00", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Vasco Express (17309)", price: 480, duration_min: 840, departure: "15:15", arrival: "05:15", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-611", price: 2550, duration_min: 65, departure: "08:45", arrival: "09:50", link: "https://www.cleartrip.com/" },
      { mode: "flight", operator: "Akasa Air QP-1391", price: 2950, duration_min: 70, departure: "17:30", arrival: "18:40", link: "https://www.goibibo.com/" },
    ],
  },
  "chennai|coimbatore": {
    from: "Chennai",
    to: "Coimbatore",
    options: [
      { mode: "bus", operator: "KPN Travels (AC Sleeper)", price: 850, duration_min: 480, departure: "22:00", arrival: "06:00", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Kovai Express (12675)", price: 265, duration_min: 435, departure: "06:15", arrival: "13:30", link: "https://www.confirmtkt.com/" },
      { mode: "train", operator: "Shatabdi Express (12243)", price: 720, duration_min: 400, departure: "07:10", arrival: "13:50", link: "https://www.irctc.co.in/" },
      { mode: "flight", operator: "IndiGo 6E-455", price: 2400, duration_min: 60, departure: "12:00", arrival: "13:00", link: "https://www.goibibo.com/" },
    ],
  },
  "ahmedabad|jaipur": {
    from: "Ahmedabad",
    to: "Jaipur",
    options: [
      { mode: "bus", operator: "Ashapura Travels (Sleeper)", price: 900, duration_min: 570, departure: "21:30", arrival: "07:00", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Ashram Express (12915)", price: 540, duration_min: 585, departure: "18:35", arrival: "04:20", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-6789", price: 3550, duration_min: 75, departure: "14:20", arrival: "15:35", link: "https://www.cleartrip.com/" },
    ],
  },
  "delhi|agra": {
    from: "Delhi",
    to: "Agra",
    options: [
      { mode: "train", operator: "Gatimaan Express (12050)", price: 780, duration_min: 100, departure: "08:10", arrival: "09:50", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Bhopal Shatabdi (12002)", price: 720, duration_min: 110, departure: "06:00", arrival: "07:50", link: "https://www.confirmtkt.com/" },
      { mode: "bus", operator: "UPSRTC AC (Yamuna Expy)", price: 450, duration_min: 240, departure: "07:30", arrival: "11:30", link: "https://www.redbus.in/" },
    ],
  },
  "delhi|amritsar": {
    from: "Delhi",
    to: "Amritsar",
    options: [
      { mode: "train", operator: "Amritsar Shatabdi (12013)", price: 900, duration_min: 375, departure: "07:20", arrival: "13:35", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Swarna Shatabdi (12029)", price: 880, duration_min: 360, departure: "07:20", arrival: "13:20", link: "https://www.confirmtkt.com/" },
      { mode: "bus", operator: "Volvo AC (PRTC)", price: 750, duration_min: 540, departure: "22:00", arrival: "07:00", link: "https://www.redbus.in/" },
      { mode: "flight", operator: "IndiGo 6E-2033", price: 3600, duration_min: 70, departure: "18:40", arrival: "19:50", link: "https://www.cleartrip.com/" },
    ],
  },
  "delhi|nagpur": {
    from: "Delhi",
    to: "Nagpur",
    options: [
      { mode: "train", operator: "Nagpur Duronto (12290)", price: 1420, duration_min: 885, departure: "20:15", arrival: "11:00", link: "https://www.irctc.co.in/" },
      { mode: "flight", operator: "IndiGo 6E-6115", price: 4250, duration_min: 105, departure: "12:20", arrival: "14:05", link: "https://www.cleartrip.com/" },
      { mode: "bus", operator: "Private Sleeper (via Betul)", price: 1650, duration_min: 1080, departure: "16:00", arrival: "10:00", link: "https://www.redbus.in/" },
    ],
  },
  "delhi|indore": {
    from: "Delhi",
    to: "Indore",
    options: [
      { mode: "train", operator: "Indore Intercity (12416)", price: 820, duration_min: 840, departure: "23:45", arrival: "13:45", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-419", price: 3850, duration_min: 95, departure: "07:10", arrival: "08:45", link: "https://www.cleartrip.com/" },
      { mode: "bus", operator: "Volvo Sleeper (Verma)", price: 1250, duration_min: 900, departure: "18:00", arrival: "09:00", link: "https://www.redbus.in/" },
    ],
  },
  "delhi|patna": {
    from: "Delhi",
    to: "Patna",
    options: [
      { mode: "train", operator: "Sampoorna Kranti (12394)", price: 1050, duration_min: 750, departure: "17:35", arrival: "06:05", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Rajdhani Express (12310)", price: 2150, duration_min: 620, departure: "17:15", arrival: "03:35", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-2172", price: 4400, duration_min: 110, departure: "09:30", arrival: "11:20", link: "https://www.cleartrip.com/" },
      { mode: "bus", operator: "Private AC Sleeper", price: 1400, duration_min: 1140, departure: "15:00", arrival: "10:00", link: "https://www.redbus.in/" },
    ],
  },
  "mumbai|nagpur": {
    from: "Mumbai",
    to: "Nagpur",
    options: [
      { mode: "train", operator: "Nagpur Duronto (12290)", price: 1180, duration_min: 720, departure: "20:40", arrival: "08:40", link: "https://www.irctc.co.in/" },
      { mode: "flight", operator: "IndiGo 6E-813", price: 3550, duration_min: 85, departure: "13:15", arrival: "14:40", link: "https://www.cleartrip.com/" },
      { mode: "bus", operator: "Private Sleeper (Hirkani)", price: 1500, duration_min: 840, departure: "17:30", arrival: "07:30", link: "https://www.redbus.in/" },
    ],
  },
  "mumbai|surat": {
    from: "Mumbai",
    to: "Surat",
    options: [
      { mode: "train", operator: "Flying Ranee (12921)", price: 260, duration_min: 225, departure: "17:55", arrival: "21:40", link: "https://www.confirmtkt.com/" },
      { mode: "train", operator: "Gujarat Mail (12901)", price: 240, duration_min: 255, departure: "21:50", arrival: "02:05", link: "https://www.irctc.co.in/" },
      { mode: "bus", operator: "Volvo AC (Gujarat Travels)", price: 450, duration_min: 300, departure: "23:30", arrival: "04:30", link: "https://www.redbus.in/" },
    ],
  },
  "mumbai|nashik": {
    from: "Mumbai",
    to: "Nashik",
    options: [
      { mode: "train", operator: "Panchavati Express (12109)", price: 180, duration_min: 210, departure: "06:10", arrival: "09:40", link: "https://www.confirmtkt.com/" },
      { mode: "bus", operator: "MSRTC Shivshahi AC", price: 350, duration_min: 240, departure: "08:00", arrival: "12:00", link: "https://www.redbus.in/" },
      { mode: "bus", operator: "Private Non-AC", price: 280, duration_min: 270, departure: "14:00", arrival: "18:30", link: "https://www.redbus.in/" },
    ],
  },
  "mumbai|indore": {
    from: "Mumbai",
    to: "Indore",
    options: [
      { mode: "train", operator: "Avantika Express (12961)", price: 520, duration_min: 795, departure: "19:05", arrival: "08:20", link: "https://www.irctc.co.in/" },
      { mode: "flight", operator: "IndiGo 6E-596", price: 3950, duration_min: 80, departure: "10:05", arrival: "11:25", link: "https://www.cleartrip.com/" },
      { mode: "bus", operator: "Volvo Sleeper (Chartered)", price: 950, duration_min: 840, departure: "18:30", arrival: "08:30", link: "https://www.redbus.in/" },
    ],
  },
  "pune|nashik": {
    from: "Pune",
    to: "Nashik",
    options: [
      { mode: "bus", operator: "MSRTC Shivshahi AC", price: 380, duration_min: 300, departure: "07:30", arrival: "12:30", link: "https://www.redbus.in/" },
      { mode: "bus", operator: "Private Non-AC Seater", price: 300, duration_min: 330, departure: "15:00", arrival: "20:30", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Panchavati / passenger link", price: 160, duration_min: 360, departure: "05:20", arrival: "11:20", link: "https://www.confirmtkt.com/" },
    ],
  },
  "pune|hyderabad": {
    from: "Pune",
    to: "Hyderabad",
    options: [
      { mode: "bus", operator: "Orange Tours (AC Sleeper)", price: 900, duration_min: 600, departure: "21:00", arrival: "07:00", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Shatabdi Express (12026)", price: 460, duration_min: 780, departure: "14:55", arrival: "03:55", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-772", price: 3200, duration_min: 70, departure: "12:10", arrival: "13:20", link: "https://www.cleartrip.com/" },
    ],
  },
  "bengaluru|kochi": {
    from: "Bengaluru",
    to: "Kochi",
    options: [
      { mode: "train", operator: "Island Express (16525)", price: 450, duration_min: 780, departure: "19:15", arrival: "08:15", link: "https://www.irctc.co.in/" },
      { mode: "flight", operator: "IndiGo 6E-455", price: 2650, duration_min: 75, departure: "09:40", arrival: "10:55", link: "https://www.cleartrip.com/" },
      { mode: "bus", operator: "KSRTC Airavat (Volvo)", price: 950, duration_min: 630, departure: "22:00", arrival: "08:30", link: "https://www.redbus.in/" },
    ],
  },
  "bengaluru|mysuru": {
    from: "Bengaluru",
    to: "Mysuru",
    options: [
      { mode: "train", operator: "Shatabdi Express (12007)", price: 380, duration_min: 120, departure: "11:00", arrival: "13:00", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Chamundi Express (16215)", price: 120, duration_min: 180, departure: "18:15", arrival: "21:15", link: "https://www.confirmtkt.com/" },
      { mode: "bus", operator: "KSRTC Airavat (Volvo)", price: 280, duration_min: 210, departure: "08:00", arrival: "11:30", link: "https://www.redbus.in/" },
    ],
  },
  "chennai|kochi": {
    from: "Chennai",
    to: "Kochi",
    options: [
      { mode: "train", operator: "Alleppey Express (22639)", price: 420, duration_min: 690, departure: "20:45", arrival: "08:15", link: "https://www.irctc.co.in/" },
      { mode: "flight", operator: "IndiGo 6E-374", price: 2800, duration_min: 80, departure: "13:20", arrival: "14:40", link: "https://www.cleartrip.com/" },
      { mode: "bus", operator: "KPN Travels (AC Sleeper)", price: 900, duration_min: 660, departure: "21:00", arrival: "08:00", link: "https://www.redbus.in/" },
    ],
  },
  "chennai|thiruvananthapuram": {
    from: "Chennai",
    to: "Thiruvananthapuram",
    options: [
      { mode: "train", operator: "Trivandrum Mail (12623)", price: 560, duration_min: 930, departure: "19:00", arrival: "10:30", link: "https://www.irctc.co.in/" },
      { mode: "flight", operator: "IndiGo 6E-6547", price: 3400, duration_min: 85, departure: "11:50", arrival: "13:15", link: "https://www.cleartrip.com/" },
      { mode: "bus", operator: "KSRTC / private Sleeper", price: 1100, duration_min: 900, departure: "18:30", arrival: "09:30", link: "https://www.redbus.in/" },
    ],
  },
  "chennai|visakhapatnam": {
    from: "Chennai",
    to: "Visakhapatnam",
    options: [
      { mode: "train", operator: "Coromandel Express (12841)", price: 560, duration_min: 780, departure: "08:45", arrival: "21:45", link: "https://www.irctc.co.in/" },
      { mode: "flight", operator: "IndiGo 6E-717", price: 3600, duration_min: 90, departure: "16:10", arrival: "17:40", link: "https://www.cleartrip.com/" },
      { mode: "bus", operator: "Private AC Sleeper", price: 1300, duration_min: 900, departure: "17:00", arrival: "08:00", link: "https://www.redbus.in/" },
    ],
  },
  "hyderabad|visakhapatnam": {
    from: "Hyderabad",
    to: "Visakhapatnam",
    options: [
      { mode: "train", operator: "Godavari Express (12728)", price: 460, duration_min: 720, departure: "17:15", arrival: "05:15", link: "https://www.irctc.co.in/" },
      { mode: "flight", operator: "IndiGo 6E-333", price: 3000, duration_min: 75, departure: "10:20", arrival: "11:35", link: "https://www.cleartrip.com/" },
      { mode: "bus", operator: "APSRTC Garuda Plus", price: 1000, duration_min: 720, departure: "21:30", arrival: "09:30", link: "https://www.redbus.in/" },
    ],
  },
  "hyderabad|nagpur": {
    from: "Hyderabad",
    to: "Nagpur",
    options: [
      { mode: "train", operator: "Rajdhani Express (12722)", price: 900, duration_min: 390, departure: "23:15", arrival: "05:45", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Sampark Kranti (12707)", price: 380, duration_min: 450, departure: "13:25", arrival: "20:55", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-641", price: 3400, duration_min: 70, departure: "18:45", arrival: "19:55", link: "https://www.cleartrip.com/" },
      { mode: "bus", operator: "Private AC Sleeper", price: 850, duration_min: 540, departure: "22:00", arrival: "07:00", link: "https://www.redbus.in/" },
    ],
  },
  "kolkata|patna": {
    from: "Kolkata",
    to: "Patna",
    options: [
      { mode: "train", operator: "Vande Bharat (22349)", price: 1100, duration_min: 420, departure: "15:20", arrival: "22:20", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Vikramshila Express (12367)", price: 380, duration_min: 540, departure: "21:00", arrival: "06:00", link: "https://www.confirmtkt.com/" },
      { mode: "flight", operator: "IndiGo 6E-767", price: 3200, duration_min: 70, departure: "12:35", arrival: "13:45", link: "https://www.cleartrip.com/" },
      { mode: "bus", operator: "Private AC Sleeper", price: 750, duration_min: 600, departure: "20:00", arrival: "06:00", link: "https://www.redbus.in/" },
    ],
  },
  "kolkata|guwahati": {
    from: "Kolkata",
    to: "Guwahati",
    options: [
      { mode: "train", operator: "Saraighat Express (12345)", price: 560, duration_min: 1050, departure: "15:50", arrival: "09:20", link: "https://www.irctc.co.in/" },
      { mode: "flight", operator: "IndiGo 6E-873", price: 3800, duration_min: 75, departure: "08:15", arrival: "09:30", link: "https://www.cleartrip.com/" },
      { mode: "bus", operator: "Private AC Sleeper", price: 1200, duration_min: 900, departure: "16:00", arrival: "07:00", link: "https://www.redbus.in/" },
    ],
  },
  "ahmedabad|surat": {
    from: "Ahmedabad",
    to: "Surat",
    options: [
      { mode: "train", operator: "Shatabdi Express (12010)", price: 380, duration_min: 165, departure: "14:35", arrival: "17:20", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Intercity Express (22954)", price: 150, duration_min: 210, departure: "06:00", arrival: "09:30", link: "https://www.confirmtkt.com/" },
      { mode: "bus", operator: "Volvo AC (Gujarat Travels)", price: 320, duration_min: 240, departure: "08:30", arrival: "12:30", link: "https://www.redbus.in/" },
    ],
  },
  "ahmedabad|vadodara": {
    from: "Ahmedabad",
    to: "Vadodara",
    options: [
      { mode: "train", operator: "Shatabdi Express (12010)", price: 250, duration_min: 95, departure: "14:35", arrival: "16:10", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Local Intercity", price: 90, duration_min: 120, departure: "07:15", arrival: "09:15", link: "https://www.confirmtkt.com/" },
      { mode: "bus", operator: "GSRTC AC", price: 150, duration_min: 120, departure: "09:00", arrival: "11:00", link: "https://www.redbus.in/" },
    ],
  },
  "ahmedabad|udaipur": {
    from: "Ahmedabad",
    to: "Udaipur",
    options: [
      { mode: "bus", operator: "Volvo AC Sleeper", price: 550, duration_min: 300, departure: "23:00", arrival: "04:00", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Ahmedabad-Udaipur Express (19943)", price: 240, duration_min: 300, departure: "22:35", arrival: "03:35", link: "https://www.confirmtkt.com/" },
    ],
  },
  "jaipur|jodhpur": {
    from: "Jaipur",
    to: "Jodhpur",
    options: [
      { mode: "train", operator: "Ranthambore Express (12465)", price: 260, duration_min: 300, departure: "17:20", arrival: "22:20", link: "https://www.irctc.co.in/" },
      { mode: "bus", operator: "RSRTC Volvo AC", price: 480, duration_min: 300, departure: "07:00", arrival: "12:00", link: "https://www.redbus.in/" },
      { mode: "flight", operator: "IndiGo 6E-7112", price: 3300, duration_min: 55, departure: "13:00", arrival: "13:55", link: "https://www.cleartrip.com/" },
    ],
  },
  "jaipur|agra": {
    from: "Jaipur",
    to: "Agra",
    options: [
      { mode: "bus", operator: "RSRTC Volvo AC", price: 420, duration_min: 270, departure: "08:00", arrival: "12:30", link: "https://www.redbus.in/" },
      { mode: "train", operator: "Jaipur-Agra Fort Express (12308)", price: 210, duration_min: 285, departure: "13:30", arrival: "18:15", link: "https://www.confirmtkt.com/" },
    ],
  },
  "lucknow|varanasi": {
    from: "Lucknow",
    to: "Varanasi",
    options: [
      { mode: "train", operator: "Varuna Express (14227)", price: 260, duration_min: 300, departure: "05:45", arrival: "10:45", link: "https://www.irctc.co.in/" },
      { mode: "bus", operator: "UPSRTC AC", price: 400, duration_min: 360, departure: "08:30", arrival: "14:30", link: "https://www.redbus.in/" },
      { mode: "flight", operator: "IndiGo 6E-7301", price: 3000, duration_min: 50, departure: "16:20", arrival: "17:10", link: "https://www.cleartrip.com/" },
    ],
  },
  "surat|vadodara": {
    from: "Surat",
    to: "Vadodara",
    options: [
      { mode: "train", operator: "Shatabdi Express (12010)", price: 210, duration_min: 75, departure: "17:22", arrival: "18:35", link: "https://www.irctc.co.in/" },
      { mode: "bus", operator: "GSRTC / private AC", price: 150, duration_min: 120, departure: "09:00", arrival: "11:00", link: "https://www.redbus.in/" },
    ],
  },
  "kochi|thiruvananthapuram": {
    from: "Kochi",
    to: "Thiruvananthapuram",
    options: [
      { mode: "train", operator: "Vande Bharat (20633)", price: 460, duration_min: 195, departure: "07:20", arrival: "10:35", link: "https://www.irctc.co.in/" },
      { mode: "train", operator: "Venad Express (16302)", price: 120, duration_min: 255, departure: "05:20", arrival: "09:35", link: "https://www.confirmtkt.com/" },
      { mode: "bus", operator: "KSRTC Super Fast", price: 220, duration_min: 270, departure: "08:00", arrival: "12:30", link: "https://www.redbus.in/" },
    ],
  },
};

function slugCity(s: string): string {
  return (s || "").trim().toLowerCase();
}

export function routeKey(from: string, to: string): string {
  return `${slugCity(from)}|${slugCity(to)}`;
}

// Returns the sample options for a route (either direction), or [] if unknown.
// Padded with a realistic spread of extra departures (see lib/densify.ts) so
// the time-of-day filters have something to bite on — deterministic per route.
export function getSampleOptions(from: string, to: string): RouteOption[] {
  const direct = ROUTES[routeKey(from, to)];
  if (direct) return densify(direct.options, direct.from, direct.to);
  const reversed = ROUTES[routeKey(to, from)];
  if (reversed) return densify(reversed.options, reversed.from, reversed.to);
  return [];
}

export function listSampleRoutes(): { from: string; to: string }[] {
  return Object.values(ROUTES).map((r) => ({ from: r.from, to: r.to }));
}

// Cheapest + fastest from sample data only — for the landing / route-card
// teasers, which must render instantly and never call a live provider.
export function sampleRouteSummary(
  from: string,
  to: string,
): { cheapest: RouteOption; fastest: RouteOption } | null {
  const opts = getSampleOptions(from, to);
  if (opts.length === 0) return null;
  return {
    cheapest: opts.reduce((a, b) => (a.price <= b.price ? a : b)),
    fastest: opts.reduce((a, b) => (a.duration_min <= b.duration_min ? a : b)),
  };
}
