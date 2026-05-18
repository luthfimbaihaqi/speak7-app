import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('INWORLD_API_KEY:', process.env.INWORLD_API_KEY ? 
  `Found (${process.env.INWORLD_API_KEY.length} chars)` : 
  'NOT FOUND');