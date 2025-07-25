import { GameService } from '../services/game';
import type { EventHandler, SessionsMap, SocketWithSession } from '../types/event';

export class ResetHandler implements EventHandler {
  async handle(socket: SocketWithSession, sessions: SessionsMap): Promise<void> {
    const session = sessions.get(socket);
    if (!session) return;

    session.gameState = {
      ppc: 1,
      pps: 0,
      power: 0,
      total_power: 0,
      upgrades: [],
    };

    try {
      await GameService.saveGameState(session.userId, session.gameState);
    } catch (error) {
      console.error('Failed to save reset state:', error);
      socket.emit("error", "Failed to save game state");
    }

    socket.emit("update", session.gameState);
  }
}