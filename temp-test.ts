import axios from 'axios';

async function testZAPI() {
  const baseUrl = "https://api.z-api.io/instances/3F1C861680DA72EB427EBE4FDF68D33E/token/0CEA4B462628E778BBA90230";
  try {
    const res = await axios.get(`${baseUrl}/status`);
    console.log("Success! Status:", res.data);
  } catch (error: any) {
    console.error("Failed!", error.response?.data || error.message);
  }
}

testZAPI();
