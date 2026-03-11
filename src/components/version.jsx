import { getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";

function SettingsVersion() {
  const [version, setVersion] = useState("");

  useEffect(() => {
    getVersion().then(setVersion);
  }, []);

  return (
    <div>
      <p>Version: {version}</p>
    </div>
  );
}

export default SettingsVersion;