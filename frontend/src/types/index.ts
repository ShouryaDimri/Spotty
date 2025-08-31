export interface Song {
    _id: string;
    title: string;
    artist: string;
    audioUrl: string;
    imageUrl: string;
    duration: number;
    albumId: string | null;
    createdAt: Date;
    updatedAt: Date;
}



export interface Album {
    _id: string;
    title: string;
    imageUrl: string;
    artist: string;
    songs: Song[];
    releaseYear: number;
}