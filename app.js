// =====================
// Helpers
// =====================
function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}
function initials(name) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "?";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}
function hashHue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 360;
}
function tierClass(tier) {
  const t = String(tier || "").toLowerCase();
  return "t-" + t.replace(/\s+/g, "");
}
function lanesToText(lanes) {
  if (!lanes || lanes.length === 0) return "—";
  const set = new Set(lanes.map(x => String(x).toUpperCase()));
  const required = ["TOP", "JGL", "MID", "ADC", "SUP"];
  if (required.every(x => set.has(x))) return "ALL";
  if (lanes.length === 1) return lanes[0];
  return lanes.join("/");
}

// ✅ N팀 스네이크: 0..N-1..0
function buildSnakeSeq(n) {
  if (n <= 1) return [0];
  const up = Array.from({ length: n }, (_, i) => i);
  const down = Array.from({ length: n }, (_, i) => n - 1 - i);
  return up.concat(down);
}

// =====================
// Parsing helpers (PASTE HERE)
// =====================
const LANE_KO_MAP = new Map([
  ["탑", "TOP"], ["top", "TOP"],
  ["정글", "JGL"], ["정글러", "JGL"], ["jg", "JGL"], ["jgl", "JGL"], ["jungle", "JGL"],
  ["미드", "MID"], ["mid", "MID"],
  ["원딜", "ADC"], ["adc", "ADC"], ["바텀", "ADC"], ["봇", "ADC"], ["bot", "ADC"],
  ["서폿", "SUP"], ["서포터", "SUP"], ["서포트", "SUP"], ["sup", "SUP"], ["support", "SUP"]
]);

const TIER_KO_MAP = new Map([
  ["아이언", "Iron"], ["iron", "Iron"],
  ["브론즈", "Bronze"], ["bronze", "Bronze"],
  ["실버", "Silver"], ["silver", "Silver"],
  ["골드", "Gold"], ["gold", "Gold"],
  // ✅ 플레티넘 = Platinum
  ["플레", "Platinum"], ["플래", "Platinum"], ["플래티넘", "Platinum"], ["플레티넘", "Platinum"], ["platinum", "Platinum"],
  ["에메", "Emerald"], ["에메랄드", "Emerald"], ["emerald", "Emerald"],
  ["다이아", "Diamond"], ["다이아몬드", "Diamond"], ["diamond", "Diamond"],
  ["마스터", "Master"], ["master", "Master"],
  ["그마", "Grandmaster"], ["그랜드마스터", "Grandmaster"], ["grandmaster", "Grandmaster"],
  ["챌", "Challenger"], ["챌린저", "Challenger"], ["challenger", "Challenger"],
]);

const TIER_ORDER_HIGH_TO_LOW = [
  "Challenger",
  "Grandmaster",
  "Master",
  "Diamond",
  "Emerald",
  "Platinum",
  "Gold",
  "Silver",
  "Bronze",
  "Iron",
];

function tierRank(tier) {
  const t = String(tier ?? "").trim();
  const idx = TIER_ORDER_HIGH_TO_LOW.indexOf(t);
  return idx === -1 ? 999 : idx; // unknown = 맨 아래
}

function normalizeTier(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "Gold";
  const key = s.toLowerCase().replace(/\s+/g, "");
  for (const [k, v] of TIER_KO_MAP.entries()) {
    if (key === String(k).toLowerCase().replace(/\s+/g, "")) return v;
  }
  const english = ["Iron","Bronze","Silver","Gold","Platinum","Emerald","Diamond","Master","Grandmaster","Challenger"];
  const found = english.find(t => t.toLowerCase() === key);
  return found ?? s;
}

function parseLanes(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return ["—"];

  const key = s.toLowerCase().replace(/\s+/g, "");
  if (key === "all" || key === "올" || key === "전체") {
    return ["TOP","JGL","MID","ADC","SUP"];
  }

  const tokens = s
    .split(/[,\|\/\+\&\s]+/g)
    .map(t => t.trim())
    .filter(Boolean);

  const lanes = [];
  for (const tok of tokens) {
    const k = tok.toLowerCase().replace(/\s+/g, "");
    let mapped = null;
    for (const [mk, mv] of LANE_KO_MAP.entries()) {
      if (k === String(mk).toLowerCase().replace(/\s+/g, "")) {
        mapped = mv;
        break;
      }
    }
    lanes.push(mapped ?? tok);
  }

  const set = new Set(lanes.map(x => String(x).toUpperCase()));
  const required = ["TOP", "JGL", "MID", "ADC", "SUP"];
  if (required.every(x => set.has(x))) return required;

  return lanes.map(x => {
    const u = String(x).toUpperCase();
    if (["TOP","JGL","MID","ADC","SUP"].includes(u)) return u;
    return String(x);
  });
}

function parsePasteText(text) {
  const lines = String(text ?? "")
    .replace(/\r/g, "")
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const created = [];
  for (const line of lines) {
    const parts = line.split("/").map(x => x.trim());

    // ✅ 닉네임 앞 @ 제거
    const rawName = parts[0] ?? "";
    const name = rawName.replace(/^@+/, "").trim();

    const tierRaw = parts[1] ?? "";
    const laneRaw = parts[2] ?? "";

    if (!name) continue;

    const tier = normalizeTier(tierRaw);
    const lanes = parseLanes(laneRaw);

    created.push({ id: uid(), name, lanes, tier });
  }
  return created;
}

// =====================
// Export helpers (Korean copy)
// =====================
function tierToKorean(tier) {
  const t = String(tier ?? "").trim().toLowerCase();

  if (t === "iron") return "아이언";
  if (t === "bronze") return "브론즈";
  if (t === "silver") return "실버";
  if (t === "gold") return "골드";
  if (t === "platinum") return "플레티넘";
  if (t === "emerald") return "에메랄드";
  if (t === "diamond") return "다이아";
  if (t === "master") return "마스터";
  if (t === "grandmaster") return "그마";
  if (t === "challenger") return "챌";

  // 애매하면 원문 그대로
  return String(tier ?? "");
}

function laneTokenToKorean(tok) {
  const u = String(tok ?? "").toUpperCase().trim();
  if (u === "TOP") return "탑";
  if (u === "JGL") return "정글";
  if (u === "MID") return "미드";
  if (u === "ADC") return "원딜";
  if (u === "SUP") return "서폿";
  if (u === "ALL") return "ALL";
  return String(tok ?? "");
}
function lanesToKoreanText(lanes) {
  const t = lanesToText(lanes);
  if (t === "ALL") return "ALL";
  if (!t || t === "—") return "—";

  // 기존 join("/") → join(", ")
  return t.split("/").map(laneTokenToKorean).join(", ");
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // fallback
    window.prompt("복사하세요:", text);
  }
}

// =====================
// State (✅ 기본 더미 카드 삭제)
// =====================
const state = {
  participants: [], // ✅ empty by default
  teams: [],        // { id, captainId, slots:[pid|null] }
  teamOrder: [],    // pick order list of teamIds
  draft: {
    active: false,
    turn: 0,
    history: [],        // ✅ undo 스택 (draft 중 픽 하드락)
    lastPickedPid: null // ✅ 마지막으로 픽된 플레이어 pid
  }
};

// =====================
// DOM
// =====================
const participantsList = document.getElementById("participantsList");
const totalCount = document.getElementById("totalCount");
const draftStatePill = document.getElementById("draftStatePill");
const pasteZone = document.getElementById("pasteZone");

const captainDropZone = document.getElementById("captainDropZone");
const teamsGrid = document.getElementById("teamsGrid");
const pickOrder = document.getElementById("pickOrder");

const btnToggleDraftTop = document.getElementById("btnToggleDraftTop");
const btnToggleDraftBottom = document.getElementById("btnToggleDraftBottom");
const btnCopyKorean = document.getElementById("btnCopyKorean");

// Add modal
const modalBackdrop = document.getElementById("modalBackdrop");
const btnOpenAdd = document.getElementById("btnOpenAdd");
const btnCloseAdd = document.getElementById("btnCloseAdd");
const btnCancelAdd = document.getElementById("btnCancelAdd");
const addForm = document.getElementById("addForm");
const inpName = document.getElementById("inpName");
const inpTier = document.getElementById("inpTier");
const laneGrid = document.getElementById("laneGrid");

// =====================
// Derived
// =====================
function getParticipant(pid) {
  return state.participants.find(p => p.id === pid);
}

function isPicked(pid) {
  for (const t of state.teams) {
    if (t.captainId === pid) return true;
    if (t.slots.includes(pid)) return true;
  }
  return false;
}

function allSlotsFilled() {
  if (state.teams.length === 0) return false;
  for (const t of state.teams) {
    if (t.slots.some(x => x === null)) return false;
  }
  return true;
}

function getActiveTeamId() {
  if (!state.draft.active) return null;
  const n = state.teamOrder.length;
  if (n === 0) return null;

  const seq = buildSnakeSeq(n);
  const idx = seq[state.draft.turn % seq.length];
  return state.teamOrder[idx];
}
function getHighlightPickCount() {
  if (!state.draft.active) return 0;

  const n = state.teamOrder.length;
  if (n === 0) return 0;

  const seq = buildSnakeSeq(n);
  const len = seq.length;

  const curIdx = seq[state.draft.turn % len];
  const nextIdx = seq[(state.draft.turn + 1) % len];

  // 같은 팀이 연속으로 픽하는 구간이면 2칸 하이라이트
  return curIdx === nextIdx ? 2 : 1;
}


// =====================
// Draft toggle + auto-end
// =====================
function setDraftActive(on) {
  state.draft.active = on;

  if (on) {
    state.draft.turn = 0;
    // ✅ 하드락 undo를 위한 스냅샷 스택 초기화
    state.draft.history = [];
    state.draft.lastPickedPid = null;
  } else {
    // draft 종료 시 안전하게 초기화
    state.draft.history = [];
    state.draft.lastPickedPid = null;
  }

  btnToggleDraftTop.textContent = on ? "End Draft" : "Start Draft";
  btnToggleDraftBottom.textContent = on ? "End Draft" : "Start Draft";
  draftStatePill.textContent = on ? "Draft: ON" : "Draft: Off";
}

function maybeAutoEndDraft() {
  if (!state.draft.active) return;
  if (allSlotsFilled()) {
    setDraftActive(false);
    // 이미 setDraftActive(false)에서 history/lastPickedPid 정리하지만, 명시적으로 한 번 더
    state.draft.history = [];
    state.draft.lastPickedPid = null;
  }
}

// =====================
// Render
// =====================
function render() {
  renderParticipants();
  renderTeams();
  renderPickOrder();
  maybeAutoEndDraft();
}

function renderParticipants() {
  // ✅ 팀 섹션에 들어간 순간(팀장/팀원) 리스트에서 제거
  // ✅ 항상 티어순(높→낮) 자동정렬
  const list = state.participants
    .filter(p => !isPicked(p.id))
    .sort((a, b) => {
      const ra = tierRank(a.tier);
      const rb = tierRank(b.tier);
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name, "ko");
    });

  totalCount.textContent = `${list.length} available`;

  participantsList.innerHTML = "";
  if (list.length === 0) {
    participantsList.innerHTML = `<div class="mutedText small" style="padding:10px 6px;">No available players.</div>`;
    return;
  }
  for (const p of list) {
    participantsList.appendChild(participantCard(p));
  }
}

function renderTeams() {
  teamsGrid.innerHTML = "";
  const activeTeamId = getActiveTeamId();

  for (const teamId of state.teamOrder) {
    const team = state.teams.find(t => t.id === teamId);
    if (!team) continue;

    const card = teamCard(team, activeTeamId);
    teamsGrid.appendChild(card);
  }
}

function renderPickOrder() {
  pickOrder.innerHTML = "";

  if (state.teamOrder.length === 0) {
    pickOrder.innerHTML = `<div class="mutedText small">Create teams by dropping captains first.</div>`;
    return;
  }

  const activeTeamId = getActiveTeamId();
  for (const teamId of state.teamOrder) {
    const team = state.teams.find(t => t.id === teamId);
    if (!team) continue;
    pickOrder.appendChild(pickRow(team, activeTeamId));
  }
}

// =====================
// UI Components
// =====================
function avatarEl(name) {
  const a = document.createElement("div");
  a.className = "avatar";
  a.textContent = initials(name);
  a.style.background = `hsl(${hashHue(name)} 70% 55%)`;
  return a;
}

function participantCard(p) {
  const card = document.createElement("div");
  card.className = "pCard clickable draggable";
  card.dataset.pid = p.id;
  card.draggable = true;

  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", p.id);
    e.dataTransfer.effectAllowed = "move";
  });

  // 클릭 픽은 Draft ON일 때만
  card.addEventListener("click", () => {
    if (!state.draft.active) return;
    const teamId = getActiveTeamId();
    if (!teamId) return;

    // ✅ 픽 직전 상태 저장 (undo 하드락)
    pushDraftSnapshot();

    const didPick = pickToFirstEmptySlot(p.id, teamId);
    if (!didPick) {
      // 실패하면 방금 저장한 스냅샷 제거
      state.draft.history.pop();
      return;
    }

    // ✅ 마지막 픽 기록
    state.draft.lastPickedPid = p.id;

    state.draft.turn += 1;
    render();
  });

  const left = document.createElement("div");
  left.className = "pLeft";
  left.appendChild(avatarEl(p.name));

  const meta = document.createElement("div");
  meta.className = "pMeta";

  const name = document.createElement("div");
  name.className = "pName";
  name.textContent = p.name;

  const sub = document.createElement("div");
  sub.className = "pSub";
  sub.textContent = lanesToText(p.lanes);

  meta.appendChild(name);
  meta.appendChild(sub);
  left.appendChild(meta);

  const right = document.createElement("div");
  right.style.display = "flex";
  right.style.alignItems = "center";
  right.style.gap = "8px";

  const badge = document.createElement("div");
  badge.className = `badge ${tierClass(p.tier)}`;
  badge.textContent = p.tier;

  // ✅ participant에서도 remove (작은 x)
  const removeBtn = document.createElement("button");
  removeBtn.className = "xBtn";
  removeBtn.type = "button";
  removeBtn.textContent = "✕";
  removeBtn.title = "Remove participant";
  removeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    removeParticipant(p.id);
    render();
  });

  // ✅ 항상 EDIT
  const editBtn = document.createElement("button");
  editBtn.className = "miniBtn";
  editBtn.type = "button";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openEditModal(p.id);
  });

  right.appendChild(badge);
  right.appendChild(editBtn);
  right.appendChild(removeBtn);

  card.appendChild(left);
  card.appendChild(right);
  return card;
}

function teamCard(team, activeTeamId) {
  const captain = getParticipant(team.captainId);

  const card = document.createElement("div");
  card.className = "teamCard";
  if (state.draft.active && team.id === activeTeamId) card.classList.add("activePick");

  const header = document.createElement("div");
  header.className = "teamHeader";

  const left = document.createElement("div");
  left.className = "teamHeaderLeft";
  left.appendChild(avatarEl(captain?.name ?? "Captain"));

  const meta = document.createElement("div");
  meta.className = "pMeta";

  const name = document.createElement("div");
  name.className = "pName";
  name.textContent = captain?.name ?? "Unknown";

  const sub = document.createElement("div");
  sub.className = "pSub";
  sub.textContent = captain ? lanesToText(captain.lanes) : "";

  meta.appendChild(name);
  meta.appendChild(sub);
  left.appendChild(meta);

  const right = document.createElement("div");
  right.className = "teamHeaderRight";

  const tierBadge = document.createElement("div");
  tierBadge.className = `badge ${tierClass(captain?.tier)}`;
  tierBadge.textContent = captain?.tier ?? "";

  const editCaptainBtn = document.createElement("button");
  editCaptainBtn.className = "miniBtn";
  editCaptainBtn.type = "button";
  editCaptainBtn.textContent = "Edit";
  editCaptainBtn.addEventListener("click", () => {
    if (captain) openEditModal(captain.id);
  });

  const removeTeamBtn = document.createElement("button");
  removeTeamBtn.className = "xBtn";
  removeTeamBtn.type = "button";
  removeTeamBtn.textContent = "✕";
  removeTeamBtn.title = "Remove team";
  removeTeamBtn.addEventListener("click", () => {
    removeTeam(team.id);
    render();
  });

  right.appendChild(tierBadge);
  right.appendChild(editCaptainBtn);
  right.appendChild(removeTeamBtn);

  header.appendChild(left);
  header.appendChild(right);

  const slotsWrap = document.createElement("div");
  slotsWrap.className = "teamSlots";

  for (let i = 0; i < team.slots.length; i++) {
    slotsWrap.appendChild(slotEl(team.id, i, team.slots[i]));
  }

  card.appendChild(header);
  card.appendChild(slotsWrap);
  return card;
}

function slotEl(teamId, slotIndex, pidOrNull) {
  const slot = document.createElement("div");
  slot.className = "slot";

  const left = document.createElement("div");
  left.className = "slotLeft";

  const icon = document.createElement("div");
  icon.className = "slotIcon";
  icon.textContent = "👤";
  left.appendChild(icon);

  const text = document.createElement("div");
  text.className = "slotText";

  const name = document.createElement("div");
  name.className = "slotName";

  const sub = document.createElement("div");
  sub.className = "slotSub";

  const right = document.createElement("div");
  right.className = "slotRight";
  // ✅ 현재 턴에서 뽑아야 할 슬롯 하이라이트
  if (state.draft.active) {
  const activeTeamId = getActiveTeamId();

  if (teamId === activeTeamId && pidOrNull === null) {
    const team = state.teams.find(t => t.id === teamId);
    if (team) {
      const k = getHighlightPickCount(); // 1 또는 2

      // 빈 슬롯 index들
      const emptyIdxs = [];
      for (let i = 0; i < team.slots.length; i++) {
        if (team.slots[i] === null) emptyIdxs.push(i);
      }

      // 이번 턴에 하이라이트할 슬롯들(첫 k개)
      const toHighlight = emptyIdxs.slice(0, k);
      if (toHighlight.includes(slotIndex)) {
        slot.classList.add("nextPickSlot");
      }
    }
  }
}



  if (pidOrNull) {
    const p = getParticipant(pidOrNull);

    name.textContent = p?.name ?? "Unknown";
    // ✅ 이름 아래는 라인만
    sub.textContent = lanesToText(p?.lanes);

    const badge = document.createElement("div");
    badge.className = `badge ${tierClass(p?.tier)}`;
    badge.textContent = p?.tier ?? "";
    right.appendChild(badge);

    const editBtn = document.createElement("button");
    editBtn.className = "miniBtn";
    editBtn.type = "button";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openEditModal(pidOrNull));
    right.appendChild(editBtn);
    

// ✅ Draft ON일 때는 "마지막 픽"만 취소 가능
  if (!state.draft.active || state.draft.lastPickedPid === pidOrNull) {

    const x = document.createElement("button");
    x.className = "xBtn";
    x.classList.add("xUndo"); // ✅ 취소 가능한 X 강조
    x.type = "button";
    x.textContent = "✕";
    x.title = "Undo last pick";

    x.addEventListener("click", () => {

      if (state.draft.active) {
      // Draft ON → undo 방식만 허용
        const ok = undoLastPick();
        if (!ok) return;
      }   else {
      // Draft OFF → 자유 삭제
        clearSlot(teamId, slotIndex);
      }

      render();
    });

  right.appendChild(x);
  
}

  } else {
    name.textContent = "Empty";
    sub.textContent = "—";
  }

  text.appendChild(name);
  text.appendChild(sub);
  left.appendChild(text);

  slot.appendChild(left);
  slot.appendChild(right);

  // Draft ON일 때만 drop 허용
  if (state.draft.active) {
    slot.addEventListener("dragover", (e) => {
      e.preventDefault();
      slot.classList.add("dragOver");
      e.dataTransfer.dropEffect = "move";
    });
    slot.addEventListener("dragleave", () => slot.classList.remove("dragOver"));
    slot.addEventListener("drop", (e) => {
      e.preventDefault();
      slot.classList.remove("dragOver");

      const payload = e.dataTransfer.getData("text/plain");
      if (!payload || payload.startsWith("order:")) return;

      const pid = payload;
      if (isPicked(pid)) return;

      // ✅ 픽 직전 상태 저장 (undo 하드락)
      pushDraftSnapshot();

      const ok = assignToSpecificSlot(pid, teamId, slotIndex);
      if (!ok) {
        state.draft.history.pop();
        return;
      }

      // ✅ 마지막 픽 기록
      state.draft.lastPickedPid = pid;

      state.draft.turn += 1;
      render();
    });
  }

  return slot;
}

function pickRow(team, activeTeamId) {
  const captain = getParticipant(team.captainId);

  const row = document.createElement("div");
  row.className = "pCard draggable";
  row.draggable = true;
  row.dataset.teamid = team.id;

  if (state.draft.active && team.id === activeTeamId) row.classList.add("activePick");

  row.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", `order:${team.id}`);
    e.dataTransfer.effectAllowed = "move";
  });

  row.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  });

  row.addEventListener("drop", (e) => {
    e.preventDefault();
    const payload = e.dataTransfer.getData("text/plain");
    if (!payload?.startsWith("order:")) return;

    const draggedTeamId = payload.split(":")[1];
    const targetTeamId = row.dataset.teamid;
    if (!draggedTeamId || !targetTeamId || draggedTeamId === targetTeamId) return;

    reorderTeamOrder(draggedTeamId, targetTeamId);
    render();
  });

  const left = document.createElement("div");
  left.className = "pLeft";
  left.appendChild(avatarEl(captain?.name ?? "C"));

  const meta = document.createElement("div");
  meta.className = "pMeta";

  const name = document.createElement("div");
  name.className = "pName";
  name.textContent = captain?.name ?? "Unknown";

  meta.appendChild(name);
  left.appendChild(meta);

  const right = document.createElement("div");
  right.style.display = "flex";
  right.style.alignItems = "center";
  right.style.gap = "8px";

  // ✅ Pick order에서도 EDIT 가능(팀장 편집)
  const editBtn = document.createElement("button");
  editBtn.className = "miniBtn";
  editBtn.type = "button";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (captain) openEditModal(captain.id);
  });
  right.appendChild(editBtn);

  row.appendChild(left);
  row.appendChild(right);
  return row;
}

// =====================
// Draft undo hardlock helpers
// =====================
function deepCloneTeams(teams) {
  return teams.map(t => ({
    id: t.id,
    captainId: t.captainId,
    slots: [...t.slots],
  }));
}

// 픽 성공 직전에 호출: 되돌릴 수 있게 현재 상태를 스택에 저장
function pushDraftSnapshot() {
  if (!state.draft.active) return;
  state.draft.history.push({
    turn: state.draft.turn,
    teams: deepCloneTeams(state.teams),
    lastPickedPid: state.draft.lastPickedPid,
  });
}

// 마지막 픽만 취소(undo) 가능: 스택에서 1개 pop해서 복원
function undoLastPick() {
  const snap = state.draft.history.pop();
  if (!snap) return false;

  state.draft.turn = snap.turn;
  state.teams = snap.teams;
  state.draft.lastPickedPid = snap.lastPickedPid;

  return true;
}

// =====================
// Operations
// =====================
function removeParticipant(pid) {
  // participants list에는 원래 isPicked가 없는 사람만 나오지만, 안전 체크
  if (isPicked(pid)) return;
  state.participants = state.participants.filter(p => p.id !== pid);
}

function createTeamWithCaptain(captainId) {
  if (isPicked(captainId)) return;
  const team = { id: uid(), captainId, slots: [null, null, null, null] };
  state.teams.push(team);
  state.teamOrder.push(team.id);
}

function removeTeam(teamId) {
  const idx = state.teams.findIndex(t => t.id === teamId);
  if (idx === -1) return;

  state.teams.splice(idx, 1);
  state.teamOrder = state.teamOrder.filter(id => id !== teamId);

  if (state.draft.active) {
    state.draft.turn = 0;
    if (state.teamOrder.length === 0) setDraftActive(false);
  }
}

function reorderTeamOrder(draggedTeamId, targetTeamId) {
  const arr = [...state.teamOrder];
  const from = arr.indexOf(draggedTeamId);
  const to = arr.indexOf(targetTeamId);
  if (from === -1 || to === -1) return;

  arr.splice(from, 1);
  arr.splice(to, 0, draggedTeamId);
  state.teamOrder = arr;
  if (state.draft.active) state.draft.turn = 0;
}

function clearSlot(teamId, slotIndex) {
  const team = state.teams.find(t => t.id === teamId);
  if (!team) return;
  team.slots[slotIndex] = null;
}

function pickToFirstEmptySlot(pid, teamId) {
  const team = state.teams.find(t => t.id === teamId);
  if (!team) return false;
  if (isPicked(pid)) return false;

  const empty = team.slots.findIndex(x => x === null);
  if (empty === -1) return false;

  team.slots[empty] = pid;
  return true;
}

function assignToSpecificSlot(pid, teamId, slotIndex) {
  const team = state.teams.find(t => t.id === teamId);
  if (!team) return false;
  if (isPicked(pid)) return false;
  if (team.slots[slotIndex] !== null) return false;

  team.slots[slotIndex] = pid;
  return true;
}

// =====================
// Captain drop zone
// =====================
captainDropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  captainDropZone.classList.add("dragOver");
});
captainDropZone.addEventListener("dragleave", () => captainDropZone.classList.remove("dragOver"));
captainDropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  captainDropZone.classList.remove("dragOver");

  const pid = e.dataTransfer.getData("text/plain");
  if (!pid || pid.startsWith("order:")) return;
  if (isPicked(pid)) return;

  createTeamWithCaptain(pid);
  render();
});

// =====================
// Paste zone
// =====================
pasteZone.addEventListener("paste", (e) => {
  const text = e.clipboardData?.getData("text/plain") ?? "";
  if (!text) return;
  e.preventDefault();

  const created = parsePasteText(text);
  if (created.length === 0) return;

  const existingNames = new Set(state.participants.map(p => p.name.trim()));
  const unique = created.filter(p => !existingNames.has(p.name.trim()));

  state.participants.unshift(...unique);
  render();
});

// =====================
// Copy Korean result
// =====================
btnCopyKorean?.addEventListener("click", async () => {
  const blocks = [];

  const teams = state.teamOrder.map(id => state.teams.find(t => t.id === id)).filter(Boolean);
  for (let i = 0; i < teams.length; i++) {
    const t = teams[i];
    blocks.push(`팀${i + 1}`);

    const captain = getParticipant(t.captainId);
    if (captain) {
      blocks.push(`${captain.name}/${tierToKorean(captain.tier)}/${lanesToKoreanText(captain.lanes)}`);

    }

    for (const pid of t.slots) {
      if (!pid) continue;
      const p = getParticipant(pid);
      if (!p) continue;
      blocks.push(`${p.name}/${tierToKorean(p.tier)}/${lanesToKoreanText(p.lanes)}`);

    }

    blocks.push(""); // blank line between teams
  }

  const out = blocks.join("\n").trim() + "\n";
  await copyToClipboard(out);
});

// =====================
// Draft toggle
// =====================
btnToggleDraftTop.addEventListener("click", toggleDraft);
btnToggleDraftBottom.addEventListener("click", toggleDraft);

function toggleDraft() {
  if (state.teamOrder.length === 0) return;
  setDraftActive(!state.draft.active);
  render();
}

// =====================
// Add modal
// =====================
btnOpenAdd.addEventListener("click", openAddModal);
btnCloseAdd.addEventListener("click", closeAddModal);
btnCancelAdd.addEventListener("click", closeAddModal);
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeAddModal();
});

addForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = inpName.value.trim();
  const tier = inpTier.value;

  const lanes = Array.from(laneGrid.querySelectorAll('input[type="checkbox"]'))
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  if (!name || !tier || lanes.length === 0) return;

  state.participants.unshift({ id: uid(), name, lanes, tier });
  addForm.reset();
  closeAddModal();
  render();
});

function openAddModal() {
  modalBackdrop.classList.remove("hidden");
  setTimeout(() => inpName.focus(), 0);
}
function closeAddModal() {
  modalBackdrop.classList.add("hidden");
}

// =====================
// Global Edit Modal (injected)
// =====================
let editBackdrop = null;

function openEditModal(pid) {
  const p = getParticipant(pid);
  if (!p) return;

  if (!editBackdrop) {
    editBackdrop = document.createElement("div");
    editBackdrop.className = "modalBackdrop";
    editBackdrop.style.display = "none";
    editBackdrop.innerHTML = `
      <div class="modal">
        <div class="modalHeader">
          <div class="modalTitle">Edit Participant</div>
          <button id="btnCloseEdit" class="iconBtn" aria-label="Close">✕</button>
        </div>

        <form id="editForm" class="form">
          <label class="field">
            <span>Nickname</span>
            <input id="editName" type="text" required />
          </label>

          <div class="field">
            <span>Lanes (multi-select)</span>
            <div class="laneGrid" id="editLaneGrid">
              <label class="laneOpt"><input type="checkbox" value="TOP" /> TOP</label>
              <label class="laneOpt"><input type="checkbox" value="JGL" /> JGL</label>
              <label class="laneOpt"><input type="checkbox" value="MID" /> MID</label>
              <label class="laneOpt"><input type="checkbox" value="ADC" /> ADC</label>
              <label class="laneOpt"><input type="checkbox" value="SUP" /> SUP</label>
            </div>
          </div>

          <label class="field">
            <span>Tier</span>
            <select id="editTier" required>
              <option>Iron</option>
              <option>Bronze</option>
              <option>Silver</option>
              <option>Gold</option>
              <option>Platinum</option>
              <option>Emerald</option>
              <option>Diamond</option>
              <option>Master</option>
              <option>Grandmaster</option>
              <option>Challenger</option>
            </select>
          </label>

          <div class="formActions">
            <button type="button" id="btnCancelEdit" class="secondaryBtn">Cancel</button>
            <button type="submit" class="primaryBtn">Save</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(editBackdrop);

    editBackdrop.addEventListener("click", (e) => {
      if (e.target === editBackdrop) closeEditModal();
    });

    editBackdrop.querySelector("#btnCloseEdit").addEventListener("click", closeEditModal);
    editBackdrop.querySelector("#btnCancelEdit").addEventListener("click", closeEditModal);

    editBackdrop.querySelector("#editForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const pid = editBackdrop.dataset.pid;
      const p = getParticipant(pid);
      if (!p) return;

      const newName = editBackdrop.querySelector("#editName").value.trim();
      const newTier = editBackdrop.querySelector("#editTier").value;

      const newLanes = Array.from(editBackdrop.querySelectorAll('#editLaneGrid input[type="checkbox"]'))
        .filter(cb => cb.checked)
        .map(cb => cb.value);

      if (!newName || !newTier || newLanes.length === 0) return;

      p.name = newName;
      p.tier = newTier;
      p.lanes = newLanes;

      closeEditModal();
      render();
    });
  }

  editBackdrop.dataset.pid = pid;
  editBackdrop.querySelector("#editName").value = p.name;
  editBackdrop.querySelector("#editTier").value = normalizeTier(p.tier);

  for (const cb of editBackdrop.querySelectorAll('#editLaneGrid input[type="checkbox"]')) {
    cb.checked = Array.isArray(p.lanes) && p.lanes.includes(cb.value);
  }

  editBackdrop.style.display = "flex";
}

function closeEditModal() {
  if (!editBackdrop) return;
  editBackdrop.style.display = "none";
}

// =====================
// Init
// =====================
setDraftActive(false);
render();
