import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import LoginScreen from './LoginScreen';
import InviteJoin from './InviteJoin';

// Top-level gate: handles invite links, admin login, and session restore before
// rendering the app. Renders its children only when authenticated.
export default function AuthGate({ children }) {
  const authToken = useStore((s) => s.authToken);
  const loadSession = useStore((s) => s.loadSession);
  const fetchWorkspaces = useStore((s) => s.fetchWorkspaces);
  const fetchBoardsList = useStore((s) => s.fetchBoardsList);
  const loadBoard = useStore((s) => s.loadBoard);

  const [phase, setPhase] = useState('loading'); // loading | login | invite | authed
  const [inviteToken, setInviteToken] = useState(null);

  // Decide the initial phase
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (invite) {
      setInviteToken(invite);
      setPhase('invite');
      return;
    }
    (async () => {
      const ok = await loadSession();
      setPhase(ok ? 'authed' : 'login');
    })();
  }, [loadSession]);

  // Once authenticated, load the right data (board-scoped members land on their board)
  useEffect(() => {
    if (phase !== 'authed') return;
    (async () => {
      const p = useStore.getState().principal;
      if (p?.scope === 'board' && p.targetId) {
        await loadBoard(p.targetId);
      } else {
        await fetchWorkspaces();
        await fetchBoardsList();
      }
    })();
  }, [phase, fetchWorkspaces, fetchBoardsList, loadBoard]);

  // Drop back to login if the session ends (logout / expired token / 401)
  useEffect(() => {
    if (phase === 'authed' && !authToken) setPhase('login');
  }, [authToken, phase]);

  const enterAuthed = () => {
    if (window.location.search) window.history.replaceState({}, '', window.location.pathname);
    setPhase('authed');
  };

  if (phase === 'loading') {
    return <div className="auth-screen"><div className="auth-card">Loading…</div></div>;
  }
  if (phase === 'invite') {
    return <InviteJoin token={inviteToken} onJoined={enterAuthed} onFallback={() => setPhase('login')} />;
  }
  if (phase === 'login') {
    return <LoginScreen onLoggedIn={enterAuthed} />;
  }
  return children;
}
