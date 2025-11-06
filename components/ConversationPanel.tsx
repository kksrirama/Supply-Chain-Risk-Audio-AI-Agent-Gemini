
import React, { useRef, useEffect } from 'react';
import { TranscriptEntry, TranscriptSpeaker, ConnectionState } from '../types';

interface ConversationPanelProps {
  transcript: TranscriptEntry[];
  connectionState: ConnectionState;
  onToggleConversation: () => void;
}

const MicrophoneIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const StopIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
    </svg>
);


const StatusIndicator: React.FC<{ state: ConnectionState }> = ({ state }) => {
    let bgColor = 'bg-gray-500';
    let textColor = 'text-gray-200';
    let text = 'Disconnected';

    switch (state) {
        case ConnectionState.CONNECTING:
            bgColor = 'bg-yellow-500';
            text = 'Connecting...';
            break;
        case ConnectionState.CONNECTED:
        case ConnectionState.LISTENING:
            bgColor = 'bg-green-500';
            text = 'Listening...';
            break;
        case ConnectionState.SPEAKING:
            bgColor = 'bg-blue-500';
            text = 'AI Speaking...';
            break;
    }

    return (
        <div className="flex items-center space-x-2">
            <span className={`h-3 w-3 rounded-full ${bgColor} animate-pulse`}></span>
            <span className={`text-sm font-medium ${textColor}`}>{text}</span>
        </div>
    )
}

const ConversationPanel: React.FC<ConversationPanelProps> = ({ transcript, connectionState, onToggleConversation }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const isConnected = connectionState !== ConnectionState.DISCONNECTED;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-700 flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-200 flex justify-between items-center">
        <span>AI Analyst Console</span>
        <StatusIndicator state={connectionState} />
      </h2>
      <div ref={scrollRef} className="flex-grow bg-gray-900/50 rounded-lg p-4 space-y-4 overflow-y-auto border border-gray-700 mb-4 min-h-[200px] max-h-[calc(100vh-280px)]">
        {transcript.map((entry) => (
          <div key={entry.id} className={`flex items-start gap-3 ${entry.speaker === TranscriptSpeaker.User ? 'justify-end' : 'justify-start'}`}>
            {entry.speaker === TranscriptSpeaker.AI && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm flex-shrink-0">AI</div>
            )}
            <div className={`max-w-md p-3 rounded-lg ${entry.speaker === TranscriptSpeaker.User ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
              <p className="text-sm">{entry.text}</p>
            </div>
             {entry.speaker === TranscriptSpeaker.User && (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center font-bold text-sm flex-shrink-0">You</div>
            )}
          </div>
        ))}
        {transcript.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>Press "Start Conversation" to begin.</p>
            </div>
        )}
      </div>
      <button
        onClick={onToggleConversation}
        disabled={connectionState === ConnectionState.CONNECTING}
        className={`w-full py-3 px-4 rounded-lg text-white font-semibold flex items-center justify-center transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-wait
          ${isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
      >
        {isConnected ? <StopIcon className="mr-2"/> : <MicrophoneIcon className="mr-2" />}
        {isConnected ? 'Stop Conversation' : 'Start Conversation'}
      </button>
    </div>
  );
};

export default ConversationPanel;
