import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Outlet } from "react-router-dom"
import { LeftSidebar } from "./components/LeftSidebar";
import AudioPlayer from "@/components/ui/AudioPlayer";
import FriendsActivity from "@/components/ui/FriendsActivity";
import { useState, useEffect } from "react";

const MainLayout = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);
  return (
    <div className="h-screen bg-black text-white flex flex-col">
        <ResizablePanelGroup direction="horizontal" className="flex-1 flex height-full overflow-hidden p2">
            <ResizablePanel defaultSize={isMobile ? 0 : 20} minSize={isMobile ? 0 : 10} maxSize={30} collapsible>
                <LeftSidebar />
            </ResizablePanel>

            {!isMobile && <ResizableHandle className="w-2 bg-black rounded-1g transition-colors"/>}

            <ResizablePanel defaultSize={isMobile ? 100 : 60}>
                {/*Main Content */}
                <Outlet />
            </ResizablePanel>
            
            {!isMobile && (
                <>
                    <ResizableHandle className="w-2 bg-black rounded-1g transition-colors"/>
                    <ResizablePanel defaultSize={20} minSize={0} maxSize={25} collapsedSize={0}>
                        <FriendsActivity />
                    </ResizablePanel>
                </>
            )}
        </ResizablePanelGroup>

        <AudioPlayer />
    </div>
  )
}

export default MainLayout