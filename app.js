// ==========================================
// Supabase
// ==========================================

const db = window.supabase.createClient(
  "https://hxqkjnyxzerioqpoxdxo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cWtqbnl4emVyaW9xcG94ZHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNjM4NDgsImV4cCI6MjA5NzgzOTg0OH0.tQBO2KljUf-_kJJQG4Bv4HBBZ5Leu4q0tvfJEtpX1jE"
);

// ==========================================
// Elements
// ==========================================

const overlay = document.getElementById("overlay");
const results = document.getElementById("results");

const music = document.getElementById("music");
const tickTemplate = document.getElementById("tick");

// ==========================================
// Helpers
// ==========================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// Intro Sequence
// ==========================================

overlay.addEventListener("click", async () => {

    overlay.style.pointerEvents = "none";

    music.volume = 0.35;

    try {
        await music.play();
    } catch (e) {
        console.error(e);
    }

    await sleep(300);

    overlay.style.opacity = "0";

    await sleep(300);

    overlay.remove();

    results.classList.remove("hidden");

    await revealLeaderboard();

});

// ==========================================
// Leaderboard
// ==========================================

async function revealLeaderboard() {

    const { data: players, error } = await db
        .from("users")
        .select("username, clicks")
        .order("clicks", {
            ascending: false
        });

    if (error) {
        console.error(error);
        return;
    }

    if (!players || players.length === 0)
        return;

    results.innerHTML = "";

    const cards = [];

    // Create every card in FINAL order.

    for (let i = 0; i < players.length; i++) {

        const card = document.createElement("div");

        card.className =
            i === 0
                ? "player winner"
                : "player";

        card.style.opacity = "0";

        card.style.transform =
            "translateY(30px) scale(.95)";

        card.innerHTML = `
            <div class="place">
                #${i + 1}
            </div>

            <div class="name">

                ${
                    i === 0
                        ? `<div class="winner-title">🏆</div>`
                        : ""
                }

                <div>${players[i].username}</div>

            </div>

            <div class="score">
                0
            </div>
        `;

        results.appendChild(card);

        cards.push({

            card,

            score:
                card.querySelector(".score"),

            clicks:
                players[i].clicks,

            winner:
                i === 0

        });

    }

    // Reveal from LAST place upward.

    for (
        let i = cards.length - 1;
        i >= 1;
        i--
    ) {

        cards[i].card.style.opacity = "1";

        cards[i].card.style.transform =
            "translateY(0) scale(1)";

        await animateScore(

            cards[i].score,

            cards[i].clicks,

            false

        );

        await sleep(180);

    }

    // Dramatic pause.

    await sleep(900);

    // Winner reveal.

    cards[0].card.style.opacity = "1";

    cards[0].card.style.transform =
        "translateY(0) scale(1.08)";

    cards[0].card.classList.add(
        "winner-show"
    );

    await animateScore(

        cards[0].score,

        cards[0].clicks,

        true

    );

}
// ==========================================
// Score Animation
// ==========================================

async function animateScore(
    element,
    target,
    winner
) {

    let current = 0;

    // Keep the animation around 2 seconds
    // regardless of the score.

    const frames = winner ? 140 : 90;

    const step = Math.max(
        1,
        Math.ceil(target / frames)
    );

    while (current < target) {

        current += step;

        if (current > target)
            current = target;

        element.textContent =
            current.toLocaleString();

        playTick();

        await sleep(
            winner
                ? 18
                : 14
        );

    }

}

// ==========================================
// Tick Sound
// ==========================================

function playTick() {

    const sound = tickTemplate.cloneNode();

    sound.volume = 0.12;

    sound.play().catch(() => {});

}

// ==========================================
// Winner Glow Pulse
// ==========================================

function pulseWinner(card) {

    let grow = true;

    setInterval(() => {

        if (grow) {

            card.style.transform =
                "translateY(0) scale(1.10)";

        } else {

            card.style.transform =
                "translateY(0) scale(1.06)";

        }

        grow = !grow;

    }, 900);

}

// ==========================================
// Winner Entrance
// ==========================================

function celebrateWinner() {

    const winner =
        document.querySelector(".winner");

    if (!winner)
        return;

    pulseWinner(winner);

}

// ==========================================
// Auto-start celebration
// ==========================================

const observer = new MutationObserver(() => {

    const winner =
        document.querySelector(".winner-show");

    if (winner) {

        celebrateWinner();

        observer.disconnect();

    }

});

observer.observe(results, {
    childList: true,
    subtree: true,
    attributes: true
});
