/* server/scripts/seed.cjs
 * Creates a demo user and writes TEST_USER_ID to server/.env
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');

async function ensureConnection() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI not set in server/.env');
  }
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

async function upsertDemoUser() {
  const filter = { email: 'demo@ccc.local' };
  const update = {
    username: 'demo',
    email: 'demo@ccc.local',
    // Add a few starter items so UI has content
    pantry: [
      { name: 'onion', quantity: '2' },
      { name: 'garlic', quantity: '3 cloves' },
      { name: 'olive oil', quantity: '250 ml' },
    ],
    stores: [
      { name: 'Walmart' },
      { name: 'Costco' },
    ],
  };
  const opts = { new: true, upsert: true, setDefaultsOnInsert: true };
  const doc = await User.findOneAndUpdate(filter, update, opts);
  return doc._id.toString();
}

function writeTestUserIdToEnv(userId) {
  const envPath = path.resolve(__dirname, '../.env');
  let content = fs.readFileSync(envPath, 'utf8');
  const line = `TEST_USER_ID=${userId}`;

  if (/^TEST_USER_ID=/m.test(content)) {
    content = content.replace(/^TEST_USER_ID=.*/m, line);
  } else {
    if (!content.endsWith('\n')) content += '\n';
    content += line + '\n';
  }
  fs.writeFileSync(envPath, content, 'utf8');
}

(async () => {
  try {
    await ensureConnection();
    const userId = await upsertDemoUser();
    writeTestUserIdToEnv(userId);
    console.log('Seed complete. TEST_USER_ID:', userId);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
})();

