import { usePlayerStore } from "@/stores/usePlayerStore";
import { Button } from "./button";
import { Pause, Play, SkipBack, SkipForward, Volume2, List, Shuffle, Repeat, Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatDuration } from "@/pages/album/AlbumPg";
import Queue from "./Queue";

const AudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(1);
	const [showQueue, setShowQueue] = useState(false);
	const [isShuffled, setIsShuffled] = useState(false);
	const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
	const [isLiked, setIsLiked] = useState(false);

	const { currentSong, isPlaying, playNext, playPrevious, togglePlay, queue } = usePlayerStore();

	// Update audio element when song changes
	useEffect(() => {
		if (audioRef.current && currentSong) {
			const audio = audioRef.current;
			audio.src = currentSong.audioUrl;
			
			// Reset time only when a new song is loaded
			audio.currentTime = 0;
			setCurrentTime(0);
			
			if (isPlaying) {
				audio.play().catch(console.error);
			}
		}
	}, [currentSong]);

	// Handle play/pause state changes
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		if (isPlaying) {
			audio.play().catch(console.error);
		} else {
			audio.pause();
		}
	}, [isPlaying]);

	// Audio event handlers
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const handleTimeUpdate = () => {
			if (!isNaN(audio.currentTime) && isFinite(audio.currentTime)) {
				setCurrentTime(audio.currentTime);
			}
		};

		const handleLoadedMetadata = () => {
			if (!isNaN(audio.duration) && isFinite(audio.duration)) {
				setDuration(audio.duration);
			} else {
				// Fallback to song duration from metadata
				if (currentSong?.duration) {
					setDuration(currentSong.duration);
				}
			}
		};

		const handleCanPlay = () => {
			// Additional check when audio can play
			if (!isNaN(audio.duration) && isFinite(audio.duration)) {
				setDuration(audio.duration);
			} else if (currentSong?.duration) {
				setDuration(currentSong.duration);
			}
		};

		const handleEnded = () => {
			playNext();
		};

		audio.addEventListener("timeupdate", handleTimeUpdate);
		audio.addEventListener("loadedmetadata", handleLoadedMetadata);
		audio.addEventListener("canplay", handleCanPlay);
		audio.addEventListener("ended", handleEnded);

		return () => {
			audio.removeEventListener("timeupdate", handleTimeUpdate);
			audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
			audio.removeEventListener("canplay", handleCanPlay);
			audio.removeEventListener("ended", handleEnded);
		};
	}, [playNext, currentSong]);

	// Handle volume changes
	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = volume;
		}
	}, [volume]);

	const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
		const audio = audioRef.current;
		if (!audio || !duration) return;

		const rect = e.currentTarget.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const width = rect.width;
		const newTime = (clickX / width) * duration;
		
		audio.currentTime = newTime;
		setCurrentTime(newTime);
	};

	// Format time for display
	const formatTime = (seconds: number) => {
		if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
		return formatDuration(Math.floor(seconds));
	};

	const toggleShuffle = () => {
		setIsShuffled(!isShuffled);
	};

	const toggleRepeat = () => {
		setRepeatMode(prev => {
			if (prev === 'none') return 'all';
			if (prev === 'all') return 'one';
			return 'none';
		});
	};

	const toggleLike = () => {
		setIsLiked(!isLiked);
	};

	// Create dummy song for when no song is selected
	const dummySong = {
		_id: 'dummy',
		title: 'No song selected',
		artist: 'Choose a song to play',
		imageUrl: '/cover-images/1.jpg',
		audioUrl: '',
		duration: 0
	};

	const displaySong = currentSong || dummySong;

	return (
		<div className="audio-player fixed bottom-0 left-0 right-0 bg-[#000000] border-t border-[#282828] select-none">
			<audio ref={audioRef} />
			
			{/* Queue Component */}
			<Queue isOpen={showQueue} onClose={() => setShowQueue(false)} />
			
			<div className="flex items-center justify-between px-4 lg:px-6 h-20">
				{/* Left Section - Song Info & Like */}
				<div className="flex items-center gap-3.5 min-w-0 w-[30%]">
					<div className="w-14 h-14 rounded bg-[#181818] overflow-hidden flex-shrink-0 border border-white/5">
						<img
							src={displaySong.imageUrl || '/cover-images/1.jpg'}
							alt={displaySong.title}
							className="w-full h-full object-cover"
							onError={(e) => {
								e.currentTarget.src = '/cover-images/1.jpg';
							}}
						/>
					</div>
					<div className="min-w-0 flex-1">
						<h4 className="text-white text-sm font-semibold truncate">{displaySong.title}</h4>
						<p className="text-zinc-400 text-xs truncate mt-0.5">{displaySong.artist}</p>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleLike}
						className={`transition-colors rounded-full hover:bg-[#181818] ${
							isLiked ? 'text-[#1db954]' : 'text-zinc-400 hover:text-white'
						}`}
					>
						<Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
					</Button>
				</div>

				{/* Center Section - Player Controls */}
				<div className="flex flex-col items-center gap-2 flex-1 max-w-xl px-2">
					{/* Control Buttons */}
					<div className="flex items-center gap-5">
						<Button
							size="icon"
							variant="ghost"
							onClick={toggleShuffle}
							className={`h-8 w-8 rounded-full transition-colors ${
								isShuffled ? 'text-[#1db954]' : 'text-zinc-400 hover:text-white'
							}`}
						>
							<Shuffle className="h-4 w-4" />
						</Button>

						<Button
							size="icon"
							variant="ghost"
							onClick={playPrevious}
							disabled={!currentSong}
							className="h-8 w-8 rounded-full text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
						>
							<SkipBack className="h-4 w-4" />
						</Button>

						{/* Play Button */}
						<Button
							size="icon"
							onClick={togglePlay}
							disabled={!currentSong}
							className={`w-9 h-9 rounded-full transition-transform hover:scale-105 active:scale-95 ${
								currentSong 
									? 'bg-[#1db954] text-black hover:bg-[#1ed760]' 
									: 'bg-[#282828] text-zinc-500 cursor-not-allowed'
							}`}
						>
							{isPlaying ? (
								<Pause className="h-4 w-4 fill-current" />
							) : (
								<Play className="h-4 w-4 fill-current ml-0.5" />
							)}
						</Button>

						<Button
							size="icon"
							variant="ghost"
							onClick={playNext}
							disabled={!currentSong}
							className="h-8 w-8 rounded-full text-zinc-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
						>
							<SkipForward className="h-4 w-4" />
						</Button>

						<Button
							size="icon"
							variant="ghost"
							onClick={toggleRepeat}
							className={`h-8 w-8 rounded-full transition-colors ${
								repeatMode !== 'none' ? 'text-[#1db954]' : 'text-zinc-400 hover:text-white'
							}`}
						>
							<Repeat className="h-4 w-4" />
						</Button>
					</div>

					{/* Progress Bar */}
					<div className="flex items-center gap-2.5 w-full">
						<span className="text-[11px] text-zinc-400 w-10 text-right font-mono">
							{currentSong ? formatTime(currentTime) : '0:00'}
						</span>
						
						<div
							className={`relative flex-1 h-1 rounded-full group cursor-pointer ${
								currentSong ? 'bg-zinc-800' : 'bg-zinc-900 cursor-not-allowed'
							}`}
							onClick={currentSong ? handleSeek : undefined}
						>
							<div
								className="h-full rounded-full bg-white group-hover:bg-[#1db954] transition-colors relative"
								style={{ 
									width: `${currentSong && duration && isFinite(duration) && duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0}%` 
								}}
							/>
						</div>
						
						<span className="text-[11px] text-zinc-400 w-10 font-mono">
							{currentSong ? formatTime(duration) : '0:00'}
						</span>
					</div>
				</div>

				{/* Right Section - Volume & Queue */}
				<div className="flex items-center gap-4 w-[30%] justify-end">
					{/* Volume Control */}
					<div className="flex items-center gap-2">
						<Volume2 className="h-4 w-4 text-zinc-400" />
						<input
							type="range"
							min="0"
							max="1"
							step="0.01"
							value={volume}
							onChange={(e) => setVolume(parseFloat(e.target.value))}
							className="w-20 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#1db954]"
						/>
					</div>

					{/* Queue Button */}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setShowQueue(!showQueue)}
						className={`h-8 w-8 rounded-full transition-colors relative ${
							showQueue ? 'text-[#1db954]' : 'text-zinc-400 hover:text-white'
						}`}
					>
						<List className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AudioPlayer;