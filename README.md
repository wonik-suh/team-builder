# LoL Snake Draft Builder

A Discord-style web-based team draft tool for League of Legends custom games.  
Built with vanilla HTML, CSS, and JavaScript.

Live Demo: (https://wonik-suh.github.io/team-builder/)

---

# Overview

This tool manages custom LoL drafts with strict snake logic, controlled undo behavior, and real-time visual feedback.

It focuses on:

- Deterministic draft sequencing
- Visual clarity
- Hard-locked undo protection
- Clean result export

---

# Features

## Snake Draft System

- Automatic snake pattern (1 → N → N → 1)
- Supports dynamic number of teams
- Detects consecutive double-pick turns
- Highlights required pick slots in real-time
- Auto-ends draft when all slots are filled

---

## LIFO Draft Undo (Hard-Lock)

- Only the most recent pick can be undone
- Prevents draft order corruption
- Red border indicator for undoable player
- Enforces strict Last-In-First-Out behavior

---

## Smart Slot Highlighting

- Highlights next required slot
- If double-pick turn, highlights two empty slots
- Automatically updates each turn

---

## Participant Management

### Manual Add

- Add via modal
- Multi-lane selection (TOP, JGL, MID, ADC, SUP)

### Bulk Paste

Paste format:

Name / Tier / Lane

- Each new line creates a new participant
- Tier supports Korean and English input
- Multi-lane supported
- 5 lanes automatically converted to ALL
- Missing tier defaults safely
- Always auto-sorted by tier (high to low)

### Controls

- Edit participant
- Remove participant (if not drafted)
- Remove entire team
- Remove drafted player (only if undoable)

---

# UI Design

- Discord-inspired dark theme
- Tier-based badge colors
- Active team highlighting
- Highlighted next pick slots
- Red border for undoable pick

---

# Export Results (Korean Format)

One-click copy produces:

Team1
Name / Tier / Lane

Team2
Name / Tier / Lane

- Tier automatically converted to Korean
- Multi-lane separated by comma
- ALL preserved

---

# Architecture

Built with pure Vanilla JavaScript.

- No frameworks
- Single global state object
- Deterministic render cycle
- State-driven UI updates

Core state structure:

state = {
  participants: [],
  teams: [],
  teamOrder: [],
  draft: {
    active: false,
    turn: 0,
    history: [],
    lastPickedPid: null
  }
}

---

# Why Hard-Lock Undo?

Typical draft tools allow arbitrary removal, which:

- Breaks snake order
- Causes confusion
- Corrupts turn logic

This project enforces strict LIFO-only undo (Last In, First Out) to ensure draft integrity and predictable behavior.

---

# Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- GitHub Pages
