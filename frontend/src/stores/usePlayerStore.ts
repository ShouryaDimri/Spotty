import type { Song } from "@/types";
import { create } from "zustand";

interface PlayerStore {
	currentSong: Song | null;
	isPlaying: boolean;
	queue: Song[];
	currentIndex: number;
	currentUserId: string | null;

	initializeQueue: (songs: Song[]) => void;
	playAlbum: (songs: Song[], startIndex?: number) => void;
	setCurrentSong: (song: Song | null) => void;
	togglePlay: () => void;
	playNext: () => void;
	playPrevious: () => void;
	setUserId: (userId: string | null) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	currentSong: null,
	isPlaying: false,
	queue: [],
	currentIndex: -1,
	currentUserId: null,

	initializeQueue: (songs: Song[]) => {
		set({
			queue: songs,
			currentSong: get().currentSong || songs[0],
			currentIndex: get().currentIndex === -1 ? 0 : get().currentIndex,
		});
	},

	playAlbum: async (songs: Song[], startIndex = 0) => {
		if (songs.length === 0) return;

		const song = songs[startIndex];

		// Share current song if user is set
		const userId = get().currentUserId;
		if (userId) {
			try {
				const { io } = await import("socket.io-client");
				const socket = io("http://localhost:5137");
				socket.emit('user_song_update', {
					userId,
					song: {
						title: song.title,
						artist: song.artist,
						imageUrl: song.imageUrl
					}
				});
				socket.disconnect();
			} catch (error) {
				console.log('Error sharing song status:', error);
			}
		}

		set({
			queue: songs,
			currentSong: song,
			currentIndex: startIndex,
			isPlaying: true,
		});
	},

	setCurrentSong: async (song: Song | null) => {
		if (!song) return;

		// Share current song if user is set
		const userId = get().currentUserId;
		if (userId) {
			try {
				const { io } = await import("socket.io-client");
				const socket = io("http://localhost:5137");
				socket.emit('user_song_update', {
					userId,
					song: {
						title: song.title,
						artist: song.artist,
						imageUrl: song.imageUrl
					}
				});
				socket.disconnect();
			} catch (error) {
				console.log('Error sharing song status:', error);
			}
		}

		const songIndex = get().queue.findIndex((s) => s._id === song._id);
		set({
			currentSong: song,
			isPlaying: true,
			currentIndex: songIndex !== -1 ? songIndex : get().currentIndex,
		});
	},

	togglePlay: () => {
		const willStartPlaying = !get().isPlaying;
		set({
			isPlaying: willStartPlaying,
		});
	},

	playNext: () => {
		const { currentIndex, queue } = get();
		const nextIndex = currentIndex + 1;

		if (nextIndex < queue.length) {
			const nextSong = queue[nextIndex];
			set({
				currentSong: nextSong,
				currentIndex: nextIndex,
				isPlaying: true,
			});
		} else {
			set({ isPlaying: false });
		}
	},

	playPrevious: () => {
		const { currentIndex, queue } = get();
		const prevIndex = currentIndex - 1;

		if (prevIndex >= 0) {
			const prevSong = queue[prevIndex];
			set({
				currentSong: prevSong,
				currentIndex: prevIndex,
				isPlaying: true,
			});
		} else {
			set({ isPlaying: false });
		}
	},

	setUserId: (userId: string | null) => {
		set({ currentUserId: userId });
	},
}));