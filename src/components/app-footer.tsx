import { Button } from "@/components/ui/button"
import { BsTwitterX } from "react-icons/bs";
import { FaGithubSquare } from "react-icons/fa";

export function AppFooter() {
  return (
    <footer className="flex flex-col items-center gap-2 p-4 bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 text-xs">
      <div className="flex gap-4">
        <Button asChild variant="ghost" size="icon">
          <a
            href="https://github.com/raunit-dev"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <FaGithubSquare className="w-5 h-5" />
          </a>
        </Button>
        <Button asChild variant="ghost" size="icon">
          <a
            href="https://x.com/jais31118"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
          >
            <BsTwitterX className="w-5 h-5" />
          </a>
        </Button>
      </div>
      <div>
        Support me: <span className="font-mono select-all">23d1irPf9ncmnFDEGZjdvGxK3eaLynqawCsTbZAusbQh</span>
      </div>
    </footer>
  )
}
