import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Clock, Pause, Play } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export const formatDuration = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const AlbumPage = () => {
	const { albumId } = useParams();
	const { fetchAlbumById, currAlbum, isLoading } = useMusicStore();
	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

	useEffect(() => {
		if (albumId) fetchAlbumById(albumId);
	}, [fetchAlbumById, albumId]);

	if (isLoading || !currAlbum) return null;

	const handlePlayAlbum = () => {
		if (!currAlbum) return;

		const iscurrAlbumPlaying = currAlbum?.songs.some((song) => song._id === currentSong?._id);
		if (iscurrAlbumPlaying) togglePlay();
		else {
			playAlbum(currAlbum?.songs, 0);
		}
	};

	const handlePlaySong = (index: number) => {
		if (!currAlbum) return;
		playAlbum(currAlbum?.songs, index);
	};

	return (
		<div className="h-full bg-[#121212]">
			<ScrollArea className="h-full">
				<div className="min-h-full pb-24">
					{/* Header */}
					<div className="flex flex-col md:flex-row items-start md:items-end p-6 gap-6 bg-[#181818] border-b border-[#282828]">
						<img
							src={currAlbum?.imageUrl || '/cover-images/1.jpg'}
							alt={currAlbum?.title}
							className="w-48 h-48 lg:w-56 lg:h-56 rounded-lg object-cover shadow-2xl flex-shrink-0 bg-zinc-800"
						/>
						<div className="flex flex-col justify-end">
							<p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Album</p>
							<h1 className="text-3xl lg:text-5xl font-bold text-white my-2">{currAlbum?.title}</h1>
							<div className="flex items-center gap-2 text-sm text-zinc-300 mt-1">
								<span className="font-semibold text-white">{currAlbum?.artist}</span>
								<span>•</span>
								<span>{currAlbum?.songs?.length || 0} songs</span>
								<span>•</span>
								<span>{currAlbum?.releaseYear}</span>
							</div>
						</div>
					</div>

					{/* Play action bar */}
					<div className="px-6 py-5 flex items-center gap-4">
						<Button
							onClick={handlePlayAlbum}
							size="icon"
							className="w-12 h-12 rounded-full bg-[#1db954] hover:bg-[#1ed760] hover:scale-105 transition-transform text-black shadow-lg"
						>
							{isPlaying && currAlbum?.songs.some((song) => song._id === currentSong?._id) ? (
								<Pause className="h-5 w-5 fill-current" />
							) : (
								<Play className="h-5 w-5 fill-current ml-0.5" />
							)}
						</Button>
					</div>

					{/* Table Section */}
					<div className="px-6">
						{/* Table Header */}
						<div className="grid grid-cols-[24px_4fr_2fr_1fr] gap-4 px-4 py-2 text-xs font-medium uppercase tracking-wider text-zinc-400 border-b border-white/10 select-none">
							<div>#</div>
							<div>Title</div>
							<div>Release Date</div>
							<div className="flex justify-end pr-2">
								<Clock className="h-4 w-4" />
							</div>
						</div>

						{/* Track List */}
						<div className="space-y-1 py-2">
							{currAlbum?.songs.map((song, index) => {
								const isCurrentSong = currentSong?._id === song._id;
								return (
									<div
										key={song._id}
										onClick={() => handlePlaySong(index)}
										className="grid grid-cols-[24px_4fr_2fr_1fr] gap-4 px-4 py-2.5 text-sm text-zinc-400 hover:bg-[#181818] rounded-md group cursor-pointer transition-colors items-center"
									>
										<div className="flex items-center justify-center font-mono text-xs">
											{isCurrentSong && isPlaying ? (
												<span className="text-[#1db954]">♫</span>
											) : (
												<span className="group-hover:hidden">{index + 1}</span>
											)}
											{!isCurrentSong && (
												<Play className="h-3.5 w-3.5 text-white fill-current hidden group-hover:block ml-0.5" />
											)}
										</div>

										<div className="flex items-center gap-3 min-w-0">
											<img src={song.imageUrl || '/cover-images/1.jpg'} alt={song.title} className="w-10 h-10 rounded object-cover flex-shrink-0 bg-zinc-800" />
											<div className="min-w-0">
												<div className={`font-medium truncate ${isCurrentSong ? 'text-[#1db954]' : 'text-white'}`}>
													{song.title}
												</div>
												<div className="text-xs text-zinc-400 truncate">{song.artist}</div>
											</div>
										</div>
										<div className="text-xs truncate">{song.createdAt ? song.createdAt.split("T")[0] : '-'}</div>
										<div className="text-xs font-mono text-right pr-2">{formatDuration(song.duration || 0)}</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
};
export default AlbumPage;
