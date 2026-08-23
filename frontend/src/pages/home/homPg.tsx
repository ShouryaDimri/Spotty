import Topbar from "@/components/ui/topbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import type { Song } from "@/types";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { Button } from "@/components/ui/button";
import { Play, Pause, TrendingUp, Star, Music, AlertCircle, Loader } from "lucide-react";

const HomePg = () => {
  const navigate = useNavigate();
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
        
        const featuredData = featuredRes.data;
        const trendingData = trendingRes.data;
        
        setFeaturedSongs(Array.isArray(featuredData) ? featuredData : 
                        ((featuredData as any)?.data && Array.isArray((featuredData as any).data)) ? (featuredData as any).data : []);
        setTrendingSongs(Array.isArray(trendingData) ? trendingData : 
                        ((trendingData as any)?.data && Array.isArray((trendingData as any).data)) ? (trendingData as any).data : []);
      } catch (err: any) {
        console.error("Error fetching home data:", err);
        setError(err.response?.data?.message || "Failed to load music. Please try again.");
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
      return '/cover-images/1.jpg';
    }
    return url || '/cover-images/1.jpg';
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#121212]">
        <Loader className="size-10 text-[#1db954] animate-spin" />
        <p className="mt-4 text-zinc-400 font-medium text-sm">Loading your music...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-[#121212]">
        <Topbar />
        <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4">
          <div className="max-w-md text-center bg-[#181818] p-8 rounded-xl border border-[#282828]">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white mb-2">Unable to Load Music</h2>
            <p className="text-zinc-400 text-sm mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-[#1db954] hover:bg-[#1ed760] text-black font-semibold rounded-full px-6"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#121212]">
      <Topbar />
      
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="min-h-full pb-24">
          {/* Header Section */}
          <div className="px-6 py-8 border-b border-[#282828]/50">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Good music, everyday
            </h1>
            <p className="text-sm text-zinc-400">
              Listen to featured tracks, trending releases, and curated albums.
            </p>
          </div>

          <div className="px-6 py-6 space-y-10">
            
            {/* Made For You Section */}
            {featuredSongs.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-[#1db954]" />
                  <h2 className="text-xl font-bold text-white">Made For You</h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {featuredSongs.map((song, index) => {
                    const isCurrentSong = currentSong?._id === song._id;
                    return (
                      <div
                        key={song._id}
                        className="group relative bg-[#181818] hover:bg-[#282828] p-4 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-white/5 flex flex-col justify-between"
                        onClick={() => handlePlaySong(featuredSongs, index)}
                      >
                        <div className="relative mb-3">
                          <div className="aspect-square rounded overflow-hidden bg-zinc-800">
                            <img
                              src={getImageUrl(song.imageUrl, song._id)}
                              alt={song.title}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                              onError={() => handleImageError(song._id)}
                              loading="lazy"
                            />
                          </div>
                          
                          {/* Play Button */}
                          <div className={`absolute bottom-2 right-2 transition-all duration-200 ${
                            isCurrentSong && isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                          }`}>
                            <Button
                              size="icon"
                              className="bg-[#1db954] hover:bg-[#1ed760] text-black shadow-lg w-10 h-10 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlaySong(featuredSongs, index);
                              }}
                            >
                              {isCurrentSong && isPlaying ? (
                                <Pause className="h-4 w-4 fill-current" />
                              ) : (
                                <Play className="h-4 w-4 fill-current ml-0.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-white truncate text-sm">
                            {song.title}
                          </h3>
                          <p className="text-zinc-400 truncate text-xs mt-1">{song.artist}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Trending Section */}
            {trendingSongs.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-[#1db954]" />
                  <h2 className="text-xl font-bold text-white">Trending Now</h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {trendingSongs.map((song, index) => {
                    const isCurrentSong = currentSong?._id === song._id;
                    return (
                      <div
                        key={song._id}
                        className="group relative bg-[#181818] hover:bg-[#282828] p-4 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-white/5 flex flex-col justify-between"
                        onClick={() => handlePlaySong(trendingSongs, index)}
                      >
                        <div className="relative mb-3">
                          <div className="aspect-square rounded overflow-hidden bg-zinc-800">
                            <img
                              src={getImageUrl(song.imageUrl, song._id)}
                              alt={song.title}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                              onError={() => handleImageError(song._id)}
                              loading="lazy"
                            />
                          </div>
                          
                          <div className={`absolute bottom-2 right-2 transition-all duration-200 ${
                            isCurrentSong && isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                          }`}>
                            <Button
                              size="icon"
                              className="bg-[#1db954] hover:bg-[#1ed760] text-black shadow-lg w-10 h-10 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlaySong(trendingSongs, index);
                              }}
                            >
                              {isCurrentSong && isPlaying ? (
                                <Pause className="h-4 w-4 fill-current" />
                              ) : (
                                <Play className="h-4 w-4 fill-current ml-0.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-white truncate text-sm">
                            {song.title}
                          </h3>
                          <p className="text-zinc-400 truncate text-xs mt-1">{song.artist}</p>
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
                <div className="flex items-center gap-2 mb-4">
                  <Music className="h-5 w-5 text-[#1db954]" />
                  <h2 className="text-xl font-bold text-white">Popular Albums</h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {albums.slice(0, 5).map((album) => (
                    <div
                      key={album._id}
                      className="group relative bg-[#181818] hover:bg-[#282828] p-4 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-white/5 flex flex-col justify-between"
                      onClick={() => navigate(`/albums/${album._id}`)}
                    >
                      <div className="relative mb-3">
                        <div className="aspect-square rounded overflow-hidden bg-zinc-800">
                          <img
                            src={getImageUrl(album.imageUrl, album._id)}
                            alt={album.title}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            onError={() => handleImageError(album._id)}
                            loading="lazy"
                          />
                        </div>
                        
                        <div className="absolute bottom-2 right-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
                          <Button
                            size="icon"
                            className="bg-[#1db954] hover:bg-[#1ed760] text-black shadow-lg w-10 h-10 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/albums/${album._id}`);
                            }}
                          >
                            <Play className="h-4 w-4 fill-current ml-0.5" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-white truncate text-sm">
                          {album.title}
                        </h3>
                        <p className="text-zinc-400 truncate text-xs mt-1">
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
                <div className="w-16 h-16 bg-[#181818] rounded-full flex items-center justify-center mb-4 border border-[#282828]">
                  <Music className="w-8 h-8 text-zinc-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">No Music Found</h3>
                <p className="text-zinc-400 text-sm text-center max-w-sm">
                  We couldn't find any songs or albums right now. Try refreshing the page!
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