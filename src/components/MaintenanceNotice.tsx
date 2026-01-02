"use client";
import { Github } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export default function MaintenanceNotice() {
    return (
        <>
            <Header />
            <div className="container mx-auto px-4 py-16">
                <main className="max-w-2xl mx-auto">
                    <div className="text-center space-y-6">
                        <h1 className="text-3xl font-semibold text-foreground">
                            No longer maintained
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            See{" "}
                            <a
                                href="https://github.com/christosporios/wildfires"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-foreground hover:text-primary transition-colors underline"
                            >
                                <Github className="w-4 h-4" />
                                christosporios/wildfires
                            </a>{" "}
                            and{" "}
                            <a
                                href="https://github.com/christosporios/wildfires-api"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-foreground hover:text-primary transition-colors underline"
                            >
                                <Github className="w-4 h-4" />
                                christosporios/wildfires-api
                            </a>{" "}
                            for the code.
                        </p>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Contact{" "}
                            <a
                                href="https://schemalabs.gr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground hover:text-primary transition-colors underline"
                            >
                                Schema Labs
                            </a>{" "}
                            at{" "}
                            <a
                                href="mailto:hello@schemalabs.gr"
                                className="text-foreground hover:text-primary transition-colors underline"
                            >
                                hello@schemalabs.gr
                            </a>{" "}
                            for info or assistance.
                        </p>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
}

