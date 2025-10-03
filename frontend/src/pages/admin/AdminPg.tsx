import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader, Music, Users, Disc, TrendingUp, Plus, Trash2 } from "lucide-react";
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
			const [statsRes, songsRes, albumsRes] = await Promise.all([
				axiosInstance.get("/statistics"),
				axiosInstance.get("/songs"),
				axiosInstance.get("/albums")
			]);

			// Handle new response format with proper type assertions
			const statsData = statsRes.data as any;
			const songsData = songsRes.data as any;
			const albumsData = albumsRes.data as any;
			
			setStats(statsData.success ? statsData : statsData);
			setSongs(songsData.success ? songsData.data : songsData);
			setAlbums(albumsData);
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
		<div className="h-full p-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
				<p className="text-zinc-400">Manage your music platform</p>
			</div>

			{/* Tab Navigation */}
			<div className="flex gap-4 mb-6">
				<Button
					variant={activeTab === "overview" ? "default" : "ghost"}
					onClick={() => setActiveTab("overview")}
					className="text-white"
				>
					Overview
				</Button>
				<Button
					variant={activeTab === "songs" ? "default" : "ghost"}
					onClick={() => setActiveTab("songs")}
					className="text-white"
				>
					Songs
				</Button>
				<Button
					variant={activeTab === "albums" ? "default" : "ghost"}
					onClick={() => setActiveTab("albums")}
					className="text-white"
				>
					Albums
				</Button>
			</div>

			<ScrollArea className="h-[calc(100vh-200px)]">
				{activeTab === "overview" && (
					<div className="space-y-6">
						{/* Stats Cards */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<Card className="bg-zinc-800 border-zinc-700">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium text-zinc-200">Total Songs</CardTitle>
									<Music className="h-4 w-4 text-green-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-white">{stats?.totalSongs || 0}</div>
								</CardContent>
							</Card>

							<Card className="bg-zinc-800 border-zinc-700">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium text-zinc-200">Total Albums</CardTitle>
									<Disc className="h-4 w-4 text-blue-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-white">{stats?.totalAlbums || 0}</div>
								</CardContent>
							</Card>

							<Card className="bg-zinc-800 border-zinc-700">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium text-zinc-200">Total Users</CardTitle>
									<Users className="h-4 w-4 text-purple-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
								</CardContent>
							</Card>

							<Card className="bg-zinc-800 border-zinc-700">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium text-zinc-200">Total Artists</CardTitle>
									<TrendingUp className="h-4 w-4 text-orange-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-white">{stats?.totalArtists || 0}</div>
								</CardContent>
							</Card>
						</div>

						{/* Recent Activity */}
						<Card className="bg-zinc-800 border-zinc-700">
							<CardHeader>
								<CardTitle className="text-white">Recent Songs</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{songs.slice(0, 5).map((song) => (
										<div key={song._id} className="flex items-center gap-3">
											<img
												src={song.imageUrl}
												alt={song.title}
												className="w-10 h-10 rounded-md object-cover"
											/>
											<div className="flex-1 min-w-0">
												<p className="text-white font-medium truncate">{song.title}</p>
												<p className="text-zinc-400 text-sm truncate">{song.artist}</p>
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
							<h2 className="text-xl font-bold text-white">Songs Management</h2>
							<Button className="bg-green-500 hover:bg-green-600 text-black">
								<Plus className="h-4 w-4 mr-2" />
								Add Song
							</Button>
						</div>

						<div className="space-y-2">
							{songs.map((song) => (
								<Card key={song._id} className="bg-zinc-800 border-zinc-700">
									<CardContent className="flex items-center gap-4 p-4">
										<img
											src={song.imageUrl}
											alt={song.title}
											className="w-12 h-12 rounded-md object-cover"
										/>
										<div className="flex-1 min-w-0">
											<h3 className="text-white font-medium truncate">{song.title}</h3>
											<p className="text-zinc-400 text-sm truncate">{song.artist}</p>
										</div>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => deleteSong(song._id)}
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
							<h2 className="text-xl font-bold text-white">Albums Management</h2>
							<Button className="bg-green-500 hover:bg-green-600 text-black">
								<Plus className="h-4 w-4 mr-2" />
								Add Album
							</Button>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{albums.map((album) => (
								<Card key={album._id} className="bg-zinc-800 border-zinc-700">
									<CardContent className="p-4">
										<img
											src={album.imageUrl}
											alt={album.title}
											className="w-full aspect-square object-cover rounded-md mb-4"
										/>
										<h3 className="text-white font-medium truncate mb-1">{album.title}</h3>
										<p className="text-zinc-400 text-sm truncate mb-2">{album.artist}</p>
										<p className="text-zinc-500 text-xs mb-4">{album.releaseYear} • {album.songs?.length || 0} songs</p>
										<Button
											variant="destructive"
											size="sm"
											className="w-full"
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
			</ScrollArea>
		</div>
	);
};

export default AdminPg;