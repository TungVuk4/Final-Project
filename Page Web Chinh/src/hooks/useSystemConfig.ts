import { useEffect, useState } from "react";
import customFetch from "../axios/custom";

interface SystemConfig {
  maintenance_mode: boolean;
  close_registration: boolean;
}

let cachedConfig: SystemConfig | null = null;
let lastFetch = 0;

export const useSystemConfig = () => {
  const [config, setConfig] = useState<SystemConfig>(
    cachedConfig ?? { maintenance_mode: false, close_registration: false }
  );
  const [loading, setLoading] = useState(!cachedConfig);

  useEffect(() => {
    const now = Date.now();
    // Cache 30 giây, tránh gọi API liên tục
    if (cachedConfig && now - lastFetch < 30000) {
      setConfig(cachedConfig);
      setLoading(false);
      return;
    }
    customFetch
      .get("/system-config/public")
      .then((res) => {
        if (res.data?.success) {
          cachedConfig = res.data.data;
          lastFetch = Date.now();
          setConfig(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { config, loading };
};
