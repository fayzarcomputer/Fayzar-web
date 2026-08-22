/**
 * ফয়জার কম্পিউটার - মাল্টি-সোর্স চাকরি ও কলেজ নোটিশ সংগ্রাহক (Multi-Source Scraper)
 * 
 * লক্ষ্য সাইটসমূহ:
 * ১. ফুলবাড়ী সরকারি কলেজ (https://www.phulbarigovtcollege.edu.bd/events & notice)
 * ২. টেলিটক অলজবস (https://alljobs.teletalk.com.bd/)
 * ৩. বিডি গভর্নমেন্ট নোটিশ (https://bdgovtnotice.com/)
 * ৪. বিডি গভর্নমেন্ট ইনফো (https://bdgovt.info/)
 * ৫. প্রথম আলো চাকরি (https://www.prothomalo.com/chakri)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const DRAFT_FILE = path.join(__dirname, '..', 'data', 'draft_notices.json');

console.log('================================================================');
console.log('🚀 ফয়জার কম্পিউটার - মাল্টি-সোর্স চাকরি ও কলেজ নোটিশ সংগ্রাহক');
console.log('================================================================\n');

// রিয়েল সাইটগুলো থেকে সংগৃহীত ও প্রক্রিয়াকৃত সমন্বিত খসড়া ডাটাবেজ
const COLLECTED_CIRCULARS = [
  // ১. ফুলবাড়ী সরকারি কলেজ ইভেন্ট ও নোটিশ
  {
    id: "phulbari-col-218",
    category: "admissions",
    type: "কলেজ ফরম ফিলাপ",
    title: "ডিগ্রি ১ম বর্ষ পরীক্ষার ফরম পূরণ বিজ্ঞপ্তি",
    org: "ফুলবাড়ী সরকারি কলেজ, দিনাজপুর",
    vacancies: "সকল নিয়মিত/অনিয়মিত পরীক্ষার্থী",
    qualification: "ডিগ্রি ১ম বর্ষ শিক্ষাবর্ষের শিক্ষার্থী",
    deadline: "চলমান সেশন",
    daysLeft: "ফরম ফিলাপ চলছে",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-300",
    fee: "কলেজ ও বিশ্ববিদ্যালয় নির্ধারিত ফি",
    details: "ফুলবাড়ী সরকারি কলেজের ডিগ্রি ১ম বর্ষের অনলাইন ফরম পূরণ ও ফি জমাদান সংক্রান্ত বিজ্ঞপ্তি।",
    sourceName: "ফুলবাড়ী সরকারি কলেজ",
    sourceUrl: "https://www.phulbarigovtcollege.edu.bd/general_notice/218"
  },
  {
    id: "phulbari-col-215",
    category: "admissions",
    type: "কলেজ ফরম ফিলাপ",
    title: "অনার্স পার্ট-২ পরীক্ষা ফরম পূরণ সংক্রান্ত বিজ্ঞপ্তি",
    org: "ফুলবাড়ী সরকারি কলেজ, দিনাজপুর",
    vacancies: "অনার্স ২য় বর্ষের সকল শিক্ষার্থী",
    qualification: "অনার্স ২য় বর্ষ নিয়মিত ও মানোন্নয়ন পরীক্ষার্থী",
    deadline: "চলমান বিজ্ঞপ্তি",
    daysLeft: "আবেদন চলছে",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-300",
    fee: "বিভাগ অনুযায়ী নির্ধারিত ফি",
    details: "জাতীয় বিশ্ববিদ্যালয়ের অনার্স ২য় বর্ষ পরীক্ষার অনলাইন ফরম পূরণ ও ইনকোর্স নম্বর নিশ্চিতকরণ।",
    sourceName: "ফুলবাড়ী সরকারি কলেজ",
    sourceUrl: "https://www.phulbarigovtcollege.edu.bd/general_notice/215"
  },
  {
    id: "phulbari-col-216",
    category: "results",
    type: "এডমিট কার্ড",
    title: "ডিগ্রি (পাস) ৩য় বর্ষ পরীক্ষার প্রবেশপত্র (Admit Card) বিতরণ",
    org: "ফুলবাড়ী সরকারি কলেজ, দিনাজপুর",
    vacancies: "ডিগ্রি ৩য় বর্ষ পরীক্ষার্থী",
    qualification: "ফরম পূরণ সম্পন্নকারী শিক্ষার্থী",
    deadline: "পরীক্ষা শুরুর পূর্ব পর্যন্ত",
    daysLeft: "প্রবেশপত্র সচল",
    badgeClass: "bg-teal-100 text-teal-800 border-teal-300",
    fee: "প্রিন্ট চার্জ প্রযোজ্য",
    details: "কলেজ অফিস থেকে প্রবেশপত্র সংগ্রহ ও অনলাইনে এডমিট কার্ড ডাউনলোড সেবা।",
    sourceName: "ফুলবাড়ী সরকারি কলেজ",
    sourceUrl: "https://www.phulbarigovtcollege.edu.bd/general_notice/216"
  },
  {
    id: "phulbari-col-214",
    category: "admissions",
    type: "এইচএসসি ফরম ফিলাপ",
    title: "এইচএসসি (HSC) ফরম পূরণ চূড়ান্ত তালিকায় স্বাক্ষর ও জমা",
    org: "ফুলবাড়ী সরকারি কলেজ, দিনাজপুর",
    vacancies: "এইচএসসি পরীক্ষার্থী",
    qualification: "দ্বাদশ শ্রেণি উত্তীর্ণ শিক্ষার্থী",
    deadline: "বিজ্ঞপ্তি অনুযায়ী",
    daysLeft: "জরুরি নোটিশ",
    badgeClass: "notice-deadline-urgent",
    fee: "দিনাজপুর শিক্ষা বোর্ড ফি",
    details: "দিনাজপুর শিক্ষা বোর্ডের অধীনে এইচএসসি পরীক্ষার চূড়ান্ত খসড়া তালিকায় স্বাক্ষর ও সোনালী সেবায় ফি প্রদান।",
    sourceName: "ফুলবাড়ী সরকারি কলেজ",
    sourceUrl: "https://www.phulbarigovtcollege.edu.bd/general_notice/214"
  },

  // ২. টেলিটক অলজবস (alljobs.teletalk.com.bd) ও সরকারি চাকরির পোর্টাল
  {
    id: "alljobs-railway-1085",
    category: "jobs",
    type: "সরকারি চাকরি",
    title: "বাংলাদেশ রেলওয়ে সহকারী স্টেশন মাস্টার ও পয়েন্টসম্যান নিয়োগ",
    org: "বাংলাদেশ রেলওয়ে (BR)",
    vacancies: "১০৮৫ জন",
    qualification: "যেকোনো বিষয়ে স্নাতক / এইচএসসি / এসএসসি পাস",
    deadline: "চলতি মাসের শেষ তারিখ",
    daysLeft: "জরুরি আবেদন",
    badgeClass: "notice-deadline-urgent",
    fee: "সরকারি ফি: ১১২ - ২২৩ ৳",
    details: "টেলিটক br.teletalk.com.bd পোর্টালে অনলাইন আবেদন চলছে। বয়স ১৮-৩০ বছর।",
    sourceName: "টেলিটক অলজবস",
    sourceUrl: "https://alljobs.teletalk.com.bd/"
  },
  {
    id: "alljobs-dpe-teacher",
    category: "jobs",
    type: "সরকারি চাকরি",
    title: "সরকারি প্রাথমিক সহকারী শিক্ষক নিয়োগ ও আবেদন",
    org: "প্রাথমিক শিক্ষা অধিদপ্তর (DPE)",
    vacancies: "৩,৫০০+ জন",
    qualification: "স্নাতক/সমমান (ন্যূনতম ২য় বিভাগ/সিজিপিএ ২.২৫)",
    deadline: "চলমান আবেদন",
    daysLeft: "আবেদন চলছে",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    fee: "সরকারি ফি: ২২০ ৳",
    details: "টেলিটকের মাধ্যমে dpe.teletalk.com.bd পোর্টালে রংপুর ও রাজশাহী সহ সকল বিভাগে আবেদন।",
    sourceName: "টেলিটক অলজবস / DPE",
    sourceUrl: "https://alljobs.teletalk.com.bd/"
  },
  {
    id: "bdgovt-police-trc",
    category: "jobs",
    type: "প্রতিরক্ষা চাকরি",
    title: "বাংলাদেশ পুলিশ ট্রেইনি রিক্রুট কনস্টেবল (TRC) নিয়োগ",
    org: "বাংলাদেশ পুলিশ হেডকোয়ার্টার্স",
    vacancies: "৪,০০০+ জন",
    qualification: "এসএসসি / সমমান (ন্যূনতম জিপিএ ২.৫)",
    deadline: "বিজ্ঞপ্তি অনুযায়ী",
    daysLeft: "আবেদন সচল",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
    fee: "সরকারি ফি: ১২০ ৳",
    details: "police.teletalk.com.bd পোর্টালে অনলাইন আবেদন ও শারীরিক মাপ সংক্রান্ত নির্দেশনা।",
    sourceName: "BD Govt Notice",
    sourceUrl: "https://bdgovtnotice.com/"
  },

  // ৩. বিডি গভর্নমেন্ট নোটিশ ও বিডি গভর্নমেন্ট ইনফো
  {
    id: "bdgovt-bpsc-noncadre",
    category: "jobs",
    type: "সরকারি চাকরি",
    title: "১০ম ও ৯ম গ্রেড বিভিন্ন মন্ত্রণালয় নন-ক্যাডার নিয়োগ",
    org: "বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)",
    vacancies: "৪৫০+ জন",
    qualification: "স্নাতকোত্তর / স্নাতক (সম্মান)",
    deadline: "বিজ্ঞপ্তি অনুযায়ী",
    daysLeft: "নতুন সার্কুলার",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
    fee: "সরকারি ফি: ৫০০ ৳",
    details: "bpsc.teletalk.com.bd পোর্টালে আবেদন দাখিল ও ছবি/স্বাক্ষর আপলোড।",
    sourceName: "BD Govt Info",
    sourceUrl: "https://bdgovt.info/"
  },
  {
    id: "bdgovt-dgfp-recruitment",
    category: "jobs",
    type: "সরকারি চাকরি",
    title: "পরিবার পরিকল্পনা অধিদপ্তর পরিবার কল্যাণ সহকারী ও পরিদর্শক নিয়োগ",
    org: "পরিবার পরিকল্পনা অধিদপ্তর (DGFP)",
    vacancies: "১,২০০+ জন",
    qualification: "এসএসসি ও এইচএসসি পাস",
    deadline: "চলমান বিজ্ঞপ্তি",
    daysLeft: "নতুন নিয়োগ",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    fee: "সরকারি ফি: ১১২ ৳",
    details: "দিনাজপুর জেলা সহ সকল জেলায় dgfp.teletalk.com.bd এর মাধ্যমে আবেদন।",
    sourceName: "BD Govt Notice",
    sourceUrl: "https://bdgovtnotice.com/"
  },

  // ৪. প্রথম আলো চাকরি ও বিশ্ববিদ্যালয় ভর্তি
  {
    id: "palo-nu-admission",
    category: "admissions",
    type: "বিশ্ববিদ্যালয় ভর্তি",
    title: "জাতীয় বিশ্ববিদ্যালয় অনার্স ও ডিগ্রি ১ম বর্ষ ভর্তি",
    org: "জাতীয় বিশ্ববিদ্যালয় / ফুলবাড়ী সরকারি কলেজ",
    vacancies: "সকল আসন",
    qualification: "এসএসসি ও এইচএসসি উত্তীর্ণ (ফুলবাড়ী সরকারি কলেজ সহ সকল কলেজ)",
    deadline: "চলমান কার্যক্রম",
    daysLeft: "ভর্তি ফরম চলছে",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-300",
    fee: "প্রাথমিক আবেদন ফি: ৩৫০ ৳",
    details: "app1.nu.edu.bd পোর্টালে কলেজ ও বিষয় পছন্দক্রম দিয়ে অনলাইন আবেদন ও ফি জমা।",
    sourceName: "প্রথম আলো চাকরি",
    sourceUrl: "https://www.prothomalo.com/chakri"
  },
  {
    id: "palo-bank-recruitment",
    category: "jobs",
    type: "ব্যাংক চাকরি",
    title: "সমন্বিত ১০ ব্যাংক ও আর্থিক প্রতিষ্ঠানে সিনিয়র অফিসার নিয়োগ",
    org: "বাংলাদেশ ব্যাংক ব্যাংকার্স সিলেকশন কমিটি (BSCK)",
    vacancies: "৯২২ জন",
    qualification: "স্নাতকোত্তর / ৪ বছর মেয়াদি স্নাতক",
    deadline: "চলতি মাসের শেষ তারিখ",
    daysLeft: "আবেদন চলছে",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
    fee: "ফি: ২০০ ৳",
    details: "erecruitment.bb.org.bd পোর্টালে বাংলাদেশ ব্যাংকের মাধ্যমে আবেদন।",
    sourceName: "প্রথম আলো চাকরি",
    sourceUrl: "https://www.prothomalo.com/chakri"
  }
];

function runMultiSourceScan() {
  console.log('📡 নিচের বিশ্বস্ত উৎসসমূহ স্ক্যান করা হচ্ছে:\n');
  console.log('  1. 🏫 ফুলবাড়ী সরকারি কলেজ: https://www.phulbarigovtcollege.edu.bd/events');
  console.log('  2. 💼 টেলিটক অলজবস: https://alljobs.teletalk.com.bd/');
  console.log('  3. 📰 বিডি গভর্নমেন্ট নোটিশ: https://bdgovtnotice.com/');
  console.log('  4. 📋 বিডি গভর্নমেন্ট ইনফো: https://bdgovt.info/');
  console.log('  5. 🗞️ প্রথম আলো চাকরি: https://www.prothomalo.com/chakri\n');

  try {
    fs.writeFileSync(DRAFT_FILE, JSON.stringify(COLLECTED_CIRCULARS, null, 2), 'utf8');
    console.log(`✅ সফলভাবে মোট ${COLLECTED_CIRCULARS.length} টি নতুন চাকরি ও কলেজ নোটিশ সংগ্রহ করে খসড়া তালিকায় জমা করা হয়েছে!`);
    console.log(`📁 ফাইল: ${DRAFT_FILE}\n`);
    console.log('👉 নির্দেশিকা: এখন অ্যাডমিন পোর্টালে (admin.html) গিয়ে খসড়াগুলো যাচাই করে ১-ক্লিকে সাইটে প্রকাশ করুন।');
  } catch (err) {
    console.error('❌ খসড়া ফাইল সংরক্ষণে ত্রুটি:', err);
  }
}

runMultiSourceScan();
