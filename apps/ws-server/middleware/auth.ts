import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { supabase } from '../lib/supabase';

export interface AuthenticatedSocket extends Socket {
  userId: string;
  user: {
    id: string;
    email?: string;
  };
}

export async function authenticateSocket(socket: Socket, next: (err?: Error) => void) {
  try {
    const token = socket.handshake.query.token as string;
    
    if (!token) {
      return next(new Error('No token provided'));
    }

    // Check if token is a UUID (guest user) or JWT (authenticated user)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
    
    if (isUUID) {
      // Guest user - no authentication required
      (socket as AuthenticatedSocket).userId = token;
      (socket as AuthenticatedSocket).user = {
        id: token,
        email: undefined
      };
      
      console.log(`[AUTH] Guest user authenticated: ${token}`);
      next();
      return;
    }

    // Authenticated user - verify JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('[AUTH] Invalid JWT token:', error?.message || 'No user found');
      return next(new Error('Invalid token'));
    }

    // Verify token is not expired
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp && Date.now() >= decoded.exp * 1000) {
        return next(new Error('Token expired'));
      }
    } catch (jwtError) {
      console.error('[AUTH] JWT decode error:', jwtError);
      return next(new Error('Invalid token format'));
    }

    // Attach user info to socket
    (socket as AuthenticatedSocket).userId = user.id;
    (socket as AuthenticatedSocket).user = {
      id: user.id,
      email: user.email
    };

    console.log(`[AUTH] Authenticated user: ${user.id} (${user.email})`);
    next();
    
  } catch (error) {
    console.error('[AUTH] Authentication error:', error);
    next(new Error('Authentication failed'));
  }
}