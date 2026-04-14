export async function getProducts() {
  let results = [];
  let cursor = 0;
  const limit = 100;

  while (true) {
    const res = await fetch(
      `${process.env.BUBBLE_API_URL}?limit=${limit}&cursor=${cursor}`,
      { headers: { Authorization: `Bearer ${process.env.BUBBLE_TOKEN}` } }
    );
    const data = await res.json();
    const batch = data.response.results;
    results = results.concat(batch);

    if (batch.length < limit) break; // son sayfa
    cursor += limit;
  }

  return results;
}