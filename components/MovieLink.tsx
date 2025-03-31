import { useEffect, useState } from "react";
import { Film } from "lucide-react"; // Import your icon

const MovieLink = () => {
  const [link, setLink] = useState("#");
  const [target, setTarget] = useState("_self");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.location.hostname === "kittengames.vercel.app") {
        setLink("https://kitten-flix.vercel.app/");
        setTarget("_blank");
      } else {
        setLink("/movies/");
        setTarget("_self");
      }
    }
  }, []);

  return (
    <a
      href={link}
      target={target}
      rel="noopener noreferrer"
      className="text-white hover:text-purple-400 transition-colors duration-300"
      title="Watch free movies"
    >
      <Film className="w-6 h-6" />
    </a>
  );
};

export default MovieLink;
