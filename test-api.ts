import axios from 'axios';

async function testZAPI() {
  const baseUrl = "http://localhost:3000/api/automations/execute-now";
  try {
    const res = await axios.post(baseUrl, {
        automationId: "wppconnect-analyzer",
        config: {
            wppApiUrl: "https://api.z-api.io/instances/3F1C861680DA72EB427EBE4FDF68D33E",
            token: "0CEA4B462628E778BBA90230",
            targetNumber: "5511999999999"
        }
    });
    console.log("Success! Status:", res.data);
  } catch (error: any) {
    console.error("Failed!", error.response?.data || error.message);
  }
}

testZAPI();
