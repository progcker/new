const r="AIzaSyBdKYB1B6NknjPp_leBgFP7FRjrM8YQ2sI",c="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";class p{async makeRequest(a,s="hi",e){try{const t={role:"system",parts:[{text:`You are an expert agricultural AI assistant helping Indian farmers. Always respond in the same language that the user speaks. The user is speaking in ${s} language.

      
Provide practical, actionable advice for farming issues. Focus on:
- Crop diseases and pest management
- Fertilizer and nutrition recommendations  
- Weather-based farming advice
- Best practices for Indian agriculture
- Local solutions using easily available resources

Keep responses concise but comprehensive. Use simple language that farmers can understand.

Do not use markdown or any other formatting.

${e?`Context: ${e}`:""}`}]},n={contents:[{role:"user",parts:[{text:a}]}],system_instruction:t,generationConfig:{temperature:.7,topK:40,topP:.95,maxOutputTokens:1024}},i=await fetch(`${c}?key=${r}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)});if(!i.ok)throw new Error(`API request failed: ${i.status}`);const o=await i.json();if(o.candidates&&o.candidates[0]?.content?.parts[0]?.text)return o.candidates[0].content.parts[0].text;throw new Error("No response from AI")}catch(t){throw console.error("Gemini API Error:",t),t}}async askQuestion(a,s="hi",e){const t=e?`User location: ${e}`:"";return this.makeRequest(a,s,t)}async processVoiceQuery(a,s="hi",e){const t=e?`User location: ${e}. This was spoken by voice.`:"This was spoken by voice.";return this.makeRequest(a,s,t)}async analyzeImage(a,s="hi",e){const t=`User location: ${e}. Provide detailed farming advice based on what you see in the image.`;return this.makeRequest("Please analyze this crop image and provide farming advice. The image shows: a close-up of a plant leaf with brown spots",s,t)}async getWeatherAdvice(a,s,e,t="hi",n){const i=`Today's weather: ${a}, Temperature: ${s}°C, Humidity: ${e}%. What farming activities should I do today? What should I avoid?`,o=n?`User location: ${n}`:"";return this.makeRequest(i,t,o)}async identifyPlantDisease(a,s,e="hi"){const t=`My ${s} crop shows these symptoms: ${a}. What disease is this and how to treat it?`;return this.makeRequest(t,e)}async getFertilizerAdvice(a,s,e,t="hi"){const n=`I'm growing ${a} in ${s} soil. The crop is in ${e} stage. What fertilizers should I use and when?`;return this.makeRequest(n,t)}}const m=new p;export{m as geminiApi};
