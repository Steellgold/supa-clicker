import type { EventHandler, SessionsMap, SocketWithSession } from '../types/event';
import { recalculateStats } from '../utils/utils';

export class ClickHandler implements EventHandler {
  handle(socket: SocketWithSession, sessions: SessionsMap): void {
    const session = sessions.get(socket);
    if (!session) return;

    const now = Date.now();

    session.clickTimestamps = session.clickTimestamps.filter(ts => now - ts < 1000);
    if (session.clickTimestamps.length >= 20) {
      socket.emit("refused", "Rate limit: 20 clicks/sec");
      return;
    }

    session.clickTimestamps.push(now);
    recalculateStats(session.gameState);
    session.gameState.power += session.gameState.ppc;
    session.gameState.total_power += session.gameState.ppc;
    
    socket.emit("update", session.gameState);
  }
}