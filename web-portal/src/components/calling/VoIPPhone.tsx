'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, PhoneOff, PhoneIncoming, Mic, MicOff, Volume2, VolumeX,
  PauseCircle, PlayCircle, ArrowLeftRight, Hash, ChevronDown, X,
  Loader2, PhoneMissed,
} from 'lucide-react';
import { useCallStore } from '../../store/call.store';
import { useSocket } from '@/hooks/useSocket';
import { cn } from '../../lib/utils';

type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';

interface VoIPPhoneProps {
  userNumbers: { number: string; friendlyName?: string }[];
  defaultNumber?: string;
}

const KEYPAD_KEYS = [
  { digit: '1', sub: '' },
  { digit: '2', sub: 'ABC' },
  { digit: '3', sub: 'DEF' },
  { digit: '4', sub: 'GHI' },
  { digit: '5', sub: 'JKL' },
  { digit: '6', sub: 'MNO' },
  { digit: '7', sub: 'PQRS' },
  { digit: '8', sub: 'TUV' },
  { digit: '9', sub: 'WXYZ' },
  { digit: '*', sub: '' },
  { digit: '0', sub: '+' },
  { digit: '#', sub: '' },
];

export function VoIPPhone({ userNumbers, defaultNumber }: VoIPPhoneProps) {
  const [dialInput, setDialInput] = useState('');
  const [callState, setCallState] = useState<CallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [duration, setDuration] = useState(0);
  const [selectedNumber, setSelectedNumber] = useState(defaultNumber || userNumbers[0]?.number);
  const [incomingCall, setIncomingCall] = useState<{ callId: string; from: string; callerName?: string } | null>(null);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const { socket } = useSocket();

  // ─── WebRTC Setup ──────────────────────────────────────────────────────────
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Add TURN servers for GCC/restricted regions
        {
          urls: process.env.NEXT_PUBLIC_TURN_URL || 'turn:your-turn-server.com:3478',
          username: process.env.NEXT_PUBLIC_TURN_USER || 'voip',
          credential: process.env.NEXT_PUBLIC_TURN_PASS || 'voip',
        },
      ],
      iceCandidatePoolSize: 10,
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && currentCallId) {
        socket?.emit('webrtc:ice-candidate', {
          callId: currentCallId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setCallState('connected');
        startTimer();
      } else if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        handleCallEnd();
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [currentCallId, socket]);

  // ─── Socket Events ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.on('call:incoming', (data) => {
      setIncomingCall({ callId: data.callId, from: data.fromNumber, callerName: data.callerName });
      setCallState('ringing');
    });

    socket.on('call:answered', async (data) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription({ type: 'answer', sdp: data.sdpAnswer }),
        );
      }
    });

    socket.on('call:rejected', () => {
      setCallState('idle');
      stopTimer();
      setCurrentCallId(null);
    });

    socket.on('call:ended', (data) => {
      handleCallEnd();
    });

    socket.on('webrtc:ice-candidate', async (data) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate),
        );
      }
    });

    return () => {
      socket.off('call:incoming');
      socket.off('call:answered');
      socket.off('call:rejected');
      socket.off('call:ended');
      socket.off('webrtc:ice-candidate');
    };
  }, [socket]);

  // ─── Make Call ─────────────────────────────────────────────────────────────
  const makeCall = async () => {
    if (!dialInput || dialInput.length < 7) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);

      setCallState('calling');

      socket?.emit('call:initiate', {
        fromNumber: selectedNumber,
        toNumber: dialInput,
        callType: 'voice',
        sdpOffer: offer.sdp,
      });

      socket?.once('call:initiated', (data) => {
        setCurrentCallId(data.callId);
      });
    } catch (error) {
      console.error('Failed to start call:', error);
      setCallState('idle');
    }
  };

  // ─── Answer Incoming Call ──────────────────────────────────────────────────
  const answerCall = async () => {
    if (!incomingCall) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Get the SDP offer from incoming call data
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket?.emit('call:answer', {
        callId: incomingCall.callId,
        sdpAnswer: answer.sdp,
      });

      setCurrentCallId(incomingCall.callId);
      setIncomingCall(null);
      setCallState('connected');
      startTimer();
    } catch (error) {
      console.error('Failed to answer call:', error);
    }
  };

  // ─── Reject Incoming Call ──────────────────────────────────────────────────
  const rejectCall = () => {
    if (!incomingCall) return;
    socket?.emit('call:reject', { callId: incomingCall.callId, reason: 'rejected' });
    setIncomingCall(null);
    setCallState('idle');
  };

  // ─── End Active Call ───────────────────────────────────────────────────────
  const endCall = () => {
    if (currentCallId) {
      socket?.emit('call:end', { callId: currentCallId });
    }
    handleCallEnd();
  };

  const handleCallEnd = () => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setCallState('idle');
    setCurrentCallId(null);
    stopTimer();
    setDuration(0);
    setIsMuted(false);
    setIsOnHold(false);
  };

  // ─── Mute/Unmute ──────────────────────────────────────────────────────────
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
    socket?.emit('call:mute', { callId: currentCallId, muted: !isMuted });
  };

  // ─── Hold ─────────────────────────────────────────────────────────────────
  const toggleHold = () => {
    setIsOnHold(!isOnHold);
    socket?.emit('call:hold', { callId: currentCallId, onHold: !isOnHold });
  };

  // ─── Timer ─────────────────────────────────────────────────────────────────
  const startTimer = () => {
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ─── Keypad Press ─────────────────────────────────────────────────────────
  const pressKey = (digit: string) => {
    if (callState === 'connected') {
      socket?.emit('call:dtmf', { callId: currentCallId, digit });
    } else {
      setDialInput((prev) => (prev.length < 15 ? prev + digit : prev));
    }
  };

  const deleteLastDigit = () => {
    setDialInput((prev) => prev.slice(0, -1));
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Hidden Audio Element */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <div className="bg-card rounded-2xl border shadow-xl overflow-hidden">
        {/* Incoming Call Modal */}
        <AnimatePresence>
          {callState === 'ringing' && incomingCall && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-6 bg-gradient-to-b from-blue-600 to-blue-800 text-white"
            >
              <div className="text-center space-y-4">
                <div className="ring-animation w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center">
                  <PhoneIncoming className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm opacity-80">Incoming Call</p>
                  <p className="text-2xl font-bold mt-1">
                    {incomingCall.callerName || incomingCall.from}
                  </p>
                  {incomingCall.callerName && (
                    <p className="text-sm opacity-70">{incomingCall.from}</p>
                  )}
                </div>
                <div className="flex gap-6 justify-center pt-2">
                  <button
                    onClick={rejectCall}
                    className="call-button bg-red-500 hover:bg-red-600 text-white"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </button>
                  <button
                    onClick={answerCall}
                    className="call-button bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <Phone className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active/Calling State */}
        {(callState === 'calling' || callState === 'connected') && (
          <div className="p-5 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
            <div className="text-center space-y-2">
              {callState === 'calling' ? (
                <>
                  <Loader2 className="w-8 h-8 mx-auto animate-spin opacity-70" />
                  <p className="text-sm opacity-70">Calling...</p>
                  <p className="text-xl font-semibold">{dialInput}</p>
                </>
              ) : (
                <>
                  <p className="text-sm opacity-70">
                    {isOnHold ? '⏸ On Hold' : 'Active Call'}
                  </p>
                  <p className="text-xl font-semibold">{dialInput || incomingCall?.from}</p>
                  <p className="call-timer text-2xl font-bold opacity-90">
                    {formatTime(duration)}
                  </p>
                </>
              )}
            </div>

            {/* In-Call Controls */}
            {callState === 'connected' && (
              <div className="grid grid-cols-4 gap-3 mt-5">
                {[
                  { icon: isMuted ? MicOff : Mic, label: isMuted ? 'Unmute' : 'Mute', action: toggleMute, active: isMuted },
                  { icon: isSpeaker ? Volume2 : VolumeX, label: 'Speaker', action: () => setIsSpeaker(!isSpeaker), active: isSpeaker },
                  { icon: isOnHold ? PlayCircle : PauseCircle, label: isOnHold ? 'Resume' : 'Hold', action: toggleHold, active: isOnHold },
                  { icon: Hash, label: 'Keypad', action: () => setShowKeypad(!showKeypad), active: showKeypad },
                ].map((ctrl) => (
                  <button
                    key={ctrl.label}
                    onClick={ctrl.action}
                    className={cn(
                      'flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs transition-all',
                      ctrl.active
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10',
                    )}
                  >
                    <ctrl.icon className="w-5 h-5" />
                    <span>{ctrl.label}</span>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={endCall}
              className="call-button bg-red-500 hover:bg-red-600 text-white mx-auto mt-4 block"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Dial Pad (Idle / Keypad overlay) */}
        {(callState === 'idle' || showKeypad) && (
          <div className="p-5 space-y-4">
            {/* Number Selector */}
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm">
              <span className="text-muted-foreground text-xs">From:</span>
              <select
                value={selectedNumber}
                onChange={(e) => setSelectedNumber(e.target.value)}
                className="flex-1 bg-transparent text-sm font-medium outline-none cursor-pointer"
              >
                {userNumbers.map((n) => (
                  <option key={n.number} value={n.number}>
                    {n.friendlyName || n.number}
                  </option>
                ))}
              </select>
            </div>

            {/* Dial Display */}
            <div className="relative flex items-center">
              <div className="phone-display flex-1 px-3 py-2 rounded-lg bg-muted">
                {dialInput || (
                  <span className="text-muted-foreground text-base">Enter number...</span>
                )}
              </div>
              {dialInput && (
                <button
                  onClick={deleteLastDigit}
                  className="absolute right-2 p-1 hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {KEYPAD_KEYS.map((key) => (
                <button
                  key={key.digit}
                  onClick={() => pressKey(key.digit)}
                  className="keypad-button"
                >
                  <span className="text-lg font-semibold leading-none">{key.digit}</span>
                  {key.sub && (
                    <span className="text-[9px] text-muted-foreground mt-0.5">{key.sub}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Call Button */}
            <div className="flex justify-center pt-1">
              <button
                onClick={makeCall}
                disabled={!dialInput || dialInput.length < 7}
                className={cn(
                  'call-button text-white transition-all',
                  dialInput.length >= 7
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 dark:shadow-emerald-900/40'
                    : 'bg-muted text-muted-foreground cursor-not-allowed',
                )}
              >
                <Phone className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

