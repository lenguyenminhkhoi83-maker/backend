(async () => {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMGIzOTQwOWE1NDRmMGFlMTM4MDAzMSIsImlhdCI6MTc3OTEyMDQ0OCwiZXhwIjoxNzc5NzI1MjQ4fQ._iXSF9myUvrSiaTdTQyvJNbFcASNnoxK37KlWN-0kU4';
    const res = await fetch('http://localhost:3000/api/water-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ amount: 500 })
    });
    const text = await res.text();
    console.log(text);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
})();
