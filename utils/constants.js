// utils/constants.js

// --- 1. GUILT TRIP MESSAGES ---
export const GUILT_MESSAGES = [
  { icon: "🧐", title: "Examiner is Judging...", text: "\"Hmm, leaving already? That looks like a Band 5.0 attitude to me.\"" },
  { icon: "💸", title: "Think about the Money", text: "The real IELTS test costs $200+. Wasting practice time is expensive. Sure you want to quit?" },
  { icon: "📉", title: "Competitors are Winning", text: "While you sleep, your competitors are memorizing 50 new idioms right now." },
  { icon: "🦉", title: "The Owl is Watching", text: "You haven't practiced your 40 hours today. Don't make me come over to your house." },
  { icon: "💀", title: "RIP Your Score", text: "Here lies your Band 8.0 dream. Cause of death: Clicking Logout too early." },
  { icon: "🇬🇧", title: "The King Disapproves", text: "Do you think the King would quit? No. So get back in there and speak proper English!" },
  { icon: "🤡", title: "Are you joking?", text: "Quitting just when you were about to have a breakthrough? Classic clown move." }
];

// --- 2. BANK SOAL PART 2 (CUE CARDS) ---
// (Tetap sama seperti yang kamu kirim, saya tidak ubah isinya)
export const CUE_CARDS = [
  { topic: "Describe a book you read that you found useful.", points: ["What the book is", "When you read it", "Why you found it useful", "And explain how it helped you"] },
  { topic: "Describe a time when you helped someone.", points: ["Who you helped", "Why they needed help", "How you helped them", "And explain how you felt about it"] },
  { topic: "Describe a popular place for sports in your city.", points: ["Where it is", "What sports people play there", "How often you go there", "And explain why it is popular"] },
  { topic: "Describe an invention that changed the world.", points: ["What the invention is", "Who invented it", "How it changed our lives", "And explain why you think it is important"] },
  { topic: "Describe a famous person you would like to meet.", points: ["Who this person is", "Why they are famous", "What you would talk about", "And explain why you want to meet them"] },
  { topic: "Describe a movie you watched recently.", points: ["What the movie was", "When and where you watched it", "Who you watched it with", "And explain why you liked or disliked it"] },
  { topic: "Describe a gift you gave to someone.", points: ["What the gift was", "Who you gave it to", "Why you chose that gift", "And explain how the person reacted"] },
  { topic: "Describe a difficult decision you made.", points: ["What the decision was", "When you made it", "Why it was difficult", "And explain the result of the decision"] },
  { topic: "Describe a website you visit often.", points: ["What the website is", "How you found it", "What you use it for", "And explain why you visit it often"] },
  { topic: "Describe a traditional festival in your country.", points: ["What the festival is", "When and where it happens", "What people do during it", "And explain why it is important"] },
  { topic: "Describe a crowded place you have visited.", points: ["Where it was", "When you went there", "Who you were with", "And explain how you felt being there"] },
  { topic: "Describe a family member you admire.", points: ["Who they are", "What they do", "Why you admire them", "And explain your relationship with them"] },
  { topic: "Describe a goal you want to achieve.", points: ["What the goal is", "Why you want to achieve it", "How you plan to achieve it", "And explain why it is important to you"] },
  { topic: "Describe a piece of art you like.", points: ["What it is", "Where you saw it", "What it looks like", "And explain why you like it"] },
  { topic: "Describe a time you were late for something.", points: ["What you were late for", "Why you were late", "What happened as a result", "And explain how you felt about it"] },
  { topic: "Describe a technological device you use daily.", points: ["What the device is", "How long you have used it", "What you use it for", "And explain why it is important to you"] },
  { topic: "Describe a trip you plan to take.", points: ["Where you want to go", "Who you would go with", "What you would do there", "And explain why you want to take this trip"] },
  { topic: "Describe a wild animal you have seen.", points: ["What animal it was", "Where you saw it", "What it was doing", "And explain how you felt when you saw it"] },
  { topic: "Describe a teacher who influenced you.", points: ["Who the teacher was", "What subject they taught", "How they influenced you", "And explain why you remember them"] },
  { topic: "Describe a song that means a lot to you.", points: ["What the song is", "When you first heard it", "What the lyrics are about", "And explain why it is special to you"] },
  { topic: "Describe a historical building in your town.", points: ["Where it is", "What it looks like", "What it is used for now", "And explain why it is important"] },
  { topic: "Describe a time you complained about something.", points: ["What you complained about", "Who you complained to", "What the result was", "And explain how you felt about the situation"] },
  { topic: "Describe a job you would not like to do.", points: ["What the job is", "What tasks it involves", "Why you think it is difficult", "And explain why you would not like to do it"] },
  { topic: "Describe a skill you want to learn.", points: ["What the skill is", "Why you want to learn it", "How you would learn it", "And explain how it would help you"] },
  { topic: "Describe a time you saved money for something.", points: ["What you saved for", "How long it took you", "How you saved the money", "And explain how you felt when you bought it"] },
  { topic: "Describe a business person you admire.", points: ["Who they are", "What business they run", "Why they are successful", "And explain why you admire them"] },
  { topic: "Describe a quiet place you like to go to.", points: ["Where it is", "How often you go there", "What you do there", "And explain why you like it"] },
  { topic: "Describe a time you received good news.", points: ["What the news was", "How you received it", "Who you shared it with", "And explain why it was good news"] },
  { topic: "Describe a change that would improve your local area.", points: ["What the change would be", "How it would be done", "Who it would benefit", "And explain why this change is necessary"] },
  { topic: "Describe a competition you would like to take part in.", points: ["What the competition is", "What you would need to do", "Why you want to participate", "And explain what prize you would like to win"] },
  // PREMIUM TOPICS
  { topic: "Describe a piece of advice you received that was helpful.", points: ["Who gave it to you", "What the advice was", "In what situation you received it", "And explain how it helped you"] },
  { topic: "Describe a risk you took that you do not regret.", points: ["What the risk was", "Why you took it", "What the result was", "And explain why you do not regret it"] },
  { topic: "Describe a family business you know and admire.", points: ["What the business is", "Who runs it", "How you know about it", "And explain why you admire it"] },
  { topic: "Describe a rule at your school or work that you did not like.", points: ["What the rule was", "Why it was implemented", "Why you did not like it", "And explain if you followed it or not"] },
  { topic: "Describe a time you used a map to find your way.", points: ["Where you were going", "Why you needed a map", "How easy or difficult it was", "And explain if you found the place successfully"] },
  { topic: "Describe a creative person whose work you like.", points: ["Who the person is", "What kind of creative work they do", "How you know about them", "And explain why you like their work"] },
  { topic: "Describe a party that you enjoyed.", points: ["Whose party it was", "When and where it was held", "What happened during the party", "And explain why you enjoyed it"] },
  { topic: "Describe an old object which your family has kept for a long time.", points: ["What the object is", "Where it came from", "How long your family has kept it", "And explain why it is important to your family"] },
  { topic: "Describe a disagreement you had with a friend.", points: ["Who the friend was", "What the disagreement was about", "How you resolved it", "And explain how it affected your friendship"] },
  { topic: "Describe a uniform you wear (or wore) at school or work.", points: ["What it looks like", "When you wear it", "Who bought it for you", "And explain how you feel about wearing it"] },
  { topic: "Describe a speech or talk that you found interesting.", points: ["Who gave the speech", "What it was about", "Where you heard it", "And explain why you found it interesting"] },
  { topic: "Describe a time you got lost in a place you didn't know.", points: ["Where you were", "Why you were there", "How you got lost", "And explain how you found your way back"] },
  { topic: "Describe a science subject that you are interested in.", points: ["What subject it is", "How you learned about it", "Why you find it interesting", "And explain how it affects our lives"] },
  { topic: "Describe a noise that bothers you in your daily life.", points: ["What the noise is", "Where it comes from", "When it happens", "And explain why it bothers you"] },
  { topic: "Describe a place near water you enjoyed visiting.", points: ["Where this place is", "What you did there", "Who you went with", "And explain why you liked it"] },
  { topic: "Describe a toy you liked in your childhood.", points: ["What the toy was", "Who gave it to you", "How you played with it", "And explain why it was special to you"] },
  { topic: "Describe a photo of yourself that you like.", points: ["When it was taken", "Where it was taken", "Who took it", "And explain why you like this photo"] },
  { topic: "Describe a surprise that made you happy.", points: ["What the surprise was", "Who surprised you", "How you reacted", "And explain why it made you happy"] },
  { topic: "Describe a time you had to wait for something for a long time.", points: ["What you were waiting for", "How long you waited", "What you did while waiting", "And explain how you felt about waiting"] },
  { topic: "Describe a foreign culture that you are interested in learning about.", points: ["Which culture it is", "How you know about it", "What specific aspect interests you", "And explain why you want to learn more"] },
  { topic: "Describe a sport you enjoyed watching.", points: ["What sport it was", "When and where you watched it", "Who you watched it with", "And explain why you enjoyed watching it"] },
  { topic: "Describe a house or apartment you would like to live in.", points: ["Where it would be", "What it would look like", "Who you would live with", "And explain why you would like to live there"] },
  { topic: "Describe a time you were friendly to someone you didn't like.", points: ["Who the person was", "When it happened", "Why you didn't like them", "And explain why you were friendly to them"] },
  { topic: "Describe an advertisement that persuaded you to buy something.", points: ["What the advertisement was for", "Where you saw it", "What it showed", "And explain why it persuaded you"] },
  { topic: "Describe a small business you would like to open.", points: ["What kind of business it would be", "Where you would open it", "Who your customers would be", "And explain why you want to open this business"] },
  { topic: "Describe a time you moved to a new home or school.", points: ["When you moved", "Where you moved to", "Why you moved", "And explain how you felt about moving"] },
  { topic: "Describe a person who is good at apologizing.", points: ["Who this person is", "How you know them", "When they apologized to you", "And explain why you think they are good at it"] },
  { topic: "Describe a day when you woke up very early.", points: ["When it was", "Why you woke up early", "What you did that day", "And explain how you felt by the end of the day"] },
  { topic: "Describe a character from a film that you felt connected to.", points: ["Who the character is", "Which film they are in", "What their personality is like", "And explain why you felt connected to them"] },
  { topic: "Describe a traditional product from your country that is popular.", points: ["What the product is", "How it is made", "Where it is popular", "And explain why it is important to your culture"] }
];

// --- 3. BANK SOAL PART 3 (MOCK INTERVIEW WITH DIFFICULTY) ---
// Total: 30 Topik (10 Easy, 10 Medium, 10 Hard)
export const PART3_TOPICS = [
  // --- EASY: Personal & Concrete (10) ---
  { difficulty: "easy", topic: "Hobbies", startQ: "Why is it important for people to have hobbies?" },
  { difficulty: "easy", topic: "Daily Routine", startQ: "Do you think having a daily routine is helpful?" },
  { difficulty: "easy", topic: "Food & Cooking", startQ: "How have people's eating habits changed in your country recently?" },
  { difficulty: "easy", topic: "Shopping", startQ: "Do you prefer shopping online or in physical stores?" },
  { difficulty: "easy", topic: "Hometown", startQ: "What are the advantages of living in a small town compared to a big city?" },
  { difficulty: "easy", topic: "Friendship", startQ: "What qualities do you think are most important in a friend?" },
  { difficulty: "easy", topic: "Exercise", startQ: "Why don't some people exercise enough?" },
  { difficulty: "easy", topic: "Holidays", startQ: "Do you think holidays are more important now than in the past?" },
  { difficulty: "easy", topic: "Music", startQ: "How does music affect people's emotions?" },
  { difficulty: "easy", topic: "Clothing", startQ: "Does the way people dress reflect their personality?" },

  // --- MEDIUM: Social & Descriptive (10) ---
  { difficulty: "medium", topic: "Transport", startQ: "What is the best way to reduce traffic congestion in big cities?" },
  { difficulty: "medium", topic: "Tourism", startQ: "Do you think tourism always benefits a local community?" },
  { difficulty: "medium", topic: "Social Media", startQ: "Has social media improved the way we communicate or made it worse?" },
  { difficulty: "medium", topic: "Traditional Culture", startQ: "Is it important to preserve traditional festivals and customs?" },
  { difficulty: "medium", topic: "Work & Life Balance", startQ: "Is it difficult for people in your country to find a good work-life balance?" },
  { difficulty: "medium", topic: "Advertising", startQ: "To what extent does advertising influence what people buy?" },
  { difficulty: "medium", topic: "Celebrities", startQ: "Why do so many young people want to become famous?" },
  { difficulty: "medium", topic: "News & Media", startQ: "How do most people in your country get their news today?" },
  { difficulty: "medium", topic: "Online Education", startQ: "What are the disadvantages of learning online compared to a classroom?" },
  { difficulty: "medium", topic: "Public Facilities", startQ: "Should governments spend more money on parks and libraries?" },

  // --- HARD: Abstract & Global (10) ---
  { difficulty: "hard", topic: "Artificial Intelligence", startQ: "Will AI eventually replace human creativity in jobs?" },
  { difficulty: "hard", topic: "Globalization", startQ: "Does globalization lead to the loss of cultural identity?" },
  { difficulty: "hard", topic: "Environmental Ethics", startQ: "Should individuals or governments be responsible for solving climate change?" },
  { difficulty: "hard", topic: "The Future of Cities", startQ: "What will cities look like in 50 years?" },
  { difficulty: "hard", topic: "Crime & Punishment", startQ: "Do you think prisons are effective in rehabilitating criminals?" },
  { difficulty: "hard", topic: "Success", startQ: "How do you define success, and has this definition changed over time?" },
  { difficulty: "hard", topic: "History", startQ: "Is it important for children to learn about history in school?" },
  { difficulty: "hard", topic: "Space Exploration", startQ: "Is spending money on space exploration justified when we have problems on Earth?" },
  { difficulty: "hard", topic: "Leadership", startQ: "Are leaders born or made?" },
  { difficulty: "hard", topic: "Consumerism", startQ: "Does buying more things make people happier in the long run?" }
];

// --- 4. INFO BANK ---
export const BANK_INFO = {
  bankName: "BCA",             
  accountNumber: "3010166291", 
  accountName: "LUTHFI MUHAMMAD BAIHAQI", 
  price: "Rp 30.000",
  email: "luthfibaihaqi851@gmail.com",
  waNumber: "6281311364731" 
};