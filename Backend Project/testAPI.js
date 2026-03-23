const axios = require('axios');

async function test() {
  try {
    // 1. Login to get Admin token
    const loginRes = await axios.post('http://127.0.0.1:8080/api/auth-temp/login', {
      Email: "admin1@fashionstyle.com",
      Password: "Admin@123"
    });
    const token = loginRes.data.token;
    console.log("Got token!");

    // 2. Test Overview API
    const authConfig = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const overviewRes = await axios.get('http://127.0.0.1:8080/api/stats/dashboard/overview', authConfig);
      console.log("Overview Data:", overviewRes.data);
    } catch(err) {
      console.error("Overview Error:", err.response ? err.response.data : err.message);
    }

    try {
      const chartsRes = await axios.get('http://127.0.0.1:8080/api/stats/dashboard/charts', authConfig);
      console.log("Charts Data:", chartsRes.data);
    } catch(err) {
      console.error("Charts Error:", err.response ? err.response.data : err.message);
    }

  } catch(e) {
    console.error("Login failed:", e.response ? e.response.data : e.message);
  }
}

test();
