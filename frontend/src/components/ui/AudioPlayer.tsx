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
		<div className="audio-player fixed bottom-0 left-0 right-0 bg-zinc-800 border-t border-zinc-600">
			<audio ref={audioRef} />
			
			{/* Queue Component */}
			<Queue isOpen={showQueue} onClose={() => setShowQueue(false)} />
			
			<div className="relative flex items-center justify-between px-6 py-4 h-20">
				{/* Left Section - Song Info & Like */}
				<div className="flex items-center gap-4 min-w-0 w-[30%]">
					<div className="relative">
						<div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-green-400 shadow-lg">
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
						<h4 className="text-white text-lg font-medium truncate">{displaySong.title}</h4>
						<p className="text-zinc-400 text-sm truncate">{displaySong.artist}</p>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleLike}
						className={`transition-all duration-200 hover:scale-110 ${
							isLiked 
								? 'text-red-500 hover:text-red-400' 
								: 'text-zinc-400 hover:text-red-500'
						}`}
					>
						<Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
					</Button>
				</div>

				{/* Center Section - Player Controls */}
				<div className="flex flex-col items-center gap-2 flex-1 max-w-full">
					{/* Control Buttons */}
					<div className="flex items-center gap-6">
						<Button
							size="icon"
							variant="ghost"
							onClick={toggleShuffle}
							className={`text-zinc-400 hover:text-white ${
								isShuffled ? 'text-green-400' : ''
							}`}
						>
							<Shuffle className="h-4 w-4" />
						</Button>

						<Button
							size="icon"
							variant="ghost"
							onClick={playPrevious}
							disabled={!currentSong}
							className="text-zinc-400 hover:text-white disabled:text-zinc-600"
						>
							<SkipBack className="h-5 w-5" />
						</Button>

						<Button
							size="icon"
							onClick={togglePlay}
							disabled={!currentSong}
							className={`w-12 h-12 rounded-full shadow-lg ${
								currentSong 
									? 'bg-green-500 hover:bg-green-400 text-black' 
									: 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
							}`}
						>
							{isPlaying ? (
								<Pause className="h-6 w-6" />
							) : (
								<Play className="h-6 w-6 ml-0.5" />
							)}
						</Button>

						<Button
							size="icon"
							variant="ghost"
							onClick={playNext}
							disabled={!currentSong}
							className="text-zinc-400 hover:text-white disabled:text-zinc-600"
						>
							<SkipForward className="h-5 w-5" />
						</Button>

						<Button
							size="icon"
							variant="ghost"
							onClick={toggleRepeat}
							className={`text-zinc-400 hover:text-white ${
								repeatMode !== 'none' ? 'text-green-400' : ''
							}`}
						>
							<Repeat className="h-4 w-4" />
						</Button>
					</div>

					{/* Progress Bar */}
					<div className="flex items-center gap-3 w-full max-w-md">
						<span className="text-sm text-zinc-400 w-12 text-right">
							{currentSong ? formatTime(currentTime) : '0:00'}
						</span>
						
						<div
							className="flex-1 h-1 bg-zinc-700 rounded-full cursor-pointer"
							onClick={currentSong ? handleSeek : undefined}
						>
							<div
								className="h-full bg-green-500 rounded-full transition-all duration-200"
								style={{ 
									width: `${currentSong && duration && isFinite(duration) && duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0}%` 
								}}
							/>
						</div>
						
						<span className="text-sm text-zinc-400 w-12">
							{currentSong ? formatTime(duration) : '0:00'}
						</span>
					</div>
				</div>

				{/* Right Section - Volume & Queue */}
				<div className="flex items-center gap-4 w-[30%] justify-end">
					{/* Volume Control */}
					<div className="flex items-center gap-2">
						<Volume2 className="h-5 w-5 text-zinc-400" />
						<div className="w-20">
							<input
								type="range"
								min="0"
								max="1"
								step="0.01"
								value={volume}
								onChange={(e) => setVolume(parseFloat(e.target.value))}
								className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
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
						className="text-zinc-400 hover:text-white"
					>
						<List className="h-5 w-5" />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AudioPlayer;