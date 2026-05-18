/**
 * GENERATE VOICE SAMPLES - Inworld TTS
 * 
 * Purpose: Generate 3 sample MP3 files untuk preview di VoiceSelectionModal
 * 
 * Output: 3 file MP3 di folder samples-output/
 * - paul-sample.mp3 (Ronald voice)
 * - billie-sample.mp3 (Tyler voice)
 * - taylor-sample.mp3 (Eleanor voice)
 * 
 * Usage:
 * 1. Save sebagai generate-samples.js di root project (folder speak7)
 * 2. Run: node generate-samples.js
 * 3. Cek folder samples-output/ untuk 3 file MP3
 * 4. Play file MP3 untuk verify quality
 * 5. Move 3 files ke public/audio/samples/
 * 6. Done!
 */

import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const API_KEY = process.env.INWORLD_API_KEY;

if (!API_KEY) {
  console.error('❌ INWORLD_API_KEY not found di .env.local');
  process.exit(1);
}

console.log('🔑 API Key found:', API_KEY.length, 'chars');

const OUTPUT_DIR = './samples-output';
const ENDPOINT = 'https://api.inworld.ai/tts/v1/voice';
const MODEL = 'inworld-tts-2';

// 🔥 3 voices dengan personalized intro text
const VOICES = [
  {
    fileName: 'paul-sample',
    displayName: 'Paul',
    voiceId: 'Ronald',
    text: "Hello, welcome to the IELTS Speaking Simulation. My name is Paul, I will be your examiner for today. Could you tell me your full name, please? Now, do you work or are you a student? Thank you."
  },
  {
    fileName: 'billie-sample',
    displayName: 'Billie',
    voiceId: 'Tyler',
    text: "Hello, welcome to the IELTS Speaking Simulation. My name is Billie, I will be your examiner for today. Could you tell me your full name, please? Now, do you work or are you a student? Thank you."
  },
  {
    fileName: 'taylor-sample',
    displayName: 'Taylor',
    voiceId: 'Eleanor',
    text: "Hello, welcome to the IELTS Speaking Simulation. My name is Taylor, I will be your examiner for today. Could you tell me your full name, please? Now, do you work or are you a student? Thank you."
  }
];

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
  console.log('📁 Created output directory:', OUTPUT_DIR);
}

async function generateSample(voice) {
  console.log(`\n🎤 Generating: ${voice.displayName} (voiceId: ${voice.voiceId})`);
  console.log(`   📝 Text length: ${voice.text.length} characters`);
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: voice.text,
        voiceId: voice.voiceId,
        modelId: MODEL
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
      return false;
    }
    
    const audioBuffer = Buffer.from(data.audioContent, 'base64');
    const filename = `${OUTPUT_DIR}/${voice.fileName}.mp3`;
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
  console.log('\n🚀 Generating voice samples for IELTS4OUR...');
  console.log(`📍 Model: ${MODEL}`);
  console.log(`📂 Output: ${OUTPUT_DIR}/`);
  
  const results = [];
  
  for (const voice of VOICES) {
    const success = await generateSample(voice);
    results.push({ voice: voice.displayName, success });
  }
  
  console.log('\n' + '─'.repeat(50));
  console.log('📊 GENERATION SUMMARY:');
  console.log('─'.repeat(50));
  results.forEach(r => {
    console.log(`   ${r.success ? '✅' : '❌'} ${r.voice}-sample.mp3`);
  });
  
  const allPassed = results.every(r => r.success);
  
  if (allPassed) {
    console.log('\n🎉 All samples generated successfully!');
    console.log('\n📋 NEXT STEPS:');
    console.log('   1. Play files di ' + OUTPUT_DIR + '/ untuk verify quality');
    console.log('   2. Create folder: public/audio/samples/');
    console.log('   3. Move 3 file MP3 ke folder tersebut');
    console.log('   4. Confirm dengan gue: "Samples ready!"');
    console.log('\n   Final destination:');
    console.log('   public/audio/samples/paul-sample.mp3');
    console.log('   public/audio/samples/billie-sample.mp3');
    console.log('   public/audio/samples/taylor-sample.mp3');
  } else {
    console.log('\n⚠️  Some samples failed. Check errors above.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});