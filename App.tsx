import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob, FunctionDeclaration, Type } from '@google/genai';
import { PRODUCT_RISKS, WORLD_EVENTS, WAREHOUSE_DATA } from './constants';
import { TranscriptEntry, TranscriptSpeaker, ConnectionState, View } from './types';
import RiskChart from './components/RiskChart';
import EventsFeed from './components/EventsFeed';
import ConversationPanel from './components/ConversationPanel';
import MapView from './components/MapView';

declare global {
  // Fix: Defined AIStudio interface to resolve the "Subsequent property declarations must have the same type" error.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
    webkitAudioContext: typeof AudioContext;
  }
}

// --- Audio Utility Functions ---
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const App: React.FC = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isApiKeySelected, setIsApiKeySelected] = useState(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);
  
  const sessionRef = useRef<LiveSession | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  const nextStartTimeRef = useRef(0);
  const playingSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    const checkKey = async () => {
      setIsCheckingApiKey(true);
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setIsApiKeySelected(true);
      }
      setIsCheckingApiKey(false);
    };
    checkKey();
  }, []);

  const handleSelectApiKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume key selection is successful after the dialog is opened to handle race conditions.
      setIsApiKeySelected(true);
    }
  };

  const cleanup = useCallback(() => {
    if (sessionRef.current) {
        sessionRef.current.close();
        sessionRef.current = null;
    }
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }

    playingSourcesRef.current.forEach(source => source.stop());
    playingSourcesRef.current.clear();

    setConnectionState(ConnectionState.DISCONNECTED);
  }, []);

  const handleToggleConversation = useCallback(async () => {
    if (connectionState !== ConnectionState.DISCONNECTED) {
      cleanup();
      return;
    }

    setConnectionState(ConnectionState.CONNECTING);
    setTranscript([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      
      const navigateToMapView: FunctionDeclaration = {
        name: 'navigateToMapView',
        description: 'Navigates the user to a world map view showing warehouse stock locations.',
        parameters: { type: Type.OBJECT, properties: {} },
      };

      inputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: async () => {
            console.log('Session opened.');
            setConnectionState(ConnectionState.CONNECTED);
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const inputCtx = inputAudioContextRef.current!;
            mediaStreamSourceRef.current = inputCtx.createMediaStreamSource(mediaStreamRef.current);
            scriptProcessorRef.current = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const outCtx = outputAudioContextRef.current;
            if (!outCtx) return;

            if (message.toolCall) {
                for (const fc of message.toolCall.functionCalls) {
                    if (fc.name === 'navigateToMapView') {
                        console.log('Function call received: navigateToMapView');
                        setCurrentView(View.MAP);
                        sessionPromise.then((session) => {
                            session.sendToolResponse({
                                functionResponses: {
                                    id: fc.id,
                                    name: fc.name,
                                    response: { result: "Successfully navigated to map view." },
                                }
                            });
                        });
                    }
                }
            }

            if (message.serverContent?.outputTranscription) {
                currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
            }
            if (message.serverContent?.inputTranscription) {
                currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
            }
            
            if (message.serverContent?.turnComplete) {
                const fullInput = currentInputTranscriptionRef.current.trim();
                const fullOutput = currentOutputTranscriptionRef.current.trim();

                setTranscript(prev => {
                    let newTranscript = [...prev];
                    if (fullInput) {
                        newTranscript.push({ speaker: TranscriptSpeaker.User, text: fullInput, id: Date.now() });
                    }
                    if (fullOutput) {
                        newTranscript.push({ speaker: TranscriptSpeaker.AI, text: fullOutput, id: Date.now() + 1 });
                    }
                    return newTranscript;
                });
                
                currentInputTranscriptionRef.current = '';
                currentOutputTranscriptionRef.current = '';
                setConnectionState(ConnectionState.LISTENING);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
                setConnectionState(ConnectionState.SPEAKING);
                const decodedAudio = decode(base64Audio);
                const audioBuffer = await decodeAudioData(decodedAudio, outCtx, 24000, 1);

                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
                const source = outCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outCtx.destination);
                
                source.onended = () => {
                    playingSourcesRef.current.delete(source);
                    if(playingSourcesRef.current.size === 0) {
                        setConnectionState(ConnectionState.LISTENING);
                    }
                };
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                playingSourcesRef.current.add(source);
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session error:', e);
            let userMessage = `An error occurred: ${e.message}. Please try again.`;
            // Network or auth errors often relate to the API key.
            if (
              e.message.includes('API key not valid') ||
              e.message.includes('Requested entity was not found') ||
              e.message.includes('Network error')
            ) {
              userMessage = 'There was an issue with your API key or network connection. Please re-select your API key and try again.';
              setIsApiKeySelected(false); // Reset to force re-selection.
            }
            alert(userMessage);
            cleanup();
          },
          onclose: () => {
            console.log('Session closed.');
            cleanup();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          tools: [{functionDeclarations: [navigateToMapView]}],
          systemInstruction: `You are a world-class supply chain risk analyst AI assistant. Your name is ChainGuard. You provide concise, data-driven insights to help specialists understand and mitigate risks based on this data:
          Products at Risk: ${JSON.stringify(PRODUCT_RISKS)}
          Relevant World Events: ${JSON.stringify(WORLD_EVENTS)}
          Warehouse Locations & Stock: ${JSON.stringify(WAREHOUSE_DATA)}
          You have a tool available: "navigateToMapView". Call this function when the user asks to see warehouse locations, stock locations on a map, or a similar request. Inform the user that you are showing them the map.
          Keep your answers brief and to the point. Start the conversation by introducing yourself and asking how you can help.`,
        },
      });

      sessionRef.current = await sessionPromise;

    } catch (error) {
      console.error("Failed to start conversation:", error);
      alert("Could not start the conversation. Please ensure you have given microphone permissions and have a valid API key.");
      cleanup();
    }
  }, [cleanup, connectionState]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (isCheckingApiKey) {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center">
            <p>Checking API Key...</p>
        </div>
    );
  }

  if (!isApiKeySelected) {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center border border-gray-700 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4 text-white">API Key Required</h2>
                <p className="text-gray-400 mb-6">
                  This application uses the Gemini API, which requires a user-selected API key to proceed.
                </p>
                <button
                    onClick={handleSelectApiKey}
                    className="w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors">
                    Select API Key
                </button>
                <p className="text-xs text-gray-500 mt-4">
                    For more information on billing, please visit{' '}
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-400">
                      ai.google.dev/gemini-api/docs/billing
                    </a>.
                </p>
            </div>
        </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">Supply Chain Risk - Interactive Audio AI agent</h1>
          <p className="text-gray-400 mt-1">Analysis powered by Gemini 2.5 Native Audio</p>
        </header>
        <main>
            {currentView === View.DASHBOARD ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <RiskChart data={PRODUCT_RISKS} />
                        <EventsFeed events={WORLD_EVENTS} />
                    </div>
                    <div className="lg:col-span-1">
                        <ConversationPanel 
                            transcript={transcript} 
                            connectionState={connectionState} 
                            onToggleConversation={handleToggleConversation} 
                        />
                    </div>
                </div>
            ) : (
                <MapView onNavigateBack={() => setCurrentView(View.DASHBOARD)} />
            )}
        </main>
      </div>
    </div>
  );
};

export default App;