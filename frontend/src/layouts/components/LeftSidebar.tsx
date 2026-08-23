import PlayListSkeletons from "@/components/skeletons/PlayListSkeletons"
import { buttonVariants } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useMusicStore } from "@/stores/useMusicStore"
import { SignedIn } from "@clerk/clerk-react"
import { HomeIcon, Library, MessageCircle, Search } from "lucide-react"
import { useEffect } from "react"
import { Link, useLocation } from "react-router-dom"

export const LeftSidebar = () => {
    const { albums, fetchAlbums, isLoading } = useMusicStore();
    const location = useLocation();

    useEffect(() => {
        fetchAlbums();
    }, [fetchAlbums]);

    return (
        <div className="h-full flex flex-col gap-2 p-2 bg-black select-none">
            {/* Top Navigation Panel */}
            <div className="rounded-lg bg-[#121212] p-3 space-y-1">
                <Link
                    to="/"
                    className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "w-full justify-start text-zinc-300 hover:text-white hover:bg-[#1f1f1f] transition-colors",
                        location.pathname === "/" && "bg-[#1f1f1f] text-white font-medium"
                    )}
                >
                    <HomeIcon className="mr-3 size-5 text-zinc-400 group-hover:text-white" />
                    <span className="hidden md:inline text-sm">Home</span>
                </Link>

                <Link
                    to="/search"
                    className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "w-full justify-start text-zinc-300 hover:text-white hover:bg-[#1f1f1f] transition-colors",
                        location.pathname === "/search" && "bg-[#1f1f1f] text-white font-medium"
                    )}
                >
                    <Search className="mr-3 size-5 text-zinc-400 group-hover:text-white" />
                    <span className="hidden md:inline text-sm">Search</span>
                </Link>

                <SignedIn>
                    <Link
                        to="/chat"
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "w-full justify-start text-zinc-300 hover:text-white hover:bg-[#1f1f1f] transition-colors",
                            (location.pathname === "/chat" || location.pathname === "/messages") && "bg-[#1f1f1f] text-white font-medium"
                        )}
                    >
                        <MessageCircle className="mr-3 size-5 text-zinc-400 group-hover:text-white" />
                        <span className="hidden md:inline text-sm">Messages</span>
                    </Link>
                </SignedIn>
            </div>

            {/* Library Section */}
            <div className="flex-1 rounded-lg bg-[#121212] p-3 flex flex-col min-h-0">
                <div className="flex items-center justify-between px-2 mb-3">
                    <div className="flex items-center text-zinc-400 hover:text-white transition-colors cursor-pointer">
                        <Library className="size-5 mr-3" />
                        <span className="hidden md:inline font-semibold text-sm">Your Library</span>
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="space-y-1 pr-1">
                        {isLoading ? (
                            <PlayListSkeletons />
                        ) : (
                            albums.map((album) => (
                                <Link
                                    to={`/albums/${album._id}`}
                                    key={album._id}
                                    className={cn(
                                        "p-2 hover:bg-[#1a1a1a] rounded-md flex items-center gap-3 group cursor-pointer transition-colors",
                                        location.pathname === `/albums/${album._id}` && "bg-[#232323]"
                                    )}
                                >
                                    <img
                                        src={album.imageUrl}
                                        alt={album.title}
                                        className="size-11 rounded object-cover flex-shrink-0 bg-zinc-800"
                                    />
                                    <div className="flex-1 min-w-0 hidden md:block">
                                        <p className="font-medium text-sm text-zinc-100 group-hover:text-white truncate">
                                            {album.title}
                                        </p>
                                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                                            Album • {album.artist}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};
