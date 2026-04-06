import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [open,          setOpen]          = useState(false);
  const [unread,        setUnread]        = useState(0);
  const dropRef  = useRef(null);
  const pollRef  = useRef(null);

  const fetchAll = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/notifications/${userId}`);
      setNotifications(res.data);
      setUnread(res.data.filter(n => !n.read).length);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (!userId) return;
    fetchAll();
    pollRef.current = setInterval(fetchAll, 8000);
    return () => clearInterval(pollRef.current);
  }, [userId]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markRead = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try {
      await axios.patch(`http://localhost:5000/notifications/read-all/${userId}`);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch (err) { console.error(err); }
  };

  const fmt = (iso) => {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60)   return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <>
      <style>{`
        .nb-wrap { position: relative; }
        .nb-btn {
          position: relative; background: rgba(255,255,255,0.06);
          border: 1px solid rgba(78,205,196,0.2); border-radius: 10px;
          width: 40px; height: 40px; display: flex; align-items: center;
          justify-content: center; cursor: pointer; font-size: 1.1rem;
          transition: background 0.2s;
        }
        .nb-btn:hover { background: rgba(78,205,196,0.12); }
        .nb-badge {
          position: absolute; top: -5px; right: -5px;
          background: #FF6B6B; color: #fff;
          width: 18px; height: 18px; border-radius: 50%;
          font-size: 0.65rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #06101E;
          animation: nbPop 0.3s ease;
        }
        @keyframes nbPop { from{transform:scale(0);} to{transform:scale(1);} }

        .nb-drop {
          position: absolute; top: calc(100% + 10px); right: 0;
          width: 320px; max-height: 420px;
          background: #0C1A2E; border: 1px solid rgba(78,205,196,0.2);
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
          z-index: 200; animation: nbSlide 0.2s ease;
          display: flex; flex-direction: column;
        }
        @keyframes nbSlide { from{opacity:0;transform:translateY(-8px);} to{opacity:1;transform:translateY(0);} }

        .nb-header {
          padding: 14px 18px; border-bottom: 1px solid rgba(78,205,196,0.12);
          display: flex; justify-content: space-between; align-items: center;
          flex-shrink: 0;
        }
        .nb-header-title {
          font-family: 'Sora', sans-serif; font-weight: 700;
          font-size: 0.88rem; color: #E8F6FF;
        }
        .nb-mark-all {
          font-size: 0.72rem; color: #4ECDC4; cursor: pointer;
          font-weight: 600; transition: opacity 0.2s;
        }
        .nb-mark-all:hover { opacity: 0.75; }

        .nb-list { overflow-y: auto; flex: 1; scrollbar-width: thin; scrollbar-color: rgba(78,205,196,0.15) transparent; }
        .nb-empty { padding: 32px; text-align: center; color: #7A9BB5; font-size: 0.85rem; }

        .nb-item {
          padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.04);
          cursor: pointer; transition: background 0.15s;
          display: flex; gap: 12px; align-items: flex-start;
        }
        .nb-item:hover { background: rgba(255,255,255,0.04); }
        .nb-item.unread { background: rgba(78,205,196,0.05); }
        .nb-item-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #4ECDC4;
          flex-shrink: 0; margin-top: 5px;
        }
        .nb-item-dot.read { background: transparent; }
        .nb-item-body { flex: 1; min-width: 0; }
        .nb-item-title { font-weight: 700; font-size: 0.82rem; color: #E8F6FF; margin-bottom: 3px; }
        .nb-item-text  { font-size: 0.78rem; color: #7A9BB5; line-height: 1.45; word-break: break-word; }
        .nb-item-time  { font-size: 0.68rem; color: #7A9BB5; margin-top: 4px; }
      `}</style>

      <div className="nb-wrap" ref={dropRef}>
        <div className="nb-btn" onClick={() => setOpen(o => !o)}>
          🔔
          {unread > 0 && (
            <div className="nb-badge">{unread > 9 ? "9+" : unread}</div>
          )}
        </div>

        {open && (
          <div className="nb-drop">
            <div className="nb-header">
              <div className="nb-header-title">Notifications {unread > 0 && `(${unread})`}</div>
              {unread > 0 && (
                <div className="nb-mark-all" onClick={markAllRead}>Mark all read</div>
              )}
            </div>
            <div className="nb-list">
              {notifications.length === 0 ? (
                <div className="nb-empty">No notifications yet 🔕</div>
              ) : notifications.map((n) => (
                <div
                  key={n._id}
                  className={`nb-item ${!n.read ? "unread" : ""}`}
                  onClick={() => !n.read && markRead(n._id)}
                >
                  <div className={`nb-item-dot ${n.read ? "read" : ""}`} />
                  <div className="nb-item-body">
                    <div className="nb-item-title">{n.title}</div>
                    <div className="nb-item-text">{n.body}</div>
                    <div className="nb-item-time">{fmt(n.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}