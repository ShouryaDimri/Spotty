import { useState } from "react";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import { X, Music, Play, Pause } from "lucide-react";
import { formatDuration } from "@/pages/album/AlbumPg";

interface QueueProps {
  isOpen: boolean;
  onClose: () => void;
}

const Queue = ({ isOpen, onClose }: QueueProps) => {
  const { queue, currentIndex, currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePlaySong = (index: number) => {
    if (index === currentIndex) {
      togglePlay();
    } else {
      playAlbum(queue, index);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="queue-backdrop fixed inset-0 bg-black/30" 
        onClick={handleBackdropClick}
        style={{ 
          zIndex: 999998
        }}
      />
      
      {/* Queue Panel */}
      <div 
        className="queue-panel fixed bottom-24 right-4 w-80 md:w-96 h-80 md:h-96 bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl shadow-2xl"
        style={{ zIndex: 999999 }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-purple-500/5 pointer-events-none rounded-xl" />
      
      {/* Header */}
      <div className="relative flex items-center justify-between p-4 border-b border-zinc-700/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse" />
          <h3 className="text-white font-semibold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
            Queue
          </h3>
          <span className="text-zinc-400 text-sm">({queue.length} songs)</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-zinc-400 hover:text-white hover:bg-zinc-700/50 w-8 h-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Queue List */}
      <ScrollArea className="h-64 md:h-72 p-2">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-zinc-600 to-zinc-500 rounded-full flex items-center justify-center mb-4">
              <Music className="h-8 w-8 text-zinc-300" />
            </div>
            <p className="text-zinc-400 font-medium">No songs in queue</p>
            <p className="text-zinc-500 text-sm mt-1">Start playing music to see your queue</p>
          </div>
        ) : (
          <div className="space-y-1">
            {queue.map((song, index) => {
              const isCurrentSong = index === currentIndex;
              const isPlaying = isCurrentSong && usePlayerStore.getState().isPlaying;
              
              return (
                <div
                  key={`${song._id}-${index}`}
                  onClick={() => handlePlaySong(index)}
                  className={`group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    isCurrentSong 
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30' 
                      : 'hover:bg-zinc-700/30'
                  }`}
                >
                  {/* Track Number / Play Icon */}
                  <div className="w-6 flex items-center justify-center text-sm">
                    {isCurrentSong && isPlaying ? (
                      <div className="flex gap-0.5">
                        <div className="w-0.5 h-3 bg-green-400 animate-pulse" />
                        <div className="w-0.5 h-3 bg-green-400 animate-pulse" style={{animationDelay: '0.1s'}} />
                        <div className="w-0.5 h-3 bg-green-400 animate-pulse" style={{animationDelay: '0.2s'}} />
                      </div>
                    ) : isCurrentSong ? (
                      <Pause className="h-3 w-3 text-green-400" />
                    ) : (
                      <>
                        <span className="text-zinc-400 group-hover:hidden">{index + 1}</span>
                        <Play className="h-3 w-3 text-zinc-400 hidden group-hover:block" />
                      </>
                    )}
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate text-sm ${
                      isCurrentSong ? 'text-green-400' : 'text-white'
                    }`}>
                      {song.title}
                    </p>
                    <p className="text-zinc-400 text-xs truncate">{song.artist}</p>
                  </div>

                  {/* Duration */}
                  <div className="text-zinc-400 text-xs font-mono">
                    {formatDuration(song.duration)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
      </div>
    </>
  );
};

export default Queue;