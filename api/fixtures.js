module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=300");

  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "API key is missing",
      message: "Добавь API_FOOTBALL_KEY в настройках Vercel."
    });
  }

  try {
    const date = typeof req.query.date === "string"
      ? req.query.date
      : new Date().toLocaleDateString("en-CA", {
          timeZone: "Europe/Amsterdam"
        });

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        error: "Invalid date",
        message: "Используй формат YYYY-MM-DD."
      });
    }

    const url = new URL("https://v3.football.api-sports.io/fixtures");
    url.searchParams.set("date", date);
    url.searchParams.set("timezone", "Europe/Amsterdam");

    const response = await fetch(url, {
      headers: {
        "x-apisports-key": apiKey
      }
    });

    const data = await response.json();

    if (!response.ok || data.errors && Object.keys(data.errors).length) {
      return res.status(502).json({
        error: "Football API error",
        details: data.errors || data.message || "Ошибка API-Football"
      });
    }

    return res.status(200).json({
      date,
      results: data.response || [],
      count: (data.response || []).length
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      message: "Не удалось получить расписание матчей."
    });
  }
};
