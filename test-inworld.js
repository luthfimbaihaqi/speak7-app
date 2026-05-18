/**
 * INWORLD TTS API TEST SCRIPT - V3 (Simplified)
 * 
 * Pattern yang sama dengan quick-check.js yang work.
 * 
 * Usage:
 * 1. Save sebagai test-inworld.js di root project (folder speak7)
 * 2. Run: node test-inworld.js
 * 3. Cek folder test-output/ untuk MP3 files
 */

import fs from 'fs';
import dotenv from 'dotenv';

// 🔥 Simple pattern - same as quick-check.js
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.INWORLD_API_KEY;

if (!API_KEY) {
  console.error('❌ INWORLD_API_KEY not found');
  process.exit(1);
}

console.log('🔑 API Key found:', API_KEY.length, 'chars');
console.log('   First 10 chars:', API_KEY.substring(0, 10) + '...');

const OUTPUT_DIR = './test-output';
const ENDPOINT = 'https://api.inworld.ai/tts/v1/voice';

// 3 voices yang lo pilih
const VOICES = [
  { name: 'Paul', voiceId: 'Ronald' },
  { name: 'Billie', voiceId: 'Tyler' },
  { name: 'Taylor', voiceId: 'Eleanor' }
];

const TEST_TEXT = "Hello, I'm Mr. Paul. Could you please tell me your full name? Now let's talk about your hobbies. What do you usually do in your free time?";

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
  console.log('📁 Created output directory:', OUTPUT_DIR);
}

async function generateAudio(voice) {
  console.log(`\n🎤 Testing voice: ${voice.name} (voiceId: ${voice.voiceId})`);
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: TEST_TEXT,
        voiceId: voice.voiceId,
        modelId: 'inworld-tts-2'
      })
    });

    const latency = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`   ❌ API Error ${response.status}: ${errorText}`);
      return false;
    }
    
    const data = await response.json();
    
    if (!data.audioContent) {
      console.error(`   ❌ No audioContent in response`);
      console.error(`   Response:`, JSON.stringify(data).substring(0, 200));
      return false;
    }
    
    const audioBuffer = Buffer.from(data.audioContent, 'base64');
    const filename = `${OUTPUT_DIR}/${voice.name.toLowerCase()}.mp3`;
    fs.writeFileSync(filename, audioBuffer);
    
    const fileSizeKB = (audioBuffer.length / 1024).toFixed(2);
    
    console.log(`   ✅ Success`);
    console.log(`   📄 File: ${filename}`);
    console.log(`   ⏱️  Latency: ${latency}ms`);
    console.log(`   📦 Size: ${fileSizeKB} KB`);
    
    return true;
    
  } catch (err) {
    console.error(`   ❌ Error:`, err.message);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Starting Inworld TTS API tests...');
  console.log(`📝 Text length: ${TEST_TEXT.length} characters`);
  
  const results = [];
  
  for (const voice of VOICES) {
    const success = await generateAudio(voice);
    results.push({ voice: voice.name, success });
  }
  
  console.log('\n📊 SUMMARY:');
  console.log('─'.repeat(40));
  results.forEach(r => {
    console.log(`   ${r.success ? '✅' : '❌'} ${r.voice}`);
  });
  
  const allPassed = results.every(r => r.success);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed!');
    console.log(`\n📂 Buka folder ${OUTPUT_DIR}/ dan play:`);
    console.log('   - paul.mp3 (voice Ronald)');
    console.log('   - billie.mp3 (voice Tyler)');
    console.log('   - taylor.mp3 (voice Eleanor)');
  } else {
    console.log('\n⚠️  Some tests failed.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});