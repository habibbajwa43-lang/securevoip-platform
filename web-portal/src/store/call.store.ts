import { create } from 'zustand';

export type CallStatus = 'idle' | 'calling' | 'ringing' | 'active' | 'held' | 'ended';

interface CallState {
  status: CallStatus;
  callId: string | null;
  remoteNumber: string | null;
  duration: number;
  isMuted: boolean;
  isOnHold: boolean;
  isSpeakerOn: boolean;
  startTime: Date | null;

  setStatus: (status: CallStatus) => void;
  setCallId: (id: string | null) => void;
  setRemoteNumber: (num: string | null) => void;
  setMuted: (v: boolean) => void;
  setOnHold: (v: boolean) => void;
  setSpeaker: (v: boolean) => void;
  startCall: (num: string) => void;
  endCall: () => void;
  tick: () => void;
}

export const useCallStore = create<CallState>((set, get) => ({
  status: 'idle',
  callId: null,
  remoteNumber: null,
  duration: 0,
  isMuted: false,
  isOnHold: false,
  isSpeakerOn: false,
  startTime: null,

  setStatus: (status) => set({ status }),
  setCallId: (callId) => set({ callId }),
  setRemoteNumber: (remoteNumber) => set({ remoteNumber }),
  setMuted: (isMuted) => set({ isMuted }),
  setOnHold: (isOnHold) => set({ isOnHold }),
  setSpeaker: (isSpeakerOn) => set({ isSpeakerOn }),

  startCall: (num) => set({
    status: 'calling',
    remoteNumber: num,
    startTime: new Date(),
    duration: 0,
    isMuted: false,
    isOnHold: false,
  }),

  endCall: () => set({
    status: 'idle',
    callId: null,
    remoteNumber: null,
    duration: 0,
    isMuted: false,
    isOnHold: false,
    startTime: null,
  }),

  tick: () => set(s => ({ duration: s.startTime ? Math.floor((Date.now() - s.startTime.getTime()) / 1000) : 0 })),
}));
