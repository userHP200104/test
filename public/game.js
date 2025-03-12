const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set the canvas size to match the window size.
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Each player is given a unique id which is stored in localStorage.
let playerId = localStorage.getItem("playerId") || Math.random().toString(36).substr(2, 9);
localStorage.setItem("playerId", playerId);

// Initialize player's starting position randomly.
let player = { id: playerId, x: Math.random() * canvas.width, y: Math.random() * canvas.height };

// Listen for arrow key presses to move the player.
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      player.y -= 5;
      break;
    case "ArrowDown":
      player.y += 5;
      break;
    case "ArrowLeft":
      player.x -= 5;
      break;
    case "ArrowRight":
      player.x += 5;
      break;
  }
  // Send the new position to the server.
  updatePlayer();
});

// Send the player’s position to the server.
async function updatePlayer() {
  await fetch("/api/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(player)
  });
}

// Get all players’ positions from the server.
async function getPlayers() {
  const res = await fetch("/api/players");
  return await res.json();
}

// Main game loop: clear the canvas and redraw all players.
async function gameLoop() {
  const players = await getPlayers();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  players.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
    // Draw your own player in blue; others in red.
    ctx.fillStyle = (p.id === playerId) ? "blue" : "red";
    ctx.fill();
    ctx.closePath();
  });
  requestAnimationFrame(gameLoop);
}

// Start the game loop and update the player’s initial position.
updatePlayer();
gameLoop();
