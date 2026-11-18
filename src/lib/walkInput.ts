import { wakeScene } from "./sceneClock";

/** Shared first-person input state (keyboard + on-screen D-pad). Mutated by UI, read by <Walkthrough>. */
export const walkInput = {
  forward: 0, // -1 … 1
  strafe: 0,
  turn: 0,
  run: false,
};

export function setWalk(patch: Partial<typeof walkInput>) {
  Object.assign(walkInput, patch);
  wakeScene();
}

export function clearWalk() {
  walkInput.forward = walkInput.strafe = walkInput.turn = 0;
  walkInput.run = false;
}
