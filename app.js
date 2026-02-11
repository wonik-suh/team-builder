// app.js (dummy render only)

const undraftedList = document.getElementById("undraftedList");
const teamsGrid = document.getElementById("teamsGrid");
const teamsEmpty = document.getElementById("teamsEmpty");
const pickOrderList = document.getElementById("pickOrderList");
const statusText = document.getElementById("statusText");

const playerTpl = document.getElementById("playerCardTpl");
const teamTpl = document.getElementById("teamCardTpl");
// modal elements
const addParticipantBtn = document.getElementById("addParticipantBtn");

const playerModal = document.getElementById("playerModal");
const playerModalClose = document.getElementById("playerModalClose");
const playerModalSave = document.getElementById("playerModalSave");

const modalTitle = document.getElementById("playerModalTitle");
const modalName = document.getElementById("modalName");
const modalTier = document.getElementById("modalTier");
const modalLaneChecks = () => Array.from(playerModal.querySelectorAll('.checks input[type="checkbox"]'));


// ---- Dummy data ----
const LANES = ["Top", "Jungle", "Mid", "ADC", "Support"];
const LANE_ABBR = {
  Top: "TOP",
  Jungle: "JGL",
  Mid: "MID",
  ADC: "ADC",
  Support: "SUP",
};

const players = [
    { id: "p2", name: "Shadowmend", tier: "Platinum", lanes: ["Mid", "Support"] },
    { id: "p4", name: "Ravencrest", tier: "Diamond", lanes: ["Jungle", "Mid"] },
    { id: "p5", name: "Bladefist", tier: "Platinum", lanes: ["Top", "Jungle"] },
    { id: "p9", name: "Stormclaw", tier: "Platinum", lanes: ["ADC", "Support"] },
    { id: "p10", name: "Frostwhisper", tier: "Gold", lanes: [] }, // ALL 테스트
  { id: "p6",  name: "Lightstinger",tier: "Diamond",  lanes: ["Top"] },
  { id: "p7",  name: "Thrallson",   tier: "Platinum", lanes: ["Jungle"] },
  { id: "p8",  name: "Sylvanis",    tier: "Diamond",  lanes: ["Mid"] },
  { id: "p13", name: "Aetherion",   tier: "Platinum", lanes: ["ADC"] },
  { id: "p14", name: "Moonward",    tier: "Gold",     lanes: ["Support"] },
  { id: "p11", name: "Doomhammer",  tier: "Grandmaster", lanes: ["Jungle"] },
  { id: "p12", name: "Brightye",    tier: "Master",   lanes: ["Mid"] },
];
let editingPlayerId = null; // null이면 create 모드

const teams = [
  {
    id: "t1",
    captainId: "p11",
    memberIds: ["p12", "p2", "p4", "p5"], // 4 members
  },
  {
    id: "t2",
    captainId: "p6",
    memberIds: ["p7", "p8", "p13", "p14"],
  },
];

// ---- helpers ----
function lanesLabel(lanes) {
  if (!Array.isArray(lanes) || lanes.length === 0) return "ALL";
  const unique = Array.from(new Set(lanes));
  if (unique.length >= 5) return "ALL";
  return unique.map(l => LANE_ABBR[l] || l).join(" ");
}

function initials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getPlayer(id) {
  return players.find(p => p.id === id) || null;
}
function openPlayerModal({ mode, player } = {}) {
  editingPlayerId = mode === "edit" ? player.id : null;

  modalTitle.textContent = "Player";
  modalName.value = player?.name ?? "";
  modalTier.value = player?.tier ?? "UNRANKED";

  // lanes 체크 세팅
  const lanes = new Set(player?.lanes ?? []);
  for (const cb of modalLaneChecks()) {
    cb.checked = lanes.has(cb.value);
  }

  playerModal.classList.add("open");
  playerModal.setAttribute("aria-hidden", "false");

  // focus
  setTimeout(() => modalName.focus(), 0);
}

function closePlayerModal() {
  playerModal.classList.remove("open");
  playerModal.setAttribute("aria-hidden", "true");
  editingPlayerId = null;
}

function collectModalLanes() {
  const lanes = modalLaneChecks().filter(cb => cb.checked).map(cb => cb.value);
  return lanes;
}

// ---- render: player card ----
function renderPlayerCard(player) {
  const node = playerTpl.content.firstElementChild.cloneNode(true);
  node.dataset.playerId = player.id;

  // avatar placeholder
  const avatar = node.querySelector(".avatar");
  if (avatar) avatar.textContent = initials(player.name);

  const nameEl = node.querySelector(".name");
  if (nameEl) nameEl.textContent = player.name;

  const tierEl = node.querySelector(".tier-badge");
  if (tierEl) tierEl.textContent = player.tier ?? "UNRANKED";

  const lanesEl = node.querySelector(".lanes");
  if (lanesEl) lanesEl.textContent = lanesLabel(player.lanes);

  // edit button (no functionality yet)
  const editBtn = node.querySelector(".edit");
  if (editBtn) {
    editBtn.type = "button";
    editBtn.addEventListener("click", () => {
    openPlayerModal({ mode: "edit", player });
    });
    }

  return node;
}

// ---- render: undrafted list ----
function renderUndrafted() {
  undraftedList.innerHTML = "";
  // For demo: show players not in any team
  const used = new Set();
  for (const t of teams) {
    used.add(t.captainId);
    t.memberIds.forEach(id => used.add(id));
  }
  const pool = players.filter(p => !used.has(p.id));

  for (const p of pool) undraftedList.appendChild(renderPlayerCard(p));
}

// ---- render: team card ----
function renderTeamCard(team) {
  const card = teamTpl.content.firstElementChild.cloneNode(true);
  card.dataset.teamId = team.id;

  // captain slot
const captainSlot = card.querySelector(".captain-slot");
const captain = getPlayer(team.captainId);

if (captainSlot) {
  captainSlot.innerHTML = "";
  captainSlot.classList.toggle("is-empty", !captain);

  if (captain) {
    captainSlot.appendChild(renderPlayerCard(captain));
  } else {
    captainSlot.textContent = "Drop captain here";
  }
}
  // ---- members (list + single dropzone) ----
const membersList = card.querySelector(".members-list");
const dropzone = card.querySelector(".member-dropzone");

// clear list
if (membersList) membersList.innerHTML = "";

// render only existing members
const members = (team.memberIds || [])
  .map(id => getPlayer(id))
  .filter(Boolean);

if (membersList) {
  for (const m of members) {
    const row = document.createElement("div");
    row.className = "member-row";
    row.appendChild(renderPlayerCard(m));
    membersList.appendChild(row);
  }
}

// show dropzone only if capacity not full
const isFull = members.length >= 4;
if (dropzone) {
  dropzone.style.display = isFull ? "none" : "flex";
}


  // optional: remove button demo
  const removeBtn = card.querySelector(".team-remove");
  if (removeBtn) {
    removeBtn.type = "button";
    removeBtn.addEventListener("click", () => {
      alert(`(Demo) Remove team ${team.id}`);
    });
  }

  return card;
}

// ---- render: teams grid ----
function renderTeams() {
  teamsGrid.innerHTML = "";
  if (teams.length === 0) {
    teamsEmpty.style.display = "block";
    return;
  }
  teamsEmpty.style.display = "none";

  for (const t of teams) {
    teamsGrid.appendChild(renderTeamCard(t));
  }
}

// ---- render: pick order ----
function renderPickOrder() {
  pickOrderList.innerHTML = "";
  for (const t of teams) {
    const captain = getPlayer(t.captainId);
    const div = document.createElement("div");
    div.textContent = captain ? captain.name : "(No captain)";
    div.style.fontSize = "12px";
    div.style.padding = "6px 0";
    pickOrderList.appendChild(div);
  }
}
if (addParticipantBtn) {
  addParticipantBtn.addEventListener("click", () => {
    openPlayerModal({ mode: "create" });
  });
}
playerModalClose.addEventListener("click", closePlayerModal);

playerModal.addEventListener("click", (e) => {
  if (e.target === playerModal) closePlayerModal(); // backdrop 클릭
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && playerModal.classList.contains("open")) {
    closePlayerModal();
  }
});
playerModalSave.addEventListener("click", () => {
  const name = modalName.value.trim();
  if (!name) {
    alert("Name is required.");
    modalName.focus();
    return;
  }

  const tier = modalTier.value;
  const lanes = collectModalLanes(); // []이면 ALL 의미

  if (editingPlayerId) {
    // edit
    const p = getPlayer(editingPlayerId);
    if (p) {
      p.name = name;
      p.tier = tier;
      p.lanes = lanes;
    }
  } else {
    // create
    const newId = "p" + (players.length + 1) + "_" + Math.random().toString(16).slice(2, 6);
    players.push({ id: newId, name, tier, lanes });
  }

  closePlayerModal();
  rerenderAll();
});

// ---- init ----
function rerenderAll() {
  renderUndrafted();
  renderTeams();
  renderPickOrder();

  if (statusText) {
    statusText.textContent = `Ready · ${teams.length} teams · ${players.length} players`;
  }
}

rerenderAll();
