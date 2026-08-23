import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Play, Pause, Loader } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import type { Song, Album } from "@/types";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const SearchPg = () => {
	const navigate = useNavigate();
	const [query, setQuery] = useState("");
	const [searchResults, setSearchResults] = useState<{
		songs: Song[];
		albums: Album[];
	}>({
		songs: [],
		albums: []
	});
	const [isLoading, setIsLoading] = useState(false);
	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

	useEffect(() => {
		if (!query.trim()) {
			setSearchResults({ songs: [], albums: [] });
			return;
		}

		const searchTimer = setTimeout(async () => {
			setIsLoading(true);
			try {
				const [songsRes, albumsRes] = await Promise.all([
					axiosInstance.get(`/songs/search?q=${encodeURIComponent(query)}`),
					axiosInstance.get(`/albums/search?q=${encodeURIComponent(query)}`)
				]);
				
				setSearchResults({
					songs: Array.isArray(songsRes.data) ? songsRes.data : [],
					albums: Array.isArray(albumsRes.data) ? albumsRes.data : []
				});
			} catch (error) {
				console.error("Search error:", error);
				setSearchResults({ songs: [], albums: [] });
			} finally {
				setIsLoading(false);
			}
		}, 300);

		return () => clearTimeout(searchTimer);
	}, [query]);

	const handlePlaySong = (songs: Song[], index: number) => {
		const isCurrentSongPlaying = songs[index]._id === currentSong?._id;
		if (isCurrentSongPlaying) {
			togglePlay();
		} else {
			playAlbum(songs, index);
		}
	};

	return (
		<div className="h-full bg-[#121212]">
			<div className="p-6">
				{/* Search Input */}
				<div className="relative mb-6 max-w-2xl">
					<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
					<input
						type="text"
						placeholder="What do you want to listen to?"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="w-full pl-12 pr-4 py-3 bg-[#242424] border border-transparent hover:border-white/10 rounded-full text-white placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1db954]"
					/>
				</div>

				<ScrollArea className="h-[calc(100vh-160px)]">
					<div className="pb-24">
					{isLoading ? (
						<div className="flex justify-center py-12">
							<Loader className="animate-spin h-8 w-8 text-[#1db954]" />
						</div>
					) : (
						<div className="space-y-8">
							{/* Songs Results */}
							{searchResults.songs.length > 0 && (
								<section>
									<h2 className="text-xl font-bold text-white mb-4">Songs</h2>
									<div className="space-y-1">
										{searchResults.songs.map((song, index) => {
											const isCurrentSong = currentSong?._id === song._id;
											return (
												<div
													key={song._id}
													className="flex items-center gap-3 p-2.5 rounded-md hover:bg-[#1a1a1a] group cursor-pointer transition-colors"
													onClick={() => handlePlaySong(searchResults.songs, index)}
												>
													<div className="relative flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-zinc-800">
														<img
															src={song.imageUrl || '/cover-images/1.jpg'}
															alt={song.title}
															className="w-full h-full object-cover"
														/>
														<div className={`absolute inset-0 flex items-center justify-center bg-black/50 ${
															isCurrentSong && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
														} transition-opacity`}>
															{isCurrentSong && isPlaying ? (
																<Pause className="h-5 w-5 text-white fill-current" />
															) : (
																<Play className="h-5 w-5 text-white fill-current ml-0.5" />
															)}
														</div>
													</div>
													
													<div className="min-w-0 flex-1">
														<h3 className={`font-medium text-sm truncate ${isCurrentSong ? 'text-[#1db954]' : 'text-white'}`}>{song.title}</h3>
														<p className="text-xs text-zinc-400 truncate mt-0.5">{song.artist}</p>
													</div>
												</div>
											);
										})}
									</div>
								</section>
							)}

							{/* Albums Results */}
							{searchResults.albums.length > 0 && (
								<section>
									<h2 className="text-xl font-bold text-white mb-4">Albums</h2>
									<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
										{searchResults.albums.map((album) => (
											<div
												key={album._id}
												className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-colors group cursor-pointer border border-transparent hover:border-white/5 flex flex-col justify-between"
												onClick={() => navigate(`/albums/${album._id}`)}
											>
												<div className="relative mb-3">
													<div className="aspect-square rounded overflow-hidden bg-zinc-800">
														<img
															src={album.imageUrl || '/cover-images/1.jpg'}
															alt={album.title}
															className="w-full h-full object-cover"
														/>
													</div>
													<Button
														size="icon"
														className="absolute bottom-2 right-2 bg-[#1db954] hover:bg-[#1ed760] text-black opacity-0 group-hover:opacity-100 transition-all rounded-full shadow-lg"
													>
														<Play className="h-4 w-4 fill-current ml-0.5" />
													</Button>
												</div>
												<div>
													<h3 className="font-medium text-white text-sm truncate">{album.title}</h3>
													<p className="text-xs text-zinc-400 truncate mt-1">{album.artist} • {album.releaseYear}</p>
												</div>
											</div>
										))}
									</div>
								</section>
							)}

							{/* No Results */}
							{query && !isLoading && searchResults.songs.length === 0 && searchResults.albums.length === 0 && (
								<div className="text-center py-12">
									<h3 className="text-lg font-semibold text-white mb-1">No results found for "{query}"</h3>
									<p className="text-zinc-400 text-sm">Please check spelling or search for another keyword</p>
								</div>
							)}

							{/* Empty Search Prompt */}
							{!query && (
								<div className="text-center py-16">
									<Search className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
									<h3 className="text-lg font-semibold text-white mb-1">Search Spotty</h3>
									<p className="text-zinc-400 text-sm max-w-sm mx-auto">Find songs, albums, and artists in our streaming library</p>
								</div>
							)}
						</div>
					)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};

export default SearchPg;