import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import axios from "axios";

const Success: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifySubscription = async () => {
      const session_id = searchParams.get("session_id");
      const planId = localStorage.getItem("planId");
      if (!session_id || !planId) {
        setError("Missing subscription session or plan information.");
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const url = `${
          import.meta.env.VITE_PORT
        }/api/v1/subscription/${planId}/success?session_id=${session_id}`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setVerified(true);
        } else {
          setError("Subscription verification failed.");
        }
      } catch (err: any) {
        setError("Subscription verification failed.");
      } finally {
        setLoading(false);
      }
    };
    verifySubscription();
  }, [searchParams]);

  const handleGoToProfile = () => {
    const role = localStorage.getItem("role") || "player";
    navigate(`/${role}/profile`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white px-4">
      <div className="p-8 rounded-lg shadow-md bg-green-50 border border-green-200 flex flex-col items-center max-w-md w-full">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
            <p className="text-lg font-semibold text-green-700">
              Verifying your subscription...
            </p>
          </>
        ) : error ? (
          <>
            <div className="text-4xl mb-4">❌</div>
            <p className="text-lg font-semibold text-red-700">Upgrade failed</p>
            <p className="text-gray-600 mt-2">{error}</p>
            <Button
              className="mt-6 bg-red-500 hover:bg-red-600"
              onClick={handleGoToProfile}
            >
              Go to Profile
            </Button>
          </>
        ) : verified ? (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <div className="text-2xl font-bold text-green-700 mb-2">
              Upgrade successful!
            </div>
            <div className="text-lg text-green-700 mb-4">
              Your <span className="font-bold">Pro Plan</span> is active now.
            </div>
            <Button
              className="mt-2 bg-red-500 hover:bg-red-600"
              onClick={handleGoToProfile}
            >
              Go to Profile
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Success;
