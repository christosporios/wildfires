import { Github } from "lucide-react";

export function Footer() {
    return (
        <footer>
            <p className="text-center my-4 text-xs">
                <a href="https://github.com/christosporios/wildfires" target="_blank" rel="noopener noreferrer"><Github className="inline-block mr-2 w-4 h-4" /> Contribute</a>
                <span className="mx-2 text-muted-foreground">|</span>
                <a href="https://twitter.com/christosporios">@christosporios</a>
                <span className="mx-2 text-muted-foreground">|</span>
                <a href="/about">About</a>
            </p>
        </footer>
    )
}