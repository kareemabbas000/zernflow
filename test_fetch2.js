const Zernio = require("@zernio/node").default;
const zernio = new Zernio({ apiKey: "sk_c416f7cface10315cf689dffdf701cfdb32a86435af0ca1535b2d53abce3f52d" });

async function run() {
  const accountId = "6a96304077555aae01748a4d";
  for (const cid of ["1350637680032472", "6a96309e77555aae0174a042"]) {
    try {
      const res = await zernio.messages.getInboxConversationMessages({
        path: { conversationId: cid },
        query: { accountId }
      });
      console.log(`\n\n--- CID ${cid} ---`);
      console.log(JSON.stringify(res.data.messages, null, 2));
    } catch (err) {
      console.error(`Error for ${cid}:`, err.message);
    }
  }
}
run();
