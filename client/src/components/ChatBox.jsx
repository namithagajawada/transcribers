import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function ChatBox({ task, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const pollRef  = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/messages/${task._id}`);
      setMessages(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000); // poll every 3s
    return () => clearInterval(pollRef.current);
  }, [task._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await axios.post("http://localhost:5000/messages", {
        taskId:     task._id,
        senderId:   currentUser._id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        text:       text.trim(),
      });
      setText("");
      fetchMessages();
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  const fmt = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <style>{`
        .cb-overlay{position:fixed;inset:0;z-index:100;background:rgba(6,16,30,0.72);backdrop-filter:blur(4px);display:flex;align-items:stretch;justify-content:flex-end;animation:cbFade 0.2s ease;}
        @keyframes cbFade{from{opacity:0;}to{opacity:1;}}
        .cb-panel{width:100%;max-width:420px;height:100vh;background:#0C1A2E;border-left:1px solid rgba(78,205,196,0.2);display:flex;flex-direction:column;animation:cbSlide 0.28s ease;}
        @keyframes cbSlide{from{transform:translateX(100%);}to{transform:translateX(0);}}
        .cb-header{padding:18px 20px;border-bottom:1px solid rgba(78,205,196,0.15);background:rgba(78,205,196,0.05);display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
        .cb-header-title{font-family:'Sora',sans-serif;font-weight:700;font-size:0.95rem;color:#E8F6FF;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .cb-header-sub{font-size:0.72rem;color:#7A9BB5;margin-top:3px;}
        .cb-close{background:rgba(255,107,107,0.15);border:1px solid rgba(255,107,107,0.3);color:#FF6B6B;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:0.78rem;font-weight:700;white-space:nowrap;transition:background 0.2s;flex-shrink:0;}
        .cb-close:hover{background:rgba(255,107,107,0.25);}
        .cb-messages{flex:1;overflow-y:auto;padding:20px 16px;display:flex;flex-direction:column;gap:12px;scrollbar-width:thin;scrollbar-color:rgba(78,205,196,0.15) transparent;}
        .cb-empty{text-align:center;color:#7A9BB5;font-size:0.85rem;margin:auto;padding:40px 0;line-height:1.7;}
        .cb-msg{display:flex;flex-direction:column;max-width:80%;}
        .cb-msg.me{align-self:flex-end;align-items:flex-end;}
        .cb-msg.them{align-self:flex-start;align-items:flex-start;}
        .cb-msg-name{font-size:0.68rem;font-weight:700;color:#7A9BB5;margin-bottom:4px;letter-spacing:0.05em;text-transform:uppercase;}
        .cb-msg.me .cb-msg-name{color:#4ECDC4;}
        .cb-bubble{padding:10px 14px;border-radius:16px;font-size:0.88rem;line-height:1.55;color:#E8F6FF;word-break:break-word;}
        .cb-msg.me   .cb-bubble{background:linear-gradient(135deg,#4ECDC4,#2cb5ae);color:#06101E;border-radius:16px 4px 16px 16px;}
        .cb-msg.them .cb-bubble{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:4px 16px 16px 16px;}
        .cb-time{font-size:0.62rem;color:#7A9BB5;margin-top:4px;}
        .cb-input-area{padding:14px 16px;border-top:1px solid rgba(78,205,196,0.15);background:rgba(6,16,30,0.8);display:flex;gap:10px;align-items:flex-end;}
        .cb-input{flex:1;background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.1);border-radius:12px;padding:11px 14px;color:#E8F6FF;font-family:'Nunito',sans-serif;font-size:0.9rem;resize:none;outline:none;max-height:120px;transition:border-color 0.2s;}
        .cb-input:focus{border-color:#4ECDC4;}
        .cb-input::placeholder{color:rgba(122,155,181,0.5);}
        .cb-send{background:linear-gradient(135deg,#4ECDC4,#2cb5ae);border:none;border-radius:10px;padding:11px 16px;color:#06101E;font-weight:700;font-size:1rem;cursor:pointer;transition:transform 0.15s,opacity 0.2s;flex-shrink:0;}
        .cb-send:hover:not(:disabled){transform:scale(1.06);}
        .cb-send:disabled{opacity:0.5;cursor:not-allowed;}
      `}</style>

      <div className="cb-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="cb-panel">
          <div className="cb-header">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="cb-header-title">💬 {task.description?.slice(0, 48)}{task.description?.length > 48 ? "…" : ""}</div>
              <div className="cb-header-sub">{task.type} · {task.language} · {task.status}</div>
            </div>
            <button className="cb-close" onClick={onClose}>✕ Close</button>
          </div>

          <div className="cb-messages">
            {messages.length === 0 && (
              <div className="cb-empty">No messages yet.<br />Start the conversation 👋</div>
            )}
            {messages.map((msg) => {
              const isMe = String(msg.senderId) === String(currentUser._id) || msg.senderId?._id === currentUser._id;
              return (
                <div key={msg._id} className={`cb-msg ${isMe ? "me" : "them"}`}>
                  <div className="cb-msg-name">{isMe ? "You" : msg.senderName}</div>
                  <div className="cb-bubble">{msg.text}</div>
                  <div className="cb-time">{fmt(msg.createdAt)}</div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="cb-input-area">
            <textarea
              className="cb-input"
              rows={1}
              placeholder="Type a message… (Enter to send)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            />
            <button className="cb-send" onClick={sendMessage} disabled={sending || !text.trim()}>➤</button>
          </div>
        </div>
      </div>
    </>
  );
}