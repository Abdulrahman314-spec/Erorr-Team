// ===================== Storage Keys =====================
const MEMBERS_KEY = "team_members";
const POLL_VOTES_KEY = "poll_votes"; // { agree: number, disagree: number }
const POLL_MY_VOTE_KEY = "poll_my_vote"; // "agree" | "disagree" | null

// ===================== Helpers =====================
function loadMembers() {
  try {
    const raw = localStorage.getItem(MEMBERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMembers(members) {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

function loadVotes() {
  try {
    const raw = localStorage.getItem(POLL_VOTES_KEY);
    return raw ? JSON.parse(raw) : { agree: 0, disagree: 0 };
  } catch {
    return { agree: 0, disagree: 0 };
  }
}

function saveVotes(votes) {
  localStorage.setItem(POLL_VOTES_KEY, JSON.stringify(votes));
}

function loadMyVote() {
  return localStorage.getItem(POLL_MY_VOTE_KEY);
}

function saveMyVote(choice) {
  if (choice === null) {
    localStorage.removeItem(POLL_MY_VOTE_KEY);
  } else {
    localStorage.setItem(POLL_MY_VOTE_KEY, choice);
  }
}

// ===================== Tabs =====================
const tabButtons = document.querySelectorAll(".tab-btn");
const panels = document.querySelectorAll(".panel");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");

    const target = btn.dataset.tab;
    panels.forEach((p) => p.classList.toggle("active", p.id === target));
  });
});

// ===================== Team Members =====================
const memberForm = document.getElementById("member-form");
const nameInput = document.getElementById("member-name");
const roleInput = document.getElementById("member-role");
const memberList = document.getElementById("member-list");
const memberCount = document.getElementById("member-count");
const teamEmpty = document.getElementById("team-empty");

function renderMembers() {
  const members = loadMembers();
  memberList.innerHTML = "";

  if (members.length === 0) {
    teamEmpty.style.display = "block";
  } else {
    teamEmpty.style.display = "none";
  }

  memberCount.textContent = `${members.length} ${members.length === 1 ? "عضو" : "أعضاء"}`;

  members.forEach((member) => {
    const li = document.createElement("li");
    li.className = "member-item";
    li.innerHTML = `
      <div class="member-info">
        <span class="member-name"></span>
        <span class="member-role"></span>
      </div>
      <button class="member-remove" title="حذف العضو" aria-label="حذف">✕</button>
    `;
    li.querySelector(".member-name").textContent = member.name;
    li.querySelector(".member-role").textContent = member.role;
    li.querySelector(".member-remove").addEventListener("click", () => {
      removeMember(member.id);
    });
    memberList.appendChild(li);
  });
}

function addMember(name, role) {
  const members = loadMembers();
  members.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    role,
  });
  saveMembers(members);
  renderMembers();
}

function removeMember(id) {
  const members = loadMembers().filter((m) => m.id !== id);
  saveMembers(members);
  renderMembers();
}

memberForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const role = roleInput.value.trim();
  if (!name || !role) return;

  addMember(name, role);
  memberForm.reset();
  nameInput.focus();
});

// ===================== Poll =====================
const optionButtons = document.querySelectorAll(".poll-option");
const voteStatus = document.getElementById("vote-status");
const changeVoteBtn = document.getElementById("change-vote-btn");
const resetPollBtn = document.getElementById("reset-poll-btn");

function renderPoll() {
  const votes = loadVotes();
  const myVote = loadMyVote();
  const total = votes.agree + votes.disagree;

  const agreePct = total ? Math.round((votes.agree / total) * 100) : 0;
  const disagreePct = total ? Math.round((votes.disagree / total) * 100) : 0;

  document.getElementById("count-agree").textContent = votes.agree;
  document.getElementById("count-disagree").textContent = votes.disagree;
  document.getElementById("percent-agree").textContent = `${agreePct}%`;
  document.getElementById("percent-disagree").textContent = `${disagreePct}%`;
  document.getElementById("fill-agree").style.width = `${agreePct}%`;
  document.getElementById("fill-disagree").style.width = `${disagreePct}%`;

  optionButtons.forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.choice === myVote);
  });

  if (myVote) {
    voteStatus.textContent =
      myVote === "agree"
        ? "أنت صوّت بـ «موافق»"
        : "أنت صوّت بـ «مش موافق»";
    changeVoteBtn.hidden = false;
  } else {
    voteStatus.textContent = "اختار رأيك عشان نعرف قرار الفريق";
    changeVoteBtn.hidden = true;
  }
}

function castVote(choice) {
  const votes = loadVotes();
  const myVote = loadMyVote();

  // If already voted the same way, do nothing
  if (myVote === choice) return;

  // Remove previous vote if switching
  if (myVote && votes[myVote] > 0) {
    votes[myVote] -= 1;
  }

  votes[choice] += 1;
  saveVotes(votes);
  saveMyVote(choice);
  renderPoll();
}

optionButtons.forEach((btn) => {
  btn.addEventListener("click", () => castVote(btn.dataset.choice));
});

changeVoteBtn.addEventListener("click", () => {
  saveMyVote(null);
  renderPoll();
});

resetPollBtn.addEventListener("click", () => {
  saveVotes({ agree: 0, disagree: 0 });
  saveMyVote(null);
  renderPoll();
});

// ===================== Init =====================
renderMembers();
renderPoll();