export const FALLBACK_SONGS = [
  {
    _id: "68e02cff08d1de95848e68e1",
    title: "Stay With Me",
    artist: "Sarah Mitchell",
    imageUrl: "/cover-images/1.jpg",
    audioUrl: "/songs/1.mp3",
    duration: 46
  },
  {
    _id: "68e02cff08d1de95848e68e2",
    title: "Midnight Drive",
    artist: "The Wanderers",
    imageUrl: "/cover-images/2.jpg",
    audioUrl: "/songs/2.mp3",
    duration: 41
  },
  {
    _id: "68e02cff08d1de95848e68e3",
    title: "Lost in Tokyo",
    artist: "Electric Dreams",
    imageUrl: "/cover-images/3.jpg",
    audioUrl: "/songs/3.mp3",
    duration: 24
  },
  {
    _id: "68e02cff08d1de95848e68e4",
    title: "Summer Daze",
    artist: "Coastal Kids",
    imageUrl: "/cover-images/4.jpg",
    audioUrl: "/songs/4.mp3",
    duration: 24
  },
  {
    _id: "68e02cff08d1de95848e68e5",
    title: "Neon Lights",
    artist: "Night Runners",
    imageUrl: "/cover-images/5.jpg",
    audioUrl: "/songs/5.mp3",
    duration: 36
  },
  {
    _id: "68e02cff08d1de95848e68e6",
    title: "Mountain High",
    artist: "The Wild Ones",
    imageUrl: "/cover-images/6.jpg",
    audioUrl: "/songs/6.mp3",
    duration: 40
  }
];

export const FALLBACK_ALBUMS = [
  {
    _id: "68e02cff08d1de95848e6d1",
    title: "Urban Nights",
    artist: "Various Artists",
    imageUrl: "/albums/1.jpg",
    releaseYear: 2024,
    songs: FALLBACK_SONGS.slice(0, 3)
  },
  {
    _id: "68e02cff08d1de95848e6d2",
    title: "Coastal Dreaming",
    artist: "Various Artists",
    imageUrl: "/albums/2.jpg",
    releaseYear: 2024,
    songs: FALLBACK_SONGS.slice(3, 6)
  }
];
