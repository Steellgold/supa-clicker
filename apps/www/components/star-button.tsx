import { Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonVariants } from "./ui/button";

export const StarButton = () => {
  const [githubStars, setGithubStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/Steellgold/supa-clicker")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.stargazers_count === "number") {
          setGithubStars(data.stargazers_count);
        }
      })
      .catch(() => setGithubStars(null));
  }, []);
  
  return (
    <Link
      href="https://github.com/Steellgold/supa-clicker"
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({
        variant: "retro",
        size: "sm",
        className: "font-mono font-bold"
      })}
      title="View the GitHub repository"
    >
      <Star className="w-4 h-4 mr-1" fill="#eab308" />
      <span>Star</span>
      {githubStars !== null && (
        <span className="ml-1">{githubStars}</span>
      )}
    </Link>
  );
};