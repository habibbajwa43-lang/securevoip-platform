'use client';
import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { MessageSquare, Send, Phone } from 'lucide-react';

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [fromNumber, setFromNumber] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiClient.get('/messages/conversations')
      .then(r => setConversations(r.data.data || []))
      .catch(() => setConversations([]));
  }, []);

  useEffect(() => {
    if (!selected) return;
    apiClient.get(`/messages/conversations/${encodeURIComponent(selected.contact || selected.remoteNumber)}`)
      .then(r => setMessages(r.data.data?.messages || r.data.data || []))
      .catch(() => setMessages([]));
  }, [selected]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !selected || !fromNumber) return;
    setSending(true);
    try {
      await apiClient.post('/messages/send', {
        to: selected.contact || selected.remoteNumber,
        fromNumber,
        body: newMsg,
      });
      setNewMsg('');
      const r = await apiClient.get(`/messages/conversations/${encodeURIComponent(selected.contact || selected.remoteNumber)}`);
      setMessages(r.data.data?.messages || r.data.data || []);
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col bg-card">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Messages</h2>
        </div>
        <div className="flex-1 overflow-auto divide-y">
          {conversations.length === 0 && (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground text-sm">No conversations yet</p>
            </div>
          )}
          {conversations.map((conv: any) => (
            <button key={conv.contact || conv.remoteNumber}
              onClick={() => setSelected(conv)}
              className={`w-full p-4 text-left hover:bg-accent transition-colors ${selected?.contact === conv.contact ? 'bg-accent' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {(conv.contact || conv.remoteNumber)?.slice(-2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-sm">{conv.contact || conv.remoteNumber}</div>
                  <div className="text-muted-foreground text-xs truncate">{conv.lastMessage || 'No messages'}</div>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {selected ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b flex items-center gap-3 bg-card">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm">
              {(selected.contact || selected.remoteNumber)?.slice(-2)}
            </div>
            <div>
              <div className="font-semibold text-sm">{selected.contact || selected.remoteNumber}</div>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {messages.map((msg: any) => (
              <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                <div className={msg.direction === 'outbound' ? 'message-bubble-sent' : 'message-bubble-received'}>
                  <p>{msg.body}</p>
                  <p className="text-xs opacity-60 mt-1">{formatDate(msg.createdAt)}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={sendMessage} className="p-4 border-t flex gap-3 bg-card">
            <input value={fromNumber} onChange={e => setFromNumber(e.target.value)}
              className="w-36 border rounded-xl px-3 py-2 text-sm bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your number" />
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
              className="flex-1 border rounded-xl px-4 py-2 bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Type a message..." />
            <button type="submit" disabled={sending || !newMsg.trim()}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
