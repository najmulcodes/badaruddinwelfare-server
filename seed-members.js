// seed-members.js
// Run once: node seed-members.js
// Creates all members with default password: Badar123

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const members = [
  { name: "আকবর হেসেন রিফাত", email: "akbor@badaruddin.org" },
  { name: "আবু তালেব", email: "abutaleb@badaruddin.org" },
  { name: "আবু বকর সিদ্দিক", email: "abubakr@badaruddin.org" },
  { name: "আবু সায়েদ রিন", email: "abusayed@badaruddin.org" },
  { name: "আরিফুল ইসলাম", email: "ariful@badaruddin.org" },
  { name: "একরাম হেসেন রিদয়", email: "ekram@badaruddin.org" },
  { name: "ওমর ফারুক", email: "omar@badaruddin.org" },
  { name: "পারেভেজ", email: "parvez@badaruddin.org" },
  { name: "মামুনুর রশীদ", email: "mamun@badaruddin.org" },
  { name: "মেজবাহ উদ্দিন", email: "mezbah@badaruddin.org" },
  { name: "মোঃ আলমগীর", email: "alamgir@badaruddin.org" },
  { name: "মোঃ মুসা", email: "musa@badaruddin.org" },
  { name: "মোঃ সামসুউদ্দিন", email: "shamsuddin@badaruddin.org" },
  { name: "রাজীব", email: "rajib@badaruddin.org" },
  { name: "শরীফুল ইসলাম", email: "shariful@badaruddin.org" },
  { name: "শাহরিয়ার", email: "sir@badaruddin.org" },
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
      password: "Badar123",
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