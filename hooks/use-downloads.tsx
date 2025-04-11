import { useEffect, useState } from "react";

export function useDownloadedItems() {
  const [downloadedItems, setDownloadedItems] = useState<string[]>([]);

  useEffect(() => {
    const storedDownloads = localStorage.getItem("downloadedItems");
    if (storedDownloads) {
      setDownloadedItems(JSON.parse(storedDownloads));
    }
  }, []);

  const addDownload = (id: string) => {
    setDownloadedItems((prevDownloads) => {
      const newDownloads = [...prevDownloads, id];
      localStorage.setItem("downloadedItems", JSON.stringify(newDownloads));
      return newDownloads;
    });
  };

  return { downloadedItems, addDownload };
}
