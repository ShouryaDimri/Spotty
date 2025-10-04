import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import type { Song, Album } from "@/types";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const SearchPg = () => {
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
		<div className="h-full">
			<div className="p-4 lg:p-6">
				{/* Search Input */}
				<div className="relative mb-6">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
					<input
						type="text"
						placeholder="Search for songs, albums, or artists..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
					/>
				</div>

				<ScrollArea className="h-[calc(100vh-140px)] overflow-y-auto max-h-[calc(100vh-140px)]">
					<div className="pb-24">
					{isLoading ? (
						<div className="flex justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
						</div>
					) : (
						<div className="space-y-6">
							{/* Songs Results */}
							{searchResults.songs.length > 0 && (
								<section>
									<h2 className="text-xl font-bold text-white mb-4">Songs</h2>
									<div className="space-y-2">
										{searchResults.songs.map((song, index) => {
											const isCurrentSong = currentSong?._id === song._id;
											return (
												<div
													key={song._id}
													className="flex items-center gap-3 p-3 rounded-md hover:bg-zinc-800/50 group cursor-pointer"
													onClick={() => handlePlaySong(searchResults.songs, index)}
												>
													<div className="relative flex-shrink-0">
														<img
															src={song.imageUrl}
															alt={song.title}
															className="w-12 h-12 rounded-md object-cover"
														/>
														<div className={`absolute inset-0 flex items-center justify-center bg-black/40 rounded-md ${
															isCurrentSong && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
														} transition-opacity`}>
															{isCurrentSong && isPlaying ? (
																<Pause className="h-5 w-5 text-white" />
															) : (
																<Play className="h-5 w-5 text-white" />
															)}
														</div>
													</div>
													
													<div className="min-w-0 flex-1">
														<h3 className="font-medium text-white truncate">{song.title}</h3>
														<p className="text-sm text-zinc-400 truncate">{song.artist}</p>
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
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
										{searchResults.albums.map((album) => (
											<div
												key={album._id}
												className="bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer"
												onClick={() => window.location.href = `/albums/${album._id}`}
											>
												<div className="relative mb-4">
													<img
														src={album.imageUrl}
														alt={album.title}
														className="w-full aspect-square object-cover rounded-md"
													/>
													<Button
														size="icon"
														className="absolute bottom-2 right-2 bg-green-500 hover:bg-green-400 text-black opacity-0 group-hover:opacity-100 transition-all hover:scale-105"
													>
														<Play className="h-5 w-5" />
													</Button>
												</div>
												<h3 className="font-medium text-white mb-2 truncate">{album.title}</h3>
												<p className="text-sm text-zinc-400 truncate">{album.artist} • {album.releaseYear}</p>
											</div>
										))}
									</div>
								</section>
							)}

							{/* No Results */}
							{query && !isLoading && searchResults.songs.length === 0 && searchResults.albums.length === 0 && (
								<div className="text-center py-8">
									<h3 className="text-lg font-medium text-white mb-2">No results found</h3>
									<p className="text-zinc-400">Try searching for something else</p>
								</div>
							)}

							{/* Empty State */}
							{!query && (
								<div className="text-center py-8">
									<Search className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-white mb-2">Search Spotty</h3>
									<p className="text-zinc-400">Find your favorite songs, albums, and artists</p>
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