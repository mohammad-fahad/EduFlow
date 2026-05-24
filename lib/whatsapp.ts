export async function sendWhatsAppMessage(toPhone: string, message: string) {
  try {
    // এখানে আপনার ফ্রি হোয়াটসঅ্যাপ গেটওয়ের API URL এবং Token বসাবেন
    const API_URL = process.env.WHATSAPP_API_URL || "https://yourgateway.com";
    const INSTANCE_TOKEN = process.env.WHATSAPP_TOKEN;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: INSTANCE_TOKEN,
        to: toPhone.startsWith("+") ? toPhone : `+88${toPhone}`, 
        body: message,
      }),
    });

    const data = await response.json();
    return data.success || false;
  } catch (error) {
    console.error("WhatsApp Message Failed:", error);
    return false;
  }
}
