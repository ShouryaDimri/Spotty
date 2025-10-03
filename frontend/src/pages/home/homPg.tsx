import Topbar from "@/components/ui/topbar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"
import { axiosInstance } from "@/lib/axios"
import type { Song, Album } from "@/types"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { useMusicStore } from "@/stores/useMusicStore"
import { Button } from "@/components/ui/button"
import { Play, Pause, Clock, TrendingUp, Star, Music } from "lucide-react"
import { Loader } from "lucide-react"

const HomePg = () => {
  const [featuredSongs, setFeaturedSongs] = useState<Song[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { albums } = useMusicStore();
  const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [featuredRes, trendingRes] = await Promise.all([
          axiosInstance.get("/songs/made-for-you"),
          axiosInstance.get("/songs/trending")
        ]);
        
        setFeaturedSongs(Array.isArray(featuredRes.data) ? featuredRes.data : []);
        setTrendingSongs(Array.isArray(trendingRes.data) ? trendingRes.data : []);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handlePlaySong = (songs: Song[], index: number) => {
    const isCurrentSongPlaying = songs[index]._id === currentSong?._id;
    if (isCurrentSongPlaying) {
      togglePlay();
    } else {
      playAlbum(songs, index);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-20 blur-lg animate-pulse" />
          <Loader className="relative size-12 text-green-400 animate-spin" />
        </div>
        <p className="mt-4 text-zinc-400 font-medium">Loading your music...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <Topbar />
      
      <ScrollArea className="h-[calc(100vh-80px)] overflow-y-auto max-h-[calc(100vh-80px)]">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-purple-600/5 to-emerald-600/10" />
          <div className="relative px-4 lg:px-6 py-8 lg:py-12">
            <div className="max-w-4xl">
              <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-white via-white to-zinc-300 bg-clip-text text-transparent mb-4">
                Welcome back
              </h1>
              <p className="text-lg lg:text-xl text-zinc-400 max-w-2xl">
                Discover your next favorite song from our curated collection
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-6 pb-8 space-y-8">
          
          {/* Featured Songs Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <Star className="h-4 w-4 text-black" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">Made For You</h2>
                <p className="text-zinc-500 text-xs">Personalized picks</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredSongs.map((song, index) => {
                const isCurrentSong = currentSong?._id === song._id;
                return (
                  <div
                    key={song._id}
                    className="group relative bg-gradient-to-br from-zinc-800/40 via-zinc-800/30 to-zinc-900/40 p-6 rounded-2xl hover:from-zinc-700/50 hover:via-zinc-700/40 hover:to-zinc-800/50 transition-all duration-500 cursor-pointer border border-zinc-700/30 hover:border-zinc-600/50 hover:shadow-2xl hover:shadow-green-500/10"
                    onClick={() => handlePlaySong(featuredSongs, index)}
                  >
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative mb-6">
                      <div className="relative overflow-hidden rounded-xl">
                        <img
                          src={song.imageUrl}
                          alt={song.title}
                          className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      
                      {/* Enhanced Play Button */}
                      <div className="absolute bottom-3 right-3">
                        <div className={`relative group/play transition-all duration-300 ${
                          isCurrentSong && isPlaying ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'
                        }`}>
                          <div className="absolute -inset-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-30 blur-lg" />
                          <Button
                            size="icon"
                            className="relative bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black shadow-2xl hover:scale-110 transition-all duration-300 w-12 h-12 rounded-full"
                          >
                            {isCurrentSong && isPlaying ? (
                              <Pause className="h-5 w-5" />
                            ) : (
                              <Play className="h-5 w-5 ml-0.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative space-y-2">
                      <h3 className="font-semibold text-white truncate text-lg group-hover:text-green-400 transition-colors duration-300">{song.title}</h3>
                      <p className="text-zinc-400 truncate font-medium">{song.artist}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Trending Songs Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">Trending Now</h2>
                <p className="text-zinc-500 text-xs">What's hot right now</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingSongs.map((song, index) => {
                const isCurrentSong = currentSong?._id === song._id;
                return (
                  <div
                    key={song._id}
                    className="group relative bg-gradient-to-br from-zinc-800/40 via-zinc-800/30 to-zinc-900/40 p-6 rounded-2xl hover:from-zinc-700/50 hover:via-zinc-700/40 hover:to-zinc-800/50 transition-all duration-500 cursor-pointer border border-zinc-700/30 hover:border-zinc-600/50 hover:shadow-2xl hover:shadow-purple-500/10"
                    onClick={() => handlePlaySong(trendingSongs, index)}
                  >
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative mb-6">
                      <div className="relative overflow-hidden rounded-xl">
                        <img
                          src={song.imageUrl}
                          alt={song.title}
                          className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      
                      {/* Enhanced Play Button */}
                      <div className="absolute bottom-3 right-3">
                        <div className={`relative group/play transition-all duration-300 ${
                          isCurrentSong && isPlaying ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'
                        }`}>
                          <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-30 blur-lg" />
                          <Button
                            size="icon"
                            className="relative bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-2xl hover:scale-110 transition-all duration-300 w-12 h-12 rounded-full"
                          >
                            {isCurrentSong && isPlaying ? (
                              <Pause className="h-5 w-5" />
                            ) : (
                              <Play className="h-5 w-5 ml-0.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative space-y-2">
                      <h3 className="font-semibold text-white truncate text-lg group-hover:text-purple-400 transition-colors duration-300">{song.title}</h3>
                      <p className="text-zinc-400 truncate font-medium">{song.artist}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Popular Albums Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Music className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">Popular Albums</h2>
                <p className="text-zinc-500 text-xs">Complete collections</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {albums.slice(0, 4).map((album) => (
                <div
                  key={album._id}
                  className="group relative bg-gradient-to-br from-zinc-800/40 via-zinc-800/30 to-zinc-900/40 p-6 rounded-2xl hover:from-zinc-700/50 hover:via-zinc-700/40 hover:to-zinc-800/50 transition-all duration-500 cursor-pointer border border-zinc-700/30 hover:border-zinc-600/50 hover:shadow-2xl hover:shadow-blue-500/10"
                  onClick={() => window.location.href = `/albums/${album._id}`}
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative mb-6">
                    <div className="relative overflow-hidden rounded-xl">
                      <img
                        src={album.imageUrl}
                        alt={album.title}
                        className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* Enhanced Play Button */}
                    <div className="absolute bottom-3 right-3">
                      <div className="relative group/play scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-30 blur-lg" />
                        <Button
                          size="icon"
                          className="relative bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white shadow-2xl hover:scale-110 transition-all duration-300 w-12 h-12 rounded-full"
                        >
                          <Play className="h-5 w-5 ml-0.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative space-y-2">
                    <h3 className="font-semibold text-white truncate text-lg group-hover:text-blue-400 transition-colors duration-300">{album.title}</h3>
                    <p className="text-zinc-400 truncate font-medium">{album.artist} • {album.releaseYear}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </ScrollArea>
    </div>
  );
};

export default HomePg;