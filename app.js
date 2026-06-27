const db = window.supabase.createClient(
  "https://hxqkjnyxzerioqpoxdxo.supabase.co/",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cWtqbnl4emVyaW9xcG94ZHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNjM4NDgsImV4cCI6MjA5NzgzOTg0OH0.tQBO2KljUf-_kJJQG4Bv4HBBZ5Leu4q0tvfJEtpX1jE"
);

const overlay = document.getElementById("overlay");
const results = document.getElementById("results");

const music = document.getElementById("music");
const tickSound = document.getElementById("tick");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

overlay.addEventListener("click", async () => {
  overlay.style.pointerEvents = "none";

  music.volume = 0.35;
  music.play();

  await sleep(1000);

  overlay.style.opacity = "0";

  await sleep(600);

  overlay.remove();

  results.classList.remove("hidden");

  await revealLeaderboard();
});

async function revealLeaderboard() {

  const { data: players, error } = await db
    .from("users")
    .select("username, clicks")
    .order("clicks", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  results.innerHTML = "";

  // Reveal from last to second place first
  for (let i = players.length - 1; i >= 1; i--) {

    const player = players[i];

    const row = createPlayerCard(
      players.length - i,
      player.username,
      player.clicks,
      false
    );

    results.appendChild(row.card);

    requestAnimationFrame(() => {
      row.card.classList.add("show");
    });

    await animateScore(row.score, player.clicks);

    await sleep(180);
  }

  await sleep(1000);
    // WINNER (first place)

  const winner = players[0];

  const row = createPlayerCard(
    1,
    winner.username,
    winner.clicks,
    true
  );

  results.prepend(row.card);

  requestAnimationFrame(() => {
    row.card.classList.add("winner-show");
  });

  await animateScore(row.score, winner.clicks);
}

function createPlayerCard(place, username, clicks, winner) {

  const card = document.createElement("div");

  card.className = winner ? "player winner" : "player";

  const placeDiv = document.createElement("div");
  placeDiv.className = "place";
  placeDiv.textContent = "#" + place;

  const nameDiv = document.createElement("div");
  nameDiv.className = "name";

  if (winner) {
    nameDiv.innerHTML = `
      <div class="winner-title">🏆 WINNER</div>
      <div>${username}</div>
    `;
  } else {
    nameDiv.textContent = username;
  }

  const scoreDiv = document.createElement("div");
  scoreDiv.className = "score";
  scoreDiv.textContent = "0";

  card.append(placeDiv, nameDiv, scoreDiv);

  return { card, score: scoreDiv };
}

async function animateScore(element, target) {

  let current = 0;

  const step = Math.max(1, Math.ceil(target / 90));

  while (current < target) {

    current += step;

    if (current > target) current = target;

    element.textContent = current.toLocaleString();

    const s = tickSound.cloneNode();
    s.volume = 0.18;
    s.play().catch(() => {});

    await sleep(18);
  }
}