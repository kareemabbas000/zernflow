import Zernio from "@zernio/node";

const zernio = new Zernio({
  apiKey: "sk_c416f7cface10315cf689dffdf701cfdb32a86435af0ca1535b2d53abce3f52d"
});

async function main() {
  const accountId = "6a96304077555aae01748a4d";
  const convId = "1417415490291064"; // dokan_ward_96
  
  const res = await zernio.messages.getInboxConversationMessages({
    path: { conversationId: convId },
    query: { accountId },
  });

  console.log("DOKAN_WARD_MESSAGES:");
  console.log(JSON.stringify(res.data, null, 2));
}

main();
