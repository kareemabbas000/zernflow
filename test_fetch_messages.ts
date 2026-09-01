import { createZernioClient } from './lib/zernio-client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const zernio = createZernioClient();
  const accountId = "6a96304077555aae01748a4d";
  const conversationId = "6a96309e77555aae0174a042"; // OR 1350637680032472
  
  console.log("Fetching messages for conversation:", conversationId);
  try {
    const res = await zernio.messages.getInboxConversationMessages({
      path: { conversationId },
      query: { accountId }
    });
    console.log("Response Keys:", Object.keys(res.data as any));
    const data = res.data as any;
    if (data.messages) console.log("Has messages array. Length:", data.messages.length);
    else if (data.data) console.log("Has data array. Length:", data.data.length);
    else if (Array.isArray(data)) console.log("Is array. Length:", data.length);
    else console.log("Unknown format");
    
    // Dump first message to see structure
    const msgs = data.messages || data.data || (Array.isArray(data) ? data : []);
    if (msgs.length > 0) {
      console.log("First message:", JSON.stringify(msgs[0], null, 2));
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
