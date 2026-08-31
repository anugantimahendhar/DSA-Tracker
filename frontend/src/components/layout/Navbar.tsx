import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../features/auth/useAuth';
import { progressService } from '../../services/progress.service';
import { Button } from '../ui/Button';
import { NotificationCenter } from '../common/NotificationCenter';
import { Code2, Flame, LayoutDashboard, RotateCcw, BarChart3, Shield, Bookmark, LogOut, Menu, X, Sparkles, Trophy, Settings2 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, openAuthModal, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: progress } = useQuery({ queryKey: ['user-progress-summary'], queryFn: progressService.getSummary, enabled: isAuthenticated && !isAdmin, staleTime: 300000 });
  const streak = progress?.current_streak || 0;

  const userLinks = [
    { name: 'Problems', path: '/problems', icon: Code2 },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Revision', path: '/revision', icon: RotateCcw },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
    { name: 'Scoreboard', path: '/leaderboard', icon: Trophy },
  ];
  const adminLinks = [
    { name: 'Command Center', path: '/admin', icon: Shield },
    { name: 'Problem Library', path: '/problems', icon: Code2 },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];
  const guestLinks = [{ name: 'Problems', path: '/problems', icon: Code2 }];
  const navLinks = isAdmin ? adminLinks : isAuthenticated ? userLinks : guestLinks;
  const active = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <header className={`premium-navbar ${isAdmin ? 'admin-navbar' : 'user-navbar'}`}>
      <div className="nav-shell">
        <div className="flex items-center gap-7 min-w-0">
          <Link to={isAdmin ? '/admin' : '/problems'} className="brand-lockup">
            <span className="brand-mark"><Code2 className="w-5 h-5" /></span>
            <span className="brand-copy"><strong>DSA<span>TRACK</span></strong><small>{isAdmin ? 'ADMIN STUDIO' : 'ALGORITHM LAB'}</small></span>
          </Link>
          <nav className="hidden xl:flex nav-links">
            {navLinks.map(({ name, path, icon: Icon }) => (
              <Link key={path} to={path} className={active(path) ? 'active' : ''}><Icon className="w-4 h-4" /><span>{name}</span></Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              {!isAdmin && <div className="streak-pill"><Flame className="w-4 h-4" /><span>{streak} day streak</span></div>}
              {isAdmin && <div className="admin-mode-pill"><Settings2 className="w-4 h-4" /> Admin mode</div>}
              <NotificationCenter />
              <Link to="/profile" className="profile-chip"><span className="avatar-letter">{user?.email?.[0]?.toUpperCase()}</span><span><strong>{user?.email}</strong><small>{isAdmin ? 'Administrator' : 'Member'}</small></span></Link>
              <button onClick={() => logout()} className="nav-icon-button" title="Sign out"><LogOut className="w-[18px] h-[18px]" /></button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={() => openAuthModal('login')}>Sign in</Button>
              <Button variant="primary" size="sm" onClick={() => openAuthModal('register')} rightIcon={<Sparkles className="w-3.5 h-3.5" />}>Start practicing</Button>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          {isAuthenticated && <NotificationCenter />}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="nav-icon-button">{mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="mobile-nav-panel">
          {navLinks.map(({ name, path, icon: Icon }) => <Link key={path} to={path} onClick={() => setMobileMenuOpen(false)} className={active(path) ? 'active' : ''}><Icon className="w-4 h-4" />{name}</Link>)}
          {isAuthenticated ? <><Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link><button onClick={() => logout()}><LogOut className="w-4 h-4" /> Sign out</button></> : <button onClick={() => openAuthModal('login')}>Sign in</button>}
        </div>
      )}
    </header>
  );
};
