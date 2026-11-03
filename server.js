const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_FOOTBALL_KEY;
const API_HOST = process.env.API_FOOTBALL_HOST || "v3.football.api-sports.io";
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, configured: Boolean(API_KEY) });
});

app.get("/api/fixtures", async (req, res) => {
  if (!API_KEY) {
    return res.status(503).json({
      error: "API key is not configured. Add API_FOOTBALL_KEY in the hosting environment."
    });
  }

  const date = typeof req.query.date === "string" ? req.query.date : "";
  const league = typeof req.query.league === "string" ? req.query.league : "";
  const season = typeof req.query.season === "string" ? req.query.season : "";

  // Accept only YYYY-MM-DD dates to avoid passing arbitrary values upstream.
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "Use date format YYYY-MM-DD." });
  }

  const cacheKey = `${date}|${league}|${season}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
    return res.json(cached.data);
  }

  const params = new URLSearchParams();
  params.set("timezone", "Europe/Warsaw");
  if (date) params.set("date", date);
  if (league) params.set("league", league);
  if (season) params.set("season", season);
  if (!date && !league) {
    params.set("next", "20");
  }

  try {
    const upstream = await fetch(`https://${API_HOST}/fixtures?${params.toString()}`, {
      headers: { "x-apisports-key": API_KEY }
    });

    const payload = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: "Football API request failed.",
        details: payload.errors || payload.message || upstream.statusText
      });
    }

    if (payload.errors && Object.keys(payload.errors).length) {
      return res.status(502).json({ error: "Football API returned an error.", details: payload.errors });
    }

    const fixtures = (payload.response || []).map(item => ({
      id: item.fixture?.id,
      date: item.fixture?.date,
      timestamp: item.fixture?.timestamp,
      status: item.fixture?.status?.short,
      statusLong: item.fixture?.status?.long,
      elapsed: item.fixture?.status?.elapsed,
      venue: item.fixture?.venue?.name,
      league: {
        id: item.league?.id,
        name: item.league?.name,
        country: item.league?.country,
        logo: item.league?.logo,
        round: item.league?.round
      },
      home: {
        id: item.teams?.home?.id,
        name: item.teams?.home?.name,
        logo: item.teams?.home?.logo,
        winner: item.teams?.home?.winner
      },
      away: {
        id: item.teams?.away?.id,
        name: item.teams?.away?.name,
        logo: item.teams?.away?.logo,
        winner: item.teams?.away?.winner
      },
      goals: item.goals,
      score: item.score
    }));

    const result = { count: fixtures.length, fixtures };
    cache.set(cacheKey, { savedAt: Date.now(), data: result });
    res.set("Cache-Control", "public, max-age=60");
    res.json(result);
  } catch (error) {
    console.error("Fixtures error:", error);
    res.status(502).json({ error: "Could not reach the football data provider." });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Football Live server listening on ${PORT}`));
