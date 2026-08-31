import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, BellRing, CheckCheck, ChevronRight, CircleAlert, Sparkles, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationsService } from '../../services/notifications.service';
import { NotificationItem } from '../../types';

const iconFor = (type: string) => {
  if (type === 'new_problem') return <Sparkles className="w-4 h-4" />;
  if (type === 'problem_solved') return <Trophy className="w-4 h-4" />;
  return <CircleAlert className="w-4 h-4" />;
};

export const NotificationCenter: React.FC = () => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.list,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const unread = data.filter((n) => !n.is_read).length;

  const readMutation = useMutation({
    mutationFn: notificationsService.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
  const allMutation = useMutation({
    mutationFn: notificationsService.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const openNotification = async (item: NotificationItem) => {
    if (!item.is_read) await readMutation.mutateAsync(item.id);
    setOpen(false);
    if (item.action_url) navigate(item.action_url);
    else if (item.question_id) navigate(`/problems/${item.question_id}`);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="notification-trigger"
        aria-label="Notifications"
      >
        {unread ? <BellRing className="w-[18px] h-[18px]" /> : <Bell className="w-[18px] h-[18px]" />}
        {unread > 0 && <span className="notification-count">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-head">
            <div>
              <p className="notification-kicker">Activity center</p>
              <h3>Notifications</h3>
            </div>
            {unread > 0 && (
              <button onClick={() => allMutation.mutate()} className="notification-read-all">
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>
          <div className="notification-list">
            {data.length === 0 ? (
              <div className="notification-empty">
                <Bell className="w-7 h-7" />
                <strong>You're all caught up</strong>
                <span>New problem releases and activity will appear here.</span>
              </div>
            ) : data.slice(0, 12).map((item) => (
              <button key={item.id} onClick={() => openNotification(item)} className={`notification-item ${item.is_read ? '' : 'is-unread'}`}>
                <span className="notification-icon">{iconFor(item.type)}</span>
                <span className="notification-copy">
                  <strong>{item.title}</strong>
                  <span>{item.message}</span>
                  <small>{new Date(item.created_at).toLocaleString()}</small>
                </span>
                <ChevronRight className="w-4 h-4 notification-arrow" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
