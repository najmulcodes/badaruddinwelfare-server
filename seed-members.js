// seed-members.js
// Run once: node seed-members.js
// Creates all 20 family members with default password: brother123

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const members = [
  { name: "আকবর হেসেন রিফাত",   email: "akbor@bubwo.org" },
  { name: "আবু তালেব",           email: "abutaleb@bubwo.org" },
  { name: "আবু বকর সিদ্দিক",    email: "abubakr@bubwo.org" },
  { name: "আবু সায়েদ রিন",      email: "abusayed@bubwo.org" },
  { name: "আরিফুল ইসলাম",        email: "ariful@bubwo.org" },
  { name: "একরাম হেসেন রিদয়",   email: "ekram@bubwo.org" },
  { name: "ওমর ফারুক",           email: "omar@bubwo.org" },
  { name: "পারেভেজ",             email: "parvez@bubwo.org" },
  { name: "মামুনুর রশীদ",        email: "mamun@bubwo.org" },
  { name: "মেজবাহ উদ্দিন",       email: "mezbah@bubwo.org" },
  { name: "মোঃ আলমগীর",          email: "alamgir@bubwo.org" },
  { name: "মোঃ মুসা",            email: "musa@bubwo.org" },
  { name: "মোঃ সামসুউদ্দিন",     email: "shamsuddin@bubwo.org" },
  { name: "রাজীব",               email: "rajib@bubwo.org" },
  { name: "শরীফুল ইসলাম",        email: "shariful@bubwo.org" },
  { name: "শাহরিয়ার",           email: "admin@shariar.com" },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  let created = 0;
  let skipped = 0;

  for (const m of members) {
    const exists = await User.findOne({ email: m.email });
    if (exists) {
      console.log(`⏭  Skipped (exists): ${m.name}`);
      skipped++;
      continue;
    }
    await User.create({
      name: m.name,
      email: m.email,
      password: "bother123",
      role: "member",
      isActive: true,
      image: "",
    });
    console.log(`✅ Created: ${m.name}`);
    created++;
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
