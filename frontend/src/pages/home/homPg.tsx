import Topbar from "@/components/ui/topbar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState, useCallback } from "react"
import { axiosInstance } from "@/lib/axios"
import type { Song } from "@/types"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { useMusicStore } from "@/stores/useMusicStore"
import { Button } from "@/components/ui/button"
import { Play, Pause, TrendingUp, Star, Music, AlertCircle } from "lucide-react"
import { Loader } from "lucide-react"

const HomePg = () => {
  const [featuredSongs, setFeaturedSongs] = useState<Song[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const { albums } = useMusicStore();
  const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [featuredRes, trendingRes] = await Promise.all([
          axiosInstance.get("/songs/made-for-you"),
          axiosInstance.get("/songs/trending")
        ]);
        
        // Ensure we always have arrays
        const featuredData = featuredRes.data;
        const trendingData = trendingRes.data;
        
        setFeaturedSongs(Array.isArray(featuredData) ? featuredData : 
                        ((featuredData as any)?.data && Array.isArray((featuredData as any).data)) ? (featuredData as any).data : []);
        setTrendingSongs(Array.isArray(trendingData) ? trendingData : 
                        ((trendingData as any)?.data && Array.isArray((trendingData as any).data)) ? (trendingData as any).data : []);
      } catch (error: any) {
        console.error("Error fetching home data:", error);
        setError(error.response?.data?.message || "Failed to load music. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handlePlaySong = useCallback((songs: Song[], index: number) => {
    const isCurrentSongPlaying = songs[index]._id === currentSong?._id;
    if (isCurrentSongPlaying) {
      togglePlay();
    } else {
      playAlbum(songs, index);
    }
  }, [currentSong, togglePlay, playAlbum]);

  const handleImageError = useCallback((id: string) => {
    setImageErrors(prev => new Set(prev).add(id));
  }, []);

  const getImageUrl = (url: string, id: string) => {
    if (imageErrors.has(id)) {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23333" width="400" height="400"/%3E%3Ctext fill="%23666" font-family="sans-serif" font-size="40" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
    }
    return url;
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

  if (error) {
    return (
      <div className="h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        <Topbar />
        <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
            <p className="text-zinc-400 mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <Topbar />
      
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="min-h-full pb-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-purple-600/5 to-emerald-600/10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-600/5 via-transparent to-transparent" />
            <div className="relative px-4 lg:px-6 py-8 lg:py-16">
              <div className="max-w-4xl">
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-white via-white to-zinc-300 bg-clip-text text-transparent mb-4 leading-tight">
                  Welcome back
                </h1>
                <p className="text-lg lg:text-xl text-zinc-400 max-w-2xl leading-relaxed">
                  Discover your next favorite song from our curated collection
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 lg:px-6 space-y-12">
            
            {/* Featured Songs Section */}
            {featuredSongs.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg shadow-green-500/20">
                    <Star className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                      Made For You
                    </h2>
                    <p className="text-zinc-500 text-sm">Personalized picks</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                  {featuredSongs.map((song, index) => {
                    const isCurrentSong = currentSong?._id === song._id;
                    return (
                      <div
                        key={song._id}
                        className="group relative bg-gradient-to-br from-zinc-800/40 via-zinc-800/30 to-zinc-900/40 p-4 lg:p-5 rounded-2xl hover:from-zinc-700/50 hover:via-zinc-700/40 hover:to-zinc-800/50 transition-all duration-300 cursor-pointer border border-zinc-700/30 hover:border-zinc-600/50 hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-1"
                        onClick={() => handlePlaySong(featuredSongs, index)}
                      >
                        {/* Background gradient effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="relative mb-4">
                          <div className="relative overflow-hidden rounded-xl shadow-lg">
                            <img
                              src={getImageUrl(song.imageUrl, song._id)}
                              alt={song.title}
                              className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={() => handleImageError(song._id)}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          
                          {/* Play Button */}
                          <div className="absolute bottom-2 right-2">
                            <div className={`relative transition-all duration-300 ${
                              isCurrentSong && isPlaying ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'
                            }`}>
                              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-50 blur-md" />
                              <Button
                                size="icon"
                                className="relative bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 w-10 h-10 rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlaySong(featuredSongs, index);
                                }}
                              >
                                {isCurrentSong && isPlaying ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4 ml-0.5" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="relative space-y-1">
                          <h3 className="font-semibold text-white truncate group-hover:text-green-400 transition-colors duration-300 text-sm lg:text-base">
                            {song.title}
                          </h3>
                          <p className="text-zinc-400 truncate text-xs lg:text-sm">{song.artist}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Trending Songs Section */}
            {trendingSongs.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg shadow-purple-500/20">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                      Trending Now
                    </h2>
                    <p className="text-zinc-500 text-sm">What's hot right now</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                  {trendingSongs.map((song, index) => {
                    const isCurrentSong = currentSong?._id === song._id;
                    return (
                      <div
                        key={song._id}
                        className="group relative bg-gradient-to-br from-zinc-800/40 via-zinc-800/30 to-zinc-900/40 p-4 lg:p-5 rounded-2xl hover:from-zinc-700/50 hover:via-zinc-700/40 hover:to-zinc-800/50 transition-all duration-300 cursor-pointer border border-zinc-700/30 hover:border-zinc-600/50 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1"
                        onClick={() => handlePlaySong(trendingSongs, index)}
                      >
                        {/* Background gradient effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="relative mb-4">
                          <div className="relative overflow-hidden rounded-xl shadow-lg">
                            <img
                              src={getImageUrl(song.imageUrl, song._id)}
                              alt={song.title}
                              className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={() => handleImageError(song._id)}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          
                          {/* Play Button */}
                          <div className="absolute bottom-2 right-2">
                            <div className={`relative transition-all duration-300 ${
                              isCurrentSong && isPlaying ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'
                            }`}>
                              <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-50 blur-md" />
                              <Button
                                size="icon"
                                className="relative bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 w-10 h-10 rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlaySong(trendingSongs, index);
                                }}
                              >
                                {isCurrentSong && isPlaying ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4 ml-0.5" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="relative space-y-1">
                          <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors duration-300 text-sm lg:text-base">
                            {song.title}
                          </h3>
                          <p className="text-zinc-400 truncate text-xs lg:text-sm">{song.artist}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Popular Albums Section */}
            {albums && albums.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-lg shadow-blue-500/20">
                    <Music className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                      Popular Albums
                    </h2>
                    <p className="text-zinc-500 text-sm">Complete collections</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                  {albums.slice(0, 5).map((album) => (
                    <div
                      key={album._id}
                      className="group relative bg-gradient-to-br from-zinc-800/40 via-zinc-800/30 to-zinc-900/40 p-4 lg:p-5 rounded-2xl hover:from-zinc-700/50 hover:via-zinc-700/40 hover:to-zinc-800/50 transition-all duration-300 cursor-pointer border border-zinc-700/30 hover:border-zinc-600/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1"
                      onClick={() => window.location.href = `/albums/${album._id}`}
                    >
                      {/* Background gradient effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative mb-4">
                        <div className="relative overflow-hidden rounded-xl shadow-lg">
                          <img
                            src={getImageUrl(album.imageUrl, album._id)}
                            alt={album.title}
                            className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={() => handleImageError(album._id)}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        
                        {/* Play Button */}
                        <div className="absolute bottom-2 right-2">
                          <div className="relative scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-50 blur-md" />
                            <Button
                              size="icon"
                              className="relative bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 w-10 h-10 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/albums/${album._id}`;
                              }}
                            >
                              <Play className="h-4 w-4 ml-0.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative space-y-1">
                        <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors duration-300 text-sm lg:text-base">
                          {album.title}
                        </h3>
                        <p className="text-zinc-400 truncate text-xs lg:text-sm">
                          {album.artist} • {album.releaseYear}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {featuredSongs.length === 0 && trendingSongs.length === 0 && albums.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <Music className="w-10 h-10 text-zinc-600" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Music Available</h3>
                <p className="text-zinc-400 text-center max-w-md">
                  We couldn't find any songs or albums to display. Check back later!
                </p>
              </div>
            )}

          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default HomePg;