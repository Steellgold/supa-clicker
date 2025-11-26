import { GUEST_ID_KEY } from "@clicker/game/types";

export const generateNewGuestId = () => {
  const id = crypto.randomUUID();
  localStorage.setItem(GUEST_ID_KEY, id);
  return id;
};