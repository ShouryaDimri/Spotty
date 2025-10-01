import { axiosInstance } from "@/lib/axios";
import type { Album, Song } from "@/types";
import {create} from "zustand";


interface MusicStore {
    albums: Album[];
    songs: Song[];
    isLoading: boolean;
    error: string | null;
    currAlbum: Album | null;

    fetchAlbums: () => Promise<void>;
    fetchAlbumById: (id: string) => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set) => ({
    albums:[],
    songs: [],
    isLoading: false,
    error: null,
    currAlbum: null,

    fetchAlbums: async() => {
        set({
            isLoading: true, error:null
        })
		try {
			const response = await axiosInstance.get<Album[]>("/albums")
			set({
				albums: response.data
			})
        } catch (error: any) {
            set({
                error : error.response?.data?.message || error.message || 'Failed to fetch albums'
            })
        }finally{
            set({
                isLoading: false
            })
        }
    },
    fetchAlbumById: async(id: string) => {
        set({
            isLoading: true, error:null
        })
		try {
			const response = await axiosInstance.get<Album>(`/albums/${id}`)
			set({
				currAlbum: response.data
			})
        } catch (error: any) {
            set({
                error : error.response?.data?.message || error.message || 'Failed to fetch albums'
            })
        }finally{
            set({
                isLoading: false
            })
        }
    }
}))