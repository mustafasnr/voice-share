import { useEffect, useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Sparkles, Download, X } from 'lucide-react';

export function UpdateNotification() {
  const [update, setUpdate] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function checkUpdate() {
      try {
        const update = await check();
        console.log(await update);
        if (update) {
          console.log('Update available:', update.version);
          setUpdate(update);
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    }

    checkUpdate();
  }, []);

  const handleUpdate = async () => {
    if (!update) return;

    setDownloading(true);
    try {
      let downloaded = 0;
      let contentLength = 0;

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength;
            console.log(`Started downloading ${contentLength} bytes`);
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            const pct = (downloaded / contentLength) * 100;
            setProgress(pct);
            console.log(`Downloaded ${downloaded} from ${contentLength}`);
            break;
          case 'Finished':
            console.log('Download finished');
            break;
        }
      });

      await relaunch();
    } catch (error) {
      console.error('Failed to download/install update:', error);
      setDownloading(false);
    }
  };

  if (!update) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in fade-in slide-in-from-right-4 duration-300">
      <Card className="border-primary/20 shadow-lg bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Sparkles className="w-4 h-4" />
              <CardTitle className="text-sm">Yeni Güncelleme Mevcut</CardTitle>
            </div>
            <button
              onClick={() => setUpdate(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <CardDescription className="text-xs">
            Sürüm {update.version} yayında. Yeni özellikler ve iyileştirmeler için hemen güncelleyin.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          {downloading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>İndiriliyor...</span>
                <span>%{Math.round(progress)}</span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            size="sm"
            className="w-full h-8 text-xs gap-2"
            onClick={handleUpdate}
            disabled={downloading}
          >
            {downloading ? 'Yükleniyor...' : (
              <>
                <Download className="w-3.5 h-3.5" />
                Şimdi Güncelle
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
