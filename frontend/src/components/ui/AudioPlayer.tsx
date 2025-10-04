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
		<div className="audio-player fixed bottom-0 left-0 right-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-t border-zinc-700/50 backdrop-blur-xl shadow-2xl">
			<audio ref={audioRef} />
			
			{/* Queue Component */}
			<Queue isOpen={showQueue} onClose={() => setShowQueue(false)} />
			
			{/* Subtle gradient overlay */}
			<div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-purple-500/5 pointer-events-none" />
			
			<div className="relative flex items-center justify-between px-8 py-5 h-20">
				{/* Left Section - Song Info & Like */}
				<div className="flex items-center gap-5 min-w-0 w-[30%]">
					<div className="relative group">
						<div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl opacity-75 blur-sm group-hover:opacity-100 transition-opacity" />
						<div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-2xl">
							<img
								src={displaySong.imageUrl || '/cover-images/1.jpg'}
								alt={displaySong.title}
								className="w-full h-full object-cover"
								onError={(e) => {
									e.currentTarget.src = '/cover-images/1.jpg';
								}}
							/>
						</div>
					</div>
					<div className="min-w-0 flex-1">
						<h4 className="text-white text-lg font-semibold truncate mb-1">{displaySong.title}</h4>
						<p className="text-zinc-400 text-sm truncate font-medium">{displaySong.artist}</p>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleLike}
						className={`transition-all duration-300 hover:scale-110 rounded-full ${
							isLiked 
								? 'text-red-500 hover:text-red-400 bg-red-500/10' 
								: 'text-zinc-400 hover:text-red-500 hover:bg-red-500/10'
						}`}
					>
						<Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
					</Button>
				</div>

				{/* Center Section - Player Controls */}
				<div className="flex flex-col items-center gap-3 flex-1 max-w-full">
					{/* Control Buttons */}
					<div className="flex items-center gap-8">
						<Button
							size="icon"
							variant="ghost"
							onClick={toggleShuffle}
							className={`transition-all duration-300 hover:scale-110 rounded-full ${
								isShuffled 
									? 'text-green-400 hover:text-green-300 bg-green-500/20' 
									: 'text-zinc-400 hover:text-white hover:bg-zinc-700/30'
							}`}
						>
							<Shuffle className="h-4 w-4" />
						</Button>

						<Button
							size="icon"
							variant="ghost"
							onClick={playPrevious}
							disabled={!currentSong}
							className="transition-all duration-300 hover:scale-110 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700/30 disabled:text-zinc-600 disabled:cursor-not-allowed"
						>
							<SkipBack className="h-5 w-5" />
						</Button>

						{/* Enhanced Play Button */}
						<div className="relative group">
							<div className="absolute -inset-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-30 blur-md group-hover:opacity-50 transition-all duration-500" />
							<div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-75 blur-sm group-hover:opacity-100 transition-all duration-300" />
							{isPlaying && (
								<div className="absolute -inset-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-20 animate-ping" />
							)}
							<Button
								size="icon"
								onClick={togglePlay}
								disabled={!currentSong}
								className={`relative w-14 h-14 shadow-2xl hover:scale-110 transition-all duration-300 rounded-full border-2 border-white/10 ${
									currentSong 
										? 'bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:from-green-400 hover:to-emerald-400' 
										: 'bg-zinc-700/50 text-zinc-500 cursor-not-allowed'
								}`}
							>
								{isPlaying ? (
									<Pause className="h-7 w-7" />
								) : (
									<Play className="h-7 w-7 ml-0.5" />
								)}
							</Button>
						</div>

						<Button
							size="icon"
							variant="ghost"
							onClick={playNext}
							disabled={!currentSong}
							className="transition-all duration-300 hover:scale-110 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700/30 disabled:text-zinc-600 disabled:cursor-not-allowed"
						>
							<SkipForward className="h-5 w-5" />
						</Button>

						<Button
							size="icon"
							variant="ghost"
							onClick={toggleRepeat}
							className={`transition-all duration-300 hover:scale-110 rounded-full ${
								repeatMode !== 'none' 
									? 'text-green-400 hover:text-green-300 bg-green-500/20' 
									: 'text-zinc-400 hover:text-white hover:bg-zinc-700/30'
							}`}
						>
							<Repeat className="h-4 w-4" />
						</Button>
					</div>

					{/* Enhanced Progress Bar */}
					<div className="flex items-center gap-4 w-full max-w-lg">
						<span className="text-sm text-zinc-300 w-14 text-right font-mono tracking-wide">
							{currentSong ? formatTime(currentTime) : '0:00'}
						</span>
						
						<div className="relative flex-1 group">
							<div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300" />
							<div
								className={`relative h-2 rounded-full overflow-hidden shadow-inner backdrop-blur-sm border border-zinc-600/50 ${
									currentSong 
										? 'bg-gradient-to-r from-zinc-700 to-zinc-600 cursor-pointer' 
										: 'bg-zinc-800 cursor-not-allowed'
								}`}
								onClick={currentSong ? handleSeek : undefined}
							>
								<div
									className={`h-full rounded-full relative transition-all duration-200 shadow-lg ${
										currentSong 
											? 'bg-gradient-to-r from-green-400 via-emerald-400 to-green-500' 
											: 'bg-zinc-700'
									}`}
									style={{ 
										width: `${currentSong && duration && isFinite(duration) && duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0}%` 
									}}
								>
									{currentSong && (
										<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
									)}
								</div>
							</div>
						</div>
						
						<span className="text-sm text-zinc-300 w-14 font-mono tracking-wide">
							{currentSong ? formatTime(duration) : '0:00'}
						</span>
					</div>
				</div>

				{/* Right Section - Volume & Queue */}
				<div className="flex items-center gap-6 w-[30%] justify-end">
					{/* Volume Control */}
					<div className="flex items-center gap-3">
						<Volume2 className="h-5 w-5 text-zinc-400" />
						<div className="relative w-24">
							<input
								type="range"
								min="0"
								max="1"
								step="0.01"
								value={volume}
								onChange={(e) => setVolume(parseFloat(e.target.value))}
								className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
								style={{
									background: `linear-gradient(to right, rgb(34 197 94) 0%, rgb(34 197 94) ${volume * 100}%, rgb(63 63 70) ${volume * 100}%, rgb(63 63 70) 100%)`
								}}
							/>
						</div>
					</div>

					{/* Queue Button */}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setShowQueue(!showQueue)}
						className={`transition-all duration-300 hover:scale-110 rounded-full ${
							showQueue 
								? 'text-green-400 hover:text-green-300 bg-green-500/20' 
								: 'text-zinc-400 hover:text-white hover:bg-zinc-700/30'
						}`}
					>
						<List className="h-5 w-5" />
						{currentSong && queue.length > 0 && (
							<span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 text-black text-xs rounded-full flex items-center justify-center font-bold">
								{queue.length}
							</span>
						)}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AudioPlayer;