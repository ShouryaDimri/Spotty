import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader, Music, Users, Disc, TrendingUp, Plus, Trash2, Heart } from "lucide-react";
import type { Song, Album } from "@/types";

interface Stats {
	totalSongs: number;
	totalUsers: number;
	totalAlbums: number;
	totalArtists: number;
}

const AdminPg = () => {
	const [stats, setStats] = useState<Stats | null>(null);
	const [songs, setSongs] = useState<Song[]>([]);
	const [albums, setAlbums] = useState<Album[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<"overview" | "songs" | "albums">("overview");

	useEffect(() => {
		fetchAdminData();
	}, []);

		const fetchAdminData = async () => {
		try {
			console.log("Fetching admin data...");
			
			const [statsRes, songsRes, albumsRes] = await Promise.all([
				axiosInstance.get("/statistics"),
				axiosInstance.get("/songs"),
				axiosInstance.get("/albums")
			]);

			console.log("Admin data responses:", { statsRes, songsRes, albumsRes });

			// Handle new response format with proper type assertions
			const statsData = statsRes.data as any;
			const songsData = songsRes.data as any;
			const albumsData = albumsRes.data as any;
			
			console.log("Processed data:", { statsData, songsData, albumsData });
			
			setStats(statsData.success ? statsData : statsData);
			setSongs(songsData.success ? (Array.isArray(songsData.data) ? songsData.data : []) : (Array.isArray(songsData) ? songsData : []));
			setAlbums(albumsData.success ? (Array.isArray(albumsData.data) ? albumsData.data : []) : (Array.isArray(albumsData) ? albumsData : []));
			
			console.log("Admin data set successfully");
		} catch (error) {
			console.error("Error fetching admin data:", error);
			// Set fallback values
			setStats({ totalSongs: 0, totalUsers: 0, totalAlbums: 0, totalArtists: 0 });
			setSongs([]);
			setAlbums([]);
		} finally {
			setIsLoading(false);
		}
	};

	const deleteSong = async (songId: string) => {
		try {
			await axiosInstance.delete(`/admin/songs/${songId}`);
			setSongs(songs.filter(song => song._id !== songId));
		} catch (error) {
			console.error("Error deleting song:", error);
		}
	};

	const deleteAlbum = async (albumId: string) => {
		try {
			await axiosInstance.delete(`/admin/albums/${albumId}`);
			setAlbums(albums.filter(album => album._id !== albumId));
		} catch (error) {
			console.error("Error deleting album:", error);
		}
	};

	if (isLoading) {
		return (
			<div className="h-full flex items-center justify-center">
				<Loader className="size-8 text-green-500 animate-spin" />
			</div>
		);
	}

	return (
		<div className="h-full bg-[#121212] p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
				<p className="text-sm text-zinc-400">Overview & management of your music catalog</p>
			</div>

			{/* Tab Navigation */}
			<div className="flex gap-2 mb-6">
				<Button
					variant="ghost"
					onClick={() => setActiveTab("overview")}
					className={`rounded-full text-sm ${activeTab === "overview" ? "bg-[#282828] text-white" : "text-zinc-400 hover:text-white hover:bg-[#181818]"}`}
				>
					Overview
				</Button>
				<Button
					variant="ghost"
					onClick={() => setActiveTab("songs")}
					className={`rounded-full text-sm ${activeTab === "songs" ? "bg-[#282828] text-white" : "text-zinc-400 hover:text-white hover:bg-[#181818]"}`}
				>
					Songs
				</Button>
				<Button
					variant="ghost"
					onClick={() => setActiveTab("albums")}
					className={`rounded-full text-sm ${activeTab === "albums" ? "bg-[#282828] text-white" : "text-zinc-400 hover:text-white hover:bg-[#181818]"}`}
				>
					Albums
				</Button>
				<Button
					variant="ghost"
					onClick={() => setActiveTab("liked")}
					className={`rounded-full text-sm ${activeTab === "liked" ? "bg-[#282828] text-white" : "text-zinc-400 hover:text-white hover:bg-[#181818]"}`}
				>
					<Heart className="h-4 w-4 mr-1.5 text-red-500" />
					Top Liked
				</Button>
			</div>

			<ScrollArea className="h-[calc(100vh-220px)]">
				<div className="pb-24">
				{activeTab === "overview" && (
					<div className="space-y-6">
						{/* Stats Cards */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							<Card className="bg-[#181818] border-[#282828]">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-xs font-medium text-zinc-400">Total Songs</CardTitle>
									<Music className="h-4 w-4 text-[#1db954]" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-white">{stats?.totalSongs || songs.length || 0}</div>
								</CardContent>
							</Card>

							<Card className="bg-[#181818] border-[#282828]">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-xs font-medium text-zinc-400">Total Albums</CardTitle>
									<Disc className="h-4 w-4 text-blue-400" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-white">{stats?.totalAlbums || albums.length || 0}</div>
								</CardContent>
							</Card>

							<Card className="bg-[#181818] border-[#282828]">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-xs font-medium text-zinc-400">Total Users</CardTitle>
									<Users className="h-4 w-4 text-purple-400" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
								</CardContent>
							</Card>

							<Card className="bg-[#181818] border-[#282828]">
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-xs font-medium text-zinc-400">Total Artists</CardTitle>
									<TrendingUp className="h-4 w-4 text-amber-400" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-white">{stats?.totalArtists || 0}</div>
								</CardContent>
							</Card>
						</div>

						{/* Recent Songs */}
						<Card className="bg-[#181818] border-[#282828]">
							<CardHeader>
								<CardTitle className="text-white text-base">Recent Catalog Songs</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{songs.slice(0, 5).map((song) => (
										<div key={song._id} className="flex items-center gap-3 p-2 rounded hover:bg-[#282828] transition-colors">
											<img
												src={song.imageUrl || '/cover-images/1.jpg'}
												alt={song.title}
												className="w-10 h-10 rounded object-cover flex-shrink-0 bg-zinc-800"
											/>
											<div className="flex-1 min-w-0">
												<p className="text-white font-medium text-sm truncate">{song.title}</p>
												<p className="text-zinc-400 text-xs truncate">{song.artist}</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{activeTab === "songs" && (
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<h2 className="text-lg font-bold text-white">Songs Management</h2>
						</div>

						<div className="space-y-2">
							{songs.map((song) => (
								<Card key={song._id} className="bg-[#181818] border-[#282828]">
									<CardContent className="flex items-center gap-4 p-3">
										<img
											src={song.imageUrl || '/cover-images/1.jpg'}
											alt={song.title}
											className="w-12 h-12 rounded object-cover flex-shrink-0 bg-zinc-800"
										/>
										<div className="flex-1 min-w-0">
											<h3 className="text-white font-medium text-sm truncate">{song.title}</h3>
											<p className="text-zinc-400 text-xs truncate">{song.artist}</p>
										</div>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => deleteSong(song._id)}
											className="rounded-full bg-red-600/80 hover:bg-red-600 text-white"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				)}

				{activeTab === "albums" && (
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<h2 className="text-lg font-bold text-white">Albums Management</h2>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{albums.map((album) => (
								<Card key={album._id} className="bg-[#181818] border-[#282828] flex flex-col justify-between">
									<CardContent className="p-4">
										<img
											src={album.imageUrl || '/cover-images/1.jpg'}
											alt={album.title}
											className="w-full aspect-square object-cover rounded mb-3 bg-zinc-800"
										/>
										<h3 className="text-white font-medium text-sm truncate mb-0.5">{album.title}</h3>
										<p className="text-zinc-400 text-xs truncate mb-2">{album.artist}</p>
										<p className="text-zinc-500 text-xs mb-3">{album.releaseYear} • {album.songs?.length || 0} songs</p>
										<Button
											variant="destructive"
											size="sm"
											className="w-full rounded-full bg-red-600/80 hover:bg-red-600 text-white"
											onClick={() => deleteAlbum(album._id)}
										>
											<Trash2 className="h-4 w-4 mr-2" />
											Delete Album
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				)}

				{activeTab === "liked" && (
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<h2 className="text-lg font-bold text-white">Most Liked Songs</h2>
						</div>

						<div className="space-y-2">
							{songs
								.sort((a, b) => (b.likes || 0) - (a.likes || 0))
								.map((song, index) => (
								<Card key={song._id} className="bg-[#181818] border-[#282828]">
									<CardContent className="flex items-center gap-4 p-3">
										<div className="flex items-center gap-3">
											<span className="text-sm font-bold text-[#1db954] w-6 text-center">
												#{index + 1}
											</span>
											<img
												src={song.imageUrl || '/cover-images/1.jpg'}
												alt={song.title}
												className="w-10 h-10 rounded object-cover flex-shrink-0 bg-zinc-800"
											/>
										</div>
										<div className="flex-1 min-w-0">
											<h3 className="text-white font-medium text-sm truncate">{song.title}</h3>
											<p className="text-zinc-400 text-xs truncate">{song.artist}</p>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				)}
				</div>
			</ScrollArea>
		</div>
	);
};

export default AdminPg;