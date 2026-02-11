const undraftedList = document.getElementById("undraftedList");
const teamsGrid = document.getElementById("teamsGrid");
const teamsEmpty = document.getElementById("teamsEmpty");
const pickOrderList = document.getElementById("pickOrderList");
const statusText = document.getElementById("statusText");

const playerTpl = document.getElementById("playerCardTpl");
const teamTpl = document.getElementById("teamCardTpl");

const addParticipantBtn = document.getElementById("addParticipantBtn");
const playerModal = document.getElementById("playerModal");
const playerModalClose = document.getElementById("playerModalClose");
const playerModalSave = document.getElementById("playerModalSave");
const modalTitle = document.getElementById("playerModalTitle");
const modalName = document.getElementById("modalName");
const modalTier = document.getElementById("modalTier");

const MAX_TEAM_SIZE = 5;
const MAX_MEMBER_SIZE = MAX_TEAM_SIZE - 1;

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
  { id: "p10", name: "Frostwhisper", tier: "Gold", lanes: [] },
  { id: "p6", name: "Lightstinger", tier: "Diamond", lanes: ["Top"] },
  { id: "p7", name: "Thrallson", tier: "Platinum", lanes: ["Jungle"] },
  { id: "p8", name: "Sylvanis", tier: "Diamond", lanes: ["Mid"] },
  { id: "p13", name: "Aetherion", tier: "Platinum", lanes: ["ADC"] },
  { id: "p14", name: "Moonward", tier: "Gold", lanes: ["Support"] },
  { id: "p11", name: "Doomhammer", tier: "Grandmaster", lanes: ["Jungle"] },
  { id: "p12", name: "Brightye", tier: "Master", lanes: ["Mid"] },
];

const teams = [
  { id: "t1", captainId: "p11", memberIds: ["p12", "p2", "p4", "p5"] },
  { id: "t2", captainId: "p6", memberIds: ["p7", "p8", "p13"] },
];

let editingPlayerId = null;

const modalLaneChecks = () =>
  playerModal ? Array.from(playerModal.querySelectorAll('.checks input[type="checkbox"]')) : [];

function getPlayer(playerId) {
  return players.find((player) => player.id === playerId) || null;
}

function getTeam(teamId) {
  return teams.find((team) => team.id === teamId) || null;
}

function lanesLabel(lanes) {
  if (!Array.isArray(lanes) || lanes.length === 0) return "ALL";
  const unique = Array.from(new Set(lanes));
  if (unique.length >= 5) return "ALL";
  return unique.map((lane) => LANE_ABBR[lane] || lane).join(" ");
}

function initials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function findPlayerAssignment(playerId) {
  for (const team of teams) {
    if (team.captainId === playerId) return { team, role: "captain" };

    const memberIndex = team.memberIds.indexOf(playerId);
    if (memberIndex >= 0) return { team, role: "member", memberIndex };
  }

  return null;
}

function removePlayerFromAnyTeam(playerId) {
  const assignment = findPlayerAssignment(playerId);
  if (!assignment) return;

  if (assignment.role === "captain") {
    assignment.team.captainId = null;
  } else {
    assignment.team.memberIds.splice(assignment.memberIndex, 1);
  }
}

function firstEmptyMemberIndex(team) {
  for (let i = 0; i < MAX_MEMBER_SIZE; i += 1) {
    if (!team.memberIds[i]) return i;
  }
  return -1;
}

function moveToCaptain(teamId, playerId) {
  const team = getTeam(teamId);
  const player = getPlayer(playerId);
  if (!team || !player) return;

  if (team.captainId && team.captainId !== playerId) {
    alert("Captain slot is already filled.");
    return;
  }

  removePlayerFromAnyTeam(playerId);
  team.captainId = playerId;
  rerenderAll();
}

function moveToMember(teamId, playerId, requestedIndex = null) {
  const team = getTeam(teamId);
  const player = getPlayer(playerId);
  if (!team || !player) return;

  if (team.memberIds.includes(playerId)) return;

  let slotIndex = typeof requestedIndex === "number" ? requestedIndex : firstEmptyMemberIndex(team);
  if (slotIndex < 0 || slotIndex >= MAX_MEMBER_SIZE) {
    alert("This team is already full (5 including captain).");
    return;
  }

  if (team.memberIds[slotIndex]) {
    const fallback = firstEmptyMemberIndex(team);
    if (fallback < 0) {
      alert("This team is already full (5 including captain).");
      return;
    }
    slotIndex = fallback;
  }

  removePlayerFromAnyTeam(playerId);

  const next = new Array(MAX_MEMBER_SIZE).fill(null);
  for (let i = 0; i < MAX_MEMBER_SIZE; i += 1) next[i] = team.memberIds[i] || null;
  next[slotIndex] = playerId;
  team.memberIds = next.filter(Boolean);

  rerenderAll();
}

function moveToUndrafted(playerId) {
  const player = getPlayer(playerId);
  if (!player) return;
  removePlayerFromAnyTeam(playerId);
  rerenderAll();
}

function bindDropZone(zone, onDrop) {
  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    zone.classList.add("drop-active");
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("drop-active");
  });

  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    zone.classList.remove("drop-active");
    const playerId = event.dataTransfer?.getData("text/plain");
    if (!playerId) return;
    onDrop(playerId);
  });
}

function renderPlayerCard(player) {
  const node = playerTpl.content.firstElementChild.cloneNode(true);
  node.dataset.playerId = player.id;
  node.draggable = true;

  const avatar = node.querySelector(".avatar");
  const nameEl = node.querySelector(".name");
  const tierEl = node.querySelector(".tier-badge");
  const lanesEl = node.querySelector(".lanes");

  if (avatar) avatar.textContent = initials(player.name);
  if (nameEl) nameEl.textContent = player.name;
  if (tierEl) tierEl.textContent = player.tier ?? "UNRANKED";
  if (lanesEl) lanesEl.textContent = lanesLabel(player.lanes);

  node.addEventListener("dragstart", (event) => {
    event.dataTransfer?.setData("text/plain", player.id);
    event.dataTransfer.effectAllowed = "move";
    node.classList.add("dragging");
  });

  node.addEventListener("dragend", () => {
    node.classList.remove("dragging");
  });

  const editBtn = node.querySelector(".edit");
  if (editBtn) {
    editBtn.type = "button";
    editBtn.addEventListener("click", () => {
      openPlayerModal({ mode: "edit", player });
    });
  }

  return node;
}

function renderUndrafted() {
  undraftedList.innerHTML = "";

  const drafted = new Set();
  for (const team of teams) {
    if (team.captainId) drafted.add(team.captainId);
    for (const memberId of team.memberIds) drafted.add(memberId);
  }

  for (const player of players) {
    if (!drafted.has(player.id)) undraftedList.appendChild(renderPlayerCard(player));
  }

  bindDropZone(undraftedList, moveToUndrafted);
}

function renderTeamCard(team) {
  const card = teamTpl.content.firstElementChild.cloneNode(true);
  card.dataset.teamId = team.id;

  const captainSlot = card.querySelector(".captain-slot");
  const captain = team.captainId ? getPlayer(team.captainId) : null;

  if (captainSlot) {
    captainSlot.innerHTML = "";
    captainSlot.classList.toggle("is-empty", !captain);

    if (captain) {
      captainSlot.appendChild(renderPlayerCard(captain));
    } else {
      captainSlot.textContent = "Drop captain here";
    }

    bindDropZone(captainSlot, (playerId) => moveToCaptain(team.id, playerId));
  }

  const members = card.querySelector(".members");
  const membersList = card.querySelector(".members-list");
  if (members) {
    bindDropZone(members, (playerId) => moveToMember(team.id, playerId));
  }

  if (membersList) {
    membersList.innerHTML = "";

    for (let i = 0; i < MAX_MEMBER_SIZE; i += 1) {
      const slot = document.createElement("div");
      slot.className = "member-slot";

      const memberId = team.memberIds[i];
      const member = memberId ? getPlayer(memberId) : null;

      if (member) {
        slot.appendChild(renderPlayerCard(member));
      } else {
        slot.classList.add("is-empty");
        slot.textContent = "Drop member here";
      }

      bindDropZone(slot, (playerId) => moveToMember(team.id, playerId, i));
      membersList.appendChild(slot);
    }
  }

  const removeBtn = card.querySelector(".team-remove");
  if (removeBtn) {
    removeBtn.type = "button";
    removeBtn.addEventListener("click", () => {
      alert(`(Demo) Remove team ${team.id}`);
    });
  }

  return card;
}

function renderTeams() {
  teamsGrid.innerHTML = "";

  if (teams.length === 0) {
    teamsEmpty.style.display = "block";
    return;
  }

  teamsEmpty.style.display = "none";
  for (const team of teams) teamsGrid.appendChild(renderTeamCard(team));
}

function renderPickOrder() {
  pickOrderList.innerHTML = "";
  for (const team of teams) {
    const captain = team.captainId ? getPlayer(team.captainId) : null;
    const row = document.createElement("div");
    row.style.fontSize = "12px";
    row.style.padding = "6px 0";
    row.textContent = captain ? captain.name : "(No captain)";
    pickOrderList.appendChild(row);
  }
}

function openPlayerModal({ mode, player } = {}) {
  if (!playerModal || !modalTitle || !modalName || !modalTier) return;

  editingPlayerId = mode === "edit" ? player.id : null;
  modalTitle.textContent = "Player";
  modalName.value = player?.name ?? "";
  modalTier.value = player?.tier ?? "UNRANKED";

  const selected = new Set(player?.lanes ?? []);
  for (const checkbox of modalLaneChecks()) checkbox.checked = selected.has(checkbox.value);

  playerModal.classList.add("open");
  playerModal.setAttribute("aria-hidden", "false");
  setTimeout(() => modalName.focus(), 0);
}

function closePlayerModal() {
  if (!playerModal) return;
  playerModal.classList.remove("open");
  playerModal.setAttribute("aria-hidden", "true");
  editingPlayerId = null;
}

function collectModalLanes() {
  return modalLaneChecks()
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
}

if (addParticipantBtn) {
  addParticipantBtn.addEventListener("click", () => openPlayerModal({ mode: "create" }));
}

if (playerModalClose) {
  playerModalClose.addEventListener("click", closePlayerModal);
}

if (playerModal) {
  playerModal.addEventListener("click", (event) => {
    if (event.target === playerModal) closePlayerModal();
  });
}

if (playerModalSave) {
  playerModalSave.addEventListener("click", () => {
    const name = modalName?.value.trim();
    if (!name) {
      alert("Name is required.");
      modalName?.focus();
      return;
    }

    const tier = modalTier?.value || "UNRANKED";
    const lanes = collectModalLanes();

    if (editingPlayerId) {
      const player = getPlayer(editingPlayerId);
      if (player) {
        player.name = name;
        player.tier = tier;
        player.lanes = lanes;
      }
    } else {
      const newId = `p${players.length + 1}_${Math.random().toString(16).slice(2, 6)}`;
      players.push({ id: newId, name, tier, lanes });
    }

    closePlayerModal();
    rerenderAll();
  });
}

window.addEventListener("keydown", (event) => {
  if (!playerModal) return;
  if (event.key === "Escape" && playerModal.classList.contains("open")) closePlayerModal();
});

function rerenderAll() {
  renderUndrafted();
  renderTeams();
  renderPickOrder();

  if (statusText) {
    const usedCount = teams.reduce((sum, team) => sum + (team.captainId ? 1 : 0) + team.memberIds.length, 0);
    const undraftedCount = players.length - usedCount;
    statusText.textContent = `Ready · ${teams.length} teams · ${players.length} players · ${undraftedCount} undrafted`;
  }
}

rerenderAll();
