/**
 * ফয়জার কম্পিউটার এন্ড ফটোস্ট্যাট - অ্যাডমিন প্যানেল ইঞ্জিন
 * Categorized Control Architecture:
 * ১. সেবাসমূহ ম্যানেজমেন্ট
 * ২. স্কুল/কলেজ সংক্রান্ত নোটিশ
 * ৩. চাকুরির নোটিশ
 * ৪. লাইভ নোটিশসমূহ
 */

const ADMIN_PIN = '101919';

// =========================================================================
// ডিফল্ট ডেটাসেট (Default Services & Notices)
// =========================================================================
const DEFAULT_SERVICES_LIST = [
  {
    id: 'e-mutation',
    category: 'land',
    title: 'ই-নামজারি ও রেকর্ড খারিজ (E-Mutation)',
    govtFee: '১,১৭০ ৳ (কোর্ট ফি ২০৳ + নোটিশ ফি ৫০৳ + রেকর্ড সংশোধন ফি ১,০০০৳ + খতিয়ান ফি ১০০৳)',
    serviceFee: '৩০০ - ৫০০ ৳',
    duration: '২৮ কর্মদিবস (সাধারণত)',
    portal: 'mutation.land.gov.bd',
    summary: 'জমি ক্রয়, হেবা, দান বা ওয়ারিশসূত্রে প্রাপ্ত জমির মালিকানা পরিবর্তন ও নতুন খতিয়ান তৈরি।',
    documents: [
      'মূল দলিল / বায়া দলিলের সার্টিফাইড ফটোকপি',
      'পূর্ববর্তী খতিয়ানসমূহ (CS, SA, RS, হাল খতিয়ান)',
      'সর্বশেষ পরিশোধিত ভূমি উন্নয়ন কর (খাজনা) দাখিলা',
      'ক্রেতা ও বিক্রেতার জাতীয় পরিচয়পত্র (NID) নম্বর ও ছবি',
      'ওয়ারিশান সনদ ও মৃত্যু সনদ (ওয়ারিশ সূত্রে প্রাপ্ত জমির ক্ষেত্রে)'
    ]
  },
  {
    id: 'ld-tax',
    category: 'land',
    title: 'অনলাইনে জমির খাজনা পরিশোধ (LD Tax)',
    govtFee: 'জমির ধরণ ও শতক অনুযায়ী সরকারি নির্ধারিত ফি',
    serviceFee: '৫০ - ১০০ ৳',
    duration: 'তাৎক্ষণিক (অনলাইন পেমেন্ট সাপেক্ষে)',
    portal: 'ldtax.gov.bd',
    summary: 'নতুন হোল্ডিং এন্ট্রি, বার্ষিক ভূমি উন্নয়ন কর অনলাইন পেমেন্ট ও তাৎক্ষণিক ডিজিটাল রসিদ সংগ্রহ।',
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
    govtFee: 'অনলাইন কপি: ৫০৳ | সার্টিফাইড হার্ডকপি: ১০০৳ + ডাক মাশুল',
    serviceFee: '৫০ - ১০০ ৳',
    duration: 'অনলাইন কপি সাথে সাথে | সার্টিফাইড কপি ৫-৭ দিন',
    portal: 'eporcha.gov.bd',
    summary: 'CS, SA, RS, BS ও সিটি জরিপের খতিয়ান অনুসন্ধান, অনলাইন কপি ও জেলা রেকর্ডরুমের মূল পর্চা আবেদন।',
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
    govtFee: 'সরকারি ম্যাপ ফি ও পোস্টাল চার্জ (৫২০৳+)',
    serviceFee: '১০০ - ১৫০ ৳',
    duration: '৭ - ১০ কর্মদিবস',
    portal: 'dlrs.gov.bd',
    summary: 'যেকোনো মৌজার মূল সিট বা নকশার জন্য ভূমি রেকর্ড ও জরিপ অধিদপ্তরে সরাসরি অনলাইন আবেদন।',
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
    govtFee: 'কোর্ট ফি ও নির্ধারিত সরকারি চালানের কপি',
    serviceFee: '২০০ - ৫০০ ৳',
    duration: 'শুনানি ও তদন্ত সাপেক্ষে',
    portal: 'land.gov.bd',
    summary: 'খতিয়ানে নামের ভুল, দাগ নম্বর বা হিস্যা ভুল সংক্রান্ত সহকারী কমিশনার (ভূমি) বরাবর মিস কেস আবেদন।',
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
    govtFee: '৫ বছর (৪৮ পাতা): ৪,০২৫৳ | ১০ বছর: ৫,৭৫০৳ (জরুরিতে বেশি)',
    serviceFee: '২০০ - ৩০০ ৳',
    duration: 'অনলাইন ফরম পূরণ তাৎক্ষণিক',
    portal: 'epassport.gov.bd',
    summary: '৪৮ ও ৬৪ পাতার ৫ বা ১০ বছর মেয়াদি নতুন ই-পাসপোর্ট আবেদন, তথ্য এন্ট্রি ও ব্যাংক ড্রাফট পেমেন্ট।',
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
    govtFee: '৫০০ ৳ (চালান কোড অনুযায়ী ট্রেজারি বা সোনালী সেবা)',
    serviceFee: '১৫০ - ২০০ ৳',
    duration: '৭ - ১৫ কর্মদিবস (ভেরিফিকেশন সাপেক্ষে)',
    portal: 'pcc.police.gov.bd',
    summary: 'বিদেশ যাত্রা বা চাকরির প্রয়োজনে পুলিশ ক্লিয়ারেন্স সার্টিফিকেট এর নির্ভুল অনলাইন আবেদন ও চালান জমা।',
    documents: [
      'পাসপোর্টের ১ম পাতার সত্যায়িত ফটোকপি (মেয়াদ অন্তত ৩ মাস থাকতে হবে)',
      'জাতীয় পরিচয়পত্র (NID) বা অনলাইন জন্ম নিবন্ধন',
      'স্থানীয় ইউনিয়ন পরিষদ/পৌরসভার চেয়ারম্যান প্রদত্ত চারিত্রিক সনদ'
    ]
  },
  {
    id: 'online-gd',
    category: 'online',
    title: 'অনলাইন সাধারণ ডায়েরি (Online GD)',
    govtFee: '০ ৳ (সরকারি কোনো ফি নেই)',
    serviceFee: '১০০ - ১৫০ ৳',
    duration: '১০ - ২০ মিনিট',
    portal: 'gd.police.gov.bd',
    summary: 'জাতীয় পরিচয়পত্র, সার্টিফিকেট, পাসপোর্ট, ব্যাংকের চেক বা মূল্যবান নথি হারানো সংক্রান্ত থানা জিডি।',
    documents: [
      'আবেদনকারীর জাতীয় পরিচয়পত্র (NID) নম্বর ও জন্ম তারিখ',
      'হারিয়ে যাওয়া ডকুমেন্টের নম্বর বা স্পষ্ট বিবরণ',
      'একটি সচল মোবাইল নম্বর (এসএমএস ভেরিফিকেশনের জন্য)'
    ]
  },
  {
    id: 'nid-correct',
    category: 'online',
    title: 'NID কার্ড সংশোধন ও রি-ইস্যু আবেদন',
    govtFee: 'ক্যাটেগরি অনুযায়ী ২৩০৳ - ৫৭৫৳',
    serviceFee: '১০০ - ২০০ ৳',
    duration: 'অনুমোদন সাপেক্ষে',
    portal: 'services.nidw.gov.bd',
    summary: 'জাতীয় পরিচয়পত্রে নিজের নাম, পিতা-মাতার নাম, জন্ম তারিখ ও রক্তের গ্রুপ সংশোধন ও ফি জমাদান।',
    documents: [
      'অনলাইন জন্ম নিবন্ধন সনদ (১৭ ডিজিট)',
      'এসএসসি/সমমানের শিক্ষাগত যোগ্যতার সনদ',
      'পাসপোর্ট / ড্রাইভিং লাইসেন্স (যদি থাকে)',
      'পিতা/মাতার এনআইডি কার্ডের কপি'
    ]
  },
  {
    id: 'nid-download',
    category: 'online',
    title: 'অনলাইন ভোটার আইডি ডাউনলোড ও লেমিনেশন',
    govtFee: 'প্রযোজ্য ক্ষেত্রে সরকারি ফি',
    serviceFee: '৫০ - ১০০ ৳',
    duration: '৫ - ১০ মিনিট',
    portal: 'services.nidw.gov.bd',
    summary: 'নতুন ভোটারদের স্লিপ নম্বর বা হারিয়ে যাওয়া NID এর অনলাইন কপি ডাউনলোড ও প্লাস্টিক কার্ড প্রিন্ট।',
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
    govtFee: 'সরকারি ফি নেই (ফ্রি)',
    serviceFee: '১০০ - ১৫০ ৳',
    duration: 'তাৎক্ষণিক (৫-১০ মিনিট)',
    portal: 'incometax.gov.bd',
    summary: 'ব্যবসা, সঞ্চয়পত্র ক্রয়, ব্যাংক লোন বা ট্রেড লাইসেন্সের জন্য নতুন ১২ ডিজিটের ই-টিন সার্টিফিকেট তাৎক্ষণিক গ্রহণ।',
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
    govtFee: 'আয়কর স্ল্যাব অনুযায়ী অথবা জিরো ট্যাক্স',
    serviceFee: '২০০ - ৫০০ ৳',
    duration: 'তাৎক্ষণিক একনলেজমেন্ট রসিদ',
    portal: 'etaxnbr.gov.bd',
    summary: 'এনবিআর এর অনলাইন পোর্টালে বার্ষিক আয়কর ই-রিটার্ন দাখিল, ট্যাক্স হিসাব এবং তাৎক্ষণিক অফিসিয়াল প্রমাণপত্র/একনলেজমেন্ট প্রাপ্তি।',
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
    govtFee: 'ব্যবসার মূলধন ও পৌরসভা/ইউপি নির্ধারিত ফি',
    serviceFee: '১৫০ - ৩০০ ৳',
    duration: '১ - ৩ কর্মদিবস',
    portal: 'etradelicense.gov.bd',
    summary: 'ইউনিয়ন পরিষদ বা পৌরসভা আওতাধীন ব্যবসার বৈধ ই-ট্রেড লাইসেন্স আবেদন ও রিনিউ ফি জমা।',
    documents: [
      'দোকান ভাড়ার চুক্তিপত্র বা নিজস্ব জায়গার খাজনা দাখিলা',
      'মালিকের জাতীয় পরিচয়পত্র ও পাসপোর্ট সাইজ ছবি'
    ]
  },
  {
    id: 'driving',
    category: 'online',
    title: 'ড্রাইভিং লাইসেন্স ও বিআরটিএ সেবা (BRTA)',
    govtFee: 'লার্নার ফি: ৫১৮৳ (১ ক্যাটাগরি) / ৭৪৮৳ (২ ক্যাটাগরি)',
    serviceFee: '১৫০ - ২৫০ ৳',
    duration: 'লার্নার তাৎক্ষণিক ডাউনলোড',
    portal: 'bsp.brta.gov.bd',
    summary: 'বিআরটিএ সার্ভিস পোর্টালে লার্নার ড্রাইভিং লাইসেন্স আবেদন, মেডিকেল ফি ও পরীক্ষা স্লট বুকিং।',
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
    govtFee: 'বিজ্ঞপ্তি অনুযায়ী নির্দিষ্ট অ্যাপ্লিকেশন ফি',
    serviceFee: '১০০ - ২০০ ৳',
    duration: '১০ - ১৫ মিনিট',
    portal: 'বিভিন্ন সরকারি ও বিশ্ববিদ্যালয়ের পোর্টাল',
    summary: 'বিসিএস, প্রাথমিক শিক্ষক, সরকারি-বেসরকারি চাকরি এবং জাতীয় ও পাবলিক বিশ্ববিদ্যালয়ে ভর্তি আবেদন।',
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
    govtFee: 'সরকারি ফি নেই',
    serviceFee: '৬০ - ১১০ ৳ (প্রতি পিস - ফিতা ও মান অনুযায়ী)',
    duration: '১ - ৩ কর্মদিবস (পরিমাণ সাপেক্ষে)',
    portal: 'fayzarcomputer.com',
    summary: 'স্কুল, college, মাদ্রাসা ও যেকোনো প্রতিষ্ঠানের উন্নত মানের ডিজিটাল পিভিসি আইডি কার্ড, প্রিমিয়াম প্রিন্টেড ফিতা (Lanyard) ও কার্ড হোল্ডার তৈরি।',
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
    govtFee: 'প্রযোজ্য নয়',
    serviceFee: 'প্রতি পেজ ২০ - ৫০ ৳',
    duration: 'দ্রুত ডেলিভারি',
    portal: 'ইন-শপ সার্ভিস',
    summary: 'আবেদনপত্র, দরখাস্ত, সিভি (Curriculum Vitae), স্ট্যাম্প চুক্তিপত্র ও প্রশ্ন নির্ভুলভাবে কম্পোজ।',
    documents: [
      'হাতে লেখা খসড়া বা মূল কাগজের নমুনা',
      'সিভির ক্ষেত্রে শিক্ষাগত তথ্য ও ব্যক্তিগত বিবরণ'
    ]
  },
  {
    id: 'photostat',
    category: 'computer',
    title: 'ডিজিটাল ফটোস্ট্যাট ও কালার প্রিন্ট',
    govtFee: 'প্রযোজ্য নয়',
    serviceFee: 'প্রতি পৃষ্ঠা স্বল্পমূল্যে',
    duration: 'তাৎক্ষণিক',
    portal: 'ইন-শপ সার্ভিস',
    summary: 'হাই-স্পিড ডিজিটাল ফটোকপি, অফসেট পেপারে নিখুঁত সাদাকালো ও লেজার কালার প্রিন্টিং।',
    documents: [
      'যে ডকুমেন্ট বা পিডিএফ প্রিন্ট করতে চান'
    ]
  },
  {
    id: 'photo-studio',
    category: 'computer',
    title: 'স্টুডিও কোয়ালিটি ছবি প্রিন্ট ও লেমিনেটিং',
    govtFee: 'প্রযোজ্য নয়',
    serviceFee: 'সাইজ ও কপি অনুযায়ী নির্ধারিত',
    duration: '৫ মিনিটে ডেলিভারি',
    portal: 'ইন-শপ সার্ভিস',
    summary: 'পাসপোর্ট সাইজ, স্ট্যাম্প সাইজ ও থ্রি-আর/ফোর-আর ছবি প্রিন্ট এবং ডকুমেন্টস হার্ড লেমিনেটিং।',
    documents: [
      'ছবি বা সরাসরি দোকানে ছবি তোলার সুবিধা'
    ]
  }
];

// স্কুল ও কলেজ সংক্রান্ত নোটিশ ডিরেক্টরি
const COLLEGE_NOTICES_DIRECTORY = [
  {
    id: 'col-phulbari-formfillup',
    category: 'college',
    type: 'কলেজ নোটিশ',
    title: 'ফুলবাড়ী সরকারি কলেজ ডিগ্রি ৩য় বর্ষ ও অনার্স ফরম ফিলাপ বিজ্ঞপ্তি',
    org: 'ফুলবাড়ী সরকারি কলেজ, দিনাজপুর',
    vacancies: 'ডিগ্রি ও অনার্স শিক্ষার্থী',
    deadline: 'চলতি মাসের শেষ তারিখ',
    qualification: '২০২৪-২৫ শিক্ষাবর্ষের নিয়মিত/অনিয়মিত শিক্ষার্থী',
    fee: 'কলেজ নির্ধারিত ফি',
    pdfUrl: 'https://www.phulbarigovtcollege.edu.bd/events',
    sourceUrl: 'https://www.phulbarigovtcollege.edu.bd/events',
    details: 'ফুলবাড়ী সরকারি কলেজের অফিসিয়াল নোটিশ বোর্ড ও জাতীয় বিশ্ববিদ্যালয়ের পোর্টাল অনুযায়ী অনলাইনে আবেদন।'
  },
  {
    id: 'col-hsc-admission',
    category: 'college',
    type: 'ভর্তি বিজ্ঞপ্তি',
    title: 'একাদশ শ্রেণিতে (HSC) অনলাইন ভর্তি আবেদন ও কলেজ চয়েস',
    org: 'ঢাকা শিক্ষা বোর্ড / ফুলবাড়ী সরকারি কলেজ',
    vacancies: 'বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা',
    deadline: 'বোর্ড নির্ধারিত সময়সূচি অনুযায়ী',
    qualification: 'এসএসসি পাস (২০২৪/২০২৫/২০২৬)',
    fee: 'বোর্ড আবেদন ফি: ১৫০ ৳',
    pdfUrl: 'http://xiclassadmission.gov.bd/',
    sourceUrl: 'http://xiclassadmission.gov.bd/',
    details: 'xiclassadmission.gov.bd পোর্টালে সর্বনিম্ন ৫টি ও সর্বোচ্চ ১০টি কলেজ চয়েস দিয়ে অনলাইনে ফরম পূরণ।'
  },
  {
    id: 'col-nu-masters',
    category: 'college',
    type: 'ভর্তি ও পরীক্ষা',
    title: 'জাতীয় বিশ্ববিদ্যালয় মাস্টার্স ও ডিগ্রি প্রিলিমিনারি ভর্তি',
    org: 'জাতীয় বিশ্ববিদ্যালয় (National University)',
    vacancies: 'সকল বিভাগ',
    deadline: 'বিজ্ঞপ্তি অনুযায়ী',
    qualification: 'ডিগ্রি পাস অথবা ৩ বছর মেয়াদি স্নাতক',
    fee: 'প্রাথমিক আবেদন ফি: ৩০০ ৳',
    pdfUrl: 'http://app1.nu.edu.bd/',
    sourceUrl: 'http://app1.nu.edu.bd/',
    details: 'জাতীয় বিশ্ববিদ্যালয়ের ভর্তি বিষয়ক ওয়েবসাইটে প্রাথমিক আবেদন ফরম পূরণ ও কলেজে ফি জমা।'
  },
  {
    id: 'col-open-university',
    category: 'college',
    type: 'উন্মুক্ত ভর্তি',
    title: 'বাংলাদেশ উন্মুক্ত বিশ্ববিদ্যালয় (BOU) এইচএসসি ও ডিগ্রি প্রোগ্রাম ভর্তি',
    org: 'বাংলাদেশ উন্মুক্ত বিশ্ববিদ্যালয় (বাউবি)',
    vacancies: 'সকল স্টাডি সেন্টার',
    deadline: 'চলমান কার্যক্রম',
    qualification: 'এসএসসি / সমমান পাস',
    fee: 'কোর্স ফি সাপেক্ষে',
    pdfUrl: 'https://osapsnew.bou.ac.bd/',
    sourceUrl: 'https://osapsnew.bou.ac.bd/',
    details: 'বাউবি অনলাইন ওসাপস (OSAPS) পোর্টালে নতুন ভর্তির আবেদন ও বিষয়ভিত্তিক রেজিস্ট্রেশন।'
  }
];

// চাকরির নোটিশ ডিরেক্টরি (টেলিটক ২০+ সরকারি চাকরি)
const JOBS_DIRECTORY = [
  {
    id: 'job-dot-textiles',
    sector: 'admin',
    sectorName: 'প্রশাসন ও শিল্প',
    type: 'সরকারি চাকরি',
    title: 'বস্ত্র অধিদপ্তর (DOT) বিভিন্ন পদে নিয়োগ বিজ্ঞপ্তি',
    org: 'বস্ত্র ও পাট মন্ত্রণালয় / বস্ত্র অধিদপ্তর (DOT)',
    vacancies: '৪২ জন (০৫টি ক্যাটাগরি)',
    qualification: 'স্নাতক / ডিপ্লোমা / এইচএসসি / এসএসসি পাস',
    deadline: '০৬ সেপ্টেম্বর ২০২৬',
    fee: 'সরকারি ফি: ১১২ - ২২৩ ৳',
    sourceUrl: 'http://dotr.teletalk.com.bd/',
    pdfUrl: 'http://dotr.teletalk.com.bd/',
    details: 'dotr.teletalk.com.bd পোর্টালে অনলাইন আবেদন চলছে। বয়স ১৮-৩০ বছর।'
  },
  {
    id: 'job-bpdb-power',
    sector: 'power',
    sectorName: 'বিদ্যুৎ ও জ্বালানি',
    type: 'বিদ্যুৎ চাকরি',
    title: 'বাংলাদেশ বিদ্যুৎ উন্নয়ন বোর্ড (BPDB) নিয়োগ বিজ্ঞপ্তি',
    org: 'বাংলাদেশ বিদ্যুৎ উন্নয়ন বোর্ড (BPDB)',
    vacancies: '৩৫০+ জন',
    qualification: 'বিএসসি ইঞ্জিনিয়ারিং / ডিপ্লোমা / স্নাতক / এইচএসসি',
    deadline: 'চলতি মাসের শেষ তারিখ',
    fee: 'সরকারি ফি: ৩০০ - ৫০০ ৳',
    sourceUrl: 'https://bpdb.teletalk.com.bd/',
    pdfUrl: 'https://bpdb.teletalk.com.bd/',
    details: 'bpdb.teletalk.com.bd পোর্টালে বিভিন্ন পদে অনলাইন আবেদন চলছে।'
  },
  {
    id: 'job-railway-br',
    sector: 'admin',
    sectorName: 'যোগাযোগ ও রেলওয়ে',
    type: 'সরকারি চাকরি',
    title: 'বাংলাদেশ রেলওয়ে সহকারী স্টেশন মাস্টার ও পয়েন্টসম্যান নিয়োগ',
    org: 'বাংলাদেশ রেলওয়ে (BR)',
    vacancies: '১০৮৫ জন',
    qualification: 'যেকোনো বিষয়ে স্নাতক / এইচএসসি / এসএসসি পাস',
    deadline: 'চলতি মাসের শেষ তারিখ',
    fee: 'সরকারি ফি: ১১২ - ২২৩ ৳',
    sourceUrl: 'https://br.teletalk.com.bd/',
    pdfUrl: 'https://br.teletalk.com.bd/',
    details: 'টেলিটক br.teletalk.com.bd পোর্টালে অনলাইন আবেদন চলছে।'
  },
  {
    id: 'job-dpe-teacher',
    sector: 'edu',
    sectorName: 'শিক্ষা ও শিক্ষক',
    type: 'সরকারি চাকরি',
    title: 'সরকারি প্রাথমিক সহকারী শিক্ষক নিয়োগ ও আবেদন',
    org: 'প্রাথমিক শিক্ষা অধিদপ্তর (DPE)',
    vacancies: '৩,৫০০+ জন',
    qualification: 'স্নাতক/সমমান (ন্যূনতম ২য় বিভাগ/সিজিপিএ ২.২৫)',
    deadline: 'চলমান আবেদন',
    fee: 'সরকারি ফি: ২২০ ৳',
    sourceUrl: 'https://dpe.teletalk.com.bd/',
    pdfUrl: 'https://dpe.teletalk.com.bd/',
    details: 'টেলিটকের মাধ্যমে dpe.teletalk.com.bd পোর্টালে রংপুর ও রাজশাহী সহ সকল বিভাগে আবেদন।'
  },
  {
    id: 'job-police-trc',
    sector: 'force',
    sectorName: 'পুলিশ ও প্রতিরক্ষা',
    type: 'প্রতিরক্ষা চাকরি',
    title: 'বাংলাদেশ পুলিশ ট্রেইনি রিক্রুট কনস্টেবল (TRC) নিয়োগ',
    org: 'বাংলাদেশ পুলিশ হেডকোয়ার্টার্স',
    vacancies: '৪,০০০+ জন',
    qualification: 'এসএসসি / সমমান (ন্যূনতম জিপিএ ২.৫)',
    deadline: 'বিজ্ঞপ্তি অনুযায়ী',
    fee: 'সরকারি ফি: ১২০ ৳',
    sourceUrl: 'https://police.teletalk.com.bd/',
    pdfUrl: 'https://police.teletalk.com.bd/',
    details: 'police.teletalk.com.bd পোর্টালে অনলাইন আবেদন ও শারীরিক মাপ সংক্রান্ত নির্দেশনা।'
  },
  {
    id: 'job-bpsc-noncadre',
    sector: 'admin',
    sectorName: 'সাধারণ প্রশাসন',
    type: 'সরকারি চাকরি',
    title: '১০ম ও ৯ম গ্রেড বিভিন্ন মন্ত্রণালয় নন-ক্যাডার নিয়োগ',
    org: 'বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)',
    vacancies: '৪৫০+ জন',
    qualification: 'স্নাতকোত্তর / স্নাতক (সম্মান)',
    deadline: 'বিজ্ঞপ্তি অনুযায়ী',
    fee: 'সরকারি ফি: ৫০০ ৳',
    sourceUrl: 'https://bpsc.teletalk.com.bd/',
    pdfUrl: 'https://bpsc.teletalk.com.bd/',
    details: 'bpsc.teletalk.com.bd পোর্টালে আবেদন দাখিল ও ছবি/স্বাক্ষর আপলোড।'
  },
  {
    id: 'job-dgfp-family',
    sector: 'admin',
    sectorName: 'স্বাস্থ্য ও পরিবার',
    type: 'সরকারি চাকরি',
    title: 'পরিবার পরিকল্পনা অধিদপ্তর পরিবার কল্যাণ সহকারী ও পরিদর্শক নিয়োগ',
    org: 'পরিবার পরিকল্পনা অধিদপ্তর (DGFP)',
    vacancies: '১,২০০+ জন',
    qualification: 'এসএসসি ও এইচএসসি পাস',
    deadline: 'চলমান বিজ্ঞপ্তি',
    fee: 'সরকারি ফি: ১১২ ৳',
    sourceUrl: 'https://dgfp.teletalk.com.bd/',
    pdfUrl: 'https://dgfp.teletalk.com.bd/',
    details: 'দিনাজপুর জেলা সহ সকল জেলায় dgfp.teletalk.com.bd এর মাধ্যমে আবেদন।'
  },
  {
    id: 'job-biman-airlines',
    sector: 'admin',
    sectorName: 'বিমান ও এয়ারলাইন্স',
    type: 'বিমান চাকরি',
    title: 'বিমান বাংলাদেশ এয়ারলাইন্স বিভিন্ন পদে নিয়োগ বিজ্ঞপ্তি',
    org: 'বিমান বাংলাদেশ এয়ারলাইন্স লিমিটেড',
    vacancies: '২৫০+ জন',
    qualification: 'স্নাতক / ডিপ্লোমা / এইচএসসি',
    deadline: 'বিজ্ঞপ্তি অনুযায়ী',
    fee: 'ফি: ৩৩৬ - ৫৬০ ৳',
    sourceUrl: 'https://biman.teletalk.com.bd/',
    pdfUrl: 'https://biman.teletalk.com.bd/',
    details: 'biman.teletalk.com.bd পোর্টালে গ্রাউন্ড সার্ভিস ও ফ্লাইট অপারেশনে আবেদন।'
  },
  {
    id: 'job-lged-eng',
    sector: 'eng',
    sectorName: 'প্রকৌশল',
    type: 'প্রকৌশল চাকরি',
    title: 'স্থানীয় সরকার প্রকৌশল অধিদপ্তর (LGED) নিয়োগ বিজ্ঞপ্তি',
    org: 'স্থানীয় সরকার প্রকৌশল অধিদপ্তর (LGED)',
    vacancies: '৫০০+ জন',
    qualification: 'ডিপ্লোমা ইঞ্জিনিয়ারিং / স্নাতক / এইচএসসি',
    deadline: 'বিজ্ঞপ্তি অনুযায়ী',
    fee: 'সরকারি ফি: ১১২ - ২২৩ ৳',
    sourceUrl: 'https://lged.teletalk.com.bd/',
    pdfUrl: 'https://lged.teletalk.com.bd/',
    details: 'lged.teletalk.com.bd পোর্টালে অনলাইন আবেদন চলছে।'
  },
  {
    id: 'job-dae-agri',
    sector: 'eng',
    sectorName: 'কৃষি ও সম্প্রসারণ',
    type: 'কৃষি ও উন্নয়ন',
    title: 'কৃষি সম্প্রসারণ অধিদপ্তর (DAE) উপ-সহকারী কৃষি কর্মকর্তা নিয়োগ',
    org: 'কৃষি সম্প্রসারণ অধিদপ্তর (DAE)',
    vacancies: '১,৩৫০+ জন',
    qualification: 'কৃষি ডিপ্লোমা / বিজ্ঞান বিভাগে এইচএসসি',
    deadline: 'বিজ্ঞপ্তি অনুযায়ী',
    fee: 'সরকারি ফি: ১১২ ৳',
    sourceUrl: 'https://dae.teletalk.com.bd/',
    pdfUrl: 'https://dae.teletalk.com.bd/',
    details: 'dae.teletalk.com.bd পোর্টালে অনলাইন আবেদন দাখিল।'
  },
  {
    id: 'job-ansar-vdp',
    sector: 'force',
    sectorName: 'প্রতিরক্ষা ও পুলিশ',
    type: 'প্রতিরক্ষা চাকরি',
    title: 'বাংলাদেশ আনসার ও গ্রাম প্রতিরক্ষা বাহিনী সাধারণ আনসার নিয়োগ',
    org: 'বাংলাদেশ আনসার ও ভিডিপি সদর দপ্তর',
    vacancies: '১,৫০০+ জন',
    qualification: 'ন্যূনতম জেএসসি / এসএসসি পাস',
    deadline: 'বিজ্ঞপ্তি অনুযায়ী',
    fee: 'সরকারি ফি: ১১২ ৳',
    sourceUrl: 'https://ansarvdp.teletalk.com.bd/',
    pdfUrl: 'https://ansarvdp.teletalk.com.bd/',
    details: 'ansarvdp.teletalk.com.bd পোর্টালে আনসার সদস্য বাছাই ও আবেদন।'
  },
  {
    id: 'job-dgfood-admin',
    sector: 'admin',
    sectorName: 'খাদ্য ও সরবরাহ',
    type: 'সরকারি চাকরি',
    title: 'খাদ্য অধিদপ্তর (DG Food) বিভিন্ন পদে নিয়োগ বিজ্ঞপ্তি',
    org: 'খাদ্য অধিদপ্তর, খাদ্য মন্ত্রণালয়',
    vacancies: '৮৫০+ জন',
    qualification: 'স্নাতক / এইচএসসি / এসএসসি',
    deadline: 'বিজ্ঞপ্তি অনুযায়ী',
    fee: 'সরকারি ফি: ১১২ - ২২৩ ৳',
    sourceUrl: 'https://dgfao.teletalk.com.bd/',
    pdfUrl: 'https://dgfao.teletalk.com.bd/',
    details: 'dgfao.teletalk.com.bd পোর্টালে বিভিন্ন গ্রেডে অনলাইন আবেদন।'
  },
  {
    id: 'job-pgcb-grid',
    sector: 'power',
    sectorName: 'বিদ্যুৎ ও জ্বালানি',
    type: 'বিদ্যুৎ চাকরি',
    title: 'পাওয়ার গ্রিড কোম্পানি অব বাংলাদেশ (PGCB) নিয়োগ বিজ্ঞপ্তি',
    org: 'পাওয়ার গ্রিড কোম্পানি অব বাংলাদেশ (PGCB)',
    vacancies: '১৮০+ জন',
    qualification: 'বিএসসি / ডিপ্লোমা ইঞ্জিনিয়ারিং / স্নাতক',
    deadline: 'বিজ্ঞপ্তি অনুযায়ী',
    fee: 'ফি: ৫০০ - ১০০০ ৳',
    sourceUrl: 'https://pgcb.teletalk.com.bd/',
    pdfUrl: 'https://pgcb.teletalk.com.bd/',
    details: 'pgcb.teletalk.com.bd পোর্টালে পাওয়ার গ্রিড ইঞ্জিনিয়ার ও টেকনিশিয়ান আবেদন।'
  },
  {
    id: 'job-breb-reb',
    sector: 'power',
    sectorName: 'বিদ্যুৎ ও জ্বালানি',
    type: 'বিদ্যুৎ চাকরি',
    title: 'বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড (BREB) সহকারী প্রকৌশলী ও কর্মকর্তা নিয়োগ',
    org: 'বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড (BREB)',
    vacancies: '৬০০+ জন',
    qualification: 'ইঞ্জিনিয়ারিং / স্নাতক / ডিপ্লোমা',
    deadline: 'বিজ্ঞপ্তি অনুযায়ী',
    fee: 'সরকারি ফি: ২২৩ - ৩৩৬ ৳',
    sourceUrl: 'https://breb.teletalk.com.bd/',
    pdfUrl: 'https://breb.teletalk.com.bd/',
    details: 'breb.teletalk.com.bd পোর্টালে পল্লী বিদ্যুৎ সমিতির জন্য আবেদন।'
  },
  {
    id: 'job-badc-agri',
    sector: 'eng',
    sectorName: 'কৃষি ও উন্নয়ন',
    type: 'কৃষি চাকরি',
    title: 'বাংলাদেশ কৃষি উন্নয়ন কর্পোরেশন (BADC) নিয়োগ বিজ্ঞপ্তি',
    org: 'বাংলাদেশ কৃষি উন্নয়ন কর্পোরেশন (BADC)',
    vacancies: '৪২০+ জন',
    qualification: 'স্নাতক / ডিপ্লোমা / এইচএসসি',
    deadline: 'বিজ্ঞপ্তি অনুযায়ী',
    fee: 'সরকারি ফি: ১১২ - ২২৩ ৳',
    sourceUrl: 'https://badc.teletalk.com.bd/',
    pdfUrl: 'https://badc.teletalk.com.bd/',
    details: 'badc.teletalk.com.bd পোর্টালে কৃষি কর্মকর্তা ও অপারেটর পদে আবেদন।'
  },
  {
    id: 'job-dlrs-land',
    sector: 'admin',
    sectorName: 'ভূমি ও প্রশাসন',
    type: 'সরকারি চাকরি',
    title: 'ভূমি রেকর্ড ও জরিপ অধিদপ্তর (DLRS) সার্ভেয়ার ও বিভিন্ন পদে নিয়োগ',
    org: 'ভূমি রেকর্ড ও জরিপ অধিদপ্তর (DLRS)',
    vacancies: '৩,০০০+ জন',
    qualification: 'সার্ভে ডিপ্লোমা / এইচএসসি / এসএসসি',
    deadline: 'বিজ্ঞপ্তি অনুযায়ী',
    fee: 'সরকারি ফি: ১১২ - ২২৩ ৳',
    sourceUrl: 'https://dlrs.teletalk.com.bd/',
    pdfUrl: 'https://dlrs.teletalk.com.bd/',
    details: 'dlrs.teletalk.com.bd পোর্টালে ভূমি জরিপ ও সার্ভেয়ার পদে আবেদন।'
  }
];

// =========================================================================
// ডাটাবেজ হেল্পারস (Data Helpers)
// =========================================================================
function getServicesData() {
  try {
    const saved = localStorage.getItem('fayzar_services_data');
    if (saved) return JSON.parse(saved);
  } catch(e) {}
  return DEFAULT_SERVICES_LIST;
}

function saveServicesData(data) {
  try {
    localStorage.setItem('fayzar_services_data', JSON.stringify(data));
  } catch(e) {}
}

function getLiveNotices() {
  try {
    const saved = localStorage.getItem('fayzar_notices_data');
    if (saved) return JSON.parse(saved);
  } catch(e) {}
  return [];
}

function saveLiveNotices(data) {
  try {
    localStorage.setItem('fayzar_notices_data', JSON.stringify(data));
  } catch(e) {}
}

// =========================================================================
// DOM Ready & Authentication
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initLoginForm();
  
  // If notices data is empty in localStorage, seed with top active notices
  if (!localStorage.getItem('fayzar_notices_data')) {
    const initialLive = [
      JOBS_DIRECTORY[0], // DOT
      JOBS_DIRECTORY[1], // BPDB
      COLLEGE_NOTICES_DIRECTORY[0], // Phulbari College
      JOBS_DIRECTORY[2], // Railway
      COLLEGE_NOTICES_DIRECTORY[1] // XI Admission
    ];
    saveLiveNotices(initialLive);
  }
});

function initAuth() {
  const isAuth = sessionStorage.getItem('fayzar_admin_auth') === 'true';
  const loginScreen = document.getElementById('admin-login-screen');
  const dashboard = document.getElementById('admin-dashboard');
  
  if (isAuth) {
    loginScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
    renderAllPanels();
  } else {
    loginScreen.classList.remove('hidden');
    dashboard.classList.add('hidden');
  }
}

function initLoginForm() {
  const form = document.getElementById('admin-login-form');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const pin = document.getElementById('admin-pin-input').value.trim();
    
    if (pin === ADMIN_PIN || pin === '1919') {
      sessionStorage.setItem('fayzar_admin_auth', 'true');
      initAuth();
      showToast('অ্যাডমিন প্যানেলে স্বাগতম!', 'success');
    } else {
      showToast('ভুল পিন কোড! অনুগ্রহ করে সঠিক পিন দিন।', 'error');
    }
  });
}

function togglePinVisibility() {
  const input = document.getElementById('admin-pin-input');
  const icon = document.getElementById('pin-eye-icon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fas fa-eye';
  }
}

function adminLogout() {
  sessionStorage.removeItem('fayzar_admin_auth');
  initAuth();
  showToast('লগআউট সম্পন্ন হয়েছে।', 'info');
}

// =========================================================================
// ৪টি নির্দিষ্ট ক্যাটাগরি সুইচিং ইঞ্জিন (Category Switcher)
// =========================================================================
let activeCategory = 'services';

function switchCategory(cat) {
  activeCategory = cat;
  
  const categories = ['services', 'college', 'jobs', 'live'];
  
  categories.forEach(c => {
    const btn = document.getElementById('tab-btn-' + c);
    const panel = document.getElementById('panel-' + c);
    
    if (btn && panel) {
      if (c === cat) {
        btn.className = 'p-3 sm:p-4 rounded-2xl bg-brandGreen text-white transition flex flex-col items-start gap-1 shadow-md border border-emerald-500/40 text-left group';
        panel.classList.remove('hidden');
      } else {
        btn.className = 'p-3 sm:p-4 rounded-2xl bg-slate-900 text-slate-300 hover:bg-slate-850 transition flex flex-col items-start gap-1 border border-slate-800 text-left group';
        panel.classList.add('hidden');
      }
    }
  });

  if (cat === 'services') renderServicesCategory();
  if (cat === 'college') renderCollegeCategory();
  if (cat === 'jobs') renderJobsCategory();
  if (cat === 'live') renderLiveCategory();
}

function renderAllPanels() {
  renderServicesCategory();
  renderCollegeCategory();
  renderJobsCategory();
  renderLiveCategory();
  updateHeaderBadges();
}

function updateHeaderBadges() {
  const services = getServicesData();
  const live = getLiveNotices();
  
  if (document.getElementById('badge-services-count')) document.getElementById('badge-services-count').innerText = `${services.length} টি`;
  if (document.getElementById('badge-college-count')) document.getElementById('badge-college-count').innerText = `${COLLEGE_NOTICES_DIRECTORY.length} টি`;
  if (document.getElementById('badge-jobs-count')) document.getElementById('badge-jobs-count').innerText = `${JOBS_DIRECTORY.length}+ টি`;
  if (document.getElementById('badge-live-count')) document.getElementById('badge-live-count').innerText = `${live.length} টি`;
  if (document.getElementById('live-notices-subcount')) document.getElementById('live-notices-subcount').innerText = `${live.length} টি`;
}

// =========================================================================
// ১. সেবাসমূহ ম্যানেজমেন্ট ইঞ্জিন (Services Management)
// =========================================================================
let currentServiceFilter = 'all';

function renderServicesCategory(filter = currentServiceFilter, query = '') {
  const container = document.getElementById('services-cards-container');
  if (!container) return;

  const services = getServicesData();
  const q = query.toLowerCase().trim();

  const filtered = services.filter(s => {
    const matchCat = filter === 'all' || s.category === filter;
    const matchSearch = !q || 
      s.title.toLowerCase().includes(q) || 
      (s.summary && s.summary.toLowerCase().includes(q)) ||
      (Array.isArray(s.documents) && s.documents.some(d => d.toLowerCase().includes(q)));
    return matchCat && matchSearch;
  });

  updateHeaderBadges();

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center text-slate-400 text-xs">
        <i class="fas fa-search text-slate-500 text-3xl mb-2"></i>
        <div>কোনো সেবা পাওয়া যায়নি। নতুন সেবা যুক্ত করতে <strong>"নতুন সেবা যুক্ত করুন"</strong> বাটনে ক্লিক করুন।</div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(s => `
    <div class="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition shadow-md group">
      <div class="space-y-2 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            ${s.category === 'land' ? '🏛️ ভূমিসেবা' : (s.category === 'nid' ? '🪪 NID সেবা' : (s.category === 'computer' ? '💻 কম্পিউটার ও স্টুডিও' : '🌐 অনলাইন সেবা'))}
          </span>
          ${s.portal ? `<span class="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">${s.portal}</span>` : ''}
          ${s.duration ? `<span class="text-[10px] text-slate-400">সময়: <strong class="text-slate-200">${s.duration}</strong></span>` : ''}
        </div>

        <h4 class="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">${s.title}</h4>
        ${s.summary ? `<p class="text-xs text-slate-400 leading-relaxed">${s.summary}</p>` : ''}

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
          <div class="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <span class="text-slate-400 text-[11px] block">সরকারি ফি:</span>
            <span class="font-extrabold text-amber-400">${s.govtFee}</span>
          </div>
          <div class="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <span class="text-slate-400 text-[11px] block">দোকানের সার্ভিস চার্জ:</span>
            <span class="font-extrabold text-emerald-400">${s.serviceFee}</span>
          </div>
        </div>

        <div class="text-xs text-slate-300 pt-1">
          <strong class="text-slate-400">প্রয়োজনীয় কাগজপত্র (${Array.isArray(s.documents) ? s.documents.length : 0} টি):</strong>
          <ul class="list-disc list-inside text-slate-300 text-[11px] mt-1 space-y-0.5 pl-1">
            ${Array.isArray(s.documents) ? s.documents.slice(0, 3).map(d => `<li>${d}</li>`).join('') : ''}
            ${Array.isArray(s.documents) && s.documents.length > 3 ? `<li class="text-slate-500 font-semibold">+ আরও ${s.documents.length - 3}টি নথি...</li>` : ''}
          </ul>
        </div>
      </div>

      <div class="flex md:flex-col items-center gap-2 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
        <button onclick="openServiceEditModal('${s.id}')" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center justify-center gap-1.5">
          <i class="fas fa-pen-to-square"></i> ফি ও তথ্য এডিট
        </button>
        <button onclick="deleteAdminService('${s.id}')" class="w-full bg-rose-950/50 hover:bg-rose-900 text-rose-300 font-bold text-xs px-4 py-2 rounded-xl transition flex items-center justify-center gap-1.5 border border-rose-800/80">
          <i class="fas fa-trash-can"></i> সেবা মুছুন
        </button>
      </div>
    </div>
  `).join('');
}

function setServicesFilter(filter) {
  currentServiceFilter = filter;
  const filters = ['all', 'land', 'online', 'nid', 'computer'];
  filters.forEach(f => {
    const btn = document.getElementById('srv-btn-' + f);
    if (btn) {
      if (f === filter) {
        btn.className = 'px-3.5 py-2 rounded-xl bg-brandGreen text-white transition';
      } else {
        btn.className = 'px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition';
      }
    }
  });

  const query = document.getElementById('search-services-input')?.value || '';
  renderServicesCategory(filter, query);
}

function filterServicesList() {
  const query = document.getElementById('search-services-input')?.value || '';
  renderServicesCategory(currentServiceFilter, query);
}

function openNewServiceModal() {
  document.getElementById('service-modal-title').innerText = 'নতুন সেবা ও ফি রেট যুক্ত করুন';
  document.getElementById('srv-edit-id').value = '';
  document.getElementById('srv-edit-title').value = '';
  document.getElementById('srv-edit-category').value = 'online';
  document.getElementById('srv-edit-govtfee').value = '';
  document.getElementById('srv-edit-servicefee').value = '';
  document.getElementById('srv-edit-duration').value = '';
  document.getElementById('srv-edit-portal').value = '';
  document.getElementById('srv-edit-summary').value = '';
  document.getElementById('srv-edit-docs').value = '';

  document.getElementById('service-edit-modal').classList.remove('hidden');
}

function openServiceEditModal(serviceId) {
  const services = getServicesData();
  const s = services.find(item => item.id === serviceId);
  if (!s) return;

  document.getElementById('service-modal-title').innerText = 'সেবা তথ্য, কাগজপত্র ও ফি রেট পরিবর্তন';
  document.getElementById('srv-edit-id').value = s.id;
  document.getElementById('srv-edit-title').value = s.title || '';
  document.getElementById('srv-edit-category').value = s.category || 'online';
  document.getElementById('srv-edit-govtfee').value = s.govtFee || '';
  document.getElementById('srv-edit-servicefee').value = s.serviceFee || '';
  document.getElementById('srv-edit-duration').value = s.duration || '';
  document.getElementById('srv-edit-portal').value = s.portal || '';
  document.getElementById('srv-edit-summary').value = s.summary || '';
  document.getElementById('srv-edit-docs').value = Array.isArray(s.documents) ? s.documents.join('\n') : '';

  document.getElementById('service-edit-modal').classList.remove('hidden');
}

function closeServiceModal() {
  document.getElementById('service-edit-modal').classList.add('hidden');
}

function saveServiceEdit(e) {
  e.preventDefault();
  const id = document.getElementById('srv-edit-id').value.trim();
  const services = getServicesData();
  
  const title = document.getElementById('srv-edit-title').value.trim();
  const category = document.getElementById('srv-edit-category').value;
  const govtFee = document.getElementById('srv-edit-govtfee').value.trim();
  const serviceFee = document.getElementById('srv-edit-servicefee').value.trim();
  const duration = document.getElementById('srv-edit-duration').value.trim() || 'তাৎক্ষণিক';
  const portal = document.getElementById('srv-edit-portal').value.trim();
  const summary = document.getElementById('srv-edit-summary').value.trim();
  const rawDocs = document.getElementById('srv-edit-docs').value.trim();
  const docs = rawDocs.split('\n').map(d => d.trim()).filter(d => d.length > 0);

  if (id) {
    const s = services.find(item => item.id === id);
    if (s) {
      s.title = title;
      s.category = category;
      s.govtFee = govtFee;
      s.serviceFee = serviceFee;
      s.duration = duration;
      s.portal = portal;
      s.summary = summary;
      s.documents = docs;
    }
  } else {
    const newService = {
      id: 'srv-custom-' + Date.now(),
      category: category,
      title: title,
      badge: 'ডিজিটাল সেবা',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: category === 'land' ? 'fa-landmark' : (category === 'nid' ? 'fa-id-card' : 'fa-laptop-code'),
      summary: summary || title,
      portal: portal || 'fayzarcomputer.com',
      govtFee: govtFee,
      serviceFee: serviceFee,
      duration: duration,
      documents: docs
    };
    services.unshift(newService);
  }

  saveServicesData(services);
  closeServiceModal();
  renderServicesCategory();
  showToast(`🎉 "${title}" সফলভাবে সংরক্ষণ করা হয়েছে!`, 'success');
}

function deleteAdminService(serviceId) {
  const services = getServicesData();
  const target = services.find(s => s.id === serviceId);
  if (!target) return;

  if (confirm(`আপনি কি "${target.title}" সেবাটি মুছে ফেলতে চান?`)) {
    const updated = services.filter(s => s.id !== serviceId);
    saveServicesData(updated);
    renderServicesCategory();
    showToast(`"${target.title}" সেবাটি মুছে ফেলা হয়েছে।`, 'info');
  }
}

function resetServicesToDefault() {
  if (confirm('আপনি কি সকল সেবার ফি ও কাগজপত্র ডিফল্ট রেটে রিসেট করতে চান?')) {
    localStorage.removeItem('fayzar_services_data');
    renderServicesCategory();
    showToast('সকল সেবার তথ্য ও ফি ডিফল্টে রিসেট করা হয়েছে।', 'info');
  }
}

// =========================================================================
// ২. স্কুল/কলেজ সংক্রান্ত নোটিশ ইঞ্জিন (College Notices Management)
// =========================================================================
function renderCollegeCategory() {
  const container = document.getElementById('college-notices-container');
  if (!container) return;

  const live = getLiveNotices();

  container.innerHTML = COLLEGE_NOTICES_DIRECTORY.map(item => {
    const isLive = live.some(n => n.title === item.title);

    return `
      <div class="bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition shadow-md group">
        <div class="space-y-1.5 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              🎓 ${item.type}
            </span>
            <span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
              ${item.vacancies}
            </span>
            <span class="text-[10px] text-slate-400">শেষ তারিখ: <strong class="text-white">${item.deadline}</strong></span>
            ${item.pdfUrl ? `<a href="${item.pdfUrl}" target="_blank" class="text-rose-400 font-bold hover:underline flex items-center gap-1 text-[11px]"><i class="fas fa-file-pdf"></i> নোটিশ লিংক</a>` : ''}
          </div>

          <h4 class="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors">${item.title}</h4>
          <div class="text-xs font-bold text-sky-400"><i class="fas fa-building-columns text-amber-400 mr-1"></i> ${item.org}</div>
          
          <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
            <div><strong>যোগ্যতা/বিভাগ:</strong> ${item.qualification} • <span class="text-emerald-400 font-bold">${item.fee}</span></div>
          </div>
        </div>

        <div class="flex md:flex-col items-center gap-2 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
          ${isLive ? `
            <span class="w-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs px-4 py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5">
              <i class="fas fa-circle-check text-emerald-400"></i> লাইভ সাইটে সক্রিয়
            </span>
          ` : `
            <button onclick="publishDirectNotice('${item.id}', 'college')" class="w-full bg-brandGreen hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center justify-center gap-1.5">
              <i class="fas fa-plus-circle"></i> লাইভ সাইটে যোগ করুন
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

// =========================================================================
// ৩. চাকুরির নোটিশ ইঞ্জিন (Job Circulars Management)
// =========================================================================
let currentJobsSector = 'all';

function renderJobsCategory(sector = currentJobsSector, query = '') {
  const container = document.getElementById('jobs-directory-container');
  if (!container) return;

  const live = getLiveNotices();
  const q = query.toLowerCase().trim();

  const filtered = JOBS_DIRECTORY.filter(item => {
    const matchSec = sector === 'all' || item.sector === sector;
    const matchSearch = !q || 
      item.title.toLowerCase().includes(q) || 
      item.org.toLowerCase().includes(q) || 
      item.sourceUrl.toLowerCase().includes(q);
    return matchSec && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center text-slate-400 text-xs">
        <i class="fas fa-search text-slate-500 text-3xl mb-2"></i>
        <div>আপনার সার্চের সাথে মিলে এমন কোনো চাকরির নোটিশ পাওয়া যায়নি।</div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const isLive = live.some(n => n.title === item.title);

    return `
      <div class="bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition shadow-md group">
        <div class="space-y-1.5 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              💼 ${item.sectorName}
            </span>
            <a href="${item.sourceUrl}" target="_blank" class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-950 text-sky-400 border border-slate-800 hover:underline flex items-center gap-1 font-mono">
              <i class="fas fa-link text-[9px]"></i> ${item.sourceUrl.replace('https://', '').replace('http://', '').replace('/', '')}
            </a>
            <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
              পদ: ${item.vacancies}
            </span>
            <span class="text-[10px] text-slate-400">শেষ তারিখ: <strong class="text-white">${item.deadline}</strong></span>
          </div>

          <h4 class="text-base font-extrabold text-white group-hover:text-sky-300 transition-colors">${item.title}</h4>
          <div class="text-xs font-bold text-sky-400"><i class="fas fa-building text-amber-400 mr-1"></i> ${item.org}</div>
          
          <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
            <div><strong>যোগ্যতা:</strong> ${item.qualification} • <span class="text-emerald-400 font-bold">${item.fee}</span></div>
            ${item.pdfUrl ? `<a href="${item.pdfUrl}" target="_blank" class="text-rose-400 font-bold hover:underline flex items-center gap-1 text-[11px]"><i class="fas fa-file-pdf"></i> সার্কুলার PDF</a>` : ''}
          </div>
        </div>

        <div class="flex md:flex-col items-center gap-2 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
          ${isLive ? `
            <span class="w-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs px-4 py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5">
              <i class="fas fa-circle-check text-emerald-400"></i> লাইভ সাইটে সক্রিয়
            </span>
          ` : `
            <button onclick="publishDirectNotice('${item.id}', 'jobs')" class="w-full bg-brandGreen hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center justify-center gap-1.5">
              <i class="fas fa-plus-circle"></i> লাইভ সাইটে যোগ করুন
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

function setJobsSectorFilter(sector) {
  currentJobsSector = sector;
  const sectors = ['all', 'admin', 'edu', 'power', 'force', 'eng'];
  sectors.forEach(s => {
    const btn = document.getElementById('job-sec-' + s);
    if (btn) {
      if (s === sector) {
        btn.className = 'px-3 py-2 rounded-xl bg-brandGreen text-white transition';
      } else {
        btn.className = 'px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition';
      }
    }
  });

  const query = document.getElementById('search-jobs-input')?.value || '';
  renderJobsCategory(sector, query);
}

function filterJobsList() {
  const query = document.getElementById('search-jobs-input')?.value || '';
  renderJobsCategory(currentJobsSector, query);
}

function importAllTeletalkJobs() {
  if (confirm('আপনি কি সকল ২০টি সরকারি চাকরি ওয়েবসাইটে সরাসরি লাইভ যুক্ত করতে চান?')) {
    const live = getLiveNotices();
    
    JOBS_DIRECTORY.forEach(item => {
      if (!live.some(n => n.title === item.title)) {
        live.push({
          id: 'job-' + item.id,
          category: 'jobs',
          type: item.type,
          title: item.title,
          org: item.org,
          vacancies: item.vacancies,
          deadline: item.deadline,
          daysLeft: 'আবেদন সচল',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          qualification: item.qualification,
          fee: item.fee,
          details: item.details,
          pdfUrl: item.pdfUrl || item.sourceUrl,
          sourceName: item.org
        });
      }
    });

    saveLiveNotices(live);
    renderAllPanels();
    showToast('🎉 সকল ২০টি সরকারি চাকরি ওয়েবসাইটে লাইভ যুক্ত হয়েছে!', 'success');
  }
}

// =========================================================================
// ৪. শেষে লাইভ নোটিশ ইঞ্জিন (Live Notices Management)
// =========================================================================
let currentLiveFilter = 'all';

function renderLiveCategory(filter = currentLiveFilter) {
  const container = document.getElementById('live-notices-container');
  if (!container) return;

  const live = getLiveNotices();
  updateHeaderBadges();

  const filtered = live.filter(n => {
    if (filter === 'all') return true;
    return n.category === filter;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center text-slate-400 text-xs">
        <i class="fas fa-globe text-slate-500 text-3xl mb-2"></i>
        <div>বর্তমানে ওয়েবসাইটে কোনো নোটিশ লাইভ নেই। ওপরের <strong>স্কুল/কলেজ নোটিশ</strong> বা <strong>চাকুরির নোটিশ</strong> ট্যাব থেকে যুক্ত করুন।</div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((n, idx) => `
    <div class="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-md">
      <div class="space-y-1 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">${n.type || 'নোটিশ'}</span>
          ${n.vacancies ? `<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">${n.vacancies}</span>` : ''}
          <span class="text-[10px] text-slate-400">শেষ তারিখ: <strong class="text-white">${n.deadline}</strong></span>
          ${n.pdfUrl ? `<a href="${n.pdfUrl}" target="_blank" class="text-[10px] font-bold text-rose-400 hover:underline flex items-center gap-0.5"><i class="fas fa-file-pdf"></i> সার্কুলার PDF</a>` : ''}
        </div>
        <h4 class="text-sm font-extrabold text-white">${n.title}</h4>
        <div class="text-xs text-slate-400"><i class="fas fa-building text-amber-400 mr-1"></i> ${n.org} • <span class="text-emerald-400 font-bold">${n.fee || ''}</span></div>
      </div>
      
      <div class="flex items-center gap-2 flex-shrink-0">
        <button onclick="openEditLiveNoticeModal(${idx})" class="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-700">
          <i class="fas fa-pen"></i> এডিট
        </button>
        <button onclick="deleteLiveNotice(${idx})" class="bg-rose-950/50 hover:bg-rose-900 text-rose-300 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center justify-center gap-1.5 border border-rose-800/80">
          <i class="fas fa-trash-can"></i> সাইট থেকে মুছুন
        </button>
      </div>
    </div>
  `).join('');
}

function filterLiveCategory(cat) {
  currentLiveFilter = cat;
  const cats = ['all', 'jobs', 'college'];
  cats.forEach(c => {
    const btn = document.getElementById('live-cat-' + c);
    if (btn) {
      if (c === cat) {
        btn.className = 'px-3 py-1.5 rounded-lg bg-brandGreen text-white transition';
      } else {
        btn.className = 'px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition';
      }
    }
  });

  renderLiveCategory(cat);
}

function publishDirectNotice(itemId, category) {
  let sourceItem = null;
  if (category === 'college') {
    sourceItem = COLLEGE_NOTICES_DIRECTORY.find(i => i.id === itemId);
  } else {
    sourceItem = JOBS_DIRECTORY.find(i => i.id === itemId);
  }
  
  if (!sourceItem) return;

  const live = getLiveNotices();
  if (live.some(n => n.title === sourceItem.title)) {
    showToast('এই নোটিশটি ইতোমধ্যে ওয়েবসাইটে লাইভ রয়েছে!', 'info');
    return;
  }

  live.unshift({
    id: 'live-' + Date.now(),
    category: sourceItem.category || category,
    type: sourceItem.type,
    title: sourceItem.title,
    org: sourceItem.org,
    vacancies: sourceItem.vacancies,
    deadline: sourceItem.deadline,
    daysLeft: 'আবেদন সচল',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    qualification: sourceItem.qualification,
    fee: sourceItem.fee,
    details: sourceItem.details,
    pdfUrl: sourceItem.pdfUrl || sourceItem.sourceUrl,
    sourceName: sourceItem.org
  });

  saveLiveNotices(live);
  renderAllPanels();
  showToast(`🎉 "${sourceItem.title}" সফলভাবে লাইভ যুক্ত হয়েছে!`, 'success');
}

function deleteLiveNotice(index) {
  if (confirm('আপনি কি এই নোটিশটি লাইভ ওয়েবসাইট থেকে মুছে ফেলতে চান?')) {
    const live = getLiveNotices();
    live.splice(index, 1);
    saveLiveNotices(live);
    renderAllPanels();
    showToast('নোটিশটি সাইট থেকে মুছে ফেলা হয়েছে।', 'info');
  }
}

function resetAllNotices() {
  if (confirm('সব নোটিশ মুছে ডিফল্ট তালিকায় ফিরে যাবেন?')) {
    localStorage.removeItem('fayzar_notices_data');
    renderAllPanels();
    showToast('সকল নোটিশ ডিফল্টে রিসেট করা হয়েছে।', 'success');
  }
}

// =========================================================================
// নোটিশ তৈরি ও এডিট মোডাল হ্যান্ডলার (Notice Modal Handlers)
// =========================================================================
let currentNoticeEditLiveIndex = -1;

function openNewNoticeModal(category = 'jobs') {
  currentNoticeEditLiveIndex = -1;
  document.getElementById('notice-modal-title').innerText = category === 'college' ? 'নতুন স্কুল/কলেজ নোটিশ তৈরি' : 'নতুন চাকরির সার্কুলার তৈরি';
  document.getElementById('not-edit-id').value = '';
  document.getElementById('not-edit-title').value = '';
  document.getElementById('not-edit-category').value = category;
  document.getElementById('not-edit-org').value = category === 'college' ? 'ফুলবাড়ী সরকারি কলেজ' : '';
  document.getElementById('not-edit-vacancies').value = '';
  document.getElementById('not-edit-deadline').value = '';
  document.getElementById('not-edit-fee').value = '';
  document.getElementById('not-edit-qual').value = '';
  document.getElementById('not-edit-pdf').value = '';
  document.getElementById('not-edit-source').value = '';
  document.getElementById('not-edit-details').value = '';

  document.getElementById('notice-edit-modal').classList.remove('hidden');
}

function openEditLiveNoticeModal(index) {
  currentNoticeEditLiveIndex = index;
  const live = getLiveNotices();
  const notice = live[index];
  if (!notice) return;

  document.getElementById('notice-modal-title').innerText = 'লাইভ প্রকাশিত নোটিশ এডিট';
  document.getElementById('not-edit-id').value = notice.id || '';
  document.getElementById('not-edit-title').value = notice.title || '';
  document.getElementById('not-edit-category').value = notice.category || 'jobs';
  document.getElementById('not-edit-org').value = notice.org || '';
  document.getElementById('not-edit-vacancies').value = notice.vacancies || '';
  document.getElementById('not-edit-deadline').value = notice.deadline || '';
  document.getElementById('not-edit-fee').value = notice.fee || '';
  document.getElementById('not-edit-qual').value = notice.qualification || '';
  document.getElementById('not-edit-pdf').value = notice.pdfUrl || '';
  document.getElementById('not-edit-source').value = notice.sourceUrl || '';
  document.getElementById('not-edit-details').value = notice.details || '';

  document.getElementById('notice-edit-modal').classList.remove('hidden');
}

function closeNoticeModal() {
  document.getElementById('notice-edit-modal').classList.add('hidden');
}

function saveNoticeEdit(e) {
  e.preventDefault();
  const live = getLiveNotices();
  
  const title = document.getElementById('not-edit-title').value.trim();
  const category = document.getElementById('not-edit-category').value;
  const org = document.getElementById('not-edit-org').value.trim();
  const vacancies = document.getElementById('not-edit-vacancies').value.trim();
  const deadline = document.getElementById('not-edit-deadline').value.trim();
  const fee = document.getElementById('not-edit-fee').value.trim() || 'প্রযোজ্য ফি';
  const qual = document.getElementById('not-edit-qual').value.trim();
  const pdfUrl = document.getElementById('not-edit-pdf').value.trim();
  const sourceUrl = document.getElementById('not-edit-source').value.trim();
  const details = document.getElementById('not-edit-details').value.trim();

  if (currentNoticeEditLiveIndex >= 0 && live[currentNoticeEditLiveIndex]) {
    // Edit existing live notice
    const n = live[currentNoticeEditLiveIndex];
    n.title = title;
    n.category = category;
    n.org = org;
    n.vacancies = vacancies;
    n.deadline = deadline;
    n.fee = fee;
    n.qualification = qual;
    n.pdfUrl = pdfUrl;
    n.sourceUrl = sourceUrl;
    n.details = details;
  } else {
    // Add brand new live notice
    live.unshift({
      id: 'live-' + Date.now(),
      category: category,
      type: category === 'college' ? 'কলেজ নোটিশ' : (category === 'admission' ? 'ভর্তি নোটিশ' : 'সরকারি চাকরি'),
      title: title,
      org: org,
      vacancies: vacancies,
      deadline: deadline,
      daysLeft: 'আবেদন সচল',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      qualification: qual,
      fee: fee,
      details: details,
      pdfUrl: pdfUrl,
      sourceUrl: sourceUrl,
      sourceName: org
    });
  }

  saveLiveNotices(live);
  closeNoticeModal();
  renderAllPanels();
  showToast(`🎉 "${title}" সফলভাবে লাইভ ওয়েবসাইটে প্রকাশিত হয়েছে!`, 'success');
}

// JSON Backup Download
function downloadNoticesJSON() {
  const live = getLiveNotices();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(live, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `fayzar_live_notices_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('notices.json সফলভাবে ডাউনলোড হয়েছে!', 'success');
}

// =========================================================================
// টোস্ট নোটিফিকেশন (Toast Notifications)
// =========================================================================
function showToast(message, type = 'info') {
  const toast = document.getElementById('admin-toast');
  if (!toast) return;
  
  let bgClass = 'bg-slate-900 border border-slate-700 text-white';
  let icon = '<i class="fas fa-circle-info text-sky-400"></i>';
  
  if (type === 'success') {
    bgClass = 'bg-emerald-900 border border-emerald-600 text-white';
    icon = '<i class="fas fa-circle-check text-emerald-300"></i>';
  } else if (type === 'error') {
    bgClass = 'bg-rose-900 border border-rose-600 text-white';
    icon = '<i class="fas fa-triangle-exclamation text-rose-300"></i>';
  }
  
  toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl transition-all duration-300 flex items-center gap-2 ${bgClass}`;
  toast.innerHTML = `${icon} <span>${message}</span>`;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
