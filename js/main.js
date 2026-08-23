/**
 * ফয়জার কম্পিউটার অ্যান্ড ডিজিটাল সেন্টার - Interactive Engine (Multi-Utility Version)
 * Author: Antigravity AI
 */

// =========================================================================
// ১. প্রধান সেবাসমূহের ডাটাবেজ
// =========================================================================
const SERVICES_DATA = [
  {
    id: 'e-mutation',
    category: 'land',
    title: 'ই-নামজারি ও রেকর্ড খারিজ (E-Mutation)',
    badge: 'সর্বাধিক জনপ্রিয়',
    badgeColor: 'bg-green-100 text-emerald-800 border-green-300',
    icon: 'fa-landmark',
    summary: 'জমি ক্রয়, হেবা, দান বা ওয়ারিশসূত্রে প্রাপ্ত জমির মালিকানা পরিবর্তন ও নতুন খতিয়ান তৈরি।',
    portal: 'mutation.land.gov.bd',
    govtFee: '১,১৭০ ৳ (কোর্ট ফি ২০৳ + নোটিশ ফি ৫০৳ + রেকর্ড সংশোধন ফি ১,০০০৳ + খতিয়ান ফি ১০০৳)',
    serviceFee: '৩০০ - ৫০০ ৳',
    duration: '২৮ কর্মদিবস (সাধারণত)',
    documents: [
      'মূল দলিল / বায়া দলিলের সার্টিফাইড ফটোকপি',
      'পূর্ববর্তী খতিয়ানসমূহ (CS, SA, RS, হাল খতিয়ান)',
      'সর্বশেষ পরিশোধিত ভূমি উন্নয়ন কর (খাজনা) দাখিলা',
      'ক্রেতা ও বিক্রেতার জাতীয় পরিচয়পত্র (NID) নম্বর ও ছবি',
      'ওয়ারিশান সনদ ও মৃত্যু সনদ (ওয়ারিশ সূত্রে প্রাপ্ত জমির ক্ষেত্রে)',
      'জমির হাত নকশা বা সীমানা বিবরণী (প্রযোজ্য ক্ষেত্রে)'
    ]
  },
  {
    id: 'ld-tax',
    category: 'land',
    title: 'অনলাইনে জমির খাজনা পরিশোধ (LD Tax)',
    badge: 'ডিজিটাল দাখিলা',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: 'fa-file-invoice-dollar',
    summary: 'নতুন হোল্ডিং এন্ট্রি, বার্ষিক ভূমি উন্নয়ন কর অনলাইন পেমেন্ট ও তাৎক্ষণিক ডিজিটাল রসিদ সংগ্রহ।',
    portal: 'ldtax.gov.bd',
    govtFee: 'জমির ধরণ ও শতক অনুযায়ী সরকারি নির্ধারিত ফি',
    serviceFee: '৫০ - ১০০ ৳',
    duration: 'তাৎক্ষণিক (অনলাইন পেমেন্ট সাপেক্ষে)',
    documents: [
      'জমির হাল খতিয়ান / নামজারি পর্চার কপি',
      'পূর্বে পরিশোধিত সর্বশেষ খাজনার দাখিলা কপি (যদি থাকে)',
      'মালিকের সচল জাতীয় পরিচয়পত্র (NID) নম্বর',
      'ওটিপি (OTP) যাচাইয়ের জন্য সচল মোবাইল নম্বর'
    ]
  },
  {
    id: 'khatian',
    category: 'land',
    title: 'খতিয়ান/পর্চা যাচাই ও সার্টিফাইড কপি',
    badge: 'অনলাইন ও ডাক ডেলিভারি',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: 'fa-search-location',
    summary: 'CS, SA, RS, BS ও সিটি জরিপের খতিয়ান অনুসন্ধান, অনলাইন কপি ও জেলা রেকর্ডরুমের মূল পর্চা আবেদন।',
    portal: 'eporcha.gov.bd',
    govtFee: 'অনলাইন কপি: ৫০৳ | সার্টিফাইড হার্ডকপি: ১০০৳ + ডাক মাশুল',
    serviceFee: '৫০ - ১০০ ৳',
    duration: 'অনলাইন কপি সাথে সাথে | সার্টিফাইড কপি ৫-৭ দিন',
    documents: [
      'বিভাগ, জেলা, উপজেলা ও সংশ্লিষ্ট মৌজার নাম / JL নম্বর',
      'খতিয়ান নম্বর অথবা দাগ নম্বর অথবা মালিকের নাম',
      'আবেদনকারীর নাম, এনআইডি নম্বর ও মোবাইল নম্বর'
    ]
  },
  {
    id: 'mouza-map',
    category: 'land',
    title: 'মৌজা ম্যাপ (নকশা) ও ডিজিটাল সিট আবেদন',
    badge: 'ডাকযোগে হোম ডেলিভারি',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: 'fa-map-marked-alt',
    summary: 'যেকোনো মৌজার মূল সিট বা নকশার জন্য ভূমি রেকর্ড ও জরিপ অধিদপ্তরে সরাসরি অনলাইন আবেদন।',
    portal: 'dlrs.gov.bd',
    govtFee: 'সরকারি ম্যাপ ফি ও পোস্টাল চার্জ (৫২০৳+)',
    serviceFee: '১০০ - ১৫০ ৳',
    duration: '৭ - ১০ কর্মদিবস',
    documents: [
      'মৌজার নাম ও জে.এল (JL) নম্বর',
      'সিট নম্বর (Sheet Number)',
      'আবেদনকারীর সঠিক ডাক ঠিকানা ও সচল মোবাইল নম্বর'
    ]
  },
  {
    id: 'miss-case',
    category: 'land',
    title: 'রেকর্ড সংশোধন ও বিবিধ মিস কেস আবেদন',
    badge: 'আইনি সহায়তা',
    badgeColor: 'bg-red-100 text-red-800 border-red-300',
    icon: 'fa-gavel',
    summary: 'খতিয়ানে নামের ভুল, দাগ নম্বর বা হিস্যা ভুল সংক্রান্ত সহকারী কমিশনার (ভূমি) বরাবর মিস কেস আবেদন।',
    portal: 'land.gov.bd',
    govtFee: 'কোর্ট ফি ও নির্ধারিত সরকারি চালানের কপি',
    serviceFee: '২০০ - ৫০০ ৳',
    duration: 'শুনানি ও তদন্ত সাপেক্ষে',
    documents: [
      'ভুল খতিয়ান বা দলিলের কপি',
      'সঠিক তথ্যের স্বপক্ষে দালিলিক প্রমাণাদি',
      'জাতীয় পরিচয়পত্র ও আবেদনকারীর ছবি'
    ]
  },
  {
    id: 'e-passport',
    category: 'online',
    title: 'ই-পাসপোর্ট (E-Passport) নতুন ও রিনিউ আবেদন',
    badge: 'জরুরি সেবা',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    icon: 'fa-passport',
    summary: '৪৮ ও ৬৪ পাতার ৫ বা ১০ বছর মেয়াদি নতুন ই-পাসপোর্ট আবেদন, তথ্য এন্ট্রি ও ব্যাংক ড্রাফট পেমেন্ট।',
    portal: 'epassport.gov.bd',
    govtFee: '৫ বছর (৪৮ পাতা): ৪,০২৫৳ | ১০ বছর: ৫,৭৫০৳ (জরুরিতে বেশি)',
    serviceFee: '২০০ - ৩০০ ৳',
    duration: 'অনলাইন ফরম পূরণ তাৎক্ষণিক',
    documents: [
      'মূল এনআইডি (NID) অথবা অনলাইন জন্ম নিবন্ধন (১৭ ডিজিট)',
      'পুরাতন পাসপোর্ট (রিনিউ করার ক্ষেত্রে)',
      'পেশাগত সনদের কপি (সরকারি/বেসরকারি চাকুরিজীবী বা ছাত্র হলে)',
      'বিবাহিত হলে নিকাহনামা/ম্যারেজ সার্টিফিকেট (প্রযোজ্য ক্ষেত্রে)'
    ]
  },
  {
    id: 'police-clearance',
    category: 'online',
    title: 'পুলিশ ক্লিয়ারেন্স সার্টিফিকেট (PCC)',
    badge: 'বিদেশ গমনার্থী',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    icon: 'fa-shield-alt',
    summary: 'বিদেশ যাত্রা বা চাকরির প্রয়োজনে পুলিশ ক্লিয়ারেন্স সার্টিফিকেট এর নির্ভুল অনলাইন আবেদন ও চালান জমা।',
    portal: 'pcc.police.gov.bd',
    govtFee: '৫০০ ৳ (চালান কোড অনুযায়ী ব্যাংক ট্রেজারি বা সোনালী সেবা)',
    serviceFee: '১৫০ - ২০০ ৳',
    duration: '৭ - ১৫ কর্মদিবস (পুলিশ ভেরিফিকেশন সাপেক্ষে)',
    documents: [
      'পাসপোর্টের ১ম পাতার সত্যায়িত ফটোকপি (মেয়াদ অন্তত ৩ মাস থাকতে হবে)',
      'জাতীয় পরিচয়পত্র (NID) বা অনলাইন জন্ম নিবন্ধন',
      'স্থানীয় ইউনিয়ন পরিষদ/পৌরসভার চেয়ারম্যান প্রদত্ত চারিত্রিক সনদ',
      'বর্তমান ঠিকানার ইউটিলিটি বিলের কপি (প্রয়োজনে)'
    ]
  },
  {
    id: 'online-gd',
    category: 'online',
    title: 'অনলাইন সাধারণ ডায়েরি (Online GD)',
    badge: 'তাৎক্ষণিক সেবা',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    icon: 'fa-file-shield',
    summary: 'জাতীয় পরিচয়পত্র, সার্টিফিকেট, পাসপোর্ট, ব্যাংকের চেক বা মূল্যবান নথি হারানো সংক্রান্ত থানা জিডি।',
    portal: 'gd.police.gov.bd',
    govtFee: '০ ৳ (সরকারি কোনো ফি নেই)',
    serviceFee: '১০০ - ১৫০ ৳',
    duration: '১০ - ২০ মিনিট',
    documents: [
      'আবেদনকারীর জাতীয় পরিচয়পত্র (NID) নম্বর ও জন্ম তারিখ',
      'হারিয়ে যাওয়া ডকুমেন্টের নম্বর বা স্পষ্ট বিবরণ',
      'একটি সচল মোবাইল নম্বর (এসএমএস ভেরিফিকেশনের জন্য)'
    ]
  },
  {
    id: 'nid-correct',
    category: 'online',
    title: 'এনআইডি (NID) সংশোধন ও রি-ইস্যু আবেদন',
    badge: 'নির্বাচন কমিশন',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: 'fa-id-card',
    summary: 'জাতীয় পরিচয়পত্রে নাম, জন্ম তারিখ, পিতা-মাতার নাম ও ঠিকানা সংক্রান্ত ভুল সংশোধন আবেদন।',
    portal: 'services.nidw.gov.bd',
    govtFee: 'ক্যাটাগরি অনুযায়ী ২৩০ ৳ থেকে ৩৪৫ ৳ (বিকাশ/রকেটে প্রদেয়)',
    serviceFee: '১৫০ - ২৫০ ৳',
    duration: 'নির্বাচন কমিশনের অনুমোদন সাপেক্ষে',
    documents: [
      'এসএসসি/সমমানের শিক্ষাগত যোগ্যতার মূল সার্টিফিকেট',
      'ডিজিটাল অনলাইন জন্ম নিবন্ধন সনদ',
      'পিতা ও মাতার মূল জাতীয় পরিচয়পত্রের কপি',
      'বিবাহিত হলে কাবিননামা ও স্বামীর NID কপি'
    ]
  },
  {
    id: 'nid-download',
    category: 'online',
    title: 'অনলাইন ভোটার আইডি ডাউনলোড ও লেমিনেশন',
    badge: 'দ্রুত ডেলিভারি',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    icon: 'fa-download',
    summary: 'নতুন ভোটারদের স্লিপ নম্বর বা হারিয়ে যাওয়া NID এর অনলাইন কপি ডাউনলোড ও প্লাস্টিক কার্ড প্রিন্ট।',
    portal: 'services.nidw.gov.bd',
    govtFee: 'প্রযোজ্য ক্ষেত্রে সরকারি ফি',
    serviceFee: '৫০ - ১০০ ৳',
    duration: '৫ - ১০ মিনিট',
    documents: [
      'ভোটার নিবন্ধন ফরম নম্বর / স্লিপ নম্বর অথবা NID নম্বর',
      'ভোটার হওয়ার সময় প্রদত্ত সঠিক জন্ম তারিখ',
      'নিবন্ধনকৃত মোবাইল নম্বর (ফেস ভেরিফিকেশন বা OTP এর জন্য)'
    ]
  },
  {
    id: 'tin-cert',
    category: 'online',
    title: 'ই-টিন (e-TIN) সার্টিফিকেট নতুন আবেদন ও সংশোধন',
    badge: 'এনবিআর ট্যাক্স সেবা',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: 'fa-file-invoice',
    summary: 'ব্যবসা, সঞ্চয়পত্র ক্রয়, ব্যাংক লোন বা ট্রেড লাইসেন্সের জন্য নতুন ১২ ডিজিটের ই-টিন সার্টিফিকেট তাৎক্ষণিক গ্রহণ।',
    portal: 'incometax.gov.bd',
    govtFee: 'সরকারি ফি নেই (ফ্রি)',
    serviceFee: '১০০ - ১৫০ ৳',
    duration: 'তাৎক্ষণিক (৫-১০ মিনিট)',
    documents: [
      'আবেদনকারীর সচল জাতীয় পরিচয়পত্র (NID) নম্বর',
      'সচল মোবাইল নম্বর (ওটিপি যাচাইয়ের জন্য)',
      'ব্যবসার নাম ও ঠিকানা (ব্যবসায়িক টিন এর ক্ষেত্রে)'
    ]
  },
  {
    id: 'e-return',
    category: 'online',
    title: 'অনলাইন আয়কর ই-রিটার্ন দাখিল (e-Return Dakhil)',
    badge: 'এনবিআর ই-ট্যাক্স',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: 'fa-file-signature',
    summary: 'এনবিআর এর অনলাইন পোর্টালে বার্ষিক আয়কর ই-রিটার্ন দাখিল, ট্যাক্স হিসাব এবং তাৎক্ষণিক অফিসিয়াল প্রমাণপত্র/একনলেজমেন্ট প্রাপ্তি।',
    portal: 'etaxnbr.gov.bd',
    govtFee: 'আয়কর স্ল্যাব অনুযায়ী অথবা জিরো ট্যাক্স',
    serviceFee: '২০০ - ৫০০ ৳',
    duration: 'তাৎক্ষণিক একনলেজমেন্ট রসিদ',
    documents: [
      '১২ ডিজিটের ই-টিন (e-TIN) নম্বর',
      'আবেদনকারীর নিজস্ব নামে বায়োমেট্রিক নিবন্ধিত সিম নম্বর',
      'ব্যাংক স্টেটমেন্ট ও বেতন বিবরণী (যদি থাকে)',
      'স্থাবর ও অস্থাবর সম্পত্তির বিবরণ ও সঞ্চয়পত্র/ডিপিএস তথ্য'
    ]
  },
  {
    id: 'trade-lic',
    category: 'online',
    title: 'ই-ট্রেড লাইসেন্স ও অনলাইন রিনিউ',
    badge: 'ব্যবসা সেবা',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: 'fa-store',
    summary: 'ইউনিয়ন পরিষদ বা পৌরসভা আওতাধীন ব্যবসার বৈধ ই-ট্রেড লাইসেন্স আবেদন ও রিনিউ ফি জমা।',
    portal: 'etradelicense.gov.bd',
    govtFee: 'ব্যবসার মূলধন ও ইউনিয়ন পরিষদ/পৌরসভা নির্ধারিত ফি',
    serviceFee: '১৫০ - ৩০০ ৳',
    duration: '১ - ৩ কর্মদিবস',
    documents: [
      'দোকান ভাড়ার চুক্তিপত্র বা নিজস্ব জায়গার খাজনা দাখিলা',
      'মালিকের জাতীয় পরিচয়পত্র ও পাসপোর্ট সাইজ ছবি',
      'টিন সার্টিফিকেট (প্রযোজ্য ক্ষেত্রে)'
    ]
  },
  {
    id: 'driving',
    category: 'online',
    title: 'ড্রাইভিং লাইসেন্স ও বিআরটিএ সেবা (BRTA)',
    badge: 'লার্নার ও স্মার্ট কার্ড',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    icon: 'fa-id-card-clip',
    summary: 'বিআরটিএ সার্ভিস পোর্টালে লার্নার ড্রাইভিং লাইসেন্স আবেদন, মেডিকেল ফি ও পরীক্ষা স্লট বুকিং।',
    portal: 'bsp.brta.gov.bd',
    govtFee: 'লার্নার ফি: ৫১৮৳ (১ ক্যাটাগরি) / ৭৪৮৳ (২ ক্যাটাগরি)',
    serviceFee: '১৫০ - ২৫০ ৳',
    duration: 'লার্নার তাৎক্ষণিক ডাউনলোড',
    documents: [
      'রেজিস্টার্ড ডাক্তার কর্তৃক প্রদত্ত মেডিকেল সার্টিফিকেট',
      'জাতীয় পরিচয়পত্র ও ইউটিলিটি বিলের কপি',
      'শিক্ষাগত যোগ্যতার সনদ (ন্যূনতম ৮ম শ্রেণি)'
    ]
  },
  {
    id: 'job-apply',
    category: 'computer',
    title: 'চাকরি ও বিশ্ববিদ্যালয়ে ভর্তির অনলাইন আবেদন',
    badge: 'কম্পিউটার সেবা',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-300',
    icon: 'fa-user-graduate',
    summary: 'বিসিএস, প্রাথমিক শিক্ষক, সরকারি-বেসরকারি চাকরি এবং জাতীয় ও পাবলিক বিশ্ববিদ্যালয়ে ভর্তি আবেদন।',
    portal: 'বিভিন্ন সরকারি ও বিশ্ববিদ্যালয়ের পোর্টাল',
    govtFee: 'বিজ্ঞপ্তি অনুযায়ী নির্দিষ্ট অ্যাপ্লিকেশন ফি',
    serviceFee: '১০০ - ২০০ ৳',
    duration: '১০ - ১৫ মিনিট',
    documents: [
      'পাসপোর্ট সাইজ ছবি ও স্বাক্ষরের স্পষ্ট কপি (৩০০x৩০০ ও ৩০০x৮০ পিক্সেল)',
      'সকল শিক্ষাগত যোগ্যতার রোল, রেজিস্ট্রেশন নম্বর ও জিপিএ',
      'জাতীয় পরিচয়পত্র ও কোটা সনদ (প্রযোজ্য হলে)'
    ]
  },
  {
    id: 'pvc-id-card',
    category: 'computer',
    title: 'স্কুল-কলেজ ও মাদ্রাসার ডিজিটাল পিভিসি (PVC) আইডি কার্ড ও ফিতা',
    badge: 'স্টুডিও ও প্রিন্টিং',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: 'fa-id-badge',
    summary: 'স্কুল, কলেজ, মাদ্রাসা ও যেকোনো প্রতিষ্ঠানের উন্নত মানের ডিজিটাল পিভিসি আইডি কার্ড, প্রিমিয়াম প্রিন্টেড ফিতা (Lanyard) ও কার্ড হোল্ডার তৈরি।',
    portal: 'fayzarcomputer.com',
    govtFee: 'সরকারি ফি নেই',
    serviceFee: '৬০ - ১১০ ৳ (প্রতি পিস - ফিতা ও মান অনুযায়ী)',
    duration: '১ - ৩ কর্মদিবস (পরিমাণ সাপেক্ষে)',
    documents: [
      'শিক্ষার্থী বা কর্মকর্তা/কর্মচারীর পাসপোর্ট সাইজ স্পষ্ট ছবি',
      'শিক্ষার্থীর নাম, শ্রেণি, রোল, রক্তের গ্রুপ ও পিতা-মাতার নাম',
      'প্রতিষ্ঠানের নাম, লোগো ও প্রধানের স্বাক্ষর'
    ]
  },
  {
    id: 'typing',
    category: 'computer',
    title: 'বাংলা ও ইংরেজি কম্পিউটার কম্পোজ',
    badge: 'কম্পিউটার কম্পোজ',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    icon: 'fa-keyboard',
    summary: 'আবেদনপত্র, দরখাস্ত, সিভি (Curriculum Vitae), স্ট্যাম্প চুক্তিপত্র ও প্রশ্ন নির্ভুলভাবে কম্পোজ।',
    portal: 'ইন-শপ সার্ভিস',
    govtFee: 'প্রযোজ্য নয়',
    serviceFee: 'প্রতি পেজ ২০ - ৫০ ৳',
    duration: 'দ্রুত ডেলিভারি',
    documents: [
      'হাতে লেখা খসড়া বা মূল কাগজের নমুনা',
      'সিভির ক্ষেত্রে শিক্ষাগত তথ্য ও ব্যক্তিগত বিবরণ'
    ]
  },
  {
    id: 'photostat',
    category: 'computer',
    title: 'ডিজিটাল ফটোস্ট্যাট ও কালার প্রিন্ট',
    badge: 'ফটোস্ট্যাট ও প্রিন্ট',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: 'fa-print',
    summary: 'হাই-স্পিড ডিজিটাল ফটোকপি, অফসেট পেপারে নিখুঁত সাদাকালো ও লেজার কালার প্রিন্টিং।',
    portal: 'ইন-শপ সার্ভিস',
    govtFee: 'প্রযোজ্য নয়',
    serviceFee: 'প্রতি পৃষ্ঠা স্বল্পমূল্যে',
    duration: 'তাৎক্ষণিক',
    documents: [
      'যে ডকুমেন্ট বা পিডিএফ প্রিন্ট করতে চান'
    ]
  },
  {
    id: 'photo-studio',
    category: 'computer',
    title: 'স্টুডিও কোয়ালিটি ছবি প্রিন্ট ও লেমিনেটিং',
    badge: 'ডিজিটাল স্টুডিও',
    badgeColor: 'bg-pink-100 text-pink-800 border-pink-300',
    icon: 'fa-camera-retro',
    summary: 'পাসপোর্ট সাইজ, স্ট্যাম্প সাইজ ও থ্রি-আর/ফোর-আর ছবি প্রিন্ট এবং ডকুমেন্টস হার্ড লেমিনেটিং।',
    portal: 'ইন-শপ সার্ভিস',
    govtFee: 'প্রযোজ্য নয়',
    serviceFee: 'সাইজ ও কপি অনুযায়ী নির্ধারিত',
    duration: '৫ মিনিটে ডেলিভারি',
    documents: [
      'ছবি বা সরাসরি দোকানে ছবি তোলার সুবিধা'
    ]
  }
];

// =========================================================================
// ২. নোটিশ ও সার্কুলার ডাটাবেজ
// =========================================================================
const DEFAULT_NOTICES_DATA = [
  {
    id: 'notice-railway-running',
    category: 'jobs',
    type: 'সরকারি চাকরি',
    title: 'বাংলাদেশ রেলওয়ে সহকারী স্টেশন মাস্টার ও পয়েন্টসম্যান নিয়োগ',
    org: 'বাংলাদেশ রেলওয়ে (BR)',
    vacancies: '১০৮৫ জন',
    deadline: 'চলতি মাসের ২৫ তারিখ',
    daysLeft: 'জরুরি আবেদন',
    badgeClass: 'notice-deadline-urgent',
    qualification: 'স্নাতক / এইচএসসি / এসএসসি পাস',
    fee: 'সরকারি ফি: ১১২ - ২২৩ ৳',
    details: 'টেলিটক br.teletalk.com.bd পোর্টালে অনলাইন আবেদন চলছে। বয়স ১৮-৩০ বছর। দ্রুত আবেদন ফরম পূরণ ও ছবি/স্বাক্ষর আপলোডের জন্য যোগাযোগ করুন।',
    sourceUrl: 'https://br.teletalk.com.bd',
    pdfUrl: 'https://br.teletalk.com.bd'
  },
  {
    id: 'notice-police-si-live',
    category: 'jobs',
    type: 'সরকারি চাকরি',
    title: 'বাংলাদেশ পুলিশ সাব-ইন্সপেক্টর (SI) নিয়োগ ২০২৬',
    org: 'বাংলাদেশ পুলিশ সদর দপ্তর',
    vacancies: 'নির্দিষ্ট নয়',
    deadline: 'বিজ্ঞপ্তি অনুযায়ী',
    daysLeft: 'আবেদন চলছে',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    qualification: 'ন্যূনতম স্নাতক (ডিগ্রি/অনার্স)',
    fee: 'সরকারি ফি: ৫৫০ ৳',
    details: 'police.teletalk.com.bd এর মাধ্যমে আবেদন ফরম পূরণ, শারীরিক মাপের প্রস্তুতি এবং প্রবেশপত্র প্রিন্ট সেবা।',
    sourceUrl: 'https://police.teletalk.com.bd',
    pdfUrl: 'https://police.teletalk.com.bd'
  },
  {
    id: 'notice-primary-dpe-job',
    category: 'jobs',
    type: 'সরকারি চাকরি',
    title: 'প্রাথমিক সহকারী শিক্ষক নিয়োগ পরীক্ষা (রংপুর বিভাগ)',
    org: 'প্রাথমিক শিক্ষা অধিদপ্তর (DPE)',
    vacancies: '৩,৫০০+ জন',
    deadline: 'প্রবেশপত্র ডাউনলোড চলমান',
    daysLeft: 'এডমিট কার্ড লাইভ',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    qualification: 'স্নাতক / সমমান',
    fee: 'প্রিন্ট চার্জ প্রযোজ্য',
    details: 'dpe.teletalk.com.bd থেকে এডমিট কার্ড কালার প্রিন্ট ও পরীক্ষার নির্দেশিকা প্রদান করা হচ্ছে।',
    sourceUrl: 'https://dpe.teletalk.com.bd',
    pdfUrl: 'https://dpe.teletalk.com.bd'
  },
  {
    id: 'notice-nu-degree-adm-26',
    category: 'college',
    type: 'ভর্তি বিজ্ঞপ্তি',
    title: 'জাতীয় বিশ্ববিদ্যালয় ডিগ্রি (পাস) ও অনার্স ভর্তি কার্যক্রম',
    org: 'জাতীয় বিশ্ববিদ্যালয় / ফুলবাড়ী সরকারি কলেজ',
    vacancies: 'সকল আসন',
    deadline: 'নির্ধারিত সময়সূচি অনুযায়ী',
    daysLeft: 'ভর্তি ওপেন',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    qualification: 'এসএসসি ও এইচএসসি পাস',
    fee: 'প্রাথমিক আবেদন ফি: ৩৫০ ৳',
    details: 'app1.nu.edu.bd পোর্টালে ফুলবাড়ী সরকারি কলেজ সহ জাতীয় বিশ্ববিদ্যালয়ের সকল কলেজের ১ম মেধা তালিকায় আবেদন ও নিশ্চায়ন।',
    sourceUrl: 'http://app1.nu.edu.bd',
    pdfUrl: 'http://app1.nu.edu.bd'
  },
  {
    id: 'notice-bteb-diploma-adm',
    category: 'college',
    type: 'ভর্তি বিজ্ঞপ্তি',
    title: 'কারিগরি শিক্ষা বোর্ড ৪ বছর মেয়াদী ডিপ্লোমা ভর্তি',
    org: 'বাংলাদেশ কারিগরি শিক্ষা বোর্ড (BTEB)',
    vacancies: 'পলিটেকনিক আসনসমূহ',
    deadline: 'চলমান কার্যক্রম',
    daysLeft: 'আবেদন চলছে',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    qualification: 'এসএসসি / দাখিল / সমমান',
    fee: 'বোর্ড ফি: ১৬০ ৳',
    details: 'btebadmission.gov.bd পোর্টালে সরকারি ও বেসরকারি পলিটেকনিক ইনস্টিটিউটে ভর্তির অনলাইন আবেদন ও কলেজ চয়েস।',
    sourceUrl: 'http://btebadmission.gov.bd',
    pdfUrl: 'http://btebadmission.gov.bd'
  },
  {
    id: 'notice-du-admission-26',
    category: 'college',
    type: 'ভর্তি বিজ্ঞপ্তি',
    title: 'ঢাকা বিশ্ববিদ্যালয় ও গুচ্ছ বিশ্ববিদ্যালয় স্নাতক ভর্তি পরীক্ষা',
    org: 'বিশ্ববিদ্যালয় মঞ্জুরি কমিশন (UGC)',
    vacancies: 'সকল ইউনিট',
    deadline: 'বিজ্ঞপ্তি অনুযায়ী',
    daysLeft: 'প্রস্তুতি ও আবেদন',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    qualification: 'এইচএসসি উত্তীর্ণ',
    fee: 'ইউনিট ফি: ১,০০০ ৳',
    details: 'ছবি সাইজিং, পেমেন্ট গেটওয়ে সম্পন্ন ও প্রবেশপত্র কালার প্রিন্ট সেবা।',
    sourceUrl: 'https://admission.eis.du.ac.bd',
    pdfUrl: 'https://admission.eis.du.ac.bd'
  },
  {
    id: 'notice-army-sainik-26',
    category: 'jobs',
    type: 'সরকারি চাকরি',
    title: 'বাংলাদেশ সেনাবাহিনী সৈনিক পদে পুরুষ ও মহিলা নিয়োগ',
    org: 'বাংলাদেশ সেনাবাহিনী (Army)',
    vacancies: 'নির্দিষ্ট নয়',
    deadline: 'চলতি মাসের শেষ দিন',
    daysLeft: 'আবেদন চলমান',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    qualification: 'এসএসসি পাস (ন্যূনতম জিপিএ ৩.০০)',
    fee: 'সরকারি ফি: ৩০০ ৳',
    details: 'sainik.teletalk.com.bd এ এসএমএস ও অনলাইন আবেদন ফরম পূরণ।',
    sourceUrl: 'https://sainik.teletalk.com.bd',
    pdfUrl: 'https://sainik.teletalk.com.bd'
  },
  {
    id: 'notice-brta-inspector-job',
    category: 'jobs',
    type: 'সরকারি চাকরি',
    title: 'বিআরটিএ মোটরযান পরিদর্শক ও সহকারী পরিচালক নিয়োগ',
    org: 'বাংলাদেশ সড়ক পরিবহন কর্তৃপক্ষ (BRTA)',
    vacancies: '৬৪ জন',
    deadline: 'বিজ্ঞপ্তি অনুযায়ী',
    daysLeft: 'চলমান',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    qualification: 'ডিপ্লোমা ইন অটোমোবাইল / ডিগ্রি',
    fee: 'সরকারি ফি: ২২৩ ৳',
    details: 'brta.teletalk.com.bd এ আবেদন সাবমিশন ও প্রবেশপত্র সংগ্রহ।',
    sourceUrl: 'https://brta.teletalk.com.bd',
    pdfUrl: 'https://brta.teletalk.com.bd'
  },
  {
    id: 'notice-board-results-marksheet',
    category: 'college',
    type: 'ফলাফল ও মার্কশিট',
    title: 'এসএসসি ও এইচএসসি পরীক্ষার মূল নম্বরপত্র ও সনদপত্র উত্তোলন',
    org: 'দিনাজপুর শিক্ষা বোর্ড',
    vacancies: 'সকল শিক্ষার্থী',
    deadline: 'যে কোনো সময়',
    daysLeft: 'সার্বক্ষণিক',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
    qualification: 'পরীক্ষার্থীদের জন্য',
    fee: 'প্রিন্ট চার্জ প্রযোজ্য',
    details: 'রোল ও রেজিস্ট্রেশন নম্বর দিয়ে দ্রুততম সময়ে এডমিট কার্ড ও নম্বরপত্র কালার প্রিন্ট।'
  }
];

function getActiveNotices() {
  try {
    const saved = localStorage.getItem('fayzar_notices_data');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_NOTICES_DATA;
}

function saveActiveNotices(data) {
  try {
    localStorage.setItem('fayzar_notices_data', JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}

// =========================================================================
// ৩. DOM Ready & Event Listeners
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initShopStatus();
  renderServicesGrid('land', '', false);
  initTabs();
  initLiveSearch();
  initLandCalculator();
  initQuickOrderForm();
  initFAQ();
  initBackToTop();
  initMobileDrawer();
  
  // Smart Tools Hub Modules
  initNoticesBoard();
  initPhotoResizer();
  initAgeCalculator();
  initLandConverter();
  calculateDeedFees();
  initExpressPrint();
  
  // Viewport-Driven Smart Auto-Play Engine (Runs ONLY the active visible section)
  initViewportAutoPlayEngine();
  
  // Refresh shop status every 60s
  setInterval(initShopStatus, 60000);
});

// Theme (Day / Night) Switcher (Silent, Smooth Toggle)
function initThemeToggle() {
  const toggleBtns = document.querySelectorAll('.theme-toggle-btn, #theme-toggle-btn');
  
  function updateTheme(isDark) {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fayzar_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fayzar_theme', 'light');
    }
  }

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isCurrentlyDark = document.documentElement.classList.contains('dark');
      updateTheme(!isCurrentlyDark);
    });
  });
}

// =========================================================================
// ৪. লাইভ শপ স্ট্যাটাস ট্র্যাকার
// =========================================================================
function initShopStatus() {
  const statusBadge = document.getElementById('shop-status-badge');
  const statusText = document.getElementById('shop-status-text');
  const statusHeader = document.getElementById('header-shop-status');
  
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentMinutes = hour * 60 + minute;
  
  let isOpen = false;
  let closingInfo = '';
  
  if (day === 5) {
    if (currentMinutes >= 16 * 60 && currentMinutes < 21 * 60) {
      isOpen = true;
      closingInfo = 'রাত ৯:০০ টা পর্যন্ত খোলা';
    } else {
      isOpen = false;
      closingInfo = currentMinutes < 16 * 60 ? 'আজ বিকাল ৪:০০ টায় খুলবে' : 'আগামীকাল সকাল ১০:০০ টায় খুলবে';
    }
  } else {
    if (currentMinutes >= 10 * 60 && currentMinutes < 21 * 60) {
      isOpen = true;
      closingInfo = 'রাত ৯:০০ টা পর্যন্ত খোলা';
    } else {
      isOpen = false;
      closingInfo = currentMinutes < 10 * 60 ? 'আজ সকাল ১০:০০ টায় খুলবে' : (day === 4 ? 'আগামীকাল (শুক্রবার) বিকাল ৪:০০ টায় খুলবে' : 'আগামীকাল সকাল ১০:০০ টায় খুলবে');
    }
  }

  if (isOpen) {
    if (statusBadge) {
      statusBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300';
      statusBadge.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-emerald-500 status-dot-open"></span> এখন দোকান খোলা আছে (${closingInfo})`;
    }
    if (statusText) statusText.innerText = `এখন দোকান খোলা আছে • ${closingInfo}`;
    if (statusHeader) {
      statusHeader.className = 'hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300';
      statusHeader.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500"></span> খোলা আছে (${closingInfo})`;
    }
  } else {
    if (statusBadge) {
      statusBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300';
      statusBadge.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-rose-500 status-dot-closed"></span> এখন দোকান বন্ধ (${closingInfo})`;
    }
    if (statusText) statusText.innerText = `এখন দোকান বন্ধ • ${closingInfo}`;
    if (statusHeader) {
      statusHeader.className = 'hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300';
      statusHeader.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-500"></span> এখন বন্ধ (${closingInfo})`;
    }
  }
}

// =========================================================================
// =========================================================================
// ৫. নোটিশ ও সার্কুলার বুলেটিন বোর্ড ডায়নামিক অটো-সাইকেল ইঞ্জিন (Zero-Blur Notice Carousel)
// =========================================================================
let currentNoticeFilter = 'jobs';
let noticeCycleTimer = null;
let noticeCycleIndex = 0;
let isNoticeHovered = false;
let isNoticeViewAllActive = false;
let isNoticeSwitching = false;
const NOTICE_CATEGORIES = ['jobs', 'college'];

function cycleNextNoticeCategory() {
  if (isNoticeHovered || isNoticeViewAllActive) return;
  noticeCycleIndex = (noticeCycleIndex + 1) % NOTICE_CATEGORIES.length;
  const nextCat = NOTICE_CATEGORIES[noticeCycleIndex];
  updateNoticeTabUI(nextCat);
  renderNotices(nextCat, true);
}

function updateNoticeTabUI(category) {
  const tabBtns = document.querySelectorAll('.notice-tab-btn');
  tabBtns.forEach(btn => {
    const cat = btn.getAttribute('data-notice-category');
    if (cat === category) {
      btn.classList.add('active', 'bg-brandGreen', 'text-white');
      btn.classList.remove('bg-white', 'dark:bg-[#1b263b]', 'text-slate-700', 'dark:text-slate-200');
    } else {
      btn.classList.remove('active', 'bg-brandGreen', 'text-white');
      btn.classList.add('bg-white', 'dark:bg-[#1b263b]', 'text-slate-700', 'dark:text-slate-200');
    }
  });
}

function startNoticesAutoCycle() {
  if (noticeCycleTimer) return;
  noticeCycleTimer = setInterval(cycleNextNoticeCategory, 3500);
}

function stopNoticesAutoCycle() {
  if (noticeCycleTimer) {
    clearInterval(noticeCycleTimer);
    noticeCycleTimer = null;
  }
}

async function initNoticesBoard() {
  try {
    const res = await fetch('data/notices.json');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && !localStorage.getItem('fayzar_notices_data')) {
        saveActiveNotices(data);
      }
    }
  } catch (e) {}

  currentNoticeFilter = 'jobs';
  renderNotices('jobs', false);
  
  const tabBtns = document.querySelectorAll('.notice-tab-btn');
  const container = document.getElementById('notices-cards-container');
  const expandBtn = document.getElementById('toggle-notices-expand-btn');
  const expandText = document.getElementById('toggle-notices-expand-text');

  // Pause on hover
  if (container) {
    container.addEventListener('mouseenter', () => {
      isNoticeHovered = true;
    });
    container.addEventListener('mouseleave', () => {
      isNoticeHovered = false;
    });
  }

  // Notice Tab Clicks
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-notice-category');
      
      if (category === 'all') {
        openViewAllNotices();
        return;
      }

      if (isNoticeViewAllActive) {
        closeViewAllNotices(false);
      }

      noticeCycleIndex = NOTICE_CATEGORIES.indexOf(category);
      if (noticeCycleIndex === -1) noticeCycleIndex = 0;

      updateNoticeTabUI(category);
      renderNotices(category, true);

      // Temporary pause for 8s
      isNoticeHovered = true;
      setTimeout(() => {
        isNoticeHovered = false;
      }, 8000);
    });
  });

  function openViewAllNotices() {
    isNoticeViewAllActive = true;
    updateNoticeTabUI('all');
    renderNotices('all', true);
    if (expandText) expandText.innerHTML = `সংক্ষেপে দেখুন`;
  }

  function closeViewAllNotices(scrollBack = false) {
    isNoticeViewAllActive = false;
    if (expandText) expandText.innerHTML = `সকল নোটিশ দেখুন`;

    const defaultCat = NOTICE_CATEGORIES[noticeCycleIndex] || 'jobs';
    updateNoticeTabUI(defaultCat);
    renderNotices(defaultCat, true);

    if (scrollBack) {
      const hub = document.getElementById('notices-hub');
      if (hub) hub.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  if (expandBtn) {
    expandBtn.addEventListener('click', () => {
      if (!isNoticeViewAllActive) {
        openViewAllNotices();
      } else {
        closeViewAllNotices(true);
      }
    });
  }
}

function renderNotices(category = 'jobs', smoothTransition = true) {
  const container = document.getElementById('notices-cards-container');
  const cycleBadgeText = document.getElementById('notice-cycle-badge-text');
  if (!container) return;
  
  currentNoticeFilter = category;
  const allItems = getActiveNotices();
  
  // Update category badge counts
  const jobCount = allItems.filter(n => n.category === 'jobs' || !n.category || n.category === 'admin').length;
  const collegeCount = allItems.filter(n => n.category === 'college' || n.category === 'admission' || n.category === 'admissions' || n.category === 'results').length;
  
  const jobBadge = document.getElementById('site-job-badge');
  if (jobBadge) jobBadge.innerText = jobCount;
  
  const collegeBadge = document.getElementById('site-college-badge');
  if (collegeBadge) collegeBadge.innerText = collegeCount;
  
  let items = allItems;
  if (category === 'jobs') {
    items = allItems.filter(n => n.category === 'jobs' || !n.category || n.category === 'admin');
  } else if (category === 'college') {
    items = allItems.filter(n => n.category === 'college' || n.category === 'admission' || n.category === 'admissions' || n.category === 'results');
  }

  // Update notice status badge
  if (cycleBadgeText) {
    if (category === 'all' || isNoticeViewAllActive) {
      cycleBadgeText.innerHTML = `🌟 <strong>সকল নোটিশ একসাথে:</strong> মোট ${items.length}টি নোটিশ`;
    } else if (category === 'jobs') {
      cycleBadgeText.innerHTML = `💼 <strong>চলমান ক্যাটাগরি:</strong> সরকারি চাকরি (${items.length}টির মধ্যে ৩টি প্রদর্শিত)`;
    } else {
      cycleBadgeText.innerHTML = `🎓 <strong>চলমান ক্যাটাগরি:</strong> স্কুল/কলেজ ও ভর্তি (${items.length}টির মধ্যে ৩টি প্রদর্শিত)`;
    }
  }

  function generateNoticeMarkup() {
    if (items.length === 0) {
      return `
        <div class="col-span-full py-10 text-center bg-white dark:bg-[#1b263b] rounded-2xl border border-slate-200 dark:border-slate-800">
          <i class="fas fa-inbox text-slate-300 dark:text-slate-600 text-3xl mb-2"></i>
          <p class="text-sm font-bold text-slate-700 dark:text-slate-300">এই ক্যাটাগরিতে বর্তমানে কোনো নোটিশ নেই।</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">প্রয়োজনে সরাসরি আমাদের দোকানে যোগাযোগ করুন।</p>
        </div>
      `;
    }

    // Display 3 compact and neat cards per category for sleek single-row layout
    let displayItems = items;
    if (!isNoticeViewAllActive && category !== 'all') {
      displayItems = items.slice(0, 3);
    }
    
    return displayItems.map((n) => `
      <div class="notice-card-item bg-white dark:bg-[#1b263b] rounded-2xl border border-slate-200 dark:border-slate-700/80 p-3.5 sm:p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between relative group">
        <div>
          <div class="flex items-center justify-between gap-1.5 mb-1.5">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              ${n.type}
            </span>
            <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${n.badgeClass || 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'}">
              <i class="fas fa-clock text-[8px] mr-1"></i> ${n.daysLeft || 'চলমান'}
            </span>
          </div>
          
          <h4 class="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mb-1 leading-snug line-clamp-1 group-hover:text-brandGreen dark:group-hover:text-emerald-400 transition" title="${n.title}">
            ${n.title}
          </h4>
          <div class="text-xs font-semibold text-brandBlue dark:text-blue-400 mb-2 flex items-center justify-between gap-1">
            <span class="truncate"><i class="fas fa-building text-amber-500 mr-1"></i> ${n.org}</span>
            ${n.vacancies ? `<span class="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 border border-amber-200 dark:border-amber-800">পদ: ${n.vacancies}</span>` : ''}
          </div>
          
          <div class="bg-slate-50 dark:bg-[#162035] px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/60 text-[11px] flex items-center justify-between mb-2.5">
            <span class="text-slate-600 dark:text-slate-300 truncate max-w-[140px]" title="${n.qualification}">🎓 ${n.qualification}</span>
            <span class="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">${n.fee}</span>
          </div>
        </div>
        
        <div class="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-1.5">
          <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">শেষ: <strong class="text-slate-800 dark:text-slate-200">${n.deadline}</strong></span>
          <div class="flex items-center gap-1 shrink-0">
            ${n.sourceUrl ? `
              <a href="${n.sourceUrl}" target="_blank" rel="noopener noreferrer" class="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 transition flex items-center justify-center text-xs" title="অফিসিয়াল পোর্টাল">
                <i class="fas fa-globe text-sky-600 dark:text-sky-400"></i>
              </a>
            ` : ''}
            ${n.pdfUrl ? `
              <a href="${n.pdfUrl}" target="_blank" rel="noopener noreferrer" class="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition flex items-center justify-center text-xs" title="সার্কুলার PDF">
                <i class="fas fa-file-pdf text-rose-500"></i>
              </a>
            ` : ''}
            <a href="https://wa.me/8801717101919?text=${encodeURIComponent(`আসসালামু আলাইকুম, আমি ফয়জার কম্পিউটার থেকে "${n.title}" (${n.org}) এর জন্য সরাসরি অনলাইনে আবেদন করতে চাচ্ছি।`)}" target="_blank" class="bg-brandGreen hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 shadow-xs">
              <i class="fab fa-whatsapp"></i> আবেদন
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  if (smoothTransition && container.children.length > 0) {
    if (isNoticeSwitching) return;
    isNoticeSwitching = true;
    container.classList.add('is-transitioning');
    setTimeout(() => {
      container.innerHTML = generateNoticeMarkup();
      container.classList.remove('is-transitioning');
      isNoticeSwitching = false;
    }, 180);
  } else {
    container.innerHTML = generateNoticeMarkup();
  }
}

// =========================================================================
// ৬. টেলিটক ছবি ও সিগনেচার রিসাইজার ইঞ্জিন (300x300 & 300x80)
// =========================================================================
let currentResizerMode = 'photo';
let uploadedImageSrc = null;

function initPhotoResizer() {
  const photoModeBtn = document.getElementById('resizer-photo-mode');
  const sigModeBtn = document.getElementById('resizer-sig-mode');
  const fileInput = document.getElementById('resizer-file-input');
  const dropzone = document.getElementById('resizer-dropzone');
  const downloadBtn = document.getElementById('resizer-download-btn');
  
  if (!photoModeBtn || !fileInput) return;
  
  photoModeBtn.addEventListener('click', () => {
    currentResizerMode = 'photo';
    photoModeBtn.classList.add('bg-brandGreen', 'text-white');
    photoModeBtn.classList.remove('bg-white', 'text-slate-700');
    sigModeBtn.classList.remove('bg-brandGreen', 'text-white');
    sigModeBtn.classList.add('bg-white', 'text-slate-700');
    document.getElementById('resizer-target-dim').innerText = '৩০০ x ৩০০ পিক্সেল (সর্বোচ্চ ১০০ KB)';
    if (uploadedImageSrc) processImageToCanvas(uploadedImageSrc);
  });

  sigModeBtn.addEventListener('click', () => {
    currentResizerMode = 'signature';
    sigModeBtn.classList.add('bg-brandGreen', 'text-white');
    sigModeBtn.classList.remove('bg-white', 'text-slate-700');
    photoModeBtn.classList.remove('bg-brandGreen', 'text-white');
    photoModeBtn.classList.add('bg-white', 'text-slate-700');
    document.getElementById('resizer-target-dim').innerText = '৩০০ x ৮০ পিক্সেল (সর্বোচ্চ ৬০ KB)';
    if (uploadedImageSrc) processImageToCanvas(uploadedImageSrc);
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  });

  if (dropzone) {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelected(e.dataTransfer.files[0]);
      }
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const canvas = document.getElementById('resizer-canvas');
      if (!canvas) return;
      
      const link = document.createElement('a');
      const filename = currentResizerMode === 'photo' ? 'teletalk_photo_300x300.jpg' : 'teletalk_signature_300x80.jpg';
      link.download = filename;
      link.href = canvas.toDataURL('image/jpeg', 0.92);
      link.click();
      showToast(`${filename} ডাউনলোড শুরু হয়েছে!`, 'success');
    });
  }
}

function handleFileSelected(file) {
  if (!file.type.startsWith('image/')) {
    showToast('অনুগ্রহ করে একটি ছবি বা ইমেজ ফাইল নির্বাচন করুন।', 'error');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedImageSrc = event.target.result;
    processImageToCanvas(uploadedImageSrc);
    document.getElementById('resizer-output-box').classList.remove('hidden');
    document.getElementById('resizer-placeholder-box').classList.add('hidden');
    showToast('ছবি সফলভাবে রিসাইজ করা হয়েছে!', 'success');
  };
  reader.readAsDataURL(file);
}

function processImageToCanvas(src) {
  const canvas = document.getElementById('resizer-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const img = new Image();
  img.onload = () => {
    const targetWidth = 300;
    const targetHeight = currentResizerMode === 'photo' ? 300 : 80;
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    
    canvas.toBlob((blob) => {
      const sizeKb = (blob.size / 1024).toFixed(1);
      const infoElem = document.getElementById('resizer-info-text');
      if (infoElem) {
        const maxLimit = currentResizerMode === 'photo' ? '১০০ KB' : '৬০ KB';
        infoElem.innerHTML = `আকার: <strong>${targetWidth}x${targetHeight} px</strong> | সাইজ: <strong>${sizeKb} KB</strong> (অনুমোদিত সীমা: ${maxLimit})`;
      }
    }, 'image/jpeg', 0.92);
  };
  img.src = src;
}

// =========================================================================
// ৭. সরকারি চাকরির বয়স ও যোগ্যতা ক্যালকুলেটর ইঞ্জিন
// =========================================================================
function initAgeCalculator() {
  const form = document.getElementById('age-calc-form');
  const targetDateInput = document.getElementById('age-target-date');
  
  if (targetDateInput && !targetDateInput.value) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    targetDateInput.value = `${yyyy}-${mm}-${dd}`;
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      calculateGovtJobAge();
    });
  }
}

function calculateGovtJobAge() {
  const birthInput = document.getElementById('age-birth-date').value;
  const targetInput = document.getElementById('age-target-date').value;
  const resultBox = document.getElementById('age-result-box');
  
  if (!birthInput || !targetInput) {
    showToast('অনুগ্রহ করে জন্মতারিখ ও বিজ্ঞপ্তির নির্দিষ্ট তারিখ দিন।', 'error');
    return;
  }
  
  const birthDate = new Date(birthInput);
  const targetDate = new Date(targetInput);
  
  if (birthDate > targetDate) {
    showToast('জন্মতারিখ বিজ্ঞপ্তির তারিখের চেয়ে বড় হতে পারে না!', 'error');
    return;
  }
  
  let years = targetDate.getFullYear() - birthDate.getFullYear();
  let months = targetDate.getMonth() - birthDate.getMonth();
  let days = targetDate.getDate() - birthDate.getDate();
  
  if (days < 0) {
    months--;
    const lastMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
    days += lastMonth.getDate();
  }
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  const toBanglaNum = (n) => String(n).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);
  
  document.getElementById('age-res-years').innerText = toBanglaNum(years);
  document.getElementById('age-res-months').innerText = toBanglaNum(months);
  document.getElementById('age-res-days').innerText = toBanglaNum(days);
  
  const isGeneralEligible = years >= 18 && (years < 30 || (years === 30 && months === 0 && days === 0));
  const isQuotaEligible = years >= 18 && (years < 32 || (years === 32 && months === 0 && days === 0));
  
  const generalBadge = document.getElementById('age-general-badge');
  const quotaBadge = document.getElementById('age-quota-badge');
  
  if (generalBadge) {
    if (isGeneralEligible) {
      generalBadge.className = 'px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center gap-1.5 border border-emerald-300';
      generalBadge.innerHTML = `<i class="fas fa-check-circle text-emerald-600"></i> সাধারণ কোটায় আবেদনযোগ্য (১৮-৩০ বছর)`;
    } else {
      generalBadge.className = 'px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 font-extrabold text-xs flex items-center gap-1.5 border border-rose-300';
      generalBadge.innerHTML = `<i class="fas fa-times-circle text-rose-600"></i> সাধারণ কোটায় বয়স উত্তীর্ণ / অপ্রাপ্ত`;
    }
  }

  if (quotaBadge) {
    if (isQuotaEligible) {
      quotaBadge.className = 'px-3 py-1.5 rounded-xl bg-blue-100 text-blue-800 font-extrabold text-xs flex items-center gap-1.5 border border-blue-300';
      quotaBadge.innerHTML = `<i class="fas fa-check-circle text-blue-600"></i> বীর মুক্তিযোদ্ধা / প্রতিবন্ধী কোটায় আবেদনযোগ্য (১৮-৩২ বছর)`;
    } else {
      quotaBadge.className = 'px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200';
      quotaBadge.innerHTML = `<i class="fas fa-info-circle text-slate-500"></i> কোটায় বয়সসীমা ৩২ বছর উত্তীর্ণ`;
    }
  }
  
  resultBox.classList.remove('hidden');
}

// =========================================================================
// ৮. জমি পরিমাপ ও রূপান্তর ক্যালকুলেটর (Land Area Converter)
// =========================================================================
function initLandConverter() {
  const shotokInput = document.getElementById('conv-shotok');
  const kathaInput = document.getElementById('conv-katha');
  const bighaInput = document.getElementById('conv-bigha');
  const acreInput = document.getElementById('conv-acre');
  const sqftInput = document.getElementById('conv-sqft');
  
  if (!shotokInput) return;
  
  function updateFromSqft(sqft) {
    if (isNaN(sqft) || sqft < 0) sqft = 0;
    shotokInput.value = (sqft / 435.6).toFixed(3);
    kathaInput.value = (sqft / 718.74).toFixed(3);
    bighaInput.value = (sqft / 14374.8).toFixed(3);
    acreInput.value = (sqft / 43560).toFixed(4);
    sqftInput.value = sqft.toFixed(2);
  }

  shotokInput.addEventListener('input', () => {
    const val = parseFloat(shotokInput.value) || 0;
    const sqft = val * 435.6;
    kathaInput.value = (sqft / 718.74).toFixed(3);
    bighaInput.value = (sqft / 14374.8).toFixed(3);
    acreInput.value = (sqft / 43560).toFixed(4);
    sqftInput.value = sqft.toFixed(2);
  });

  kathaInput.addEventListener('input', () => {
    const val = parseFloat(kathaInput.value) || 0;
    const sqft = val * 718.74;
    shotokInput.value = (sqft / 435.6).toFixed(3);
    bighaInput.value = (sqft / 14374.8).toFixed(3);
    acreInput.value = (sqft / 43560).toFixed(4);
    sqftInput.value = sqft.toFixed(2);
  });

  bighaInput.addEventListener('input', () => {
    const val = parseFloat(bighaInput.value) || 0;
    const sqft = val * 14374.8;
    shotokInput.value = (sqft / 435.6).toFixed(3);
    kathaInput.value = (sqft / 718.74).toFixed(3);
    acreInput.value = (sqft / 43560).toFixed(4);
    sqftInput.value = sqft.toFixed(2);
  });

  acreInput.addEventListener('input', () => {
    const val = parseFloat(acreInput.value) || 0;
    const sqft = val * 43560;
    shotokInput.value = (sqft / 435.6).toFixed(3);
    kathaInput.value = (sqft / 718.74).toFixed(3);
    bighaInput.value = (sqft / 14374.8).toFixed(3);
    sqftInput.value = sqft.toFixed(2);
  });

  sqftInput.addEventListener('input', () => {
    const val = parseFloat(sqftInput.value) || 0;
    updateFromSqft(val);
  });
}

// =========================================================================
// ৯. দলিল রেজিস্ট্রি ও স্ট্যাম্প ফি ক্যালকুলেটর ইঞ্জিন (Deed & Stamp Calculator)
// =========================================================================
function calculateDeedFees() {
  const deedTypeElem = document.getElementById('deed-type');
  const deedAreaElem = document.getElementById('deed-area');
  const deedValElem = document.getElementById('deed-value');
  
  if (!deedTypeElem || !deedValElem) return;
  
  const deedType = deedTypeElem.value;
  const area = deedAreaElem ? deedAreaElem.value : 'paurashava';
  const val = parseFloat(deedValElem.value) || 0;
  
  let regFee = 0;
  let stampFee = 0;
  let localFee = 0;
  let aitFee = 0;
  let affidavit = 300;
  let eFee = 350;
  let badgeText = 'সাফ-কবলা দলিল';

  if (deedType === 'saf-kabala') {
    badgeText = 'সাফ-কবলা (বিক্রয় দলিল)';
    regFee = Math.round(val * 0.01);
    stampFee = Math.round(val * 0.015);
    localFee = area === 'paurashava' ? Math.round(val * 0.03) : (area === 'city' ? Math.round(val * 0.03) : Math.round(val * 0.02));
    aitFee = Math.round(val * 0.03);
  } else if (deedType === 'heba') {
    badgeText = 'হেবা / দানপত্র (রক্তের সম্পর্কে)';
    regFee = 100;
    stampFee = 200;
    localFee = 0;
    aitFee = 0;
  } else if (deedType === 'partition') {
    badgeText = 'বণ্টননামা দলিল (Partition)';
    regFee = val > 500000 ? 2000 : (val > 100000 ? 1000 : 500);
    stampFee = 50;
    localFee = 0;
    aitFee = 0;
  } else if (deedType === 'mortgage') {
    badgeText = 'ব্যাংক বন্ধকী দলিল (Mortgage)';
    regFee = Math.round(val * 0.01);
    stampFee = 2000;
    localFee = 0;
    aitFee = 0;
  } else if (deedType === 'power') {
    badgeText = 'আমমোক্তারনামা (Power of Attorney)';
    regFee = 500;
    stampFee = 1000;
    localFee = 0;
    aitFee = 0;
  }

  const total = regFee + stampFee + localFee + aitFee + affidavit + eFee;

  const toBn = n => n.toLocaleString('bn-BD');

  const badgeElem = document.getElementById('deed-type-badge');
  if (badgeElem) badgeElem.innerText = badgeText;
  
  if (document.getElementById('fee-reg')) document.getElementById('fee-reg').innerText = toBn(regFee) + ' ৳';
  if (document.getElementById('fee-stamp')) document.getElementById('fee-stamp').innerText = toBn(stampFee) + ' ৳';
  if (document.getElementById('fee-local')) document.getElementById('fee-local').innerText = toBn(localFee) + ' ৳';
  if (document.getElementById('fee-ait')) document.getElementById('fee-ait').innerText = toBn(aitFee) + ' ৳';
  if (document.getElementById('fee-affidavit')) document.getElementById('fee-affidavit').innerText = toBn(affidavit) + ' ৳';
  if (document.getElementById('fee-efee')) document.getElementById('fee-efee').innerText = toBn(eFee) + ' ৳';
  if (document.getElementById('fee-total')) document.getElementById('fee-total').innerText = toBn(total) + ' ৳';
}

function getLiveServicesData() {
  try {
    const saved = localStorage.getItem('fayzar_services_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 17) return parsed;
    }
  } catch(e) {}
  return SERVICES_DATA;
}

// =========================================================================
// ১০. এক্সপ্রেস প্রিন্ট ও ফাইল ড্রপ ইঞ্জিন (Express Print)
// =========================================================================
function initExpressPrint() {
  const form = document.getElementById('express-print-form');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('exp-name').value.trim();
    const phone = document.getElementById('exp-phone').value.trim();
    const type = document.getElementById('exp-type').value;
    const copies = document.getElementById('exp-copies').value || 1;
    const notes = document.getElementById('exp-notes').value.trim();
    
    if (!name || !phone) {
      showToast('অনুগ্রহ করে আপনার নাম ও মোবাইল নম্বর পূরণ করুন।', 'error');
      return;
    }
    
    const message = `*📄 ফয়জার কম্পিউটার - এক্সপ্রেস প্রিন্ট প্রি-অর্ডার*\n` +
      `👤 গ্রাহকের নাম: ${name}\n` +
      `📱 মোবাইল: ${phone}\n` +
      `🖨️ প্রিন্ট টাইপ: ${type}\n` +
      `📑 কপির সংখ্যা / পৃষ্ঠা: ${copies}\n` +
      (notes ? `📝 নির্দেশাবলী: ${notes}\n` : '') +
      `📎 আমি হোয়াটসঅ্যাপে আমার ফাইল/পিডিএফ এখনই পাঠাচ্ছি। অনুগ্রহ করে রেডি রাখবেন।`;
      
    const waUrl = `https://wa.me/8801717101919?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    showToast('হোয়াটসঅ্যাপে প্রিন্ট অর্ডার তৈরি হচ্ছে! ফাইলটি চ্যাটে এটাচ করুন।', 'success');
  });
}

// =========================================================================
// ১১. সেবাসমূহ ডায়নামিক স্বয়ংক্রিয় প্রদর্শনী ও ফিল্টার ইঞ্জিন (Zero-Blur Dynamic Carousel)
// =========================================================================
const SERVICE_CATEGORIES = [
  { id: 'land', name: '🏛️ ভূমিসেবা' },
  { id: 'online', name: '🌐 অনলাইন ও সরকারি সেবা' },
  { id: 'computer', name: '💻 কম্পিউটার ও স্টুডিও' }
];

let autoCycleTimer = null;
let autoCycleIndex = 0;
let isAutoCyclePaused = false;
let isViewAllActive = false;
let isSwitchingServices = false;
let currentServiceCategory = 'land';
let currentServiceSearch = '';

function renderServicesGrid(filterCategory = 'land', searchQuery = '', smoothTransition = true) {
  const container = document.getElementById('services-grid-container');
  const cycleBadgeText = document.getElementById('service-cycle-badge-text');
  if (!container) return;
  
  currentServiceCategory = filterCategory;
  currentServiceSearch = searchQuery;
  
  const allServices = getLiveServicesData();
  let filtered = allServices;
  
  if (filterCategory !== 'all') {
    filtered = filtered.filter(item => item.category === filterCategory);
  }
  
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.summary.toLowerCase().includes(q) ||
      (Array.isArray(item.documents) && item.documents.some(d => d.toLowerCase().includes(q)))
    );
  }

  // Update cycle badge text
  if (cycleBadgeText) {
    if (filterCategory === 'all' || isViewAllActive) {
      cycleBadgeText.innerHTML = `🌟 <strong>সকল সেবা একসাথে</strong> (${filtered.length} টি সেবা)`;
    } else {
      const catObj = SERVICE_CATEGORIES.find(c => c.id === filterCategory);
      cycleBadgeText.innerHTML = `🔄 <strong>চলমান ক্যাটাগরি:</strong> ${catObj ? catObj.name : 'সেবাসমূহ'} (${filtered.length} টি সেবা)`;
    }
  }

  function generateMarkup() {
    if (filtered.length === 0) {
      return `
        <div class="col-span-full py-12 text-center bg-white dark:bg-[#1b263b] rounded-3xl border border-slate-200 dark:border-slate-700">
          <i class="fas fa-search text-4xl text-slate-300 dark:text-slate-600 mb-3"></i>
          <h4 class="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">দুঃখিত, কোনো সেবা খুঁজে পাওয়া যায়নি!</h4>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">অন্য শব্দ দিয়ে অনুসন্ধান করুন অথবা সরাসরি আমাদের কল করুন।</p>
          <a href="tel:01717101919" class="mt-4 inline-flex items-center gap-2 bg-brandGreen text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow hover:bg-emerald-700 transition">
            <i class="fas fa-phone-alt"></i> 01717-101919
          </a>
        </div>
      `;
    }

    let displayItems = filtered;

    return displayItems.map(item => {
      const portalUrl = item.portal ? (item.portal.startsWith('http') ? item.portal : 'https://' + item.portal) : '';

      return `
        <div class="service-card-item bg-white dark:bg-[#1b263b] rounded-3xl border border-slate-200/90 dark:border-slate-700/80 p-5 sm:p-6 shadow-sm hover:shadow-xl transition-shadow duration-200 flex flex-col justify-between group">
          <div>
            <!-- Card Header: Icon & Badges -->
            <div class="flex items-start justify-between mb-4 gap-2">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 dark:from-emerald-950/80 dark:to-teal-950/40 text-brandGreen dark:text-emerald-400 flex items-center justify-center text-xl shadow-xs group-hover:scale-105 group-hover:bg-brandGreen group-hover:text-white transition duration-200">
                <i class="fas ${item.icon || 'fa-landmark'}"></i>
              </div>
              <div class="flex flex-col items-end gap-1.5">
                <span class="text-xs font-extrabold px-3 py-1 rounded-full border ${item.badgeColor || 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'}">
                  ${item.badge || 'ডিজিটাল সেবা'}
                </span>
                ${portalUrl ? `
                  <a href="${portalUrl}" target="_blank" rel="noopener noreferrer" class="text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 px-2.5 py-0.5 rounded-lg border border-sky-200 dark:border-sky-800 transition flex items-center gap-1 font-mono shadow-xs truncate max-w-[150px]" title="অফিসিয়াল সরকারি পোর্টাল">
                    <i class="fas fa-arrow-up-right-from-square text-[9px] text-sky-500"></i> <span class="truncate">${item.portal}</span>
                  </a>
                ` : ''}
              </div>
            </div>
            
            <!-- Service Title -->
            <h3 class="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-brandGreen dark:group-hover:text-emerald-400 transition leading-snug" title="${item.title}">
              ${item.title}
            </h3>
            
            <!-- Service Summary -->
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed line-clamp-2">
              ${item.summary}
            </p>
            
            <!-- Service Fee & Duration Box -->
            <div class="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-[#162035] p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 mb-4 text-xs">
              <div>
                <span class="text-slate-500 dark:text-slate-400 block text-[11px] font-medium"><i class="fas fa-hand-holding-dollar text-emerald-500 mr-1"></i>সার্ভিস চার্জ</span>
                <strong class="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs sm:text-sm">${item.serviceFee}</strong>
              </div>
              <div>
                <span class="text-slate-500 dark:text-slate-400 block text-[11px] font-medium"><i class="fas fa-clock text-blue-500 mr-1"></i>সময়সীমা</span>
                <strong class="text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm">${item.duration}</strong>
              </div>
            </div>

            <!-- Documents Preview -->
            ${Array.isArray(item.documents) && item.documents.length > 0 ? `
              <div class="bg-emerald-50/60 dark:bg-emerald-950/30 px-3 py-2 rounded-xl border border-emerald-100/80 dark:border-emerald-900/40 mb-4 flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-300">
                <i class="fas fa-file-shield text-emerald-600 dark:text-emerald-400 text-sm"></i>
                <span class="truncate font-medium">প্রয়োজনীয় কাগজ: <strong>${item.documents[0]}</strong> সহ ${item.documents.length}টি নথি</span>
              </div>
            ` : ''}
          </div>
          
          <!-- Action Buttons -->
          <div class="pt-3 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-2 gap-2">
            <button onclick="openServiceModal('${item.id}')" class="w-full bg-slate-100 dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-800 dark:text-slate-200 hover:text-brandGreen dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-600 font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs">
              <i class="fas fa-list-check text-brandGreen dark:text-emerald-400"></i> বিস্তারিত
            </button>
            <a href="https://wa.me/8801717101919?text=${encodeURIComponent(`আসসালামু আলাইকুম, আমি ফয়জার কম্পিউটার ওয়েবসাইট থেকে "${item.title}" সেবাটি সম্পর্কে জানতে বা আবেদন করতে চাচ্ছি।`)}" target="_blank" class="w-full bg-brandGreen hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg">
              <i class="fab fa-whatsapp text-sm"></i> আবেদন করুন
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  // Smooth zero-blur opacity cross-fade
  if (smoothTransition && container.children.length > 0) {
    if (isSwitchingServices) return;
    isSwitchingServices = true;
    container.classList.add('is-transitioning');
    
    setTimeout(() => {
      container.innerHTML = generateMarkup();
      container.classList.remove('is-transitioning');
      isSwitchingServices = false;
    }, 180);
  } else {
    container.innerHTML = generateMarkup();
  }
}

function openServiceModal(serviceId) {
  const services = getLiveServicesData();
  const service = services.find(s => s.id === serviceId);
  if (!service) return;

  const portalUrl = service.portal ? (service.portal.startsWith('http') ? service.portal : 'https://' + service.portal) : '';

  const modalBody = document.getElementById('modal-body-content');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <div class="p-6 sm:p-8 space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar">
      <div class="flex items-center justify-between border-b border-slate-100 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-brandGreen flex items-center justify-center text-xl shadow-sm">
            <i class="fas ${service.icon || 'fa-star'}"></i>
          </div>
          <div>
            <span class="text-xs font-extrabold px-2.5 py-0.5 rounded-full ${service.badgeColor || 'bg-emerald-100 text-emerald-800 border-emerald-300'}">
              ${service.badge || 'ডিজিটাল সেবা'}
            </span>
            <h3 class="text-xl font-extrabold text-slate-900 mt-1">${service.title}</h3>
          </div>
        </div>
        <button onclick="closeServiceModal()" class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-base transition">
          <i class="fas fa-xmark"></i>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div class="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80">
          <span class="text-amber-700 font-bold block mb-0.5"><i class="fas fa-coins text-amber-500 mr-1"></i> সরকারি ফি:</span>
          <span class="text-slate-900 font-black text-sm">${service.govtFee}</span>
        </div>
        <div class="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200/80">
          <span class="text-emerald-700 font-bold block mb-0.5"><i class="fas fa-desktop text-emerald-600 mr-1"></i> কম্পিউটার সার্ভিস চার্জ:</span>
          <span class="text-brandGreen font-black text-sm">${service.serviceFee}</span>
        </div>
        <div class="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200/80">
          <span class="text-blue-700 font-bold block mb-0.5"><i class="fas fa-clock text-blue-500 mr-1"></i> আনুমানিক সময়:</span>
          <span class="text-slate-900 font-black text-sm">${service.duration}</span>
        </div>
      </div>

      ${portalUrl ? `
        <div class="bg-gradient-to-r from-sky-50 via-sky-50 to-blue-50 p-4 rounded-2xl border border-sky-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center text-base shadow">
              <i class="fas fa-globe"></i>
            </div>
            <div>
              <div class="text-xs font-bold text-slate-800">অফিসিয়াল সরকারি ওয়েবসাইট / পোর্টাল:</div>
              <div class="text-xs font-mono font-bold text-sky-700">${service.portal}</div>
            </div>
          </div>
          <a href="${portalUrl}" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md">
            <span>সরাসরি পোর্টালে যান</span> <i class="fas fa-arrow-up-right-from-square text-[10px]"></i>
          </a>
        </div>
      ` : ''}

      <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
        <h4 class="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <i class="fas fa-list-check text-brandGreen"></i> প্রয়োজনীয় কাগজপত্রের পূর্ণাঙ্গ তালিকা (${Array.isArray(service.documents) ? service.documents.length : 0} টি):
        </h4>
        <ul class="space-y-2 text-xs text-slate-700">
          ${Array.isArray(service.documents) ? service.documents.map((doc, idx) => `
            <li class="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
              <span class="w-5 h-5 rounded-full bg-emerald-100 text-brandGreen flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">${idx + 1}</span>
              <span class="font-medium">${doc}</span>
            </li>
          `).join('') : ''}
        </ul>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 pt-2">
        <a href="https://wa.me/8801717101919?text=${encodeURIComponent(`আসসালামু আলাইকুম, আমি ফয়জার কম্পিউটার ওয়েবসাইট থেকে "${service.title}" সেবাটি অনলাইনে করাতে চাচ্ছি। প্রয়োজনীয় ডকুমেন্টস রেডি আছে।`)}" target="_blank" class="flex-1 bg-brandGreen hover:bg-emerald-700 text-white font-extrabold py-3.5 px-5 rounded-2xl text-center text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2">
          <i class="fab fa-whatsapp text-lg"></i> সরাসরি আবেদন সম্পন্ন করুন
        </a>
        <button onclick="closeServiceModal()" class="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition">
          বন্ধ করুন
        </button>
      </div>
    </div>
  `;

  const modal = document.getElementById('service-detail-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeServiceModal() {
  const modal = document.getElementById('service-detail-modal');
  if (modal) modal.classList.add('hidden');
}

const SERVICE_TAB_CATEGORIES = ['land', 'online', 'computer'];
let isServicesHovered = false;

function updateServiceTabUI(category) {
  const tabs = document.querySelectorAll('.service-tab-btn');
  tabs.forEach(t => {
    const cat = t.getAttribute('data-category');
    if (cat === category) {
      t.classList.add('active', 'bg-brandGreen', 'text-white');
      t.classList.remove('bg-white', 'dark:bg-[#1b263b]', 'text-slate-700', 'dark:text-slate-200');
    } else {
      t.classList.remove('active', 'bg-brandGreen', 'text-white');
      t.classList.add('bg-white', 'dark:bg-[#1b263b]', 'text-slate-700', 'dark:text-slate-200');
    }
  });
}

function cycleNextServiceCategory() {
  if (isServicesHovered || isViewAllActive || (currentServiceSearch && currentServiceSearch.trim() !== '')) return;
  autoCycleIndex = (autoCycleIndex + 1) % SERVICE_TAB_CATEGORIES.length;
  const nextCategory = SERVICE_TAB_CATEGORIES[autoCycleIndex];
  updateServiceTabUI(nextCategory);
  renderServicesGrid(nextCategory, '', true);
}

function startServicesAutoCycle() {
  if (autoCycleTimer) return;
  autoCycleTimer = setInterval(cycleNextServiceCategory, 3500);
}

function stopServicesAutoCycle() {
  if (autoCycleTimer) {
    clearInterval(autoCycleTimer);
    autoCycleTimer = null;
  }
}

function initTabs() {
  const tabs = document.querySelectorAll('.service-tab-btn');
  const gridContainer = document.getElementById('services-grid-container');
  const expandBtn = document.getElementById('toggle-services-expand-btn');
  const expandText = document.getElementById('toggle-services-expand-text');

  // Pause on mouse hover so user can read / click peacefully
  if (gridContainer) {
    gridContainer.addEventListener('mouseenter', () => {
      isServicesHovered = true;
    });
    gridContainer.addEventListener('mouseleave', () => {
      isServicesHovered = false;
    });
  }

  // Category Tab Clicks
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const category = tab.getAttribute('data-category');
      
      if (category === 'all') {
        openViewAllServices();
        return;
      }
      
      // If user clicked a specific category tab
      if (isViewAllActive) {
        closeViewAllServices(false);
      }
      
      autoCycleIndex = SERVICE_TAB_CATEGORIES.indexOf(category);
      if (autoCycleIndex === -1) autoCycleIndex = 0;
      
      updateServiceTabUI(category);
      renderServicesGrid(category, '', true);
      
      // Pause rotation temporarily for 8 seconds when clicked manually
      isServicesHovered = true;
      setTimeout(() => {
        isServicesHovered = false;
      }, 8000);
    });
  });

  // Open "View All Services"
  function openViewAllServices() {
    isViewAllActive = true;
    updateServiceTabUI('all');
    renderServicesGrid('all', '', true);
    if (expandText) expandText.innerHTML = `⏱️ সংক্ষেপে দেখুন (অটো-প্রদর্শনী চালু করুন)`;
  }

  function closeViewAllServices(scrollBack = false) {
    isViewAllActive = false;
    if (expandText) expandText.innerHTML = `👁️ সকল সেবা একসাথে দেখুন (১৪+ টি সেবা)`;
    
    const defaultCat = SERVICE_TAB_CATEGORIES[autoCycleIndex] || 'land';
    updateServiceTabUI(defaultCat);
    renderServicesGrid(defaultCat, '', true);
    
    if (scrollBack) {
      const sec = document.getElementById('all-services');
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Expand Button Handler
  if (expandBtn) {
    expandBtn.addEventListener('click', () => {
      if (!isViewAllActive) {
        openViewAllServices();
      } else {
        closeViewAllServices(true);
      }
    });
  }

  // Smart Tools Tabs
  const toolTabs = document.querySelectorAll('.tool-tab-btn');
  toolTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      toolTabs.forEach(b => {
        b.classList.remove('active', 'bg-brandGreen', 'text-white');
        b.classList.add('bg-white', 'text-slate-700');
      });
      btn.classList.add('active', 'bg-brandGreen', 'text-white');
      btn.classList.remove('bg-white', 'text-slate-700');
      
      const target = btn.getAttribute('data-tool-target');
      document.querySelectorAll('.tool-panel').forEach(panel => {
        panel.classList.add('hidden');
      });
      const activePanel = document.getElementById(target);
      if (activePanel) activePanel.classList.remove('hidden');
    });
  });
}

// =========================================================================
// ১২. লাইভ সার্চ ইঞ্জিন
// =========================================================================
function initLiveSearch() {
  const searchInput = document.getElementById('hero-live-search');
  const suggestionsBox = document.getElementById('search-suggestions');
  
  if (!searchInput || !suggestionsBox) return;
  
  searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim().toLowerCase();
    
    if (val.length < 2) {
      suggestionsBox.classList.add('hidden');
      suggestionsBox.innerHTML = '';
      return;
    }
    
    const allServices = getLiveServicesData();
    const matches = allServices.filter(item => 
      item.title.toLowerCase().includes(val) || 
      item.summary.toLowerCase().includes(val) ||
      (Array.isArray(item.documents) && item.documents.some(d => d.toLowerCase().includes(val)))
    );
    
    if (matches.length > 0) {
      suggestionsBox.innerHTML = matches.map(item => `
        <div onclick="selectSearchResult('${item.id}')" class="p-3.5 hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer border-b border-gray-100 dark:border-slate-800 last:border-0 flex items-center justify-between group transition">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-100 text-brandGreen flex items-center justify-center text-sm">
              <i class="fas ${item.icon}"></i>
            </div>
            <div>
              <div class="text-sm font-bold text-gray-800 dark:text-slate-200 group-hover:text-brandGreen">${item.title}</div>
              <div class="text-xs text-gray-500 dark:text-slate-400">${item.summary.substring(0, 50)}...</div>
            </div>
          </div>
          <span class="text-xs font-semibold text-brandGold group-hover:underline flex items-center gap-1">
            দেখুন <i class="fas fa-chevron-right text-[10px]"></i>
          </span>
        </div>
      `).join('');
      suggestionsBox.classList.remove('hidden');
    } else {
      suggestionsBox.innerHTML = `
        <div class="p-4 text-center text-xs text-gray-500 dark:text-slate-400">
          কোনো ফলাফল পাওয়া যায়নি। সরাসরি কল করতে পারেন: <strong>01717-101919</strong>
        </div>
      `;
      suggestionsBox.classList.remove('hidden');
    }
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.classList.add('hidden');
    }
  });
}

function selectSearchResult(id) {
  const suggestionsBox = document.getElementById('search-suggestions');
  if (suggestionsBox) suggestionsBox.classList.add('hidden');
  openServiceModal(id);
}

// =========================================================================
// ১৩. ডিজিটাল ও ভূমিসেবা ক্যালকুলেটর ও চেকলিস্ট ডায়নামিক অটো-সাইকেল ইঞ্জিন
// =========================================================================
let calcCycleTimer = null;
let calcCycleIndex = 0;
let isCalcHovered = false;
let isCalcSwitching = false;
let orderedServicesList = [];

function cycleNextLandCalcService() {
  if (isCalcHovered || orderedServicesList.length === 0) return;
  calcCycleIndex = (calcCycleIndex + 1) % orderedServicesList.length;
  const nextService = orderedServicesList[calcCycleIndex];
  if (nextService) {
    const selectElem = document.getElementById('calc-service-select');
    if (selectElem) selectElem.value = nextService.id;
    updateLandCalculatorDisplay(nextService.id, true);
  }
}

function startCalcAutoCycle() {
  if (calcCycleTimer) return;
  calcCycleTimer = setInterval(cycleNextLandCalcService, 4000);
}

function stopCalcAutoCycle() {
  if (calcCycleTimer) {
    clearInterval(calcCycleTimer);
    calcCycleTimer = null;
  }
}

function initLandCalculator() {
  const selectElem = document.getElementById('calc-service-select');
  const displayContainer = document.getElementById('calc-result-display');
  if (!selectElem) return;
  
  const preferredOrder = [
    'e-mutation',
    'ld-tax',
    'khatian',
    'mouza-map',
    'miss-case',
    'e-passport',
    'police-clearance',
    'online-gd',
    'nid-correct',
    'nid-download',
    'tin-cert',
    'e-return',
    'trade-lic',
    'driving'
  ];

  const allServices = getLiveServicesData();
  orderedServicesList = [];

  preferredOrder.forEach(id => {
    const found = allServices.find(s => s.id === id && s.category !== 'computer');
    if (found) orderedServicesList.push(found);
  });

  allServices.forEach(s => {
    if (s.category !== 'computer' && !orderedServicesList.some(item => item.id === s.id)) {
      orderedServicesList.push(s);
    }
  });

  selectElem.innerHTML = orderedServicesList.map(s => `
    <option value="${s.id}">${s.title}</option>
  `).join('');

  // Pause on hover
  if (displayContainer) {
    displayContainer.addEventListener('mouseenter', () => {
      isCalcHovered = true;
    });
    displayContainer.addEventListener('mouseleave', () => {
      isCalcHovered = false;
    });
  }

  // Pause on select focus
  selectElem.addEventListener('focus', () => {
    isCalcHovered = true;
  });
  selectElem.addEventListener('blur', () => {
    isCalcHovered = false;
  });

  // User Manual Selection
  selectElem.addEventListener('change', () => {
    const idx = orderedServicesList.findIndex(s => s.id === selectElem.value);
    if (idx !== -1) calcCycleIndex = idx;
    updateLandCalculatorDisplay(selectElem.value, true);

    // Pause for 10s on manual change
    isCalcHovered = true;
    setTimeout(() => {
      isCalcHovered = false;
    }, 10000);
  });
  
  if (orderedServicesList.length > 0) {
    calcCycleIndex = 0;
    updateLandCalculatorDisplay(orderedServicesList[0].id, false);
  }
}

function updateLandCalculatorDisplay(serviceId, smoothTransition = true) {
  const services = getLiveServicesData();
  const service = services.find(s => s.id === serviceId);
  if (!service) return;

  const displayContainer = document.getElementById('calc-result-display');
  const badgeTextElem = document.getElementById('calc-cycle-badge-text');
  const selectElem = document.getElementById('calc-service-select');
  if (!displayContainer) return;

  if (selectElem && selectElem.value !== serviceId) {
    selectElem.value = serviceId;
  }

  if (badgeTextElem && orderedServicesList.length > 0) {
    const currentIndex = orderedServicesList.findIndex(s => s.id === serviceId);
    const displayIndex = currentIndex !== -1 ? currentIndex + 1 : 1;
    badgeTextElem.innerHTML = `🔄 <strong>স্বয়ংক্রিয় সেবা নির্দেশিকা:</strong> ${service.title} (${displayIndex}/${orderedServicesList.length})`;
  }

  const portalUrl = service.portal ? (service.portal.startsWith('http') ? service.portal : 'https://' + service.portal) : '';
  
  function generateCalcMarkup() {
    return `
      <div class="bg-emerald-50/70 dark:bg-emerald-950/30 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <span class="text-xs font-bold px-3 py-1 rounded-full bg-brandGreen text-white">${service.badge}</span>
            <h4 class="text-xl font-bold text-gray-900 dark:text-slate-100 mt-2">${service.title}</h4>
          </div>
          ${portalUrl ? `
            <div class="flex flex-col sm:items-end gap-1">
              <span class="text-[11px] text-gray-500 dark:text-slate-400 font-bold">অফিসিয়াল পোর্টাল:</span>
              <a href="${portalUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-sm transition">
                <i class="fas fa-globe text-[11px]"></i> <span>${service.portal}</span> <i class="fas fa-arrow-up-right-from-square text-[9px]"></i>
              </a>
            </div>
          ` : ''}
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div class="bg-white dark:bg-[#1b263b] p-3.5 rounded-xl border border-emerald-100 dark:border-slate-700 shadow-sm">
            <div class="text-xs text-gray-500 dark:text-slate-400 font-semibold mb-1"><i class="fas fa-coins text-amber-500 mr-1"></i> সরকারি ফি:</div>
            <div class="text-sm font-extrabold text-red-600 dark:text-rose-400">${service.govtFee}</div>
          </div>
          <div class="bg-white dark:bg-[#1b263b] p-3.5 rounded-xl border border-emerald-100 dark:border-slate-700 shadow-sm">
            <div class="text-xs text-gray-500 dark:text-slate-400 font-semibold mb-1"><i class="fas fa-desktop text-brandGreen mr-1"></i> কম্পিউটার চার্জ:</div>
            <div class="text-sm font-extrabold text-brandGreen dark:text-emerald-400">${service.serviceFee}</div>
          </div>
          <div class="bg-white dark:bg-[#1b263b] p-3.5 rounded-xl border border-emerald-100 dark:border-slate-700 shadow-sm">
            <div class="text-xs text-gray-500 dark:text-slate-400 font-semibold mb-1"><i class="fas fa-clock text-blue-500 mr-1"></i> আনুমানিক সময়:</div>
            <div class="text-sm font-extrabold text-gray-800 dark:text-slate-200">${service.duration}</div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-[#1b263b] p-5 rounded-xl border border-emerald-100 dark:border-slate-700 shadow-sm mb-5">
          <h5 class="text-sm font-bold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
            <i class="fas fa-tasks text-brandGreen"></i> সাথে যে যে কাগজপত্র আনতে হবে (চেকলিস্ট):
          </h5>
          <div class="space-y-2.5">
            ${service.documents.map((doc, idx) => `
              <label class="flex items-start gap-2.5 text-xs text-gray-700 dark:text-slate-300 cursor-pointer select-none" onclick="isCalcHovered = true; setTimeout(() => { isCalcHovered = false; }, 8000);">
                <input type="checkbox" id="chk-${idx}" class="mt-0.5 w-4 h-4 rounded text-brandGreen focus:ring-brandGreen accent-emerald-600 cursor-pointer">
                <span>${doc}</span>
              </label>
            `).join('')}
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <a href="https://wa.me/8801717101919?text=${encodeURIComponent(`আসসালামু আলাইকুম, আমি ফয়জার কম্পিউটার থেকে "${service.title}" সেবাটির জন্য প্রয়োজনীয় কাগজপত্র প্রস্তুত করেছি। বিস্তারিত সাহায্য প্রয়োজন।`)}" target="_blank" class="flex-1 bg-brandGreen hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl text-center text-sm shadow-md transition flex items-center justify-center gap-2">
            <i class="fab fa-whatsapp text-lg"></i> হোয়াটসঅ্যাপে সরাসরি পরামর্শ নিন
          </a>
          <a href="tel:01717101919" class="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 border border-gray-300 dark:border-slate-600 font-bold py-3 px-5 rounded-xl text-center text-sm shadow-sm transition flex items-center justify-center gap-2">
            <i class="fas fa-phone-alt text-brandGreen"></i> 01717-101919
          </a>
        </div>
      </div>
    `;
  }

  if (smoothTransition && displayContainer.children.length > 0) {
    if (isCalcSwitching) return;
    isCalcSwitching = true;
    displayContainer.classList.add('is-transitioning');
    setTimeout(() => {
      displayContainer.innerHTML = generateCalcMarkup();
      displayContainer.classList.remove('is-transitioning');
      isCalcSwitching = false;
    }, 180);
  } else {
    displayContainer.innerHTML = generateCalcMarkup();
  }
}

// =========================================================================
// ১৩.১ স্মার্ট ভিউপোর্ট অটো-প্লে ইঞ্জিন (Active Section Viewport Auto-Play)
// =========================================================================
function initViewportAutoPlayEngine() {
  if (!('IntersectionObserver' in window)) {
    startServicesAutoCycle();
    startNoticesAutoCycle();
    startCalcAutoCycle();
    return;
  }

  const sectionIds = ['land-guide', 'notices-hub', 'all-services'];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;

      if (entry.isIntersecting) {
        if (id === 'land-guide') {
          startCalcAutoCycle();
          stopNoticesAutoCycle();
          stopServicesAutoCycle();
        } else if (id === 'notices-hub') {
          startNoticesAutoCycle();
          stopCalcAutoCycle();
          stopServicesAutoCycle();
        } else if (id === 'all-services') {
          startServicesAutoCycle();
          stopCalcAutoCycle();
          stopNoticesAutoCycle();
        }
      } else {
        if (id === 'land-guide') {
          stopCalcAutoCycle();
        } else if (id === 'notices-hub') {
          stopNoticesAutoCycle();
        } else if (id === 'all-services') {
          stopServicesAutoCycle();
        }
      }
    });
  }, {
    threshold: 0.25,
    rootMargin: '0px 0px -40px 0px'
  });

  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

// =========================================================================
// ১৪. অনলাইন সেবা অর্ডার ফর্ম
// =========================================================================
function initQuickOrderForm() {
  const form = document.getElementById('quick-service-form');
  if (!form) return;
  
  const select = document.getElementById('order-service-select');
  const allServices = getLiveServicesData();
  if (select) {
    select.innerHTML = `<option value="">-- আপনার প্রয়োজনীয় সেবাটি নির্বাচন করুন --</option>` +
      allServices.map(s => `<option value="${s.title}">${s.title}</option>`).join('');
  }
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('order-name').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    const service = document.getElementById('order-service-select').value;
    const notes = document.getElementById('order-notes').value.trim();
    
    if (!name || !phone || !service) {
      showToast('অনুগ্রহ করে নাম, ফোন নম্বর এবং সেবার নাম পূরণ করুন।', 'error');
      return;
    }
    
    const message = `*অনলাইন সেবা আবেদন / পরামর্শ রিকুয়েস্ট*\n` +
      `👤 গ্রাহকের নাম: ${name}\n` +
      `📱 মোবাইল নম্বর: ${phone}\n` +
      `📌 প্রয়োজনীয় সেবা: ${service}\n` +
      (notes ? `📝 অতিরিক্ত তথ্য/বিবরণ: ${notes}\n` : '') +
      `🌐 Fayzar Computer Website থেকে প্রেরিত`;
      
    const waUrl = `https://wa.me/8801717101919?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    showToast('হোয়াটসঅ্যাপে মেসেজ পাঠানো হচ্ছে...', 'success');
  });
}

// =========================================================================
// ১৫. সাধারণ জিজ্ঞাসা ও উত্তর (FAQ)
// =========================================================================
function initFAQ() {
  const faqButtons = document.querySelectorAll('.faq-toggle');
  faqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const icon = btn.querySelector('.faq-icon');
      
      const isOpen = !content.classList.contains('hidden');
      
      document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
      document.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('rotate-180'));
      
      if (!isOpen) {
        content.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
      }
    });
  });
}

// =========================================================================
// ১৬. টোস্ট নোটিফিকেশন ও ক্লিপবোর্ড কপি
// =========================================================================
function showToast(message, type = 'info') {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full text-white text-xs sm:text-sm font-bold shadow-2xl transition-all duration-300 flex items-center gap-2 pointer-events-none';
    document.body.appendChild(toast);
  }
  
  if (type === 'success') {
    toast.style.backgroundColor = '#047857';
    toast.innerHTML = `<i class="fas fa-check-circle text-yellow-300"></i> ${message}`;
  } else if (type === 'error') {
    toast.style.backgroundColor = '#dc2626';
    toast.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  } else {
    toast.style.backgroundColor = '#1e293b';
    toast.innerHTML = `<i class="fas fa-info-circle text-sky-400"></i> ${message}`;
  }
  
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

function copyToClipboard(text, label = 'তথ্য') {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`${label} ক্লিপবোর্ডে কপি করা হয়েছে: ${text}`, 'success');
  }).catch(() => {
    showToast(`কপি করা সম্ভব হয়নি।`, 'error');
  });
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top-btn');
  if (!btn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.remove('hidden');
    } else {
      btn.classList.add('hidden');
    }
  });
  
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initMobileDrawer() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const closeBtn = document.getElementById('mobile-drawer-close');
  
  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.toggle('hidden');
    });
  }
  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', () => {
      drawer.classList.add('hidden');
    });
  }
}
