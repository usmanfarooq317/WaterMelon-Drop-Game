# Watermelon Drop

Watermelon Drop is a fun, physics-based browser game where players drop fruits into a cup, aiming to merge identical fruits to create larger ones, ultimately targeting the Watermelon for the highest score.  

Built with modern web technologies, the game features a neon-themed interface, smooth animations, and engaging mechanics inspired by popular merge games like **Suika Game**.

---

## About the Game

In **Watermelon Drop**, players drop fruits into a cup defined by left, right, and bottom walls, with a top boundary that triggers a game over if crossed. The goal is to merge identical fruits (e.g., two Cherries into a Strawberry) to create larger fruits, up to the Watermelon, while managing space to avoid overflow.  

The game tracks scores, high scores (saved in `localStorage`), and assigns a rating (F to A) based on performance.

### Features
- 🎮 **Physics-Based Gameplay**: Fruits fall under gravity, bounce with elasticity, and collide realistically.
- 🍓 **Merge Mechanics**: Combine identical fruits to create the next type, earning points based on the new fruit’s level.
- 🌌 **Neon Aesthetic**: A dark gradient background with glowing stars, vibrant fruit colors, and neon-styled cup walls.
- 🕹 **Responsive Controls**: Click or tap to drop fruits, with buttons for starting, pausing, and resetting the game.
- ⭐ **Score & Rating System**: Earn points for merges, aim for a high score, and achieve ratings from F (<100) to A (>1000).

---

## Development

Watermelon Drop was developed using:

- **React + TypeScript** → component-driven UI with type safety  
- **Vite** → super fast bundler & dev server  
- **Tailwind CSS** → modern utility-first styling  
- **Shadcn UI** (optional) → polished reusable buttons  
- **Canvas API** → renders fruits, background, and handles physics  
- **Lucide React** → icons for Play, Pause, Reset  

### Development Challenges
- Fixed TypeScript `tsconfig` issues with **module resolution**.  
- Solved **collision bugs** in fruit merging physics.  
- Adjusted fruit drop logic to avoid instant game overs.  

---

## How to Play

### 🎯 Objective
Merge fruits to create bigger ones and aim for a **Watermelon**! Don’t let the fruits overflow past the red top line.

### 🖱 Controls
- **Click/Tap** → Drop fruit at cursor/touch position  
- **Buttons**:
  - ▶ **Start Game**  
  - ⏸ **Pause/Resume**  
  - 🔄 **Reset**  
  - 🔁 **Play Again** (after game over)  

### 🕹 Gameplay
1. Start → Preview fruit shown at the top.  
2. Drop fruits → They fall with gravity, bounce, and collide.  
3. Merge → Same fruits fuse into the next level.  
4. Score → Higher merges = more points.  
5. Game Over → If fruits cross the top line.  

Fruit order: Cherry → Strawberry → Grape → Dekopon → Persimmon → Apple → Pear → Peach → Pineapple → Melon → **Watermelon** 🍉  

---
