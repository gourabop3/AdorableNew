import {
  ArrowUpRightIcon,
  ComputerIcon,
  GlobeIcon,
  HomeIcon,
  TerminalIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import VibeLogo from "@/vibe-logo.svg";

export function TopBar({
  appName,
  children,
  repoId,
  consoleUrl,
  codeServerUrl,
}: {
  appName: string;
  children?: React.ReactNode;
  repoId: string;
  consoleUrl: string;
  codeServerUrl: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="h-12 sticky top-0 flex items-center px-4 border-b border-gray-200 bg-background justify-between">
      <Link href={"/"}>
        <HomeIcon className="h-5 w-5" />
      </Link>

      {/* Disabled Vibe logo link - removed Dialog functionality */}
      <Button size="sm" variant={"ghost"} disabled>
        <Image
          src={VibeLogo}
          className="h-5 w-5"
          alt="Vibe Logo"
          width={20}
          height={20}
        />
      </Button>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Open In</DialogTitle>
          </DialogHeader>
          <div>
            <div className="flex flex-col gap-2 pb-4">
              <div className="font-bold mt-4 flex items-center gap-2">
                <GlobeIcon className="inline h-4 w-4 ml-1" />
                Browser
              </div>
              <div>
                <a href={codeServerUrl} target="_blank" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src="/logos/vscode.svg"
                        className="h-4 w-4"
                        alt="VS Code Logo"
                      />
                      <span>VS Code</span>
                    </div>
                    <ArrowUpRightIcon className="h-4 w-4" />
                  </Button>
                </a>
              </div>
              <div>
                <a href={consoleUrl} target="_blank" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <TerminalIcon className="h-4 w-4" />
                      <span>Console</span>
                    </div>
                    <ArrowUpRightIcon className="h-4 w-4" />
                  </Button>
                </a>
              </div>

              {/* <div className="font-bold mt-4 flex items-center gap-2">
                <ComputerIcon className="inline h-4 w-4 ml-1" />
                Local
              </div>

              <div>
                <Button
                  variant="outline"
                  className="w-full flex justify-between items-center"
                  onClick={() => {
                    navigator.clipboard.writeText();
                    setModalOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src="/logos/vscode.svg"
                      className="h-4 w-4"
                      alt="VS Code Logo"
                    />
                    <span>VS Code Remote</span>
                  </div>
                  <span>Copy Command</span>
                </Button>
              </div>

              <div>
                <Button
                  variant="outline"
                  className="w-full flex justify-between items-center"
                  onClick={() => {
                    navigator.clipboard.writeText(`ssh ${}@vm-ssh`);
                    setModalOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <TerminalIcon className="h-4 w-4" />
                    <span>SSH</span>
                  </div>
                  <span>Copy Command</span>
                </Button>
              </div> */}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
