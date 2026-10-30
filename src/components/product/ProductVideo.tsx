import { PlayCircle } from "lucide-react";

/** Turns a YouTube / Shorts / youtu.be link into an embed URL. */
const youtubeEmbed = (url: string) => {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/))([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0` : null;
};

export default function ProductVideo({ product }: { product: any }) {
  const link: string = product.video_url || "";
  const file: string = product.video || "";
  const embed = link ? youtubeEmbed(link) : null;
  if (!embed && !file && !link) return null;

  const isShort = /shorts\//.test(link);

  return (
    <section className="mt-4 rounded-3xl border border-border p-4">
      <p className="flex items-center gap-2 text-sm font-bold mb-3">
        <PlayCircle className="w-4 h-4 text-primary" /> See this laptop on video
      </p>
      {embed ? (
        <div className={`mx-auto overflow-hidden rounded-2xl bg-black ${isShort ? "aspect-[9/16] max-h-[560px]" : "aspect-video"}`}>
          <iframe
            src={embed}
            title={`${product.title} video`}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      ) : file ? (
        <video src={file} controls preload="metadata" playsInline className="w-full max-h-[560px] rounded-2xl bg-black" />
      ) : (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary underline">
          Watch the video
        </a>
      )}
    </section>
  );
}
