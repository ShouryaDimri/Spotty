import { axiosInstance } from "@/lib/axios";
import { useAuth } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { usePlayerStore } from "@/stores/usePlayerStore";

const updateApiToken = (token: string | null) => {
	if (token) axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
	else delete axiosInstance.defaults.headers.common["Authorization"];
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const { getToken, userId } = useAuth();
	const [loading, setLoading] = useState(true);
	const { setUserId } = usePlayerStore();

	useEffect(() => {
		const initAuth = async () => {
			try {
				console.log('🔑 Getting auth token...');
				const token = await getToken();
				console.log('🔑 Token received:', !!token);
				updateApiToken(token);
				// Set user ID in player store for song sharing
				setUserId(userId || null);
				console.log('✅ Auth token set successfully');
			} catch (error: any) {
				console.error('❌ Auth token error:', error);
				updateApiToken(null);
				setUserId(null);
			} finally {
				setLoading(false);
			}
		};

		// Always try to initialize auth, even without userId
		initAuth();
	}, [getToken, userId, setUserId]);

	if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <Loader className="size-8 text-violet-800 animate-spin" />
            </div>
        );
    }

	return <>{children}</>;
};
export default AuthProvider;