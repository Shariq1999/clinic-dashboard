// Real preliminary operational dataset of the clinic
// Extracted directly from preliminary clinical workbook (Book1.xlsx)

export interface PreliminaryInvoiceData {
  srNo: number;
  invoiceNumber: string;
  timeOfBill: string;
  netAmt: number;
  umr: string;
  patientName: string;
  ageGender: string;
  personalContact: string;
}

// ----------------------------------------------------------------------
// 1. DAR AL SHIFA (BHINDI BAZAR) INVOICES (August - October 2026)
// Total Invoices: 164
// ----------------------------------------------------------------------
export const PRELIMINARY_DUS_INVOICES: PreliminaryInvoiceData[] = [
  {
    "srNo": 1,
    "invoiceNumber": "BILLSH-BZR2026-0001",
    "timeOfBill": "01 Aug 2026, 7:03 PM",
    "netAmt": 1253,
    "umr": "SAF26000040",
    "patientName": "Ms. Sarah Vahid Khan",
    "ageGender": "23Y / Female",
    "personalContact": "9004870441"
  },
  {
    "srNo": 2,
    "invoiceNumber": "BILLSH-BZR2026-0002",
    "timeOfBill": "01 Aug 2026, 7:13 PM",
    "netAmt": 1253,
    "umr": "DAS26000001",
    "patientName": "Ms. Sarah Vahid Khan",
    "ageGender": "23Y / Female",
    "personalContact": "9004870441"
  },
  {
    "srNo": 3,
    "invoiceNumber": "BILLSH-BZR2026-0003",
    "timeOfBill": "02 Aug 2026, 2:11 PM",
    "netAmt": 745,
    "umr": "DAS26000002",
    "patientName": "Ms. Insiyah Burhanuddin Hotelwala",
    "ageGender": "7Y / Female",
    "personalContact": "9920036752"
  },
  {
    "srNo": 4,
    "invoiceNumber": "BILLSH-BZR2026-0004",
    "timeOfBill": "03 Aug 2026, 3:19 PM",
    "netAmt": 750,
    "umr": "DAS26000003",
    "patientName": "Mr. Burhanuddin Ali Jawadwala",
    "ageGender": "28Y / Male",
    "personalContact": "8431616812"
  },
  {
    "srNo": 5,
    "invoiceNumber": "BILLSH-BZR2026-0005",
    "timeOfBill": "03 Aug 2026, 4:23 PM",
    "netAmt": 1925,
    "umr": "DAS26000004",
    "patientName": "Master. Burhanuddin Mustafa Dhanerawala",
    "ageGender": "10Y / Male",
    "personalContact": "9892507852"
  },
  {
    "srNo": 6,
    "invoiceNumber": "BILLSH-BZR2026-0006",
    "timeOfBill": "03 Aug 2026, 4:33 PM",
    "netAmt": 1253,
    "umr": "DAS26000005",
    "patientName": "Mr. Ali Akbar Shabbir Musaji",
    "ageGender": "38Y / Male",
    "personalContact": "8107861952"
  },
  {
    "srNo": 7,
    "invoiceNumber": "BILLSH-BZR2026-0007",
    "timeOfBill": "03 Aug 2026, 4:49 PM",
    "netAmt": 1253,
    "umr": "DAS26000006",
    "patientName": "Mr. Aliasgar Shabbir Patrawala",
    "ageGender": "29Y / Male",
    "personalContact": "7727075152"
  },
  {
    "srNo": 8,
    "invoiceNumber": "BILLSH-BZR2026-0009",
    "timeOfBill": "04 Aug 2026, 2:32 PM",
    "netAmt": 1253,
    "umr": "DAS26000008",
    "patientName": "Mr. Mustufa Huseni Burhani",
    "ageGender": "31Y / Male",
    "personalContact": "9574375534"
  },
  {
    "srNo": 9,
    "invoiceNumber": "BILLSH-BZR2026-0008",
    "timeOfBill": "04 Aug 2026, 9:12 AM",
    "netAmt": 1500,
    "umr": "DAS26000007",
    "patientName": "Mr. Yusuf Saifuddin Erenpurwala",
    "ageGender": "58Y / Male",
    "personalContact": "9819678215"
  },
  {
    "srNo": 10,
    "invoiceNumber": "BILLSH-BZR2026-0010",
    "timeOfBill": "05 Aug 2026, 4:41 PM",
    "netAmt": 200,
    "umr": "DAS26000009",
    "patientName": "Mr. Abdul Kader Fakhruddin Lokhandwala",
    "ageGender": "51Y / Male",
    "personalContact": "7039795253"
  },
  {
    "srNo": 11,
    "invoiceNumber": "BILLSH-BZR2026-0011",
    "timeOfBill": "06 Aug 2026, 12:43 PM",
    "netAmt": 115,
    "umr": "DAS26000010",
    "patientName": "Mr. Siraj Abbas Mukarram",
    "ageGender": "68Y / Male",
    "personalContact": "8297204257"
  },
  {
    "srNo": 12,
    "invoiceNumber": "BILLSH-BZR2026-0012",
    "timeOfBill": "10 Aug 2026, 2:45 PM",
    "netAmt": 4781,
    "umr": "DAS26000011",
    "patientName": "Mrs. Rashida Saifuddin Arsiwala",
    "ageGender": "77Y / Female",
    "personalContact": "9819995626"
  },
  {
    "srNo": 13,
    "invoiceNumber": "BILLSH-BZR2026-0013",
    "timeOfBill": "11 Aug 2026, 10:25 AM",
    "netAmt": 250,
    "umr": "DAS26000012",
    "patientName": "Mrs. Tasneem Mohammed Modi",
    "ageGender": "52Y / Female",
    "personalContact": "9769620244"
  },
  {
    "srNo": 14,
    "invoiceNumber": "BILLSH-BZR2026-0014",
    "timeOfBill": "12 Aug 2026, 2:34 PM",
    "netAmt": 3045,
    "umr": "DAS26000013",
    "patientName": "Mrs. Havra Shabbir Hajoori",
    "ageGender": "31Y / Female",
    "personalContact": "9923749527"
  },
  {
    "srNo": 15,
    "invoiceNumber": "BILLSH-BZR2026-0015",
    "timeOfBill": "13 Aug 2026, 9:00 AM",
    "netAmt": 1253,
    "umr": "DAS26000015",
    "patientName": "Mr. Subhashchandra Ram Surat Yadav",
    "ageGender": "46Y / Male",
    "personalContact": "9076202487"
  },
  {
    "srNo": 16,
    "invoiceNumber": "BILLSH-BZR2026-0017",
    "timeOfBill": "14 Aug 2026, 11:34 AM",
    "netAmt": 750,
    "umr": "DAS26000017",
    "patientName": "Ms. Nafisa Shabbir Sial",
    "ageGender": "69Y / Female",
    "personalContact": "9820115291"
  },
  {
    "srNo": 17,
    "invoiceNumber": "BILLSH-BZR2026-0018",
    "timeOfBill": "14 Aug 2026, 11:45 AM",
    "netAmt": 750,
    "umr": "DAS26000018",
    "patientName": "Ms. Maimuna Abbasali Udaipurwala",
    "ageGender": "67Y / Female",
    "personalContact": "9619655995"
  },
  {
    "srNo": 18,
    "invoiceNumber": "BILLSH-BZR2026-0019",
    "timeOfBill": "14 Aug 2026, 2:33 PM",
    "netAmt": 115,
    "umr": "DAS26000010",
    "patientName": "Mr. Siraj Abbas Mukarram",
    "ageGender": "68Y / Male",
    "personalContact": "8297204257"
  },
  {
    "srNo": 19,
    "invoiceNumber": "BILLSH-BZR2026-0016",
    "timeOfBill": "14 Aug 2026, 9:37 AM",
    "netAmt": 1253,
    "umr": "DAS26000016",
    "patientName": "Mr. Ebrahim Soni Hashim",
    "ageGender": "77Y / Male",
    "personalContact": "9867889066"
  },
  {
    "srNo": 20,
    "invoiceNumber": "BILLSH-BZR2026-0020",
    "timeOfBill": "18 Aug 2026, 10:28 AM",
    "netAmt": 3055,
    "umr": "DAS26000019",
    "patientName": "Mrs. Sherbanu Rajabali Dossaji",
    "ageGender": "68Y / Female",
    "personalContact": "2556864593"
  },
  {
    "srNo": 21,
    "invoiceNumber": "BILLSH-BZR2026-0021",
    "timeOfBill": "18 Aug 2026, 11:58 AM",
    "netAmt": 2900,
    "umr": "DAS26000019",
    "patientName": "Mrs. Sherbanu Rajabali Dossaji",
    "ageGender": "68Y / Female",
    "personalContact": "686459397"
  },
  {
    "srNo": 22,
    "invoiceNumber": "BILLSH-BZR2026-0022",
    "timeOfBill": "19 Aug 2026, 3:59 PM",
    "netAmt": 1000,
    "umr": "DAS26000020",
    "patientName": "Ms. Mariyam Abdul Kader Hakam",
    "ageGender": "61Y / Female",
    "personalContact": "8652580912"
  },
  {
    "srNo": 23,
    "invoiceNumber": "BILLSH-BZR2026-0023",
    "timeOfBill": "21 Aug 2026, 12:04 PM",
    "netAmt": 200,
    "umr": "DAS26000021",
    "patientName": "Ms. Munira Valisaheb",
    "ageGender": "22Y / Female",
    "personalContact": "9950206972"
  },
  {
    "srNo": 24,
    "invoiceNumber": "BILLSH-BZR2026-0024",
    "timeOfBill": "21 Aug 2026, 12:11 PM",
    "netAmt": 280,
    "umr": "DAS26000022",
    "patientName": "Mrs. Tahera Abbasibhai Rangwala",
    "ageGender": "43Y / Female",
    "personalContact": "7203918853"
  },
  {
    "srNo": 25,
    "invoiceNumber": "BILLSH-BZR2026-0025",
    "timeOfBill": "22 Aug 2026, 12:50 PM",
    "netAmt": 1815,
    "umr": "DAS26000024",
    "patientName": "Mr. Adnan Ali . Madarwala",
    "ageGender": "34Y / Male",
    "personalContact": "9537146252"
  },
  {
    "srNo": 26,
    "invoiceNumber": "BILLSH-BZR2026-0026",
    "timeOfBill": "24 Aug 2026, 12:18 PM",
    "netAmt": 750,
    "umr": "DAS26000025",
    "patientName": "Mrs. Khatija Juzer Tinwala",
    "ageGender": "33Y / Female",
    "personalContact": "8889568352"
  },
  {
    "srNo": 27,
    "invoiceNumber": "BILLSH-BZR2026-0027",
    "timeOfBill": "24 Aug 2026, 4:34 PM",
    "netAmt": 1200,
    "umr": "DAS26000026",
    "patientName": "Mrs. Fatema Ali Akber Taksalwala",
    "ageGender": "46Y / Female",
    "personalContact": "8003317868"
  },
  {
    "srNo": 28,
    "invoiceNumber": "BILLSH-BZR2026-0028",
    "timeOfBill": "25 Aug 2026, 3:37 PM",
    "netAmt": 115,
    "umr": "DAS26000027",
    "patientName": "Mrs. Sakina Burhanuddin Modi",
    "ageGender": "30Y / Female",
    "personalContact": "9867952452"
  },
  {
    "srNo": 29,
    "invoiceNumber": "BILLSH-BZR2026-0029",
    "timeOfBill": "26 Aug 2026, 3:12 PM",
    "netAmt": 1595,
    "umr": "DAS26000028",
    "patientName": "Mrs. Zahabiya Juzer Chitalwala",
    "ageGender": "31Y / Female",
    "personalContact": "9664507610"
  },
  {
    "srNo": 30,
    "invoiceNumber": "BILLSH-BZR2026-0031",
    "timeOfBill": "27 Aug 2026, 1:59 PM",
    "netAmt": 4599,
    "umr": "DAS26000030",
    "patientName": "Mr. Burhanuddin Hasan Nahar",
    "ageGender": "6Y / Male",
    "personalContact": "9033028510"
  },
  {
    "srNo": 31,
    "invoiceNumber": "BILLSH-BZR2026-0030",
    "timeOfBill": "27 Aug 2026, 11:01 AM",
    "netAmt": 3955,
    "umr": "DAS26000029",
    "patientName": "Mrs. Zainab Hatim Suwasrawala",
    "ageGender": "22Y / Female",
    "personalContact": "7891752531"
  },
  {
    "srNo": 32,
    "invoiceNumber": "BILLSH-BZR2026-0032",
    "timeOfBill": "28 Aug 2026, 4:42 PM",
    "netAmt": 1815,
    "umr": "DAS26000031",
    "patientName": "Ms. Munira Huzefa Baldiwala",
    "ageGender": "16Y / Female",
    "personalContact": "9322241028"
  },
  {
    "srNo": 33,
    "invoiceNumber": "BILLSH-BZR2026-0033",
    "timeOfBill": "29 Aug 2026, 5:38 PM",
    "netAmt": 1253,
    "umr": "DAS26000032",
    "patientName": "Mrs. Anjumara Malkani",
    "ageGender": "48Y / Female",
    "personalContact": "9867405717"
  },
  {
    "srNo": 34,
    "invoiceNumber": "BILLSH-BZR2026-0034",
    "timeOfBill": "31 Aug 2026, 12:12 PM",
    "netAmt": 115,
    "umr": "DAS26000010",
    "patientName": "Mr. Siraj Abbas Mukarram",
    "ageGender": "68Y / Male",
    "personalContact": "8297204257"
  },
  {
    "srNo": 35,
    "invoiceNumber": "BILLSH-BZR2026-0035",
    "timeOfBill": "02 Sep 2026, 12:40 PM",
    "netAmt": 2025,
    "umr": "DAS26000033",
    "patientName": "Mrs. Shehrebano Idris Safdari",
    "ageGender": "41Y / Female",
    "personalContact": "9820764494"
  },
  {
    "srNo": 36,
    "invoiceNumber": "BILLSH-BZR2026-0036",
    "timeOfBill": "03 Sep 2026, 12:11 PM",
    "netAmt": 1253,
    "umr": "DAS26000034",
    "patientName": "Mrs. Batul Husain Bhanpurwala",
    "ageGender": "33Y / Female",
    "personalContact": "7666542551"
  },
  {
    "srNo": 37,
    "invoiceNumber": "BILLSH-BZR2026-0037",
    "timeOfBill": "03 Sep 2026, 12:33 PM",
    "netAmt": 2545,
    "umr": "DAS26000035",
    "patientName": "Mr. Husain Shabbir Bhanpurawala",
    "ageGender": "38Y / Male",
    "personalContact": "9699078652"
  },
  {
    "srNo": 38,
    "invoiceNumber": "BILLSH-BZR2026-0038",
    "timeOfBill": "04 Sep 2026, 4:41 PM",
    "netAmt": 2823,
    "umr": "DAS26000036",
    "patientName": "Mrs. Farida Fakhruddin Noori",
    "ageGender": "76Y / Female",
    "personalContact": "9819135440"
  },
  {
    "srNo": 39,
    "invoiceNumber": "BILLSH-BZR2026-0039",
    "timeOfBill": "04 Sep 2026, 5:16 PM",
    "netAmt": 750,
    "umr": "DAS26000037",
    "patientName": "Mrs. Raziya Murtaza Electrician",
    "ageGender": "46Y / Female",
    "personalContact": "555529785"
  },
  {
    "srNo": 40,
    "invoiceNumber": "BILLSH-BZR2026-0041",
    "timeOfBill": "07 Sep 2026, 4:13 PM",
    "netAmt": 1780,
    "umr": "DAS26000036",
    "patientName": "Mrs. Farida Fakhruddin Noori",
    "ageGender": "76Y / Female",
    "personalContact": "9819135440"
  },
  {
    "srNo": 41,
    "invoiceNumber": "BILLSH-BZR2026-0040",
    "timeOfBill": "07 Sep 2026, 9:51 AM",
    "netAmt": 1945,
    "umr": "DAS26000041",
    "patientName": "Mr. Shabbir Taher Nalwala",
    "ageGender": "51Y / Male",
    "personalContact": "9820252877"
  },
  {
    "srNo": 42,
    "invoiceNumber": "BILLSH-BZR2026-0043",
    "timeOfBill": "08 Sep 2026, 11:17 AM",
    "netAmt": 1815,
    "umr": "DAS26000047",
    "patientName": "Mr. Saifuddin Mohd Hussain Presswala",
    "ageGender": "76Y / Male",
    "personalContact": "9769710605"
  },
  {
    "srNo": 43,
    "invoiceNumber": "BILLSH-BZR2026-0044",
    "timeOfBill": "08 Sep 2026, 5:06 PM",
    "netAmt": 750,
    "umr": "DAS26000048",
    "patientName": "Mrs. Sakina Abbas Haveliwala",
    "ageGender": "66Y / Female",
    "personalContact": "9819931764"
  },
  {
    "srNo": 44,
    "invoiceNumber": "BILLSH-BZR2026-0042",
    "timeOfBill": "08 Sep 2026, 9:39 AM",
    "netAmt": 2743,
    "umr": "DAS26000046",
    "patientName": "Mrs. Shaheda Naushad Khan",
    "ageGender": "71Y / Female",
    "personalContact": "7977273325"
  },
  {
    "srNo": 45,
    "invoiceNumber": "BILLSH-BZR2026-0045",
    "timeOfBill": "09 Sep 2026, 2:12 PM",
    "netAmt": 680,
    "umr": "DAS26000049",
    "patientName": "Mrs. Burhanuddin Fatema Shakir",
    "ageGender": "27Y / Female",
    "personalContact": "8888999752"
  },
  {
    "srNo": 46,
    "invoiceNumber": "BILLSH-BZR2026-0046",
    "timeOfBill": "09 Sep 2026, 4:22 PM",
    "netAmt": 1780,
    "umr": "DAS26000036",
    "patientName": "Mrs. Farida Fakhruddin Noori",
    "ageGender": "76Y / Female",
    "personalContact": "9819135440"
  },
  {
    "srNo": 47,
    "invoiceNumber": "BILLSH-BZR2026-0047",
    "timeOfBill": "10 Sep 2026, 2:26 PM",
    "netAmt": 2005,
    "umr": "DAS26000027",
    "patientName": "Mrs. Sakina Burhanuddin Modi",
    "ageGender": "25Y / Female",
    "personalContact": "9867952452"
  },
  {
    "srNo": 48,
    "invoiceNumber": "BILLSH-BZR2026-0048",
    "timeOfBill": "11 Sep 2026, 10:31 AM",
    "netAmt": 200,
    "umr": "DAS26000050",
    "patientName": "Ms. Rashida Shabbir Vaglawala",
    "ageGender": "71Y / Female",
    "personalContact": "8369014772"
  },
  {
    "srNo": 49,
    "invoiceNumber": "BILLSH-BZR2026-0049",
    "timeOfBill": "11 Sep 2026, 11:15 AM",
    "netAmt": 1700,
    "umr": "DAS26000046",
    "patientName": "Mrs. Shaheda Naushad Khan",
    "ageGender": "71Y / Female",
    "personalContact": "7977273325"
  },
  {
    "srNo": 50,
    "invoiceNumber": "BILLSH-BZR2026-0050",
    "timeOfBill": "11 Sep 2026, 4:43 PM",
    "netAmt": 6075,
    "umr": "DAS26000051",
    "patientName": "Ms. Aamena Moiz Vaziri",
    "ageGender": "20Y / Female",
    "personalContact": "9082544131"
  },
  {
    "srNo": 51,
    "invoiceNumber": "BILLSH-BZR2026-0051",
    "timeOfBill": "12 Sep 2026, 12:49 PM",
    "netAmt": 500,
    "umr": "DAS26000053",
    "patientName": "Mrs. Khatija Miqdad Ali Kabuliwala",
    "ageGender": "66Y / Female",
    "personalContact": "7506180452"
  },
  {
    "srNo": 52,
    "invoiceNumber": "BILLSH-BZR2026-0052",
    "timeOfBill": "12 Sep 2026, 4:30 PM",
    "netAmt": 1780,
    "umr": "DAS26000036",
    "patientName": "Mrs. Farida Fakhruddin Noori",
    "ageGender": "76Y / Female",
    "personalContact": "9819135440"
  },
  {
    "srNo": 53,
    "invoiceNumber": "BILLSH-BZR2026-0053",
    "timeOfBill": "12 Sep 2026, 4:50 PM",
    "netAmt": 230,
    "umr": "DAS26000057",
    "patientName": "Mrs. Zainab Kutubkhan Tayabali",
    "ageGender": "41Y / Female",
    "personalContact": "8169190360"
  },
  {
    "srNo": 54,
    "invoiceNumber": "BILLSH-BZR2026-0054",
    "timeOfBill": "15 Sep 2026, 12:20 PM",
    "netAmt": 1700,
    "umr": "DAS26000046",
    "patientName": "Mrs. Shaheda Naushad Khan",
    "ageGender": "71Y / Female",
    "personalContact": "7977273325"
  },
  {
    "srNo": 55,
    "invoiceNumber": "BILLSH-BZR2026-0055",
    "timeOfBill": "15 Sep 2026, 2:29 PM",
    "netAmt": 2743,
    "umr": "DAS26000058",
    "patientName": "Mr. Mohd Yusuf Mohd Essa Patel",
    "ageGender": "63Y / Male",
    "personalContact": "9167309086"
  },
  {
    "srNo": 56,
    "invoiceNumber": "BILLSH-BZR2026-0056",
    "timeOfBill": "15 Sep 2026, 3:59 PM",
    "netAmt": 2398,
    "umr": "DAS26000036",
    "patientName": "Mrs. Farida Fakhruddin Noori",
    "ageGender": "76Y / Female",
    "personalContact": "9819135440"
  },
  {
    "srNo": 57,
    "invoiceNumber": "BILLSH-BZR2026-0057",
    "timeOfBill": "16 Sep 2026, 12:11 PM",
    "netAmt": 500,
    "umr": "DAS26000053",
    "patientName": "Mrs. Khatija Miqdad Ali Kabuliwala",
    "ageGender": "66Y / Female",
    "personalContact": "7506180452"
  },
  {
    "srNo": 58,
    "invoiceNumber": "BILLSH-BZR2026-0058",
    "timeOfBill": "17 Sep 2026, 12:07 PM",
    "netAmt": 500,
    "umr": "DAS26000059",
    "patientName": "Mrs. Nafisa Shabbir Saria",
    "ageGender": "76Y / Female",
    "personalContact": "9833546252"
  },
  {
    "srNo": 59,
    "invoiceNumber": "BILLSH-BZR2026-0059",
    "timeOfBill": "17 Sep 2026, 2:53 PM",
    "netAmt": 1700,
    "umr": "DAS26000058",
    "patientName": "Mr. Mohd Yusuf Mohd Essa Patel",
    "ageGender": "63Y / Male",
    "personalContact": "9167309086"
  },
  {
    "srNo": 60,
    "invoiceNumber": "BILLSH-BZR2026-0060",
    "timeOfBill": "17 Sep 2026, 3:14 PM",
    "netAmt": 1860,
    "umr": "DAS26000036",
    "patientName": "Mrs. Farida Fakhruddin Noori",
    "ageGender": "76Y / Female",
    "personalContact": "9819135440"
  },
  {
    "srNo": 61,
    "invoiceNumber": "BILLSH-BZR2026-0066",
    "timeOfBill": "18 Sep 2026, 1:46 PM",
    "netAmt": 500,
    "umr": "DAS26000063",
    "patientName": "Mr. Imdadali Inayatali Mukadam",
    "ageGender": "72Y / Male",
    "personalContact": "7977389521"
  },
  {
    "srNo": 62,
    "invoiceNumber": "BILLSH-BZR2026-0062",
    "timeOfBill": "18 Sep 2026, 10:15 AM",
    "netAmt": 500,
    "umr": "DAS26000053",
    "patientName": "Mrs. Khatija Miqdad Ali Kabuliwala",
    "ageGender": "66Y / Female",
    "personalContact": "7506180452"
  },
  {
    "srNo": 63,
    "invoiceNumber": "BILLSH-BZR2026-0063",
    "timeOfBill": "18 Sep 2026, 11:38 AM",
    "netAmt": 1700,
    "umr": "DAS26000046",
    "patientName": "Mrs. Shaheda Naushad Khan",
    "ageGender": "71Y / Female",
    "personalContact": "7977273325"
  },
  {
    "srNo": 64,
    "invoiceNumber": "BILLSH-BZR2026-0064",
    "timeOfBill": "18 Sep 2026, 11:42 AM",
    "netAmt": 500,
    "umr": "DAS26000059",
    "patientName": "Mrs. Nafisa Shabbir Saria",
    "ageGender": "76Y / Female",
    "personalContact": "9833546252"
  },
  {
    "srNo": 65,
    "invoiceNumber": "BILLSH-BZR2026-0065",
    "timeOfBill": "18 Sep 2026, 12:26 PM",
    "netAmt": 2005,
    "umr": "DAS26000061",
    "patientName": "Mrs. Arwa Mohammed Lokhandwala",
    "ageGender": "26Y / Female",
    "personalContact": "9619053319"
  },
  {
    "srNo": 66,
    "invoiceNumber": "BILLSH-BZR2026-0061",
    "timeOfBill": "18 Sep 2026, 9:29 AM",
    "netAmt": 750,
    "umr": "DAS26000060",
    "patientName": "Mr. Shabbir Yusufali Kanorwala",
    "ageGender": "32Y / Male",
    "personalContact": "9820772082"
  },
  {
    "srNo": 67,
    "invoiceNumber": "BILLSH-BZR2026-0068",
    "timeOfBill": "19 Sep 2026, 11:29 AM",
    "netAmt": 500,
    "umr": "DAS26000059",
    "patientName": "Mrs. Nafisa Shabbir Saria",
    "ageGender": "76Y / Female",
    "personalContact": "9833546252"
  },
  {
    "srNo": 68,
    "invoiceNumber": "BILLSH-BZR2026-0069",
    "timeOfBill": "19 Sep 2026, 2:50 PM",
    "netAmt": 500,
    "umr": "DAS26000053",
    "patientName": "Mrs. Khatija Miqdad Ali Kabuliwala",
    "ageGender": "66Y / Female",
    "personalContact": "7506180452"
  },
  {
    "srNo": 69,
    "invoiceNumber": "BILLSH-BZR2026-0070",
    "timeOfBill": "19 Sep 2026, 3:14 PM",
    "netAmt": 1700,
    "umr": "DAS26000058",
    "patientName": "Mr. Mohd Yusuf Mohd Essa Patel",
    "ageGender": "63Y / Male",
    "personalContact": "9167309086"
  },
  {
    "srNo": 70,
    "invoiceNumber": "BILLSH-BZR2026-0071",
    "timeOfBill": "19 Sep 2026, 4:39 PM",
    "netAmt": 2823,
    "umr": "DAS26000036",
    "patientName": "Mrs. Farida Fakhruddin Noori",
    "ageGender": "76Y / Female",
    "personalContact": "9819135440"
  },
  {
    "srNo": 71,
    "invoiceNumber": "BILLSH-BZR2026-0067",
    "timeOfBill": "19 Sep 2026, 9:26 AM",
    "netAmt": 500,
    "umr": "DAS26000063",
    "patientName": "Mr. Imdadali Inayatali Mukadam",
    "ageGender": "72Y / Male",
    "personalContact": "7977389521"
  },
  {
    "srNo": 72,
    "invoiceNumber": "BILLSH-BZR2026-0073",
    "timeOfBill": "21 Sep 2026, 10:22 AM",
    "netAmt": 2655,
    "umr": "DAS26000058",
    "patientName": "Mr. Mohd Yusuf Mohd Essa Patel",
    "ageGender": "63Y / Male",
    "personalContact": "9167309086"
  },
  {
    "srNo": 73,
    "invoiceNumber": "BILLSH-BZR2026-0074",
    "timeOfBill": "21 Sep 2026, 11:10 AM",
    "netAmt": 500,
    "umr": "DAS26000059",
    "patientName": "Mrs. Nafisa Shabbir Saria",
    "ageGender": "76Y / Female",
    "personalContact": "9833546252"
  },
  {
    "srNo": 74,
    "invoiceNumber": "BILLSH-BZR2026-0075",
    "timeOfBill": "21 Sep 2026, 4:13 PM",
    "netAmt": 500,
    "umr": "DAS26000053",
    "patientName": "Mrs. Khatija Miqdad Ali Kabuliwala",
    "ageGender": "66Y / Female",
    "personalContact": "7506180452"
  },
  {
    "srNo": 75,
    "invoiceNumber": "BILLSH-BZR2026-0072",
    "timeOfBill": "21 Sep 2026, 9:27 AM",
    "netAmt": 500,
    "umr": "DAS26000063",
    "patientName": "Mr. Imdadali Inayatali Mukadam",
    "ageGender": "72Y / Male",
    "personalContact": "7977389521"
  },
  {
    "srNo": 76,
    "invoiceNumber": "BILLSH-BZR2026-0076",
    "timeOfBill": "22 Sep 2026, 10:34 AM",
    "netAmt": 750,
    "umr": "DAS26000074",
    "patientName": "Mr. Gulamali M. Abbas Tambawala",
    "ageGender": "54Y / Male",
    "personalContact": "9987843551"
  },
  {
    "srNo": 77,
    "invoiceNumber": "BILLSH-BZR2026-0077",
    "timeOfBill": "22 Sep 2026, 11:46 AM",
    "netAmt": 295,
    "umr": "DAS26000075",
    "patientName": "Mrs. Khadija Mustafa Mulla",
    "ageGender": "65Y / Female",
    "personalContact": "9136728753"
  },
  {
    "srNo": 78,
    "invoiceNumber": "BILLSH-BZR2026-0078",
    "timeOfBill": "22 Sep 2026, 11:49 AM",
    "netAmt": 1625,
    "umr": "DAS26000075",
    "patientName": "Mrs. Khadija Mustafa Mulla",
    "ageGender": "65Y / Female",
    "personalContact": "9136728753"
  },
  {
    "srNo": 79,
    "invoiceNumber": "BILLSH-BZR2026-0079",
    "timeOfBill": "22 Sep 2026, 12:15 PM",
    "netAmt": 500,
    "umr": "DAS26000059",
    "patientName": "Mrs. Nafisa Shabbir Saria",
    "ageGender": "76Y / Female",
    "personalContact": "9833546252"
  },
  {
    "srNo": 80,
    "invoiceNumber": "BILLSH-BZR2026-0080",
    "timeOfBill": "22 Sep 2026, 3:10 PM",
    "netAmt": 500,
    "umr": "DAS26000053",
    "patientName": "Mrs. Khatija Miqdad Ali Kabuliwala",
    "ageGender": "66Y / Female",
    "personalContact": "7506180452"
  },
  {
    "srNo": 81,
    "invoiceNumber": "BILLSH-BZR2026-0081",
    "timeOfBill": "22 Sep 2026, 4:39 PM",
    "netAmt": 1780,
    "umr": "DAS26000036",
    "patientName": "Mrs. Farida Fakhruddin Noori",
    "ageGender": "76Y / Female",
    "personalContact": "9819135440"
  },
  {
    "srNo": 82,
    "invoiceNumber": "BILLSH-BZR2026-0082",
    "timeOfBill": "23 Sep 2026, 9:49 AM",
    "netAmt": 3240,
    "umr": "DAS26000068",
    "patientName": "Mr. Shabbir Qutbuddin Tayabali",
    "ageGender": "44Y / Male",
    "personalContact": "8169190360"
  },
  {
    "srNo": 83,
    "invoiceNumber": "BILLSH-BZR2026-0083",
    "timeOfBill": "24 Sep 2026, 3:19 PM",
    "netAmt": 1815,
    "umr": "DAS26000058",
    "patientName": "Mr. Mohd Yusuf Mohd Essa Patel",
    "ageGender": "63Y / Male",
    "personalContact": "9167309086"
  },
  {
    "srNo": 84,
    "invoiceNumber": "BILLSH-BZR2026-0084",
    "timeOfBill": "24 Sep 2026, 3:58 PM",
    "netAmt": 1780,
    "umr": "DAS26000036",
    "patientName": "Mrs. Farida Fakhruddin Noori",
    "ageGender": "76Y / Female",
    "personalContact": "9819135440"
  },
  {
    "srNo": 85,
    "invoiceNumber": "BILLSH-BZR2026-0085",
    "timeOfBill": "26 Sep 2026, 8:17 AM",
    "netAmt": 2885,
    "umr": "DAS26000078",
    "patientName": "Mrs. Sakina Mohammed Rampurawala",
    "ageGender": "23Y / Female",
    "personalContact": "7498340752"
  },
  {
    "srNo": 86,
    "invoiceNumber": "BILLSH-BZR2026-0086",
    "timeOfBill": "26 Sep 2026, 9:55 AM",
    "netAmt": 1700,
    "umr": "DAS26000058",
    "patientName": "Mr. Mohd Yusuf Mohd Essa Patel",
    "ageGender": "63Y / Male",
    "personalContact": "9167309086"
  },
  {
    "srNo": 87,
    "invoiceNumber": "BILLSH-BZR2026-0087",
    "timeOfBill": "28 Sep 2026, 3:41 PM",
    "netAmt": 115,
    "umr": "DAS26000077",
    "patientName": "Mrs. Rashida Abitamim Miakhan",
    "ageGender": "66Y / Female",
    "personalContact": "7506319163"
  },
  {
    "srNo": 88,
    "invoiceNumber": "BILLSH-BZR2026-0088",
    "timeOfBill": "28 Sep 2026, 4:34 PM",
    "netAmt": 1780,
    "umr": "DAS26000036",
    "patientName": "Mrs. Farida Fakhruddin Noori",
    "ageGender": "76Y / Female",
    "personalContact": "9819135440"
  },
  {
    "srNo": 89,
    "invoiceNumber": "BILLSH-BZR2026-0090",
    "timeOfBill": "29 Sep 2026, 2:48 PM",
    "netAmt": 865,
    "umr": "DAS26000053",
    "patientName": "Mrs. Khatija Miqdad Ali Kabuliwala",
    "ageGender": "66Y / Female",
    "personalContact": "7506180452"
  },
  {
    "srNo": 90,
    "invoiceNumber": "BILLSH-BZR2026-0089",
    "timeOfBill": "29 Sep 2026, 8:38 AM",
    "netAmt": 1665,
    "umr": "DAS26000084",
    "patientName": "Dr. Khuzema S Fatehi",
    "ageGender": "38Y / Male",
    "personalContact": "9619069152"
  },
  {
    "srNo": 91,
    "invoiceNumber": "BILLSH-BZR2026-0091",
    "timeOfBill": "30 Sep 2026, 10:39 AM",
    "netAmt": 750,
    "umr": "DAS26000018",
    "patientName": "Ms. Maimuna Abbasali Udaipurwala",
    "ageGender": "67Y / Female",
    "personalContact": "9619655995"
  },
  {
    "srNo": 92,
    "invoiceNumber": "BILLSH-BZR2026-0092",
    "timeOfBill": "30 Sep 2026, 4:05 PM",
    "netAmt": 1780,
    "umr": "DAS26000036",
    "patientName": "Mrs. Farida Fakhruddin Noori",
    "ageGender": "76Y / Female",
    "personalContact": "9819135440"
  },
  {
    "srNo": 93,
    "invoiceNumber": "BILLSH-BZR2026-0095",
    "timeOfBill": "01 Oct 2026, 12:03 PM",
    "netAmt": 2743,
    "umr": "DAS26000058",
    "patientName": "Mr. Mohd Yusuf Mohd Essa Patel",
    "ageGender": "63Y / Male",
    "personalContact": "9167309086"
  },
  {
    "srNo": 94,
    "invoiceNumber": "BILLSH-BZR2026-0093",
    "timeOfBill": "01 Oct 2026, 9:43 AM",
    "netAmt": 1700,
    "umr": "DAS26000058",
    "patientName": "Mr. Mohd Yusuf Mohd Essa Patel",
    "ageGender": "63Y / Male",
    "personalContact": "9167309086"
  },
  {
    "srNo": 95,
    "invoiceNumber": "BILLSH-BZR2026-0096",
    "timeOfBill": "03 Oct 2026, 10:25 AM",
    "netAmt": 810,
    "umr": "DAS26000057",
    "patientName": "Mrs. Zainab Kutubkhan Tayabali",
    "ageGender": "41Y / Female",
    "personalContact": "8169190360"
  },
  {
    "srNo": 96,
    "invoiceNumber": "BILLSH-BZR2026-0097",
    "timeOfBill": "03 Oct 2026, 10:35 AM",
    "netAmt": 210,
    "umr": "DAS26000057",
    "patientName": "Mrs. Zainab Kutubkhan Tayabali",
    "ageGender": "41Y / Female",
    "personalContact": "8169190360"
  },
  {
    "srNo": 97,
    "invoiceNumber": "BILLSH-BZR2026-0098",
    "timeOfBill": "03 Oct 2026, 3:54 PM",
    "netAmt": 200,
    "umr": "DAS26000091",
    "patientName": "Mr. Hozefa Abdul Kader Kapasi",
    "ageGender": "36Y / Male",
    "personalContact": "9764962879"
  },
  {
    "srNo": 98,
    "invoiceNumber": "BILLSH-BZR2026-0104",
    "timeOfBill": "05 Oct 2026, 1:08 PM",
    "netAmt": 1533,
    "umr": "DAS26000094",
    "patientName": "Mr. Abdeali N Nagarwala",
    "ageGender": "51Y / Male",
    "personalContact": "8180012153"
  },
  {
    "srNo": 99,
    "invoiceNumber": "BILLSH-BZR2026-0101",
    "timeOfBill": "05 Oct 2026, 10:15 AM",
    "netAmt": 1700,
    "umr": "DAS26000058",
    "patientName": "Mr. Mohd Yusuf Mohd Essa Patel",
    "ageGender": "63Y / Male",
    "personalContact": "9167309086"
  },
  {
    "srNo": 100,
    "invoiceNumber": "BILLSH-BZR2026-0102",
    "timeOfBill": "05 Oct 2026, 10:16 AM",
    "netAmt": 1700,
    "umr": "DAS26000058",
    "patientName": "Mr. Mohd Yusuf Mohd Essa Patel",
    "ageGender": "63Y / Male",
    "personalContact": "9167309086"
  },
  {
    "srNo": 101,
    "invoiceNumber": "BILLSH-BZR2026-0103",
    "timeOfBill": "05 Oct 2026, 12:54 PM",
    "netAmt": 1533,
    "umr": "DAS26000093",
    "patientName": "Mrs. Sakina Abdeali Nagarwala",
    "ageGender": "50Y / Female",
    "personalContact": "9987509553"
  },
  {
    "srNo": 102,
    "invoiceNumber": "BILLSH-BZR2026-0099",
    "timeOfBill": "05 Oct 2026, 8:47 AM",
    "netAmt": 1210,
    "umr": "DAS26000084",
    "patientName": "Dr. Khuzema S Fatehi",
    "ageGender": "38Y / Male",
    "personalContact": "9619069152"
  },
  {
    "srNo": 103,
    "invoiceNumber": "BILLSH-BZR2026-0100",
    "timeOfBill": "05 Oct 2026, 8:51 AM",
    "netAmt": 1490,
    "umr": "DAS26000092",
    "patientName": "Mr. Saifuddin Fatehi S",
    "ageGender": "74Y / Male",
    "personalContact": "9619069152"
  },
  {
    "srNo": 104,
    "invoiceNumber": "BILLSH-BZR2026-0105",
    "timeOfBill": "06 Oct 2026, 1:16 PM",
    "netAmt": 3125,
    "umr": "DAS26000098",
    "patientName": "Mrs. Fatima Hussain",
    "ageGender": "52Y / Female",
    "personalContact": "1713240185"
  },
  {
    "srNo": 105,
    "invoiceNumber": "BILLSH-BZR2026-0106",
    "timeOfBill": "06 Oct 2026, 2:13 PM",
    "netAmt": 2555,
    "umr": "DAS26000036",
    "patientName": "Mrs. Farida Fakhruddin Noori",
    "ageGender": "76Y / Female",
    "personalContact": "9819135440"
  },
  {
    "srNo": 106,
    "invoiceNumber": "BILLSH-BZR2026-0107",
    "timeOfBill": "06 Oct 2026, 4:23 PM",
    "netAmt": 4883,
    "umr": "DAS26000036",
    "patientName": "Mrs. Farida Fakhruddin Noori",
    "ageGender": "76Y / Female",
    "personalContact": "9819135440"
  },
  {
    "srNo": 107,
    "invoiceNumber": "BILLSH-BZR2026-0109",
    "timeOfBill": "07 Oct 2026, 1:07 PM",
    "netAmt": 400,
    "umr": "DAS26000103",
    "patientName": "Mr. Burhanuddin Husen Ujjainwala",
    "ageGender": "10Y / Male",
    "personalContact": "9982655995"
  },
  {
    "srNo": 108,
    "invoiceNumber": "BILLSH-BZR2026-0108",
    "timeOfBill": "07 Oct 2026, 12:25 PM",
    "netAmt": 1145,
    "umr": "DAS26000102",
    "patientName": "Mr. Kaizer Diwan",
    "ageGender": "76Y / Male",
    "personalContact": "8169021267"
  },
  {
    "srNo": 109,
    "invoiceNumber": "BILLSH-BZR2026-0111",
    "timeOfBill": "08 Oct 2026, 3:29 PM",
    "netAmt": 1980,
    "umr": "DAS26000104",
    "patientName": "Mr. Jugendra Chauhan",
    "ageGender": "41Y / Male",
    "personalContact": "9987430277"
  },
  {
    "srNo": 110,
    "invoiceNumber": "BILLSH-BZR2026-0112",
    "timeOfBill": "08 Oct 2026, 3:59 PM",
    "netAmt": 750,
    "umr": "DAS26000105",
    "patientName": "Mr. Farasdaq Abbas Ebrahimjee",
    "ageGender": "54Y / Male",
    "personalContact": "947608722"
  },
  {
    "srNo": 111,
    "invoiceNumber": "BILLSH-BZR2026-0110",
    "timeOfBill": "08 Oct 2026, 9:55 AM",
    "netAmt": 1700,
    "umr": "DAS26000058",
    "patientName": "Mr. Mohd Yusuf Mohd Essa Patel",
    "ageGender": "63Y / Male",
    "personalContact": "9167309086"
  },
  {
    "srNo": 112,
    "invoiceNumber": "BILLSH-BZR2026-0113",
    "timeOfBill": "09 Oct 2026, 1:25 PM",
    "netAmt": 2743,
    "umr": "DAS26000104",
    "patientName": "Mr. Jugendra Chauhan",
    "ageGender": "41Y / Male",
    "personalContact": "9987430277"
  },
  {
    "srNo": 113,
    "invoiceNumber": "BILLSH-BZR2026-0114",
    "timeOfBill": "09 Oct 2026, 1:27 PM",
    "netAmt": 370,
    "umr": "DAS26000104",
    "patientName": "Mr. Jugendra Chauhan",
    "ageGender": "41Y / Male",
    "personalContact": "9987430277"
  },
  {
    "srNo": 114,
    "invoiceNumber": "BILLSH-BZR2026-0116",
    "timeOfBill": "10 Oct 2026, 12:43 PM",
    "netAmt": 2743,
    "umr": "DAS26000058",
    "patientName": "Mr. Mohd Yusuf Mohd Essa Patel",
    "ageGender": "63Y / Male",
    "personalContact": "9167309086"
  },
  {
    "srNo": 115,
    "invoiceNumber": "BILLSH-BZR2026-0115",
    "timeOfBill": "10 Oct 2026, 8:39 AM",
    "netAmt": 2861,
    "umr": "DAS26000102",
    "patientName": "Mr. Kaizer Diwan",
    "ageGender": "76Y / Male",
    "personalContact": "8169021267"
  },
  {
    "srNo": 116,
    "invoiceNumber": "BILLSH-BZR2026-0117",
    "timeOfBill": "12 Oct 2026, 1:17 PM",
    "netAmt": 1700,
    "umr": "DAS26000104",
    "patientName": "Mr. Jugendra Chauhan",
    "ageGender": "41Y / Male",
    "personalContact": "9987430277"
  },
  {
    "srNo": 117,
    "invoiceNumber": "BILLSH-BZR2026-0118",
    "timeOfBill": "12 Oct 2026, 1:37 PM",
    "netAmt": 500,
    "umr": "DAS26000110",
    "patientName": "Mrs. Farida Gheewala",
    "ageGender": "52Y / Female",
    "personalContact": "9833834474"
  },
  {
    "srNo": 118,
    "invoiceNumber": "BILLSH-BZR2026-0120",
    "timeOfBill": "13 Oct 2026, 12:55 PM",
    "netAmt": 1700,
    "umr": "DAS26000058",
    "patientName": "Mr. Mohd Yusuf Mohd Essa Patel",
    "ageGender": "63Y / Male",
    "personalContact": "9167309086"
  },
  {
    "srNo": 119,
    "invoiceNumber": "BILLSH-BZR2026-0119",
    "timeOfBill": "13 Oct 2026, 8:21 AM",
    "netAmt": 2861,
    "umr": "DAS26000102",
    "patientName": "Mr. Kaizer Diwan",
    "ageGender": "76Y / Male",
    "personalContact": "8169021267"
  },
  {
    "srNo": 120,
    "invoiceNumber": "BILLSH-BZR2026-0123",
    "timeOfBill": "15 Oct 2026, 1:35 PM",
    "netAmt": 2568,
    "umr": "DAS26000113",
    "patientName": "Mrs. Durriya Murtaza Ganjifrockwala",
    "ageGender": "36Y / Female",
    "personalContact": "9773438875"
  },
  {
    "srNo": 121,
    "invoiceNumber": "BILLSH-BZR2026-0124",
    "timeOfBill": "15 Oct 2026, 4:42 PM",
    "netAmt": 2823,
    "umr": "DAS26000036",
    "patientName": "Mrs. Farida Fakhruddin Noori",
    "ageGender": "76Y / Female",
    "personalContact": "9819135440"
  },
  {
    "srNo": 122,
    "invoiceNumber": "BILLSH-BZR2026-0121",
    "timeOfBill": "15 Oct 2026, 8:32 AM",
    "netAmt": 1700,
    "umr": "DAS26000102",
    "patientName": "Mr. Kaizer Diwan",
    "ageGender": "76Y / Male",
    "personalContact": "8169021267"
  },
  {
    "srNo": 123,
    "invoiceNumber": "BILLSH-BZR2026-0122",
    "timeOfBill": "15 Oct 2026, 9:17 AM",
    "netAmt": 2743,
    "umr": "DAS26000112",
    "patientName": "Mr. Farooq Yusuf Darvesh",
    "ageGender": "64Y / Male",
    "personalContact": "7021348700"
  },
  {
    "srNo": 124,
    "invoiceNumber": "BILLSH-BZR2026-0126",
    "timeOfBill": "16 Oct 2026, 12:49 PM",
    "netAmt": 2625,
    "umr": "DAS26000115",
    "patientName": "Mrs. Rashida Shabbir Ujjainwala",
    "ageGender": "35Y / Female",
    "personalContact": "7715996751"
  },
  {
    "srNo": 125,
    "invoiceNumber": "BILLSH-BZR2026-0127",
    "timeOfBill": "16 Oct 2026, 12:55 PM",
    "netAmt": 1700,
    "umr": "DAS26000104",
    "patientName": "Mr. Jugendra Chauhan",
    "ageGender": "41Y / Male",
    "personalContact": "9987430277"
  },
  {
    "srNo": 126,
    "invoiceNumber": "BILLSH-BZR2026-0125",
    "timeOfBill": "16 Oct 2026, 9:11 AM",
    "netAmt": 810,
    "umr": "DAS26000114",
    "patientName": "Mrs. Jumana Mufaddal Challawala",
    "ageGender": "23Y / Female",
    "personalContact": "9167742952"
  },
  {
    "srNo": 127,
    "invoiceNumber": "BILLSH-BZR2026-0129",
    "timeOfBill": "17 Oct 2026, 12:19 PM",
    "netAmt": 1780,
    "umr": "DAS26000036",
    "patientName": "Mrs. Farida Fakhruddin Noori",
    "ageGender": "76Y / Female",
    "personalContact": "9819135440"
  },
  {
    "srNo": 128,
    "invoiceNumber": "BILLSH-BZR2026-0130",
    "timeOfBill": "17 Oct 2026, 12:25 PM",
    "netAmt": 1700,
    "umr": "DAS26000058",
    "patientName": "Mr. Mohd Yusuf Mohd Essa Patel",
    "ageGender": "63Y / Male",
    "personalContact": "9167309086"
  },
  {
    "srNo": 129,
    "invoiceNumber": "BILLSH-BZR2026-0128",
    "timeOfBill": "17 Oct 2026, 8:35 AM",
    "netAmt": 1700,
    "umr": "DAS26000102",
    "patientName": "Mr. Kaizer Diwan",
    "ageGender": "76Y / Male",
    "personalContact": "8169021267"
  },
  {
    "srNo": 130,
    "invoiceNumber": "BILLSH-BZR2026-0134",
    "timeOfBill": "19 Oct 2026, 1:00 PM",
    "netAmt": 1721,
    "umr": "DAS26000058",
    "patientName": "Mr. Mohd Yusuf Mohd Essa Patel",
    "ageGender": "63Y / Male",
    "personalContact": "9167309086"
  },
  {
    "srNo": 131,
    "invoiceNumber": "BILLSH-BZR2026-0135",
    "timeOfBill": "19 Oct 2026, 1:01 PM",
    "netAmt": 1700,
    "umr": "DAS26000112",
    "patientName": "Mr. Farooq Yusuf Darvesh",
    "ageGender": "64Y / Male",
    "personalContact": "7021348700"
  },
  {
    "srNo": 132,
    "invoiceNumber": "BILLSH-BZR2026-0132",
    "timeOfBill": "19 Oct 2026, 12:24 PM",
    "netAmt": 1700,
    "umr": "DAS26000104",
    "patientName": "Mr. Jugendra Chauhan",
    "ageGender": "41Y / Male",
    "personalContact": "9987430277"
  },
  {
    "srNo": 133,
    "invoiceNumber": "BILLSH-BZR2026-0133",
    "timeOfBill": "19 Oct 2026, 12:39 PM",
    "netAmt": 1530,
    "umr": "DAS26000117",
    "patientName": "Mr. Abbas Karimbhai Badani",
    "ageGender": "78Y / Male",
    "personalContact": "9870268764"
  },
  {
    "srNo": 134,
    "invoiceNumber": "BILLSH-BZR2026-0136",
    "timeOfBill": "19 Oct 2026, 2:36 PM",
    "netAmt": 1780,
    "umr": "DAS26000036",
    "patientName": "Mrs. Farida Fakhruddin Noori",
    "ageGender": "76Y / Female",
    "personalContact": "9819135440"
  },
  {
    "srNo": 135,
    "invoiceNumber": "BILLSH-BZR2026-0131",
    "timeOfBill": "19 Oct 2026, 8:36 AM",
    "netAmt": 1700,
    "umr": "DAS26000102",
    "patientName": "Mr. Kaizer Diwan",
    "ageGender": "76Y / Male",
    "personalContact": "8169021267"
  },
  {
    "srNo": 136,
    "invoiceNumber": "BILLSH-BZR2026-0140",
    "timeOfBill": "21 Oct 2026, 10:50 AM",
    "netAmt": 500,
    "umr": "DAS26000118",
    "patientName": "Mrs. Durriya Yusuf Vasadwala",
    "ageGender": "73Y / Female",
    "personalContact": "9819696755"
  },
  {
    "srNo": 137,
    "invoiceNumber": "BILLSH-BZR2026-0137",
    "timeOfBill": "21 Oct 2026, 8:35 AM",
    "netAmt": 1815,
    "umr": "DAS26000102",
    "patientName": "Mr. Kaizer Diwan",
    "ageGender": "76Y / Male",
    "personalContact": "8169021267"
  },
  {
    "srNo": 138,
    "invoiceNumber": "BILLSH-BZR2026-0138",
    "timeOfBill": "21 Oct 2026, 9:08 AM",
    "netAmt": 3720,
    "umr": "DAS26000113",
    "patientName": "Mrs. Durriya Murtaza Ganjifrockwala",
    "ageGender": "36Y / Female",
    "personalContact": "9773438875"
  },
  {
    "srNo": 139,
    "invoiceNumber": "BILLSH-BZR2026-0139",
    "timeOfBill": "21 Oct 2026, 9:16 AM",
    "netAmt": 890,
    "umr": "DAS26000117",
    "patientName": "Mr. Abbas Karimbhai Badani",
    "ageGender": "78Y / Male",
    "personalContact": "9870268764"
  },
  {
    "srNo": 140,
    "invoiceNumber": "BILLSH-BZR2026-0143",
    "timeOfBill": "22 Oct 2026, 1:34 PM",
    "netAmt": 1700,
    "umr": "DAS26000058",
    "patientName": "Mr. Mohd Yusuf Mohd Essa Patel",
    "ageGender": "63Y / Male",
    "personalContact": "9167309086"
  },
  {
    "srNo": 141,
    "invoiceNumber": "BILLSH-BZR2026-0141",
    "timeOfBill": "22 Oct 2026, 10:18 AM",
    "netAmt": 500,
    "umr": "DAS26000118",
    "patientName": "Mrs. Durriya Yusuf Vasadwala",
    "ageGender": "73Y / Female",
    "personalContact": "9819696755"
  },
  {
    "srNo": 142,
    "invoiceNumber": "BILLSH-BZR2026-0142",
    "timeOfBill": "22 Oct 2026, 11:08 AM",
    "netAmt": 1700,
    "umr": "DAS26000112",
    "patientName": "Mr. Farooq Yusuf Darvesh",
    "ageGender": "64Y / Male",
    "personalContact": "7021348700"
  },
  {
    "srNo": 143,
    "invoiceNumber": "BILLSH-BZR2026-0144",
    "timeOfBill": "22 Oct 2026, 2:36 PM",
    "netAmt": 1700,
    "umr": "DAS26000036",
    "patientName": "Mrs. Farida Fakhruddin Noori",
    "ageGender": "76Y / Female",
    "personalContact": "9819135440"
  },
  {
    "srNo": 144,
    "invoiceNumber": "BILLSH-BZR2026-0145",
    "timeOfBill": "23 Oct 2026, 10:33 AM",
    "netAmt": 500,
    "umr": "DAS26000118",
    "patientName": "Mrs. Durriya Yusuf Vasadwala",
    "ageGender": "73Y / Female",
    "personalContact": "9819696755"
  },
  {
    "srNo": 145,
    "invoiceNumber": "BILLSH-BZR2026-0146",
    "timeOfBill": "23 Oct 2026, 12:45 PM",
    "netAmt": 1721,
    "umr": "DAS26000104",
    "patientName": "Mr. Jugendra Chauhan",
    "ageGender": "41Y / Male",
    "personalContact": "9987430277"
  },
  {
    "srNo": 146,
    "invoiceNumber": "BILLSH-BZR2026-0148",
    "timeOfBill": "24 Oct 2026, 11:49 AM",
    "netAmt": 1700,
    "umr": "DAS26000058",
    "patientName": "Mr. Mohd Yusuf Mohd Essa Patel",
    "ageGender": "63Y / Male",
    "personalContact": "9167309086"
  },
  {
    "srNo": 147,
    "invoiceNumber": "BILLSH-BZR2026-0149",
    "timeOfBill": "24 Oct 2026, 11:54 AM",
    "netAmt": 1043,
    "umr": "DAS26000058",
    "patientName": "Mr. Mohd Yusuf Mohd Essa Patel",
    "ageGender": "63Y / Male",
    "personalContact": "9167309086"
  },
  {
    "srNo": 148,
    "invoiceNumber": "BILLSH-BZR2026-0150",
    "timeOfBill": "24 Oct 2026, 2:18 PM",
    "netAmt": 1780,
    "umr": "DAS26000036",
    "patientName": "Mrs. Farida Fakhruddin Noori",
    "ageGender": "76Y / Female",
    "personalContact": "9819135440"
  },
  {
    "srNo": 149,
    "invoiceNumber": "BILLSH-BZR2026-0151",
    "timeOfBill": "24 Oct 2026, 2:28 PM",
    "netAmt": 1515,
    "umr": "DAS26000120",
    "patientName": "Mr. Yash Ashok Mehta",
    "ageGender": "30Y / Male",
    "personalContact": "8879858708"
  },
  {
    "srNo": 150,
    "invoiceNumber": "BILLSH-BZR2026-0152",
    "timeOfBill": "24 Oct 2026, 4:00 PM",
    "netAmt": 115,
    "umr": "DAS26000121",
    "patientName": "Mr. Moazzam F Fidvi",
    "ageGender": "85Y / Male",
    "personalContact": "7045062153"
  },
  {
    "srNo": 151,
    "invoiceNumber": "BILLSH-BZR2026-0147",
    "timeOfBill": "24 Oct 2026, 8:26 AM",
    "netAmt": 1700,
    "umr": "DAS26000102",
    "patientName": "Mr. Kaizer Diwan",
    "ageGender": "76Y / Male",
    "personalContact": "8169021267"
  },
  {
    "srNo": 152,
    "invoiceNumber": "BILLSH-BZR2026-0153",
    "timeOfBill": "26 Oct 2026, 10:17 AM",
    "netAmt": 800,
    "umr": "DAS26000122",
    "patientName": "Mr. Mustansir . Jamali",
    "ageGender": "31Y / Male",
    "personalContact": "9909243181"
  },
  {
    "srNo": 153,
    "invoiceNumber": "BILLSH-BZR2026-0154",
    "timeOfBill": "26 Oct 2026, 11:06 AM",
    "netAmt": 2105,
    "umr": "DAS26000123",
    "patientName": "Ms. Khatib Maisoon Naushad",
    "ageGender": "44Y / Female",
    "personalContact": "9833638769"
  },
  {
    "srNo": 154,
    "invoiceNumber": "BILLSH-BZR2026-0155",
    "timeOfBill": "26 Oct 2026, 11:47 AM",
    "netAmt": 1665,
    "umr": "DAS26000124",
    "patientName": "Ms. Sial Alifiya Moiz",
    "ageGender": "46Y / Female",
    "personalContact": "9820637683"
  },
  {
    "srNo": 155,
    "invoiceNumber": "BILLSH-BZR2026-0156",
    "timeOfBill": "26 Oct 2026, 12:48 PM",
    "netAmt": 1700,
    "umr": "DAS26000104",
    "patientName": "Mr. Jugendra Chauhan",
    "ageGender": "41Y / Male",
    "personalContact": "9987430277"
  },
  {
    "srNo": 156,
    "invoiceNumber": "BILLSH-BZR2026-0157",
    "timeOfBill": "26 Oct 2026, 12:55 PM",
    "netAmt": 1700,
    "umr": "DAS26000112",
    "patientName": "Mr. Farooq Yusuf Darvesh",
    "ageGender": "64Y / Male",
    "personalContact": "7021348700"
  },
  {
    "srNo": 157,
    "invoiceNumber": "BILLSH-BZR2026-0159",
    "timeOfBill": "27 Oct 2026, 1:36 PM",
    "netAmt": 1700,
    "umr": "DAS26000058",
    "patientName": "Mr. Mohd Yusuf Mohd Essa Patel",
    "ageGender": "63Y / Male",
    "personalContact": "9167309086"
  },
  {
    "srNo": 158,
    "invoiceNumber": "BILLSH-BZR2026-0160",
    "timeOfBill": "27 Oct 2026, 4:19 PM",
    "netAmt": 2010,
    "umr": "DAS26000036",
    "patientName": "Mrs. Farida Fakhruddin Noori",
    "ageGender": "76Y / Female",
    "personalContact": "9819135440"
  },
  {
    "srNo": 159,
    "invoiceNumber": "BILLSH-BZR2026-0158",
    "timeOfBill": "27 Oct 2026, 8:42 AM",
    "netAmt": 1700,
    "umr": "DAS26000102",
    "patientName": "Mr. Kaizer Diwan",
    "ageGender": "76Y / Male",
    "personalContact": "8169021267"
  },
  {
    "srNo": 160,
    "invoiceNumber": "BILLSH-BZR2026-0163",
    "timeOfBill": "29 Oct 2026, 1:03 PM",
    "netAmt": 2935,
    "umr": "DAS26000133",
    "patientName": "Ms. Husaina Abdulqadir Hassanali",
    "ageGender": "4Y / Female",
    "personalContact": "713243455"
  },
  {
    "srNo": 161,
    "invoiceNumber": "BILLSH-BZR2026-0164",
    "timeOfBill": "29 Oct 2026, 1:35 PM",
    "netAmt": 1700,
    "umr": "DAS26000112",
    "patientName": "Mr. Farooq Yusuf Darvesh",
    "ageGender": "64Y / Male",
    "personalContact": "7021348700"
  },
  {
    "srNo": 162,
    "invoiceNumber": "BILLSH-BZR2026-0165",
    "timeOfBill": "29 Oct 2026, 1:39 PM",
    "netAmt": 1700,
    "umr": "DAS26000058",
    "patientName": "Mr. Mohd Yusuf Mohd Essa Patel",
    "ageGender": "63Y / Male",
    "personalContact": "9167309086"
  },
  {
    "srNo": 163,
    "invoiceNumber": "BILLSH-BZR2026-0162",
    "timeOfBill": "29 Oct 2026, 11:23 AM",
    "netAmt": 800,
    "umr": "DAS26000132",
    "patientName": "Ms. Mariya Juzer B.s Zakavi",
    "ageGender": "58Y / Female",
    "personalContact": "9769593952"
  },
  {
    "srNo": 164,
    "invoiceNumber": "BILLSH-BZR2026-0161",
    "timeOfBill": "29 Oct 2026, 8:42 AM",
    "netAmt": 2882,
    "umr": "DAS26000102",
    "patientName": "Mr. Kaizer Diwan",
    "ageGender": "76Y / Male",
    "personalContact": "8169021267"
  }
];

// ----------------------------------------------------------------------
// 2. SAIFEE DIAGNOSTIC CENTRE (MAZGAON) INVOICES (May - October 2026)
// Total Invoices: 442
// ----------------------------------------------------------------------
export const PRELIMINARY_SDC_INVOICES: PreliminaryInvoiceData[] = [
  {
    "srNo": 1,
    "invoiceNumber": "BILLSH-MGN2026-0001",
    "timeOfBill": "16-May-2026, 12:14",
    "netAmt": 290,
    "umr": "SAF26000001",
    "patientName": "Mrs. Renuka Tushar Charania",
    "ageGender": "35Y / Female",
    "personalContact": "9870264038"
  },
  {
    "srNo": 2,
    "invoiceNumber": "BILLSH-MGN2026-0002",
    "timeOfBill": "19-May-2026, 11:22",
    "netAmt": 800,
    "umr": "SAF26000002",
    "patientName": "Mr. Rajesh Narayan More",
    "ageGender": "60Y / Male",
    "personalContact": "8369534795"
  },
  {
    "srNo": 3,
    "invoiceNumber": "BILLSH-MGN2026-0003",
    "timeOfBill": "20-May-2026, 10:59",
    "netAmt": 800,
    "umr": "SAF26000002",
    "patientName": "Mr. Rajesh Narayan More",
    "ageGender": "60Y / Male",
    "personalContact": "8369534795"
  },
  {
    "srNo": 4,
    "invoiceNumber": "BILLSH-MGN2026-0004",
    "timeOfBill": "20-May-2026, 12:45",
    "netAmt": 800,
    "umr": "SAF26000003",
    "patientName": "Mr. Amir . Samnani",
    "ageGender": "55Y / Male",
    "personalContact": "9619351619"
  },
  {
    "srNo": 5,
    "invoiceNumber": "BILLSH-MGN2026-0005",
    "timeOfBill": "21-May-2026, 11:50",
    "netAmt": 800,
    "umr": "SAF26000002",
    "patientName": "Mr. Rajesh Narayan More",
    "ageGender": "60Y / Male",
    "personalContact": "8369534795"
  },
  {
    "srNo": 6,
    "invoiceNumber": "BILLSH-MGN2026-0006",
    "timeOfBill": "21-May-2026, 12:28",
    "netAmt": 800,
    "umr": "SAF26000003",
    "patientName": "Mr. Amir . Samnani",
    "ageGender": "55Y / Male",
    "personalContact": "9619351619"
  },
  {
    "srNo": 7,
    "invoiceNumber": "BILLSH-MGN2026-0007",
    "timeOfBill": "22-May-2026, 11:26",
    "netAmt": 800,
    "umr": "SAF26000002",
    "patientName": "Mr. Rajesh Narayan More",
    "ageGender": "60Y / Male",
    "personalContact": "8369534795"
  },
  {
    "srNo": 8,
    "invoiceNumber": "BILLSH-MGN2026-0008",
    "timeOfBill": "22-May-2026, 12:06",
    "netAmt": 800,
    "umr": "SAF26000003",
    "patientName": "Mr. Amir . Samnani",
    "ageGender": "55Y / Male",
    "personalContact": "9619351619"
  },
  {
    "srNo": 9,
    "invoiceNumber": "BILLSH-MGN2026-0009",
    "timeOfBill": "22-May-2026, 16:02",
    "netAmt": 500,
    "umr": "SAF26000004",
    "patientName": "Mrs. Ratan Govind Charaniya",
    "ageGender": "58Y / Female",
    "personalContact": "8291017330"
  },
  {
    "srNo": 10,
    "invoiceNumber": "BILLSH-MGN2026-0010",
    "timeOfBill": "23-May-2026, 12:28",
    "netAmt": 800,
    "umr": "SAF26000003",
    "patientName": "Mr. Amir . Samnani",
    "ageGender": "55Y / Male",
    "personalContact": "9619351619"
  },
  {
    "srNo": 11,
    "invoiceNumber": "BILLSH-MGN2026-0011",
    "timeOfBill": "25-May-2026, 10:34",
    "netAmt": 1600,
    "umr": "SAF26000002",
    "patientName": "Mr. Rajesh Narayan More",
    "ageGender": "60Y / Male",
    "personalContact": "8369534795"
  },
  {
    "srNo": 12,
    "invoiceNumber": "BILLSH-MGN2026-0012",
    "timeOfBill": "25-May-2026, 13:57",
    "netAmt": 800,
    "umr": "SAF26000005",
    "patientName": "Mr. Nooruddin Badruddin Gillani",
    "ageGender": "66Y / Male",
    "personalContact": "9820001775"
  },
  {
    "srNo": 13,
    "invoiceNumber": "BILLSH-MGN2026-0013",
    "timeOfBill": "26-May-2026, 11:40",
    "netAmt": 800,
    "umr": "SAF26000002",
    "patientName": "Mr. Rajesh Narayan More",
    "ageGender": "60Y / Male",
    "personalContact": "8369534795"
  },
  {
    "srNo": 14,
    "invoiceNumber": "BILLSH-MGN2026-0014",
    "timeOfBill": "26-May-2026, 12:42",
    "netAmt": 800,
    "umr": "SAF26000005",
    "patientName": "Mr. Nooruddin Badruddin Gillani",
    "ageGender": "66Y / Male",
    "personalContact": "9820001775"
  },
  {
    "srNo": 15,
    "invoiceNumber": "BILLSH-MGN2026-0015",
    "timeOfBill": "27-May-2026, 11:39",
    "netAmt": 500,
    "umr": "SAF26000006",
    "patientName": "Mrs. Khadija Moiz Channiwala",
    "ageGender": "69Y / Female",
    "personalContact": "9833747979"
  },
  {
    "srNo": 16,
    "invoiceNumber": "BILLSH-MGN2026-0016",
    "timeOfBill": "27-May-2026, 13:03",
    "netAmt": 800,
    "umr": "SAF26000005",
    "patientName": "Mr. Nooruddin Badruddin Gillani",
    "ageGender": "66Y / Male",
    "personalContact": "9820001775"
  },
  {
    "srNo": 17,
    "invoiceNumber": "BILLSH-MGN2026-0017",
    "timeOfBill": "27-May-2026, 13:11",
    "netAmt": 800,
    "umr": "SAF26000007",
    "patientName": "Ms. Sakina Muffadal Kothari",
    "ageGender": "52Y / Female",
    "personalContact": "9664786522"
  },
  {
    "srNo": 18,
    "invoiceNumber": "BILLSH-MGN2026-0018",
    "timeOfBill": "29-May-2026, 09:52",
    "netAmt": 800,
    "umr": "SAF26000007",
    "patientName": "Ms. Sakina Muffadal Kothari",
    "ageGender": "52Y / Female",
    "personalContact": "9664786522"
  },
  {
    "srNo": 19,
    "invoiceNumber": "BILLSH-MGN2026-0019",
    "timeOfBill": "29-May-2026, 11:20",
    "netAmt": 800,
    "umr": "SAF26000002",
    "patientName": "Mr. Rajesh Narayan More",
    "ageGender": "60Y / Male",
    "personalContact": "8369534795"
  },
  {
    "srNo": 20,
    "invoiceNumber": "BILLSH-MGN2026-0020",
    "timeOfBill": "29-May-2026, 13:13",
    "netAmt": 500,
    "umr": "SAF26000006",
    "patientName": "Mrs. Khadija Moiz Channiwala",
    "ageGender": "69Y / Female",
    "personalContact": "9833747979"
  },
  {
    "srNo": 21,
    "invoiceNumber": "BILLSH-MGN2026-0021",
    "timeOfBill": "30-May-2026, 09:48",
    "netAmt": 2610,
    "umr": "SAF26000002",
    "patientName": "Mr. Rajesh Narayan More",
    "ageGender": "60Y / Male",
    "personalContact": "8369534795"
  },
  {
    "srNo": 22,
    "invoiceNumber": "BILLSH-MGN2026-0022",
    "timeOfBill": "30-May-2026, 09:59",
    "netAmt": 800,
    "umr": "SAF26000007",
    "patientName": "Ms. Sakina Muffadal Kothari",
    "ageGender": "52Y / Female",
    "personalContact": "9664786522"
  },
  {
    "srNo": 23,
    "invoiceNumber": "BILLSH-MGN2026-0023",
    "timeOfBill": "30-May-2026, 11:05",
    "netAmt": 4446,
    "umr": "SAF26000008",
    "patientName": "Mr. Mustafabhai . Shakoor",
    "ageGender": "71Y / Male",
    "personalContact": "9819979840"
  },
  {
    "srNo": 24,
    "invoiceNumber": "BILLSH-MGN2026-0024",
    "timeOfBill": "30-May-2026, 11:29",
    "netAmt": 500,
    "umr": "SAF26000006",
    "patientName": "Mrs. Khadija Moiz Channiwala",
    "ageGender": "69Y / Female",
    "personalContact": "9833747979"
  },
  {
    "srNo": 25,
    "invoiceNumber": "BILLSH-MGN2026-0025",
    "timeOfBill": "30-May-2026, 11:33",
    "netAmt": 800,
    "umr": "SAF26000002",
    "patientName": "Mr. Rajesh Narayan More",
    "ageGender": "60Y / Male",
    "personalContact": "8369534795"
  },
  {
    "srNo": 26,
    "invoiceNumber": "BILLSH-MGN2026-0026",
    "timeOfBill": "01-Jun-2026, 10:28",
    "netAmt": 1110,
    "umr": "SAF26000010",
    "patientName": "Mrs. Shamim Amiruddin Bhombal",
    "ageGender": "53Y / Female",
    "personalContact": "7738214979"
  },
  {
    "srNo": 27,
    "invoiceNumber": "BILLSH-MGN2026-0027",
    "timeOfBill": "01-Jun-2026, 12:14",
    "netAmt": 800,
    "umr": "SAF26000005",
    "patientName": "Mr. Nooruddin Badruddin Gillani",
    "ageGender": "66Y / Male",
    "personalContact": "9820001775"
  },
  {
    "srNo": 28,
    "invoiceNumber": "BILLSH-MGN2026-0028",
    "timeOfBill": "01-Jun-2026, 12:50",
    "netAmt": 500,
    "umr": "SAF26000006",
    "patientName": "Mrs. Khadija Moiz Channiwala",
    "ageGender": "69Y / Female",
    "personalContact": "9833747979"
  },
  {
    "srNo": 29,
    "invoiceNumber": "BILLSH-MGN2026-0029",
    "timeOfBill": "01-Jun-2026, 13:34",
    "netAmt": 1001,
    "umr": "SAF26000010",
    "patientName": "Mrs. Shamim Amiruddin Bhombal",
    "ageGender": "53Y / Female",
    "personalContact": "7738214979"
  },
  {
    "srNo": 30,
    "invoiceNumber": "BILLSH-MGN2026-0030",
    "timeOfBill": "01-Jun-2026, 14:32",
    "netAmt": 800,
    "umr": "SAF26000007",
    "patientName": "Ms. Sakina Muffadal Kothari",
    "ageGender": "52Y / Female",
    "personalContact": "9664786522"
  },
  {
    "srNo": 31,
    "invoiceNumber": "BILLSH-MGN2026-0031",
    "timeOfBill": "01-Jun-2026, 15:53",
    "netAmt": 800,
    "umr": "SAF26000011",
    "patientName": "Ms. Zahabiyah Sh Mustansir Khadwala",
    "ageGender": "39Y / Female",
    "personalContact": "8758108575"
  },
  {
    "srNo": 32,
    "invoiceNumber": "BILLSH-MGN2026-0032",
    "timeOfBill": "02-Jun-2026, 10:41",
    "netAmt": 1200,
    "umr": "SAF26000012",
    "patientName": "Mr. Rafik . Khakoo",
    "ageGender": "53Y / Male",
    "personalContact": "8879323866"
  },
  {
    "srNo": 33,
    "invoiceNumber": "BILLSH-MGN2026-0033",
    "timeOfBill": "02-Jun-2026, 10:46",
    "netAmt": 1500,
    "umr": "SAF26000013",
    "patientName": "Ms. Rozmil . Khakoo",
    "ageGender": "45Y / Female",
    "personalContact": "8879323866"
  },
  {
    "srNo": 34,
    "invoiceNumber": "BILLSH-MGN2026-0034",
    "timeOfBill": "02-Jun-2026, 10:58",
    "netAmt": 500,
    "umr": "SAF26000006",
    "patientName": "Mrs. Khadija Moiz Channiwala",
    "ageGender": "69Y / Female",
    "personalContact": "9833747979"
  },
  {
    "srNo": 35,
    "invoiceNumber": "BILLSH-MGN2026-0035",
    "timeOfBill": "02-Jun-2026, 16:51",
    "netAmt": 800,
    "umr": "SAF26000011",
    "patientName": "Ms. Zahabiyah Sh Mustansir Khandwala",
    "ageGender": "39Y / Female",
    "personalContact": "8758108575"
  },
  {
    "srNo": 36,
    "invoiceNumber": "BILLSH-MGN2026-0036",
    "timeOfBill": "03-Jun-2026, 10:55",
    "netAmt": 7399,
    "umr": "SAF26000014",
    "patientName": "Mr. Shabiir Husain . Panarwala",
    "ageGender": "65Y / Male",
    "personalContact": "9575890940"
  },
  {
    "srNo": 37,
    "invoiceNumber": "BILLSH-MGN2026-0037",
    "timeOfBill": "03-Jun-2026, 13:40",
    "netAmt": 365,
    "umr": "SAF26000014",
    "patientName": "Mr. Shabbir Hussain . Panarwala",
    "ageGender": "65Y / Male",
    "personalContact": "9575890940"
  },
  {
    "srNo": 38,
    "invoiceNumber": "BILLSH-MGN2026-0038",
    "timeOfBill": "03-Jun-2026, 15:07",
    "netAmt": 500,
    "umr": "SAF26000006",
    "patientName": "Mrs. Khadija Moiz Channiwala",
    "ageGender": "69Y / Female",
    "personalContact": "9833747979"
  },
  {
    "srNo": 39,
    "invoiceNumber": "BILLSH-MGN2026-0039",
    "timeOfBill": "04-Jun-2026, 13:02",
    "netAmt": 500,
    "umr": "SAF26000006",
    "patientName": "Mrs. Khadija Moiz Channiwala",
    "ageGender": "69Y / Female",
    "personalContact": "9833747979"
  },
  {
    "srNo": 40,
    "invoiceNumber": "BILLSH-MGN2026-0040",
    "timeOfBill": "04-Jun-2026, 13:30",
    "netAmt": 800,
    "umr": "SAF26000007",
    "patientName": "Ms. Sakina Muffadal Kothari",
    "ageGender": "52Y / Female",
    "personalContact": "9664786522"
  },
  {
    "srNo": 41,
    "invoiceNumber": "BILLSH-MGN2026-0041",
    "timeOfBill": "04-Jun-2026, 14:14",
    "netAmt": 800,
    "umr": "SAF26000005",
    "patientName": "Mr. Nooruddin Badruddin Gillani",
    "ageGender": "66Y / Male",
    "personalContact": "9820001775"
  },
  {
    "srNo": 42,
    "invoiceNumber": "BILLSH-MGN2026-0042",
    "timeOfBill": "04-Jun-2026, 15:05",
    "netAmt": 800,
    "umr": "SAF26000011",
    "patientName": "Ms. Zahabiyah Sh Mustansir Khandwala",
    "ageGender": "39Y / Female",
    "personalContact": "8758108575"
  },
  {
    "srNo": 43,
    "invoiceNumber": "BILLSH-MGN2026-0043",
    "timeOfBill": "05-Jun-2026, 11:38",
    "netAmt": 1585,
    "umr": "SAF26000015",
    "patientName": "Mr. Ankit G Lakum",
    "ageGender": "35Y / Male",
    "personalContact": "9702167070"
  },
  {
    "srNo": 44,
    "invoiceNumber": "BILLSH-MGN2026-0044",
    "timeOfBill": "05-Jun-2026, 12:52",
    "netAmt": 320,
    "umr": "SAF26000016",
    "patientName": "Mr. Maqsud Ali Mohammed Shaikh",
    "ageGender": "60Y / Male",
    "personalContact": "7678029486"
  },
  {
    "srNo": 45,
    "invoiceNumber": "BILLSH-MGN2026-0045",
    "timeOfBill": "05-Jun-2026, 13:03",
    "netAmt": 800,
    "umr": "SAF26000005",
    "patientName": "Mr. Nooruddin Badruddin Gillani",
    "ageGender": "66Y / Male",
    "personalContact": "9820001775"
  },
  {
    "srNo": 46,
    "invoiceNumber": "BILLSH-MGN2026-0046",
    "timeOfBill": "05-Jun-2026, 13:08",
    "netAmt": 500,
    "umr": "SAF26000006",
    "patientName": "Mrs. Khadija Moiz Channiwala",
    "ageGender": "69Y / Female",
    "personalContact": "9833747979"
  },
  {
    "srNo": 47,
    "invoiceNumber": "BILLSH-MGN2026-0047",
    "timeOfBill": "05-Jun-2026, 13:31",
    "netAmt": 800,
    "umr": "SAF26000017",
    "patientName": "Mrs. Mariyam Yusuf Ampanwala",
    "ageGender": "69Y / Female",
    "personalContact": "9224012776"
  },
  {
    "srNo": 48,
    "invoiceNumber": "BILLSH-MGN2026-0048",
    "timeOfBill": "05-Jun-2026, 15:38",
    "netAmt": 800,
    "umr": "SAF26000011",
    "patientName": "Ms. Zahabiyah Sh Mustansir Khandwala",
    "ageGender": "39Y / Female",
    "personalContact": "8758108575"
  },
  {
    "srNo": 49,
    "invoiceNumber": "BILLSH-MGN2026-0049",
    "timeOfBill": "06-Jun-2026, 11:02",
    "netAmt": 800,
    "umr": "SAF26000007",
    "patientName": "Ms. Sakina Muffadal Kothari",
    "ageGender": "52Y / Female",
    "personalContact": "9664786522"
  },
  {
    "srNo": 50,
    "invoiceNumber": "BILLSH-MGN2026-0050",
    "timeOfBill": "06-Jun-2026, 11:05",
    "netAmt": 500,
    "umr": "SAF26000017",
    "patientName": "Mrs. Mariyam Yusuf Ampanwala",
    "ageGender": "69Y / Female",
    "personalContact": "9224012776"
  },
  {
    "srNo": 51,
    "invoiceNumber": "BILLSH-MGN2026-0051",
    "timeOfBill": "06-Jun-2026, 11:55",
    "netAmt": 5605,
    "umr": "SAF26000018",
    "patientName": "Ms. Tasneem Ebrahim Kothari",
    "ageGender": "28Y / Female",
    "personalContact": "8879054452"
  },
  {
    "srNo": 52,
    "invoiceNumber": "BILLSH-MGN2026-0052",
    "timeOfBill": "06-Jun-2026, 12:00",
    "netAmt": 500,
    "umr": "SAF26000006",
    "patientName": "Mrs. Khadija Moiz Channiwala",
    "ageGender": "69Y / Female",
    "personalContact": "9833747979"
  },
  {
    "srNo": 53,
    "invoiceNumber": "BILLSH-MGN2026-0053",
    "timeOfBill": "06-Jun-2026, 13:17",
    "netAmt": 1810,
    "umr": "SAF26000019",
    "patientName": "Ms. Aski . Bhojgatar",
    "ageGender": "65Y / Female",
    "personalContact": "9869283463"
  },
  {
    "srNo": 54,
    "invoiceNumber": "BILLSH-MGN2026-0054",
    "timeOfBill": "06-Jun-2026, 15:20",
    "netAmt": 800,
    "umr": "SAF26000011",
    "patientName": "Ms. Zahabiyah Sh Mustansir Khandwala",
    "ageGender": "39Y / Female",
    "personalContact": "8758108575"
  },
  {
    "srNo": 55,
    "invoiceNumber": "BILLSH-MGN2026-0055",
    "timeOfBill": "08-Jun-2026, 11:34",
    "netAmt": 800,
    "umr": "SAF26000011",
    "patientName": "Ms. Zahabiyah Sh Mustansir Khandwala",
    "ageGender": "39Y / Female",
    "personalContact": "8758108575"
  },
  {
    "srNo": 56,
    "invoiceNumber": "BILLSH-MGN2026-0056",
    "timeOfBill": "08-Jun-2026, 14:07",
    "netAmt": 500,
    "umr": "SAF26000020",
    "patientName": "Mr. Janardan Namdev Patil",
    "ageGender": "78Y / Male",
    "personalContact": "9969637500"
  },
  {
    "srNo": 57,
    "invoiceNumber": "BILLSH-MGN2026-0057",
    "timeOfBill": "09-Jun-2026, 11:10",
    "netAmt": 5535,
    "umr": "SAF26000021",
    "patientName": "Mr. Abdullah . Electricwala",
    "ageGender": "78Y / Male",
    "personalContact": "9821213734"
  },
  {
    "srNo": 58,
    "invoiceNumber": "BILLSH-MGN2026-0058",
    "timeOfBill": "09-Jun-2026, 12:21",
    "netAmt": 1100,
    "umr": "SAF26000008",
    "patientName": "Mr. Mustafabhai . Shakoor",
    "ageGender": "71Y / Male",
    "personalContact": "9819979840"
  },
  {
    "srNo": 59,
    "invoiceNumber": "BILLSH-MGN2026-0059",
    "timeOfBill": "09-Jun-2026, 12:43",
    "netAmt": 800,
    "umr": "SAF26000007",
    "patientName": "Ms. Sakina Muffadal Kothari",
    "ageGender": "52Y / Female",
    "personalContact": "9664786522"
  },
  {
    "srNo": 60,
    "invoiceNumber": "BILLSH-MGN2026-0060",
    "timeOfBill": "09-Jun-2026, 14:10",
    "netAmt": 1200,
    "umr": "SAF26000021",
    "patientName": "Mr. Abdullah . Electricwala",
    "ageGender": "78Y / Male",
    "personalContact": "9821213734"
  },
  {
    "srNo": 61,
    "invoiceNumber": "BILLSH-MGN2026-0061",
    "timeOfBill": "09-Jun-2026, 16:05",
    "netAmt": 2800,
    "umr": "SAF26000022",
    "patientName": "Mrs. Tasneem Yunus Contractor",
    "ageGender": "46Y / Female",
    "personalContact": "9892934982"
  },
  {
    "srNo": 62,
    "invoiceNumber": "BILLSH-MGN2026-0062",
    "timeOfBill": "09-Jun-2026, 16:50",
    "netAmt": 1030,
    "umr": "SAF26000023",
    "patientName": "Mr. Adnan Tyzoon Zoomkawala",
    "ageGender": "49Y / Male",
    "personalContact": "9820421431"
  },
  {
    "srNo": 63,
    "invoiceNumber": "BILLSH-MGN2026-0063",
    "timeOfBill": "09-Jun-2026, 17:22",
    "netAmt": 800,
    "umr": "SAF26000024",
    "patientName": "Ms. Sakina Hozefa Motiwala",
    "ageGender": "22Y / Female",
    "personalContact": "9136441510"
  },
  {
    "srNo": 64,
    "invoiceNumber": "BILLSH-MGN2026-0064",
    "timeOfBill": "10-Jun-2026, 10:29",
    "netAmt": 2500,
    "umr": "SAF26000025",
    "patientName": "Mrs. Salima . Kachwala",
    "ageGender": "66Y / Female",
    "personalContact": "9920717802"
  },
  {
    "srNo": 65,
    "invoiceNumber": "BILLSH-MGN2026-0065",
    "timeOfBill": "10-Jun-2026, 10:56",
    "netAmt": 1200,
    "umr": "SAF26000026",
    "patientName": "Mrs. Banswarawala Sakina Taiyeb",
    "ageGender": "51Y / Female",
    "personalContact": "9867083445"
  },
  {
    "srNo": 66,
    "invoiceNumber": "BILLSH-MGN2026-0066",
    "timeOfBill": "10-Jun-2026, 12:43",
    "netAmt": 200,
    "umr": "SAF26000027",
    "patientName": "Mrs. Farida Khokhawala",
    "ageGender": "68Y / Female",
    "personalContact": "9004983376"
  },
  {
    "srNo": 67,
    "invoiceNumber": "BILLSH-MGN2026-0067",
    "timeOfBill": "10-Jun-2026, 13:07",
    "netAmt": 800,
    "umr": "SAF26000005",
    "patientName": "Mr. Nooruddin Badruddin Gillani",
    "ageGender": "66Y / Male",
    "personalContact": "9820001775"
  },
  {
    "srNo": 68,
    "invoiceNumber": "BILLSH-MGN2026-0068",
    "timeOfBill": "11-Jun-2026, 11:59",
    "netAmt": 200,
    "umr": "SAF26000021",
    "patientName": "Mr. Abdullah . Electricwala",
    "ageGender": "78Y / Male",
    "personalContact": "9821213734"
  },
  {
    "srNo": 69,
    "invoiceNumber": "BILLSH-MGN2026-0069",
    "timeOfBill": "11-Jun-2026, 12:00",
    "netAmt": 800,
    "umr": "SAF26000007",
    "patientName": "Ms. Sakina Muffadal Kothari",
    "ageGender": "52Y / Female",
    "personalContact": "9664786522"
  },
  {
    "srNo": 70,
    "invoiceNumber": "BILLSH-MGN2026-0070",
    "timeOfBill": "11-Jun-2026, 13:02",
    "netAmt": 500,
    "umr": "SAF26000017",
    "patientName": "Mrs. Mariyam Yusuf Ampanwala",
    "ageGender": "69Y / Female",
    "personalContact": "9224012776"
  },
  {
    "srNo": 71,
    "invoiceNumber": "BILLSH-MGN2026-0071",
    "timeOfBill": "11-Jun-2026, 15:26",
    "netAmt": 220,
    "umr": "SAF26000028",
    "patientName": "Mr. Farid Ahmed Khan",
    "ageGender": "57Y / Male",
    "personalContact": "9967941228"
  },
  {
    "srNo": 72,
    "invoiceNumber": "BILLSH-MGN2026-0072",
    "timeOfBill": "12-Jun-2026, 12:30",
    "netAmt": 190,
    "umr": "SAF26000029",
    "patientName": "Mrs. Reshma . Talashilakar",
    "ageGender": "60Y / Female",
    "personalContact": "7208661999"
  },
  {
    "srNo": 73,
    "invoiceNumber": "BILLSH-MGN2026-0073",
    "timeOfBill": "12-Jun-2026, 15:08",
    "netAmt": 800,
    "umr": "SAF26000005",
    "patientName": "Mr. Nooruddin Badruddin Gillani",
    "ageGender": "66Y / Male",
    "personalContact": "9820001775"
  },
  {
    "srNo": 74,
    "invoiceNumber": "BILLSH-MGN2026-0074",
    "timeOfBill": "13-Jun-2026, 10:26",
    "netAmt": 1945,
    "umr": "SAF26000030",
    "patientName": "Mr. Hasan Asgarali Jasdanwalla",
    "ageGender": "66Y / Male",
    "personalContact": "9820368233"
  },
  {
    "srNo": 75,
    "invoiceNumber": "BILLSH-MGN2026-0075",
    "timeOfBill": "13-Jun-2026, 10:34",
    "netAmt": 800,
    "umr": "SAF26000007",
    "patientName": "Ms. Sakina Muffadal Kothari",
    "ageGender": "52Y / Female",
    "personalContact": "9664786522"
  },
  {
    "srNo": 76,
    "invoiceNumber": "BILLSH-MGN2026-0076",
    "timeOfBill": "13-Jun-2026, 13:48",
    "netAmt": 800,
    "umr": "SAF26000005",
    "patientName": "Mr. Nooruddin Badruddin Gillani",
    "ageGender": "66Y / Male",
    "personalContact": "9820001775"
  },
  {
    "srNo": 77,
    "invoiceNumber": "BILLSH-MGN2026-0077",
    "timeOfBill": "15-Jun-2026, 12:34",
    "netAmt": 1050,
    "umr": "SAF26000031",
    "patientName": "Mrs. Sakina Murtaza Balasinorwala",
    "ageGender": "45Y / Female",
    "personalContact": "9823055252"
  },
  {
    "srNo": 78,
    "invoiceNumber": "BILLSH-MGN2026-0078",
    "timeOfBill": "15-Jun-2026, 12:43",
    "netAmt": 1200,
    "umr": "SAF26000032",
    "patientName": "Mr. Murtaza . Balasinorwala",
    "ageGender": "47Y / Male",
    "personalContact": "8691077398"
  },
  {
    "srNo": 79,
    "invoiceNumber": "BILLSH-MGN2026-0079",
    "timeOfBill": "16-Jun-2026, 12:04",
    "netAmt": 2030,
    "umr": "SAF26000005",
    "patientName": "Mr. Nooruddin Badruddin Gillani",
    "ageGender": "66Y / Male",
    "personalContact": "9820001775"
  },
  {
    "srNo": 80,
    "invoiceNumber": "BILLSH-MGN2026-0080",
    "timeOfBill": "16-Jun-2026, 12:18",
    "netAmt": 150,
    "umr": "SAF26000033",
    "patientName": "Mrs. Nadiya N Gillani",
    "ageGender": "63Y / Female",
    "personalContact": "9820338109"
  },
  {
    "srNo": 81,
    "invoiceNumber": "BILLSH-MGN2026-0081",
    "timeOfBill": "16-Jun-2026, 13:11",
    "netAmt": 800,
    "umr": "SAF26000005",
    "patientName": "Mr. Nooruddin Badruddin Gillani",
    "ageGender": "66Y / Male",
    "personalContact": "9820001775"
  },
  {
    "srNo": 82,
    "invoiceNumber": "BILLSH-MGN2026-0082",
    "timeOfBill": "17-Jun-2026, 15:39",
    "netAmt": 3161,
    "umr": "SAF26000034",
    "patientName": "Mrs. Tasneem Muffaddal Fatehi",
    "ageGender": "32Y / Female",
    "personalContact": "8693070653"
  },
  {
    "srNo": 83,
    "invoiceNumber": "BILLSH-MGN2026-0083",
    "timeOfBill": "17-Jun-2026, 15:51",
    "netAmt": 300,
    "umr": "SAF26000034",
    "patientName": "Mrs. Tasneem Muffaddal Fatehi",
    "ageGender": "32Y / Female",
    "personalContact": "8693070653"
  },
  {
    "srNo": 84,
    "invoiceNumber": "BILLSH-MGN2026-0084",
    "timeOfBill": "17-Jun-2026, 15:58",
    "netAmt": 500,
    "umr": "SAF26000035",
    "patientName": "Mrs. Sukaina A Rajani",
    "ageGender": "59Y / Female",
    "personalContact": "9833120876"
  },
  {
    "srNo": 85,
    "invoiceNumber": "BILLSH-MGN2026-0085",
    "timeOfBill": "20-Jun-2026, 10:47",
    "netAmt": 290,
    "umr": "SAF26000036",
    "patientName": "Mr. Mohd Rizwan . Khan",
    "ageGender": "40Y / Male",
    "personalContact": "9820870643"
  },
  {
    "srNo": 86,
    "invoiceNumber": "BILLSH-MGN2026-0086",
    "timeOfBill": "20-Jun-2026, 13:29",
    "netAmt": 800,
    "umr": "SAF26000037",
    "patientName": "Mrs. Suhasini Vasant Jadhav",
    "ageGender": "77Y / Female",
    "personalContact": "9912043632"
  },
  {
    "srNo": 87,
    "invoiceNumber": "BILLSH-MGN2026-0087",
    "timeOfBill": "22-Jun-2026, 12:21",
    "netAmt": 800,
    "umr": "SAF26000037",
    "patientName": "Mrs. Suhasini Vasant Jadhav",
    "ageGender": "77Y / Female",
    "personalContact": "9912043632"
  },
  {
    "srNo": 88,
    "invoiceNumber": "BILLSH-MGN2026-0088",
    "timeOfBill": "22-Jun-2026, 14:15",
    "netAmt": 710,
    "umr": "SAF26000038",
    "patientName": "Mrs. Rukhsar Danish Mistry",
    "ageGender": "33Y / Female",
    "personalContact": "9769428153"
  },
  {
    "srNo": 89,
    "invoiceNumber": "BILLSH-MGN2026-0089",
    "timeOfBill": "23-Jun-2026, 10:27",
    "netAmt": 500,
    "umr": "SAF26000039",
    "patientName": "Ms. Kaushalya Dungraram Parmar",
    "ageGender": "19Y / Female",
    "personalContact": "9372948216"
  },
  {
    "srNo": 90,
    "invoiceNumber": "BILLSH-MGN2026-0090",
    "timeOfBill": "23-Jun-2026, 10:29",
    "netAmt": 500,
    "umr": "SAF26000039",
    "patientName": "Ms. Kaushalya Dungraram Parmar",
    "ageGender": "19Y / Female",
    "personalContact": "9372948216"
  },
  {
    "srNo": 91,
    "invoiceNumber": "BILLSH-MGN2026-0091",
    "timeOfBill": "25-Jun-2026, 11:54",
    "netAmt": 800,
    "umr": "SAF26000037",
    "patientName": "Mrs. Suhasini Vasant Jadhav",
    "ageGender": "77Y / Female",
    "personalContact": "9912043632"
  },
  {
    "srNo": 92,
    "invoiceNumber": "BILLSH-MGN2026-0092",
    "timeOfBill": "26-Jun-2026, 12:28",
    "netAmt": 800,
    "umr": "SAF26000037",
    "patientName": "Mrs. Suhasini Vasant Jadhav",
    "ageGender": "77Y / Female",
    "personalContact": "9912043632"
  },
  {
    "srNo": 93,
    "invoiceNumber": "BILLSH-MGN2026-0093",
    "timeOfBill": "27-Jun-2026, 12:05",
    "netAmt": 800,
    "umr": "SAF26000037",
    "patientName": "Mrs. Suhasini Vasant Jadhav",
    "ageGender": "77Y / Female",
    "personalContact": "9912043632"
  },
  {
    "srNo": 94,
    "invoiceNumber": "BILLSH-MGN2026-0094",
    "timeOfBill": "27-Jun-2026, 15:45",
    "netAmt": 500,
    "umr": "SAF26000039",
    "patientName": "Ms. Kaushalya Dungraram Parmar",
    "ageGender": "19Y / Female",
    "personalContact": "9372948216"
  },
  {
    "srNo": 95,
    "invoiceNumber": "BILLSH-MGN2026-0096",
    "timeOfBill": "30-Jun-2026, 12:07",
    "netAmt": 800,
    "umr": "SAF26000037",
    "patientName": "Mrs. Suhasini Vasant Jadhav",
    "ageGender": "77Y / Female",
    "personalContact": "9912043632"
  },
  {
    "srNo": 96,
    "invoiceNumber": "BILLSH-MGN2026-0097",
    "timeOfBill": "30-Jun-2026, 13:12",
    "netAmt": 500,
    "umr": "SAF26000039",
    "patientName": "Ms. Kaushalya Dungraram Parmar",
    "ageGender": "19Y / Female",
    "personalContact": "9372948216"
  },
  {
    "srNo": 97,
    "invoiceNumber": "BILLSH-MGN2026-0098",
    "timeOfBill": "04-Jul-2026, 10:27",
    "netAmt": 3020,
    "umr": "SAF26000041",
    "patientName": "Mr. Kaid Mohsinbhai Golwala",
    "ageGender": "66Y / Male",
    "personalContact": "9773581952"
  },
  {
    "srNo": 98,
    "invoiceNumber": "BILLSH-MGN2026-0099",
    "timeOfBill": "07-Jul-2026, 08:50",
    "netAmt": 2005,
    "umr": "SAF26000042",
    "patientName": "Mr. Shabbir Mohammad Savliwala",
    "ageGender": "67Y / Male",
    "personalContact": "9967752524"
  },
  {
    "srNo": 99,
    "invoiceNumber": "BILLSH-MGN2026-0100",
    "timeOfBill": "07-Jul-2026, 11:40",
    "netAmt": 500,
    "umr": "SAF26000039",
    "patientName": "Ms. Kaushalya Dungraram Parmar",
    "ageGender": "19Y / Female",
    "personalContact": "9372948216"
  },
  {
    "srNo": 100,
    "invoiceNumber": "BILLSH-MGN2026-0101",
    "timeOfBill": "08-Jul-2026, 10:25",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 101,
    "invoiceNumber": "BILLSH-MGN2026-0102",
    "timeOfBill": "09-Jul-2026, 10:38",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 102,
    "invoiceNumber": "BILLSH-MGN2026-0103",
    "timeOfBill": "09-Jul-2026, 10:40",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 103,
    "invoiceNumber": "BILLSH-MGN2026-0104",
    "timeOfBill": "10-Jul-2026, 11:31",
    "netAmt": 5040,
    "umr": "SAF26000044",
    "patientName": "Mrs. Saima Rizwan Sayed",
    "ageGender": "27Y / Female",
    "personalContact": "7021590883"
  },
  {
    "srNo": 104,
    "invoiceNumber": "BILLSH-MGN2026-0105",
    "timeOfBill": "10-Jul-2026, 16:00",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 105,
    "invoiceNumber": "BILLSH-MGN2026-0106",
    "timeOfBill": "11-Jul-2026, 10:51",
    "netAmt": 300,
    "umr": "SAF26000045",
    "patientName": "Mr. Mohammad Mazhar Quraishi",
    "ageGender": "79Y / Male",
    "personalContact": "9820387542"
  },
  {
    "srNo": 106,
    "invoiceNumber": "BILLSH-MGN2026-0107",
    "timeOfBill": "11-Jul-2026, 11:52",
    "netAmt": 500,
    "umr": "SAF26000039",
    "patientName": "Ms. Kaushalya Dungraram Parmar",
    "ageGender": "19Y / Female",
    "personalContact": "9372948216"
  },
  {
    "srNo": 107,
    "invoiceNumber": "BILLSH-MGN2026-0108",
    "timeOfBill": "11-Jul-2026, 17:20",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 108,
    "invoiceNumber": "BILLSH-MGN2026-0109",
    "timeOfBill": "13-Jul-2026, 10:24",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 109,
    "invoiceNumber": "BILLSH-MGN2026-0110",
    "timeOfBill": "14-Jul-2026, 15:57",
    "netAmt": 500,
    "umr": "SAF26000046",
    "patientName": "Mr. Taher Zoeb Basta",
    "ageGender": "45Y / Male",
    "personalContact": "9820100452"
  },
  {
    "srNo": 110,
    "invoiceNumber": "BILLSH-MGN2026-0111",
    "timeOfBill": "14-Jul-2026, 16:59",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 111,
    "invoiceNumber": "BILLSH-MGN2026-0112",
    "timeOfBill": "15-Jul-2026, 10:32",
    "netAmt": 500,
    "umr": "SAF26000046",
    "patientName": "Mr. Taher Zoeb Basta",
    "ageGender": "45Y / Male",
    "personalContact": "9820100452"
  },
  {
    "srNo": 112,
    "invoiceNumber": "BILLSH-MGN2026-0113",
    "timeOfBill": "15-Jul-2026, 10:38",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 113,
    "invoiceNumber": "BILLSH-MGN2026-0114",
    "timeOfBill": "16-Jul-2026, 15:41",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 114,
    "invoiceNumber": "BILLSH-MGN2026-0115",
    "timeOfBill": "17-Jul-2026, 15:16",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 115,
    "invoiceNumber": "BILLSH-MGN2026-0116",
    "timeOfBill": "18-Jul-2026, 12:51",
    "netAmt": 500,
    "umr": "SAF26000047",
    "patientName": "Mrs. Mamta Jitendra Sakaria",
    "ageGender": "49Y / Female",
    "personalContact": "9821357853"
  },
  {
    "srNo": 116,
    "invoiceNumber": "BILLSH-MGN2026-0117",
    "timeOfBill": "18-Jul-2026, 13:03",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 117,
    "invoiceNumber": "BILLSH-MGN2026-0118",
    "timeOfBill": "18-Jul-2026, 14:08",
    "netAmt": 500,
    "umr": "SAF26000006",
    "patientName": "Mrs. Khadija Moiz Channiwala",
    "ageGender": "69Y / Female",
    "personalContact": "9833747979"
  },
  {
    "srNo": 118,
    "invoiceNumber": "BILLSH-MGN2026-0119",
    "timeOfBill": "18-Jul-2026, 14:15",
    "netAmt": 500,
    "umr": "SAF26000046",
    "patientName": "Mr. Taher Zoeb Basta",
    "ageGender": "45Y / Male",
    "personalContact": "9820100452"
  },
  {
    "srNo": 119,
    "invoiceNumber": "BILLSH-MGN2026-0120",
    "timeOfBill": "20-Jul-2026, 12:04",
    "netAmt": 500,
    "umr": "SAF26000006",
    "patientName": "Mrs. Khadija Moiz Channiwala",
    "ageGender": "69Y / Female",
    "personalContact": "9833747979"
  },
  {
    "srNo": 120,
    "invoiceNumber": "BILLSH-MGN2026-0121",
    "timeOfBill": "20-Jul-2026, 12:09",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 121,
    "invoiceNumber": "BILLSH-MGN2026-0122",
    "timeOfBill": "20-Jul-2026, 15:18",
    "netAmt": 500,
    "umr": "SAF26000047",
    "patientName": "Mrs. Mamta Jitendra Sakaria",
    "ageGender": "49Y / Female",
    "personalContact": "9821357853"
  },
  {
    "srNo": 122,
    "invoiceNumber": "BILLSH-MGN2026-0123",
    "timeOfBill": "21-Jul-2026, 13:15",
    "netAmt": 500,
    "umr": "SAF26000047",
    "patientName": "Mrs. Mamta Jitendra Sakaria",
    "ageGender": "49Y / Female",
    "personalContact": "9821357853"
  },
  {
    "srNo": 123,
    "invoiceNumber": "BILLSH-MGN2026-0124",
    "timeOfBill": "21-Jul-2026, 13:27",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 124,
    "invoiceNumber": "BILLSH-MGN2026-0125",
    "timeOfBill": "22-Jul-2026, 12:33",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 125,
    "invoiceNumber": "BILLSH-MGN2026-0126",
    "timeOfBill": "22-Jul-2026, 13:12",
    "netAmt": 500,
    "umr": "SAF26000047",
    "patientName": "Mrs. Mamta Jitendra Sakaria",
    "ageGender": "49Y / Female",
    "personalContact": "9821357853"
  },
  {
    "srNo": 126,
    "invoiceNumber": "BILLSH-MGN2026-0127",
    "timeOfBill": "25-Jul-2026, 09:10",
    "netAmt": 2890,
    "umr": "SAF26000046",
    "patientName": "Mr. Taher Zoeb Basta",
    "ageGender": "45Y / Male",
    "personalContact": "9820100452"
  },
  {
    "srNo": 127,
    "invoiceNumber": "BILLSH-MGN2026-0128",
    "timeOfBill": "25-Jul-2026, 12:19",
    "netAmt": 735,
    "umr": "SAF26000048",
    "patientName": "Mr. Zuzer Ismail Bapai",
    "ageGender": "64Y / Male",
    "personalContact": "9920838054"
  },
  {
    "srNo": 128,
    "invoiceNumber": "BILLSH-MGN2026-0129",
    "timeOfBill": "27-Jul-2026, 09:14",
    "netAmt": 290,
    "umr": "SAF26000049",
    "patientName": "Mr. Mohammed Nafees . .",
    "ageGender": "43Y / Male",
    "personalContact": "6387097396"
  },
  {
    "srNo": 129,
    "invoiceNumber": "BILLSH-MGN2026-0130",
    "timeOfBill": "27-Jul-2026, 09:27",
    "netAmt": 190,
    "umr": "SAF26000050",
    "patientName": "Mrs. Prabha Ashwin Pandya",
    "ageGender": "48Y / Female",
    "personalContact": "9820186554"
  },
  {
    "srNo": 130,
    "invoiceNumber": "BILLSH-MGN2026-0131",
    "timeOfBill": "28-Jul-2026, 10:32",
    "netAmt": 1340,
    "umr": "SAF26000051",
    "patientName": "Mr. Abdul Wahid . Shaikh",
    "ageGender": "44Y / Male",
    "personalContact": "9004500108"
  },
  {
    "srNo": 131,
    "invoiceNumber": "BILLSH-MGN2026-0132",
    "timeOfBill": "28-Jul-2026, 15:44",
    "netAmt": 2720,
    "umr": "SAF26000052",
    "patientName": "Mr. Huseni Mohamedi Mahuvawala",
    "ageGender": "50Y / Male",
    "personalContact": "9987714952"
  },
  {
    "srNo": 132,
    "invoiceNumber": "BILLSH-MGN2026-0133",
    "timeOfBill": "31-Jul-2026, 08:22",
    "netAmt": 1050,
    "umr": "SAF26000053",
    "patientName": "Mrs. Tasneem Zulfikar Udaipurwala",
    "ageGender": "56Y / Female",
    "personalContact": "9920409913"
  },
  {
    "srNo": 133,
    "invoiceNumber": "BILLSH-MGN2026-0134",
    "timeOfBill": "31-Jul-2026, 08:48",
    "netAmt": 1050,
    "umr": "SAF26000054",
    "patientName": "Mrs. Samreen Tanveer Ahmed .",
    "ageGender": "49Y / Female",
    "personalContact": "8169813090"
  },
  {
    "srNo": 134,
    "invoiceNumber": "BILLSH-MGN2026-0135",
    "timeOfBill": "01-Aug-2026, 14:47",
    "netAmt": 1400,
    "umr": "SAF26000055",
    "patientName": "Mr. Shaukat . Keshwani",
    "ageGender": "66Y / Male",
    "personalContact": "9326080673"
  },
  {
    "srNo": 135,
    "invoiceNumber": "BILLSH-MGN2026-0136",
    "timeOfBill": "01-Aug-2026, 14:54",
    "netAmt": 4825,
    "umr": "SAF26000056",
    "patientName": "Mrs. Parina . Bhagat",
    "ageGender": "49Y / Female",
    "personalContact": "9930833663"
  },
  {
    "srNo": 136,
    "invoiceNumber": "BILLSH-MGN2026-0137",
    "timeOfBill": "01-Aug-2026, 15:38",
    "netAmt": 2670,
    "umr": "SAF26000057",
    "patientName": "Mr. Azmaan . Bhagat",
    "ageGender": "18Y / Male",
    "personalContact": "9930833663"
  },
  {
    "srNo": 137,
    "invoiceNumber": "BILLSH-MGN2026-0138",
    "timeOfBill": "01-Aug-2026, 16:03",
    "netAmt": 1950,
    "umr": "SAF26000058",
    "patientName": "Mr. Husain . Budhwani",
    "ageGender": "75Y / Male",
    "personalContact": "8692929160"
  },
  {
    "srNo": 138,
    "invoiceNumber": "BILLSH-MGN2026-0139",
    "timeOfBill": "01-Aug-2026, 16:18",
    "netAmt": 3801,
    "umr": "SAF26000085",
    "patientName": "Mrs. Shirin Kaba",
    "ageGender": "60Y / Female",
    "personalContact": "999999999"
  },
  {
    "srNo": 139,
    "invoiceNumber": "BILLSH-MGN2026-0140",
    "timeOfBill": "01-Aug-2026, 16:25",
    "netAmt": 1095,
    "umr": "SAF26000059",
    "patientName": "Mrs. Hasina . Mardhani",
    "ageGender": "53Y / Female",
    "personalContact": "8108657868"
  },
  {
    "srNo": 140,
    "invoiceNumber": "BILLSH-MGN2026-0141",
    "timeOfBill": "01-Aug-2026, 16:32",
    "netAmt": 1085,
    "umr": "SAF26000060",
    "patientName": "Mr. Arif Mardhani",
    "ageGender": "56Y / Male",
    "personalContact": "8108657868"
  },
  {
    "srNo": 141,
    "invoiceNumber": "BILLSH-MGN2026-0142",
    "timeOfBill": "01-Aug-2026, 16:38",
    "netAmt": 3045,
    "umr": "SAF26000061",
    "patientName": "Mr. Reyaz . Ajani",
    "ageGender": "54Y / Male",
    "personalContact": "9821341890"
  },
  {
    "srNo": 142,
    "invoiceNumber": "BILLSH-MGN2026-0143",
    "timeOfBill": "01-Aug-2026, 16:43",
    "netAmt": 2505,
    "umr": "SAF26000062",
    "patientName": "Mrs. Rita . Ajani",
    "ageGender": "47Y / Female",
    "personalContact": "9821341890"
  },
  {
    "srNo": 143,
    "invoiceNumber": "BILLSH-MGN2026-0144",
    "timeOfBill": "01-Aug-2026, 16:46",
    "netAmt": 610,
    "umr": "SAF26000063",
    "patientName": "Mrs. Rosemina . Kothia",
    "ageGender": "50Y / Female",
    "personalContact": "9819658504"
  },
  {
    "srNo": 144,
    "invoiceNumber": "BILLSH-MGN2026-0145",
    "timeOfBill": "01-Aug-2026, 16:49",
    "netAmt": 610,
    "umr": "SAF26000065",
    "patientName": "Mr. Shahir . Kothia",
    "ageGender": "50Y / Male",
    "personalContact": "9819658504"
  },
  {
    "srNo": 145,
    "invoiceNumber": "BILLSH-MGN2026-0146",
    "timeOfBill": "01-Aug-2026, 16:52",
    "netAmt": 2040,
    "umr": "SAF26000064",
    "patientName": "Ms. Isha . Dodhia",
    "ageGender": "23Y / Female",
    "personalContact": "9136878505"
  },
  {
    "srNo": 146,
    "invoiceNumber": "BILLSH-MGN2026-0147",
    "timeOfBill": "01-Aug-2026, 16:57",
    "netAmt": 2515,
    "umr": "SAF26000066",
    "patientName": "Mrs. Nazma . Dodhia",
    "ageGender": "55Y / Female",
    "personalContact": "9769141237"
  },
  {
    "srNo": 147,
    "invoiceNumber": "BILLSH-MGN2026-0148",
    "timeOfBill": "01-Aug-2026, 17:10",
    "netAmt": 2455,
    "umr": "SAF26000067",
    "patientName": "Mrs. Samira . Dhrolia",
    "ageGender": "39Y / Female",
    "personalContact": "9833909630"
  },
  {
    "srNo": 148,
    "invoiceNumber": "BILLSH-MGN2026-0149",
    "timeOfBill": "01-Aug-2026, 17:13",
    "netAmt": 1400,
    "umr": "SAF26000068",
    "patientName": "Mr. Arif . Virani",
    "ageGender": "58Y / Male",
    "personalContact": "9920562126"
  },
  {
    "srNo": 149,
    "invoiceNumber": "BILLSH-MGN2026-0150",
    "timeOfBill": "01-Aug-2026, 17:15",
    "netAmt": 1000,
    "umr": "SAF26000069",
    "patientName": "Ms. Karima Virani",
    "ageGender": "56Y / Female",
    "personalContact": "9920562126"
  },
  {
    "srNo": 150,
    "invoiceNumber": "BILLSH-MGN2026-0151",
    "timeOfBill": "01-Aug-2026, 17:19",
    "netAmt": 4635,
    "umr": "SAF26000070",
    "patientName": "Mr. Nadir . Amlani",
    "ageGender": "47Y / Male",
    "personalContact": "8888040011"
  },
  {
    "srNo": 151,
    "invoiceNumber": "BILLSH-MGN2026-0152",
    "timeOfBill": "01-Aug-2026, 17:23",
    "netAmt": 3705,
    "umr": "SAF26000071",
    "patientName": "Mrs. Zarina . Amlani",
    "ageGender": "82Y / Female",
    "personalContact": "8888040011"
  },
  {
    "srNo": 152,
    "invoiceNumber": "BILLSH-MGN2026-0153",
    "timeOfBill": "01-Aug-2026, 17:28",
    "netAmt": 775,
    "umr": "SAF26000072",
    "patientName": "Mrs. Zarina . Lalani",
    "ageGender": "76Y / Female",
    "personalContact": "9892852549"
  },
  {
    "srNo": 153,
    "invoiceNumber": "BILLSH-MGN2026-0154",
    "timeOfBill": "01-Aug-2026, 17:34",
    "netAmt": 3780,
    "umr": "SAF26000073",
    "patientName": "Mrs. Laila . Merchant",
    "ageGender": "57Y / Female",
    "personalContact": "9892852549"
  },
  {
    "srNo": 154,
    "invoiceNumber": "BILLSH-MGN2026-0155",
    "timeOfBill": "01-Aug-2026, 17:37",
    "netAmt": 610,
    "umr": "SAF26000074",
    "patientName": "Mrs. Gulshan . Merchant",
    "ageGender": "75Y / Female",
    "personalContact": "9619907112"
  },
  {
    "srNo": 155,
    "invoiceNumber": "BILLSH-MGN2026-0156",
    "timeOfBill": "01-Aug-2026, 17:39",
    "netAmt": 1000,
    "umr": "SAF26000075",
    "patientName": "Mrs. Gulbanu . Merchant",
    "ageGender": "89Y / Female",
    "personalContact": "9920849057"
  },
  {
    "srNo": 156,
    "invoiceNumber": "BILLSH-MGN2026-0157",
    "timeOfBill": "01-Aug-2026, 17:43",
    "netAmt": 3070,
    "umr": "SAF26000076",
    "patientName": "Mrs. Anisa . Padania",
    "ageGender": "68Y / Female",
    "personalContact": "9892939077"
  },
  {
    "srNo": 157,
    "invoiceNumber": "BILLSH-MGN2026-0158",
    "timeOfBill": "01-Aug-2026, 17:48",
    "netAmt": 3080,
    "umr": "SAF26000077",
    "patientName": "Ms. Alisha . Masani",
    "ageGender": "24Y / Female",
    "personalContact": "8657284677"
  },
  {
    "srNo": 158,
    "invoiceNumber": "BILLSH-MGN2026-0159",
    "timeOfBill": "01-Aug-2026, 17:52",
    "netAmt": 1280,
    "umr": "SAF26000078",
    "patientName": "Mrs. Arshee . Darediya",
    "ageGender": "23Y / Female",
    "personalContact": "9167734584"
  },
  {
    "srNo": 159,
    "invoiceNumber": "BILLSH-MGN2026-0160",
    "timeOfBill": "01-Aug-2026, 17:56",
    "netAmt": 860,
    "umr": "SAF26000079",
    "patientName": "Mrs. Amina . Tejani",
    "ageGender": "62Y / Female",
    "personalContact": "9867895186"
  },
  {
    "srNo": 160,
    "invoiceNumber": "BILLSH-MGN2026-0161",
    "timeOfBill": "01-Aug-2026, 18:02",
    "netAmt": 1875,
    "umr": "SAF26000080",
    "patientName": "Mrs. Munira Sharbatwala",
    "ageGender": "62Y / Female",
    "personalContact": "9321728487"
  },
  {
    "srNo": 161,
    "invoiceNumber": "BILLSH-MGN2026-0162",
    "timeOfBill": "01-Aug-2026, 18:05",
    "netAmt": 1085,
    "umr": "SAF26000081",
    "patientName": "Mrs. Laila Vishram",
    "ageGender": "64Y / Female",
    "personalContact": "999999999"
  },
  {
    "srNo": 162,
    "invoiceNumber": "BILLSH-MGN2026-0163",
    "timeOfBill": "01-Aug-2026, 18:14",
    "netAmt": 4320,
    "umr": "SAF26000083",
    "patientName": "Mrs. Salima Mithani",
    "ageGender": "51Y / Female",
    "personalContact": "9987477518"
  },
  {
    "srNo": 163,
    "invoiceNumber": "BILLSH-MGN2026-0164",
    "timeOfBill": "01-Aug-2026, 18:19",
    "netAmt": 1260,
    "umr": "SAF26000084",
    "patientName": "Mrs. Shirin Kajani",
    "ageGender": "40Y / Female",
    "personalContact": "9322585990"
  },
  {
    "srNo": 164,
    "invoiceNumber": "BILLSH-MGN2026-0165",
    "timeOfBill": "01-Aug-2026, 19:04",
    "netAmt": 4875,
    "umr": "SAF26000082",
    "patientName": "Mrs. Shahbegum Kidwani",
    "ageGender": "82Y / Female",
    "personalContact": "9987477518"
  },
  {
    "srNo": 165,
    "invoiceNumber": "BILLSH-MGN2026-0166",
    "timeOfBill": "03-Aug-2026, 11:23",
    "netAmt": 2000,
    "umr": "SAF26000028",
    "patientName": "Mr. Farid Ahmed Khan",
    "ageGender": "57Y / Male",
    "personalContact": "9967941228"
  },
  {
    "srNo": 166,
    "invoiceNumber": "BILLSH-MGN2026-0167",
    "timeOfBill": "03-Aug-2026, 14:12",
    "netAmt": 140,
    "umr": "SAF26000028",
    "patientName": "Mr. Farid Ahmed Khan",
    "ageGender": "57Y / Male",
    "personalContact": "9967941228"
  },
  {
    "srNo": 167,
    "invoiceNumber": "BILLSH-MGN2026-0168",
    "timeOfBill": "04-Aug-2026, 10:24",
    "netAmt": 1190,
    "umr": "SAF26000086",
    "patientName": "Mrs. Kaskahan . Khan",
    "ageGender": "53Y / Female",
    "personalContact": "9967941228"
  },
  {
    "srNo": 168,
    "invoiceNumber": "BILLSH-MGN2026-0169",
    "timeOfBill": "05-Aug-2026, 17:07",
    "netAmt": 610,
    "umr": "SAF26000088",
    "patientName": "Ms. Zaineb Mohammed Kapadia",
    "ageGender": "48Y / Female",
    "personalContact": "9833475043"
  },
  {
    "srNo": 169,
    "invoiceNumber": "BILLSH-MGN2026-0170",
    "timeOfBill": "06-Aug-2026, 10:39",
    "netAmt": 540,
    "umr": "SAF26000062",
    "patientName": "Mrs. Rita . Ajani",
    "ageGender": "47Y / Female",
    "personalContact": "9821341890"
  },
  {
    "srNo": 170,
    "invoiceNumber": "BILLSH-MGN2026-0171",
    "timeOfBill": "06-Aug-2026, 10:43",
    "netAmt": 1325,
    "umr": "SAF26000074",
    "patientName": "Mrs. Gulshan . Merchant",
    "ageGender": "75Y / Female",
    "personalContact": "9619907112"
  },
  {
    "srNo": 171,
    "invoiceNumber": "BILLSH-MGN2026-0172",
    "timeOfBill": "06-Aug-2026, 11:31",
    "netAmt": 700,
    "umr": "SAF26000089",
    "patientName": "Mrs. Gulbanu Mardani",
    "ageGender": "76Y / Female",
    "personalContact": "9820627913"
  },
  {
    "srNo": 172,
    "invoiceNumber": "BILLSH-MGN2026-0173",
    "timeOfBill": "06-Aug-2026, 11:37",
    "netAmt": 700,
    "umr": "SAF26000090",
    "patientName": "Mrs. Mumtaz . Amlani",
    "ageGender": "43Y / Female",
    "personalContact": "9920667730"
  },
  {
    "srNo": 173,
    "invoiceNumber": "BILLSH-MGN2026-0174",
    "timeOfBill": "06-Aug-2026, 11:41",
    "netAmt": 2275,
    "umr": "SAF26000091",
    "patientName": "Mrs. Ashwin Gilani",
    "ageGender": "41Y / Female",
    "personalContact": "8888040022"
  },
  {
    "srNo": 174,
    "invoiceNumber": "BILLSH-MGN2026-0175",
    "timeOfBill": "06-Aug-2026, 11:43",
    "netAmt": 610,
    "umr": "SAF26000092",
    "patientName": "Mrs. Gulzar Damani",
    "ageGender": "44Y / Female",
    "personalContact": "7021848013"
  },
  {
    "srNo": 175,
    "invoiceNumber": "BILLSH-MGN2026-0176",
    "timeOfBill": "06-Aug-2026, 11:44",
    "netAmt": 610,
    "umr": "SAF26000093",
    "patientName": "Master. Arsh Damani",
    "ageGender": "14Y / Male",
    "personalContact": "7021848013"
  },
  {
    "srNo": 176,
    "invoiceNumber": "BILLSH-MGN2026-0177",
    "timeOfBill": "06-Aug-2026, 12:23",
    "netAmt": 1860,
    "umr": "SAF26000021",
    "patientName": "Mr. Abdullah . Electricwala",
    "ageGender": "78Y / Male",
    "personalContact": "9821213734"
  },
  {
    "srNo": 177,
    "invoiceNumber": "BILLSH-MGN2026-0178",
    "timeOfBill": "08-Aug-2026, 08:59",
    "netAmt": 1340,
    "umr": "SAF26000094",
    "patientName": "Mrs. Maleka . Rangwala",
    "ageGender": "78Y / Female",
    "personalContact": "8082771219"
  },
  {
    "srNo": 178,
    "invoiceNumber": "BILLSH-MGN2026-0179",
    "timeOfBill": "08-Aug-2026, 09:29",
    "netAmt": 2860,
    "umr": "SAF26000095",
    "patientName": "Master. Ahmad Kapadia",
    "ageGender": "10Y / Male",
    "personalContact": "9820774843"
  },
  {
    "srNo": 179,
    "invoiceNumber": "BILLSH-MGN2026-0180",
    "timeOfBill": "10-Aug-2026, 09:40",
    "netAmt": 3475,
    "umr": "SAF26000096",
    "patientName": "Mrs. Razia . Kagalwala",
    "ageGender": "75Y / Female",
    "personalContact": "9820523372"
  },
  {
    "srNo": 180,
    "invoiceNumber": "BILLSH-MGN2026-0181",
    "timeOfBill": "11-Aug-2026, 11:52",
    "netAmt": 500,
    "umr": "SAF26000097",
    "patientName": "Mr. Zulfikar . Dholkawala",
    "ageGender": "72Y / Male",
    "personalContact": "9819830552"
  },
  {
    "srNo": 181,
    "invoiceNumber": "BILLSH-MGN2026-0182",
    "timeOfBill": "11-Aug-2026, 14:26",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 182,
    "invoiceNumber": "BILLSH-MGN2026-0183",
    "timeOfBill": "11-Aug-2026, 17:33",
    "netAmt": 2010,
    "umr": "SAF26000098",
    "patientName": "Mrs. Kulsum Hafizji",
    "ageGender": "51Y / Female",
    "personalContact": "9950558458"
  },
  {
    "srNo": 183,
    "invoiceNumber": "BILLSH-MGN2026-0184",
    "timeOfBill": "11-Aug-2026, 18:03",
    "netAmt": 1110,
    "umr": "SAF26000098",
    "patientName": "Mrs. Kulsum Hafizji",
    "ageGender": "51Y / Female",
    "personalContact": "9950558458"
  },
  {
    "srNo": 184,
    "invoiceNumber": "BILLSH-MGN2026-0185",
    "timeOfBill": "12-Aug-2026, 08:43",
    "netAmt": 2540,
    "umr": "SAF26000098",
    "patientName": "Mrs. Kulsum Hafizji",
    "ageGender": "51Y / Female",
    "personalContact": "9950558458"
  },
  {
    "srNo": 185,
    "invoiceNumber": "BILLSH-MGN2026-0186",
    "timeOfBill": "12-Aug-2026, 10:35",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 186,
    "invoiceNumber": "BILLSH-MGN2026-0187",
    "timeOfBill": "12-Aug-2026, 11:05",
    "netAmt": 500,
    "umr": "SAF26000097",
    "patientName": "Mr. Zulfikar . Dholkawala",
    "ageGender": "72Y / Male",
    "personalContact": "9819830552"
  },
  {
    "srNo": 187,
    "invoiceNumber": "BILLSH-MGN2026-0188",
    "timeOfBill": "12-Aug-2026, 15:15",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 188,
    "invoiceNumber": "BILLSH-MGN2026-0189",
    "timeOfBill": "13-Aug-2026, 09:54",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 189,
    "invoiceNumber": "BILLSH-MGN2026-0190",
    "timeOfBill": "13-Aug-2026, 11:51",
    "netAmt": 9095,
    "umr": "SAF26000007",
    "patientName": "Mrs. Sakina Muffadal Kothari",
    "ageGender": "52Y / Female",
    "personalContact": "9664786522"
  },
  {
    "srNo": 190,
    "invoiceNumber": "BILLSH-MGN2026-0191",
    "timeOfBill": "13-Aug-2026, 11:55",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 191,
    "invoiceNumber": "BILLSH-MGN2026-0192",
    "timeOfBill": "13-Aug-2026, 11:56",
    "netAmt": 500,
    "umr": "SAF26000097",
    "patientName": "Mr. Zulfikar . Dholkawala",
    "ageGender": "72Y / Male",
    "personalContact": "9819830552"
  },
  {
    "srNo": 192,
    "invoiceNumber": "BILLSH-MGN2026-0193",
    "timeOfBill": "13-Aug-2026, 16:44",
    "netAmt": 1135,
    "umr": "SAF26000100",
    "patientName": "Mrs. Shireen Aliasher Arsiwala",
    "ageGender": "48Y / Female",
    "personalContact": "9029037252"
  },
  {
    "srNo": 193,
    "invoiceNumber": "BILLSH-MGN2026-0194",
    "timeOfBill": "13-Aug-2026, 17:15",
    "netAmt": 1170,
    "umr": "SAF26000101",
    "patientName": "Mr. Mustafa Aliasgag Ramakdawala",
    "ageGender": "21Y / Male",
    "personalContact": "9957471141"
  },
  {
    "srNo": 194,
    "invoiceNumber": "BILLSH-MGN2026-0195",
    "timeOfBill": "14-Aug-2026, 09:44",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 195,
    "invoiceNumber": "BILLSH-MGN2026-0196",
    "timeOfBill": "14-Aug-2026, 09:51",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 196,
    "invoiceNumber": "BILLSH-MGN2026-0197",
    "timeOfBill": "17-Aug-2026, 09:30",
    "netAmt": 3425,
    "umr": "SAF26000102",
    "patientName": "Mr. Kezar Ebrahim Jetpurwala",
    "ageGender": "63Y / Male",
    "personalContact": "7977892399"
  },
  {
    "srNo": 197,
    "invoiceNumber": "BILLSH-MGN2026-0198",
    "timeOfBill": "17-Aug-2026, 11:54",
    "netAmt": 500,
    "umr": "SAF26000097",
    "patientName": "Mr. Zulfikar . Dholkawala",
    "ageGender": "72Y / Male",
    "personalContact": "9819830552"
  },
  {
    "srNo": 198,
    "invoiceNumber": "BILLSH-MGN2026-0199",
    "timeOfBill": "17-Aug-2026, 11:56",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 199,
    "invoiceNumber": "BILLSH-MGN2026-0200",
    "timeOfBill": "18-Aug-2026, 08:45",
    "netAmt": 2650,
    "umr": "SAF26000103",
    "patientName": "Mr. Shabbar A Lakdawala",
    "ageGender": "69Y / Male",
    "personalContact": "9820035753"
  },
  {
    "srNo": 200,
    "invoiceNumber": "BILLSH-MGN2026-0201",
    "timeOfBill": "18-Aug-2026, 09:26",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 201,
    "invoiceNumber": "BILLSH-MGN2026-0202",
    "timeOfBill": "18-Aug-2026, 09:28",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 202,
    "invoiceNumber": "BILLSH-MGN2026-0203",
    "timeOfBill": "18-Aug-2026, 11:46",
    "netAmt": 500,
    "umr": "SAF26000097",
    "patientName": "Mr. Zulfikar . Dholkawala",
    "ageGender": "72Y / Male",
    "personalContact": "9819830552"
  },
  {
    "srNo": 203,
    "invoiceNumber": "BILLSH-MGN2026-0204",
    "timeOfBill": "19-Aug-2026, 11:56",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 204,
    "invoiceNumber": "BILLSH-MGN2026-0205",
    "timeOfBill": "19-Aug-2026, 11:59",
    "netAmt": 500,
    "umr": "SAF26000097",
    "patientName": "Mr. Zulfikar . Dholkawala",
    "ageGender": "72Y / Male",
    "personalContact": "9819830552"
  },
  {
    "srNo": 205,
    "invoiceNumber": "BILLSH-MGN2026-0206",
    "timeOfBill": "20-Aug-2026, 09:24",
    "netAmt": 290,
    "umr": "SAF26000104",
    "patientName": "Mr. Ashok B Wavhal",
    "ageGender": "67Y / Male",
    "personalContact": "9821268342"
  },
  {
    "srNo": 206,
    "invoiceNumber": "BILLSH-MGN2026-0207",
    "timeOfBill": "20-Aug-2026, 11:07",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 207,
    "invoiceNumber": "BILLSH-MGN2026-0208",
    "timeOfBill": "20-Aug-2026, 11:09",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 208,
    "invoiceNumber": "BILLSH-MGN2026-0209",
    "timeOfBill": "20-Aug-2026, 11:10",
    "netAmt": 500,
    "umr": "SAF26000097",
    "patientName": "Mr. Zulfikar . Dholkawala",
    "ageGender": "72Y / Male",
    "personalContact": "9819830552"
  },
  {
    "srNo": 209,
    "invoiceNumber": "BILLSH-MGN2026-0210",
    "timeOfBill": "20-Aug-2026, 11:19",
    "netAmt": 190,
    "umr": "SAF26000105",
    "patientName": "Mrs. Rashida Mansoor Champeli",
    "ageGender": "72Y / Female",
    "personalContact": "8380053553"
  },
  {
    "srNo": 210,
    "invoiceNumber": "BILLSH-MGN2026-0211",
    "timeOfBill": "20-Aug-2026, 12:58",
    "netAmt": 500,
    "umr": "SAF26000105",
    "patientName": "Mrs. Rashida Mansoor Champeli",
    "ageGender": "72Y / Female",
    "personalContact": "8380053553"
  },
  {
    "srNo": 211,
    "invoiceNumber": "BILLSH-MGN2026-0212",
    "timeOfBill": "21-Aug-2026, 09:13",
    "netAmt": 4540,
    "umr": "SAF26000106",
    "patientName": "Mrs. Jumana Huzefa Electricwala",
    "ageGender": "43Y / Female",
    "personalContact": "9821818152"
  },
  {
    "srNo": 212,
    "invoiceNumber": "BILLSH-MGN2026-0213",
    "timeOfBill": "21-Aug-2026, 09:20",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 213,
    "invoiceNumber": "BILLSH-MGN2026-0214",
    "timeOfBill": "21-Aug-2026, 10:29",
    "netAmt": 2040,
    "umr": "SAF26000108",
    "patientName": "Mr. Adnaan Kothari",
    "ageGender": "35Y / Male",
    "personalContact": "9821410617"
  },
  {
    "srNo": 214,
    "invoiceNumber": "BILLSH-MGN2026-0215",
    "timeOfBill": "21-Aug-2026, 10:33",
    "netAmt": 2040,
    "umr": "SAF26000107",
    "patientName": "Mr. Mohammed . Kothari",
    "ageGender": "27Y / Male",
    "personalContact": "9820021478"
  },
  {
    "srNo": 215,
    "invoiceNumber": "BILLSH-MGN2026-0216",
    "timeOfBill": "21-Aug-2026, 13:50",
    "netAmt": 9350,
    "umr": "SAF26000108",
    "patientName": "Mr. Adnaan Kothari",
    "ageGender": "35Y / Male",
    "personalContact": "9821410617"
  },
  {
    "srNo": 216,
    "invoiceNumber": "BILLSH-MGN2026-0217",
    "timeOfBill": "21-Aug-2026, 13:54",
    "netAmt": 9350,
    "umr": "SAF26000107",
    "patientName": "Mr. Mohammed . Kothari",
    "ageGender": "27Y / Male",
    "personalContact": "9820021478"
  },
  {
    "srNo": 217,
    "invoiceNumber": "BILLSH-MGN2026-0218",
    "timeOfBill": "22-Aug-2026, 12:20",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 218,
    "invoiceNumber": "BILLSH-MGN2026-0219",
    "timeOfBill": "22-Aug-2026, 12:23",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 219,
    "invoiceNumber": "BILLSH-MGN2026-0220",
    "timeOfBill": "22-Aug-2026, 12:25",
    "netAmt": 500,
    "umr": "SAF26000097",
    "patientName": "Mr. Zulfikar . Dholkawala",
    "ageGender": "72Y / Male",
    "personalContact": "9819830552"
  },
  {
    "srNo": 220,
    "invoiceNumber": "BILLSH-MGN2026-0221",
    "timeOfBill": "25-Aug-2026, 11:18",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 221,
    "invoiceNumber": "BILLSH-MGN2026-0222",
    "timeOfBill": "25-Aug-2026, 11:28",
    "netAmt": 500,
    "umr": "SAF26000097",
    "patientName": "Mr. Zulfikar . Dholkawala",
    "ageGender": "72Y / Male",
    "personalContact": "9819830552"
  },
  {
    "srNo": 222,
    "invoiceNumber": "BILLSH-MGN2026-0223",
    "timeOfBill": "25-Aug-2026, 13:22",
    "netAmt": 500,
    "umr": "SAF26000109",
    "patientName": "Mrs. Jyotsna Vitthal Kalgutkar",
    "ageGender": "46Y / Female",
    "personalContact": "8509109170"
  },
  {
    "srNo": 223,
    "invoiceNumber": "BILLSH-MGN2026-0224",
    "timeOfBill": "26-Aug-2026, 12:58",
    "netAmt": 500,
    "umr": "SAF26000097",
    "patientName": "Mr. Zulfikar . Dholkawala",
    "ageGender": "72Y / Male",
    "personalContact": "9819830552"
  },
  {
    "srNo": 224,
    "invoiceNumber": "BILLSH-MGN2026-0225",
    "timeOfBill": "26-Aug-2026, 13:03",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 225,
    "invoiceNumber": "BILLSH-MGN2026-0226",
    "timeOfBill": "27-Aug-2026, 10:03",
    "netAmt": 1750,
    "umr": "SAF26000110",
    "patientName": "Mrs. Asgharykhatoon Niyazali .",
    "ageGender": "50Y / Female",
    "personalContact": "9820504286"
  },
  {
    "srNo": 226,
    "invoiceNumber": "BILLSH-MGN2026-0227",
    "timeOfBill": "27-Aug-2026, 10:07",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 227,
    "invoiceNumber": "BILLSH-MGN2026-0228",
    "timeOfBill": "27-Aug-2026, 11:10",
    "netAmt": 500,
    "umr": "SAF26000097",
    "patientName": "Mr. Zulfikar . Dholkawala",
    "ageGender": "72Y / Male",
    "personalContact": "9819830552"
  },
  {
    "srNo": 228,
    "invoiceNumber": "BILLSH-MGN2026-0229",
    "timeOfBill": "27-Aug-2026, 13:23",
    "netAmt": 500,
    "umr": "SAF26000109",
    "patientName": "Mrs. Jyotsna Vitthal Kalgutkar",
    "ageGender": "46Y / Female",
    "personalContact": "8509109170"
  },
  {
    "srNo": 229,
    "invoiceNumber": "BILLSH-MGN2026-0230",
    "timeOfBill": "28-Aug-2026, 16:57",
    "netAmt": 2570,
    "umr": "SAF26000111",
    "patientName": "Mr. Krishiv Jay Ghole",
    "ageGender": "4Y / Male",
    "personalContact": "9870051223"
  },
  {
    "srNo": 230,
    "invoiceNumber": "BILLSH-MGN2026-0231",
    "timeOfBill": "29-Aug-2026, 13:47",
    "netAmt": 500,
    "umr": "SAF26000109",
    "patientName": "Mrs. Jyotsna Vitthal Kalgutkar",
    "ageGender": "46Y / Female",
    "personalContact": "8509109170"
  },
  {
    "srNo": 231,
    "invoiceNumber": "BILLSH-MGN2026-0232",
    "timeOfBill": "29-Aug-2026, 15:23",
    "netAmt": 500,
    "umr": "SAF26000001",
    "patientName": "Mrs. Renuka Tushar Charania",
    "ageGender": "35Y / Female",
    "personalContact": "9870264038"
  },
  {
    "srNo": 232,
    "invoiceNumber": "BILLSH-MGN2026-0233",
    "timeOfBill": "29-Aug-2026, 15:53",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 233,
    "invoiceNumber": "BILLSH-MGN2026-0234",
    "timeOfBill": "29-Aug-2026, 16:57",
    "netAmt": 500,
    "umr": "SAF26000112",
    "patientName": "Mrs. Shehnaz Shaikh",
    "ageGender": "55Y / Female",
    "personalContact": "9820786837"
  },
  {
    "srNo": 234,
    "invoiceNumber": "BILLSH-MGN2026-0235",
    "timeOfBill": "31-Aug-2026, 10:05",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 235,
    "invoiceNumber": "BILLSH-MGN2026-0236",
    "timeOfBill": "31-Aug-2026, 10:51",
    "netAmt": 290,
    "umr": "SAF26000113",
    "patientName": "Mrs. Yasmeen Naaz Shaikh",
    "ageGender": "52Y / Female",
    "personalContact": "969909439"
  },
  {
    "srNo": 236,
    "invoiceNumber": "BILLSH-MGN2026-0237",
    "timeOfBill": "31-Aug-2026, 12:43",
    "netAmt": 500,
    "umr": "SAF26000109",
    "patientName": "Mrs. Jyotsna Vitthal Kalgutkar",
    "ageGender": "46Y / Female",
    "personalContact": "8509109170"
  },
  {
    "srNo": 237,
    "invoiceNumber": "BILLSH-MGN2026-0238",
    "timeOfBill": "31-Aug-2026, 15:04",
    "netAmt": 500,
    "umr": "SAF26000046",
    "patientName": "Mr. Taher Zoeb Basta",
    "ageGender": "45Y / Male",
    "personalContact": "9820100452"
  },
  {
    "srNo": 238,
    "invoiceNumber": "BILLSH-MGN2026-0239",
    "timeOfBill": "31-Aug-2026, 16:28",
    "netAmt": 500,
    "umr": "SAF26000039",
    "patientName": "Ms. Kaushalya Dungraram Parmar",
    "ageGender": "19Y / Female",
    "personalContact": "9372948216"
  },
  {
    "srNo": 239,
    "invoiceNumber": "BILLSH-MGN2026-0240",
    "timeOfBill": "01-Sep-2026, 11:11",
    "netAmt": 500,
    "umr": "SAF26000112",
    "patientName": "Mrs. Shehnaz Shaikh",
    "ageGender": "55Y / Female",
    "personalContact": "9820786837"
  },
  {
    "srNo": 240,
    "invoiceNumber": "BILLSH-MGN2026-0241",
    "timeOfBill": "02-Sep-2026, 09:36",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 241,
    "invoiceNumber": "BILLSH-MGN2026-0242",
    "timeOfBill": "02-Sep-2026, 10:50",
    "netAmt": 790,
    "umr": "SAF26000112",
    "patientName": "Mrs. Shehnaz Shaikh",
    "ageGender": "55Y / Female",
    "personalContact": "9820786837"
  },
  {
    "srNo": 242,
    "invoiceNumber": "BILLSH-MGN2026-0243",
    "timeOfBill": "02-Sep-2026, 10:53",
    "netAmt": 500,
    "umr": "SAF26000114",
    "patientName": "Mrs. Mable Jerald Monis",
    "ageGender": "51Y / Female",
    "personalContact": "8976545614"
  },
  {
    "srNo": 243,
    "invoiceNumber": "BILLSH-MGN2026-0244",
    "timeOfBill": "02-Sep-2026, 12:56",
    "netAmt": 500,
    "umr": "SAF26000109",
    "patientName": "Mrs. Jyotsna Vitthal Kalgutkar",
    "ageGender": "46Y / Female",
    "personalContact": "8509109170"
  },
  {
    "srNo": 244,
    "invoiceNumber": "BILLSH-MGN2026-0245",
    "timeOfBill": "03-Sep-2026, 09:28",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 245,
    "invoiceNumber": "BILLSH-MGN2026-0246",
    "timeOfBill": "03-Sep-2026, 11:26",
    "netAmt": 500,
    "umr": "SAF26000112",
    "patientName": "Mrs. Shehnaz Shaikh",
    "ageGender": "55Y / Female",
    "personalContact": "9820786837"
  },
  {
    "srNo": 246,
    "invoiceNumber": "BILLSH-MGN2026-0247",
    "timeOfBill": "03-Sep-2026, 12:52",
    "netAmt": 500,
    "umr": "SAF26000105",
    "patientName": "Mrs. Rashida Mansoor Champeli",
    "ageGender": "72Y / Female",
    "personalContact": "8380053553"
  },
  {
    "srNo": 247,
    "invoiceNumber": "BILLSH-MGN2026-0248",
    "timeOfBill": "03-Sep-2026, 15:28",
    "netAmt": 800,
    "umr": "SAF26000115",
    "patientName": "Mrs. Memuna Esmail Sarai",
    "ageGender": "72Y / Female",
    "personalContact": "9892225352"
  },
  {
    "srNo": 248,
    "invoiceNumber": "BILLSH-MGN2026-0249",
    "timeOfBill": "04-Sep-2026, 09:31",
    "netAmt": 2000,
    "umr": "SAF26000116",
    "patientName": "Mrs. Rabia . Patel",
    "ageGender": "57Y / Female",
    "personalContact": "9892971739"
  },
  {
    "srNo": 249,
    "invoiceNumber": "BILLSH-MGN2026-0250",
    "timeOfBill": "04-Sep-2026, 09:39",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 250,
    "invoiceNumber": "BILLSH-MGN2026-0251",
    "timeOfBill": "04-Sep-2026, 14:25",
    "netAmt": 500,
    "umr": "SAF26000115",
    "patientName": "Mrs. Memuna Esmail Sarai",
    "ageGender": "72Y / Female",
    "personalContact": "9892225352"
  },
  {
    "srNo": 251,
    "invoiceNumber": "BILLSH-MGN2026-0252",
    "timeOfBill": "05-Sep-2026, 08:36",
    "netAmt": 290,
    "umr": "SAF26000117",
    "patientName": "Mrs. Kavita Kamlakar Bagwe",
    "ageGender": "57Y / Female",
    "personalContact": "9869695009"
  },
  {
    "srNo": 252,
    "invoiceNumber": "BILLSH-MGN2026-0253",
    "timeOfBill": "05-Sep-2026, 09:45",
    "netAmt": 2950,
    "umr": "SAF26000118",
    "patientName": "Mrs. Hetal P Revar",
    "ageGender": "41Y / Female",
    "personalContact": "9930129366"
  },
  {
    "srNo": 253,
    "invoiceNumber": "BILLSH-MGN2026-0254",
    "timeOfBill": "05-Sep-2026, 13:28",
    "netAmt": 500,
    "umr": "SAF26000115",
    "patientName": "Mrs. Memuna Esmail Sarai",
    "ageGender": "72Y / Female",
    "personalContact": "9892225352"
  },
  {
    "srNo": 254,
    "invoiceNumber": "BILLSH-MGN2026-0255",
    "timeOfBill": "07-Sep-2026, 10:45",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 255,
    "invoiceNumber": "BILLSH-MGN2026-0256",
    "timeOfBill": "07-Sep-2026, 10:46",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 256,
    "invoiceNumber": "BILLSH-MGN2026-0257",
    "timeOfBill": "07-Sep-2026, 13:58",
    "netAmt": 500,
    "umr": "SAF26000115",
    "patientName": "Mrs. Memuna Esmail Sarai",
    "ageGender": "72Y / Female",
    "personalContact": "9892225352"
  },
  {
    "srNo": 257,
    "invoiceNumber": "BILLSH-MGN2026-0258",
    "timeOfBill": "07-Sep-2026, 14:51",
    "netAmt": 1043,
    "umr": "SAF26000118",
    "patientName": "Mrs. Hetal P Revar",
    "ageGender": "41Y / Female",
    "personalContact": "9930129366"
  },
  {
    "srNo": 258,
    "invoiceNumber": "BILLSH-MGN2026-0259",
    "timeOfBill": "07-Sep-2026, 17:25",
    "netAmt": 1700,
    "umr": "SAF26000118",
    "patientName": "Mrs. Hetal P Revar",
    "ageGender": "41Y / Female",
    "personalContact": "9930129366"
  },
  {
    "srNo": 259,
    "invoiceNumber": "BILLSH-MGN2026-0260",
    "timeOfBill": "08-Sep-2026, 12:28",
    "netAmt": 1110,
    "umr": "SAF26000119",
    "patientName": "Mrs. Mehrunnisa Mohammed Hanif Supariwala",
    "ageGender": "70Y / Female",
    "personalContact": "9004508587"
  },
  {
    "srNo": 260,
    "invoiceNumber": "BILLSH-MGN2026-0261",
    "timeOfBill": "08-Sep-2026, 14:28",
    "netAmt": 500,
    "umr": "SAF26000109",
    "patientName": "Mrs. Jyotsna Vitthal Kalgutkar",
    "ageGender": "46Y / Female",
    "personalContact": "8509109170"
  },
  {
    "srNo": 261,
    "invoiceNumber": "BILLSH-MGN2026-0262",
    "timeOfBill": "08-Sep-2026, 14:29",
    "netAmt": 500,
    "umr": "SAF26000115",
    "patientName": "Mrs. Memuna Esmail Sarai",
    "ageGender": "72Y / Female",
    "personalContact": "9892225352"
  },
  {
    "srNo": 262,
    "invoiceNumber": "BILLSH-MGN2026-0263",
    "timeOfBill": "09-Sep-2026, 10:17",
    "netAmt": 2170,
    "umr": "SAF26000120",
    "patientName": "Mr. Altaf Mansoor Suratwala",
    "ageGender": "53Y / Male",
    "personalContact": "8866313769"
  },
  {
    "srNo": 263,
    "invoiceNumber": "BILLSH-MGN2026-0264",
    "timeOfBill": "09-Sep-2026, 14:04",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 264,
    "invoiceNumber": "BILLSH-MGN2026-0265",
    "timeOfBill": "10-Sep-2026, 11:21",
    "netAmt": 1490,
    "umr": "SAF26000104",
    "patientName": "Mr. Ashok B Wavhal",
    "ageGender": "67Y / Male",
    "personalContact": "9821268342"
  },
  {
    "srNo": 265,
    "invoiceNumber": "BILLSH-MGN2026-0266",
    "timeOfBill": "10-Sep-2026, 12:10",
    "netAmt": 500,
    "umr": "SAF26000121",
    "patientName": "Mrs. Shahnaaz Abbas Fatehi",
    "ageGender": "66Y / Female",
    "personalContact": "9820746326"
  },
  {
    "srNo": 266,
    "invoiceNumber": "BILLSH-MGN2026-0267",
    "timeOfBill": "10-Sep-2026, 14:42",
    "netAmt": 140,
    "umr": "SAF26000122",
    "patientName": "Mrs. Fatima Furniturewala",
    "ageGender": "75Y / Female",
    "personalContact": "8850306247"
  },
  {
    "srNo": 267,
    "invoiceNumber": "BILLSH-MGN2026-0268",
    "timeOfBill": "11-Sep-2026, 11:45",
    "netAmt": 500,
    "umr": "SAF26000121",
    "patientName": "Mrs. Shahnaaz Abbas Fatehi",
    "ageGender": "66Y / Female",
    "personalContact": "9820746326"
  },
  {
    "srNo": 268,
    "invoiceNumber": "BILLSH-MGN2026-0269",
    "timeOfBill": "11-Sep-2026, 13:08",
    "netAmt": 1460,
    "umr": "SAF26000123",
    "patientName": "Mr. Ahmad Sayeel Wadkar",
    "ageGender": "11Y / Male",
    "personalContact": "9892950564"
  },
  {
    "srNo": 269,
    "invoiceNumber": "BILLSH-MGN2026-0270",
    "timeOfBill": "11-Sep-2026, 14:42",
    "netAmt": 500,
    "umr": "SAF26000115",
    "patientName": "Mrs. Memuna Esmail Sarai",
    "ageGender": "72Y / Female",
    "personalContact": "9892225352"
  },
  {
    "srNo": 270,
    "invoiceNumber": "BILLSH-MGN2026-0271",
    "timeOfBill": "12-Sep-2026, 08:33",
    "netAmt": 500,
    "umr": "SAF26000121",
    "patientName": "Mrs. Shahnaaz Abbas Fatehi",
    "ageGender": "66Y / Female",
    "personalContact": "9820746326"
  },
  {
    "srNo": 271,
    "invoiceNumber": "BILLSH-MGN2026-0272",
    "timeOfBill": "12-Sep-2026, 10:23",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 272,
    "invoiceNumber": "BILLSH-MGN2026-0273",
    "timeOfBill": "12-Sep-2026, 14:49",
    "netAmt": 500,
    "umr": "SAF26000115",
    "patientName": "Mrs. Memuna Esmail Sarai",
    "ageGender": "72Y / Female",
    "personalContact": "9892225352"
  },
  {
    "srNo": 273,
    "invoiceNumber": "BILLSH-MGN2026-0274",
    "timeOfBill": "15-Sep-2026, 12:01",
    "netAmt": 290,
    "umr": "SAF26000122",
    "patientName": "Mrs. Fatima Furniturewala",
    "ageGender": "75Y / Female",
    "personalContact": "8850306247"
  },
  {
    "srNo": 274,
    "invoiceNumber": "BILLSH-MGN2026-0275",
    "timeOfBill": "15-Sep-2026, 12:21",
    "netAmt": 500,
    "umr": "SAF26000121",
    "patientName": "Mrs. Shahnaaz Abbas Fatehi",
    "ageGender": "66Y / Female",
    "personalContact": "9820746326"
  },
  {
    "srNo": 275,
    "invoiceNumber": "BILLSH-MGN2026-0276",
    "timeOfBill": "15-Sep-2026, 13:11",
    "netAmt": 320,
    "umr": "SAF26000123",
    "patientName": "Mr. Ahmad Sayeel Wadkar",
    "ageGender": "11Y / Male",
    "personalContact": "9892950564"
  },
  {
    "srNo": 276,
    "invoiceNumber": "BILLSH-MGN2026-0277",
    "timeOfBill": "15-Sep-2026, 14:57",
    "netAmt": 500,
    "umr": "SAF26000115",
    "patientName": "Mrs. Memuna Esmail Sarai",
    "ageGender": "72Y / Female",
    "personalContact": "9892225352"
  },
  {
    "srNo": 277,
    "invoiceNumber": "BILLSH-MGN2026-0278",
    "timeOfBill": "16-Sep-2026, 09:22",
    "netAmt": 500,
    "umr": "SAF26000114",
    "patientName": "Mrs. Mable Jerald Monis",
    "ageGender": "51Y / Female",
    "personalContact": "8976545614"
  },
  {
    "srNo": 278,
    "invoiceNumber": "BILLSH-MGN2026-0279",
    "timeOfBill": "16-Sep-2026, 10:11",
    "netAmt": 2743,
    "umr": "SAF26000124",
    "patientName": "Ms. Priti Pranjivan Bahuva",
    "ageGender": "53Y / Female",
    "personalContact": "9930598306"
  },
  {
    "srNo": 279,
    "invoiceNumber": "BILLSH-MGN2026-0280",
    "timeOfBill": "16-Sep-2026, 10:20",
    "netAmt": 1720,
    "umr": "SAF26000095",
    "patientName": "Mr. Ahmad Kapadia",
    "ageGender": "10Y / Male",
    "personalContact": "9820774843"
  },
  {
    "srNo": 280,
    "invoiceNumber": "BILLSH-MGN2026-0281",
    "timeOfBill": "16-Sep-2026, 11:51",
    "netAmt": 500,
    "umr": "SAF26000121",
    "patientName": "Mrs. Shahnaaz Abbas Fatehi",
    "ageGender": "66Y / Female",
    "personalContact": "9820746326"
  },
  {
    "srNo": 281,
    "invoiceNumber": "BILLSH-MGN2026-0282",
    "timeOfBill": "16-Sep-2026, 11:56",
    "netAmt": 300,
    "umr": "SAF26000124",
    "patientName": "Ms. Priti Pranjivan Bahuva",
    "ageGender": "53Y / Female",
    "personalContact": "9930598306"
  },
  {
    "srNo": 282,
    "invoiceNumber": "BILLSH-MGN2026-0283",
    "timeOfBill": "16-Sep-2026, 13:49",
    "netAmt": 500,
    "umr": "SAF26000115",
    "patientName": "Mrs. Memuna Esmail Sarai",
    "ageGender": "72Y / Female",
    "personalContact": "9892225352"
  },
  {
    "srNo": 283,
    "invoiceNumber": "BILLSH-MGN2026-0284",
    "timeOfBill": "17-Sep-2026, 09:09",
    "netAmt": 3000,
    "umr": "SAF26000125",
    "patientName": "Ms. Tasneem Raza Kadri",
    "ageGender": "59Y / Female",
    "personalContact": "9029902108"
  },
  {
    "srNo": 284,
    "invoiceNumber": "BILLSH-MGN2026-0285",
    "timeOfBill": "17-Sep-2026, 09:55",
    "netAmt": 500,
    "umr": "SAF26000114",
    "patientName": "Mrs. Mable Jerald Monis",
    "ageGender": "51Y / Female",
    "personalContact": "8976545614"
  },
  {
    "srNo": 285,
    "invoiceNumber": "BILLSH-MGN2026-0286",
    "timeOfBill": "17-Sep-2026, 11:27",
    "netAmt": 320,
    "umr": "SAF26000126",
    "patientName": "Ms. Urwa Kadri",
    "ageGender": "28Y / Female",
    "personalContact": "9768127862"
  },
  {
    "srNo": 286,
    "invoiceNumber": "BILLSH-MGN2026-0287",
    "timeOfBill": "17-Sep-2026, 12:50",
    "netAmt": 800,
    "umr": "SAF26000127",
    "patientName": "Mrs. Manjula Prem Chand Jain",
    "ageGender": "75Y / Female",
    "personalContact": "9930904481"
  },
  {
    "srNo": 287,
    "invoiceNumber": "BILLSH-MGN2026-0288",
    "timeOfBill": "17-Sep-2026, 13:06",
    "netAmt": 500,
    "umr": "SAF26000121",
    "patientName": "Mrs. Shahnaaz Abbas Fatehi",
    "ageGender": "66Y / Female",
    "personalContact": "9820746326"
  },
  {
    "srNo": 288,
    "invoiceNumber": "BILLSH-MGN2026-0289",
    "timeOfBill": "17-Sep-2026, 14:22",
    "netAmt": 500,
    "umr": "SAF26000115",
    "patientName": "Mrs. Memuna Esmail Sarai",
    "ageGender": "72Y / Female",
    "personalContact": "9892225352"
  },
  {
    "srNo": 289,
    "invoiceNumber": "BILLSH-MGN2026-0290",
    "timeOfBill": "18-Sep-2026, 09:24",
    "netAmt": 290,
    "umr": "SAF26000128",
    "patientName": "Mrs. Asha Ashok Wawhal",
    "ageGender": "62Y / Female",
    "personalContact": "9821268342"
  },
  {
    "srNo": 290,
    "invoiceNumber": "BILLSH-MGN2026-0291",
    "timeOfBill": "18-Sep-2026, 10:13",
    "netAmt": 500,
    "umr": "SAF26000114",
    "patientName": "Mrs. Mable Jerald Monis",
    "ageGender": "51Y / Female",
    "personalContact": "8976545614"
  },
  {
    "srNo": 291,
    "invoiceNumber": "BILLSH-MGN2026-0292",
    "timeOfBill": "18-Sep-2026, 11:02",
    "netAmt": 800,
    "umr": "SAF26000127",
    "patientName": "Mrs. Manjula Prem Chand Jain",
    "ageGender": "75Y / Female",
    "personalContact": "9930904481"
  },
  {
    "srNo": 292,
    "invoiceNumber": "BILLSH-MGN2026-0293",
    "timeOfBill": "18-Sep-2026, 11:29",
    "netAmt": 290,
    "umr": "SAF26000122",
    "patientName": "Mrs. Fatima Furniturewala",
    "ageGender": "75Y / Female",
    "personalContact": "8850306247"
  },
  {
    "srNo": 293,
    "invoiceNumber": "BILLSH-MGN2026-0294",
    "timeOfBill": "18-Sep-2026, 12:10",
    "netAmt": 500,
    "umr": "SAF26000121",
    "patientName": "Mrs. Shahnaaz Abbas Fatehi",
    "ageGender": "66Y / Female",
    "personalContact": "9820746326"
  },
  {
    "srNo": 294,
    "invoiceNumber": "BILLSH-MGN2026-0295",
    "timeOfBill": "18-Sep-2026, 13:07",
    "netAmt": 500,
    "umr": "SAF26000129",
    "patientName": "Mr. Yusuf Fakhruddin Pocketwala",
    "ageGender": "59Y / Male",
    "personalContact": "9821575297"
  },
  {
    "srNo": 295,
    "invoiceNumber": "BILLSH-MGN2026-0296",
    "timeOfBill": "18-Sep-2026, 13:37",
    "netAmt": 500,
    "umr": "SAF26000115",
    "patientName": "Mrs. Memuna Esmail Sarai",
    "ageGender": "72Y / Female",
    "personalContact": "9892225352"
  },
  {
    "srNo": 296,
    "invoiceNumber": "BILLSH-MGN2026-0297",
    "timeOfBill": "19-Sep-2026, 09:30",
    "netAmt": 800,
    "umr": "SAF26000127",
    "patientName": "Mrs. Manjula Prem Chand Jain",
    "ageGender": "75Y / Female",
    "personalContact": "9930904481"
  },
  {
    "srNo": 297,
    "invoiceNumber": "BILLSH-MGN2026-0298",
    "timeOfBill": "19-Sep-2026, 10:15",
    "netAmt": 500,
    "umr": "SAF26000114",
    "patientName": "Mrs. Mable Jerald Monis",
    "ageGender": "51Y / Female",
    "personalContact": "8976545614"
  },
  {
    "srNo": 298,
    "invoiceNumber": "BILLSH-MGN2026-0299",
    "timeOfBill": "19-Sep-2026, 11:05",
    "netAmt": 1700,
    "umr": "SAF26000124",
    "patientName": "Ms. Priti Pranjivan Bahuva",
    "ageGender": "53Y / Female",
    "personalContact": "9930598306"
  },
  {
    "srNo": 299,
    "invoiceNumber": "BILLSH-MGN2026-0300",
    "timeOfBill": "19-Sep-2026, 11:23",
    "netAmt": 500,
    "umr": "SAF26000121",
    "patientName": "Mrs. Shahnaaz Abbas Fatehi",
    "ageGender": "66Y / Female",
    "personalContact": "9820746326"
  },
  {
    "srNo": 300,
    "invoiceNumber": "BILLSH-MGN2026-0301",
    "timeOfBill": "19-Sep-2026, 12:52",
    "netAmt": 500,
    "umr": "SAF26000129",
    "patientName": "Mr. Yusuf Fakhruddin Pocketwala",
    "ageGender": "59Y / Male",
    "personalContact": "9821575297"
  },
  {
    "srNo": 301,
    "invoiceNumber": "BILLSH-MGN2026-0302",
    "timeOfBill": "21-Sep-2026, 10:15",
    "netAmt": 500,
    "umr": "SAF26000114",
    "patientName": "Mrs. Mable Jerald Monis",
    "ageGender": "51Y / Female",
    "personalContact": "8976545614"
  },
  {
    "srNo": 302,
    "invoiceNumber": "BILLSH-MGN2026-0303",
    "timeOfBill": "21-Sep-2026, 10:17",
    "netAmt": 2050,
    "umr": "SAF26000118",
    "patientName": "Mrs. Hetal P Revar",
    "ageGender": "41Y / Female",
    "personalContact": "9930129366"
  },
  {
    "srNo": 303,
    "invoiceNumber": "BILLSH-MGN2026-0304",
    "timeOfBill": "21-Sep-2026, 11:09",
    "netAmt": 500,
    "umr": "SAF26000121",
    "patientName": "Mrs. Shahnaaz Abbas Fatehi",
    "ageGender": "66Y / Female",
    "personalContact": "9820746326"
  },
  {
    "srNo": 304,
    "invoiceNumber": "BILLSH-MGN2026-0305",
    "timeOfBill": "21-Sep-2026, 11:22",
    "netAmt": 500,
    "umr": "SAF26000131",
    "patientName": "Mr. Husain Yusuf Kanchwala",
    "ageGender": "41Y / Male",
    "personalContact": "9920406210"
  },
  {
    "srNo": 305,
    "invoiceNumber": "BILLSH-MGN2026-0306",
    "timeOfBill": "21-Sep-2026, 12:55",
    "netAmt": 500,
    "umr": "SAF26000129",
    "patientName": "Mr. Yusuf Fakhruddin Pocketwala",
    "ageGender": "59Y / Male",
    "personalContact": "9821575297"
  },
  {
    "srNo": 306,
    "invoiceNumber": "BILLSH-MGN2026-0307",
    "timeOfBill": "21-Sep-2026, 14:09",
    "netAmt": 1043,
    "umr": "SAF26000118",
    "patientName": "Mrs. Hetal P Revar",
    "ageGender": "41Y / Female",
    "personalContact": "9930129366"
  },
  {
    "srNo": 307,
    "invoiceNumber": "BILLSH-MGN2026-0308",
    "timeOfBill": "21-Sep-2026, 14:57",
    "netAmt": 800,
    "umr": "SAF26000132",
    "patientName": "Ms. Megha Ramzan Khan",
    "ageGender": "22Y / Female",
    "personalContact": "8591565545"
  },
  {
    "srNo": 308,
    "invoiceNumber": "BILLSH-MGN2026-0309",
    "timeOfBill": "22-Sep-2026, 08:57",
    "netAmt": 290,
    "umr": "SAF26000133",
    "patientName": "Mr. Mohd Hanif Mohd Shariff Galiyara",
    "ageGender": "77Y / Male",
    "personalContact": "8655288270"
  },
  {
    "srNo": 309,
    "invoiceNumber": "BILLSH-MGN2026-0310",
    "timeOfBill": "22-Sep-2026, 09:23",
    "netAmt": 1800,
    "umr": "SAF26000119",
    "patientName": "Mrs. Mehrunnisa Mohammed Hanif Supariwala",
    "ageGender": "70Y / Female",
    "personalContact": "9004508587"
  },
  {
    "srNo": 310,
    "invoiceNumber": "BILLSH-MGN2026-0311",
    "timeOfBill": "22-Sep-2026, 10:16",
    "netAmt": 290,
    "umr": "SAF26000134",
    "patientName": "Ms. Elizabeth Gertrude Dsouza",
    "ageGender": "76Y / Female",
    "personalContact": "9833771113"
  },
  {
    "srNo": 311,
    "invoiceNumber": "BILLSH-MGN2026-0312",
    "timeOfBill": "22-Sep-2026, 10:31",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 312,
    "invoiceNumber": "BILLSH-MGN2026-0313",
    "timeOfBill": "22-Sep-2026, 11:22",
    "netAmt": 500,
    "umr": "SAF26000121",
    "patientName": "Mrs. Shahnaaz Abbas Fatehi",
    "ageGender": "66Y / Female",
    "personalContact": "9820746326"
  },
  {
    "srNo": 313,
    "invoiceNumber": "BILLSH-MGN2026-0314",
    "timeOfBill": "22-Sep-2026, 11:31",
    "netAmt": 500,
    "umr": "SAF26000131",
    "patientName": "Mr. Husain Yusuf Kanchwala",
    "ageGender": "41Y / Male",
    "personalContact": "9920406210"
  },
  {
    "srNo": 314,
    "invoiceNumber": "BILLSH-MGN2026-0315",
    "timeOfBill": "22-Sep-2026, 12:11",
    "netAmt": 2000,
    "umr": "SAF26000135",
    "patientName": "Mr. Yusuf Gulamali Kanchwala",
    "ageGender": "72Y / Male",
    "personalContact": "9920406210"
  },
  {
    "srNo": 315,
    "invoiceNumber": "BILLSH-MGN2026-0316",
    "timeOfBill": "22-Sep-2026, 13:04",
    "netAmt": 500,
    "umr": "SAF26000136",
    "patientName": "Mr. Aliasgar Zujar Halvadwala",
    "ageGender": "34Y / Male",
    "personalContact": "9967951178"
  },
  {
    "srNo": 316,
    "invoiceNumber": "BILLSH-MGN2026-0317",
    "timeOfBill": "22-Sep-2026, 13:25",
    "netAmt": 500,
    "umr": "SAF26000129",
    "patientName": "Mr. Yusuf Fakhruddin Pocketwala",
    "ageGender": "59Y / Male",
    "personalContact": "9821575297"
  },
  {
    "srNo": 317,
    "invoiceNumber": "BILLSH-MGN2026-0318",
    "timeOfBill": "22-Sep-2026, 14:02",
    "netAmt": 2743,
    "umr": "SAF26000124",
    "patientName": "Ms. Priti Pranjivan Bahuva",
    "ageGender": "53Y / Female",
    "personalContact": "9930598306"
  },
  {
    "srNo": 318,
    "invoiceNumber": "BILLSH-MGN2026-0319",
    "timeOfBill": "22-Sep-2026, 14:52",
    "netAmt": 800,
    "umr": "SAF26000132",
    "patientName": "Ms. Megha Ramzan Khan",
    "ageGender": "22Y / Female",
    "personalContact": "8591565545"
  },
  {
    "srNo": 319,
    "invoiceNumber": "BILLSH-MGN2026-0320",
    "timeOfBill": "22-Sep-2026, 15:50",
    "netAmt": 500,
    "umr": "SAF26000109",
    "patientName": "Mrs. Jyotsna Vitthal Kalgutkar",
    "ageGender": "46Y / Female",
    "personalContact": "8509109170"
  },
  {
    "srNo": 320,
    "invoiceNumber": "BILLSH-MGN2026-0321",
    "timeOfBill": "23-Sep-2026, 10:25",
    "netAmt": 500,
    "umr": "SAF26000114",
    "patientName": "Mrs. Mable Jerald Monis",
    "ageGender": "51Y / Female",
    "personalContact": "8976545614"
  },
  {
    "srNo": 321,
    "invoiceNumber": "BILLSH-MGN2026-0322",
    "timeOfBill": "23-Sep-2026, 11:16",
    "netAmt": 500,
    "umr": "SAF26000131",
    "patientName": "Mr. Husain Yusuf Kanchwala",
    "ageGender": "41Y / Male",
    "personalContact": "9920406210"
  },
  {
    "srNo": 322,
    "invoiceNumber": "BILLSH-MGN2026-0323",
    "timeOfBill": "23-Sep-2026, 12:48",
    "netAmt": 500,
    "umr": "SAF26000129",
    "patientName": "Mr. Yusuf Fakhruddin Pocketwala",
    "ageGender": "59Y / Male",
    "personalContact": "9821575297"
  },
  {
    "srNo": 323,
    "invoiceNumber": "BILLSH-MGN2026-0324",
    "timeOfBill": "24-Sep-2026, 10:21",
    "netAmt": 500,
    "umr": "SAF26000114",
    "patientName": "Mrs. Mable Jerald Monis",
    "ageGender": "51Y / Female",
    "personalContact": "8976545614"
  },
  {
    "srNo": 324,
    "invoiceNumber": "BILLSH-MGN2026-0325",
    "timeOfBill": "24-Sep-2026, 10:23",
    "netAmt": 500,
    "umr": "SAF26000114",
    "patientName": "Mrs. Mable Jerald Monis",
    "ageGender": "51Y / Female",
    "personalContact": "8976545614"
  },
  {
    "srNo": 325,
    "invoiceNumber": "BILLSH-MGN2026-0326",
    "timeOfBill": "24-Sep-2026, 10:34",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 326,
    "invoiceNumber": "BILLSH-MGN2026-0327",
    "timeOfBill": "24-Sep-2026, 12:36",
    "netAmt": 500,
    "umr": "SAF26000129",
    "patientName": "Mr. Yusuf Fakhruddin Pocketwala",
    "ageGender": "59Y / Male",
    "personalContact": "9821575297"
  },
  {
    "srNo": 327,
    "invoiceNumber": "BILLSH-MGN2026-0328",
    "timeOfBill": "24-Sep-2026, 16:36",
    "netAmt": 500,
    "umr": "SAF26000109",
    "patientName": "Mrs. Jyotsna Vitthal Kalgutkar",
    "ageGender": "46Y / Female",
    "personalContact": "8509109170"
  },
  {
    "srNo": 328,
    "invoiceNumber": "BILLSH-MGN2026-0330",
    "timeOfBill": "25-Sep-2026, 09:40",
    "netAmt": 610,
    "umr": "SAF26000138",
    "patientName": "Ms. Nandini Dilip Shinde",
    "ageGender": "47Y / Female",
    "personalContact": "9869609093"
  },
  {
    "srNo": 329,
    "invoiceNumber": "BILLSH-MGN2026-0331",
    "timeOfBill": "25-Sep-2026, 09:54",
    "netAmt": 2600,
    "umr": "SAF26000139",
    "patientName": "Mr. Abbas Ali",
    "ageGender": "66Y / Male",
    "personalContact": "8452885295"
  },
  {
    "srNo": 330,
    "invoiceNumber": "BILLSH-MGN2026-0332",
    "timeOfBill": "25-Sep-2026, 10:14",
    "netAmt": 290,
    "umr": "SAF26000128",
    "patientName": "Mrs. Asha Ashok Wawhal",
    "ageGender": "62Y / Female",
    "personalContact": "9821268342"
  },
  {
    "srNo": 331,
    "invoiceNumber": "BILLSH-MGN2026-0333",
    "timeOfBill": "25-Sep-2026, 10:47",
    "netAmt": 2655,
    "umr": "SAF26000124",
    "patientName": "Ms. Priti Pranjivan Bahuva",
    "ageGender": "53Y / Female",
    "personalContact": "9930598306"
  },
  {
    "srNo": 332,
    "invoiceNumber": "BILLSH-MGN2026-0334",
    "timeOfBill": "25-Sep-2026, 10:56",
    "netAmt": 500,
    "umr": "SAF26000114",
    "patientName": "Mrs. Mable Jerald Monis",
    "ageGender": "51Y / Female",
    "personalContact": "8976545614"
  },
  {
    "srNo": 333,
    "invoiceNumber": "BILLSH-MGN2026-0335",
    "timeOfBill": "25-Sep-2026, 10:57",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 334,
    "invoiceNumber": "BILLSH-MGN2026-0336",
    "timeOfBill": "25-Sep-2026, 12:35",
    "netAmt": 4425,
    "umr": "SAF26000140",
    "patientName": "Mrs. Mandakini Raya Pawar",
    "ageGender": "73Y / Female",
    "personalContact": "8082446476"
  },
  {
    "srNo": 335,
    "invoiceNumber": "BILLSH-MGN2026-0337",
    "timeOfBill": "25-Sep-2026, 13:12",
    "netAmt": 150,
    "umr": "SAF26000140",
    "patientName": "Mrs. Mandakini Raya Pawar",
    "ageGender": "73Y / Female",
    "personalContact": "8082446476"
  },
  {
    "srNo": 336,
    "invoiceNumber": "BILLSH-MGN2026-0338",
    "timeOfBill": "25-Sep-2026, 13:58",
    "netAmt": 500,
    "umr": "SAF26000043",
    "patientName": "Mrs. Jumana Hatim Merchant",
    "ageGender": "46Y / Female",
    "personalContact": "9892767252"
  },
  {
    "srNo": 337,
    "invoiceNumber": "BILLSH-MGN2026-0339",
    "timeOfBill": "25-Sep-2026, 13:59",
    "netAmt": 500,
    "umr": "SAF26000136",
    "patientName": "Mr. Aliasgar Zujar Halvadwala",
    "ageGender": "34Y / Male",
    "personalContact": "9967951178"
  },
  {
    "srNo": 338,
    "invoiceNumber": "BILLSH-MGN2026-0340",
    "timeOfBill": "25-Sep-2026, 14:00",
    "netAmt": 500,
    "umr": "SAF26000129",
    "patientName": "Mr. Yusuf Fakhruddin Pocketwala",
    "ageGender": "59Y / Male",
    "personalContact": "9821575297"
  },
  {
    "srNo": 339,
    "invoiceNumber": "BILLSH-MGN2026-0341",
    "timeOfBill": "26-Sep-2026, 09:20",
    "netAmt": 1460,
    "umr": "SAF26000141",
    "patientName": "Mr. Ahmad Kaba",
    "ageGender": "37Y / Male",
    "personalContact": "9819673051"
  },
  {
    "srNo": 340,
    "invoiceNumber": "BILLSH-MGN2026-0342",
    "timeOfBill": "26-Sep-2026, 15:13",
    "netAmt": 6176,
    "umr": "SAF26000142",
    "patientName": "Mrs. Afsaana Salim Maniyar",
    "ageGender": "39Y / Female",
    "personalContact": "9819979840"
  },
  {
    "srNo": 341,
    "invoiceNumber": "BILLSH-MGN2026-0343",
    "timeOfBill": "28-Sep-2026, 10:19",
    "netAmt": 500,
    "umr": "SAF26000114",
    "patientName": "Mrs. Mable Jerald Monis",
    "ageGender": "51Y / Female",
    "personalContact": "8976545614"
  },
  {
    "srNo": 342,
    "invoiceNumber": "BILLSH-MGN2026-0344",
    "timeOfBill": "28-Sep-2026, 12:19",
    "netAmt": 1000,
    "umr": "SAF26000143",
    "patientName": "Mr. Hasmukh Devichandji Jain",
    "ageGender": "56Y / Male",
    "personalContact": "8356020980"
  },
  {
    "srNo": 343,
    "invoiceNumber": "BILLSH-MGN2026-0345",
    "timeOfBill": "28-Sep-2026, 12:37",
    "netAmt": 500,
    "umr": "SAF26000129",
    "patientName": "Mr. Yusuf Fakhruddin Pocketwala",
    "ageGender": "59Y / Male",
    "personalContact": "9821575297"
  },
  {
    "srNo": 344,
    "invoiceNumber": "BILLSH-MGN2026-0346",
    "timeOfBill": "28-Sep-2026, 13:44",
    "netAmt": 2743,
    "umr": "SAF26000124",
    "patientName": "Ms. Priti Pranjivan Bahuva",
    "ageGender": "53Y / Female",
    "personalContact": "9930598306"
  },
  {
    "srNo": 345,
    "invoiceNumber": "BILLSH-MGN2026-0347",
    "timeOfBill": "29-Sep-2026, 09:10",
    "netAmt": 1020,
    "umr": "SAF26000141",
    "patientName": "Mr. Ahmad Kaba",
    "ageGender": "37Y / Male",
    "personalContact": "9819673051"
  },
  {
    "srNo": 346,
    "invoiceNumber": "BILLSH-MGN2026-0348",
    "timeOfBill": "29-Sep-2026, 10:16",
    "netAmt": 500,
    "umr": "SAF26000114",
    "patientName": "Mrs. Mable Jerald Monis",
    "ageGender": "51Y / Female",
    "personalContact": "8976545614"
  },
  {
    "srNo": 347,
    "invoiceNumber": "BILLSH-MGN2026-0349",
    "timeOfBill": "29-Sep-2026, 12:15",
    "netAmt": 735,
    "umr": "SAF26000141",
    "patientName": "Mr. Ahmad Kaba",
    "ageGender": "45Y / Male",
    "personalContact": "9819673051"
  },
  {
    "srNo": 348,
    "invoiceNumber": "BILLSH-MGN2026-0350",
    "timeOfBill": "29-Sep-2026, 12:55",
    "netAmt": 500,
    "umr": "SAF26000121",
    "patientName": "Mrs. Shahnaaz Abbas Fatehi",
    "ageGender": "66Y / Female",
    "personalContact": "9820746326"
  },
  {
    "srNo": 349,
    "invoiceNumber": "BILLSH-MGN2026-0351",
    "timeOfBill": "29-Sep-2026, 13:39",
    "netAmt": 500,
    "umr": "SAF26000005",
    "patientName": "Mr. Nooruddin Badruddin Gillani",
    "ageGender": "66Y / Male",
    "personalContact": "9820001775"
  },
  {
    "srNo": 350,
    "invoiceNumber": "BILLSH-MGN2026-0352",
    "timeOfBill": "30-Sep-2026, 09:50",
    "netAmt": 3870,
    "umr": "SAF26000143",
    "patientName": "Mr. Hasmukh Devichandji Jain",
    "ageGender": "56Y / Male",
    "personalContact": "8356020980"
  },
  {
    "srNo": 351,
    "invoiceNumber": "BILLSH-MGN2026-0353",
    "timeOfBill": "30-Sep-2026, 10:16",
    "netAmt": 2743,
    "umr": "SAF26000143",
    "patientName": "Mr. Hasmukh Devichandji Jain",
    "ageGender": "56Y / Male",
    "personalContact": "8356020980"
  },
  {
    "srNo": 352,
    "invoiceNumber": "BILLSH-MGN2026-0354",
    "timeOfBill": "30-Sep-2026, 10:39",
    "netAmt": 300,
    "umr": "SAF26000124",
    "patientName": "Ms. Priti Pranjivan Bahuva",
    "ageGender": "53Y / Female",
    "personalContact": "9930598306"
  },
  {
    "srNo": 353,
    "invoiceNumber": "BILLSH-MGN2026-0355",
    "timeOfBill": "30-Sep-2026, 10:48",
    "netAmt": 1700,
    "umr": "SAF26000124",
    "patientName": "Ms. Priti Pranjivan Bahuva",
    "ageGender": "53Y / Female",
    "personalContact": "9930598306"
  },
  {
    "srNo": 355,
    "invoiceNumber": "BILLSH-MGN2026-0356",
    "timeOfBill": "01-Oct-2026, 12:14",
    "netAmt": 500,
    "umr": "SAF26000121",
    "patientName": "Mrs. Shahnaaz Abbas Fatehi",
    "ageGender": "66Y / Female",
    "personalContact": "9820746326"
  },
  {
    "srNo": 356,
    "invoiceNumber": "BILLSH-MGN2026-0357",
    "timeOfBill": "01-Oct-2026, 12:51",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 357,
    "invoiceNumber": "BILLSH-MGN2026-0358",
    "timeOfBill": "03-Oct-2026, 09:46",
    "netAmt": 1300,
    "umr": "SAF26000105",
    "patientName": "Mrs. Rashida Mansoor Champeli",
    "ageGender": "72Y / Female",
    "personalContact": "8380053553"
  },
  {
    "srNo": 358,
    "invoiceNumber": "BILLSH-MGN2026-0359",
    "timeOfBill": "03-Oct-2026, 10:11",
    "netAmt": 2743,
    "umr": "SAF26000124",
    "patientName": "Ms. Priti Pranjivan Bahuva",
    "ageGender": "53Y / Female",
    "personalContact": "9930598306"
  },
  {
    "srNo": 359,
    "invoiceNumber": "BILLSH-MGN2026-0360",
    "timeOfBill": "03-Oct-2026, 12:31",
    "netAmt": 500,
    "umr": "SAF26000121",
    "patientName": "Mrs. Shahnaaz Abbas Fatehi",
    "ageGender": "66Y / Female",
    "personalContact": "9820746326"
  },
  {
    "srNo": 360,
    "invoiceNumber": "BILLSH-MGN2026-0361",
    "timeOfBill": "05-Oct-2026, 10:07",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 361,
    "invoiceNumber": "BILLSH-MGN2026-0362",
    "timeOfBill": "05-Oct-2026, 13:53",
    "netAmt": 5830,
    "umr": "SAF26000144",
    "patientName": "Mrs. Tasneem Taher Basta",
    "ageGender": "40Y / Female",
    "personalContact": "9619900452"
  },
  {
    "srNo": 362,
    "invoiceNumber": "BILLSH-MGN2026-0363",
    "timeOfBill": "05-Oct-2026, 13:57",
    "netAmt": 3470,
    "umr": "SAF26000145",
    "patientName": "Ms. Lamya Taher Basta",
    "ageGender": "16Y / Female",
    "personalContact": "9619900452"
  },
  {
    "srNo": 363,
    "invoiceNumber": "BILLSH-MGN2026-0364",
    "timeOfBill": "06-Oct-2026, 09:24",
    "netAmt": 1860,
    "umr": "SAF26000147",
    "patientName": "Mr. Husain Abbas Ali",
    "ageGender": "15Y / Male",
    "personalContact": "8452885295"
  },
  {
    "srNo": 364,
    "invoiceNumber": "BILLSH-MGN2026-0365",
    "timeOfBill": "06-Oct-2026, 09:56",
    "netAmt": 4765,
    "umr": "SAF26000021",
    "patientName": "Mr. Abdullah . Electricwala",
    "ageGender": "78Y / Male",
    "personalContact": "9821213734"
  },
  {
    "srNo": 365,
    "invoiceNumber": "BILLSH-MGN2026-0366",
    "timeOfBill": "06-Oct-2026, 10:01",
    "netAmt": 1700,
    "umr": "SAF26000124",
    "patientName": "Ms. Priti Pranjivan Bahuva",
    "ageGender": "53Y / Female",
    "personalContact": "9930598306"
  },
  {
    "srNo": 366,
    "invoiceNumber": "BILLSH-MGN2026-0367",
    "timeOfBill": "06-Oct-2026, 10:42",
    "netAmt": 150,
    "umr": "SAF26000146",
    "patientName": "Mr. Mustafa Hakimuddin Khokha",
    "ageGender": "49Y / Male",
    "personalContact": "9167405152"
  },
  {
    "srNo": 367,
    "invoiceNumber": "BILLSH-MGN2026-0368",
    "timeOfBill": "06-Oct-2026, 11:30",
    "netAmt": 500,
    "umr": "SAF26000146",
    "patientName": "Mr. Mustafa Hakimuddin Khokha",
    "ageGender": "49Y / Male",
    "personalContact": "9167405152"
  },
  {
    "srNo": 368,
    "invoiceNumber": "BILLSH-MGN2026-0369",
    "timeOfBill": "06-Oct-2026, 11:41",
    "netAmt": 500,
    "umr": "SAF26000121",
    "patientName": "Mrs. Shahnaaz Abbas Fatehi",
    "ageGender": "66Y / Female",
    "personalContact": "9820746326"
  },
  {
    "srNo": 369,
    "invoiceNumber": "BILLSH-MGN2026-0370",
    "timeOfBill": "06-Oct-2026, 13:42",
    "netAmt": 500,
    "umr": "SAF26000005",
    "patientName": "Mr. Nooruddin Badruddin Gillani",
    "ageGender": "66Y / Male",
    "personalContact": "9820001775"
  },
  {
    "srNo": 370,
    "invoiceNumber": "BILLSH-MGN2026-0371",
    "timeOfBill": "07-Oct-2026, 09:08",
    "netAmt": 2370,
    "umr": "SAF26000148",
    "patientName": "Ms. Farida Hamza Amreliwala",
    "ageGender": "67Y / Female",
    "personalContact": "9820473030"
  },
  {
    "srNo": 371,
    "invoiceNumber": "BILLSH-MGN2026-0372",
    "timeOfBill": "07-Oct-2026, 11:30",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 372,
    "invoiceNumber": "BILLSH-MGN2026-0373",
    "timeOfBill": "07-Oct-2026, 13:37",
    "netAmt": 1043,
    "umr": "SAF26000118",
    "patientName": "Mrs. Hetal P Revar",
    "ageGender": "41Y / Female",
    "personalContact": "9930129366"
  },
  {
    "srNo": 373,
    "invoiceNumber": "BILLSH-MGN2026-0374",
    "timeOfBill": "08-Oct-2026, 09:19",
    "netAmt": 2200,
    "umr": "SAF26000149",
    "patientName": "Mr. Abbas Mahuvawala",
    "ageGender": "57Y / Male",
    "personalContact": "9004699316"
  },
  {
    "srNo": 374,
    "invoiceNumber": "BILLSH-MGN2026-0375",
    "timeOfBill": "08-Oct-2026, 11:58",
    "netAmt": 2120,
    "umr": "SAF26000150",
    "patientName": "Mrs. Ayesha Rizvi",
    "ageGender": "31Y / Female",
    "personalContact": "9721244449"
  },
  {
    "srNo": 375,
    "invoiceNumber": "BILLSH-MGN2026-0376",
    "timeOfBill": "08-Oct-2026, 17:58",
    "netAmt": 500,
    "umr": "SAF26000121",
    "patientName": "Mrs. Shahnaaz Abbas Fatehi",
    "ageGender": "66Y / Female",
    "personalContact": "9820746326"
  },
  {
    "srNo": 376,
    "invoiceNumber": "BILLSH-MGN2026-0377",
    "timeOfBill": "09-Oct-2026, 09:04",
    "netAmt": 2120,
    "umr": "SAF26000151",
    "patientName": "Ms. Fatema Aliasgar Attarwala",
    "ageGender": "66Y / Female",
    "personalContact": "983386525"
  },
  {
    "srNo": 377,
    "invoiceNumber": "BILLSH-MGN2026-0378",
    "timeOfBill": "09-Oct-2026, 12:54",
    "netAmt": 1120,
    "umr": "SAF26000152",
    "patientName": "Mr. Mukarram Adenwala",
    "ageGender": "83Y / Male",
    "personalContact": "98335 2105"
  },
  {
    "srNo": 378,
    "invoiceNumber": "BILLSH-MGN2026-0379",
    "timeOfBill": "09-Oct-2026, 13:25",
    "netAmt": 1700,
    "umr": "SAF26000124",
    "patientName": "Ms. Priti Pranjivan Bahuva",
    "ageGender": "53Y / Female",
    "personalContact": "9930598306"
  },
  {
    "srNo": 379,
    "invoiceNumber": "BILLSH-MGN2026-0380",
    "timeOfBill": "09-Oct-2026, 14:12",
    "netAmt": 500,
    "umr": "SAF26000005",
    "patientName": "Mr. Nooruddin Badruddin Gillani",
    "ageGender": "66Y / Male",
    "personalContact": "9820001775"
  },
  {
    "srNo": 380,
    "invoiceNumber": "BILLSH-MGN2026-0381",
    "timeOfBill": "09-Oct-2026, 16:40",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 381,
    "invoiceNumber": "BILLSH-MGN2026-0382",
    "timeOfBill": "10-Oct-2026, 11:12",
    "netAmt": 500,
    "umr": "SAF26000121",
    "patientName": "Mrs. Shahnaaz Abbas Fatehi",
    "ageGender": "66Y / Female",
    "personalContact": "9820746326"
  },
  {
    "srNo": 382,
    "invoiceNumber": "BILLSH-MGN2026-0383",
    "timeOfBill": "12-Oct-2026, 13:41",
    "netAmt": 500,
    "umr": "SAF26000005",
    "patientName": "Mr. Nooruddin Badruddin Gillani",
    "ageGender": "66Y / Male",
    "personalContact": "9820001775"
  },
  {
    "srNo": 383,
    "invoiceNumber": "BILLSH-MGN2026-0384",
    "timeOfBill": "13-Oct-2026, 09:44",
    "netAmt": 2743,
    "umr": "SAF26000124",
    "patientName": "Ms. Priti Pranjivan Bahuva",
    "ageGender": "53Y / Female",
    "personalContact": "9930598306"
  },
  {
    "srNo": 384,
    "invoiceNumber": "BILLSH-MGN2026-0385",
    "timeOfBill": "13-Oct-2026, 11:09",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 385,
    "invoiceNumber": "BILLSH-MGN2026-0386",
    "timeOfBill": "13-Oct-2026, 11:19",
    "netAmt": 500,
    "umr": "SAF26000121",
    "patientName": "Mrs. Shahnaaz Abbas Fatehi",
    "ageGender": "66Y / Female",
    "personalContact": "9820746326"
  },
  {
    "srNo": 386,
    "invoiceNumber": "BILLSH-MGN2026-0387",
    "timeOfBill": "13-Oct-2026, 11:27",
    "netAmt": 800,
    "umr": "SAF26000127",
    "patientName": "Mrs. Manjula Prem Chand Jain",
    "ageGender": "75Y / Female",
    "personalContact": "9930904481"
  },
  {
    "srNo": 387,
    "invoiceNumber": "BILLSH-MGN2026-0388",
    "timeOfBill": "13-Oct-2026, 13:43",
    "netAmt": 500,
    "umr": "SAF26000153",
    "patientName": "Mr. Alim N Shaikh",
    "ageGender": "62Y / Male",
    "personalContact": "9821921900"
  },
  {
    "srNo": 388,
    "invoiceNumber": "BILLSH-MGN2026-0389",
    "timeOfBill": "13-Oct-2026, 13:51",
    "netAmt": 1200,
    "umr": "SAF26000144",
    "patientName": "Mrs. Tasneem Taher Basta",
    "ageGender": "40Y / Female",
    "personalContact": "9619900452"
  },
  {
    "srNo": 389,
    "invoiceNumber": "BILLSH-MGN2026-0390",
    "timeOfBill": "13-Oct-2026, 13:52",
    "netAmt": 700,
    "umr": "SAF26000145",
    "patientName": "Ms. Lamya Taher Basta",
    "ageGender": "16Y / Female",
    "personalContact": "9619900452"
  },
  {
    "srNo": 390,
    "invoiceNumber": "BILLSH-MGN2026-0391",
    "timeOfBill": "14-Oct-2026, 08:52",
    "netAmt": 1935,
    "umr": "SAF26000154",
    "patientName": "Ms. Tasnim Amthaniwala",
    "ageGender": "52Y / Female",
    "personalContact": "8433853847"
  },
  {
    "srNo": 391,
    "invoiceNumber": "BILLSH-MGN2026-0392",
    "timeOfBill": "14-Oct-2026, 09:35",
    "netAmt": 1043,
    "umr": "SAF26000143",
    "patientName": "Mr. Hasmukh Devichandji Jain",
    "ageGender": "56Y / Male",
    "personalContact": "8356020980"
  },
  {
    "srNo": 392,
    "invoiceNumber": "BILLSH-MGN2026-0393",
    "timeOfBill": "14-Oct-2026, 10:22",
    "netAmt": 2030,
    "umr": "SAF26000155",
    "patientName": "Ms. Aatifa Noman Gadhyali",
    "ageGender": "28Y / Female",
    "personalContact": "8356005372"
  },
  {
    "srNo": 393,
    "invoiceNumber": "BILLSH-MGN2026-0394",
    "timeOfBill": "14-Oct-2026, 11:09",
    "netAmt": 800,
    "umr": "SAF26000127",
    "patientName": "Mrs. Manjula Prem Chand Jain",
    "ageGender": "75Y / Female",
    "personalContact": "9930904481"
  },
  {
    "srNo": 394,
    "invoiceNumber": "BILLSH-MGN2026-0395",
    "timeOfBill": "14-Oct-2026, 13:23",
    "netAmt": 500,
    "umr": "SAF26000153",
    "patientName": "Mr. Alim N Shaikh",
    "ageGender": "62Y / Male",
    "personalContact": "9821921900"
  },
  {
    "srNo": 395,
    "invoiceNumber": "BILLSH-MGN2026-0396",
    "timeOfBill": "15-Oct-2026, 08:49",
    "netAmt": 1690,
    "umr": "SAF26000156",
    "patientName": "Mr. Sandesh Suresh Jadhav",
    "ageGender": "36Y / Male",
    "personalContact": "8082446476"
  },
  {
    "srNo": 396,
    "invoiceNumber": "BILLSH-MGN2026-0397",
    "timeOfBill": "15-Oct-2026, 10:53",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 397,
    "invoiceNumber": "BILLSH-MGN2026-0398",
    "timeOfBill": "15-Oct-2026, 13:29",
    "netAmt": 500,
    "umr": "SAF26000153",
    "patientName": "Mr. Alim N Shaikh",
    "ageGender": "62Y / Male",
    "personalContact": "9821921900"
  },
  {
    "srNo": 398,
    "invoiceNumber": "BILLSH-MGN2026-0399",
    "timeOfBill": "16-Oct-2026, 10:37",
    "netAmt": 800,
    "umr": "SAF26000127",
    "patientName": "Mrs. Manjula Prem Chand Jain",
    "ageGender": "75Y / Female",
    "personalContact": "9930904481"
  },
  {
    "srNo": 399,
    "invoiceNumber": "BILLSH-MGN2026-0400",
    "timeOfBill": "16-Oct-2026, 11:24",
    "netAmt": 1700,
    "umr": "SAF26000124",
    "patientName": "Ms. Priti Pranjivan Bahuva",
    "ageGender": "53Y / Female",
    "personalContact": "9930598306"
  },
  {
    "srNo": 400,
    "invoiceNumber": "BILLSH-MGN2026-0401",
    "timeOfBill": "16-Oct-2026, 12:01",
    "netAmt": 500,
    "umr": "SAF26000121",
    "patientName": "Mrs. Shahnaaz Abbas Fatehi",
    "ageGender": "66Y / Female",
    "personalContact": "9820746326"
  },
  {
    "srNo": 401,
    "invoiceNumber": "BILLSH-MGN2026-0402",
    "timeOfBill": "16-Oct-2026, 12:32",
    "netAmt": 190,
    "umr": "SAF26000157",
    "patientName": "Mr. Mamdani Karim Kamalauddin",
    "ageGender": "52Y / Male",
    "personalContact": "8779374863"
  },
  {
    "srNo": 402,
    "invoiceNumber": "BILLSH-MGN2026-0403",
    "timeOfBill": "16-Oct-2026, 13:04",
    "netAmt": 25500,
    "umr": "SAF26000118",
    "patientName": "Mrs. Hetal P Revar",
    "ageGender": "41Y / Female",
    "personalContact": "9930129366"
  },
  {
    "srNo": 403,
    "invoiceNumber": "BILLSH-MGN2026-0404",
    "timeOfBill": "17-Oct-2026, 09:52",
    "netAmt": 1175,
    "umr": "SAF26000158",
    "patientName": "Ms. Jaya Amanna",
    "ageGender": "54Y / Female",
    "personalContact": "7021707293"
  },
  {
    "srNo": 404,
    "invoiceNumber": "BILLSH-MGN2026-0405",
    "timeOfBill": "17-Oct-2026, 10:36",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 405,
    "invoiceNumber": "BILLSH-MGN2026-0406",
    "timeOfBill": "17-Oct-2026, 11:01",
    "netAmt": 800,
    "umr": "SAF26000127",
    "patientName": "Mrs. Manjula Prem Chand Jain",
    "ageGender": "75Y / Female",
    "personalContact": "9930904481"
  },
  {
    "srNo": 406,
    "invoiceNumber": "BILLSH-MGN2026-0407",
    "timeOfBill": "17-Oct-2026, 11:53",
    "netAmt": 500,
    "umr": "SAF26000121",
    "patientName": "Mrs. Shahnaaz Abbas Fatehi",
    "ageGender": "66Y / Female",
    "personalContact": "9820746326"
  },
  {
    "srNo": 407,
    "invoiceNumber": "BILLSH-MGN2026-0408",
    "timeOfBill": "17-Oct-2026, 13:24",
    "netAmt": 500,
    "umr": "SAF26000153",
    "patientName": "Mr. Alim N Shaikh",
    "ageGender": "62Y / Male",
    "personalContact": "9821921900"
  },
  {
    "srNo": 408,
    "invoiceNumber": "BILLSH-MGN2026-0409",
    "timeOfBill": "17-Oct-2026, 13:43",
    "netAmt": 500,
    "umr": "SAF26000005",
    "patientName": "Mr. Nooruddin Badruddin Gillani",
    "ageGender": "66Y / Male",
    "personalContact": "9820001775"
  },
  {
    "srNo": 409,
    "invoiceNumber": "BILLSH-MGN2026-0410",
    "timeOfBill": "19-Oct-2026, 09:45",
    "netAmt": 870,
    "umr": "SAF26000118",
    "patientName": "Mrs. Hetal P Revar",
    "ageGender": "41Y / Female",
    "personalContact": "9930129366"
  },
  {
    "srNo": 410,
    "invoiceNumber": "BILLSH-MGN2026-0411",
    "timeOfBill": "19-Oct-2026, 11:15",
    "netAmt": 2743,
    "umr": "SAF26000124",
    "patientName": "Ms. Priti Pranjivan Bahuva",
    "ageGender": "53Y / Female",
    "personalContact": "9930598306"
  },
  {
    "srNo": 411,
    "invoiceNumber": "BILLSH-MGN2026-0412",
    "timeOfBill": "19-Oct-2026, 12:08",
    "netAmt": 500,
    "umr": "SAF26000136",
    "patientName": "Mr. Aliasgar Zujar Halvadwala",
    "ageGender": "34Y / Male",
    "personalContact": "9967951178"
  },
  {
    "srNo": 412,
    "invoiceNumber": "BILLSH-MGN2026-0413",
    "timeOfBill": "19-Oct-2026, 16:30",
    "netAmt": 500,
    "umr": "SAF26000160",
    "patientName": "Mrs. Zenab Murtuza Arsiwala",
    "ageGender": "41Y / Female",
    "personalContact": "9920474722"
  },
  {
    "srNo": 413,
    "invoiceNumber": "BILLSH-MGN2026-0414",
    "timeOfBill": "21-Oct-2026, 08:50",
    "netAmt": 230,
    "umr": "SAF26000124",
    "patientName": "Ms. Priti Pranjivan Bahuva",
    "ageGender": "53Y / Female",
    "personalContact": "9930598306"
  },
  {
    "srNo": 414,
    "invoiceNumber": "BILLSH-MGN2026-0415",
    "timeOfBill": "21-Oct-2026, 09:21",
    "netAmt": 1700,
    "umr": "SAF26000124",
    "patientName": "Ms. Priti Pranjivan Bahuva",
    "ageGender": "53Y / Female",
    "personalContact": "9930598306"
  },
  {
    "srNo": 415,
    "invoiceNumber": "BILLSH-MGN2026-0416",
    "timeOfBill": "21-Oct-2026, 11:22",
    "netAmt": 1680,
    "umr": "SAF26000161",
    "patientName": "Ms. Fatema Huzefa Jawadwala",
    "ageGender": "6Y / Female",
    "personalContact": "9967723052"
  },
  {
    "srNo": 416,
    "invoiceNumber": "BILLSH-MGN2026-0417",
    "timeOfBill": "21-Oct-2026, 12:15",
    "netAmt": 500,
    "umr": "SAF26000121",
    "patientName": "Mrs. Shahnaaz Abbas Fatehi",
    "ageGender": "66Y / Female",
    "personalContact": "9820746326"
  },
  {
    "srNo": 417,
    "invoiceNumber": "BILLSH-MGN2026-0418",
    "timeOfBill": "21-Oct-2026, 13:11",
    "netAmt": 500,
    "umr": "SAF26000005",
    "patientName": "Mr. Nooruddin Badruddin Gillani",
    "ageGender": "66Y / Male",
    "personalContact": "9820001775"
  },
  {
    "srNo": 418,
    "invoiceNumber": "BILLSH-MGN2026-0419",
    "timeOfBill": "21-Oct-2026, 13:26",
    "netAmt": 1043,
    "umr": "SAF26000118",
    "patientName": "Mrs. Hetal P Revar",
    "ageGender": "41Y / Female",
    "personalContact": "9930129366"
  },
  {
    "srNo": 419,
    "invoiceNumber": "BILLSH-MGN2026-0420",
    "timeOfBill": "22-Oct-2026, 11:48",
    "netAmt": 500,
    "umr": "SAF26000007",
    "patientName": "Mrs. Sakina Muffadal Kothari",
    "ageGender": "52Y / Female",
    "personalContact": "9664786522"
  },
  {
    "srNo": 420,
    "invoiceNumber": "BILLSH-MGN2026-0421",
    "timeOfBill": "22-Oct-2026, 12:17",
    "netAmt": 735,
    "umr": "SAF26000031",
    "patientName": "Mrs. Sakina Murtaza Balasinorwala",
    "ageGender": "45Y / Female",
    "personalContact": "9823055252"
  },
  {
    "srNo": 421,
    "invoiceNumber": "BILLSH-MGN2026-0422",
    "timeOfBill": "22-Oct-2026, 12:34",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 422,
    "invoiceNumber": "BILLSH-MGN2026-0423",
    "timeOfBill": "23-Oct-2026, 08:26",
    "netAmt": 1460,
    "umr": "SAF26000162",
    "patientName": "Mr. Imtiyaj Ali Warunkar",
    "ageGender": "19Y / Male",
    "personalContact": "9699751282"
  },
  {
    "srNo": 423,
    "invoiceNumber": "BILLSH-MGN2026-0424",
    "timeOfBill": "23-Oct-2026, 15:31",
    "netAmt": 500,
    "umr": "SAF26000160",
    "patientName": "Mrs. Zenab Murtuza Arsiwala",
    "ageGender": "41Y / Female",
    "personalContact": "9920474722"
  },
  {
    "srNo": 424,
    "invoiceNumber": "BILLSH-MGN2026-0425",
    "timeOfBill": "24-Oct-2026, 10:09",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 425,
    "invoiceNumber": "BILLSH-MGN2026-0426",
    "timeOfBill": "24-Oct-2026, 10:55",
    "netAmt": 500,
    "umr": "SAF26000007",
    "patientName": "Mrs. Sakina Muffadal Kothari",
    "ageGender": "52Y / Female",
    "personalContact": "9664786522"
  },
  {
    "srNo": 426,
    "invoiceNumber": "BILLSH-MGN2026-0427",
    "timeOfBill": "24-Oct-2026, 11:40",
    "netAmt": 735,
    "umr": "SAF26000163",
    "patientName": "Mrs. Nabisa Shabbir Baldiwala",
    "ageGender": "66Y / Female",
    "personalContact": "9702552645"
  },
  {
    "srNo": 427,
    "invoiceNumber": "BILLSH-MGN2026-0428",
    "timeOfBill": "24-Oct-2026, 12:05",
    "netAmt": 1700,
    "umr": "SAF26000124",
    "patientName": "Ms. Priti Pranjivan Bahuva",
    "ageGender": "53Y / Female",
    "personalContact": "9930598306"
  },
  {
    "srNo": 428,
    "invoiceNumber": "BILLSH-MGN2026-0429",
    "timeOfBill": "24-Oct-2026, 13:22",
    "netAmt": 500,
    "umr": "SAF26000005",
    "patientName": "Mr. Nooruddin Badruddin Gillani",
    "ageGender": "66Y / Male",
    "personalContact": "9820001775"
  },
  {
    "srNo": 429,
    "invoiceNumber": "BILLSH-MGN2026-0430",
    "timeOfBill": "24-Oct-2026, 16:35",
    "netAmt": 500,
    "umr": "SAF26000164",
    "patientName": "Mrs. Arefa Shaikh",
    "ageGender": "62Y / Female",
    "personalContact": "9870565180"
  },
  {
    "srNo": 430,
    "invoiceNumber": "BILLSH-MGN2026-0431",
    "timeOfBill": "26-Oct-2026, 09:20",
    "netAmt": 1043,
    "umr": "DAS26000120",
    "patientName": "Mr. Yash Ashok Mehta",
    "ageGender": "30Y / Male",
    "personalContact": "8879858708"
  },
  {
    "srNo": 431,
    "invoiceNumber": "BILLSH-MGN2026-0432",
    "timeOfBill": "26-Oct-2026, 12:07",
    "netAmt": 500,
    "umr": "SAF26000099",
    "patientName": "Mrs. Shivani Jawahar Thakur",
    "ageGender": "53Y / Female",
    "personalContact": "8369511200"
  },
  {
    "srNo": 432,
    "invoiceNumber": "BILLSH-MGN2026-0433",
    "timeOfBill": "26-Oct-2026, 13:02",
    "netAmt": 500,
    "umr": "SAF26000164",
    "patientName": "Mrs. Arefa Shaikh",
    "ageGender": "62Y / Female",
    "personalContact": "9870565180"
  },
  {
    "srNo": 433,
    "invoiceNumber": "BILLSH-MGN2026-0434",
    "timeOfBill": "26-Oct-2026, 13:10",
    "netAmt": 500,
    "umr": "SAF26000165",
    "patientName": "Ms. Mariyam Ebrahim Motorwala",
    "ageGender": "78Y / Female",
    "personalContact": "9137120338"
  },
  {
    "srNo": 434,
    "invoiceNumber": "BILLSH-MGN2026-0435",
    "timeOfBill": "26-Oct-2026, 15:55",
    "netAmt": 500,
    "umr": "SAF26000160",
    "patientName": "Mrs. Zenab Murtuza Arsiwala",
    "ageGender": "41Y / Female",
    "personalContact": "9920474722"
  },
  {
    "srNo": 435,
    "invoiceNumber": "BILLSH-MGN2026-0436",
    "timeOfBill": "27-Oct-2026, 09:23",
    "netAmt": 6020,
    "umr": "SAF26000166",
    "patientName": "Mrs. Meena Maru",
    "ageGender": "48Y / Female",
    "personalContact": "9833396141"
  },
  {
    "srNo": 436,
    "invoiceNumber": "BILLSH-MGN2026-0437",
    "timeOfBill": "27-Oct-2026, 09:28",
    "netAmt": 1400,
    "umr": "SAF26000124",
    "patientName": "Ms. Priti Pranjivan Bahuva",
    "ageGender": "53Y / Female",
    "personalContact": "9930598306"
  },
  {
    "srNo": 437,
    "invoiceNumber": "BILLSH-MGN2026-0438",
    "timeOfBill": "27-Oct-2026, 10:30",
    "netAmt": 2743,
    "umr": "SAF26000124",
    "patientName": "Mrs. Priti Pranjivan Bahuva",
    "ageGender": "53Y / Female",
    "personalContact": "9930598306"
  },
  {
    "srNo": 438,
    "invoiceNumber": "BILLSH-MGN2026-0439",
    "timeOfBill": "27-Oct-2026, 11:06",
    "netAmt": 500,
    "umr": "SAF26000165",
    "patientName": "Ms. Mariyam Ebrahim Motorwala",
    "ageGender": "78Y / Female",
    "personalContact": "9137120338"
  },
  {
    "srNo": 439,
    "invoiceNumber": "BILLSH-MGN2026-0440",
    "timeOfBill": "27-Oct-2026, 12:44",
    "netAmt": 500,
    "umr": "SAF26000164",
    "patientName": "Mrs. Arefa Shaikh",
    "ageGender": "62Y / Female",
    "personalContact": "9870565180"
  },
  {
    "srNo": 440,
    "invoiceNumber": "BILLSH-MGN2026-0441",
    "timeOfBill": "27-Oct-2026, 15:42",
    "netAmt": 500,
    "umr": "SAF26000160",
    "patientName": "Mrs. Zenab Murtuza Arsiwala",
    "ageGender": "41Y / Female",
    "personalContact": "9920474722"
  },
  {
    "srNo": 441,
    "invoiceNumber": "BILLSH-MGN2026-0442",
    "timeOfBill": "28-Oct-2026, 08:52",
    "netAmt": 6030,
    "umr": "SAF26000167",
    "patientName": "Ms. Zainab Khozema Badani",
    "ageGender": "37Y / Female",
    "personalContact": "9819888378"
  },
  {
    "srNo": 442,
    "invoiceNumber": "BILLSH-MGN2026-0443",
    "timeOfBill": "28-Oct-2026, 12:26",
    "netAmt": 2410,
    "umr": "SAF26000168",
    "patientName": "Mrs. Sakina Shabbir Arsiwala",
    "ageGender": "72Y / Female",
    "personalContact": "7387902090"
  },
  {
    "srNo": 443,
    "invoiceNumber": "BILLSH-MGN2026-0444",
    "timeOfBill": "28-Oct-2026, 13:09",
    "netAmt": 500,
    "umr": "SAF26000005",
    "patientName": "Mr. Nooruddin Badruddin Gillani",
    "ageGender": "66Y / Male",
    "personalContact": "9820001775"
  }
];

// ----------------------------------------------------------------------
// 3. PRELIMINARY OPD SCHEDULE
// ----------------------------------------------------------------------
export interface PreliminaryOpdDaySchedule {
  dayOfWeek: string;
  slots: {
    '08:00 - 10:00'?: string;
    '10:00 - 12:00'?: string;
    '12:00 - 14:00'?: string;
    '14:00 - 16:00'?: string;
    '16:00 - 18:00'?: string;
    '18:00 - 20:00'?: string;
  };
}

export const SDC_OPD1_SCHEDULE: PreliminaryOpdDaySchedule[] = [
  { dayOfWeek: 'Sunday', slots: {} },
  { dayOfWeek: 'Monday', slots: { '14:00 - 16:00': 'Dr. Ashish Gosar', '16:00 - 18:00': 'Dr. Abizer Manked' } },
  { dayOfWeek: 'Tuesday', slots: { '12:00 - 14:00': 'Dr. Nidhi Chauhan', '14:00 - 16:00': 'Dr. Faizaan Rushnaiwala', '16:00 - 18:00': 'Dr. Kinjal Shah' } },
  { dayOfWeek: 'Wednesday', slots: {} },
  { dayOfWeek: 'Thursday', slots: { '16:00 - 18:00': 'Dr. Hussain Gheewala' } },
  { dayOfWeek: 'Friday', slots: { '14:00 - 16:00': 'Dr. Ashish Gosar', '16:00 - 18:00': 'Dr. Kinjal Shah' } },
  { dayOfWeek: 'Saturday', slots: { '14:00 - 16:00': 'Dr. Faizaan Rushnaiwala', '16:00 - 18:00': 'Dr. Khokawala' } },
];

export const DUS_OPD1_SCHEDULE: PreliminaryOpdDaySchedule[] = [
  { dayOfWeek: 'Sunday', slots: {} },
  { dayOfWeek: 'Monday', slots: { '14:00 - 16:00': 'Dr. Husain Gheewala', '16:00 - 18:00': 'Dr. Mohd Mithi' } },
  { dayOfWeek: 'Tuesday', slots: { '16:00 - 18:00': 'Dr. Hussain Kotawala' } },
  { dayOfWeek: 'Wednesday', slots: { '16:00 - 18:00': 'Dr. Zahbia Bagwala' } },
  { dayOfWeek: 'Thursday', slots: { '16:00 - 18:00': 'Dr. Mohd Mithi' } },
  { dayOfWeek: 'Friday', slots: { '14:00 - 16:00': 'Dr. Husain Gheewala', '16:00 - 18:00': 'Dr. Zahbia Bagwala' } },
  { dayOfWeek: 'Saturday', slots: { '14:00 - 16:00': 'Dr. Mustafa Khokhawala', '16:00 - 18:00': 'Dr. Hussain Kotawala' } },
];

export const DUS_OPD2_SCHEDULE: PreliminaryOpdDaySchedule[] = [
  { dayOfWeek: 'Sunday', slots: {} },
  { dayOfWeek: 'Monday', slots: { '14:00 - 16:00': 'Dr. Shabbir Sutterwala' } },
  { dayOfWeek: 'Tuesday', slots: {} },
  { dayOfWeek: 'Wednesday', slots: { '14:00 - 16:00': 'Dr. Shabbir Sutterwala' } },
  { dayOfWeek: 'Thursday', slots: {} },
  { dayOfWeek: 'Friday', slots: { '14:00 - 16:00': 'Dr. Shabbir Sutterwala' } },
  { dayOfWeek: 'Saturday', slots: {} },
];

export const SDC_FREE_OPD_SCHEDULE: Array<{ dayOfWeek: string; morningDoc: string; eveningSpecialty1: string; eveningSpecialty2: string }> = [
  { dayOfWeek: 'Monday', morningDoc: 'Dr. Amit Paleja', eveningSpecialty1: 'Surgery', eveningSpecialty2: 'Medicine' },
  { dayOfWeek: 'Tuesday', morningDoc: 'Dr. Amit Paleja', eveningSpecialty1: 'OBGY', eveningSpecialty2: 'Urology' },
  { dayOfWeek: 'Wednesday', morningDoc: 'Dr. Amit Paleja', eveningSpecialty1: 'Surgery', eveningSpecialty2: 'Surgery' },
  { dayOfWeek: 'Thursday', morningDoc: 'Dr. Amit Paleja', eveningSpecialty1: 'OBGY', eveningSpecialty2: 'OBGY' },
  { dayOfWeek: 'Friday', morningDoc: 'Dr. Amit Paleja', eveningSpecialty1: 'Ortho', eveningSpecialty2: 'Ortho' },
  { dayOfWeek: 'Saturday', morningDoc: 'Dr. Amit Paleja', eveningSpecialty1: 'OBGY', eveningSpecialty2: 'Cardio' },
];

// ----------------------------------------------------------------------
// 4. PRELIMINARY AKD DIALYSIS ROSTER
// ----------------------------------------------------------------------
export const PRELIMINARY_DIALYSIS_ROSTER = {
  sdc: {
    akd1: {
      mwf: { shift1: 'Yasmin', shift2: 'Hetal Rewar' },
      tts: { shift1: 'Preeti Bawa', shift2: 'Suresh Jain' },
    },
    akd2: {
      mwf: { shift1: '', shift2: '' },
      tts: { shift1: '', shift2: '' },
    },
  },
  das: {
    akd1: {
      mwf: { shift1: 'Yusuf Patel', shift2: 'Farida Noori' },
      tts: { shift1: 'Nafisa Kagalwala', shift2: 'Shahida Khan' },
    },
    akd2: {
      mwf: { shift1: 'Ulfat Jahan', shift2: '' },
      tts: { shift1: 'Sakina', shift2: '' },
    },
    akd3: {
      mwf: { shift1: '', shift2: '' },
      tts: { shift1: '', shift2: '' },
    },
    akd4: {
      mwf: { shift1: '', shift2: '' },
      tts: { shift1: '', shift2: '' },
    },
  },
};

// ----------------------------------------------------------------------
// 5. PHYSIOTHERAPY MODULES
// ----------------------------------------------------------------------
export const PRELIMINARY_PHYSIO_MODULES = [
  { id: 'srv_physio_mod1', name: 'Physiotherapy Module 1 (Exercise, 30 min)', duration: '1/2 an hour', rate: 500 },
  { id: 'srv_physio_mod2', name: 'Physiotherapy Module 2 (Exercise + 1 Modality, 60 min)', duration: '1 hour', rate: 1000 },
  { id: 'srv_physio_mod3', name: 'Physiotherapy Module 3 (Exercise + 2 Modality, 90 min)', duration: '1 1/2 an hour', rate: 1500 },
];
